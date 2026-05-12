import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { posts } from '../data/posts'
import TerminalCmd from '../components/TerminalCmd'
import TagBadge from '../components/TagBadge'

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
}

export default function PostsPage() {
  const [activeTag, setActiveTag] = useState(null)
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))]
  const filtered = activeTag ? posts.filter(p => p.tags?.includes(activeTag)) : posts

  return (
    <div style={{ padding: '120px max(24px, calc((100vw - 760px) / 2)) 80px' }}>
      <Helmet>
        <title>Posts — Adarsh</title>
        <meta name="description" content="Writing by Adarsh on programming, math, and more." />
        <meta property="og:title" content="Posts — Adarsh" />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <TerminalCmd cmd="ls ./posts" />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.01em' }}>posts</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)', marginBottom: '32px' }}>{filtered.length} post{filtered.length !== 1 ? 's' : ''}</p>

        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
            <button
              onClick={() => setActiveTag(null)}
              className={`tag-filter-btn${!activeTag ? ' tag-filter-btn--active' : ''}`}
            >all</button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`tag-filter-btn${activeTag === tag ? ' tag-filter-btn--active' : ''}`}
              >{tag}</button>
            ))}
          </div>
        )}

        <motion.div
          key={activeTag}
          variants={container}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
        >
          {filtered.length === 0 && (
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>no posts yet.</p>
          )}
          {filtered.map((post) => (
            <motion.div key={post.slug} variants={item}>
              <Link
                to={`/posts/${post.slug}`}
                className="post-row"
                style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', padding: '14px 0', borderBottom: '1px solid var(--border)', textDecoration: 'none', color: 'var(--text)', flexWrap: 'wrap' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', flex: 1 }}>{post.title}</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  {post.tags?.slice(0, 2).map(t => <TagBadge key={t} tag={t} />)}
                  {post.published && <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{post.published}</span>}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  )
}
