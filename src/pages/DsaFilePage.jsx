import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Copy, Check, Code } from '@phosphor-icons/react'
import { useTheme } from '../context/ThemeContext'

const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(m => ({ default: m.Prism }))
)

let cachedDark  = null
let cachedLight = null

const REPO   = 'adarsh-67r/a2z-dsa'
const BRANCH = 'main'

function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const scrollTop  = window.scrollY
      const docHeight  = document.documentElement.scrollHeight - window.innerHeight
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div className="progress-bar-track">
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  )
}

export default function DsaFilePage() {
  const { topic, file } = useParams()
  const { activeTheme } = useTheme()
  const [code, setCode]         = useState(null)
  const [darkStyle, setDarkStyle]   = useState(cachedDark)
  const [lightStyle, setLightStyle] = useState(cachedLight)
  const [copied, setCopied]     = useState(false)
  const [notFound, setNotFound] = useState(false)

  // fetch raw code
  useEffect(() => {
    window.scrollTo(0, 0)
    setCode(null)
    setNotFound(false)
    const url = `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${topic}/${file}`
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error(r.status)
        return r.text()
      })
      .then(setCode)
      .catch(() => setNotFound(true))
  }, [topic, file])

  // lazy-load both prism styles once each
  useEffect(() => {
    import('react-syntax-highlighter/dist/esm/styles/prism').then(m => {
      if (!cachedDark)  { cachedDark  = m.oneDark;  setDarkStyle(m.oneDark) }
      if (!cachedLight) { cachedLight = m.oneLight; setLightStyle(m.oneLight) }
    })
  }, [])

  const hlStyle = activeTheme.dark ? darkStyle : lightStyle

  function handleCopy() {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const topicLabel = topic
    ? topic.replace(/^\d+_/, '').replace(/([A-Z])/g, ' $1').trim()
    : ''

  if (notFound) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', color: 'var(--muted)' }}>
      <span style={{ fontSize: '3rem' }}>404</span>
      <p style={{ fontFamily: 'var(--font-mono)' }}>file not found</p>
      <Link to="/dsa" style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>← back to dsa</Link>
    </div>
  )

  if (!code) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" />
    </div>
  )

  return (
    <>
      <ReadingProgress />
      <div style={{ minHeight: '100vh', padding: '90px max(24px, calc((100vw - 820px) / 2)) 80px' }}>
        <motion.article
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
        >
          {/* back nav */}
          <Link
            to="/dsa"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-mono)', fontSize: '0.78rem',
              color: 'var(--muted)', textDecoration: 'none',
              marginBottom: '28px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            <ArrowLeft size={13} aria-hidden="true" /> back to dsa
          </Link>

          {/* title bar */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            gap: '16px', flexWrap: 'wrap',
            marginBottom: '28px', paddingBottom: '24px',
            borderBottom: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <Code size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
                <h1 style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'clamp(1.1rem, 3vw, 1.6rem)',
                  fontWeight: 700, color: 'var(--text)', lineHeight: 1.2,
                }}>
                  {file}
                </h1>
              </div>
              <span style={{
                display: 'inline-block',
                padding: '2px 9px', borderRadius: '999px',
                background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                color: 'var(--accent)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)',
              }}>
                {topicLabel}
              </span>
            </div>

            <button
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy code'}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '8px',
                background: copied
                  ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
                  : 'var(--glass-bg)',
                backdropFilter: 'var(--glass-blur-sm)',
                WebkitBackdropFilter: 'var(--glass-blur-sm)',
                border: '1px solid',
                borderColor: copied ? 'color-mix(in srgb, var(--accent) 40%, transparent)' : 'var(--border)',
                color: copied ? 'var(--accent)' : 'var(--muted)',
                fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.18s',
              }}
            >
              {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
              {copied ? 'copied!' : 'copy'}
            </button>
          </div>

          {/* code viewer */}
          <div style={{
            borderRadius: '12px', overflow: 'hidden',
            border: '1px solid var(--glass-border-subtle)',
            boxShadow: 'var(--glass-shadow)',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '9px 16px',
              background: 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur-sm)',
              WebkitBackdropFilter: 'var(--glass-blur-sm)',
              borderBottom: '1px solid var(--glass-border-subtle)',
            }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>cpp</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                {['#ff5f57','#febc2e','#28c840'].map(c => (
                  <span key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }} aria-hidden="true" />
                ))}
              </div>
            </div>
            <Suspense fallback={
              <pre style={{ background: 'var(--surface)', padding: '1.5rem', fontSize: '0.875rem', overflowX: 'auto', margin: 0, color: 'var(--text)' }}>
                <code>{code}</code>
              </pre>
            }>
              {hlStyle ? (
                <SyntaxHighlighter
                  language="cpp"
                  style={hlStyle}
                  customStyle={{
                    margin: 0,
                    borderRadius: 0,
                    background: 'var(--surface)',
                    fontSize: '0.875rem',
                    lineHeight: 1.7,
                    padding: '1.25rem 1.5rem',
                  }}
                  showLineNumbers
                  lineNumberStyle={{ color: 'var(--muted)', opacity: 0.4, userSelect: 'none', minWidth: '2.5em' }}
                  wrapLongLines={false}
                  PreTag="div"
                >
                  {code}
                </SyntaxHighlighter>
              ) : (
                <pre style={{ background: 'var(--surface)', padding: '1.5rem', fontSize: '0.875rem', overflowX: 'auto', margin: 0, color: 'var(--text)' }}>
                  <code>{code}</code>
                </pre>
              )}
            </Suspense>
          </div>

          {/* line count */}
          <p style={{ marginTop: '12px', textAlign: 'right', color: 'var(--muted)', fontSize: '0.7rem', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
            {code.split('\n').length} lines · C++
          </p>
        </motion.article>
      </div>
    </>
  )
}
