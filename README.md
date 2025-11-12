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
| [@vite-pwa/vitepress][]                               |  PWA support for VitePress               |                               |
| [markdownlint-cli2][]                                 | Markdown linting                        |                               |

[.vitepress/config.mts]: ./docs/.vitepress/config.mts
[.vitepress/theme/index.ts]: ./docs/.vitepress/theme/index.ts
[@nolebase/vitepress-plugin-enhanced-readabilities]: https://nolebase-integrations.ayaka.io/pages/en/integrations/vitepress-plugin-enhanced-readabilities/
[@nolebase/vitepress-plugin-meta]: https://nolebase-integrations.ayaka.io/pages/en/integrations/vitepress-plugin-meta/
[@vite-pwa/assets-generator]: https://vite-pwa-org.netlify.app/assets-generator/
[@vite-pwa/vitepress]: https://vite-pwa-org.netlify.app/frameworks/vitepress.html
[DavidingPlus/vitepress-image-viewer]: https://github.com/davidingplus/vitepress-image-viewer
[markdownlint-cli2]: https://github.com/DavidAnson/markdownlint-cli2
[VitePress Mermaid Renderer]: https://vitepress-mermaid-renderer.sametcc.me/
[vitepress-sidebar]: https://vitepress-sidebar.cdget.com/
[VitePress]: https://vitepress.dev/guide/what-is-vitepress


### Local dev

```shell
# Install dependencies
pnpm install

# Start a local dev server
pnpm dev

# Build the static site
pnpm build
```


### Linting

```shell
# Run markdown linting
~/.scripts/md-lint.sh ./docs
pnpm code-format
pnpm md-lint
```


### Image paths

The markdown link checker assumes image paths (for example `/images/foo.png` or `images/foo.png`) point into the repository `public/` folder. A config file `.markdown-link-check.json` is provided which rewrites common image path patterns to `public/...` before checking.
