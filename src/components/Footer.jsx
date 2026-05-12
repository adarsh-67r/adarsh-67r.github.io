import { Envelope } from '@phosphor-icons/react'
import { GithubLogo, LinkedinLogo } from '@phosphor-icons/react'

const socials = [
  { icon: GithubLogo,   label: 'GitHub',   href: 'https://github.com/adarsh-67r' },
  { icon: LinkedinLogo, label: 'LinkedIn', href: 'https://www.linkedin.com/in/adarsh67' },
  { icon: Envelope,     label: 'Email',    href: 'mailto:adarshanshuman6@gmail.com' },
]

export default function Footer() {
  return (
    <footer style={{ padding: '36px max(24px, calc((100vw - 900px) / 2))', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
      <p style={{ color: 'var(--muted)', fontSize: '0.78rem', fontFamily: 'var(--font-mono)' }}>
        © {new Date().getFullYear()} Adarsh
      </p>
      <div style={{ display: 'flex', gap: '8px' }}>
        {socials.map(({ icon: Icon, label, href }) => (
          <a key={label} href={href} target="_blank" rel="noopener noreferrer" title={label}
            style={{ width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--muted)', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}>
            <Icon size={15} />
          </a>
        ))}
      </div>
    </footer>
  )
}
