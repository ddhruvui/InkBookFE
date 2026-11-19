import { useEffect, useState } from 'react'
import Icon from './Icon'

const KEY = 'inkbook-theme'
const ORDER = ['system', 'light', 'dark']
const LABEL = { system: 'Theme: match system', light: 'Theme: light paper', dark: 'Theme: dark ink' }
const ICON = { system: 'monitor', light: 'sun', dark: 'moon' }

function readTheme() {
  try {
    const v = localStorage.getItem(KEY)
    return ORDER.includes(v) ? v : 'system'
  } catch {
    return 'system'
  }
}

function applyTheme(theme) {
  const root = document.documentElement
  if (theme === 'system') delete root.dataset.theme
  else root.dataset.theme = theme
}

// Cycles system → light → dark. index.html applies the stored choice before
// first paint so there is no flash.
export default function ThemeToggle() {
  const [theme, setTheme] = useState(readTheme)
  useEffect(() => {
    applyTheme(theme)
    try {
      if (theme === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, theme)
    } catch {
      // storage blocked — theme still applies for this session
    }
  }, [theme])
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length]
  return (
    <button
      type="button"
      className="icon-btn"
      title={`${LABEL[theme]} — click for ${next}`}
      aria-label={LABEL[theme]}
      onClick={() => setTheme(next)}
    >
      <Icon name={ICON[theme]} size={16} />
    </button>
  )
}
