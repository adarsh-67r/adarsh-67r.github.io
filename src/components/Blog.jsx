import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Calendar, Clock, Tag } from 'lucide-react'
import { getAllPosts } from '../content/posts'
import TerminalCmd from './TerminalCmd'

export default function Blog() {
  const [posts, setPosts] = useState([])

  useEffect(() => {
    getAllPosts().then(setPosts)
  }, [])

  return (
    <section id="blog" style={{ padding: '100px max(24px, calc((100vw - 900px) / 2))', borderTop: '1px solid var(--border)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <TerminalCmd cmd="cat ./blog/*" />
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '32px', letterSpacing: '-0.01em' }}>blog</h2>

        {posts.length === 0 ? (
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>// no posts yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {posts.map((post, i) => (
              <motion.div key={post.slug} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}>
                <Link to={`/blog/${post.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div
                    style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.querySelector('.post-title').style.color = 'var(--accent)' }}
                    onMouseLeave={e => { e.currentTarget.querySelector('.post-title').style.color = 'var(--text)' }}
                  >
                    <h3 className="post-title" style={{ fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: '6px', transition: 'color 0.2s' }}>{post.title}</h3>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}><Calendar size={11} />{post.date}</span>
                      {post.readTime && <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}><Clock size={11} />{post.readTime}</span>}
                      {post.tags?.slice(0, 3).map(t => <span key={t} style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}><Tag size={10} />{t}</span>)}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
