import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { ArrowLeft, Calendar, Tag, List } from 'lucide-react'
import { posts } from '../data/posts'
import '../styles/post.css'

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
    setContent(null)
    setNotFound(false)
    setActiveId('')
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
      <div className="post-spinner" />
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

        {headings.length > 0 && (
          <motion.aside className="post-toc" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.2 }}
            ref={tocRef} style={{ position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '4px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>
              <List size={12} aria-hidden="true" /> on this page
            </div>
            {headings.map(h => <TocItem key={h.id} h={h} active={activeId === h.id} onClick={() => scrollToId(h.id)} />)}
          </motion.aside>
        )}

        <motion.article className="post-article" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Link to="/posts" className="post-back"
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}>
            <ArrowLeft size={14} aria-hidden="true" /> back to posts
          </Link>

          <div style={{ marginBottom: '40px', paddingBottom: '32px', borderBottom: '1px solid var(--border)' }}>
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, marginBottom: '16px' }}>
              {meta?.title || slug}
            </h1>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
              {meta?.published && (
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
                  <Calendar size={12} aria-hidden="true" /> {meta.published}
                </span>
              )}
              {meta?.tags?.map(tag => (
                <span key={tag} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                  <Tag size={11} aria-hidden="true" /> {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="prose">
            <ReactMarkdown
              components={{
                h2: ({ children }) => { const id = slugify(String(children)); return <h2 id={id}>{children}</h2> },
                h3: ({ children }) => { const id = slugify(String(children)); return <h3 id={id}>{children}</h3> },
                code: ({ className, children }) => {
                  const lang = (className || '').replace('language-', '')
                  const isInline = !className && !String(children).includes('\n')
                  if (isInline) return <code className="inline-code">{children}</code>
                  return (
                    <div className="code-block">
                      {lang && <div className="code-lang">{lang}</div>}
                      <SyntaxHighlighter
                        language={lang || 'text'}
                        style={oneDark}
                        customStyle={{ margin: 0, borderRadius: 0, background: 'var(--surface)', fontSize: '0.875rem', lineHeight: 1.65 }}
                        PreTag="div"
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
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
    </div>
  )
}

function TocItem({ h, active, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none',
        cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-mono)',
        color: active ? 'var(--accent)' : hovered ? 'var(--text)' : 'var(--muted)',
        borderLeft: `2px solid ${active ? 'var(--accent)' : h.level === 3 ? 'color-mix(in srgb, var(--border) 60%, transparent)' : 'var(--border)'}`,
        paddingLeft: h.level === 2 ? '10px' : '20px',
        paddingTop: '4px', paddingBottom: '4px',
        transition: 'color 0.2s, border-color 0.2s',
        lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        opacity: h.level === 3 ? 0.85 : 1,
      }}
    >{h.text}</button>
  )
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s]+/g, '-')
}
