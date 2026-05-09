import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Github, ExternalLink, Star, GitFork, Loader2, Sparkles, Code2 } from 'lucide-react'
import { manualProjects, GITHUB_USERNAME } from '../data/projects'
import TerminalCmd from '../components/TerminalCmd'
import TagBadge from '../components/TagBadge'

export default function ProjectsPage() {
  const [tab, setTab] = useState('featured')
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (tab === 'opensource' && repos.length === 0) {
      setLoading(true); setError(null)
      fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&per_page=12&type=public`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setRepos(data.filter(r => !r.fork).slice(0, 9))
          else setError('Failed to load repos')
          setLoading(false)
        })
        .catch(() => { setError('Failed to load repos'); setLoading(false) })
    }
  }, [tab])

  return (
    <div style={{ minHeight: '100vh', padding: '120px max(24px, calc((100vw - 900px) / 2)) 80px' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        {/* Typing animation — re-runs on every page mount */}
        <TerminalCmd cmd="ls ./projects" />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.01em' }}>projects</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px' }}>
          Things I&#39;ve built and tinkered with.
        </p>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '36px', background: 'var(--surface)', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border)' }}>
          <TabBtn active={tab === 'featured'}   onClick={() => setTab('featured')}   icon={<Sparkles size={13} />} label="Featured" />
          <TabBtn active={tab === 'opensource'} onClick={() => setTab('opensource')} icon={<Code2    size={13} />} label="Open Source" />
        </div>

        {tab === 'featured' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))', gap: '16px' }}>
            {manualProjects.length === 0
              ? <EmptyState label="No featured projects yet." />
              : manualProjects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                  <FeaturedCard project={p} />
                </motion.div>
              ))
            }
          </div>
        )}

        {tab === 'opensource' && (
          <div>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', padding: '48px 0' }}>
                <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>fetching repos...</span>
                <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
              </div>
            )}
            {error && <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{error}</p>}
            {!loading && !error && repos.length === 0 && <EmptyState label="No public repos found." />}
            {!loading && !error && repos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '14px' }}>
                {repos.map((repo, i) => (
                  <motion.div key={repo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <RepoCard repo={repo} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '7px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer',
      fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
      background: active ? 'var(--accent)' : 'transparent',
      color:      active ? 'var(--bg)'     : 'var(--muted)',
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.color = 'var(--text)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'var(--muted)' }}
    >{icon}{label}</button>
  )
}

function FeaturedCard({ project }) {
  return (
    <div
      style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', transition: 'all 0.22s', display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.97rem', fontWeight: 600, color: 'var(--text)' }}>{project.name}</h3>
        <span style={{ padding: '2px 9px', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', borderRadius: '999px', fontSize: '0.65rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>featured</span>
      </div>

      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', lineHeight: 1.65, flex: 1 }}>{project.description}</p>

      {/* Colored tech tags using shared TagBadge */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {project.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
      </div>

      {/* Button-style source / live demo */}
      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '7px', color: 'var(--muted)', textDecoration: 'none', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', transition: 'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 8%, transparent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.background = 'transparent' }}
          ><Github size={13} /> source</a>
        )}
        {project.live && (
          <a href={project.live} target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: 'var(--accent)', border: '1px solid transparent', borderRadius: '7px', color: 'var(--bg)', textDecoration: 'none', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', fontWeight: 600, transition: 'opacity 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.82' }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
          ><ExternalLink size={13} /> live demo</a>
        )}
      </div>
    </div>
  )
}

function RepoCard({ repo }) {
  const langColors = { JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5', 'C++': '#f34b7d', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Go: '#00add8', Rust: '#dea584' }
  return (
    <a href={repo.html_url} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '18px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', textDecoration: 'none', transition: 'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent)' }}>{repo.name}</span>
        <Github size={13} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: '2px' }} />
      </div>
      {repo.description && <p style={{ color: 'var(--muted)', fontSize: '0.8rem', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{repo.description}</p>}
      <div style={{ display: 'flex', gap: '14px', marginTop: 'auto' }}>
        {repo.language && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.72rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: langColors[repo.language] || 'var(--muted)', flexShrink: 0 }} />
            {repo.language}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--muted)' }}><Star size={11} />{repo.stargazers_count}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: 'var(--muted)' }}><GitFork size={11} />{repo.forks_count}</span>
      </div>
    </a>
  )
}

function EmptyState({ label }) {
  return <div style={{ padding: '60px 0', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{label}</div>
}
