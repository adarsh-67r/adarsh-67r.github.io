import { createContext, useContext, useRef, useState, useEffect, useCallback } from 'react'

// ─── Edit your playlist here ────────────────────────────────────────────────
export const PLAYLIST = [
  { title: 'Full Bloom', src: '/music/Full Bloom (Inst.).mp3' },
  { title: 'Never Losing', src: encodeURI('/music/Never Losing - (Inst.).mp3') },
]
// ────────────────────────────────────────────────────────────────────────────

const MusicCtx = createContext(null)

export function MusicProvider({ children }) {
  const audioRef = useRef(null)
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)   // 0-100
  const [duration, setDuration] = useState(0)

  // Mount audio element once
  useEffect(() => {
    const audio = new Audio()
    audio.preload = 'metadata'
    audioRef.current = audio

    const onTimeUpdate = () => {
      if (audio.duration) setProgress((audio.currentTime / audio.duration) * 100)
    }
    const onLoaded = () => setDuration(audio.duration)
    const onEnded = () => next()

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('ended', onEnded)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load track whenever index changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const wasPlaying = playing
    audio.pause()
    audio.src = PLAYLIST[index].src
    audio.load()
    setProgress(0)
    if (wasPlaying) audio.play().catch(() => setPlaying(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false))
    }
  }, [playing])

  const next = useCallback(() => {
    setIndex(i => (i + 1) % PLAYLIST.length)
  }, [])

  const prev = useCallback(() => {
    const audio = audioRef.current
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0
      setProgress(0)
    } else {
      setIndex(i => (i - 1 + PLAYLIST.length) % PLAYLIST.length)
    }
  }, [])

  const seek = useCallback((pct) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    audio.currentTime = (pct / 100) * audio.duration
    setProgress(pct)
  }, [])

  return (
    <MusicCtx.Provider value={{ index, playing, progress, duration, togglePlay, next, prev, seek }}>
      {children}
    </MusicCtx.Provider>
  )
}

export const useMusic = () => useContext(MusicCtx)
