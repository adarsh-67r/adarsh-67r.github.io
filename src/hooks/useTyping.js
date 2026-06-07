// Typing animation hook with two modes:
// loop: false (default) — one-shot, types once then stops (cursor disappears)
// loop: true            — types out, pauses, erases, repeats forever
// texts (array)         — cycles through multiple strings when loop: true
//
// Options: speed (ms/char type), eraseSpeed (ms/char erase), pauseAfter (ms hold), delay (ms before start)
import { useState, useEffect, useRef } from 'react'

// Single-string overload: useTyping(text, options)
// Multi-string overload:  useTyping([text1, text2, ...], options) — loops through array
export function useTyping(textOrTexts, { speed = 42, eraseSpeed = 22, pauseAfter = 1600, delay = 0, loop = false } = {}) {
  const texts = Array.isArray(textOrTexts) ? textOrTexts : [textOrTexts]
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const [erasing, setErasing] = useState(false)
  const timeoutRef = useRef(null)
  const textIndexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    setErasing(false)
    textIndexRef.current = 0

    let i = 0
    let phase = 'typing'

    const clear = () => clearTimeout(timeoutRef.current)

    function currentText() {
      return texts[textIndexRef.current % texts.length]
    }

    function tick() {
      const text = currentText()

      if (phase === 'typing') {
        if (i < text.length) {
          i++
          setDisplayed(text.slice(0, i))
          timeoutRef.current = setTimeout(tick, speed)
        } else {
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
          // Advance to next text in array
          textIndexRef.current += 1
          i = 0
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
  }, [loop, speed, eraseSpeed, pauseAfter, delay])

  return { displayed, done, erasing }
}
