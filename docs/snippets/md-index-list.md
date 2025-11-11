---
title: "Markdown Index List Snippet"
description: "Dynamically generated list of markdown pages in the same folder, excluding index.md."
excludeFromSidebar: true
---

<!-- markdownlint-disable MD033 MD041-->

<script setup>
/**
 * Generate a list of markdown pages in the same folder, excluding index.md.
 * Each entry includes metadata (title and description) parsed from frontmatter.
 * Version 2.0 - Added description support.
 */

// Load raw Markdown using the updated Vitepress import options
const markdownFiles = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true })

/** Extract metadata (title and description) from YAML frontmatter. */
function parseFrontmatter(fileName, fileContent) {
  let title = ''
  let description = ''

  // Match YAML frontmatter block
  const frontmatterBlock = fileContent.match(/^---\n([\s\S]*?)\n---/m)
  if (frontmatterBlock) {
    const frontmatterLines = frontmatterBlock[1].split('\n')
    for (const line of frontmatterLines) {
      const normalizedLine = line.trim().toLowerCase()
      if (normalizedLine.startsWith('title:')) {
        title = line.replace(/^title:\s*/i, '').trim().replace(/^["']|["']$/g, '')
      } else if (normalizedLine.startsWith('description:')) {
        description = line.replace(/^description:\s*/i, '').trim().replace(/^["']|["']$/g, '')
      }
    }
  }

  // If no title in frontmatter, use first H1
  if (!title) {
    const headingMatch = fileContent.match(/^\s*#\s+(.+)\s*$/m)
    if (headingMatch && headingMatch[1]) title = headingMatch[1].trim()
  }

  // Fallback to filename if still missing
  if (!title) title = fileName.replace(/\.md$/i, '')

  return { title, description }
}

/** Build structured link data for rendering. */
const pageList = Object.entries(markdownFiles)
  .filter(([path]) => !/\/?index\.md$/i.test(path))
  .map(([path, fileContent]) => {
    const fileName = path.replace('./', '')
    const { title, description } = parseFrontmatter(fileName, fileContent)
    const basePath = fileName.replace(/\.md$/i, '')
    return { title, description, href: `./${basePath}` }
  })
  .sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' }))
</script>

<ul>
  <li v-for="page in pageList" :key="page.href">
    <a :href="page.href">{{ page.title }}</a>
    <ul v-if="page.description">
      <li>{{ page.description }}</li>
    </ul>
  </li>
</ul>
