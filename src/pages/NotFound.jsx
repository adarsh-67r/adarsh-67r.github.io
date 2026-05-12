import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35 }}
      style={{ padding: '120px max(24px, calc((100vw - 860px) / 2)) 80px' }}
    >
      <Helmet>
        <title>404 — Adarsh</title>
      </Helmet>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ color: 'var(--accent)', opacity: 0.55 }}>$</span>
          <span>cd <span style={{ color: 'var(--accent)' }}>404</span></span>
          <span style={{ opacity: 0.4 }}>bash: cd: 404: No such file or directory</span>
        </div>

        <h1 style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 400, fontSize: 'clamp(3rem, 10vw, 6rem)', color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>404</h1>
        <p style={{ color: 'var(--muted)', fontSize: '0.95rem', fontFamily: 'var(--font-body)', lineHeight: 1.7, maxWidth: '400px' }}>
          This page doesn&apos;t exist. Maybe it got <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.85em' }}>rm -rf</code>&apos;d.
        </p>

        <Link to="/" className="btn-home">
          ~/home
        </Link>
      </div>
    </motion.div>
  )
}
