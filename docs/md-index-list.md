---
draft: true
---

<script setup>
/**
 * Lists all .md files in the same folder as this index.md,
 * excluding index.md itself, and renders a list of links.
 * It prefers a page title from frontmatter (`title:`), then the first H1, then the filename.
 */

// Load raw Markdown using the updated Vitepress import options
const rawFiles = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true })

/** Parse YAML frontmatter `title:` if present, else first H1, else filename */
function extractTitle(fileName, raw) {
  // Frontmatter title
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---/m)
  if (fmMatch) {
    const titleLine = fmMatch[1].split('\n').find(line => line.trim().toLowerCase().startsWith('title:'))
    if (titleLine) {
      // Support: title: Some Title  OR  title: "Some Title"
      const t = titleLine.replace(/^title:\s*/i, '').trim()
      // Strip surrounding quotes if present
      const unquoted = t.replace(/^["']|["']$/g, '')
      if (unquoted) return unquoted
    }
  }
  // First H1
  const h1Match = raw.match(/^\s*#\s+(.+)\s*$/m)
  if (h1Match && h1Match[1]) return h1Match[1].trim()
  // Fallback to filename
  return fileName.replace(/\.md$/i, '')
}

/** Build items: { title, href } */
const items = Object.entries(rawFiles)
  .filter(([path]) => !/\/?index\.md$/i.test(path)) // exclude index.md
  .map(([path, raw]) => {
    const file = path.replace('./', '')
    const title = extractTitle(file, raw)
    // Link without .md extension for clean URLs; use relative link
    const base = file.replace(/\.md$/i, '')
    return { title, href: `./${base}` }
  })
  .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
</script>

<ul>
  <li v-for="item in items" :key="item.href">
    <a :href="item.href">{{ item.title }}</a>
  </li>
</ul>
