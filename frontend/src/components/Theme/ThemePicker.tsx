import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { MonitorSmartphone, Moon, Sun } from 'lucide-react'
import { useThemeStore, type ThemeMode } from '@/stores/themeStore'
import { THEME_PRESETS, RADIUS_OPTIONS, MIN_FONT_SIZE, MAX_FONT_SIZE } from './themePresets'

type ThemeSettingKey = 'app.theme' | 'app.themePreset' | 'app.themeRadius' | 'app.themeFontSize'

interface ThemePickerProps {
  onSettingChange?: (key: ThemeSettingKey, value: string) => void
}

export function ThemePicker({ onSettingChange }: ThemePickerProps) {
  const { t } = useTranslation()
  const { mode: themeMode, resolved, presetId, radius, fontSize, setMode, setPresetId, setRadius, setFontSize } = useThemeStore()
  const activePreset = THEME_PRESETS.find((p) => p.id === presetId) ?? THEME_PRESETS[0]

  const updateMode = (mode: ThemeMode) => {
    setMode(mode)
    onSettingChange?.('app.theme', mode)
  }

  const updatePreset = (id: string) => {
    setPresetId(id)
    onSettingChange?.('app.themePreset', id)
  }

  const updateRadius = (nextRadius: number) => {
    setRadius(nextRadius)
    onSettingChange?.('app.themeRadius', String(nextRadius))
  }

  const updateFontSize = (nextFontSize: number) => {
    setFontSize(nextFontSize)
    onSettingChange?.('app.themeFontSize', String(nextFontSize))
  }

  const modeOptions: { value: ThemeMode; icon: ReactNode; label: string; preview: { bg: string; card: string; accent: string } }[] = [
    { value: 'light', icon: <Sun style={{ width: 12, height: 12 }} />, label: t('settings.light'), preview: { bg: '#f0f2f7', card: '#fff', accent: activePreset.preview.light } },
    { value: 'dark', icon: <Moon style={{ width: 12, height: 12 }} />, label: t('settings.dark'), preview: { bg: '#0f1117', card: '#1a1d2e', accent: activePreset.preview.dark } },
    { value: 'system', icon: <MonitorSmartphone style={{ width: 12, height: 12 }} />, label: t('settings.system'), preview: { bg: 'linear-gradient(135deg, #f0f2f7 50%, #0f1117 50%)', card: 'linear-gradient(135deg, #fff 50%, #1a1d2e 50%)', accent: `linear-gradient(135deg, ${activePreset.preview.light} 50%, ${activePreset.preview.dark} 50%)` } },
  ]

  return (
    <div className="space-y-5">
      <div>
        <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650, marginBottom: 8 }}>{t('settings.themeMode')}</p>
        <div className="grid grid-cols-3 gap-3">
          {modeOptions.map((opt) => (
            <ThemeButton
              key={opt.value}
              active={themeMode === opt.value}
              icon={opt.icon}
              label={opt.label}
              preview={opt.preview}
              onClick={() => updateMode(opt.value)}
            />
          ))}
        </div>
      </div>

      <div>
        <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650, marginBottom: 8 }}>{t('settings.themeColor')}</p>
        <div className="grid grid-cols-7 gap-2">
          {THEME_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => updatePreset(preset.id)}
              className="flex flex-col items-center gap-1.5 p-2 rounded-lg transition-all"
              style={{
                background: presetId === preset.id ? 'var(--c-accent-soft)' : 'transparent',
                border: presetId === preset.id ? '1.5px solid var(--c-accent)' : '1.5px solid transparent',
                cursor: 'pointer',
              }}
              type="button"
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  background: resolved === 'dark' ? preset.preview.dark : preset.preview.light,
                  border: presetId === preset.id ? '2px solid var(--c-accent)' : '2px solid var(--c-border)',
                  boxShadow: presetId === preset.id ? `0 0 0 2px var(--c-accent-soft)` : 'none',
                }}
              />
              <span style={{ fontSize: 9, color: presetId === preset.id ? 'var(--c-accent)' : 'var(--c-text-faint)', fontWeight: presetId === preset.id ? 700 : 500, whiteSpace: 'nowrap' }}>
                {t(preset.labelKey)}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650 }}>{t('settings.themeRadius')}</p>
          <span style={{ fontSize: 11, color: 'var(--c-text-faint)', fontFamily: 'monospace' }}>{radius}</span>
        </div>
        <div className="flex items-center gap-2">
          {RADIUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateRadius(opt.value)}
              className="flex items-center justify-center transition-all"
              style={{
                width: 36,
                height: 28,
                borderRadius: `${opt.value * 8}px`,
                background: radius === opt.value ? 'var(--c-accent-soft)' : 'var(--c-bg-input)',
                border: radius === opt.value ? '1.5px solid var(--c-accent)' : '1px solid var(--c-border)',
                color: radius === opt.value ? 'var(--c-accent)' : 'var(--c-text-muted)',
                fontSize: 10,
                fontWeight: radius === opt.value ? 700 : 500,
                cursor: 'pointer',
              }}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div style={{ width: 60, height: 32, borderRadius: `${radius * 8}px`, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 32, height: 16, borderRadius: `${radius * 4}px`, background: 'var(--c-accent)', opacity: 0.6 }} />
          </div>
          <div style={{ width: 48, height: 28, borderRadius: `${radius * 6}px`, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 24, height: 12, borderRadius: `${radius * 3}px`, background: 'var(--c-accent)', opacity: 0.4 }} />
          </div>
          <div style={{ width: 36, height: 24, borderRadius: `${radius * 5}px`, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 18, height: 10, borderRadius: `${radius * 2}px`, background: 'var(--c-accent)', opacity: 0.3 }} />
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650 }}>{t('settings.themeFontSize')}</p>
          <span style={{ fontSize: 11, color: 'var(--c-text-faint)', fontFamily: 'monospace' }}>{fontSize}px</span>
        </div>
        <div className="flex items-center gap-3">
          <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>{MIN_FONT_SIZE}</span>
          <input
            type="range"
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            step={1}
            value={fontSize}
            onChange={(e) => updateFontSize(Number(e.target.value))}
            style={{
              flex: 1,
              accentColor: 'var(--c-accent)',
              height: 4,
              cursor: 'pointer',
            }}
          />
          <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>{MAX_FONT_SIZE}</span>
        </div>
        <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 4 }}>{t('settings.themeFontSizeHint')}</p>
      </div>
    </div>
  )
}

function ThemeButton({
  active,
  icon,
  label,
  preview,
  onClick,
}: {
  active: boolean
  icon: ReactNode
  label: string
  preview: { bg: string; card: string; accent: string }
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all"
      style={{
        background: active ? 'var(--c-accent-soft)' : 'var(--c-bg-input)',
        border: active ? '1.5px solid var(--c-accent)' : '1.5px solid var(--c-border)',
        cursor: 'pointer',
      }}
      type="button"
    >
      <div className="w-full rounded-lg overflow-hidden" style={{ height: 54, background: preview.bg, padding: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="rounded" style={{ height: 8, width: '60%', background: preview.accent, borderRadius: 3 }} />
        <div style={{ display: 'flex', gap: 3, flex: 1 }}>
          <div className="rounded" style={{ width: '42%', background: preview.card, borderRadius: 3 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div className="rounded" style={{ height: 4, width: '70%', background: 'rgba(128,128,128,0.2)', borderRadius: 2 }} />
            <div className="rounded" style={{ height: 4, width: '50%', background: 'rgba(128,128,128,0.15)', borderRadius: 2 }} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5" style={{ color: active ? 'var(--c-accent)' : 'var(--c-text-muted)' }}>
        {icon}
        <span style={{ fontSize: 11, fontWeight: active ? 700 : 600 }}>{label}</span>
      </div>
    </button>
  )
}
