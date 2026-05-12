import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowSquareOut, Star, GitFork, CircleNotch, Sparkle, Code, GithubLogo } from '@phosphor-icons/react'
import { manualProjects, GITHUB_USERNAME } from '../data/projects'
import TagBadge from './TagBadge'
import TerminalCmd from './TerminalCmd'

export default function Projects() {
  const [tab, setTab] = useState('featured')
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activity, setActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)

  useEffect(() => {
    if (tab === 'opensource') {
      if (repos.length === 0) {
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
      if (activity.length === 0) {
        setActivityLoading(true)
        fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`)
          .then(r => r.json())
          .then(data => {
            if (!Array.isArray(data)) { setActivityLoading(false); return }
            const counts = {}
            const now = new Date()
            for (let i = 29; i >= 0; i--) {
              const d = new Date(now)
              d.setDate(now.getDate() - i)
              counts[d.toISOString().slice(0, 10)] = 0
            }
            data.forEach(e => {
              if (e.type === 'PushEvent') {
                const day = e.created_at?.slice(0, 10)
                if (day && counts[day] !== undefined) {
                  counts[day] += e.payload?.commits?.length || 1
                }
              }
            })
            setActivity(Object.entries(counts).map(([date, count]) => ({ date, count })))
            setActivityLoading(false)
          })
          .catch(() => setActivityLoading(false))
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, repos.length, activity.length])

  return (
    <section id="projects" style={{ padding: '100px max(24px, calc((100vw - 900px) / 2))', borderTop: '1px solid var(--border)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <TerminalCmd cmd="ls ./projects" />
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '32px', letterSpacing: '-0.01em' }}>projects</h2>

        <div style={{ display: 'flex', gap: '4px', marginBottom: '36px', background: 'var(--surface)', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border)' }}>
          <TabBtn active={tab === 'featured'}   onClick={() => setTab('featured')}   icon={<Sparkle size={13} />} label="Featured" />
          <TabBtn active={tab === 'opensource'} onClick={() => setTab('opensource')} icon={<Code    size={13} />} label="Open Source" />
        </div>

        {tab === 'featured' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(380px, 100%), 1fr))', gap: '16px' }}>
            {manualProjects.length === 0
              ? <EmptyState label="No featured projects yet." />
              : manualProjects.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                  <FeaturedCard project={p} />
                </motion.div>
              ))
            }
          </div>
        )}

        {tab === 'opensource' && (
          <div>
            <ActivityGraph data={activity} loading={activityLoading} />
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', padding: '48px 0' }}>
                <CircleNotch size={16} className="spin" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>fetching repos...</span>
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
    </section>
  )
}

function ActivityGraph({ data, loading }) {
  const BAR_W = 10
  const BAR_GAP = 4
  const H = 48
  const LABEL_H = 20
  const max = Math.max(...data.map(d => d.count), 1)
  const totalW = data.length > 0 ? data.length * (BAR_W + BAR_GAP) - BAR_GAP : 0

  const formatDate = (iso) => {
    const d = new Date(iso)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div style={{ marginBottom: '28px', padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>commit activity · last 30 days</span>
        {!loading && data.length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)' }}>
            {data.reduce((s, d) => s + d.count, 0)} commits
          </span>
        )}
      </div>
      {loading && (
        <div style={{ height: `${H}px`, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
          <CircleNotch size={13} className="spin" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>loading activity...</span>
        </div>
      )}
      {!loading && data.length === 0 && (
        <div style={{ height: `${H}px`, display: 'flex', alignItems: 'center', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>no activity data</div>
      )}
      {!loading && data.length > 0 && (
        <svg
          viewBox={`0 0 ${totalW} ${H + LABEL_H}`}
          width="100%"
          style={{ display: 'block' }}
          role="img"
          aria-label="Commit activity over last 30 days"
        >
          {data.map((d, i) => {
            const barH = d.count === 0 ? 2 : Math.max(4, Math.round((d.count / max) * H))
            const x = i * (BAR_W + BAR_GAP)
            const y = H - barH
            const isFirst = i === 0
            const isLast = i === data.length - 1
            const isMid = i === Math.floor(data.length / 2)
            const showLabel = isFirst || isLast || isMid
            return (
              <g key={d.date}>
                <title>{`${formatDate(d.date)}: ${d.count} commit${d.count !== 1 ? 's' : ''}`}</title>
                <rect x={x} y={y} width={BAR_W} height={barH} rx={3}
                  fill={d.count === 0 ? 'var(--border)' : 'var(--accent)'}
                  opacity={d.count === 0 ? 0.5 : Math.max(0.35, d.count / max)}
                />
                {showLabel && (
                  <text x={x + BAR_W / 2} y={H + 14}
                    textAnchor={isFirst ? 'start' : isLast ? 'end' : 'middle'}
                    fontSize="9" fill="var(--muted)" fontFamily="var(--font-mono)"
                  >
                    {formatDate(d.date)}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      )}
    </div>
  )
}

function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`tab-btn${active ? ' tab-btn--active' : ''}`}>
      {icon}{label}
    </button>
  )
}

function FeaturedCard({ project }) {
  return (
    <div className="project-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '0.97rem', fontWeight: 600, color: 'var(--text)' }}>{project.name}</h3>
        <span style={{ padding: '2px 9px', background: 'color-mix(in srgb, var(--accent) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)', borderRadius: '999px', fontSize: '0.65rem', color: 'var(--accent)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0 }}>featured</span>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: '0.875rem', fontFamily: 'var(--font-body)', lineHeight: 1.65, flex: 1 }}>{project.description}</p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {project.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
      </div>
      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
        {project.github && (
          <a href={project.github} target="_blank" rel="noopener noreferrer" className="card-link card-link--ghost">
            <GithubLogo size={13} /> source
          </a>
        )}
        {project.live && (
          <a href={project.live} target="_blank" rel="noopener noreferrer" className="card-link card-link--solid">
            <ArrowSquareOut size={13} /> live demo
          </a>
        )}
      </div>
    </div>
  )
}

function RepoCard({ repo }) {
  const langColors = { JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5', 'C++': '#f34b7d', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Go: '#00add8', Rust: '#dea584' }
  return (
    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="repo-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent)' }}>{repo.name}</span>
        <GithubLogo size={13} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: '2px' }} />
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
