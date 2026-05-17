import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { wailsApi } from '@/services/wailsBridge'
import { RotateCcw, FolderOpen, Pencil, Globe, Shield, Bell, Monitor } from 'lucide-react'
import { TOOL_ICONS } from '@/constants/tools'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    const resp = await wailsApi.getSettings()
    if (resp.success && resp.data) {
      setSettings(resp.data)
      const lang = resp.data['app.language']
      if (lang && lang !== 'auto') {
        i18n.changeLanguage(lang)
      }
    }
    setLoading(false)
  }

  const updateSetting = async (key: string, value: string) => {
    await wailsApi.setSetting(key, value)
    setSettings((prev) => ({ ...prev, [key]: value }))
    if (key === 'app.language') {
      if (value === 'auto') {
        i18n.changeLanguage(navigator.language.startsWith('zh') ? 'zh' : 'en')
      } else {
        i18n.changeLanguage(value)
      }
    }
  }

  const resetSettings = async () => {
    await wailsApi.resetSettings()
    await loadSettings()
  }

  const settingGroups = [
    {
      title: t('settings.general', 'General'),
      icon: Globe,
      items: [
        {
          key: 'app.language',
          label: t('settings.language', 'Language'),
          type: 'select' as const,
          options: [
            { value: 'auto', label: t('settings.langAuto', 'Auto (System)') },
            { value: 'en', label: 'English' },
            { value: 'zh', label: '简体中文' },
          ],
        },
        {
          key: 'app.theme',
          label: t('settings.theme', 'Theme'),
          type: 'select' as const,
          options: [
            { value: 'light', label: t('settings.light', 'Light') },
            { value: 'dark', label: t('settings.dark', 'Dark') },
            { value: 'system', label: t('settings.system', 'System') },
          ],
        },
      ],
    },
    {
      title: t('settings.storage', 'Storage'),
      icon: FolderOpen,
      items: [
        {
          key: 'app.dataDir',
          label: t('settings.dataDir', 'Data Directory'),
          type: 'text' as const,
          placeholder: '~/.aether-dock',
        },
        {
          key: 'app.defaultEditor',
          label: t('settings.defaultEditor', 'Default Editor'),
          type: 'text' as const,
          placeholder: 'code, vim...',
        },
      ],
    },
    {
      title: t('settings.install', 'Install'),
      icon: Pencil,
      items: [
        {
          key: 'install.autoSync',
          label: t('settings.autoSync', 'Auto-sync after install'),
          type: 'select' as const,
          options: [
            { value: 'true', label: t('settings.yes', 'Yes') },
            { value: 'false', label: t('settings.no', 'No') },
          ],
        },
        {
          key: 'install.defaultGitBranch',
          label: t('settings.defaultBranch', 'Default Git Branch'),
          type: 'text' as const,
          placeholder: 'main',
        },
      ],
    },
    {
      title: t('settings.updates', 'Updates'),
      icon: Bell,
      items: [
        {
          key: 'app.checkUpdates',
          label: t('settings.checkOnStartup', 'Check for updates on startup'),
          type: 'select' as const,
          options: [
            { value: 'true', label: t('settings.yes', 'Yes') },
            { value: 'false', label: t('settings.no', 'No') },
          ],
        },
      ],
    },
  ]

  const supportedTools = Object.keys(TOOL_ICONS)

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}
      >
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{t('settings.title', 'Settings')}</h2>
          <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 2 }}>{t('settings.subtitle', 'Configure AetherDock behavior and preferences')}</p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{ color: 'var(--c-text-muted)', background: 'rgba(15, 23, 42, 0.04)' }}
          onClick={resetSettings}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
        >
          <RotateCcw style={{ width: 12, height: 12 }} />
          {t('settings.reset', 'Reset')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RotateCcw style={{ width: 20, height: 20, color: 'var(--c-text-faint)' }} className="animate-spin" />
          </div>
        ) : (
          <div className="max-w-xl space-y-5">
            {settingGroups.map((group) => (
              <div key={group.title}>
                <div className="flex items-center gap-2 mb-2.5">
                  <group.icon style={{ width: 13, height: 13, color: 'var(--c-text-faint)' }} />
                  <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.1em' }} className="uppercase">{group.title}</h3>
                </div>
                <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
                  {group.items.map((item, idx) => (
                    <div
                      key={item.key}
                      className="flex items-center justify-between px-4 py-3.5"
                      style={idx > 0 ? { borderTop: '1px solid var(--c-border)' } : undefined}
                    >
                      <span style={{ fontSize: 13, color: 'var(--c-text-secondary)', fontWeight: 500 }}>{item.label}</span>
                      {item.type === 'select' ? (
                        <select
                          style={{
                            padding: '7px 12px',
                            background: 'var(--c-bg-input)',
                            border: '1px solid var(--c-border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 12,
                            color: 'var(--c-text-secondary)',
                            outline: 'none',
                            width: 160,
                          }}
                          value={settings[item.key] || ''}
                          onChange={(e) => updateSetting(item.key, e.target.value)}
                        >
                          {item.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          style={{
                            padding: '7px 12px',
                            background: 'var(--c-bg-input)',
                            border: '1px solid var(--c-border)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: 12,
                            color: 'var(--c-text-secondary)',
                            outline: 'none',
                            width: 160,
                            fontFamily: 'monospace',
                          }}
                          placeholder={item.placeholder}
                          value={settings[item.key] || ''}
                          onChange={(e) => updateSetting(item.key, e.target.value)}
                          onFocus={(e) => { e.target.style.borderColor = 'var(--c-border-accent)' }}
                          onBlur={(e) => { e.target.style.borderColor = 'var(--c-border)' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Shield style={{ width: 13, height: 13, color: 'var(--c-text-faint)' }} />
                <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.1em' }} className="uppercase">{t('settings.supportedTools', 'Supported Tools')}</h3>
              </div>
              <div className="glass-card p-4">
                <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
                  {t('settings.toolsDesc', 'AetherDock can sync skills and MCP configurations with the following tools.')}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {supportedTools.map((tool) => {
                    const icon = TOOL_ICONS[tool]
                    return (
                      <div
                        key={tool}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors cursor-default"
                        style={{ background: 'var(--c-bg-input)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-elevated)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-bg-input)' }}
                      >
                        {icon ? (
                          <img src={icon} alt={tool} style={{ width: 18, height: 18 }} className="rounded object-contain shrink-0" />
                        ) : (
                          <div style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(15, 23, 42, 0.06)', fontSize: 8, color: 'var(--c-text-faint)' }} className="flex items-center justify-center shrink-0 font-medium">
                            {tool[0]}
                          </div>
                        )}
                        <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }} className="truncate">{tool}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2.5">
                <Monitor style={{ width: 13, height: 13, color: 'var(--c-text-faint)' }} />
                <h3 style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.1em' }} className="uppercase">{t('settings.about', 'About')}</h3>
              </div>
              <div className="glass-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('settings.version', 'Version')}</span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}>0.1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Build</span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}>dev</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Runtime</span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}>Wails v2</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
