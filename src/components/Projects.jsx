import { useState, useEffect, useRef } from 'react'
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
  const [activity, setActivity] = useState({})
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
      if (Object.keys(activity).length === 0) {
        setActivityLoading(true)
        // Fetch up to 3 pages (300 events) to get ~1 year of data
        const pages = [1, 2, 3]
        Promise.all(
          pages.map(p =>
            fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100&page=${p}`)
              .then(r => r.ok ? r.json() : [])
              .catch(() => [])
          )
        ).then(results => {
          const counts = {}
          results.flat().forEach(e => {
            if (e.type === 'PushEvent' && e.created_at) {
              const day = e.created_at.slice(0, 10)
              counts[day] = (counts[day] || 0) + (e.payload?.commits?.length || 1)
            }
          })
          setActivity(counts)
          setActivityLoading(false)
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, repos.length])

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
            <ContributionGraph data={activity} loading={activityLoading} />
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

// ─── Contribution Heatmap ─────────────────────────────────────────────────────
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', '']
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function buildGrid() {
  // Build 53 weeks × 7 days ending today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Go back to the Sunday 52 weeks ago
  const start = new Date(today)
  start.setDate(start.getDate() - 364 - start.getDay())

  const weeks = []
  const cur = new Date(start)
  while (cur <= today) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const iso = cur.toISOString().slice(0, 10)
      week.push({ iso, future: cur > today })
      cur.setDate(cur.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

function getLevel(count) {
  if (!count || count === 0) return 0
  if (count <= 1) return 1
  if (count <= 3) return 2
  if (count <= 6) return 3
  return 4
}

function ContributionGraph({ data, loading }) {
  const weeks = buildGrid()
  const totalCommits = Object.values(data).reduce((s, v) => s + v, 0)
  const [tooltip, setTooltip] = useState(null)
  const containerRef = useRef(null)

  // Month labels: find first week of each month
  const monthLabels = []
  weeks.forEach((week, wi) => {
    const firstDay = week.find(d => !d.future)
    if (!firstDay) return
    const month = new Date(firstDay.iso).getMonth()
    if (wi === 0 || month !== new Date(weeks[wi - 1][0].iso).getMonth()) {
      monthLabels.push({ wi, label: MONTHS[month] })
    }
  })

  const CELL = 11   // cell size px
  const GAP  = 3    // gap px
  const STEP = CELL + GAP

  return (
    <div style={{ marginBottom: '28px', padding: '18px 20px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflowX: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.05em' }}>commit activity · last year</span>
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--accent)' }}>
              {totalCommits} commits
            </span>
            {/* Legend */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)' }}>less</span>
              {[0,1,2,3,4].map(l => (
                <div key={l} style={{
                  width: CELL, height: CELL, borderRadius: '2px', flexShrink: 0,
                  background: levelColor(l),
                  border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
                }} />
              ))}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--muted)' }}>more</span>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div style={{ height: '90px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--muted)' }}>
          <CircleNotch size={13} className="spin" />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>loading activity...</span>
        </div>
      )}

      {!loading && (
        <div style={{ position: 'relative' }}>
          {/* Tooltip */}
          {tooltip && (
            <div style={{
              position: 'fixed',
              left: tooltip.x,
              top: tooltip.y - 36,
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--text)',
              pointerEvents: 'none',
              zIndex: 999,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}>
              {tooltip.text}
            </div>
          )}

          <svg
            width={weeks.length * STEP}
            height={7 * STEP + 18}
            role="img"
            aria-label="GitHub-style contribution graph for the last year"
            style={{ display: 'block', minWidth: weeks.length * STEP }}
          >
            {/* Month labels */}
            {monthLabels.map(({ wi, label }) => (
              <text
                key={`m-${wi}`}
                x={wi * STEP}
                y={9}
                fontSize={9}
                fill="var(--muted)"
                fontFamily="var(--font-mono)"
              >{label}</text>
            ))}

            {/* Day labels */}
            {DAYS.map((d, di) => d ? (
              <text
                key={`d-${di}`}
                x={-22}
                y={18 + di * STEP + CELL * 0.85}
                fontSize={9}
                fill="var(--muted)"
                fontFamily="var(--font-mono)"
              >{d}</text>
            ) : null)}

            {/* Cells */}
            <g transform="translate(0, 14)">
              {weeks.map((week, wi) =>
                week.map((day, di) => {
                  if (day.future) return null
                  const count = data[day.iso] || 0
                  const level = getLevel(count)
                  return (
                    <rect
                      key={day.iso}
                      x={wi * STEP}
                      y={di * STEP}
                      width={CELL}
                      height={CELL}
                      rx={2}
                      fill={levelColor(level)}
                      style={{ cursor: 'pointer', transition: 'opacity 0.1s' }}
                      onMouseEnter={e => {
                        const rect = e.target.getBoundingClientRect()
                        const formatted = new Date(day.iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        setTooltip({
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                          text: count === 0 ? `No commits on ${formatted}` : `${count} commit${count !== 1 ? 's' : ''} on ${formatted}`,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    >
                      <title>{`${day.iso}: ${count} commit${count !== 1 ? 's' : ''}`}</title>
                    </rect>
                  )
                })
              )}
            </g>
          </svg>
        </div>
      )}
    </div>
  )
}

function levelColor(level) {
  // Uses CSS variables — accent color for filled cells, border for empty
  switch (level) {
    case 0: return 'color-mix(in srgb, var(--border) 80%, transparent)'
    case 1: return 'color-mix(in srgb, var(--accent) 25%, var(--surface))'
    case 2: return 'color-mix(in srgb, var(--accent) 45%, var(--surface))'
    case 3: return 'color-mix(in srgb, var(--accent) 70%, var(--surface))'
    case 4: return 'var(--accent)'
    default: return 'color-mix(in srgb, var(--border) 80%, transparent)'
  }
}
// ─────────────────────────────────────────────────────────────────────────────

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
