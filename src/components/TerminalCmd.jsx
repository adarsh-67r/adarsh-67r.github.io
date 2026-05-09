// Terminal command line with typing animation.
// loop=true  — types, pauses, erases, repeats forever (for section headers)
// loop=false — types once and cursor disappears (default)
import { useTyping } from '../hooks/useTyping'

export default function TerminalCmd({ cmd, delay = 0, loop = true, style = {} }) {
  const { displayed, done } = useTyping(cmd, { speed: 42, eraseSpeed: 22, pauseAfter: 1800, delay, loop })

  // Show cursor always when looping; only while typing in one-shot mode
  const showCursor = loop || !done

  return (
    <p style={{
      fontFamily: 'var(--font-mono)',
      color: 'var(--accent)',
      fontSize: '0.8rem',
      marginBottom: '8px',
      letterSpacing: '0.05em',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      userSelect: 'none',
      ...style,
    }}>
      <span style={{ opacity: 0.5 }}>$</span>
      <span> {displayed}</span>
      {showCursor && (
        <span style={{
          display: 'inline-block',
          width: '7px',
          height: '1em',
          background: 'var(--accent)',
          verticalAlign: 'text-bottom',
          animation: 'blink 1s step-end infinite',
          borderRadius: '1px',
        }} />
      )}
    </p>
  )
}
