// Minimal client script: only handles dark mode toggle and respects stored preference.

type ThemeState = 'light' | 'dark'

function readStoredTheme(): ThemeState | null {
  try {
    const stored = window.localStorage.getItem('ui:dark')
    if (stored === '1') return 'dark'
    if (stored === '0') return 'light'
  } catch {}
  return null
}

function detectSystemPref(): ThemeState {
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

function applyTheme(theme: ThemeState) {
  const isDark = theme === 'dark'
  document.documentElement.classList.toggle('dark', isDark)
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  try {
    window.localStorage.setItem('ui:dark', isDark ? '1' : '0')
  } catch {}
}

function initTheme() {
  const current = readStoredTheme() ?? detectSystemPref()
  applyTheme(current)

  const toggle = document.querySelector<HTMLElement>('[data-toggle-dark]')
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark'
      applyTheme(next as ThemeState)
    })
  }

// Sheet components work with pure CSS (checkbox + peer), no JS needed
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initTheme()
  } else {
    document.addEventListener('DOMContentLoaded', initTheme, { once: true })
  }
}
