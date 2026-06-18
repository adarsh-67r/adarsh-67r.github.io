import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowSquareOut, Star, GitFork, CircleNotch,
  Sparkle, Code, GithubLogo, Eye, GitBranch,
  Clock, Warning, ArrowClockwise,
} from '@phosphor-icons/react'
import { manualProjects, GITHUB_USERNAME } from '../data/projects'
import TagBadge from './TagBadge'
import TerminalCmd from './TerminalCmd'

const LANG_COLORS = {
  JavaScript: '#f7df1e', TypeScript: '#3178c6', Python: '#3572a5',
  'C++': '#f34b7d', C: '#555555', Java: '#b07219', Kotlin: '#a97bff',
  HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Bash: '#89e051',
  Go: '#00add8', Rust: '#dea584', Ruby: '#701516', Swift: '#f05138',
  Dart: '#00b4ab', Lua: '#000080', Nix: '#7e7eff', Zig: '#ec915c',
}

const CACHE_KEY = `gh_cache_${GITHUB_USERNAME}`
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function timeAgo(iso) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  const weeks = Math.floor(days / 7)
  const months= Math.floor(days / 30)
  const years = Math.floor(days / 365)
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 7)   return `${days}d ago`
  if (weeks < 5)   return `${weeks}w ago`
  if (months< 12)  return `${months}mo ago`
  return `${years}y ago`
}

function readCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, profile, repos } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL) return null
    return { profile, repos }
  } catch {
    return null
  }
}

function writeCache(profile, repos) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), profile, repos }))
  } catch { /* quota exceeded — silently ignore */ }
}

const GH_HEADERS = {
  Accept: 'application/vnd.github+json',
  'X-GitHub-Api-Version': '2022-11-28',
}

async function ghFetch(url) {
  const res = await fetch(url, { headers: GH_HEADERS })
  if (res.status === 403 || res.status === 429) {
    const reset = res.headers.get('x-ratelimit-reset')
    const waitSecs = reset ? Math.ceil((Number(reset) * 1000 - Date.now()) / 1000) : null
    throw Object.assign(new Error('rate_limit'), { resetIn: waitSecs })
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export default function Projects() {
  const [tab, setTab] = useState('featured')
  const [repos, setRepos] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)   // { msg, resetIn? }
  const [sort, setSort] = useState('stars')
  const [langFilter, setLangFilter] = useState('all')

  const fetchData = useCallback((force = false) => {
    if (!force) {
      const cached = readCache()
      if (cached) {
        setProfile(cached.profile)
        setRepos(cached.repos.filter(r => !r.fork))
        return
      }
    }

    setLoading(true)
    setError(null)

    Promise.all([
      ghFetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
      ghFetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&type=public&sort=pushed`),
    ])
      .then(([prof, data]) => {
        if (!Array.isArray(data)) throw new Error('Unexpected response from GitHub.')
        const filtered = data.filter(r => !r.fork)
        writeCache(prof, data)
        setProfile(prof)
        setRepos(filtered)
        setLoading(false)
      })
      .catch(err => {
        if (err.message === 'rate_limit') {
          const mins = err.resetIn ? Math.ceil(err.resetIn / 60) : null
          setError({
            msg: mins
              ? `GitHub API rate limit hit. Resets in ~${mins} min.`
              : 'GitHub API rate limit hit. Try again in a few minutes.',
            resetIn: err.resetIn,
          })
        } else {
          setError({ msg: 'Failed to load repos. Check your connection and retry.' })
        }
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (tab !== 'opensource') return
    if (repos.length > 0 || loading) return
    fetchData()
  }, [tab, repos.length, loading, fetchData])

  const langs = ['all', ...Array.from(new Set(repos.map(r => r.language).filter(Boolean))).sort()]

  const filtered = repos
    .filter(r => langFilter === 'all' || r.language === langFilter)
    .slice()
    .sort((a, b) => {
      if (sort === 'stars')   return b.stargazers_count - a.stargazers_count
      if (sort === 'updated') return new Date(b.pushed_at) - new Date(a.pushed_at)
      return a.name.localeCompare(b.name)
    })

  return (
    <section id="projects" style={{ padding: '100px max(24px, calc((100vw - 900px) / 2))', borderTop: '1px solid var(--border)' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
        <TerminalCmd cmd="ls ./projects" />
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 400, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '32px', letterSpacing: '-0.01em' }}>projects</h2>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '36px', background: 'var(--surface)', padding: '4px', borderRadius: '10px', width: 'fit-content', border: '1px solid var(--border)' }}>
          <TabBtn active={tab === 'featured'}   onClick={() => setTab('featured')}   icon={<Sparkle size={13} />} label="Featured" />
          <TabBtn active={tab === 'opensource'} onClick={() => setTab('opensource')} icon={<Code    size={13} />} label="Open Source" />
        </div>

        {/* ── Featured ── */}
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

        {/* ── Open Source ── */}
        {tab === 'opensource' && (
          <div>
            {/* Profile strip */}
            {profile && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: '10px', marginBottom: '20px', flexWrap: 'wrap',
                }}
              >
                <img
                  src={profile.avatar_url}
                  alt={profile.login}
                  width={32} height={32}
                  loading="lazy"
                  style={{ borderRadius: '50%', border: '1px solid var(--border)', flexShrink: 0 }}
                />
                <a
                  href={profile.html_url}
                  target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}
                >
                  @{profile.login}
                </a>
                <div style={{ display: 'flex', gap: '16px', marginLeft: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
                  {[
                    { label: 'repos',     val: profile.public_repos },
                    { label: 'followers', val: profile.followers },
                    { label: 'following', val: profile.following },
                  ].map(({ label, val }) => (
                    <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)' }}>
                      <span style={{ color: 'var(--text)', fontWeight: 600 }}>{val}</span> {label}
                    </span>
                  ))}
                  <button
                    onClick={() => { setRepos([]); setProfile(null); fetchData(true) }}
                    title="Refresh"
                    style={{
                      background: 'none', border: '1px solid var(--border)', borderRadius: '6px',
                      padding: '3px 7px', cursor: 'pointer', color: 'var(--muted)',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    <ArrowClockwise size={12} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Controls */}
            {!loading && !error && repos.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '3px', background: 'var(--surface)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  {[['stars','Stars'],['updated','Recent'],['name','A–Z']].map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => setSort(v)}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer',
                        fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
                        background: sort === v ? 'var(--accent)' : 'transparent',
                        color: sort === v ? 'var(--bg)' : 'var(--muted)',
                        transition: 'all 0.15s',
                      }}
                    >{l}</button>
                  ))}
                </div>

                {langs.length > 2 && (
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {langs.map(l => (
                      <button
                        key={l}
                        onClick={() => setLangFilter(l)}
                        style={{
                          padding: '4px 10px', borderRadius: '999px', border: '1px solid var(--border)',
                          cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
                          background: langFilter === l
                            ? 'color-mix(in srgb, var(--accent) 15%, var(--surface))'
                            : 'var(--surface)',
                          color: langFilter === l ? 'var(--accent)' : 'var(--muted)',
                          transition: 'all 0.15s',
                          display: 'flex', alignItems: 'center', gap: '5px',
                        }}
                      >
                        {l !== 'all' && (
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: LANG_COLORS[l] || 'var(--muted)', display: 'inline-block', flexShrink: 0 }} />
                        )}
                        {l}
                      </button>
                    ))}
                  </div>
                )}

                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--muted)' }}>
                  {filtered.length} repo{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* States */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', padding: '48px 0' }}>
                <CircleNotch size={16} className="spin" />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>fetching repos...</span>
              </div>
            )}
            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 0', color: 'var(--muted)', flexWrap: 'wrap' }}>
                <Warning size={15} style={{ flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{error.msg}</span>
                <button
                  onClick={() => fetchData(true)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    padding: '4px 10px', borderRadius: '6px',
                    border: '1px solid var(--border)', cursor: 'pointer',
                    background: 'var(--surface)', color: 'var(--muted)',
                    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
                  }}
                >
                  <ArrowClockwise size={11} /> retry
                </button>
              </div>
            )}
            {!loading && !error && filtered.length === 0 && repos.length > 0 && (
              <EmptyState label={`No ${langFilter} repos found.`} />
            )}
            {!loading && !error && repos.length === 0 && !loading && (
              <EmptyState label="No public repos found." />
            )}

            {/* Grid */}
            {!loading && !error && filtered.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '12px' }}>
                {filtered.map((repo, i) => (
                  <motion.div
                    key={repo.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  >
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

// ── Repo Card ──────────────────────────────────────────────────────────────
function RepoCard({ repo }) {
  const ago = timeAgo(repo.pushed_at)
  const topics = repo.topics?.slice(0, 3) || []

  return (
    <a
      href={repo.html_url}
      target="_blank" rel="noopener noreferrer"
      className="repo-card"
      style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', fontWeight: 600, color: 'var(--accent)', wordBreak: 'break-word' }}>
          {repo.name}
        </span>
        <GithubLogo size={13} style={{ color: 'var(--muted)', flexShrink: 0, marginTop: '2px' }} />
      </div>

      {repo.description && (
        <p style={{
          color: 'var(--muted)', fontSize: '0.78rem',
          fontFamily: 'var(--font-body)', lineHeight: 1.55,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
          margin: 0,
        }}>
          {repo.description}
        </p>
      )}

      {topics.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {topics.map(t => (
            <span key={t} style={{
              padding: '1px 7px', borderRadius: '999px',
              background: 'color-mix(in srgb, var(--accent) 10%, var(--surface))',
              border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)',
              color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
            }}>{t}</span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', flexWrap: 'wrap', alignItems: 'center' }}>
        {repo.language && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: LANG_COLORS[repo.language] || 'var(--muted)', flexShrink: 0 }} />
            {repo.language}
          </span>
        )}
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--muted)' }}>
          <Star size={11} />{repo.stargazers_count}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--muted)' }}>
          <GitFork size={11} />{repo.forks_count}
        </span>
        {repo.watchers_count > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--muted)' }}>
            <Eye size={11} />{repo.watchers_count}
          </span>
        )}
        {repo.open_issues_count > 0 && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--muted)' }}>
            <GitBranch size={11} />{repo.open_issues_count}
          </span>
        )}
        {ago && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.7rem', color: 'var(--muted)', marginLeft: 'auto' }}>
            <Clock size={11} />{ago}
          </span>
        )}
      </div>
    </a>
  )
}

// ── Featured Card ──────────────────────────────────────────────────────────
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

// ── Shared ─────────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon, label }) {
  return (
    <button onClick={onClick} className={`tab-btn${active ? ' tab-btn--active' : ''}`}>
      {icon}{label}
    </button>
  )
}

function EmptyState({ label }) {
  return <div style={{ padding: '60px 0', color: 'var(--muted)', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }}>{label}</div>
}
