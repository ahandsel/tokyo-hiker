# Copilot instructions


## Project context

* Static site built with **VitePress**.
* Deployed to **GitHub Pages** via GitHub Actions.
* **pnpm** is the package manager. Never suggest npm or yarn commands unless asked.
* **markdownlint-cli2** enforces Markdown style.


## What Copilot should optimize for

1. Ship correct docs and site config with minimal steps.
2. Keep CI fast and deterministic with pnpm cache.
3. Produce Markdown that passes `markdownlint-cli2` locally and in CI.


## Tech constraints and defaults

* Node 18+ or 20. Prefer LTS in CI.
* Build with `vitepress build` to `.vitepress/dist`.
* Use GitHub Pages "Actions" workflow (`upload-pages-artifact` + `deploy-pages`).
* Prefer plain Markdown + VitePress features over custom plugins unless requested.


## Commands

* Install: `pnpm install`
* Dev: `pnpm dev`  _(or `vitepress dev docs` if scripts missing)_
* Build: `pnpm build`  _(or `vitepress build docs`)_
* Preview build: `pnpm preview`
* Lint Markdown: `pnpm lint`


## Recommended scripts (package.json)

```json
{
  "scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "preview": "vitepress preview docs",
    "lint": "markdownlint-cli2"
  },
  "packageManager": "pnpm@^9"
}
```
