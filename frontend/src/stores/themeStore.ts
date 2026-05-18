import { create } from 'zustand'
import { THEME_PRESETS, RADIUS_OPTIONS, DEFAULT_RADIUS, DEFAULT_FONT_SIZE, MIN_FONT_SIZE, MAX_FONT_SIZE, type ThemePreset } from '@/components/Theme/themePresets'

export type ThemeMode = 'light' | 'dark' | 'system'

export const THEME_SETTING_KEYS = {
  mode: 'app.theme',
  preset: 'app.themePreset',
  radius: 'app.themeRadius',
  fontSize: 'app.themeFontSize',
} as const

interface ThemeState {
  mode: ThemeMode
  resolved: 'light' | 'dark'
  presetId: string
  radius: number
  fontSize: number
  setMode: (mode: ThemeMode) => void
  setPresetId: (id: string) => void
  setRadius: (r: number) => void
  setFontSize: (s: number) => void
  applySettings: (settings: Record<string, string>) => void
  init: () => void
}

const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system']
const STORAGE_KEYS = {
  mode: 'aether-dock-theme',
  preset: 'aether-dock-preset',
  radius: 'aether-dock-radius',
  fontSize: 'aether-dock-font-size',
} as const

type WailsThemeRuntime = {
  WindowSetSystemDefaultTheme?: () => void
  WindowSetLightTheme?: () => void
  WindowSetDarkTheme?: () => void
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

function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return !!value && THEME_MODES.includes(value as ThemeMode)
}

function normalizePresetId(id: string | null | undefined): string {
  return id && THEME_PRESETS.some((preset) => preset.id === id) ? id : 'default'
}

function clampFontSize(value: number): number {
  return Math.max(MIN_FONT_SIZE, Math.min(MAX_FONT_SIZE, value))
}

function normalizeFontSize(value: string | number | null | undefined): number {
  const size = Number(value)
  return Number.isFinite(size) ? clampFontSize(size) : DEFAULT_FONT_SIZE
}

function normalizeRadius(value: string | number | null | undefined): number {
  const radius = Number(value)
  if (!Number.isFinite(radius)) return DEFAULT_RADIUS
  const min = RADIUS_OPTIONS[0]?.value ?? 0
  const max = RADIUS_OPTIONS[RADIUS_OPTIONS.length - 1]?.value ?? 1
  return Math.max(min, Math.min(max, radius))
}

function persistPreference(key: keyof typeof STORAGE_KEYS, value: string | number) {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS[key], String(value))
}

function getStoredPreference(key: keyof typeof STORAGE_KEYS): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(STORAGE_KEYS[key])
}

function getWailsThemeRuntime(): WailsThemeRuntime | null {
  if (typeof window === 'undefined') return null
  return (window as Window & { runtime?: WailsThemeRuntime }).runtime ?? null
}

function applyWindowTheme(mode: ThemeMode, resolved: 'light' | 'dark') {
  const runtime = getWailsThemeRuntime()
  if (!runtime) return
  try {
    if (mode === 'system') {
      runtime.WindowSetSystemDefaultTheme?.()
      return
    }
    if (resolved === 'dark') {
      runtime.WindowSetDarkTheme?.()
    } else {
      runtime.WindowSetLightTheme?.()
    }
  } catch {
    // The browser dev server has no Wails runtime.
  }
}

function toRgba(color: string, alpha: number): string {
  if (color.startsWith('#')) {
    const hex = color.slice(1)
    const normalized = hex.length === 3
      ? hex.split('').map((char) => `${char}${char}`).join('')
      : hex
    if (normalized.length === 6) {
      const r = Number.parseInt(normalized.slice(0, 2), 16)
      const g = Number.parseInt(normalized.slice(2, 4), 16)
      const b = Number.parseInt(normalized.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`)
  }
  return color
}

let transitionTimer: ReturnType<typeof setTimeout> | null = null
let systemThemeListenerReady = false

function applyTheme(mode: ThemeMode, resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.add('theme-transitioning')
  root.setAttribute('data-theme', resolved)
  if (resolved === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  if (transitionTimer) clearTimeout(transitionTimer)
  transitionTimer = setTimeout(() => {
    root.classList.remove('theme-transitioning')
    transitionTimer = null
  }, 250)
  applyWindowTheme(mode, resolved)
}

function applyPreset(preset: ThemePreset, resolved: 'light' | 'dark') {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const colors = resolved === 'dark' ? preset.dark : preset.light
  const borderAccent = toRgba(colors.accent, resolved === 'dark' ? 0.25 : 0.26)
  root.style.setProperty('--c-accent', colors.accent)
  root.style.setProperty('--c-accent-hover', colors.accentHover)
  root.style.setProperty('--c-accent-soft', colors.accentSoft)
  root.style.setProperty('--c-accent-glow', colors.accentGlow)
  root.style.setProperty('--c-border-accent', borderAccent)
  root.style.setProperty('--gradient-accent', `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`)
  root.style.setProperty('--gradient-accent-text', `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentHover} 100%)`)
  root.style.setProperty('--shadow-glow', `0 0 0 3px ${colors.accentGlow}`)
}

function applyRadius(radius: number) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const base = 8 * radius
  root.style.setProperty('--radius-sm', `${Math.round(base * 1.5)}px`)
  root.style.setProperty('--radius-md', `${Math.round(base * 2)}px`)
  root.style.setProperty('--radius-lg', `${Math.round(base * 2.5)}px`)
  root.style.setProperty('--radius-xl', `${Math.round(base * 3)}px`)
}

function applyFontSize(size: number) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.style.setProperty('--app-font-size', `${size}px`)
  root.style.fontSize = `${size}px`
}

function applyThemeState(mode: ThemeMode, presetId: string, radius: number, fontSize: number) {
  const resolved = resolveTheme(mode)
  const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0]
  applyTheme(mode, resolved)
  applyPreset(preset, resolved)
  applyRadius(radius)
  applyFontSize(fontSize)
  return resolved
}

function watchSystemTheme(set: (partial: Partial<ThemeState>) => void) {
  if (systemThemeListenerReady || typeof window === 'undefined' || !window.matchMedia) return
  systemThemeListenerReady = true
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const handleChange = () => {
    const current = useThemeStore.getState()
    if (current.mode !== 'system') return
    const resolved = getSystemTheme()
    const preset = THEME_PRESETS.find((preset) => preset.id === current.presetId) ?? THEME_PRESETS[0]
    applyTheme(current.mode, resolved)
    applyPreset(preset, resolved)
    set({ resolved })
  }
  media.addEventListener('change', handleChange)
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: 'light',
  resolved: 'light',
  presetId: 'default',
  radius: DEFAULT_RADIUS,
  fontSize: DEFAULT_FONT_SIZE,

  setMode: (mode) => {
    const safeMode = isThemeMode(mode) ? mode : 'light'
    const { presetId, radius, fontSize } = get()
    const resolved = applyThemeState(safeMode, presetId, radius, fontSize)
    persistPreference('mode', safeMode)
    set({ mode: safeMode, resolved })
  },

  setPresetId: (id) => {
    const presetId = normalizePresetId(id)
    const { mode, resolved } = get()
    const preset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0]
    applyPreset(preset, resolved)
    applyWindowTheme(mode, resolved)
    persistPreference('preset', presetId)
    set({ presetId })
  },

  setRadius: (r) => {
    const radius = normalizeRadius(r)
    applyRadius(radius)
    persistPreference('radius', radius)
    set({ radius })
  },

  setFontSize: (s) => {
    const fontSize = normalizeFontSize(s)
    applyFontSize(fontSize)
    persistPreference('fontSize', fontSize)
    set({ fontSize })
  },

  applySettings: (settings) => {
    const current = get()
    const settingMode = settings[THEME_SETTING_KEYS.mode]
    const mode = isThemeMode(settingMode) ? settingMode : current.mode
    const presetId = settings[THEME_SETTING_KEYS.preset] != null ? normalizePresetId(settings[THEME_SETTING_KEYS.preset]) : current.presetId
    const radius = settings[THEME_SETTING_KEYS.radius] != null ? normalizeRadius(settings[THEME_SETTING_KEYS.radius]) : current.radius
    const fontSize = settings[THEME_SETTING_KEYS.fontSize] != null ? normalizeFontSize(settings[THEME_SETTING_KEYS.fontSize]) : current.fontSize
    const resolved = applyThemeState(mode, presetId, radius, fontSize)
    persistPreference('mode', mode)
    persistPreference('preset', presetId)
    persistPreference('radius', radius)
    persistPreference('fontSize', fontSize)
    set({ mode, resolved, presetId, radius, fontSize })
  },

  init: () => {
    const savedMode = getStoredPreference('mode')
    const mode = isThemeMode(savedMode) ? savedMode : 'light'
    const presetId = normalizePresetId(getStoredPreference('preset'))
    const radius = normalizeRadius(getStoredPreference('radius'))
    const fontSize = normalizeFontSize(getStoredPreference('fontSize'))
    const resolved = applyThemeState(mode, presetId, radius, fontSize)
    set({ mode, resolved, presetId, radius, fontSize })
    watchSystemTheme(set)
  },
}))
