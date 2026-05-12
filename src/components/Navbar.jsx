import { useState, useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Palette, ChevronDown, Check, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'home',     to: '/',         section: null       },
  { label: 'projects', to: '/projects', section: 'projects' },
  { label: 'posts',    to: '/posts',    section: null       },
  { label: 'contact',  to: '/contact',  section: 'contact'  },
]

// Sections that exist on the homepage (in order)
const HOME_SECTIONS = ['hero', 'about', 'projects', 'contact']

export default function Navbar() {
  const { currentTheme, setCurrentTheme, themes } = useTheme()
  const [scrolled, setScrolled]         = useState(false)
  const [themeOpen, setThemeOpen]       = useState(false)
  const [mobileOpen, setMobileOpen]     = useState(false)
  const [search, setSearch]             = useState('')
  const [activeSection, setActiveSection] = useState('hero')
  const dropdownRef = useRef(null)
  const navRef      = useRef(null)
  const searchRef   = useRef(null)
  const location    = useLocation()
  const navigate    = useNavigate()
  const isHome      = location.pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // IntersectionObserver for home section highlight
  useEffect(() => {
    if (!isHome) return
    const observers = []
    const sectionVisibility = {}

    HOME_SECTIONS.forEach(id => {
      const el = document.getElementById(id)
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => {
          sectionVisibility[id] = entry.isIntersecting
          // pick the first visible section in order
          const visible = HOME_SECTIONS.find(s => sectionVisibility[s])
          if (visible) setActiveSection(visible)
        },
        { threshold: 0.25 }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach(o => o.disconnect())
  }, [isHome])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  useEffect(() => {
    const onClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setThemeOpen(false); setSearch('')
      }
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('touchstart', onClick, { passive: true })
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('touchstart', onClick)
    }
  }, [])

  useEffect(() => {
    const onKey = (e) => {
      const tag = e.target.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable

      if ((e.key === 't' || e.key === 'T') && !typing) {
        e.preventDefault()
        setThemeOpen(prev => {
          if (!prev) setMobileOpen(false)
          return !prev
        })
        setSearch('')
      }

      if (e.key === 'Escape') {
        setThemeOpen(false)
        setSearch('')
        if (searchRef.current) searchRef.current.blur()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (themeOpen && searchRef.current) {
      const t = setTimeout(() => searchRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [themeOpen])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const filtered    = themes.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
  const darkThemes  = filtered.filter(t => t.dark)
  const lightThemes = filtered.filter(t => !t.dark)
  const active      = themes.find(t => t.value === currentTheme)

  const isActive = (link) => {
    if (!isHome) {
      // on non-home pages: match by pathname
      if (link.to === '/posts') return location.pathname.startsWith('/posts')
      return location.pathname === link.to
    }
    // on home: highlight nav link whose section is visible
    if (link.to !== '/') {
      return link.section ? activeSection === link.section : false
    }
    // 'home' link: active when no other section is active
    return activeSection === 'hero' || activeSection === 'about'
  }

  const glassOn = scrolled || mobileOpen

  const handleNameClick = (e) => {
    e.preventDefault()
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      navigate('/')
    }
  }

  return (
    <>
      <nav ref={navRef} style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: glassOn ? 'color-mix(in srgb, var(--surface) 55%, transparent)' : 'transparent',
        backdropFilter:       glassOn ? 'blur(22px) saturate(180%)' : 'none',
        WebkitBackdropFilter: glassOn ? 'blur(22px) saturate(180%)' : 'none',
        borderBottom: glassOn ? '1px solid color-mix(in srgb, var(--accent) 18%, var(--border))' : '1px solid transparent',
        boxShadow: glassOn ? '0 1px 0 color-mix(in srgb, var(--accent) 8%, transparent), 0 8px 32px color-mix(in srgb, var(--bg) 55%, transparent)' : 'none',
        transition: 'background 0.4s ease, border-color 0.4s ease, box-shadow 0.4s ease',
      }}>
        <div style={{
          padding: '0 max(24px, calc((100vw - 900px) / 2))',
          height: scrolled ? '50px' : '56px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'height 0.3s ease',
        }}>
          <a href="/" onClick={handleNameClick} style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '1.35rem', fontWeight: 400, color: 'var(--accent)', textDecoration: 'none', lineHeight: 1 }}>Adarsh</a>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-nav">
            {NAV_LINKS.map((link) => {
              const active = isActive(link)
              return (
                <Link key={link.to} to={link.to} style={{
                  padding: '6px 14px', borderRadius: '7px', textDecoration: 'none',
                  fontFamily: 'var(--font-mono)', fontSize: '0.8rem',
                  color:      active ? 'var(--accent)' : 'var(--muted)',
                  background: active ? 'color-mix(in srgb, var(--accent) 12%, transparent)' : 'transparent',
                  border:     active ? '1px solid color-mix(in srgb, var(--accent) 30%, transparent)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'color-mix(in srgb, var(--text) 6%, transparent)' }}}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = 'var(--muted)'
                      e.currentTarget.style.background = 'transparent'
                    } else {
                      e.currentTarget.style.color = 'var(--accent)'
                      e.currentTarget.style.background = 'color-mix(in srgb, var(--accent) 12%, transparent)'
                    }
                  }}
                >{link.label}</Link>
              )
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => { setThemeOpen(prev => !prev); setMobileOpen(false); setSearch('') }}
                aria-label={`Theme: ${active?.name || 'select theme'}`}
                title={`${active?.name || 'Theme'} — press T`}
                style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 10px', background: 'color-mix(in srgb, var(--surface) 60%, transparent)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', cursor: 'pointer', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--muted)' }}
              >
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: active?.accent || 'var(--accent)', display: 'inline-block', flexShrink: 0 }} aria-hidden="true" />
                <Palette size={13} aria-hidden="true" />
                <ChevronDown size={11} style={{ transform: themeOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} aria-hidden="true" />
              </button>

              {themeOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '220px', maxHeight: '380px', background: 'color-mix(in srgb, var(--surface) 75%, transparent)', backdropFilter: 'blur(28px) saturate(180%)', WebkitBackdropFilter: 'blur(28px) saturate(180%)', border: '1px solid color-mix(in srgb, var(--accent) 18%, var(--border))', borderRadius: '12px', boxShadow: '0 20px 60px color-mix(in srgb, var(--bg) 75%, transparent)', overflow: 'hidden', display: 'flex', flexDirection: 'column', zIndex: 200, animation: 'dropdownIn 0.18s cubic-bezier(0.16,1,0.3,1)' }}>
                  <div style={{ padding: '10px', borderBottom: '1px solid var(--border)' }}>
                    <input
                      ref={searchRef}
                      placeholder="search themes..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Escape') {
                          e.stopPropagation()
                          setThemeOpen(false)
                          setSearch('')
                          e.currentTarget.blur()
                        }
                      }}
                      aria-label="Search themes"
                      style={{ width: '100%', padding: '6px 10px', background: 'color-mix(in srgb, var(--bg) 70%, transparent)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', outline: 'none' }}
                    />
                  </div>
                  <div style={{ padding: '6px 12px 4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.62rem', color: 'var(--muted)', fontFamily: 'var(--font-mono)', letterSpacing: '0.06em' }}>press T to toggle</span>
                    <kbd style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--muted)', background: 'color-mix(in srgb, var(--text) 8%, transparent)', border: '1px solid var(--border)', borderRadius: '3px', padding: '1px 5px' }}>T</kbd>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1 }}>
                    {darkThemes.length > 0 && (<>
                      <div style={{ padding: '6px 12px 2px', fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>Dark</div>
                      {darkThemes.map(t => <ThemeOption key={t.value} theme={t} current={currentTheme} onSelect={v => { setCurrentTheme(v); setThemeOpen(false); setSearch('') }} />)}
                    </>)}
                    {lightThemes.length > 0 && (<>
                      <div style={{ padding: '6px 12px 2px', fontSize: '0.65rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>Light</div>
                      {lightThemes.map(t => <ThemeOption key={t.value} theme={t} current={currentTheme} onSelect={v => { setCurrentTheme(v); setThemeOpen(false); setSearch('') }} />)}
                    </>)}
                    {filtered.length === 0 && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>no themes found</div>}
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => { setMobileOpen(!mobileOpen); setThemeOpen(false) }} className="hamburger" aria-label="Toggle menu"
              style={{ display: 'none', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', background: 'color-mix(in srgb, var(--surface) 60%, transparent)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', cursor: 'pointer', backdropFilter: 'blur(8px)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)';  e.currentTarget.style.color = 'var(--muted)' }}
            >
              {mobileOpen ? <X size={17} aria-hidden="true" /> : <Menu size={17} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <div style={{ maxHeight: mobileOpen ? '400px' : '0', overflow: 'hidden', transition: 'max-height 0.35s cubic-bezier(0.4,0,0.2,1)', borderTop: mobileOpen ? '1px solid color-mix(in srgb, var(--accent) 15%, var(--border))' : '1px solid transparent' }}>
          <div style={{ padding: '12px max(24px, calc((100vw - 900px) / 2)) 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {NAV_LINKS.map((link) => {
              const active = isActive(link)
              return (
                <Link key={link.to} to={link.to}
                  style={{ padding: '10px 14px', borderRadius: '8px', textDecoration: 'none', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', color: active ? 'var(--accent)' : 'var(--text)', background: active ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent', border: active ? '1px solid color-mix(in srgb, var(--accent) 25%, transparent)' : '1px solid transparent', transition: 'all 0.15s', display: 'block' }}
                >{active ? '> ' : '  '}{link.label}</Link>
              )
            })}
          </div>
        </div>
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          .hamburger   { display: flex !important; }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
      `}</style>
    </>
  )
}

function ThemeOption({ theme, current, onSelect }) {
  const isActive = theme.value === current
  return (
    <button onClick={() => onSelect(theme.value)}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 12px', background: isActive ? 'color-mix(in srgb, var(--accent) 10%, transparent)' : 'transparent', border: 'none', color: isActive ? 'var(--accent)' : 'var(--text)', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'var(--font-mono)', textAlign: 'left', transition: 'background 0.15s' }}
      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'color-mix(in srgb, var(--text) 6%, transparent)' }}
      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: theme.accent, flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }} aria-hidden="true" />
      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{theme.name}</span>
      {isActive && <Check size={12} aria-hidden="true" />}
    </button>
  )
}
