import { useState } from 'react'
import { SkipBack, SkipForward, Play, Pause, MusicNote } from '@phosphor-icons/react'
import { useMusic, PLAYLIST } from '../context/MusicContext'

export default function MusicPlayer() {
  const { index, playing, progress, togglePlay, next, prev, seek } = useMusic()
  const [hovered, setHovered] = useState(false)
  const [seekHover, setSeekHover] = useState(false)
  const track = PLAYLIST[index]

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 10px',
        background: hovered
          ? 'color-mix(in srgb, var(--accent) 10%, var(--surface))'
          : 'color-mix(in srgb, var(--surface) 60%, transparent)',
        border: `1px solid ${ hovered
          ? 'color-mix(in srgb, var(--accent) 35%, transparent)'
          : 'var(--border)'}`,
        borderRadius: '999px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        transition: 'all 0.2s',
        minWidth: 0,
        maxWidth: '220px',
      }}
      title={track.title}
    >
      {/* music note icon — pulses when playing */}
      <MusicNote
        size={12}
        aria-hidden="true"
        style={{
          color: playing ? 'var(--accent)' : 'var(--muted)',
          flexShrink: 0,
          animation: playing ? 'musicBounce 0.8s ease-in-out infinite alternate' : 'none',
        }}
      />

      {/* track name */}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '0.7rem',
        color: playing ? 'var(--text)' : 'var(--muted)',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        maxWidth: '80px',
        flexShrink: 1,
        transition: 'color 0.2s',
      }}>
        {track.title}
      </span>

      {/* progress bar — click to seek */}
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
          width: '40px',
          height: seekHover ? '6px' : '3px',
          background: 'color-mix(in srgb, var(--border) 80%, transparent)',
          borderRadius: '999px',
          cursor: 'pointer',
          flexShrink: 0,
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

      {/* prev */}
      <button
        onClick={prev}
        aria-label="Previous track"
        style={BTN_STYLE}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <SkipBack size={12} weight="fill" />
      </button>

      {/* play / pause */}
      <button
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        style={{ ...BTN_STYLE, color: playing ? 'var(--accent)' : 'var(--muted)' }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
        onMouseLeave={e => e.currentTarget.style.color = playing ? 'var(--accent)' : 'var(--muted)'}
      >
        {playing ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
      </button>

      {/* next */}
      <button
        onClick={next}
        aria-label="Next track"
        style={BTN_STYLE}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        <SkipForward size={12} weight="fill" />
      </button>
    </div>
  )
}

const BTN_STYLE = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  background: 'none', border: 'none', padding: '2px',
  color: 'var(--muted)', cursor: 'pointer',
  transition: 'color 0.15s', flexShrink: 0,
}
