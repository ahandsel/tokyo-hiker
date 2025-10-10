# Tokyo Hiker

A revamp to my Japan_Guide blog using [VitePress static site generator](https://vitepress.dev/).

Also using the following plugins:
* [VitePress Sidebar - Powerful auto sidebar generator](https://vitepress-sidebar.cdget.com/)
* [VitePress - Frameworks - Vite PWA](https://vite-pwa-org.netlify.app/frameworks/vitepress.html)
* [@nolebase/vitepress-plugin-enhanced-readabilities](
* [@nolebase/vitepress-plugin-meta](
* [@vite-pwa/assets-generator](
* [@vite-pwa/vitepress](
* [vite-plugin-pwa](

* [markdown-link-check](
* [markdownlint-cli2](


## Dev notes

Start the dev server

```bash
npm run docs:dev
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

# Tokyo Hiker Repo

## Hiking Notes

### Hiking Trail Difficulty Rating

#### Easy
* Great trails for first-time hikers or those looking for a relaxing stroll.
* Trails are well-maintained and easy to follow.
* Hiking footwear is not required.
* Trekking poles are not required.
* Water is recommended.

#### Intermediate
* Trails are well maintained but may have some steep sections.
* Hiking footwear is recommended.
* Trekking poles are recommended.
* Water is required.

#### Challenging
* Trails may be overgrown and/or have steep sections.
* Hiking footwear is required.
* Trekking poles are highly recommended.
* Water is required.

#### Challenging
* Trails may be overgrown and/or have steep sections.
* Hiking footwear is required.
* Trekking poles are required.
* Water is required.

---

## Repo Notes
### Tech
* HUGO
* Theme: `hugo-books`

### Commands
* `hugo server -D` - Start Hugo’s development server (including draft content).

### References
* [Host on GitHub - Hugo](https://gohugo.io/hosting-and-deployment/hosting-on-github/)
* [alex-shpak/hugo-book: Hugo documentation theme as simple as a plain book](https://github.com/alex-shpak/hugo-book)
