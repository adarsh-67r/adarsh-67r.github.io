// Auto-sourced post metadata — add new posts here when you create a .md file
// slug must match the filename in src/content/blog/
export const posts = [
  {
    slug: 'not-yet-my-final-sequence',
    title: 'Not Yet My Final Sequence',
    published: '2026-04-07',
    tags: ['blog', 'reflection'],
    toc: true,
    draft: false,
    excerpt: 'A work in progress, not a finished form. Reflections on school, JEE prep, and life at NIT Rourkela.',
  },
  {
    slug: 'welcome',
    title: 'Welcome',
    published: '2026-01-18',
    tags: ['welcome'],
    toc: false,
    draft: false,
    excerpt: 'A small demo post to give a quick feel for the blog section.',
  },
]

export function getReadTime(content) {
  const words = content.trim().split(/\s+/).length
  const mins = Math.max(1, Math.round(words / 200))
  return `${mins} min read`
}
