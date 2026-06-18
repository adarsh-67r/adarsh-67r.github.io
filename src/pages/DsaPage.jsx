import { useState, useEffect, useRef, lazy, Suspense, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder, FolderOpen, FileCode, CaretRight,
  Copy, Check, Code, TreeStructure, X,
  MagnifyingGlass, PencilSimple, ArrowCounterClockwise,
  Play, SpinnerGap, Terminal, ArrowSquareIn, WarningCircle,
} from '@phosphor-icons/react'

// ── CSS-based syntax highlighter (theme-aware via CSS vars) ──────────────────
// Instead of a hardcoded JS theme object, we use highlight.js with a CSS
// stylesheet injected once. The CSS variables are overridden per-theme in
// index.css / ThemeContext so code blocks adapt to every site theme.
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter'
import cpp from 'react-syntax-highlighter/dist/esm/languages/hljs/cpp'
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs'

SyntaxHighlighter.registerLanguage('cpp', cpp)

// We override every hljs token via CSS variables set in our global stylesheet.
// The `docco` import is just a structural placeholder so the component renders;
// all actual colours come from CSS overrides in DsaPage's inline <style> below.
const HL_OVERRIDE_STYLE = {
  display: 'block',
  overflowX: 'auto',
  padding: '1.25rem 1.5rem',
  background: 'var(--surface)',
  color: 'var(--text)',
  fontFamily: 'var(--font-mono)',
  borderRadius: 0,
  margin: 0,
}

const REPO   = 'adarsh-67r/a2z-dsa'
const BRANCH = 'main'
const GH_API = `https://api.github.com/repos/${REPO}/contents`
const GH_RAW = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`
const PISTON = 'https://emkc.org/api/v2/piston/execute'

const TOPICS = [
  { name: '01_Basics',            label: 'Basics' },
  { name: '02_SortingTechniques', label: 'Sorting Techniques' },
  { name: '03_Array',             label: 'Arrays' },
]

const FONT_SIZES = [
  { label: 'A−', value: '0.75rem',  title: 'Small' },
  { label: 'A',  value: '0.875rem', title: 'Medium (default)' },
  { label: 'A+', value: '1rem',     title: 'Large' },
]

async function ghFetch(path) {
  const res = await fetch(`${GH_API}/${path}?ref=${BRANCH}`, {
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!res.ok) throw new Error(`GitHub API ${res.status}`)
  return res.json()
}

// Recursively fetch an entire topic's tree in parallel
async function fetchTopicTree(topicPath) {
  const items = await ghFetch(topicPath)
  items.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name)
    return a.type === 'dir' ? -1 : 1
  })
  const filtered = items.filter(i => i.type === 'dir' || i.name.endsWith('.cpp'))

  // recurse into sub-directories in parallel
  const withChildren = await Promise.all(filtered.map(async item => {
    if (item.type !== 'dir') return { ...item, children: null }
    const children = await fetchTopicTree(item.path)
    return { ...item, children }
  }))
  return withChildren
}

// Flatten a loaded tree into a list of file nodes for search
function flattenFiles(nodes) {
  const out = []
  for (const n of nodes) {
    if (n.type === 'file') out.push(n)
    else if (n.children) out.push(...flattenFiles(n.children))
  }
  return out
}

function prettyName(raw) {
  return raw
    .replace(/^\d+_/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\.cpp$/, '')
    .trim()
}

// ── icon button ───────────────────────────────────────────────────────────────
function IconBtn({ onClick, title, active, children, style = {}, danger }) {
  return (
    <button onClick={onClick} title={title} aria-label={title} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      gap: '4px', padding: '4px 8px', height: '28px', borderRadius: '6px',
      background: danger
        ? 'color-mix(in srgb, #f38ba8 10%, transparent)'
        : active
          ? 'color-mix(in srgb, var(--accent) 14%, transparent)'
          : 'var(--glass-bg)',
      backdropFilter: 'var(--glass-blur-sm)',
      WebkitBackdropFilter: 'var(--glass-blur-sm)',
      border: '1px solid',
      borderColor: danger
        ? 'color-mix(in srgb, #f38ba8 35%, transparent)'
        : active
          ? 'color-mix(in srgb, var(--accent) 35%, transparent)'
          : 'var(--border)',
      color: danger ? '#f38ba8' : active ? 'var(--accent)' : 'var(--muted)',
      fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
      cursor: 'pointer', transition: 'all 0.18s', whiteSpace: 'nowrap',
      ...style,
    }}
    onMouseEnter={e => { if (!active && !danger) { e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 35%, transparent)'; e.currentTarget.style.color = 'var(--text)' } }}
    onMouseLeave={e => { if (!active && !danger) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' } }}
    >{children}</button>
  )
}

// ── reading progress bar ───────────────────────────────────────────────────────
function ReadingProgress({ scrollRef }) {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const update = () => { const { scrollTop, scrollHeight, clientHeight } = el; const max = scrollHeight - clientHeight; setPct(max > 0 ? (scrollTop / max) * 100 : 0) }
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [])
  return (
    <div style={{ height: '2px', background: 'var(--border)', flexShrink: 0 }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.1s linear' }} />
    </div>
  )
}

// ── search bar ────────────────────────────────────────────────────────────────
function SearchBar({ query, onChange, onClose }) {
  const inputRef = useRef(null)
  useEffect(() => { inputRef.current?.focus() }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderBottom: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface) 80%, transparent)', flexShrink: 0 }}>
      <MagnifyingGlass size={13} style={{ color: 'var(--muted)', flexShrink: 0 }} aria-hidden="true" />
      <input ref={inputRef} value={query} onChange={e => onChange(e.target.value)} placeholder="search files…" aria-label="Search files"
        style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text)' }}
      />
      {query && <button onClick={() => onChange('')} aria-label="Clear search" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: '2px' }}><X size={11} aria-hidden="true" /></button>}
      <button onClick={onClose} aria-label="Close search" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', padding: '2px 4px' }}>esc</button>
    </div>
  )
}

// ── search results ─────────────────────────────────────────────────────────────
function SearchResults({ query, allFiles, onFileClick, activeFile }) {
  const filtered = allFiles.filter(f =>
    prettyName(f.name).toLowerCase().includes(query.toLowerCase()) ||
    f.path.toLowerCase().includes(query.toLowerCase())
  )
  if (!query) return null
  return (
    <div style={{ flex: 1, overflowY: 'auto' }}>
      {filtered.length === 0
        ? <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>no files match "{query}"</div>
        : filtered.map(f => {
            const isActive = activeFile === f.path
            return (
              <button key={f.path} onClick={() => onFileClick(f)} style={{
                width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px',
                padding: '7px 12px', background: isActive ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                border: 'none', borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'color-mix(in srgb, var(--text) 6%, transparent)' }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: isActive ? 'var(--accent)' : 'var(--text)', fontWeight: 500 }}>{prettyName(f.name)}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)', opacity: 0.7 }}>{f.path.split('/').slice(0, -1).map(prettyName).join(' / ')}</span>
              </button>
            )
          })
      }
    </div>
  )
}

// ── tree node (uses pre-loaded children from eager fetch) ─────────────────────
function TreeNode({ node, depth = 0, onFileClick, activeFile }) {
  const [open, setOpen] = useState(false)
  const isDir    = node.type === 'dir'
  const isFile   = node.type === 'file'
  const isActive = isFile && activeFile === node.path
  const hasChildren = isDir && node.children !== null
  const indent = depth * 14

  function toggle() {
    if (isFile) { onFileClick(node); return }
    setOpen(o => !o)
  }

  return (
    <div>
      <button onClick={toggle} title={prettyName(node.name)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '6px',
        padding: `5px 10px 5px ${10 + indent}px`,
        background: isActive ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
        border: 'none',
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        borderRadius: 0,
        color: isActive ? 'var(--accent)' : isFile ? 'var(--muted)' : 'var(--text)',
        fontFamily: 'var(--font-mono)', fontSize: '0.76rem', textAlign: 'left',
        cursor: 'pointer', lineHeight: 1.4, transition: 'background 0.15s, color 0.15s, border-color 0.15s',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'color-mix(in srgb, var(--text) 6%, transparent)'; e.currentTarget.style.color = 'var(--text)' } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = isFile ? 'var(--muted)' : 'var(--text)' } }}
      >
        {isDir && <CaretRight size={9} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--muted)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.18s' }} />}
        {isDir
          ? open
            ? <FolderOpen size={12} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--accent)' }} />
            : <Folder size={12} aria-hidden="true" style={{ flexShrink: 0, color: 'var(--muted)' }} />
          : <FileCode size={12} aria-hidden="true" style={{ flexShrink: 0, color: isActive ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 50%, var(--muted))' }} />
        }
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{prettyName(node.name)}</span>
      </button>

      <AnimatePresence>
        {open && hasChildren && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: 'hidden' }}>
            {node.children.length === 0
              ? <div style={{ padding: `3px 10px 3px ${10 + indent + 24}px`, fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>empty</div>
              : node.children.map(child => <TreeNode key={child.path} node={child} depth={depth + 1} onFileClick={onFileClick} activeFile={activeFile} />)
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── terminal drawer (slides up from bottom of code panel on error) ─────────────
function TerminalDrawer({ open, onClose, runResult, running }) {
  const hasErrors = runResult?.compile_output || runResult?.stderr
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0 }} animate={{ height: 200 }} exit={{ height: 0 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          style={{ overflow: 'hidden', flexShrink: 0, borderTop: '1px solid var(--border)' }}
        >
          <div style={{ height: '200px', display: 'flex', flexDirection: 'column', background: 'color-mix(in srgb, var(--surface) 92%, #000 8%)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', height: '30px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <Terminal size={11} style={{ color: hasErrors ? '#f38ba8' : 'var(--muted)' }} aria-hidden="true" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: hasErrors ? '#f38ba8' : 'var(--muted)', flex: 1 }}>
                terminal {running ? '— running…' : hasErrors ? '— errors' : '— clean'}
              </span>
              {running && <SpinnerGap size={11} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />}
              <button onClick={onClose} aria-label="Close terminal" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', display: 'flex', padding: '2px' }}><X size={11} aria-hidden="true" /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px 16px' }}>
              {!runResult && !running && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', opacity: 0.5 }}>compile errors and runtime logs appear here</span>}
              {(runResult?.compile_output || runResult?.stderr) && (
                <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', color: '#f38ba8', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                  {[runResult.compile_output, runResult.stderr].filter(Boolean).join('\n')}
                </pre>
              )}
              {runResult && !runResult.compile_output && !runResult.stderr && !running && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#a6e3a1' }}>✓ no errors</span>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ── right panel: stdin (top) + output (bottom) ─────────────────────────────────
function IOPanel({ stdin, onStdinChange, runResult, running }) {
  return (
    <div style={{ width: '300px', flexShrink: 0, borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* stdin — top half */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderBottom: '1px solid var(--border)', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', height: '30px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'color-mix(in srgb, var(--surface) 80%, transparent)' }}>
          <ArrowSquareIn size={11} style={{ color: 'var(--muted)' }} aria-hidden="true" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>stdin</span>
        </div>
        <textarea
          value={stdin}
          onChange={e => onStdinChange(e.target.value)}
          placeholder="paste test input here…"
          aria-label="stdin input"
          spellCheck={false}
          style={{ flex: 1, width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text)', padding: '10px 14px', lineHeight: 1.6 }}
        />
      </div>

      {/* output — bottom half */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', height: '30px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'color-mix(in srgb, var(--surface) 80%, transparent)' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: running ? 'var(--accent)' : runResult?.stdout ? '#a6e3a1' : 'var(--muted)', flexShrink: 0, transition: 'background 0.3s' }} aria-hidden="true" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)', flex: 1 }}>output</span>
          {running && <SpinnerGap size={11} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px' }}>
          {!runResult && !running && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)', opacity: 0.5 }}>hit ▶ run to see output</span>}
          {runResult?.stdout && <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#a6e3a1', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>{runResult.stdout}</pre>}
          {runResult && !runResult.stdout && !running && <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--muted)' }}>(no stdout)</span>}
        </div>
      </div>
    </div>
  )
}

// ── code panel ────────────────────────────────────────────────────────────────
function CodePanel({ file, onMobileClose, fontSize, setFontSize }) {
  const [code, setCode]             = useState(null)
  const [origCode, setOrigCode]     = useState(null)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(false)
  const [copied, setCopied]         = useState(false)
  const [editMode, setEditMode]     = useState(false)
  const [editCode, setEditCode]     = useState('')
  const [running, setRunning]       = useState(false)
  const [runResult, setRunResult]   = useState(null)
  const [stdin, setStdin]           = useState('')
  const [termOpen, setTermOpen]     = useState(false)
  const [ioVisible, setIoVisible]   = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (!file) return
    setCode(null); setOrigCode(null); setError(false); setLoading(true)
    setEditMode(false); setEditCode(''); setRunResult(null); setStdin(''); setTermOpen(false)
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    fetch(`${GH_RAW}/${file.path}`)
      .then(r => { if (!r.ok) throw new Error(); return r.text() })
      .then(t => { setCode(t); setOrigCode(t); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [file?.path])

  function handleCopy() {
    const src = editMode ? editCode : code
    if (!src) return
    navigator.clipboard.writeText(src).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  function handleEdit() { setEditCode(code); setEditMode(true) }
  function handleReset() { setCode(origCode); setEditCode(origCode); setEditMode(false); setRunResult(null); setTermOpen(false) }

  async function handleRun() {
    const src = editMode ? editCode : code
    if (!src || running) return
    setRunning(true); setRunResult(null)
    try {
      const res = await fetch(PISTON, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: 'cpp', version: '*', files: [{ name: 'main.cpp', content: src }], stdin }),
      })
      const data = await res.json()
      const run = data.run || {}
      const result = { stdout: run.stdout || '', stderr: run.stderr || '', compile_output: data.compile?.stderr || '', time: run.time }
      setRunResult(result)
      // auto-open terminal drawer only on error
      if (result.stderr || result.compile_output) setTermOpen(true)
      else setTermOpen(false)
    } catch {
      setRunResult({ stdout: '', stderr: '', compile_output: 'network error — could not reach Piston API' })
      setTermOpen(true)
    } finally {
      setRunning(false)
    }
  }

  if (!file) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', color: 'var(--muted)' }}>
      <FileCode size={32} style={{ opacity: 0.2 }} aria-hidden="true" />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', opacity: 0.55 }}>select a file from the sidebar</p>
    </div>
  )

  const displayCode = editMode ? editCode : code
  const lines = displayCode ? displayCode.split('\n').length : 0
  const topicLabel = file.path.split('/').slice(0, -1).map(prettyName).join(' / ')
  const isDirty = editMode && editCode !== origCode
  const hasErrors = runResult?.stderr || runResult?.compile_output

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
      {/* code area (left of IO panel) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0, position: 'relative' }}>
        <ReadingProgress scrollRef={scrollRef} />

        {/* file header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', padding: '6px 16px', flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur-sm)', WebkitBackdropFilter: 'var(--glass-blur-sm)', flexWrap: 'wrap', rowGap: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            {onMobileClose && <IconBtn onClick={onMobileClose} title="Back to file list"><X size={12} aria-hidden="true" /></IconBtn>}
            <FileCode size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {file.name}{isDirty && <span style={{ marginLeft: '6px', fontSize: '0.65rem', color: 'var(--accent)', opacity: 0.8 }}>● edited</span>}
              </div>
              <div style={{ fontSize: '0.67rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', marginTop: '1px' }}>{topicLabel}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, flexWrap: 'wrap' }}>
            {lines > 0 && <span style={{ fontSize: '0.67rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>{lines}L</span>}
            <div style={{ display: 'flex', gap: '2px' }}>
              {FONT_SIZES.map(fs => <IconBtn key={fs.value} onClick={() => setFontSize(fs.value)} title={fs.title} active={fontSize === fs.value} style={{ padding: '4px 7px', height: '26px' }}>{fs.label}</IconBtn>)}
            </div>

            {!editMode
              ? <IconBtn onClick={handleEdit} title="Scratch-pad (resets on file switch)"><PencilSimple size={11} aria-hidden="true" /> edit</IconBtn>
              : <IconBtn onClick={handleReset} title="Restore original code" active><ArrowCounterClockwise size={11} aria-hidden="true" /> reset</IconBtn>
            }

            <IconBtn onClick={() => setIoVisible(o => !o)} title="Toggle stdin / output panel" active={ioVisible}>
              <ArrowSquareIn size={11} aria-hidden="true" /> i/o
            </IconBtn>

            {hasErrors && !running && (
              <IconBtn onClick={() => setTermOpen(o => !o)} title="Toggle terminal" active={termOpen} danger={!termOpen}>
                <WarningCircle size={11} aria-hidden="true" /> errors
              </IconBtn>
            )}

            <IconBtn onClick={handleRun} title="Run code (Piston API)" active={running}
              style={{ background: running ? 'color-mix(in srgb, var(--accent) 14%, transparent)' : 'color-mix(in srgb, var(--accent) 8%, transparent)', borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)', color: 'var(--accent)' }}>
              {running ? <SpinnerGap size={11} style={{ animation: 'spin 0.8s linear infinite' }} aria-hidden="true" /> : <Play size={11} aria-hidden="true" />} run
            </IconBtn>

            <IconBtn onClick={handleCopy} title={copied ? 'Copied!' : 'Copy code'} active={copied}>
              {copied ? <Check size={11} aria-hidden="true" /> : <Copy size={11} aria-hidden="true" />}{copied ? 'copied!' : 'copy'}
            </IconBtn>
          </div>
        </div>

        {/* code / edit area */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', minHeight: 0 }}>
          {loading && <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}><div style={{ width: '16px', height: '16px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%' }} className="spin" /></div>}
          {error && <div style={{ padding: '32px', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>⚠ could not load file</div>}

          {!loading && !error && editMode && (
            <textarea value={editCode} onChange={e => setEditCode(e.target.value)} spellCheck={false} aria-label="Edit code (scratch-pad only)"
              style={{ width: '100%', minHeight: '100%', background: 'var(--surface)', color: 'var(--text)', fontFamily: 'var(--font-mono)', fontSize, lineHeight: 1.75, padding: '1.25rem 1.5rem', border: 'none', outline: 'none', resize: 'none', tabSize: 4 }}
            />
          )}

          {!loading && !error && !editMode && code && (
            <Suspense fallback={<pre style={{ background: 'var(--surface)', padding: '1.25rem 1.5rem', fontSize, color: 'var(--text)', margin: 0, lineHeight: 1.75, fontFamily: 'var(--font-mono)' }}><code>{code}</code></pre>}>
              <SyntaxHighlighter
                language="cpp"
                style={docco}
                customStyle={{ ...HL_OVERRIDE_STYLE, fontSize, lineHeight: 1.75, minHeight: '100%' }}
                showLineNumbers
                lineNumberStyle={{ color: 'var(--muted)', opacity: 0.3, userSelect: 'none', minWidth: '2.2em', paddingRight: '1em', fontFamily: 'var(--font-mono)' }}
                wrapLongLines={false}
                PreTag="div"
              >{code}</SyntaxHighlighter>
            </Suspense>
          )}
        </div>

        {/* terminal drawer — slides up from bottom, only on errors */}
        <TerminalDrawer open={termOpen} onClose={() => setTermOpen(false)} runResult={runResult} running={running} />
      </div>

      {/* IO panel — right side */}
      <AnimatePresence>
        {ioVisible && (
          <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }} style={{ overflow: 'hidden', flexShrink: 0 }}>
            <div style={{ width: '300px', height: '100%' }}>
              <IOPanel stdin={stdin} onStdinChange={setStdin} runResult={runResult} running={running} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── main page ─────────────────────────────────────────────────────────────────
export default function DsaPage() {
  const [activeFile, setActiveFile]   = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileView, setMobileView]   = useState('tree')
  const [searchOpen, setSearchOpen]   = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [fontSize, setFontSize]       = useState('0.875rem')

  // Eagerly loaded tree: { [topicName]: Node[] | null (loading) }
  const [trees, setTrees]   = useState(() => Object.fromEntries(TOPICS.map(t => [t.name, null])))
  const [allFiles, setAllFiles] = useState([])
  const [treeLoading, setTreeLoading] = useState(true)

  // Load all topic trees on mount
  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      const results = await Promise.allSettled(TOPICS.map(t => fetchTopicTree(t.name)))
      if (cancelled) return
      const newTrees = {}
      const newFiles = []
      results.forEach((r, i) => {
        const name = TOPICS[i].name
        if (r.status === 'fulfilled') {
          newTrees[name] = r.value
          newFiles.push(...flattenFiles(r.value))
        } else {
          newTrees[name] = []
        }
      })
      setTrees(newTrees)
      setAllFiles(newFiles)
      setTreeLoading(false)
    }
    loadAll()
    return () => { cancelled = true }
  }, [])

  const [mobile, setMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const fn = () => setMobile(window.innerWidth < 768)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(o => !o) }
      if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function handleFileClick(file) {
    setActiveFile(file)
    if (mobile) setMobileView('code')
    if (searchOpen) { setSearchOpen(false); setSearchQuery('') }
  }

  const sidebarContent = (
    <>
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
            <SearchBar query={searchQuery} onChange={setSearchQuery} onClose={() => { setSearchOpen(false); setSearchQuery('') }} />
          </motion.div>
        )}
      </AnimatePresence>

      {searchOpen && searchQuery ? (
        <SearchResults query={searchQuery} allFiles={allFiles} onFileClick={handleFileClick} activeFile={activeFile?.path} />
      ) : (
        <div style={{ paddingTop: '8px', paddingBottom: '24px' }}>
          {treeLoading ? (
            // skeleton while trees are loading
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'var(--border)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />
                <div style={{ flex: 1, height: '10px', borderRadius: '3px', background: 'var(--border)', animation: 'pulse 1.4s ease-in-out infinite', animationDelay: `${i * 0.12}s` }} />
              </div>
            ))
          ) : (
            TOPICS.map((topic, i) => {
              const children = trees[topic.name] ?? []
              const topicNode = { name: topic.name, path: topic.name, type: 'dir', children }
              return (
                <motion.div key={topic.name} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: i * 0.05 }}>
                  <TreeNode node={topicNode} depth={0} onFileClick={handleFileClick} activeFile={activeFile?.path} />
                </motion.div>
              )
            })
          )}
        </div>
      )}
    </>
  )

  const topBar = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', height: '40px', flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)' }}>
      <button onClick={() => setSidebarOpen(o => !o)} title={sidebarOpen ? 'hide sidebar' : 'show sidebar'} aria-label={sidebarOpen ? 'hide sidebar' : 'show sidebar'}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '26px', height: '26px', borderRadius: '6px', background: sidebarOpen ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent', border: '1px solid', borderColor: sidebarOpen ? 'color-mix(in srgb, var(--accent) 28%, transparent)' : 'var(--border)', color: sidebarOpen ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer', transition: 'all 0.18s' }}>
        <TreeStructure size={12} aria-hidden="true" />
      </button>
      <Code size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)' }}>dsa</span>
      <span style={{ color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>/</span>
      <span style={{ color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>A2Z DSA · C++</span>
      <div style={{ flex: 1 }} />
      <button onClick={() => setSearchOpen(o => !o)} title="Search files (Ctrl+K)" aria-label="Search files"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', height: '26px', borderRadius: '6px', background: searchOpen ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent', border: '1px solid', borderColor: searchOpen ? 'color-mix(in srgb, var(--accent) 28%, transparent)' : 'var(--border)', color: searchOpen ? 'var(--accent)' : 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.18s' }}>
        <MagnifyingGlass size={11} aria-hidden="true" />
        search
        <span style={{ opacity: 0.5, fontSize: '0.65rem' }}>⌘K</span>
      </button>
      <a href={`https://github.com/${REPO}`} target="_blank" rel="noopener noreferrer"
        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.67rem', color: 'var(--muted)', textDecoration: 'none', opacity: 0.6, transition: 'opacity 0.15s' }}
        onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0.6'}>
        ↗ github
      </a>
    </div>
  )

  // ── CSS token overrides for hljs so it uses site CSS vars ──
  const hljsCss = `
    .hljs { background: var(--surface) !important; color: var(--text) !important; }
    .hljs-keyword, .hljs-selector-tag, .hljs-built_in, .hljs-name, .hljs-tag { color: var(--accent) !important; }
    .hljs-string, .hljs-title, .hljs-section, .hljs-attribute, .hljs-literal, .hljs-template-tag,
    .hljs-template-variable, .hljs-type, .hljs-addition { color: color-mix(in srgb, var(--accent) 70%, #a6e3a1) !important; }
    .hljs-comment, .hljs-quote, .hljs-deletion, .hljs-meta { color: var(--muted) !important; font-style: italic; }
    .hljs-number, .hljs-symbol, .hljs-bullet, .hljs-link { color: color-mix(in srgb, var(--accent) 55%, #fab387) !important; }
    .hljs-emphasis { font-style: italic; }
    .hljs-strong { font-weight: bold; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `

  if (mobile) {
    return (
      <div style={{ height: '100dvh', paddingTop: '56px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <style>{hljsCss}</style>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 14px', height: '40px', flexShrink: 0, borderBottom: '1px solid var(--border)', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', WebkitBackdropFilter: 'var(--glass-blur)' }}>
          <Code size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} aria-hidden="true" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text)', flex: 1 }}>{mobileView === 'code' && activeFile ? prettyName(activeFile.name) : 'A2Z DSA'}</span>
          {mobileView === 'tree' && <button onClick={() => setSearchOpen(o => !o)} aria-label="Search files" style={{ background: 'none', border: 'none', cursor: 'pointer', color: searchOpen ? 'var(--accent)' : 'var(--muted)', display: 'flex' }}><MagnifyingGlass size={14} aria-hidden="true" /></button>}
          {mobileView === 'code' && <button onClick={() => setMobileView('tree')} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>← files</button>}
        </div>
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <AnimatePresence mode="wait" initial={false}>
            {mobileView === 'tree' ? (
              <motion.div key="tree" initial={{ x: '-100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '-100%', opacity: 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }} style={{ position: 'absolute', inset: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {sidebarContent}
              </motion.div>
            ) : (
              <motion.div key="code" initial={{ x: '100%', opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0 }} transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }} style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' }}>
                <CodePanel file={activeFile} onMobileClose={() => setMobileView('tree')} fontSize={fontSize} setFontSize={setFontSize} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '100dvh', paddingTop: '56px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{hljsCss}</style>
      {topBar}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.div key="sidebar" initial={{ width: 0, opacity: 0 }} animate={{ width: 240, opacity: 1 }} exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              style={{ borderRight: '1px solid var(--border)', overflowY: 'auto', overflowX: 'hidden', flexShrink: 0, background: 'color-mix(in srgb, var(--surface) 75%, transparent)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ minWidth: 240, flex: 1, display: 'flex', flexDirection: 'column' }}>{sidebarContent}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* code panel + IO panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: 0 }}>
          <CodePanel file={activeFile} fontSize={fontSize} setFontSize={setFontSize} />
        </div>
      </div>
    </div>
  )
}
