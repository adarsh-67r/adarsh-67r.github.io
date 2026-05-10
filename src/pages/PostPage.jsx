import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft, Calendar, Tag, List } from 'lucide-react'
import { posts } from '../data/posts'

const mdModules = import.meta.glob('../content/blog/*.md', { query: '?raw', import: 'default' })

export default function PostPage() {
  const { slug } = useParams()
  const [content, setContent] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [activeId, setActiveId] = useState('')
  const tocRef = useRef(null)

  const meta = posts.find(p => p.slug === slug)

  useEffect(() => {
    window.scrollTo(0, 0)
    const key = `../content/blog/${slug}.md`
    if (mdModules[key]) {
      mdModules[key]().then(raw => {
        const stripped = raw.replace(/^---[\s\S]*?---\n?/, '')
        setContent(stripped)
      })
    } else {
      setNotFound(true)
    }
  }, [slug])

  useEffect(() => {
    if (!meta?.toc) return
    const observer = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveId(e.target.id) }) },
      { rootMargin: '-20% 0% -70% 0%' }
    )
    document.querySelectorAll('h2[id], h3[id]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [content, meta])

  function scrollToId(id) {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 72
    window.scrollTo({ top, behavior: 'smooth' })
    setActiveId(id)
  }

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--muted)' }}>
      <span style={{ fontSize: '3rem' }}>404</span>
      <p style={{ fontFamily: 'var(--font-mono)' }}>post not found</p>
      <Link to="/posts" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>← back to posts</Link>
    </div>
  )

  if (!content) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const headings = []
  if (meta?.toc) {
    content.split('\n').forEach(line => {
      const m2 = line.match(/^## (.+)/)
      const m3 = line.match(/^### (.+)/)
      if (m2) headings.push({ level: 2, text: m2[1], id: slugify(m2[1]) })
      if (m3) headings.push({ level: 3, text: m3[1], id: slugify(m3[1]) })
    })
  }

  return (
    <div style={{ minHeight: '100vh', padding: '90px max(24px, calc((100vw - 1100px) / 2)) 80px' }}>
      <div className="post-layout" style={{ display: 'grid', gridTemplateColumns: headings.length ? '1fr 220px' : '1fr', gap: '48px', alignItems: 'start', maxWidth: '1100px', margin: '0 auto' }}>

        {/* On mobile: TOC renders first (order:1 via CSS), article second (order:2) */}
        {headings.length > 0 && (
          <motion.aside className="post-toc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            ref={tocRef} style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              <List size={12} /> on this page
            </div>
            {headings.map(h => <TocItem key={h.id} h={h} active={activeId === h.id} onClick={() => scrollToId(h.id)} />)}
          </motion.aside>
        )}

        <motion.article className="post-article" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link to="/posts" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', textDecoration: 'none', fontSize: '0.8rem', fontFamily: 'var(--font-mono)', marginBottom: '32px', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            <ArrowLeft size={14} /> back to posts
          </Link>

          <div style={{ marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, marginBottom: '16px' }}>
              {meta?.title || slug}
            </h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {meta?.published && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <Calendar size={12} /> {meta.published}
                </span>
              )}
              {meta?.tags?.map(tag => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  <Tag size={11} /> {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="prose">
            <ReactMarkdown
              components={{
                h2: ({ children }) => { const id = slugify(String(children)); return <h2 id={id}>{children}</h2> },
                h3: ({ children }) => { const id = slugify(String(children)); return <h3 id={id}>{children}</h3> },
                code: ({ inline, className, children }) => {
                  const lang = (className || '').replace('language-', '')
                  if (inline) return <code className="inline-code">{children}</code>
                  return (
                    <div className="code-block">
                      {lang && <div className="code-lang">{lang}</div>}
                      <pre><code>{children}</code></pre>
                    </div>
                  )
                },
                blockquote: ({ children }) => <blockquote className="blockquote">{children}</blockquote>,
                a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="prose-link">{children}</a>,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </motion.article>
      </div>

      <style>{`
        .prose { color: var(--text); font-size: 0.975rem; line-height: 1.85; }
        .prose h2 { font-family: var(--font-mono); font-size: 1.25rem; font-weight: 700; color: var(--text); margin: 2.2em 0 0.8em; padding-top: 0.5em; }
        .prose h3 { font-family: var(--font-mono); font-size: 1rem; font-weight: 600; color: var(--text); margin: 1.8em 0 0.6em; }
        .prose p { margin-bottom: 1.2em; color: var(--muted); max-width: 68ch; }
        .prose p:first-child { color: var(--text); font-style: italic; }
        .prose ul, .prose ol { margin: 0 0 1.2em 1.4em; color: var(--muted); }
        .prose li { margin-bottom: 0.4em; }
        .prose strong { color: var(--text); font-weight: 600; }
        .prose em { color: var(--text); font-style: italic; }
        .inline-code { font-family: var(--font-mono); font-size: 0.85em; padding: 2px 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; color: var(--accent); }
        .code-block { margin: 1.4em 0; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); background: var(--surface); }
        .code-lang { padding: 6px 16px; font-family: var(--font-mono); font-size: 0.7rem; color: var(--muted); background: var(--bg); border-bottom: 1px solid var(--border); text-transform: uppercase; letter-spacing: 0.08em; }
        .code-block pre { padding: 20px; overflow-x: auto; margin: 0; }
        .code-block pre code { font-family: var(--font-mono); font-size: 0.875rem; color: var(--text); line-height: 1.65; background: none; }
        .blockquote { border-left: 3px solid var(--accent); padding: 10px 18px; margin: 1.4em 0; background: var(--surface); border-radius: 0 8px 8px 0; color: var(--muted); font-style: italic; }
        .prose-link { color: var(--accent); text-decoration: underline; text-decoration-color: transparent; transition: text-decoration-color 0.2s; }
        .prose-link:hover { text-decoration-color: var(--accent); }

        /* Desktop: article left, TOC right */
        .post-layout { }
        .post-article { order: 1; }
        .post-toc    { order: 2; }

        /* Mobile: single column, TOC above article */
        @media (max-width: 768px) {
          .post-layout {
            grid-template-columns: 1fr !important;
            gap: 24px !important;
          }
          .post-article { order: 2; }
          .post-toc {
            order: 1;
            position: static !important;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 14px 16px;
          }
          .prose h2 { font-size: 1.1rem; }
          .prose p { max-width: 100%; }
        }
      `}</style>
    </div>
  )
}

function TocItem({ h, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: active ? 'var(--accent)' : hovered ? 'var(--text)' : 'var(--muted)', borderLeft: h.level === 2 ? `2px solid ${active ? 'var(--accent)' : 'var(--border)'}` : 'none', paddingLeft: h.level === 2 ? '10px' : '24px', paddingTop: '4px', paddingBottom: '4px', transition: 'color 0.2s, border-color 0.2s', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
    >{h.text}</button>
  )
}

function slugify(text) {
  return String(text).toLowerCase().replace(/[^\w\s-]/g, '').trim().replace(/[\s]+/g, '-')
}
