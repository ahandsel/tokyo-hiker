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

[.vitepress/config.mts]: ./docs/.vitepress/config.mts
[.vitepress/theme/index.ts]: ./docs/.vitepress/theme/index.ts
[Brewfile]: ./Brewfile
[scripts/README.md]: ./scripts/README.md
[@nolebase/vitepress-plugin-enhanced-readabilities]: https://nolebase-integrations.ayaka.io/pages/en/integrations/vitepress-plugin-enhanced-readabilities/
[@nolebase/vitepress-plugin-meta]: https://nolebase-integrations.ayaka.io/pages/en/integrations/vitepress-plugin-meta/
[@vite-pwa/assets-generator]: https://vite-pwa-org.netlify.app/assets-generator/
[@vite-pwa/vitepress]: https://vite-pwa-org.netlify.app/frameworks/vitepress.html
[DavidingPlus/vitepress-image-viewer]: https://github.com/davidingplus/vitepress-image-viewer
[markdownlint-cli2]: https://github.com/DavidAnson/markdownlint-cli2
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
# Run markdown linting
~/.scripts/md-lint.sh ./docs
pnpm code-format
pnpm md-lint
```


### Helper scripts

Helper scripts live in [scripts/](./scripts/); see [scripts/README.md][] for the full index and the authoring rules they follow.

```shell
# Regenerate notes/site-structure.md from the docs/ tree
pnpm tree

# List and optionally delete temporary files
pnpm cleanup
```


### Image paths

The markdown link checker assumes image paths (for example `/images/foo.png` or `images/foo.png`) point into the repository `public/` folder. A config file `.markdown-link-check.json` is provided which rewrites common image path patterns to `public/...` before checking.
