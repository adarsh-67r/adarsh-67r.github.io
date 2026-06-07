import { useRef } from 'react'
import { SkipBack, SkipForward, Play, Pause, MusicNote } from '@phosphor-icons/react'
import { useMusic, PLAYLIST } from '../context/MusicContext'

export default function MusicPlayer() {
  const { index, playing, progress, togglePlay, next, prev, seek } = useMusic()
  const track = PLAYLIST[index]

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    seek(((e.clientX - rect.left) / rect.width) * 100)
  }

  return (
    <div className="music-pill" title={track.title}>
      {/* screen-reader live region announces track changes */}
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}
      >
        {playing ? `Now playing: ${track.title}` : `Paused: ${track.title}`}
      </span>

      <MusicNote
        size={12}
        aria-hidden="true"
        style={{
          color: playing ? 'var(--accent)' : 'var(--muted)',
          flexShrink: 0,
          animation: playing ? 'musicBounce 0.8s ease-in-out infinite alternate' : 'none',
        }}
      />

      <span className={`music-track${playing ? ' music-track--playing' : ''}`}>
        {track.title}
      </span>

      <div
        className="music-bar"
        onClick={handleSeek}
        title="seek"
        role="slider"
        aria-label="Playback progress"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="music-bar__fill" style={{ width: `${progress}%` }} />
      </div>

      <button className="music-btn" onClick={prev} aria-label="Previous track">
        <SkipBack size={12} weight="fill" />
      </button>

      <button
        className={`music-btn${playing ? ' music-btn--play' : ''}`}
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? <Pause size={12} weight="fill" /> : <Play size={12} weight="fill" />}
      </button>

      <button className="music-btn" onClick={next} aria-label="Next track">
        <SkipForward size={12} weight="fill" />
      </button>
    </div>
  )
}
