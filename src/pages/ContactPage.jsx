import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Send, ArrowRight } from 'lucide-react'
import TerminalCmd from '../components/TerminalCmd'

const SOCIALS = [
  { icon: Github,   label: 'GitHub',   handle: '@adarsh-67r',              href: 'https://github.com/adarsh-67r',             desc: 'Check out my code' },
  { icon: Linkedin, label: 'LinkedIn', handle: 'linkedin.com/in/adarsh67',  href: 'https://www.linkedin.com/in/adarsh67',      desc: 'Connect professionally' },
  { icon: Mail,     label: 'Email',    handle: 'adarshanshuman6@gmail.com', href: 'mailto:adarshanshuman6@gmail.com',           desc: 'For serious stuff' },
]

// Live scrolling ping output — loops forever
function PingOutput() {
  const [lines, setLines] = useState([])
  const timerRef = useRef(null)

  useEffect(() => {
    let seq = 0
    let currentLines = []

    function addLine() {
      if (seq === 0) {
        currentLines = ['PING adarsh (127.0.0.1): 56 bytes']
        setLines([...currentLines])
        seq = 1
        timerRef.current = setTimeout(addLine, 600)
      } else {
        const ms = (0.35 + Math.random() * 0.18).toFixed(2)
        const line = `64 bytes: icmp_seq=${seq - 1} ttl=64 time=${ms} ms`
        currentLines = [...currentLines, line]
        if (currentLines.length > 6) currentLines = currentLines.slice(-6)
        setLines([...currentLines])
        seq++
        timerRef.current = setTimeout(addLine, 900)
      }
    }

    timerRef.current = setTimeout(addLine, 300)
    return () => clearTimeout(timerRef.current)
  }, [])

  return (
    <div style={{
      fontFamily: 'var(--font-mono)',
      fontSize: '0.72rem',
      color: 'var(--muted)',
      lineHeight: 1.8,
      marginTop: '6px',
      minHeight: '6em',
    }}>
      {lines.map((line, i) => (
        <div key={i} style={{ opacity: i === 0 ? 0.7 : i === lines.length - 1 ? 1 : 0.55 }}>
          {i === 0
            ? <span style={{ color: 'var(--accent)', opacity: 0.85 }}>{line}</span>
            : <><span style={{ color: 'var(--accent)', opacity: 0.4 }}>{'> '}</span>{line}</>
          }
        </div>
      ))}
    </div>
  )
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Message from ${form.name}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.open(`mailto:adarshanshuman6@gmail.com?subject=${subject}&body=${body}`, '_blank')
    setSent(true)
    setTimeout(() => setSent(false), 4000)
  }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <div style={{ padding: '120px max(24px, calc((100vw - 860px) / 2)) 80px' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

        {/* Looping terminal command */}
        <TerminalCmd cmd="ping adarsh" loop={true} />
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 400, fontStyle: 'italic', fontFamily: 'var(--font-display)', color: 'var(--text)', marginBottom: '12px', letterSpacing: '-0.01em' }}>get in touch</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px' }}>
          Have something interesting to say, a project idea, or just want to chat? I'm usually reachable.
        </p>

        {/* Live ping output block */}
        <div style={{ padding: '16px 22px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', marginBottom: '48px' }}>
          <PingOutput />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' }}>

          {/* Left — social cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '14px 18px',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  transition: 'all 0.2s',
                  color: 'var(--text)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateX(4px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
              >
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', flexShrink: 0 }}>
                  <s.icon size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.75rem', color: 'var(--muted)' }}>{s.desc}</div>
                </div>
                <ArrowRight size={14} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              </motion.a>
            ))}
          </div>

          {/* Right — message form */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px' }}>send a message</p>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Name"  name="name"  value={form.name}  onChange={handleChange} placeholder="your name"       required />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Message</label>
                <textarea
                  name="message" value={form.message} onChange={handleChange}
                  required rows={5} placeholder="what's on your mind..."
                  style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', lineHeight: 1.6, resize: 'vertical', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <button type="submit"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 24px', background: sent ? 'rgba(203,166,247,0.15)' : 'var(--accent)', color: sent ? 'var(--accent)' : 'var(--bg)', border: sent ? '1px solid var(--accent)' : 'none', borderRadius: '8px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, cursor: sent ? 'default' : 'pointer', transition: 'all 0.3s', alignSelf: 'flex-start' }}
                onMouseEnter={e => { if (!sent) e.currentTarget.style.opacity = '0.88' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                {sent ? '✓ opening mail client...' : (<><Send size={14} /> send message</>)}
              </button>
            </form>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        @media (max-width: 700px) {
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}

function Field({ label, name, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required}
        style={{ padding: '9px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', outline: 'none', transition: 'border-color 0.2s', width: '100%' }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}
