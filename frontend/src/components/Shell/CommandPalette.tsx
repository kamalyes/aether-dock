import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Zap,
  Server,
  Wrench,
  Download,
  Settings,
  LayoutDashboard,
  MonitorSmartphone,
  Moon,
  Sun,
  RefreshCw,
  FolderOpen,
  Command,
  ArrowRight,
} from 'lucide-react'
import { useSkillStore } from '@/stores/skillStore'
import { useMcpStore } from '@/stores/mcpStore'
import { THEME_SETTING_KEYS, useThemeStore, type ThemeMode } from '@/stores/themeStore'
import { wailsApi } from '@/services/wailsBridge'
import { motion, AnimatePresence } from 'framer-motion'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: typeof Zap
  color?: string
  action: () => void
  category: 'nav' | 'skill' | 'mcp' | 'action' | 'theme'
}

export default function CommandPalette() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { skills, fetchSkills } = useSkillStore()
  const { servers, fetchServers } = useMcpStore()
  const setThemeMode = useThemeStore((s) => s.setMode)

  const switchThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode)
    void wailsApi.setSetting(THEME_SETTING_KEYS.mode, mode)
    setOpen(false)
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setOpen((prev) => !prev)
        if (!open) {
          setQuery('')
          setSelectedIndex(0)
        }
      }
      if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const commands: CommandItem[] = [
    { id: 'nav-dashboard', label: t('nav.dashboard'), icon: LayoutDashboard, category: 'nav', action: () => { navigate('/'); setOpen(false) } },
    { id: 'nav-skills', label: t('nav.skills'), icon: Zap, category: 'nav', action: () => { navigate('/skills'); setOpen(false) } },
    { id: 'nav-mcp', label: t('nav.mcp'), icon: Server, category: 'nav', action: () => { navigate('/mcp'); setOpen(false) } },
    { id: 'nav-tools', label: t('nav.tools'), icon: Wrench, category: 'nav', action: () => { navigate('/tools'); setOpen(false) } },
    { id: 'nav-install', label: t('nav.install'), icon: Download, category: 'nav', action: () => { navigate('/install'); setOpen(false) } },
    { id: 'nav-settings', label: t('nav.settings'), icon: Settings, category: 'nav', action: () => { navigate('/settings'); setOpen(false) } },
    { id: 'action-refresh', label: t('cmd.refreshData'), description: t('cmd.refreshDataDesc'), icon: RefreshCw, category: 'action', action: async () => { await Promise.all([fetchSkills(), fetchServers()]); setOpen(false) } },
    { id: 'action-install-git', label: t('cmd.installGit'), icon: FolderOpen, category: 'action', action: () => { navigate('/install?tab=git'); setOpen(false) } },
    { id: 'action-install-local', label: t('cmd.installLocal'), icon: FolderOpen, category: 'action', action: () => { navigate('/install?tab=local'); setOpen(false) } },
    { id: 'action-add-mcp', label: t('cmd.addMcp'), icon: Server, category: 'action', action: () => { navigate('/install?tab=mcp'); setOpen(false) } },
    { id: 'theme-light', label: t('cmd.themeLight'), icon: Sun, category: 'theme', action: () => switchThemeMode('light') },
    { id: 'theme-dark', label: t('cmd.themeDark'), icon: Moon, category: 'theme', action: () => switchThemeMode('dark') },
    { id: 'theme-system', label: t('cmd.themeSystem'), icon: MonitorSmartphone, category: 'theme', action: () => switchThemeMode('system') },
    ...skills.map((skill) => ({
      id: `skill-${skill.id}`,
      label: skill.name,
      description: skill.description,
      icon: Zap,
      color: skill.status === 'installed' ? 'var(--c-green)' : skill.status === 'error' ? 'var(--c-red)' : 'var(--c-amber)',
      category: 'skill' as const,
      action: () => { navigate('/skills'); setOpen(false) },
    })),
    ...servers.map((server) => ({
      id: `mcp-${server.id}`,
      label: server.name,
      description: server.description,
      icon: Server,
      color: server.status === 'enabled' ? 'var(--c-green)' : 'var(--c-text-faint)',
      category: 'mcp' as const,
      action: () => { navigate('/mcp'); setOpen(false) },
    })),
  ]

  const filtered = query
    ? commands.filter((cmd) => {
        const q = query.toLowerCase()
        return cmd.label.toLowerCase().includes(q) || cmd.description?.toLowerCase().includes(q) || cmd.category.includes(q)
      })
    : commands

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    const key = cmd.category
    if (!acc[key]) acc[key] = []
    acc[key].push(cmd)
    return acc
  }, {})

  const categoryOrder = ['nav', 'action', 'theme', 'skill', 'mcp']
  const categoryLabels: Record<string, string> = {
    nav: t('cmd.catNav'),
    action: t('cmd.catAction'),
    theme: t('cmd.catTheme'),
    skill: t('cmd.catSkill'),
    mcp: t('cmd.catMcp'),
  }

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      filtered[selectedIndex].action()
    }
  }, [filtered, selectedIndex])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    if (listRef.current) {
      const selected = listRef.current.querySelector('[data-selected="true"]')
      selected?.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  let flatIndex = -1

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[100]"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[101] flex items-start justify-center"
            style={{ inset: 0, paddingTop: '18vh', pointerEvents: 'none' }}
          >
            <div
              style={{
                width: 520,
                pointerEvents: 'auto',
                background: 'var(--c-bg-card)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px var(--c-border)',
                overflow: 'hidden',
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: '1px solid var(--c-border)' }}
              >
                <Search style={{ width: 16, height: 16, color: 'var(--c-text-faint)', flexShrink: 0 }} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('cmd.placeholder')}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: 14,
                    color: 'var(--c-text)',
                  }}
                />
                <kbd
                  style={{
                    fontSize: 10,
                    padding: '2px 6px',
                    borderRadius: 4,
                    background: 'var(--c-bg-input)',
                    border: '1px solid var(--c-border)',
                    color: 'var(--c-text-faint)',
                    fontFamily: 'inherit',
                  }}
                >
                  ESC
                </kbd>
              </div>

              <div
                ref={listRef}
                className="overflow-y-auto py-2"
                style={{ maxHeight: 360 }}
              >
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center py-8">
                    <Search style={{ width: 24, height: 24, color: 'var(--c-text-faint)', marginBottom: 8 }} />
                    <p style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>{t('cmd.noResults')}</p>
                  </div>
                ) : (
                  categoryOrder.map((cat) => {
                    const items = grouped[cat]
                    if (!items) return null
                    return (
                      <div key={cat}>
                        <div className="px-4 py-1.5">
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            {categoryLabels[cat] || cat}
                          </span>
                        </div>
                        {items.map((cmd) => {
                          flatIndex++
                          const idx = flatIndex
                          const isSelected = idx === selectedIndex
                          return (
                            <div
                              key={cmd.id}
                              data-selected={isSelected}
                              className="flex items-center gap-3 px-4 py-2 mx-2 rounded-lg cursor-pointer transition-colors"
                              style={{
                                background: isSelected ? 'var(--c-accent-soft)' : 'transparent',
                              }}
                              onClick={() => cmd.action()}
                              onMouseEnter={() => setSelectedIndex(idx)}
                            >
                              <div
                                className="flex items-center justify-center shrink-0"
                                style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 6,
                                  background: isSelected ? 'var(--c-accent-soft)' : 'var(--c-bg-input)',
                                }}
                              >
                                <cmd.icon style={{ width: 14, height: 14, color: cmd.color || (isSelected ? 'var(--c-accent)' : 'var(--c-text-muted)') }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span style={{ fontSize: 12, fontWeight: 500, color: isSelected ? 'var(--c-accent)' : 'var(--c-text)' }}>{cmd.label}</span>
                                {cmd.description && (
                                  <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 1 }} className="truncate">{cmd.description}</p>
                                )}
                              </div>
                              {isSelected && (
                                <ArrowRight style={{ width: 12, height: 12, color: 'var(--c-accent)', flexShrink: 0 }} />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )
                  })
                )}
              </div>

              <div
                className="flex items-center gap-4 px-4 py-2"
                style={{ borderTop: '1px solid var(--c-border)', background: 'var(--c-bg-elevated)' }}
              >
                <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                  <kbd style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}>↑↓</kbd>
                  {t('cmd.navigate')}
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                  <kbd style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}>↵</kbd>
                  {t('cmd.select')}
                </span>
                <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                  <kbd style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}>esc</kbd>
                  {t('cmd.close')}
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
