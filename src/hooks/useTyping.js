// Typing animation hook with two modes:
// loop: false (default) — one-shot, types once then stops (cursor disappears)
// loop: true            — types out, pauses, erases, repeats forever
//
// Options: speed (ms/char type), eraseSpeed (ms/char erase), pauseAfter (ms hold), delay (ms before start)
import { useState, useEffect, useRef } from 'react'

export function useTyping(text, { speed = 42, eraseSpeed = 22, pauseAfter = 1600, delay = 0, loop = false } = {}) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)        // true when one-shot finishes
  const [erasing, setErasing] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    setErasing(false)

    let i = 0
    let phase = 'typing' // 'typing' | 'pausing' | 'erasing' | 'waiting'

    const clear = () => clearTimeout(timeoutRef.current)

    function tick() {
      if (phase === 'typing') {
        if (i < text.length) {
          i++
          setDisplayed(text.slice(0, i))
          timeoutRef.current = setTimeout(tick, speed)
        } else {
          // Finished typing
          if (!loop) {
            setDone(true)
            return
          }
          phase = 'pausing'
          timeoutRef.current = setTimeout(tick, pauseAfter)
        }
      } else if (phase === 'pausing') {
        phase = 'erasing'
        setErasing(true)
        tick()
      } else if (phase === 'erasing') {
        if (i > 0) {
          i--
          setDisplayed(text.slice(0, i))
          timeoutRef.current = setTimeout(tick, eraseSpeed)
        } else {
          // Finished erasing
          phase = 'waiting'
          setErasing(false)
          timeoutRef.current = setTimeout(tick, 400)
        }
      } else if (phase === 'waiting') {
        phase = 'typing'
        tick()
      }
    }

    timeoutRef.current = setTimeout(tick, delay)
    return clear
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, loop])

  return { displayed, done, erasing }
}
