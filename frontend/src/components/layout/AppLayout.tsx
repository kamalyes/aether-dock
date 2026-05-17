import { NavLink, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { APP_VERSION } from '@/constants/app'
import {
  LayoutDashboard,
  Zap,
  Server,
  Wrench,
  Download,
  Settings,
  Hexagon,
  Layers,
  Command,
} from 'lucide-react'
import ToastContainer from '@/components/ui/ToastContainer'
import CommandPalette from '@/components/ui/CommandPalette'
import { useThemeStore } from '@/stores/themeStore'

export default function AppLayout() {
  const { t } = useTranslation()
  const initTheme = useThemeStore((s) => s.init)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const mainNav = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard'), end: true },
    { to: '/skills', icon: Zap, label: t('nav.skills') },
    { to: '/mcp', icon: Server, label: t('nav.mcp') },
  ]

  const toolNav = [
    { to: '/tools', icon: Wrench, label: t('nav.tools') },
    { to: '/install', icon: Download, label: t('nav.install') },
  ]

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--c-bg)' }}>
      <aside
        className="w-[200px] flex flex-col shrink-0"
        style={{
          background: 'var(--gradient-sidebar)',
          borderRight: '1px solid var(--c-border)',
        }}
      >
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3">
          <div className="icon-box icon-box-accent" style={{ width: 28, height: 28, borderRadius: 8 }}>
            <Hexagon style={{ width: 14, height: 14 }} />
          </div>
          <div>
            <h1 style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{t('brand.name')}</h1>
            <p style={{ color: 'var(--c-text-faint)', fontSize: 9, lineHeight: 'tight', marginTop: 2 }}>{t('brand.subtitle')}</p>
          </div>
        </div>

        <div className="px-3 pt-1 pb-1">
          <span className="section-label px-2">Manage</span>
        </div>

        <nav className="px-2 space-y-0.5">
          {mainNav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2.5 py-[7px] rounded-lg transition-all duration-150 ${
                  isActive ? 'nav-link-active' : 'nav-link'
                }`
              }
            >
              <Icon style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pt-4 pb-1">
          <span className="section-label px-2">Workspace</span>
        </div>

        <nav className="px-2 space-y-0.5">
          {toolNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2.5 py-[7px] rounded-lg transition-all duration-150 ${
                  isActive ? 'nav-link-active' : 'nav-link'
                }`
              }
            >
              <Icon style={{ width: 14, height: 14 }} />
              <span style={{ fontSize: 12.5, fontWeight: 500 }}>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <nav className="px-2 pb-1">
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-2.5 py-[7px] rounded-lg transition-all duration-150 ${
                isActive ? 'nav-link-active' : 'nav-link'
              }`
            }
          >
            <Settings style={{ width: 14, height: 14 }} />
            <span style={{ fontSize: 12.5, fontWeight: 500 }}>{t('nav.settings')}</span>
          </NavLink>
        </nav>

        <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--c-border)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers style={{ width: 12, height: 12, color: 'var(--c-text-faint)' }} />
              <span style={{ fontSize: 10, color: 'var(--c-text-faint)', fontFamily: 'var(--font-mono, monospace)' }}>v{APP_VERSION}</span>
            </div>
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
            >
              <Command style={{ width: 9, height: 9, color: 'var(--c-text-faint)' }} />
              <span style={{ fontSize: 9, color: 'var(--c-text-faint)' }}>⇧P</span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-hidden">
        <Outlet />
      </main>
      <ToastContainer />
      <CommandPalette />
    </div>
  )
}
