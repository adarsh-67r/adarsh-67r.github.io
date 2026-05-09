// Dynamically loads all .md files from src/content/blog/
// using Vite's import.meta.glob with { eager: false, query: '?raw' }.
// Parses YAML frontmatter manually (no external dep needed).
// Frontmatter fields: title, published, date, draft, tags, description

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return { data: {}, content: raw }

  const block = match[1]
  const content = raw.slice(match[0].length).trim()
  const data = {}

  for (const line of block.split(/\r?\n/)) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    let val = line.slice(colon + 1).trim()

    // Arrays: tags: ['a', 'b']
    if (val.startsWith('[')) {
      data[key] = val
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map(s => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
      continue
    }
    if (val === 'true')  { data[key] = true;  continue }
    if (val === 'false') { data[key] = false; continue }
    data[key] = val.replace(/^['"]|['"]$/g, '')
  }

  return { data, content }
}

function estimateReadTime(content) {
  const words = content.trim().split(/\s+/).length
  return `${Math.max(1, Math.round(words / 200))} min read`
}

export async function getAllPosts() {
  const modules = import.meta.glob('./blog/*.md', { query: '?raw', import: 'default' })

  const posts = await Promise.all(
    Object.entries(modules).map(async ([filepath, load]) => {
      const raw = await load()
      const { data, content } = parseFrontmatter(raw)

      if (data.draft === true) return null

      const slug = filepath.replace('./blog/', '').replace(/\.md$/, '')
      const rawDate = data.published || data.date || ''
      const date = rawDate
        ? new Date(rawDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : ''

      return {
        slug,
        title:       data.title || slug,
        date,
        rawDate,
        tags:        Array.isArray(data.tags) ? data.tags : [],
        description: data.description || '',
        readTime:    estimateReadTime(content),
        content,
      }
    })
  )

  return posts
    .filter(Boolean)
    .sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate))
}

export async function getPostBySlug(slug) {
  const all = await getAllPosts()
  return all.find(p => p.slug === slug) || null
}
