#!/usr/bin/env node
/**
 * trim-png.mjs
 *
 * General notes:
 *   Trims the empty (transparent or solid-white) border around a PNG so the
 *   canvas is tight to the visible artwork. Pure Node.js - uses only the
 *   built-in `zlib` and `fs` modules, so no external image dependency is
 *   required. Handles 8-bit RGB and RGBA, non-interlaced PNGs and always
 *   writes an 8-bit RGBA PNG.
 *
 * Usage:
 *   node scripts/trim-png.mjs <input.png> [output.png]
 *   - When output is omitted the input file is overwritten in place.
 *   - Pass --help to print this message.
 *
 * Version history:
 *   v1.1 - 2026-09-29 - Import into Tokyo Hiker with version notes and CLI error reporting.
 *   v1.0 - 2026-06-22 - Original PNG trimming utility.
 *
 * Output:
 *   A cropped PNG written to the output path, plus a status line reporting the
 *   original and trimmed dimensions.
 */

import fs from 'node:fs';
import zlib from 'node:zlib';

const SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

// A pixel counts as background when it is nearly transparent or nearly white.
const ALPHA_THRESHOLD = 16; // alpha at or below this is treated as empty
const WHITE_THRESHOLD = 250; // r, g, b at or above this (when opaque) is white

function printHelp() {
  console.log(
    [
      'Usage: node scripts/trim-png.mjs <input.png> [output.png]',
      '',
      'Trims the transparent or solid-white border around a PNG so the',
      'canvas is tight to the visible artwork. When output is omitted the',
      'input file is overwritten in place.',
    ].join('\n'),
  );
}

// --- CRC32 (PNG spec) ---------------------------------------------------------
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

// --- PNG decode ---------------------------------------------------------------
function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(SIGNATURE)) {
    throw new Error('Not a PNG file (bad signature).');
  }

  let offset = 8;
  let ihdr = null;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);

    if (type === 'IHDR') {
      ihdr = {
        width: data.readUInt32BE(0),
        height: data.readUInt32BE(4),
        bitDepth: data.readUInt8(8),
        colorType: data.readUInt8(9),
        interlace: data.readUInt8(12),
      };
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    } else if (type === 'IEND') {
      break;
    }

    offset += 12 + length; // length + type + data + crc
  }

  if (!ihdr) throw new Error('Missing IHDR chunk.');
  if (ihdr.bitDepth !== 8) {
    throw new Error(
      `Unsupported bit depth ${ihdr.bitDepth} (only 8 is supported).`,
    );
  }
  if (ihdr.interlace !== 0) {
    throw new Error('Interlaced PNGs are not supported.');
  }
  if (ihdr.colorType !== 2 && ihdr.colorType !== 6) {
    throw new Error(
      `Unsupported color type ${ihdr.colorType} (only RGB=2 and RGBA=6 are supported).`,
    );
  }

  const channels = ihdr.colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const { width, height } = ihdr;
  const stride = width * channels;

  // Unfilter scanlines into a tightly packed raster.
  const raster = Buffer.alloc(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y++) {
    const filterType = raw[pos++];
    const rowStart = y * stride;
    for (let x = 0; x < stride; x++) {
      const rawByte = raw[pos++];
      const a = x >= channels ? raster[rowStart + x - channels] : 0; // left
      const b = y > 0 ? raster[rowStart - stride + x] : 0; // up
      const c =
        x >= channels && y > 0 ? raster[rowStart - stride + x - channels] : 0; // upper-left
      let value;
      switch (filterType) {
        case 0:
          value = rawByte;
          break;
        case 1:
          value = rawByte + a;
          break;
        case 2:
          value = rawByte + b;
          break;
        case 3:
          value = rawByte + ((a + b) >> 1);
          break;
        case 4:
          value = rawByte + paeth(a, b, c);
          break;
        default:
          throw new Error(`Unknown filter type ${filterType}.`);
      }
      raster[rowStart + x] = value & 0xff;
    }
  }

  return { width, height, channels, raster };
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

// --- Bounding box -------------------------------------------------------------
function isContent(r, g, b, a) {
  if (a <= ALPHA_THRESHOLD) return false; // transparent border
  if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
    return false; // white border
  }
  return true;
}

function findBounds({ width, height, channels, raster }) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = raster[i];
      const g = raster[i + 1];
      const b = raster[i + 2];
      const a = channels === 4 ? raster[i + 3] : 255;
      if (isContent(r, g, b, a)) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  if (maxX < 0) throw new Error('Image is entirely empty - nothing to crop.');
  return { minX, minY, maxX, maxY };
}

// --- PNG encode (always RGBA, filter type 0) ----------------------------------
function encodePng({ width, height, channels, raster }, bounds) {
  const cw = bounds.maxX - bounds.minX + 1;
  const ch = bounds.maxY - bounds.minY + 1;

  // Raw image data: one filter byte (0 = none) per scanline, then RGBA pixels.
  const out = Buffer.alloc(ch * (1 + cw * 4));
  let p = 0;
  for (let y = 0; y < ch; y++) {
    out[p++] = 0; // filter: none
    const srcY = bounds.minY + y;
    for (let x = 0; x < cw; x++) {
      const srcX = bounds.minX + x;
      const i = (srcY * width + srcX) * channels;
      out[p++] = raster[i];
      out[p++] = raster[i + 1];
      out[p++] = raster[i + 2];
      out[p++] = channels === 4 ? raster[i + 3] : 255;
    }
  }

  const chunks = [SIGNATURE];

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(cw, 0);
  ihdr.writeUInt32BE(ch, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // color type RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace
  chunks.push(makeChunk('IHDR', ihdr));
  chunks.push(makeChunk('IDAT', zlib.deflateSync(out, { level: 9 })));
  chunks.push(makeChunk('IEND', Buffer.alloc(0)));

  return { buffer: Buffer.concat(chunks), cw, ch };
}

function makeChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([length, typeBuf, data, crc]);
}

// --- Main ---------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const input = args[0];
  const output = args[1] ?? input;

  if (!fs.existsSync(input)) {
    console.error(`❌ Input file not found: ${input}`);
    process.exit(1);
  }

  const image = decodePng(fs.readFileSync(input));
  const bounds = findBounds(image);
  const { buffer, cw, ch } = encodePng(image, bounds);
  fs.writeFileSync(output, buffer);

  console.log(
    `✅ Trimmed ${input} from ${image.width}x${image.height} to ${cw}x${ch} -> ${output}`,
  );
}

try {
  main();
} catch (error) {
  console.error(`❌ ${error.message}`);
  process.exitCode = 1;
}
