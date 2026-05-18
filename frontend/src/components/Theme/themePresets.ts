export interface ThemePresetColors {
  accent: string
  accentHover: string
  accentSoft: string
  accentGlow: string
}

export interface ThemePreset {
  id: string
  labelKey: string
  light: ThemePresetColors
  dark: ThemePresetColors
  preview: { light: string; dark: string }
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'default',
    labelKey: 'settings.themeDefault',
    light: {
      accent: '#2363eb',
      accentHover: '#1d56d4',
      accentSoft: 'rgba(35, 99, 235, 0.06)',
      accentGlow: 'rgba(35, 99, 235, 0.10)',
    },
    dark: {
      accent: '#59A4F9',
      accentHover: '#4B93E8',
      accentSoft: 'rgba(89, 164, 249, 0.10)',
      accentGlow: 'rgba(89, 164, 249, 0.15)',
    },
    preview: { light: '#2363eb', dark: '#59A4F9' },
  },
  {
    id: 'violet',
    labelKey: 'settings.themeViolet',
    light: {
      accent: '#7c3aed',
      accentHover: '#6d28d9',
      accentSoft: 'rgba(124, 58, 237, 0.06)',
      accentGlow: 'rgba(124, 58, 237, 0.10)',
    },
    dark: {
      accent: '#a78bfa',
      accentHover: '#8b5cf6',
      accentSoft: 'rgba(167, 139, 250, 0.10)',
      accentGlow: 'rgba(167, 139, 250, 0.15)',
    },
    preview: { light: '#7c3aed', dark: '#a78bfa' },
  },
  {
    id: 'sakura',
    labelKey: 'settings.themeSakura',
    light: {
      accent: '#ec4899',
      accentHover: '#db2777',
      accentSoft: 'rgba(236, 72, 153, 0.06)',
      accentGlow: 'rgba(236, 72, 153, 0.10)',
    },
    dark: {
      accent: '#f472b6',
      accentHover: '#ec4899',
      accentSoft: 'rgba(244, 114, 182, 0.10)',
      accentGlow: 'rgba(244, 114, 182, 0.15)',
    },
    preview: { light: '#ec4899', dark: '#f472b6' },
  },
  {
    id: 'lemon',
    labelKey: 'settings.themeLemon',
    light: {
      accent: '#ca8a04',
      accentHover: '#a16207',
      accentSoft: 'rgba(202, 138, 4, 0.06)',
      accentGlow: 'rgba(202, 138, 4, 0.10)',
    },
    dark: {
      accent: '#facc15',
      accentHover: '#eab308',
      accentSoft: 'rgba(250, 204, 21, 0.10)',
      accentGlow: 'rgba(250, 204, 21, 0.15)',
    },
    preview: { light: '#ca8a04', dark: '#facc15' },
  },
  {
    id: 'sky',
    labelKey: 'settings.themeSky',
    light: {
      accent: '#0284c7',
      accentHover: '#0369a1',
      accentSoft: 'rgba(2, 132, 199, 0.06)',
      accentGlow: 'rgba(2, 132, 199, 0.10)',
    },
    dark: {
      accent: '#38bdf8',
      accentHover: '#0ea5e9',
      accentSoft: 'rgba(56, 189, 248, 0.10)',
      accentGlow: 'rgba(56, 189, 248, 0.15)',
    },
    preview: { light: '#0284c7', dark: '#38bdf8' },
  },
  {
    id: 'lightgreen',
    labelKey: 'settings.themeLightGreen',
    light: {
      accent: '#16a34a',
      accentHover: '#15803d',
      accentSoft: 'rgba(22, 163, 74, 0.06)',
      accentGlow: 'rgba(22, 163, 74, 0.10)',
    },
    dark: {
      accent: '#4ade80',
      accentHover: '#22c55e',
      accentSoft: 'rgba(74, 222, 128, 0.10)',
      accentGlow: 'rgba(74, 222, 128, 0.15)',
    },
    preview: { light: '#16a34a', dark: '#4ade80' },
  },
  {
    id: 'zinc',
    labelKey: 'settings.themeZinc',
    light: {
      accent: '#52525b',
      accentHover: '#3f3f46',
      accentSoft: 'rgba(82, 82, 91, 0.06)',
      accentGlow: 'rgba(82, 82, 91, 0.10)',
    },
    dark: {
      accent: '#a1a1aa',
      accentHover: '#d4d4d8',
      accentSoft: 'rgba(161, 161, 170, 0.10)',
      accentGlow: 'rgba(161, 161, 170, 0.15)',
    },
    preview: { light: '#52525b', dark: '#a1a1aa' },
  },
  {
    id: 'darkgreen',
    labelKey: 'settings.themeDarkGreen',
    light: {
      accent: '#166534',
      accentHover: '#14532d',
      accentSoft: 'rgba(22, 101, 52, 0.06)',
      accentGlow: 'rgba(22, 101, 52, 0.10)',
    },
    dark: {
      accent: '#22c55e',
      accentHover: '#16a34a',
      accentSoft: 'rgba(34, 197, 94, 0.10)',
      accentGlow: 'rgba(34, 197, 94, 0.15)',
    },
    preview: { light: '#166534', dark: '#22c55e' },
  },
  {
    id: 'darkblue',
    labelKey: 'settings.themeDarkBlue',
    light: {
      accent: '#1e40af',
      accentHover: '#1e3a8a',
      accentSoft: 'rgba(30, 64, 175, 0.06)',
      accentGlow: 'rgba(30, 64, 175, 0.10)',
    },
    dark: {
      accent: '#60a5fa',
      accentHover: '#3b82f6',
      accentSoft: 'rgba(96, 165, 250, 0.10)',
      accentGlow: 'rgba(96, 165, 250, 0.15)',
    },
    preview: { light: '#1e40af', dark: '#60a5fa' },
  },
  {
    id: 'orange',
    labelKey: 'settings.themeOrange',
    light: {
      accent: '#ea580c',
      accentHover: '#c2410c',
      accentSoft: 'rgba(234, 88, 12, 0.06)',
      accentGlow: 'rgba(234, 88, 12, 0.10)',
    },
    dark: {
      accent: '#fb923c',
      accentHover: '#f97316',
      accentSoft: 'rgba(251, 146, 60, 0.10)',
      accentGlow: 'rgba(251, 146, 60, 0.15)',
    },
    preview: { light: '#ea580c', dark: '#fb923c' },
  },
  {
    id: 'rose',
    labelKey: 'settings.themeRose',
    light: {
      accent: '#e11d48',
      accentHover: '#be123c',
      accentSoft: 'rgba(225, 29, 72, 0.06)',
      accentGlow: 'rgba(225, 29, 72, 0.10)',
    },
    dark: {
      accent: '#fb7185',
      accentHover: '#f43f5e',
      accentSoft: 'rgba(251, 113, 133, 0.10)',
      accentGlow: 'rgba(251, 113, 133, 0.15)',
    },
    preview: { light: '#e11d48', dark: '#fb7185' },
  },
  {
    id: 'neutral',
    labelKey: 'settings.themeNeutral',
    light: {
      accent: '#57534e',
      accentHover: '#44403c',
      accentSoft: 'rgba(87, 83, 78, 0.06)',
      accentGlow: 'rgba(87, 83, 78, 0.10)',
    },
    dark: {
      accent: '#a8a29e',
      accentHover: '#d6d3d1',
      accentSoft: 'rgba(168, 162, 158, 0.10)',
      accentGlow: 'rgba(168, 162, 158, 0.15)',
    },
    preview: { light: '#57534e', dark: '#a8a29e' },
  },
  {
    id: 'slate',
    labelKey: 'settings.themeSlate',
    light: {
      accent: '#475569',
      accentHover: '#334155',
      accentSoft: 'rgba(71, 85, 105, 0.06)',
      accentGlow: 'rgba(71, 85, 105, 0.10)',
    },
    dark: {
      accent: '#94a3b8',
      accentHover: '#cbd5e1',
      accentSoft: 'rgba(148, 163, 184, 0.10)',
      accentGlow: 'rgba(148, 163, 184, 0.15)',
    },
    preview: { light: '#475569', dark: '#94a3b8' },
  },
  {
    id: 'midgray',
    labelKey: 'settings.themeMidGray',
    light: {
      accent: '#6b7280',
      accentHover: '#4b5563',
      accentSoft: 'rgba(107, 114, 128, 0.06)',
      accentGlow: 'rgba(107, 114, 128, 0.10)',
    },
    dark: {
      accent: '#9ca3af',
      accentHover: '#d1d5db',
      accentSoft: 'rgba(156, 163, 175, 0.10)',
      accentGlow: 'rgba(156, 163, 175, 0.15)',
    },
    preview: { light: '#6b7280', dark: '#9ca3af' },
  },
]

export const RADIUS_OPTIONS = [
  { value: 0, label: '0' },
  { value: 0.25, label: '0.25' },
  { value: 0.5, label: '0.5' },
  { value: 0.75, label: '0.75' },
  { value: 1, label: '1' },
]

export const DEFAULT_RADIUS = 0.5
export const DEFAULT_FONT_SIZE = 13
export const MIN_FONT_SIZE = 11
export const MAX_FONT_SIZE = 18
