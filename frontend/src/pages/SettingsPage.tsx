import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Bell,
  Clock3,
  Database,
  Eye,
  FileSearch,
  FolderCheck,
  FolderOpen,
  Globe,
  Monitor,
  MonitorSmartphone,
  Moon,
  Pencil,
  RefreshCw,
  RotateCcw,
  ScanSearch,
  Shield,
  SlidersHorizontal,
  Sun,
} from 'lucide-react'
import type { ToolConfig } from '@/types'
import { wailsApi } from '@/services/wailsBridge'
import { useThemeStore, type ThemeMode } from '@/stores/themeStore'
import { useToolStore } from '@/stores/toolStore'
import { APP_VERSION } from '@/constants/app'
import { Switch } from '@/components/Control'
import { Skeleton, SkeletonCard } from '@/components/Loading'
import { CORE_SKILL_TOOLS, getToolIconFor, normalizeToolKey, shortPath, type CoreSkillTool } from '@/components/Skills'

type SettingField =
  | {
      key: string
      label: string
      type: 'select'
      options: { value: string; label: string }[]
    }
  | {
      key: string
      label: string
      type: 'text'
      placeholder?: string
    }

type SettingsTab = 'general' | 'scan' | 'validation' | 'apps'

export default function SettingsPage() {
  const { t, i18n } = useTranslation()
  const { mode: themeMode, setMode: setThemeMode } = useThemeStore()
  const { tools, fetchTools } = useToolStore()
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  useEffect(() => {
    void loadAll()
  }, [])

  const loadAll = async () => {
    setLoading(true)
    const [resp] = await Promise.all([wailsApi.getSettings(), fetchTools()])
    if (resp.success && resp.data) {
      applySettings(resp.data)
    }
    setLoading(false)
  }

  const applySettings = (nextSettings: Record<string, string>) => {
    setSettings(nextSettings)
    const lang = nextSettings['app.language']
    if (lang && lang !== 'auto') {
      i18n.changeLanguage(lang)
    }
    const savedTheme = nextSettings['app.theme'] as ThemeMode | undefined
    if (savedTheme && savedTheme !== themeMode) {
      setThemeMode(savedTheme)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    if (key === 'app.theme') {
      setThemeMode(value as ThemeMode)
    }
    if (key === 'app.language') {
      if (value === 'auto') {
        i18n.changeLanguage(navigator.language.startsWith('zh') ? 'zh' : 'en')
      } else {
        i18n.changeLanguage(value)
      }
    }
    setSettings((prev) => ({ ...prev, [key]: value }))
    void wailsApi.setSetting(key, value)
  }

  const resetSettings = async () => {
    setLoading(true)
    await wailsApi.resetSettings()
    await loadAll()
  }

  const chooseFolder = async (settingKey: string) => {
    const resp = await wailsApi.browseFolder()
    if (resp.success && resp.data) {
      await updateSetting(settingKey, resp.data)
    }
  }

  const toggleSetting = async (settingKey: string, fallback = 'false') => {
    await updateSetting(settingKey, (settings[settingKey] ?? fallback) === 'true' ? 'false' : 'true')
  }

  const coreRows = useMemo(() => {
    return CORE_SKILL_TOOLS.map((tool) => {
      const config = findCoreToolConfig(tools, tool)
      return {
        tool,
        config,
        skillDir: settings[`skills.${tool.id}.dir`] || config?.skillDir || '',
        logPath: settings[`logs.${tool.id}.path`] || deriveLogPath(config),
        logEnabled: (settings[`logs.${tool.id}.enabled`] ?? 'true') === 'true',
      }
    })
  }, [settings, tools])

  const settingGroups: { title: string; icon: typeof Globe; items: SettingField[] }[] = [
    {
      title: t('settings.general', 'General'),
      icon: Globe,
      items: [
        {
          key: 'app.language',
          label: t('settings.language', 'Language'),
          type: 'select',
          options: [
            { value: 'auto', label: t('settings.langAuto', 'Auto (System)') },
            { value: 'en', label: 'English' },
            { value: 'zh', label: '简体中文' },
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
          type: 'text',
          placeholder: '~/.aether-dock',
        },
        {
          key: 'app.defaultEditor',
          label: t('settings.defaultEditor', 'Default Editor'),
          type: 'text',
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
          type: 'select',
          options: [
            { value: 'true', label: t('settings.yes', 'Yes') },
            { value: 'false', label: t('settings.no', 'No') },
          ],
        },
        {
          key: 'install.defaultGitBranch',
          label: t('settings.defaultBranch', 'Default Git Branch'),
          type: 'text',
          placeholder: 'main',
        },
      ],
    },
  ]

  const tabs: { key: SettingsTab; label: string; icon: typeof Globe }[] = [
    { key: 'general', label: t('settings.tabGeneral', 'General'), icon: Globe },
    { key: 'scan', label: t('settings.tabScan', 'Scan & Logs'), icon: ScanSearch },
    { key: 'validation', label: t('settings.tabValidation', 'Rules'), icon: Shield },
    { key: 'apps', label: t('settings.tabApps', 'Apps'), icon: Database },
  ]

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}
      >
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 650, color: 'var(--c-text)' }}>{t('settings.title', 'Settings')}</h2>
          <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 2 }}>
            {t('settings.workbenchSubtitle', 'Configure skill scanning, logs, validation and workspace preferences.')}
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{ color: 'var(--c-text-muted)', background: 'rgba(15, 23, 42, 0.04)' }}
          onClick={resetSettings}
          type="button"
        >
          <RotateCcw style={{ width: 12, height: 12 }} />
          {t('settings.reset', 'Reset')}
        </button>
      </div>

      <div
        className="flex items-center gap-1 px-5 shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold transition-colors"
              style={{
                color: active ? 'var(--c-accent)' : 'var(--c-text-muted)',
                borderBottom: active ? '2px solid var(--c-accent)' : '2px solid transparent',
                marginBottom: -1,
              }}
              type="button"
            >
              <tab.icon style={{ width: 13, height: 13 }} />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading ? (
          <div className="max-w-[960px] space-y-5">
            <SkeletonCard rows={3} />
            <SkeletonCard rows={4} />
            <SkeletonCard rows={3} />
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-xl p-4" style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-border)' }}>
                  <Skeleton width="60%" height={14} style={{ marginBottom: 12 }} />
                  <Skeleton width="100%" height={36} borderRadius={8} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-[960px] space-y-5">
            {activeTab === 'general' && (
              <>
                {settingGroups.map((group) => (
                  <SettingsSection key={group.title} icon={<group.icon style={{ width: 14, height: 14 }} />} title={group.title}>
                    <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
                      {group.items.map((item, index) => (
                        <SettingFieldRow
                          key={item.key}
                          item={item}
                          value={settings[item.key] || (item.type === 'select' ? item.options[0]?.value : '')}
                          isLast={index === group.items.length - 1}
                          onChange={(value) => updateSetting(item.key, value)}
                        />
                      ))}
                    </div>
                  </SettingsSection>
                ))}

                <SettingsSection icon={<Monitor style={{ width: 14, height: 14 }} />} title={t('settings.theme', 'Theme')}>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'light' as ThemeMode, icon: Sun, label: t('settings.light', 'Light'), preview: { bg: '#f0f2f7', card: '#fff', accent: '#2363eb' } },
                      { value: 'dark' as ThemeMode, icon: Moon, label: t('settings.dark', 'Dark'), preview: { bg: '#0f1117', card: '#1a1d2e', accent: '#34d399' } },
                      { value: 'system' as ThemeMode, icon: MonitorSmartphone, label: t('settings.system', 'System'), preview: { bg: 'linear-gradient(135deg, #f0f2f7 50%, #0f1117 50%)', card: 'linear-gradient(135deg, #fff 50%, #1a1d2e 50%)', accent: 'linear-gradient(135deg, #2363eb 50%, #34d399 50%)' } },
                    ]).map((opt) => (
                      <ThemeButton
                        key={opt.value}
                        active={themeMode === opt.value}
                        icon={<opt.icon style={{ width: 12, height: 12 }} />}
                        label={opt.label}
                        preview={opt.preview}
                        onClick={() => updateSetting('app.theme', opt.value)}
                      />
                    ))}
                  </div>
                </SettingsSection>
              </>
            )}

            {activeTab === 'scan' && (
              <>
                <SettingsSection
                  icon={<ScanSearch style={{ width: 14, height: 14 }} />}
                  title={t('settings.scanDirectories', 'Skill scan directories')}
                  description={t('settings.scanDirectoriesDesc', 'Review and override where each core AI app stores SKILL.md folders.')}
                >
                  <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
                    {coreRows.map((row, index) => (
                      <ToolDirectoryRow
                        key={row.tool.id}
                        row={row}
                        isLast={index === coreRows.length - 1}
                        onBrowse={() => chooseFolder(`skills.${row.tool.id}.dir`)}
                      />
                    ))}
                  </div>
                </SettingsSection>

                <SettingsSection
                  icon={<FileSearch style={{ width: 14, height: 14 }} />}
                  title={t('settings.activityLogs', 'Session log parsing')}
                  description={t('settings.activityLogsDesc', 'Control which local app logs are used for usage statistics and recent activity.')}
                >
                  <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
                    {coreRows.map((row, index) => (
                      <LogSourceRow
                        key={row.tool.id}
                        row={row}
                        isLast={index === coreRows.length - 1}
                        onToggle={() => toggleSetting(`logs.${row.tool.id}.enabled`, 'true')}
                        onBrowse={() => chooseFolder(`logs.${row.tool.id}.path`)}
                      />
                    ))}
                  </div>
                </SettingsSection>
              </>
            )}

            {activeTab === 'validation' && (
              <div className="grid grid-cols-2 gap-4">
                <SettingsSection
                  icon={<Shield style={{ width: 14, height: 14 }} />}
                  title={t('settings.validation', 'Validation')}
                  description={t('settings.validationDesc', 'Keep imported skills readable and inspectable before syncing them.')}
                >
                  <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
                    <ToggleRow
                      icon={<Shield style={{ width: 14, height: 14 }} />}
                      title={t('settings.strictValidation', 'Strict SKILL.md validation')}
                      description={t('settings.strictValidationDesc', 'Require front matter, title and readable markdown content.')}
                      checked={(settings['validation.strict'] ?? 'true') === 'true'}
                      onToggle={() => toggleSetting('validation.strict', 'true')}
                    />
                    <ToggleRow
                      icon={<FolderCheck style={{ width: 14, height: 14 }} />}
                      title={t('settings.validateOnImport', 'Validate on import')}
                      description={t('settings.validateOnImportDesc', 'Run validation when importing folders or ZIP archives.')}
                      checked={(settings['validation.import'] ?? 'true') === 'true'}
                      onToggle={() => toggleSetting('validation.import', 'true')}
                    />
                    <ToggleRow
                      icon={<Eye style={{ width: 14, height: 14 }} />}
                      title={t('settings.showDiffs', 'Show content diffs')}
                      description={t('settings.showDiffsDesc', 'Keep version diff previews available in skill detail.')}
                      checked={(settings['validation.diff'] ?? 'true') === 'true'}
                      onToggle={() => toggleSetting('validation.diff', 'true')}
                      isLast
                    />
                  </div>
                </SettingsSection>

                <SettingsSection
                  icon={<SlidersHorizontal style={{ width: 14, height: 14 }} />}
                  title={t('settings.automation', 'Automation')}
                  description={t('settings.automationDesc', 'Tune the background refresh behavior for local skill state.')}
                >
                  <div className="glass-card overflow-hidden" style={{ borderRadius: 'var(--radius-md)' }}>
                    <ToggleRow
                      icon={<RefreshCw style={{ width: 14, height: 14 }} />}
                      title={t('settings.scanOnStartup', 'Scan on startup')}
                      description={t('settings.scanOnStartupDesc', 'Refresh skills, tools and sources when AetherDock opens.')}
                      checked={(settings['scan.onStartup'] ?? 'true') === 'true'}
                      onToggle={() => toggleSetting('scan.onStartup', 'true')}
                    />
                    <ToggleRow
                      icon={<Bell style={{ width: 14, height: 14 }} />}
                      title={t('settings.watchSkillDirs', 'Watch skill folders')}
                      description={t('settings.watchSkillDirsDesc', 'Detect local changes after edits from another editor.')}
                      checked={(settings['scan.watch'] ?? 'false') === 'true'}
                      onToggle={() => toggleSetting('scan.watch')}
                    />
                    <div className="flex items-center justify-between px-4 py-3.5" style={{ borderTop: '1px solid var(--c-border)' }}>
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="icon-box icon-box-muted" style={{ width: 28, height: 28 }}>
                          <Clock3 style={{ width: 14, height: 14 }} />
                        </span>
                        <div className="min-w-0">
                          <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650 }}>
                            {t('settings.scanInterval', 'Scan interval')}
                          </p>
                          <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 2 }}>
                            {t('settings.scanIntervalDesc', 'Used when folder watching is enabled.')}
                          </p>
                        </div>
                      </div>
                      <select
                        value={settings['scan.interval'] || 'manual'}
                        onChange={(event) => updateSetting('scan.interval', event.target.value)}
                        style={selectStyle}
                      >
                        <option value="manual">{t('settings.manualOnly', 'Manual only')}</option>
                        <option value="5m">{t('settings.fiveMinutes', 'Every 5 minutes')}</option>
                        <option value="15m">{t('settings.fifteenMinutes', 'Every 15 minutes')}</option>
                        <option value="1h">{t('settings.hourly', 'Hourly')}</option>
                      </select>
                    </div>
                  </div>
                </SettingsSection>
              </div>
            )}

            {activeTab === 'apps' && (
              <>
                <SettingsSection
                  icon={<Database style={{ width: 14, height: 14 }} />}
                  title={t('settings.coreApps', 'Core apps')}
                  description={t('settings.coreAppsDesc', 'Primary apps used by the Skills workbench matrix.')}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {CORE_SKILL_TOOLS.map((tool) => (
                      <CoreAppBadge key={tool.id} tool={tool} config={findCoreToolConfig(tools, tool)} />
                    ))}
                  </div>
                </SettingsSection>

                <SettingsSection icon={<Monitor style={{ width: 14, height: 14 }} />} title={t('settings.about', 'About')}>
                  <div className="glass-card p-4 space-y-3">
                    <InfoLine label={t('settings.version', 'Version')} value={APP_VERSION} />
                    <InfoLine label="Build" value="dev" />
                    <InfoLine label="Runtime" value="Wails v2" />
                  </div>
                </SettingsSection>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function SettingsSection({ icon, title, description, children }: { icon: ReactNode; title: string; description?: string; children: ReactNode }) {
  return (
    <section>
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div className="flex items-start gap-2">
          <span style={{ color: 'var(--c-text-faint)', marginTop: 1 }}>{icon}</span>
          <div>
            <h3 style={{ fontSize: 11, fontWeight: 700, color: 'var(--c-text-faint)', letterSpacing: '0.08em' }} className="uppercase">{title}</h3>
            {description ? (
              <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 3, lineHeight: 1.45 }}>{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      {children}
    </section>
  )
}

function ToolDirectoryRow({
  row,
  isLast,
  onBrowse,
}: {
  row: { tool: CoreSkillTool; config?: ToolConfig; skillDir: string }
  isLast: boolean
  onBrowse: () => void
}) {
  const { t } = useTranslation()
  const icon = getToolIconFor(row.tool)
  return (
    <div
      className="grid items-center gap-3 px-4 py-3.5"
      style={{ gridTemplateColumns: '210px minmax(0, 1fr) 84px', borderBottom: isLast ? undefined : '1px solid var(--c-border)' }}
    >
      <ToolLabel tool={row.tool} icon={icon} config={row.config} />
      <span className="truncate" style={{ fontSize: 11, color: row.skillDir ? 'var(--c-text-secondary)' : 'var(--c-text-faint)', fontFamily: 'monospace' }}>
        {row.skillDir ? shortPath(row.skillDir) : t('settings.notConfigured', 'Not configured')}
      </span>
      <button className="rounded-md px-2.5 py-1.5 text-[10px] font-semibold" style={smallButtonStyle} onClick={onBrowse} type="button">
        {t('settings.browse', 'Browse')}
      </button>
    </div>
  )
}

function LogSourceRow({
  row,
  isLast,
  onToggle,
  onBrowse,
}: {
  row: { tool: CoreSkillTool; config?: ToolConfig; logPath: string; logEnabled: boolean }
  isLast: boolean
  onToggle: () => void
  onBrowse: () => void
}) {
  const { t } = useTranslation()
  const icon = getToolIconFor(row.tool)
  return (
    <div
      className="grid items-center gap-3 px-4 py-3.5"
      style={{ gridTemplateColumns: '210px 86px minmax(0, 1fr) 84px', borderBottom: isLast ? undefined : '1px solid var(--c-border)' }}
    >
      <ToolLabel tool={row.tool} icon={icon} config={row.config} />
      <Switch checked={row.logEnabled} onClick={onToggle} />
      <span className="truncate" style={{ fontSize: 11, color: row.logPath ? 'var(--c-text-secondary)' : 'var(--c-text-faint)', fontFamily: 'monospace' }}>
        {row.logPath ? shortPath(row.logPath) : t('settings.notConfigured', 'Not configured')}
      </span>
      <button className="rounded-md px-2.5 py-1.5 text-[10px] font-semibold" style={smallButtonStyle} onClick={onBrowse} type="button">
        {t('settings.browse', 'Browse')}
      </button>
    </div>
  )
}

function ToolLabel({ tool, icon, config }: { tool: CoreSkillTool; icon?: string; config?: ToolConfig }) {
  const { t } = useTranslation()
  const detected = config?.isDetected
  const enabled = config?.isEnabled
  return (
    <div className="flex items-center gap-3 min-w-0">
      {icon ? (
        <img src={icon} alt={tool.label} style={{ width: 24, height: 24 }} className="rounded object-contain shrink-0" />
      ) : (
        <span className="flex items-center justify-center rounded-md shrink-0" style={{ width: 24, height: 24, background: tool.soft, color: tool.color, fontSize: 10, fontWeight: 750 }}>
          {tool.label.slice(0, 1)}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate" style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650 }}>{tool.label}</p>
        <p style={{ fontSize: 10, color: detected ? 'var(--c-green)' : 'var(--c-text-faint)', marginTop: 1 }}>
          {detected ? (enabled ? t('settings.enabled', 'Enabled') : t('settings.detected', 'Detected')) : t('settings.notDetected', 'Not detected')}
        </p>
      </div>
    </div>
  )
}

function ToggleRow({
  icon,
  title,
  description,
  checked,
  onToggle,
  isLast,
}: {
  icon: ReactNode
  title: string
  description: string
  checked: boolean
  onToggle: () => void
  isLast?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5" style={{ borderBottom: isLast ? undefined : '1px solid var(--c-border)' }}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="icon-box icon-box-muted" style={{ width: 28, height: 28 }}>
          {icon}
        </span>
        <div className="min-w-0">
          <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650 }}>{title}</p>
          <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 2, lineHeight: 1.45 }}>{description}</p>
        </div>
      </div>
      <Switch checked={checked} onClick={onToggle} />
    </div>
  )
}

function SettingFieldRow({ item, value, isLast, onChange }: { item: SettingField; value: string; isLast: boolean; onChange: (value: string) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3.5" style={{ borderBottom: isLast ? undefined : '1px solid var(--c-border)' }}>
      <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 600 }}>{item.label}</span>
      {item.type === 'select' ? (
        <select style={selectStyle} value={value} onChange={(event) => onChange(event.target.value)}>
          {item.options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ) : (
        <input
          type="text"
          style={inputStyle}
          placeholder={item.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
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

function CoreAppBadge({ tool, config }: { tool: CoreSkillTool; config?: ToolConfig }) {
  const icon = getToolIconFor(tool)
  return (
    <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}>
      {icon ? (
        <img src={icon} alt={tool.label} style={{ width: 18, height: 18 }} className="rounded object-contain shrink-0" />
      ) : (
        <span className="flex items-center justify-center rounded-md shrink-0" style={{ width: 18, height: 18, background: tool.soft, color: tool.color, fontSize: 9, fontWeight: 750 }}>
          {tool.label.slice(0, 1)}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate" style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650 }}>{tool.label}</p>
        <p style={{ fontSize: 10, color: config?.isDetected ? 'var(--c-green)' : 'var(--c-text-faint)' }}>
          {config?.displayName || tool.toolName}
        </p>
      </div>
    </div>
  )
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{label}</span>
      <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}>{value}</span>
    </div>
  )
}

function findCoreToolConfig(tools: ToolConfig[], tool: CoreSkillTool): ToolConfig | undefined {
  return tools.find((item) => normalizeToolKey(item.toolName) === tool.id || normalizeToolKey(item.displayName) === tool.id)
}

function deriveLogPath(config?: ToolConfig): string {
  if (!config) return ''
  const base = config.configPath || config.skillDir || config.mcpDir
  if (!base) return ''
  const parent = base.replace(/[\\/][^\\/]*$/u, '')
  return parent ? `${parent}/logs` : ''
}

const selectStyle = {
  padding: '7px 10px',
  background: 'var(--c-bg-input)',
  border: '1px solid var(--c-border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 12,
  color: 'var(--c-text-secondary)',
  outline: 'none',
  width: 150,
} satisfies CSSProperties

const inputStyle = {
  ...selectStyle,
  width: 170,
  fontFamily: 'monospace',
} satisfies CSSProperties

const smallButtonStyle = {
  color: 'var(--c-accent)',
  background: 'var(--c-accent-soft)',
  border: 'none',
} satisfies CSSProperties
