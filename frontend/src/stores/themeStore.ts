import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  setMode: (mode: ThemeMode) => void
  init: () => void
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemTheme()
  return mode
}

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  root.setAttribute('data-theme', resolved)
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: 'light',
  resolved: 'light',

  setMode: (mode) => {
    const resolved = resolveTheme(mode)
    applyTheme(resolved)
    localStorage.setItem('aether-dock-theme', mode)
    set({ mode, resolved })
  },

  init: () => {
    const saved = localStorage.getItem('aether-dock-theme') as ThemeMode | null
    const mode = saved ?? 'light'
    const resolved = resolveTheme(mode)
    applyTheme(resolved)
    set({ mode, resolved })

    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        const current = useThemeStore.getState().mode
        if (current === 'system') {
          const newResolved = getSystemTheme()
          applyTheme(newResolved)
          set({ resolved: newResolved })
        }
      })
    }
  },
}))
