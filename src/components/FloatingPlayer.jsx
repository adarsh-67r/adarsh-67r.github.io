import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipBack, SkipForward, MusicNote, X } from '@phosphor-icons/react'
import { useMusic, PLAYLIST } from '../context/MusicContext'

export default function FloatingPlayer() {
  const { index, playing, progress, togglePlay, next, prev, seek } = useMusic()
  const [expanded, setExpanded] = useState(false)
  const [seekHover, setSeekHover]   = useState(false)
  const panelRef = useRef(null)
  const track = PLAYLIST[index]

  // close panel on outside click
  useEffect(() => {
    if (!expanded) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handler)
    document.addEventListener('touchstart', handler, { passive: true })
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('touchstart', handler)
    }
  }, [expanded])

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 90,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '10px',
      }}
    >
      {/* expanded panel — appears above FAB */}
      {expanded && (
        <div
          style={{
            background: 'color-mix(in srgb, var(--surface) 80%, transparent)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid color-mix(in srgb, var(--accent) 22%, var(--border))',
            borderRadius: '16px',
            boxShadow: '0 8px 40px color-mix(in srgb, var(--bg) 60%, transparent)',
            padding: '14px 16px',
            minWidth: '220px',
            animation: 'fabPanelIn 0.22s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          {/* track title */}
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            color: 'var(--text)',
            marginBottom: '10px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}>
            <MusicNote
              size={11}
              style={{
                color: playing ? 'var(--accent)' : 'var(--muted)',
                flexShrink: 0,
                animation: playing ? 'musicBounce 0.8s ease-in-out infinite alternate' : 'none',
              }}
              aria-hidden="true"
            />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {track.title}
            </span>
          </div>

          {/* progress bar */}
          <div
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              seek(((e.clientX - rect.left) / rect.width) * 100)
            }}
            onMouseEnter={() => setSeekHover(true)}
            onMouseLeave={() => setSeekHover(false)}
            title="seek"
            style={{
              position: 'relative',
              width: '100%',
              height: seekHover ? '6px' : '3px',
              background: 'color-mix(in srgb, var(--border) 80%, transparent)',
              borderRadius: '999px',
              cursor: 'pointer',
              marginBottom: '12px',
              transition: 'height 0.15s',
            }}
          >
            <div style={{
              position: 'absolute', left: 0, top: 0, bottom: 0,
              width: `${progress}%`,
              background: 'var(--accent)',
              borderRadius: '999px',
              transition: 'width 0.1s linear',
            }} />
          </div>

          {/* controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
            <button
              onClick={prev}
              aria-label="Previous"
              style={CTRL_BTN}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              <SkipBack size={14} weight="fill" />
            </button>

            <button
              onClick={togglePlay}
              aria-label={playing ? 'Pause' : 'Play'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '34px', height: '34px', borderRadius: '50%',
                background: 'var(--accent)',
                border: 'none', cursor: 'pointer',
                color: 'var(--bg)',
                transition: 'transform 0.15s, opacity 0.15s',
                flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.opacity = '0.9' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.opacity = '1'   }}
            >
              {playing ? <Pause size={14} weight="fill" /> : <Play size={14} weight="fill" />}
            </button>

            <button
              onClick={next}
              aria-label="Next"
              style={CTRL_BTN}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
            >
              <SkipForward size={14} weight="fill" />
            </button>
          </div>
        </div>
      )}

      {/* circular FAB */}
      <button
        onClick={() => setExpanded(p => !p)}
        aria-label={expanded ? 'Close player' : 'Open music player'}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          background: expanded
            ? 'color-mix(in srgb, var(--accent) 18%, var(--surface))'
            : 'color-mix(in srgb, var(--surface) 75%, transparent)',
          border: `1px solid ${
            expanded
              ? 'color-mix(in srgb, var(--accent) 45%, transparent)'
              : 'color-mix(in srgb, var(--accent) 22%, var(--border))'
          }`,
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          boxShadow: playing
            ? '0 0 0 2px color-mix(in srgb, var(--accent) 35%, transparent), 0 4px 20px color-mix(in srgb, var(--bg) 50%, transparent)'
            : '0 4px 20px color-mix(in srgb, var(--bg) 50%, transparent)',
          color: playing ? 'var(--accent)' : 'var(--muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
          flexShrink: 0,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.08)'
          e.currentTarget.style.borderColor = 'color-mix(in srgb, var(--accent) 55%, transparent)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)'
          e.currentTarget.style.borderColor = expanded
            ? 'color-mix(in srgb, var(--accent) 45%, transparent)'
            : 'color-mix(in srgb, var(--accent) 22%, var(--border))'
        }}
      >
        {expanded
          ? <X size={18} aria-hidden="true" />
          : playing
            ? <Pause size={18} weight="fill" aria-hidden="true" />
            : <MusicNote size={18} weight="fill" aria-hidden="true" />
        }
      </button>

      <style>{`
        @keyframes fabPanelIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)  scale(1); }
        }
      `}</style>
    </div>
  )
}

const CTRL_BTN = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  width: '30px', height: '30px', borderRadius: '50%',
  background: 'none', border: 'none',
  color: 'var(--muted)', cursor: 'pointer',
  transition: 'color 0.15s',
  flexShrink: 0,
}
