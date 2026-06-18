import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, FolderOpen, FileCode, CaretRight, Code } from '@phosphor-icons/react'

// Folders in the a2z-dsa repo, in order
const TOPICS = [
  { name: '01_Basics',           label: 'Basics' },
  { name: '02_SortingTechniques',label: 'Sorting Techniques' },
  { name: '03_Array',            label: 'Arrays' },
]

const REPO   = 'adarsh-67r/a2z-dsa'
const BRANCH = 'main'

async function fetchDir(path) {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/contents/${path}?ref=${BRANCH}`,
    { headers: { Accept: 'application/vnd.github+json' } }
  )
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  const data = await res.json()
  return data.filter(f => f.type === 'file' && f.name.endsWith('.cpp'))
}

export default function DsaPage() {
  const [expanded, setExpanded] = useState({})
  const [files, setFiles]       = useState({})   // topic -> [ file, ... ]
  const [loading, setLoading]   = useState({})   // topic -> bool
  const [error, setError]       = useState({})

  async function toggleTopic(topic) {
    const open = !expanded[topic]
    setExpanded(p => ({ ...p, [topic]: open }))

    if (open && !files[topic] && !loading[topic]) {
      setLoading(p => ({ ...p, [topic]: true }))
      try {
        const list = await fetchDir(topic)
        setFiles(p => ({ ...p, [topic]: list }))
      } catch (e) {
        setError(p => ({ ...p, [topic]: 'could not load files' }))
      } finally {
        setLoading(p => ({ ...p, [topic]: false }))
      }
    }
  }

  const totalFiles = Object.values(files).reduce((s, arr) => s + arr.length, 0)

  return (
    <div style={{ minHeight: '100vh', padding: '90px max(24px, calc((100vw - 720px) / 2)) 80px' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

        {/* header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Code size={20} style={{ color: 'var(--accent)' }} aria-hidden="true" />
            <h1 style={{ fontFamily: 'var(--font-mono)', fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>
              dsa journey
            </h1>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: '0.85rem', fontFamily: 'var(--font-mono)', maxWidth: '60ch', lineHeight: 1.7 }}>
            A2Z DSA — Striver's sheet, solved in C++. Click any file to read the code.
          </p>
          {totalFiles > 0 && (
            <span style={{
              display: 'inline-block', marginTop: '12px',
              padding: '3px 10px', borderRadius: '999px',
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              border: '1px solid color-mix(in srgb, var(--accent) 28%, transparent)',
              color: 'var(--accent)', fontSize: '0.72rem',
              fontFamily: 'var(--font-mono)',
            }}>
              {totalFiles} file{totalFiles !== 1 ? 's' : ''} loaded
            </span>
          )}
        </div>

        {/* tree */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {TOPICS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
            >
              {/* folder row */}
              <button
                onClick={() => toggleTopic(t.name)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '11px 16px', borderRadius: '10px',
                  background: expanded[t.name]
                    ? 'color-mix(in srgb, var(--accent) 8%, var(--glass-bg))'
                    : 'var(--glass-bg)',
                  backdropFilter: 'var(--glass-blur-sm)',
                  WebkitBackdropFilter: 'var(--glass-blur-sm)',
                  border: '1px solid',
                  borderColor: expanded[t.name] ? 'var(--glass-border)' : 'var(--glass-border-subtle)',
                  cursor: 'pointer',
                  transition: 'background 0.2s, border-color 0.2s',
                  textAlign: 'left',
                }}
                aria-expanded={!!expanded[t.name]}
              >
                <CaretRight
                  size={13}
                  aria-hidden="true"
                  style={{
                    color: 'var(--muted)', flexShrink: 0,
                    transform: expanded[t.name] ? 'rotate(90deg)' : 'none',
                    transition: 'transform 0.2s',
                  }}
                />
                {expanded[t.name]
                  ? <FolderOpen size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
                  : <Folder     size={16} style={{ color: 'var(--muted)',  flexShrink: 0 }} aria-hidden="true" />
                }
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: expanded[t.name] ? 'var(--text)' : 'var(--muted)', fontWeight: expanded[t.name] ? 600 : 400, flex: 1 }}>
                  {t.label}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                  {t.name}
                </span>
                {files[t.name] && (
                  <span style={{
                    fontSize: '0.68rem', padding: '1px 7px', borderRadius: '999px',
                    background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                    color: 'var(--accent)', fontFamily: 'var(--font-mono)',
                  }}>
                    {files[t.name].length}
                  </span>
                )}
              </button>

              {/* files list */}
              <AnimatePresence>
                {expanded[t.name] && (
                  <motion.div
                    key="files"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ paddingLeft: '28px', paddingTop: '4px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      {loading[t.name] && (
                        <div style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '12px', height: '12px', border: '1.5px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" />
                          fetching files...
                        </div>
                      )}
                      {error[t.name] && (
                        <div style={{ padding: '12px 16px', color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
                          ⚠ {error[t.name]}
                        </div>
                      )}
                      {(files[t.name] || []).map((f, fi) => (
                        <motion.div
                          key={f.name}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.18, delay: fi * 0.04 }}
                        >
                          <Link
                            to={`/dsa/${t.name}/${f.name}`}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '9px',
                              padding: '8px 14px', borderRadius: '8px',
                              background: 'transparent',
                              border: '1px solid transparent',
                              textDecoration: 'none', color: 'var(--muted)',
                              fontFamily: 'var(--font-mono)', fontSize: '0.82rem',
                              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 6%, var(--glass-bg-subtle))'
                              e.currentTarget.style.borderColor = 'var(--glass-border-subtle)'
                              e.currentTarget.style.color = 'var(--text)'
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = 'transparent'
                              e.currentTarget.style.borderColor = 'transparent'
                              e.currentTarget.style.color = 'var(--muted)'
                            }}
                          >
                            <FileCode size={14} style={{ flexShrink: 0, color: 'var(--accent)', opacity: 0.7 }} aria-hidden="true" />
                            {f.name}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* footer note */}
        <p style={{ marginTop: '36px', color: 'var(--muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)', opacity: 0.6 }}>
          ↗ live from{' '}
          <a href={`https://github.com/${REPO}`} target="_blank" rel="noopener noreferrer"
             style={{ color: 'var(--accent)', textDecoration: 'none' }}>
            github.com/{REPO}
          </a>
        </p>
      </motion.div>
    </div>
  )
}
