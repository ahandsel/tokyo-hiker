# Tokyo hiker

A blog about hiking in Tokyo and surrounding areas.

Built with [VitePress](https://vitepress.dev/).


## Dev notes

A revamp to my Japan_Guide blog using [VitePress static site generator](https://vitepress.dev/).

Also using the following plugins:
* [VitePress Sidebar - Powerful auto sidebar generator](https://vitepress-sidebar.cdget.com/)
* [VitePress - Frameworks - Vite PWA](https://vite-pwa-org.netlify.app/frameworks/vitepress.html)
* [@nolebase/vitepress-plugin-enhanced-readabilities](
* [@nolebase/vitepress-plugin-meta](
* [@vite-pwa/assets-generator](
* [@vite-pwa/vitepress](
* [vite-plugin-pwa](
* [markdownlint-cli2](


## Start the dev server

```bash
pnpm run dev
```

Markdown Linting

```bash
~/.scripts/md-lint.sh ./docs
```

Link Checking

```bash
markdownlint-cli2 "**/*.md" "#node_modules"
```

Note on image paths

The markdown link checker assumes image paths (for example `/images/foo.png` or `images/foo.png`) point into the repository `public/` folder. A config file `.markdown-link-check.json` is provided which rewrites common image path patterns to `public/...` before checking.
