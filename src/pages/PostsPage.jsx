import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Calendar, Clock, Tag } from 'lucide-react'
import { posts } from '../data/posts'
import TerminalCmd from '../components/TerminalCmd'

export default function PostsPage() {
  return (
    <div style={{ minHeight: '100vh', padding: '120px max(24px, calc((100vw - 900px) / 2)) 80px' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <TerminalCmd cmd="ls ./posts" loop={true} />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.01em' }}>posts</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px' }}>
          Notes, thoughts, and things I find interesting.
        </p>

        {posts.length === 0 ? (
          <div style={{ paddingTop: '40px' }}>
            <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>// no posts yet — check back soon</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {posts.map((post, i) => (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                <Link to={`/posts/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { const t = e.currentTarget.querySelector('.post-title'); if (t) t.style.color = 'var(--accent)' }}
                    onMouseLeave={e => { const t = e.currentTarget.querySelector('.post-title'); if (t) t.style.color = 'var(--text)' }}
                  >
                    <h3 className="post-title" style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', transition: 'color 0.2s' }}>{post.title}</h3>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      {post.published && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}><Calendar size={11} />{post.published}</span>}
                      {post.readTime  && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}><Clock size={11} />{post.readTime}</span>}
                      {post.tags?.slice(0,3).map(t => (
                        <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}><Tag size={10} />{t}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
