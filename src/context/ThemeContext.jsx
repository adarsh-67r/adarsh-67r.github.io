import { createContext, useContext, useState, useEffect } from 'react'
import { themes, defaultTheme } from '../data/themes'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    try { return localStorage.getItem('theme') || defaultTheme } catch { return defaultTheme }
  })

  useEffect(() => {
    const theme = themes.find(t => t.value === currentTheme) || themes[0]
    const root = document.documentElement
    root.style.setProperty('--bg', theme.bg)
    root.style.setProperty('--surface', theme.surface)
    root.style.setProperty('--text', theme.text)
    root.style.setProperty('--accent', theme.accent)
    root.style.setProperty('--muted', theme.muted)
    // Border: stronger contrast on light themes, subtle on dark
    root.style.setProperty('--border', theme.dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.13)')
    // Surface border: even subtler, for inner cards
    root.style.setProperty('--border-subtle', theme.dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.07)')
    // Selection highlight
    root.style.setProperty('--selection', theme.dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)')
    // Scrollbar thumb
    root.style.setProperty('--scrollbar', theme.muted)
    try { localStorage.setItem('theme', currentTheme) } catch {}
  }, [currentTheme])

  return (
    <ThemeContext.Provider value={{ currentTheme, setCurrentTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
