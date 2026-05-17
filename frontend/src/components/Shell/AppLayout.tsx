import { Link, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEffect } from 'react'
import { APP_VERSION } from '@/constants/app'
import {
  Activity,
  Command,
  Download,
  Hexagon,
  Layers,
  LayoutDashboard,
  Settings,
  Server,
  Store,
  Upload,
  Wrench,
  Zap,
} from 'lucide-react'
import { ToastContainer } from '@/components/Toast'
import CommandPalette from './CommandPalette'
import SidebarScanWidget from './SidebarScanWidget'
import { useThemeStore } from '@/stores/themeStore'

interface NavItem {
  to: string
  icon: typeof LayoutDashboard
  label: string
  end?: boolean
}

export default function AppLayout() {
  const { t } = useTranslation()
  const location = useLocation()
  const initTheme = useThemeStore((s) => s.init)

  useEffect(() => {
    initTheme()
  }, [initTheme])

  const mainNav: NavItem[] = [
    { to: '/', icon: LayoutDashboard, label: t('nav.dashboard', 'Dashboard'), end: true },
    { to: '/skills', icon: Zap, label: t('nav.skills', 'Skills') },
    { to: '/skills?view=market', icon: Store, label: t('skills.viewMarket', 'Market') },
    { to: '/skills?view=transfer', icon: Upload, label: t('skills.viewTransfer', 'Import / Export') },
    { to: '/skills?view=usage', icon: Activity, label: t('skills.viewUsage', 'Usage') },
    { to: '/mcp', icon: Server, label: t('nav.mcp', 'MCP') },
  ]

  const workspaceNav: NavItem[] = [
    { to: '/tools', icon: Wrench, label: t('nav.tools', 'Tools') },
    { to: '/install', icon: Download, label: t('nav.install', 'Install') },
  ]

  const isActive = (item: NavItem) => {
    const url = new URL(item.to, 'http://aether.local')
    if (item.end && location.pathname !== url.pathname) return false
    if (!item.end && location.pathname !== url.pathname) return false

    const desiredView = url.searchParams.get('view')
    if (url.pathname === '/skills') {
      const currentView = new URLSearchParams(location.search).get('view')
      return desiredView ? currentView === desiredView : !currentView || currentView === 'library'
    }
    return true
  }

  return (
    <div className="flex h-screen w-screen gap-2.5 overflow-hidden p-1.5" style={{ backgroundColor: 'var(--c-bg)' }}>
      <aside
        className="w-[198px] flex flex-col shrink-0 rounded-lg"
        style={{
          background: 'var(--gradient-sidebar)',
          border: '1px solid var(--c-border)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div className="flex items-center gap-2.5 px-4 pt-5 pb-5">
          <div className="icon-box icon-box-accent" style={{ width: 34, height: 34, borderRadius: 9 }}>
            <Hexagon style={{ width: 17, height: 17 }} />
          </div>
          <div className="min-w-0">
            <h1 className="truncate" style={{ color: 'var(--c-text)', fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{t('brand.name')}</h1>
            <p className="truncate" style={{ color: 'var(--c-text-faint)', fontSize: 10, lineHeight: 1.2, marginTop: 4 }}>{t('brand.subtitle')}</p>
          </div>
        </div>

        <nav className="grid gap-1 px-3">
          {mainNav.map((item) => (
            <SideNavLink key={item.to} item={item} active={isActive(item)} />
          ))}
        </nav>

        <div className="px-4 pt-5 pb-2">
          <span className="section-label px-1">Workspace</span>
        </div>

        <nav className="grid gap-1 px-3">
          {workspaceNav.map((item) => (
            <SideNavLink key={item.to} item={item} active={isActive(item)} />
          ))}
        </nav>

        <div className="flex-1" />

        <nav className="grid gap-1 px-3 pb-2">
          <SideNavLink
            item={{ to: '/settings', icon: Settings, label: t('nav.settings', 'Settings') }}
            active={location.pathname === '/settings'}
          />
        </nav>

        <div className="px-3 pb-3 pt-2">
          <SidebarScanWidget />
        </div>

        <div className="px-4 py-2.5" style={{ borderTop: '1px solid var(--c-border)' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Layers style={{ width: 12, height: 12, color: 'var(--c-text-faint)' }} />
              <span style={{ fontSize: 10, color: 'var(--c-text-faint)', fontFamily: 'var(--font-mono, monospace)' }}>v{APP_VERSION}</span>
            </div>
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded"
              style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
            >
              <Command style={{ width: 9, height: 9, color: 'var(--c-text-faint)' }} />
              <span style={{ fontSize: 9, color: 'var(--c-text-faint)' }}>⇧⌘P</span>
            </div>
          </div>
        </div>
      </aside>

      <main
        className="flex-1 overflow-hidden rounded-lg"
        style={{ background: 'var(--c-bg-panel)', border: '1px solid var(--c-border)', boxShadow: 'var(--shadow-card)' }}
      >
        <Outlet />
      </main>
      <ToastContainer />
      <CommandPalette />
    </div>
  )
}

function SideNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      className={`flex h-[34px] items-center gap-2.5 rounded-md px-3 transition-all duration-150 ${
        active ? 'nav-link-active' : 'nav-link'
      }`}
    >
      <Icon style={{ width: 16, height: 16 }} />
      <span className="truncate" style={{ fontSize: 13, fontWeight: active ? 750 : 600 }}>{item.label}</span>
    </Link>
  )
}
