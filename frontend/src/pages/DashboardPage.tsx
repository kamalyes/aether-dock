import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import {
  Activity,
  AlertCircle,
  Archive,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Download,
  FolderPlus,
  Globe,
  Loader2,
  RefreshCw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Wrench,
  Zap,
} from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import type { Skill } from '@/types'
import { useSkillStore } from '@/stores/skillStore'
import { useMcpStore } from '@/stores/mcpStore'
import { useToolStore } from '@/stores/toolStore'
import { wailsApi } from '@/services/wailsBridge'
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/Motion'
import { EntityEmptyState } from '@/components/Empty'
import { QuickAction, StatsCard } from '@/components/Card'
import { Skeleton, SkeletonCard } from '@/components/Loading'
import {
  CORE_SKILL_TOOLS,
  formatSkillDate,
  getSkillUsage,
  isSkillEnabledForTool,
  normalizeToolKey,
  shortPath,
} from '@/components/Skills'

interface ActivityRecord {
  id: string
  type: string
  targetName: string
  targetType: string
  toolName: string
  detail: string
  createdAt: string
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { skills, total: skillTotal, sources, fetchSkills, fetchSources, error: skillError } = useSkillStore()
  const { servers, total: mcpTotal, fetchServers, error: mcpError } = useMcpStore()
  const { tools, fetchTools, error: toolError } = useToolStore()
  const [activities, setActivities] = useState<ActivityRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasError, setHasError] = useState(false)

  const loadActivities = async () => {
    const resp = await wailsApi.listActivities(80)
    if (resp.success && resp.data) {
      setActivities(resp.data)
    }
  }

  const init = useCallback(async () => {
    setLoading(true)
    setHasError(false)
    await Promise.all([fetchSkills(), fetchSources(), fetchServers(), fetchTools(), loadActivities()])
    setLoading(false)
  }, [fetchSkills, fetchSources, fetchServers, fetchTools])

  const refreshAll = async () => {
    setRefreshing(true)
    await Promise.all([fetchSkills(), fetchSources(), fetchServers(), fetchTools(), loadActivities()])
    setRefreshing(false)
  }

  useEffect(() => {
    void init()
  }, [init])

  useEffect(() => {
    if (!loading && (skillError || mcpError || toolError)) {
      setHasError(true)
    }
  }, [loading, mcpError, skillError, toolError])

  const dashboard = useMemo(() => {
    const installedCount = skills.filter((skill) => skill.status === 'installed').length
    const updateCount = skills.filter((skill) => skill.status === 'update_available').length
    const errorCount = skills.filter((skill) => skill.status === 'error').length
    const modifiedCount = skills.filter((skill) => skill.status === 'modified').length
    const enabledMcp = servers.filter((server) => server.status === 'enabled').length
    const detectedTools = tools.filter((tool) => tool.isDetected).length
    const enabledTools = tools.filter((tool) => tool.isEnabled).length
    const appStats = CORE_SKILL_TOOLS.map((tool) => {
      const detected = tools.some((item) => normalizeToolKey(item.toolName) === tool.id || normalizeToolKey(item.displayName) === tool.id)
      return {
        tool,
        detected,
        count: skills.filter((skill) => isSkillEnabledForTool(skill, tool)).length,
      }
    })
    const totalAppInstalls = appStats.reduce((sum, item) => sum + item.count, 0)
    const totalCalls = skills.reduce((sum, skill) => sum + getSkillUsage(skill), 0)
    const topSkills = [...skills]
      .map((skill) => ({ skill, calls: getSkillUsage(skill) }))
      .sort((left, right) => right.calls - left.calls)
      .slice(0, 6)
    const recentSkills = [...skills]
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime())
      .slice(0, 5)
    const lastScan = latestDate([
      ...activities.map((activity) => activity.createdAt),
      ...skills.map((skill) => skill.updatedAt),
    ])

    return {
      installedCount,
      updateCount,
      errorCount,
      modifiedCount,
      enabledMcp,
      detectedTools,
      enabledTools,
      appStats,
      totalAppInstalls,
      totalCalls,
      topSkills,
      recentSkills,
      lastScan,
    }
  }, [activities, servers, skills, tools])

  const trend = useMemo(() => buildSevenDayTrend(activities), [activities])

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-[1320px] mx-auto px-5 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton width={160} height={20} />
              <Skeleton width={260} height={12} style={{ marginTop: 6 }} />
            </div>
            <Skeleton width={92} height={34} />
          </div>
          <div className="grid grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} rows={2} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard rows={5} />
            <SkeletonCard rows={5} />
          </div>
        </div>
      </div>
    )
  }

  if (hasError && skills.length === 0 && servers.length === 0 && tools.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center" style={{ maxWidth: 340 }}>
          <AlertCircle style={{ width: 48, height: 48, color: 'var(--c-amber)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--c-text)', fontSize: 15, fontWeight: 650, marginBottom: 6 }}>
            {t('dashboard.loadFailed', 'Failed to load data')}
          </p>
          <p style={{ color: 'var(--c-text-muted)', fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
            {skillError || mcpError || toolError || t('dashboard.runtimeUnavailable', 'Wails runtime not available')}
          </p>
          <button
            onClick={init}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-medium transition-all"
            style={{ background: 'var(--c-accent)', color: '#fff', border: 'none' }}
            type="button"
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            {t('dashboard.retry', 'Retry')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1320px] mx-auto px-5 py-5 space-y-4">
        <FadeIn>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="icon-box icon-box-accent" style={{ width: 32, height: 32 }}>
                  <Sparkles style={{ width: 16, height: 16 }} />
                </span>
                <div>
                  <h1 style={{ color: 'var(--c-text)', fontSize: 18, fontWeight: 750 }}>
                    {t('dashboard.title', 'Dashboard')}
                  </h1>
                  <p style={{ color: 'var(--c-text-muted)', fontSize: 12, marginTop: 2 }}>
                    {t('dashboard.workbenchSubtitle', 'A control room for skill health, app coverage and usage signals.')}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={refreshAll}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold"
              style={{ color: 'var(--c-text-secondary)', background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
              type="button"
            >
              {refreshing ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <RefreshCw style={{ width: 14, height: 14 }} />}
              {t('dashboard.refresh', 'Refresh')}
            </button>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-6 gap-3" staggerDelay={0.04}>
          <StaggerItem>
            <StatsCard
              icon={<Zap style={{ width: 17, height: 17 }} />}
              label={t('dashboard.skills', 'Skills')}
              value={skillTotal || skills.length}
              subtitle={t('dashboard.skillsSub', '{{installed}} installed', { installed: dashboard.installedCount })}
              color="accent"
              onClick={() => navigate('/skills')}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              icon={<Server style={{ width: 17, height: 17 }} />}
              label={t('dashboard.mcp', 'MCP Servers')}
              value={mcpTotal || servers.length}
              subtitle={t('dashboard.mcpSub', '{{enabled}} enabled', { enabled: dashboard.enabledMcp })}
              color="violet"
              onClick={() => navigate('/mcp')}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              icon={<Archive style={{ width: 17, height: 17 }} />}
              label={t('dashboard.sources', 'Sources')}
              value={sources.length}
              subtitle={t('dashboard.sourcesSub', 'configured')}
              color="green"
              onClick={() => navigate('/skills')}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              icon={<Wrench style={{ width: 17, height: 17 }} />}
              label={t('dashboard.tools', 'Tools')}
              value={dashboard.detectedTools}
              subtitle={t('dashboard.toolsDetectedSub', '{{enabled}} enabled', { enabled: dashboard.enabledTools })}
              color="amber"
              onClick={() => navigate('/tools')}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              icon={<BarChart3 style={{ width: 17, height: 17 }} />}
              label={t('dashboard.appInstalls', 'App installs')}
              value={dashboard.totalAppInstalls}
              subtitle={t('dashboard.coreApps', 'Core apps')}
              color="cyan"
              onClick={() => navigate('/skills')}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              icon={<TrendingUp style={{ width: 17, height: 17 }} />}
              label={t('dashboard.skillCalls', 'Skill calls')}
              value={dashboard.totalCalls}
              subtitle={t('dashboard.estimated', 'Estimated')}
              color="green"
              onClick={() => navigate('/skills?view=usage')}
            />
          </StaggerItem>
        </StaggerContainer>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(360px, 0.8fr)' }}>
          <FadeIn delay={0.1}>
            <section className="glass-card p-4 h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="icon-box icon-box-green" style={{ width: 30, height: 30 }}>
                    <ShieldCheck style={{ width: 15, height: 15 }} />
                  </span>
                  <div>
                    <h2 style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 700 }}>
                      {t('dashboard.scanStatus', 'Scan status')}
                    </h2>
                    <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 2 }}>
                      {dashboard.lastScan ? t('dashboard.lastScanAt', 'Last scan {{time}}', { time: formatSkillDate(dashboard.lastScan) }) : t('dashboard.notScannedYet', 'Not scanned yet')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/skills')}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-semibold"
                  style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)', border: 'none' }}
                  type="button"
                >
                  {t('dashboard.openSkills', 'Open Skills')}
                  <ArrowRight style={{ width: 12, height: 12 }} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <MiniStatus label={t('dashboard.foundSkills', 'Found skills')} value={skills.length} tone="accent" />
                <MiniStatus label={t('dashboard.scanDirs', 'Scan dirs')} value={sources.length} tone="green" />
                <MiniStatus label={t('dashboard.changedSkills', 'Changed')} value={dashboard.modifiedCount + dashboard.updateCount} tone="amber" />
                <MiniStatus label={t('dashboard.issues', 'Issues')} value={dashboard.errorCount} tone={dashboard.errorCount > 0 ? 'red' : 'green'} />
              </div>

              <div className="space-y-3">
                {dashboard.appStats.map(({ tool, count, detected }) => (
                  <div key={tool.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center rounded-md" style={{ width: 22, height: 22, background: tool.soft, color: tool.color, fontSize: 10, fontWeight: 750 }}>
                          {tool.label.slice(0, 1)}
                        </span>
                        <span style={{ color: 'var(--c-text-secondary)', fontSize: 12, fontWeight: 650 }}>{tool.label}</span>
                        <span style={{ color: detected ? 'var(--c-green)' : 'var(--c-text-faint)', fontSize: 10 }}>
                          {detected ? t('dashboard.detected', 'Detected') : t('dashboard.notDetected', 'Not detected')}
                        </span>
                      </div>
                      <span style={{ color: 'var(--c-text-muted)', fontSize: 11 }}>{count}</span>
                    </div>
                    <div className="rounded-full overflow-hidden" style={{ height: 7, background: 'var(--c-bg-input)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${skills.length > 0 ? Math.max(5, (count / skills.length) * 100) : 0}%`,
                          background: tool.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.15}>
            <section className="glass-card p-4 h-full">
              <h2 style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                {t('dashboard.appInstallChart', 'App install matrix')}
              </h2>
              <ReactECharts
                option={{
                  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                  grid: { left: 28, right: 12, top: 18, bottom: 34 },
                  xAxis: {
                    type: 'category',
                    data: dashboard.appStats.map(({ tool }) => tool.label),
                    axisLabel: { fontSize: 10, color: 'var(--c-text-faint)' },
                    axisTick: { show: false },
                    axisLine: { lineStyle: { color: 'var(--c-border)' } },
                  },
                  yAxis: {
                    type: 'value',
                    axisLabel: { fontSize: 10, color: 'var(--c-text-faint)' },
                    splitLine: { lineStyle: { color: 'var(--c-border)' } },
                  },
                  series: [{
                    type: 'bar',
                    barWidth: 32,
                    data: dashboard.appStats.map(({ tool, count }) => ({
                      value: count,
                      itemStyle: { color: tool.color, borderRadius: [6, 6, 0, 0] },
                    })),
                  }],
                }}
                style={{ height: 220 }}
              />
            </section>
          </FadeIn>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 300px 300px' }}>
          <FadeIn delay={0.2}>
            <section className="glass-card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 700 }}>
                  {t('dashboard.usageTrend7d', '7-day usage trend')}
                </h2>
                <span style={{ color: 'var(--c-text-faint)', fontSize: 10 }}>{t('dashboard.localActivity', 'Local activity')}</span>
              </div>
              <ReactECharts
                option={{
                  tooltip: { trigger: 'axis' },
                  grid: { left: 32, right: 14, top: 18, bottom: 28 },
                  xAxis: {
                    type: 'category',
                    data: trend.map((item) => item.label),
                    boundaryGap: false,
                    axisLabel: { fontSize: 10, color: 'var(--c-text-faint)' },
                    axisLine: { lineStyle: { color: 'var(--c-border)' } },
                  },
                  yAxis: {
                    type: 'value',
                    axisLabel: { fontSize: 10, color: 'var(--c-text-faint)' },
                    splitLine: { lineStyle: { color: 'var(--c-border)' } },
                  },
                  series: [{
                    type: 'line',
                    smooth: true,
                    symbolSize: 7,
                    areaStyle: { color: 'rgba(35, 99, 235, 0.10)' },
                    lineStyle: { width: 3, color: 'var(--c-accent)' },
                    itemStyle: { color: 'var(--c-accent)' },
                    data: trend.map((item) => item.count),
                  }],
                }}
                style={{ height: 230 }}
              />
            </section>
          </FadeIn>

          <FadeIn delay={0.25}>
            <section className="glass-card p-4">
              <h2 style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                {t('dashboard.topSkills', 'Top skills')}
              </h2>
              <div className="space-y-3">
                {dashboard.topSkills.length === 0 ? (
                  <EntityEmptyState icon={<Zap style={{ width: 24, height: 24 }} />} title={t('dashboard.noSkills', 'No skills yet')} />
                ) : dashboard.topSkills.map(({ skill, calls }, index) => (
                  <TopSkillRow key={skill.id} skill={skill} value={calls} index={index} />
                ))}
              </div>
            </section>
          </FadeIn>

          <FadeIn delay={0.3}>
            <section className="glass-card overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
                <h2 style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 700 }}>
                  {t('dashboard.recentChanges', 'Recent changes')}
                </h2>
                <button
                  onClick={() => navigate('/skills')}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold"
                  style={{ color: 'var(--c-accent)' }}
                  type="button"
                >
                  {t('dashboard.view', 'View')}
                  <ArrowRight style={{ width: 12, height: 12 }} />
                </button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 230 }}>
                {activities.length > 0 ? activities.slice(0, 6).map((activity, index) => (
                  <RecentActivityRow key={activity.id} activity={activity} isLast={index === Math.min(activities.length, 6) - 1} />
                )) : dashboard.recentSkills.map((skill, index) => (
                  <RecentSkillRow key={skill.id} skill={skill} isLast={index === dashboard.recentSkills.length - 1} />
                ))}
                {activities.length === 0 && dashboard.recentSkills.length === 0 ? (
                  <div className="p-8">
                    <EntityEmptyState icon={<Clock3 style={{ width: 24, height: 24 }} />} title={t('dashboard.noActivity', 'No recent activity')} />
                  </div>
                ) : null}
              </div>
            </section>
          </FadeIn>
        </div>

        <div className="grid gap-4" style={{ gridTemplateColumns: '1fr' }}>
          <FadeIn delay={0.35}>
            <section>
              <h2 style={{ color: 'var(--c-text-secondary)', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
                {t('dashboard.quickActions', 'Quick Actions')}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <QuickAction
                  icon={<Upload style={{ width: 16, height: 16 }} />}
                  label={t('dashboard.importZip', 'Import ZIP')}
                  description={t('dashboard.importZipDesc', 'Bring skills from an archive')}
                  color="green"
                  onClick={() => navigate('/skills?view=transfer')}
                />
                <QuickAction
                  icon={<Download style={{ width: 16, height: 16 }} />}
                  label={t('dashboard.exportZip', 'Export ZIP')}
                  description={t('dashboard.exportZipDesc', 'Package selected skills')}
                  color="accent"
                  onClick={() => navigate('/skills?view=transfer')}
                />
                <QuickAction
                  icon={<FolderPlus style={{ width: 16, height: 16 }} />}
                  label={t('dashboard.addSkillFolder', 'Add skill folder')}
                  description={t('dashboard.addSkillFolderDesc', 'Import a local folder')}
                  color="amber"
                  onClick={() => navigate('/skills')}
                />
                <QuickAction
                  icon={<Globe style={{ width: 16, height: 16 }} />}
                  label={t('dashboard.marketplace', 'Marketplace')}
                  description={t('dashboard.marketplaceDesc', 'Browse skill marketplace')}
                  color="violet"
                  onClick={() => navigate('/skills?view=market')}
                />
                <QuickAction
                  icon={<Activity style={{ width: 16, height: 16 }} />}
                  label={t('dashboard.openUsage', 'Usage')}
                  description={t('dashboard.openUsageDesc', 'Review calls and rankings')}
                  color="green"
                  onClick={() => navigate('/skills?view=usage')}
                />
                <QuickAction
                  icon={<Search style={{ width: 16, height: 16 }} />}
                  label={t('dashboard.scanLocal', 'Scan Local')}
                  description={t('dashboard.scanLocalDesc', 'Discover local SKILL.md files')}
                  color="accent"
                  onClick={refreshAll}
                />
              </div>
            </section>
          </FadeIn>
        </div>

        {(dashboard.updateCount > 0 || dashboard.errorCount > 0) ? (
          <FadeIn delay={0.4}>
            <section className="grid grid-cols-2 gap-3">
              {dashboard.updateCount > 0 ? (
                <NoticeCard
                  tone="amber"
                  title={t('dashboard.updates', 'Updates')}
                  description={t('dashboard.updatesAvailable', '{{count}} skills have updates available', { count: dashboard.updateCount })}
                  onClick={() => navigate('/skills')}
                />
              ) : null}
              {dashboard.errorCount > 0 ? (
                <NoticeCard
                  tone="red"
                  title={t('dashboard.errors', 'Errors')}
                  description={t('dashboard.errorsFound', '{{count}} skills have errors', { count: dashboard.errorCount })}
                  onClick={() => navigate('/skills')}
                />
              ) : null}
            </section>
          </FadeIn>
        ) : null}
      </div>
    </div>
  )
}

function MiniStatus({ label, value, tone }: { label: string; value: number; tone: 'accent' | 'green' | 'amber' | 'red' }) {
  return (
    <div className="rounded-lg px-3 py-2" style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}>
      <span style={{ display: 'block', color: 'var(--c-text-faint)', fontSize: 10 }}>{label}</span>
      <strong style={{ display: 'block', color: `var(--c-${tone})`, fontSize: 18, marginTop: 2 }}>{value}</strong>
    </div>
  )
}

function TopSkillRow({ skill, value, index }: { skill: Skill; value: number; index: number }) {
  const width = Math.min(100, Math.max(8, value))
  return (
    <div className="grid items-center gap-3" style={{ gridTemplateColumns: '24px minmax(0, 1fr) 54px' }}>
      <span style={{ color: index < 3 ? 'var(--c-accent)' : 'var(--c-text-faint)', fontSize: 12, fontWeight: 750 }}>
        {index + 1}
      </span>
      <div className="min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="truncate" style={{ color: 'var(--c-text-secondary)', fontSize: 12, fontWeight: 650 }}>{skill.name}</span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: 6, background: 'var(--c-bg-input)' }}>
          <div className="h-full rounded-full" style={{ width: `${width}%`, background: 'var(--c-accent)' }} />
        </div>
      </div>
      <span style={{ color: 'var(--c-text-muted)', fontSize: 11, textAlign: 'right' }}>{value}</span>
    </div>
  )
}

function RecentActivityRow({ activity, isLast }: { activity: ActivityRecord; isLast: boolean }) {
  const tone = activity.type === 'error' ? 'red' : activity.type === 'delete' ? 'amber' : activity.type === 'install' ? 'green' : 'accent'
  return (
    <div
      className="grid items-center gap-3 px-4 py-3"
      style={{ gridTemplateColumns: '28px minmax(0, 1fr) 76px', borderBottom: isLast ? undefined : '1px solid var(--c-border)' }}
    >
      <span className="flex items-center justify-center rounded-md" style={{ width: 26, height: 26, color: `var(--c-${tone})`, background: `var(--c-${tone}-soft)` }}>
        {activity.type === 'install' ? <CheckCircle2 style={{ width: 14, height: 14 }} /> : <Clock3 style={{ width: 14, height: 14 }} />}
      </span>
      <div className="min-w-0">
        <p className="truncate" style={{ color: 'var(--c-text)', fontSize: 12, fontWeight: 650 }}>{activity.targetName}</p>
        <p className="truncate" style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 2 }}>
          {activity.detail || activity.type}
        </p>
      </div>
      <span style={{ color: 'var(--c-text-faint)', fontSize: 10, textAlign: 'right' }}>{formatSkillDate(activity.createdAt)}</span>
    </div>
  )
}

function RecentSkillRow({ skill, isLast }: { skill: Skill; isLast: boolean }) {
  return (
    <div
      className="grid items-center gap-3 px-4 py-3"
      style={{ gridTemplateColumns: '28px minmax(0, 1fr) 76px', borderBottom: isLast ? undefined : '1px solid var(--c-border)' }}
    >
      <span className="flex items-center justify-center rounded-md" style={{ width: 26, height: 26, color: 'var(--c-accent)', background: 'var(--c-accent-soft)' }}>
        <Zap style={{ width: 14, height: 14 }} />
      </span>
      <div className="min-w-0">
        <p className="truncate" style={{ color: 'var(--c-text)', fontSize: 12, fontWeight: 650 }}>{skill.name}</p>
        <p className="truncate" style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 2 }}>
          {shortPath(skill.installPath)}
        </p>
      </div>
      <span style={{ color: 'var(--c-text-faint)', fontSize: 10, textAlign: 'right' }}>{formatSkillDate(skill.updatedAt)}</span>
    </div>
  )
}

function NoticeCard({ tone, title, description, onClick }: { tone: 'amber' | 'red'; title: string; description: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"
      style={{ background: `var(--c-${tone}-soft)`, border: `1px solid rgba(${tone === 'amber' ? '245, 158, 11' : '239, 68, 68'}, 0.16)` }}
      type="button"
    >
      <span className={`status-dot ${tone === 'amber' ? 'status-dot-update' : 'status-dot-error'}`} />
      <div className="min-w-0 flex-1">
        <p style={{ color: `var(--c-${tone})`, fontSize: 12, fontWeight: 700 }}>{title}</p>
        <p className="truncate" style={{ color: `var(--c-${tone})`, fontSize: 11, opacity: 0.78 }}>{description}</p>
      </div>
      <ArrowRight style={{ width: 14, height: 14, color: `var(--c-${tone})` }} />
    </button>
  )
}

function latestDate(values: string[]): string {
  let latest = ''
  let latestTime = 0
  for (const value of values) {
    const time = new Date(value).getTime()
    if (!Number.isNaN(time) && time > latestTime) {
      latestTime = time
      latest = value
    }
  }
  return latest
}

function buildSevenDayTrend(activities: ActivityRecord[]) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date(today)
    date.setDate(today.getDate() - (6 - offset))
    const key = date.toISOString().slice(0, 10)
    const label = new Intl.DateTimeFormat(undefined, { month: '2-digit', day: '2-digit' }).format(date)
    const count = activities.filter((activity) => activity.createdAt?.slice(0, 10) === key).length
    return { key, label, count }
  })
}
