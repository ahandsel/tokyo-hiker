# Tokyo hiker

A blog about hiking in Tokyo and surrounding areas.

Built with [VitePress](https://vitepress.dev/).


## Dev notes and steps


### Project tools and dependencies

| Tool                                                  | Purpose                                 | Config file                   |
| ----------------------------------------------------- | --------------------------------------- | ----------------------------- |
| [DavidingPlus/vitepress-image-viewer][]               | Image viewer with zoom and captions     | [.vitepress/theme/index.ts][] |
| [VitePress Mermaid Renderer][]                        | Mermaid diagram rendering for VitePress | [.vitepress/theme/index.ts][] |
| [vitepress-sidebar][]                                 | Sidebar management for VitePress        | [.vitepress/config.mts][]     |
| [VitePress][]                                         | Static site generator                   | [.vitepress/config.mts][]     |
| [@nolebase/vitepress-plugin-enhanced-readabilities][] | Enhanced reading experience             |                               |
| [@nolebase/vitepress-plugin-meta][]                   | Meta tags management                    |                               |
| [@vite-pwa/assets-generator][]                        |                                         |                               |
| [@vite-pwa/vitepress][]                               | PWA support for VitePress               |                               |
| [markdownlint-cli2][]                                 | Markdown linting                        |                               |

[.vitepress/config.mts]: ./contents/.vitepress/config.mts
[.vitepress/theme/index.ts]: ./contents/.vitepress/theme/index.ts
[Brewfile]: ./Brewfile
[scripts/README.md]: ./scripts/README.md
[.vitepress/theme/vitepress-mermaid-renderer.css]: ./contents/.vitepress/theme/vitepress-mermaid-renderer.css
[@nolebase/vitepress-plugin-enhanced-readabilities]: https://nolebase-integrations.ayaka.io/pages/en/integrations/vitepress-plugin-enhanced-readabilities/
[@nolebase/vitepress-plugin-meta]: https://nolebase-integrations.ayaka.io/pages/en/integrations/vitepress-plugin-meta/
[@vite-pwa/assets-generator]: https://vite-pwa-org.netlify.app/assets-generator/
[@vite-pwa/vitepress]: https://vite-pwa-org.netlify.app/frameworks/vitepress.html
[DavidingPlus/vitepress-image-viewer]: https://github.com/davidingplus/vitepress-image-viewer
[libwebp]: https://developers.google.com/speed/webp
[markdownlint-cli2]: https://github.com/DavidAnson/markdownlint-cli2
[poppler]: https://poppler.freedesktop.org/
[VitePress Mermaid Renderer]: https://vitepress-mermaid-renderer.sametcc.me/
[vitepress-sidebar]: https://vitepress-sidebar.cdget.com/
[VitePress]: https://vitepress.dev/guide/what-is-vitepress


### First-time setup

`pnpm setup-full` runs the whole chain: Homebrew formulae from the [Brewfile][], the Node.js version pinned in `.node-version` via nodenv, `pnpm install`, and the pre-commit hook that runs `pnpm lint`.

```shell
# Full setup in one step
pnpm setup-full

# Or run the steps individually
pnpm setup-brew         # Install formulae from ./Brewfile
pnpm setup-node         # Install and activate the .node-version Node.js via nodenv
pnpm setup-pre-commit   # Install the pre-commit hook that runs pnpm lint
pnpm setup-takumi-guard # Point global pnpm at the Takumi Guard registry proxy
```

The Brewfile also installs [poppler][] and [libwebp][], which [scripts/pdf-to-images.mjs](./scripts/pdf-to-images.mjs) needs to turn a PDF into page images. Nothing else in the repo depends on them, so a machine that only edits prose can skip them.

`package.json` declares `engines` (Node.js 24 or newer, pnpm 11 or newer), and `pnpm-workspace.yaml` sets `engineStrict: true`, so `pnpm install` fails fast on a mismatched toolchain rather than half-installing.


### Local dev

```shell
# Install dependencies
pnpm install

# Start a local dev server
pnpm dev

# Build the static site
pnpm build

# List every pnpm script with its command
pnpm index
```


### Linting

```shell
# Run the two-stage lint pipeline across the repo
pnpm lint

# Or scope it to the paths you touched
pnpm lint-target contents/level-1/otama-walking-trail.md
pnpm lint-target --check contents/

# Run the repo tests, including the vendored Mermaid CSS drift guard
pnpm test
```


### Helper scripts

Helper scripts live in [scripts/](./scripts/); see [scripts/README.md][] for the full index and the authoring rules they follow.

```shell
# Regenerate docs/site-structure.md from the contents/ tree
pnpm tree

# List and optionally delete temporary files
pnpm cleanup

# Convert a PDF into web-ready page images
pnpm pdf-to-images <pdf> [options]
```


### Mermaid diagrams

Write a diagram in a fenced `mermaid` code block.

Diagrams render with the forest theme in light mode and the dark theme in dark mode, so a hardcoded color must never rely on a theme-picked partner:

* Prefer the theme defaults and avoid `style` and `classDef` color overrides where you can.
* When a `style` or `classDef` directive hardcodes a `fill`, also hardcode a readable label `color`, for example `style DIR fill:#FFFACD,stroke:#333,stroke-width:1px,color:#333`. Without it, the dark theme pairs its light label text with the hardcoded light fill, and the label becomes unreadable in dark mode.
* Check every diagram in both color modes before shipping it.

Each rendered diagram sits in a pan-and-zoom container with a height ceiling of `70vh`.
To change the ceiling on a single page, set the `mermaidHeight` frontmatter field:

```md
---
title: My page
mermaidHeight: 40rem
---
```

Rules on `mermaidHeight`:

* The value is a maximum, not a fixed height. A short diagram keeps its natural height and never stretches to fill the ceiling.
* Any value that is valid for the CSS `max-height` property works, such as `40rem`, `560px`, or `60vh`. A bare number, such as `560`, is read as pixels.
* An invalid value logs a browser console warning and falls back to `70vh`.
* The value applies to every diagram on the page, so pick a ceiling that suits the tallest one.
* Fullscreen view ignores the ceiling, so a reader can always open a tall diagram at full size.

On a device with a hover-capable pointer, the diagram controls (zoom in, zoom out, reset, copy, download, and fullscreen) stay hidden until the reader hovers the diagram or moves keyboard focus to a control button.
On a touch-only device, the controls stay visible at all times.

A testing note: diagrams render lazily.
An IntersectionObserver renders a diagram only when it scrolls near the viewport, so a diagram far below the fold has no rendered container until then, and the plugin never retries a block it has already stamped as processed.
When you test or screenshot a page, scroll each diagram into view before judging how it renders.

[.vitepress/theme/vitepress-mermaid-renderer.css][] vendors the stylesheet that [VitePress Mermaid Renderer][] ships, then layers the local auto-fit, height-ceiling, and toolbar overrides below a banner comment.
The vendored block above that banner must stay a verbatim copy of the installed plugin; `pnpm test` fails when it drifts.
On a plugin upgrade, re-copy both parts as the banner comment describes, then re-run `pnpm test`.


### PDF handouts and maps

Do not embed a PDF with an `<iframe>`.
iOS Safari and Chrome on Android refuse to render a PDF inline and show a blank box or a download prompt instead, and [.markdownlint-cli2.jsonc](./.markdownlint-cli2.jsonc) allows only `br`, `pre`, `ul`, `li`, and `ol` as inline HTML.

Convert the PDF to images instead, and keep the PDF next to them as a download link:

```shell
pnpm pdf-to-images contents/public/<folder>/<file>.pdf --width 2200 --quality 88
```

This approach wins on three counts:

* Readers get click-to-zoom and pan for free, because [DavidingPlus/vitepress-image-viewer][] already handles every image on the site.
* A WebP page image is a fraction of the size of the source PDF, which matters on trail-side mobile data.
* It works in every browser, with no new dependency, no inline HTML, and no client-side rendering.

Store the images beside the source PDF under `contents/public/`, name each one after what it covers rather than its page number, and describe the map contents in the image alt text.
[contents/level-1/otama-walking-trail.md](./contents/level-1/otama-walking-trail.md) is the worked example.


### Image paths

The markdown link checker assumes image paths (for example `/images/foo.png` or `images/foo.png`) point into the repository `public/` folder. A config file `.markdown-link-check.json` is provided which rewrites common image path patterns to `public/...` before checking.
