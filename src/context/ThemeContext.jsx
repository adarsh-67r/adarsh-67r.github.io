import { createContext, useContext, useState, useEffect } from 'react'
import { themes, defaultTheme } from '../data/themes'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try { return localStorage.getItem('theme') || defaultTheme } catch { return defaultTheme }
  })

  const activeTheme = themes.find(t => t.value === currentTheme) || themes[0]

  useEffect(() => {
    const root = document.documentElement
    root.style.setProperty('--bg',      activeTheme.bg)
    root.style.setProperty('--surface', activeTheme.surface)
    root.style.setProperty('--text',    activeTheme.text)
    root.style.setProperty('--accent',  activeTheme.accent)
    root.style.setProperty('--muted',   activeTheme.muted)
    root.style.setProperty('--border',        activeTheme.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.13)')
    root.style.setProperty('--border-subtle', activeTheme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)')
    root.style.setProperty('--selection',     activeTheme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')
    root.style.setProperty('--scrollbar', activeTheme.muted)
    try { localStorage.setItem('theme', currentTheme) } catch {}
  }, [currentTheme, activeTheme])

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes, activeTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
