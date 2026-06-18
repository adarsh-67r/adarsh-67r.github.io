import { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder, FolderOpen, FileCode, CaretRight,
  Copy, Check, Code, TreeStructure,
} from '@phosphor-icons/react'

const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then(m => ({ default: m.Prism }))
)
let cachedStyle = null

const REPO   = 'adarsh-67r/a2z-dsa'
const BRANCH = 'main'
const GH_API = `https://api.github.com/repos/${REPO}/contents`
const GH_RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`

// Top-level topics — label is the display name
const TOPICS = [
  { name: '01_Basics',            label: 'Basics' },
  { name: '02_SortingTechniques', label: 'Sorting Techniques' },
  { name: '03_Array',             label: 'Arrays' },
]

async function ghFetch(path) {
  const res = await fetch(`${GH_API}/${path}?ref=${BRANCH}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  return res.json()
}

function prettyName(raw) {
  return raw
    .replace(/^\d+_/, '')          // strip leading number_
    .replace(/([a-z])([A-Z])/g, '$1 $2') // camelCase → words
    .replace(/_/g, ' ')            // underscores → spaces
    .replace(/\.cpp$/, '')         // strip extension
    .trim()
}

// ─── Reading progress bar ────────────────────────────────────────────────────
function ReadingProgress({ scrollRef }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      const max = scrollHeight - clientHeight
      setPct(max > 0 ? (scrollTop / max) * 100 : 0)
    }
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [])
  return (
    <div style={{ height: '2px', background: 'var(--border)', flexShrink: 0 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.1s linear' }} />
    </div>
  )
}

// ─── Sidebar tree node ───────────────────────────────────────────────────────
function TreeNode({ node, depth = 0, onFileClick, activeFile }) {
  const [open, setOpen]       = useState(false)
  const [children, setChildren] = useState(null)   // null = not loaded
  const [loading, setLoading]   = useState(false)

  const isDir  = node.type === 'dir'
  const isFile = node.type === 'file'
  const isActive = isFile && activeFile === node.path

  async function toggle() {
    if (isFile) { onFileClick(node); return }
    const next = !open
    setOpen(next)
    if (next && children === null && !loading) {
      setLoading(true)
      try {
        const items = await ghFetch(node.path)
        // sort: dirs first, then files
        items.sort((a, b) => {
          if (a.type === b.type) return a.name.localeCompare(b.name)
          return a.type === 'dir' ? -1 : 1
        })
        setChildren(items.filter(i => i.type === 'dir' || i.name.endsWith('.cpp')))
      } catch { setChildren([]) }
      finally { setLoading(false) }
    }
  }

  const indent = depth * 16

  return (
    <div>
      <button
        onClick={toggle}
        title={node.name}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: '7px', padding: `6px 12px 6px ${12 + indent}px`,
          background: isActive
            ? 'color-mix(in srgb, var(--accent) 12%, transparent)'
            : 'transparent',
          border: 'none',
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
          borderRadius: 0,
          color: isActive ? 'var(--accent)' : isFile ? 'var(--muted)' : 'var(--text)',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          textAlign: 'left',
          cursor: 'pointer',
          lineHeight: 1.4,
          transition: 'background 0.15s, color 0.15s, border-color 0.15s',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'color-mix(in srgb, var(--text) 5%, transparent)'
            e.currentTarget.style.color = 'var(--text)'
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.color = isFile ? 'var(--muted)' : 'var(--text)'
          }
        }}
      >
        {isDir && (
          <CaretRight size={10} aria-hidden="true" style={{
            flexShrink: 0, color: 'var(--muted)',
            transform: open ? 'rotate(90deg)' : 'none',
            transition: 'transform 0.18s',
          }} />
        )}
        {isDir
          ? open
            ? <FolderOpen size={13} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--accent)' }} />
            : <Folder     size={13} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--muted)' }} />
          : <FileCode size={13} aria-hidden="true" style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 55%, var(--muted))' }} />
        }
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
          {prettyName(node.name)}
        </span>
        {loading && (
          <div style={{
            width: '9px', height: '9px', flexShrink: 0,
            border: '1.5px solid var(--border)',
            borderTopColor: 'var(--accent)',
            borderRadius: '50%',
          }} className="spin" />
        )}
      </button>

      <AnimatePresence>
        {open && children !== null && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            {children.length === 0 && (
              <div style={{ padding: `4px 12px 4px ${12 + indent + 28}px`, fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                empty
              </div>
            )}
            {children.map(child => (
              <TreeNode
                key={child.path}
                node={child}
                depth={depth + 1}
                onFileClick={onFileClick}
                activeFile={activeFile}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Code panel ──────────────────────────────────────────────────────────────
function CodePanel({ file }) {
  const [code, setCode]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(false)
  const [copied, setCopied]   = useState(false)
  const [hlStyle, setHlStyle] = useState(cachedStyle)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!cachedStyle) {
      import('react-syntax-highlighter/dist/esm/styles/prism').then(m => {
        cachedStyle = m.oneDark
        setHlStyle(m.oneDark)
      })
    }
  }, [])

  useEffect(() => {
    if (!file) return
    setCode(null); setError(false); setLoading(true)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    fetch(`${GH_RAW}/${file.path}`)
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(t => { setCode(t); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [file?.path])

  function handleCopy() {
    if (!code) return
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // ── empty state
  if (!file) return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '12px', color: 'var(--muted)', minHeight: 0,
    }}>
      <FileCode size={36} style={{ opacity: 0.25 }} aria-hidden="true" />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.6 }}>
        select a file to view the code
      </p>
    </div>
  )

  const lines = code ? code.split('\n').length : 0
  const topicLabel = prettyName(file.path.split('/').slice(0, -1).join('/'))

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, minWidth: 0,
    }}>
      {/* reading progress */}
      <ReadingProgress scrollRef={scrollRef} />

      {/* file header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '12px', padding: '12px 20px', flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur-sm)',
        WebkitBackdropFilter: 'var(--glass-blur-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
          <FileCode size={15} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: '0.88rem',
              fontWeight: 600, color: 'var(--text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {file.name}
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>
              {topicLabel}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {lines > 0 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
              {lines} lines
            </span>
          )}
          <button
            onClick={handleCopy}
            aria-label={copied ? 'Copied' : 'Copy code'}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              padding: '5px 12px', borderRadius: '7px',
              background: copied
                ? 'color-mix(in srgb, var(--accent) 14%, transparent)'
                : 'var(--glass-bg)',
              backdropFilter: 'var(--glass-blur-sm)',
              WebkitBackdropFilter: 'var(--glass-blur-sm)',
              border: '1px solid',
              borderColor: copied
                ? 'color-mix(in srgb, var(--accent) 35%, transparent)'
                : 'var(--border)',
              color: copied ? 'var(--accent)' : 'var(--muted)',
              fontFamily: 'var(--font-mono)', fontSize: '0.73rem',
              cursor: 'pointer', transition: 'all 0.18s',
            }}
          >
            {copied
              ? <Check size={12} aria-hidden="true" />
              : <Copy  size={12} aria-hidden="true" />}
            {copied ? 'copied!' : 'copy'}
          </button>
        </div>
      </div>

      {/* code area */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
            <div style={{ width: '18px', height: '18px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" />
          </div>
        )}
        {error && (
          <div style={{ padding: '32px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
            ⚠ could not load file
          </div>
        )}
        {code && !loading && (
          <Suspense fallback={
            <pre style={{ background: 'var(--surface)', padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text)', margin: 0, lineHeight: 1.7 }}>
              <code>{code}</code>
            </pre>
          }>
            {hlStyle ? (
              <SyntaxHighlighter
                language="cpp"
                style={hlStyle}
                customStyle={{
                  margin: 0, borderRadius: 0,
                  background: 'var(--surface)',
                  fontSize: '0.875rem',
                  lineHeight: 1.75,
                  padding: '1.25rem 1.5rem',
                  minHeight: '100%',
                }}
                showLineNumbers
                lineNumberStyle={{
                  color: 'var(--muted)', opacity: 0.35,
                  userSelect: 'none', minWidth: '2.5em',
                  paddingRight: '1em',
                  fontFamily: 'var(--font-mono)',
                }}
                wrapLongLines={false}
                PreTag="div"
              >
                {code}
              </SyntaxHighlighter>
            ) : (
              <pre style={{ background: 'var(--surface)', padding: '1.25rem 1.5rem', fontSize: '0.875rem', color: 'var(--text)', margin: 0, lineHeight: 1.75 }}>
                <code>{code}</code>
              </pre>
            )}
          </Suspense>
        )}
      </div>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function DsaPage() {
  const [activeFile, setActiveFile] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Top-level tree nodes from TOPICS
  const topicNodes = TOPICS.map(t => ({ name: t.label, path: t.name, type: 'dir', _displayName: t.label }))

  return (
    <div style={{
      height: '100dvh',
      paddingTop: '56px',       // navbar height
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>

      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 16px', height: '44px', flexShrink: 0,
        borderBottom: '1px solid var(--border)',
        background: 'var(--glass-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
      }}>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          title={sidebarOpen ? 'hide sidebar' : 'show sidebar'}
          aria-label={sidebarOpen ? 'hide sidebar' : 'show sidebar'}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '28px', height: '28px', borderRadius: '6px',
            background: sidebarOpen ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent',
            border: '1px solid',
            borderColor: sidebarOpen ? 'color-mix(in srgb, var(--accent) 28%, transparent)' : 'var(--border)',
            color: sidebarOpen ? 'var(--accent)' : 'var(--muted)',
            cursor: 'pointer', transition: 'all 0.18s',
          }}
        >
          <TreeStructure size={13} aria-hidden="true" />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Code size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
            dsa
          </span>
          <span style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>/</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
            A2Z DSA, solved in C++. Click any file to read the code.
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <a
          href={`https://github.com/${REPO}`}
          target="_blank" rel="noopener noreferrer"
          style={{
            fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
            color: 'var(--muted)', textDecoration: 'none',
            opacity: 0.6, transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '1'}
          onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}
        >
          ↗ github
        </a>
      </div>

      {/* body: sidebar + code panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              style={{
                borderRight: '1px solid var(--border)',
                overflowY: 'auto', overflowX: 'hidden',
                flexShrink: 0,
                background: 'color-mix(in srgb, var(--surface) 80%, transparent)',
              }}
            >
              <div style={{ paddingTop: '8px', paddingBottom: '16px', minWidth: 240 }}>
                {topicNodes.map((node, i) => (
                  <motion.div
                    key={node.path}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.05 }}
                  >
                    <TreeNode
                      node={{ ...node, name: TOPICS[i].name, _label: TOPICS[i].label }}
                      depth={0}
                      onFileClick={setActiveFile}
                      activeFile={activeFile?.path}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* code panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <CodePanel file={activeFile} />
        </div>
      </div>
    </div>
  )
}
