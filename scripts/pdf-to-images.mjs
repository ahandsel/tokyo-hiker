// General notes:
//   Converts each page of a PDF into a web-ready image for use in content
//   pages. Embedding a PDF with an iframe is not an option here, because mobile
//   browsers refuse to render one inline, so map and timetable PDFs are shipped
//   as images instead and the PDF itself stays available as a download link.
//   Rendering uses pdftoppm from poppler, and WebP encoding uses cwebp from
//   libwebp; both are installed by `pnpm setup-brew`. Output images land next
//   to the source PDF by default, so a file in contents/public/ produces
//   siblings that are served from the same site-root path.
//
// Usage:
//   node scripts/pdf-to-images.mjs <pdf> [<pdf>...] [options]
//   pnpm pdf-to-images <pdf> [<pdf>...] [options]
//
//   Options:
//     --out <dir>       Output folder. Defaults to the folder holding the PDF.
//     --format <fmt>    webp, png, or jpeg. Defaults to webp.
//     --dpi <number>    Render resolution. Defaults to 150.
//     --width <px>      Scale to this pixel width instead, keeping the aspect ratio.
//     --quality <1-100> Encoder quality for webp and jpeg. Defaults to 85.
//     --pages <spec>    Page or range to convert, such as 2 or 1-3. Defaults to every page.
//     --prefix <name>   Output basename. Defaults to the PDF basename.
//     --force           Overwrite existing output files.
//     --dry-run         Report the planned work without writing anything.
//     --help, -h        Show this help.
//
// Output:
//   One image per converted page, written to the output folder. A single-page
//   PDF produces <prefix>.<ext>, and a multi-page PDF produces <prefix>-1.<ext>,
//   <prefix>-2.<ext>, and so on. Each written file is reported with its size,
//   and a closing summary lists the totals.
//
// Version history:
//   * v1.0 - 2026-08-18 - Initial version.

import { execFileSync } from 'node:child_process';
import {
  accessSync,
  constants,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname, basename, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const HELP = `Convert each page of a PDF into a web-ready image for use in content pages.

Usage:
  node scripts/pdf-to-images.mjs <pdf> [<pdf>...] [options]
  pnpm pdf-to-images <pdf> [<pdf>...] [options]

Options:
  --out <dir>         Output folder. Defaults to the folder holding the PDF.
  --format <fmt>      webp, png, or jpeg. Defaults to webp.
  --dpi <number>      Render resolution. Defaults to 150.
  --width <px>        Scale to this pixel width instead, keeping the aspect ratio.
  --quality <1-100>   Encoder quality for webp and jpeg. Defaults to 85.
  --pages <spec>      Page or range to convert, such as 2 or 1-3. Defaults to every page.
  --prefix <name>     Output basename. Defaults to the PDF basename.
  --force             Overwrite existing output files.
  --dry-run           Report the planned work without writing anything.
  -h, --help          Show this help.

Requires poppler (pdftoppm, pdfinfo) and, for the webp format, libwebp (cwebp).
Install both with: pnpm setup-brew

Output:
  One image per converted page, written to the output folder. A single-page PDF
  produces <prefix>.<ext>, and a multi-page PDF produces <prefix>-1.<ext>,
  <prefix>-2.<ext>, and so on.

Examples:
  node scripts/pdf-to-images.mjs contents/public/hatonosu-valley/ohtama.pdf
  node scripts/pdf-to-images.mjs map.pdf --width 2000 --quality 90
  node scripts/pdf-to-images.mjs map.pdf --format png --pages 1`;

const FORMATS = new Set(['webp', 'png', 'jpeg']);
const DEFAULTS = { format: 'webp', dpi: 150, quality: 85 };

//-----------------------------------------------------------------------------
// Argument parsing
//-----------------------------------------------------------------------------

// Parse argv into a list of PDF paths plus an options object.
// An unknown flag, a missing value, or an out-of-range number is a fatal error,
// because silently ignoring one would produce output the caller did not ask for.
function parseArgs(argv) {
  const pdfs = [];
  const options = {
    ...DEFAULTS,
    out: null,
    width: null,
    pages: null,
    prefix: null,
    force: false,
    dryRun: false,
  };

  const takeValue = (flag, index) => {
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      fail(`Option ${flag} needs a value.`);
    }
    return value;
  };

  const takeNumber = (flag, index, { min, max }) => {
    const raw = takeValue(flag, index);
    const value = Number(raw);
    if (
      !Number.isFinite(value) ||
      value < min ||
      (max !== undefined && value > max)
    ) {
      fail(
        `Option ${flag} needs a number between ${min} and ${max ?? 'up'}, but got ${JSON.stringify(raw)}.`,
      );
    }
    return value;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    switch (arg) {
      case '--out':
        options.out = takeValue(arg, i);
        i += 1;
        break;
      case '--format':
        options.format = takeValue(arg, i).toLowerCase();
        if (!FORMATS.has(options.format)) {
          fail(
            `Option --format accepts ${[...FORMATS].join(', ')}, but got ${JSON.stringify(options.format)}.`,
          );
        }
        i += 1;
        break;
      case '--dpi':
        options.dpi = takeNumber(arg, i, { min: 1, max: 1200 });
        i += 1;
        break;
      case '--width':
        options.width = takeNumber(arg, i, { min: 1, max: 20000 });
        i += 1;
        break;
      case '--quality':
        options.quality = takeNumber(arg, i, { min: 1, max: 100 });
        i += 1;
        break;
      case '--pages':
        options.pages = parsePages(takeValue(arg, i));
        i += 1;
        break;
      case '--prefix':
        options.prefix = takeValue(arg, i);
        i += 1;
        break;
      case '--force':
        options.force = true;
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      default:
        if (arg.startsWith('-'))
          fail(
            `Unknown option ${JSON.stringify(arg)}. Run with --help to see the usage.`,
          );
        pdfs.push(arg);
    }
  }

  return { pdfs, options };
}

// Accept a single page number such as 2, or an inclusive range such as 1-3.
function parsePages(spec) {
  const match = /^(\d+)(?:-(\d+))?$/.exec(spec.trim());
  if (!match)
    fail(
      `Option --pages accepts a page number or a range, such as 2 or 1-3, but got ${JSON.stringify(spec)}.`,
    );
  const first = Number(match[1]);
  const last = match[2] === undefined ? first : Number(match[2]);
  if (first < 1) fail('Option --pages starts counting at 1.');
  if (last < first)
    fail(
      `Option --pages needs the range to run upward, but got ${JSON.stringify(spec)}.`,
    );
  return { first, last };
}

//-----------------------------------------------------------------------------
// Helpers
//-----------------------------------------------------------------------------

function fail(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

// Look the command up on PATH directly. Shelling out to "command -v" would need
// the shell option, which Node deprecates for calls that pass arguments.
function hasCommand(name) {
  const paths = (process.env.PATH ?? '').split(':').filter(Boolean);
  return paths.some((dir) => {
    try {
      accessSync(join(dir, name), constants.X_OK);
      return true;
    } catch {
      return false;
    }
  });
}

function run(command, args) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Read the page count with pdfinfo, so a --pages range can be validated before
// any rendering starts.
function readPageCount(pdfPath) {
  const info = run('pdfinfo', [pdfPath]);
  const match = /^Pages:\s+(\d+)$/m.exec(info);
  if (!match) fail(`Could not read the page count of ${pdfPath}.`);
  return Number(match[1]);
}

//-----------------------------------------------------------------------------
// Conversion
//-----------------------------------------------------------------------------

// Render the requested pages of one PDF and return a per-file result summary.
// Pages are always rendered to PNG in a temporary folder first. PNG and JPEG
// output is then moved into place, while WebP output is encoded from the
// intermediate PNG, which keeps the text in a map crisp at a small file size.
function convertPdf(pdfPath, options, repoRoot) {
  const absolutePdf = resolve(pdfPath);
  if (!existsSync(absolutePdf)) fail(`No such file: ${pdfPath}`);
  if (extname(absolutePdf).toLowerCase() !== '.pdf')
    fail(`Not a PDF: ${pdfPath}`);

  const pageCount = readPageCount(absolutePdf);
  const first = options.pages ? options.pages.first : 1;
  const last = options.pages
    ? Math.min(options.pages.last, pageCount)
    : pageCount;
  if (first > pageCount) {
    fail(
      `Page ${first} is out of range: ${basename(absolutePdf)} has ${pageCount} page${pageCount === 1 ? '' : 's'}.`,
    );
  }

  const outDir = options.out ? resolve(options.out) : dirname(absolutePdf);
  const prefix = options.prefix ?? basename(absolutePdf, extname(absolutePdf));
  const extension = options.format === 'jpeg' ? 'jpg' : options.format;
  const pageTotal = last - first + 1;

  // A single rendered page keeps the bare prefix, because a -1 suffix on a
  // one-page document only adds noise to the content path.
  const outputNameFor = (pageNumber) =>
    pageTotal === 1
      ? `${prefix}.${extension}`
      : `${prefix}-${pageNumber}.${extension}`;

  const planned = [];
  for (let page = first; page <= last; page += 1) {
    const target = join(outDir, outputNameFor(page));
    if (existsSync(target) && !options.force) {
      fail(
        `${relative(repoRoot, target)} already exists. Pass --force to overwrite it.`,
      );
    }
    planned.push({ page, target });
  }

  const scaling = options.width
    ? `${options.width} px wide`
    : `${options.dpi} dpi`;
  console.log(
    `📄 ${relative(repoRoot, absolutePdf)} (${formatBytes(statSync(absolutePdf).size)}, ${pageCount} page${pageCount === 1 ? '' : 's'})`,
  );
  console.log(
    `   Converting page${pageTotal === 1 ? '' : 's'} ${first}${pageTotal === 1 ? '' : `-${last}`} to ${options.format} at ${scaling}.`,
  );

  if (options.dryRun) {
    for (const { target } of planned)
      console.log(`   ⚠️  Dry run, not writing ${relative(repoRoot, target)}`);
    return { written: 0, bytes: 0 };
  }

  mkdirSync(outDir, { recursive: true });
  const workDir = mkdtempSync(join(tmpdir(), 'pdf-to-images-'));

  try {
    const renderArgs = ['-f', String(first), '-l', String(last)];
    // -scale-to-y -1 keeps the aspect ratio while --width pins the pixel width.
    if (options.width)
      renderArgs.push(
        '-scale-to-x',
        String(options.width),
        '-scale-to-y',
        '-1',
      );
    else renderArgs.push('-r', String(options.dpi));
    renderArgs.push(options.format === 'jpeg' ? '-jpeg' : '-png');
    if (options.format === 'jpeg')
      renderArgs.push('-jpegopt', `quality=${options.quality}`);
    renderArgs.push(absolutePdf, join(workDir, 'page'));

    run('pdftoppm', renderArgs);

    // pdftoppm pads the page number to the width of the last page number, so
    // the rendered files are matched by sorted order rather than by name.
    const rendered = readdirSync(workDir)
      .filter((name) => name.startsWith('page'))
      .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

    if (rendered.length !== planned.length) {
      fail(
        `Expected ${planned.length} rendered page${planned.length === 1 ? '' : 's'} but pdftoppm produced ${rendered.length}.`,
      );
    }

    let bytes = 0;
    for (const [index, { target }] of planned.entries()) {
      const source = join(workDir, rendered[index]);
      if (options.format === 'webp') {
        run('cwebp', [
          '-quiet',
          '-q',
          String(options.quality),
          source,
          '-o',
          target,
        ]);
      } else {
        renameSync(source, target);
      }
      const size = statSync(target).size;
      bytes += size;
      console.log(`   ✅ ${relative(repoRoot, target)} (${formatBytes(size)})`);
    }

    return { written: planned.length, bytes };
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}

//-----------------------------------------------------------------------------
// Main
//-----------------------------------------------------------------------------

const argv = process.argv.slice(2);
if (argv.includes('--help') || argv.includes('-h')) {
  console.log(HELP);
  process.exit(0);
}

const { pdfs, options } = parseArgs(argv);

if (pdfs.length === 0) {
  console.error('❌ No PDF given.\n');
  console.error(HELP);
  process.exit(1);
}

// Preflight the external tools, so a missing formula is reported once up front
// rather than midway through a batch.
const missing = ['pdftoppm', 'pdfinfo'].filter((tool) => !hasCommand(tool));
if (options.format === 'webp' && !hasCommand('cwebp')) missing.push('cwebp');
if (missing.length > 0) {
  console.error(
    `❌ Missing required command${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`,
  );
  console.error('   Install the dependencies with: pnpm setup-brew');
  console.error('   Or directly with: brew install poppler webp');
  process.exit(1);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

let totalWritten = 0;
let totalBytes = 0;
for (const pdf of pdfs) {
  const result = convertPdf(pdf, options, repoRoot);
  totalWritten += result.written;
  totalBytes += result.bytes;
}

if (options.dryRun) {
  console.log('\n⚠️  Dry run finished, no files were written.');
} else {
  console.log(
    `\n✅ Wrote ${totalWritten} image${totalWritten === 1 ? '' : 's'} totalling ${formatBytes(totalBytes)}.`,
  );
  console.log(
    '   Reference them from content with a site-root path, for example /folder/name.webp',
  );
}
