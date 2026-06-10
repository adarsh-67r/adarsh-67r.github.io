import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GithubLogo, LinkedinLogo, Envelope, ArrowRight } from '@phosphor-icons/react'
import { Helmet } from 'react-helmet-async'
import TerminalCmd from '../components/TerminalCmd'

const SOCIALS = [
  { icon: GithubLogo,   label: 'GitHub',   handle: '@adarsh-67r',              href: 'https://github.com/adarsh-67r',             desc: 'Check out my code' },
  { icon: LinkedinLogo, label: 'LinkedIn', handle: 'linkedin.com/in/adarsh67',  href: 'https://www.linkedin.com/in/adarsh67',      desc: 'Connect professionally' },
  { icon: Envelope,     label: 'Email',    handle: 'adarshanshuman6@gmail.com', href: 'mailto:adarshanshuman6@gmail.com',           desc: 'For serious stuff' },
]

function PingOutput() {
  const [lines, setLines] = useState([])
  const timerRef = useRef(null)
  const seqRef = useRef(0)

  useEffect(() => {
    const header = ['PING adarsh (127.0.0.1) 56(84) bytes of data.']
    setLines(header)

    function addPing() {
      const seq = seqRef.current
      const ms  = (0.22 + Math.random() * 0.31).toFixed(3)
      const ttl = 64
      const line = `64 bytes from 127.0.0.1: icmp_seq=${seq} ttl=${ttl} time=${ms} ms`
      seqRef.current = seq + 1
      setLines(prev => {
        const next = [...prev, { text: line, key: seq }]
        if (next.length > 7) return [next[0], ...next.slice(-6)]
        return next
      })
      timerRef.current = setTimeout(addPing, 1000)
    }

    timerRef.current = setTimeout(addPing, 600)
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', lineHeight: 1.85, height: 'calc(7 * 1.85 * 0.72rem)', minHeight: '9em', overflow: 'hidden' }}>
      {lines.map((line, i) => {
        const isHeader = i === 0
        const text = isHeader ? line : line.text
        const key  = isHeader ? 'header' : line.key
        return (
          <div key={key} style={{ color: isHeader ? 'var(--accent)' : 'var(--muted)', opacity: isHeader ? 0.8 : i === lines.length - 1 ? 1 : 0.6 }}>
            {isHeader ? text : <><span style={{ color: 'var(--accent)', opacity: 0.35 }}>{'> '}</span>{text}</>}
          </div>
        )
      })}
    </div>
  )
}

export default function ContactPage() {
  return (
    <div style={{ padding: '120px max(24px, calc((100vw - 860px) / 2)) 80px' }}>
      <Helmet>
        <title>Contact — Adarsh</title>
        <meta name="description" content="Get in touch with Adarsh." />
        <meta property="og:title" content="Contact — Adarsh" />
      </Helmet>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        <TerminalCmd cmd="ping adarsh" loop={true} />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.01em' }}>get in touch</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px' }}>
          Have something interesting to say, a project idea, or just want to chat? I&apos;m usually reachable.
        </p>

        <div style={{ padding: '14px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} aria-hidden="true" />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#febc2e', display: 'inline-block' }} aria-hidden="true" />
            <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#28c840', display: 'inline-block' }} aria-hidden="true" />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--muted)', marginLeft: '8px', opacity: 0.6 }}>bash — adarsh@localhost</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', marginBottom: '4px' }}>
            <span style={{ color: 'var(--accent)', opacity: 0.55 }}>$ </span>ping adarsh
          </div>
          <PingOutput />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '480px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px' }}>find me on</p>
          {SOCIALS.map((s, i) => (
            <motion.a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="contact-card"
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                <s.icon size={16} aria-hidden="true" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{s.label}</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc}</div>
              </div>
              <ArrowRight size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} aria-hidden="true" />
            </motion.a>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
