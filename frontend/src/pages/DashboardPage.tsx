import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Zap, Server, Package, Wrench, Plus, Search, Download, Globe, Clock, ArrowRight, Trash2, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import ReactECharts from 'echarts-for-react'
import { useSkillStore } from '@/stores/skillStore'
import { useMcpStore } from '@/stores/mcpStore'
import { useToolStore } from '@/stores/toolStore'
import { wailsApi } from '@/services/wailsBridge'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { QuickAction } from '@/components/dashboard/QuickAction'
import { FadeIn } from '@/components/ui/motion'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { SkeletonStats, SkeletonList, Skeleton, SkeletonCard, PageLoading } from '@/components/ui/Loading'

interface Activity {
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
  const [activities, setActivities] = useState<Activity[]>([])
  const [activityPage, setActivityPage] = useState(1)
  const activityPageSize = 5
  const [loading, setLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const init = useCallback(async () => {
    setLoading(true)
    setHasError(false)
    await Promise.all([fetchSkills(), fetchSources(), fetchServers(), fetchTools(), loadActivities()])
    setLoading(false)
  }, [])

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (!loading && (skillError || mcpError || toolError)) {
      setHasError(true)
    }
  }, [loading, skillError, mcpError, toolError])

  const loadActivities = async () => {
    const resp = await wailsApi.listActivities(50)
    if (resp.success && resp.data) {
      setActivities(resp.data)
    }
  }

  const pagedActivities = activities.slice((activityPage - 1) * activityPageSize, activityPage * activityPageSize)
  const totalActivityPages = Math.ceil(activities.length / activityPageSize)

  const installedCount = skills.filter((s) => s.status === 'installed').length
  const updateCount = skills.filter((s) => s.status === 'update_available').length
  const errorCount = skills.filter((s) => s.status === 'error').length
  const enabledMcp = servers.filter((s) => s.status === 'enabled').length
  const detectedTools = tools.filter((t) => t.isDetected).length

  if (loading) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton width={140} height={20} />
              <Skeleton width={200} height={12} style={{ marginTop: 6 }} />
            </div>
          </div>
          <SkeletonStats count={4} />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard rows={4} />
            <SkeletonCard rows={4} />
          </div>
          <Skeleton width={120} height={12} />
          <SkeletonList count={4} />
        </div>
      </div>
    )
  }

  if (hasError && skills.length === 0 && servers.length === 0 && tools.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center" style={{ maxWidth: 320 }}>
          <AlertCircle style={{ width: 48, height: 48, color: 'var(--c-amber)', margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--c-text)', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>
            {t('dashboard.loadFailed', 'Failed to load data')}
          </p>
          <p style={{ color: 'var(--c-text-muted)', fontSize: 12, marginBottom: 20, lineHeight: 1.6 }}>
            {skillError || mcpError || toolError || t('dashboard.runtimeUnavailable', 'Wails runtime not available')}
          </p>
          <button
            onClick={init}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-medium transition-all duration-200"
            style={{
              background: 'var(--c-accent)',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
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
      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        <FadeIn>
          <div className="flex items-center justify-between">
            <div>
              <h1 style={{ color: 'var(--c-text)', fontSize: 18, fontWeight: 700 }}>{t('dashboard.title', 'Dashboard')}</h1>
              <p style={{ color: 'var(--c-text-muted)', fontSize: 12, marginTop: 2 }}>{t('dashboard.subtitle', 'Overview of your workspace')}</p>
            </div>
          </div>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-4 gap-4" staggerDelay={0.1}>
          <StaggerItem>
            <StatsCard
              icon={<Zap style={{ width: 16, height: 16 }} />}
              label={t('dashboard.skills', 'Skills')}
              value={skillTotal}
              subtitle={t('dashboard.skillsSub', `${installedCount} installed`, { installed: installedCount })}
              color={updateCount > 0 ? 'amber' : 'accent'}
              onClick={() => navigate('/skills')}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              icon={<Server style={{ width: 16, height: 16 }} />}
              label={t('dashboard.mcp', 'MCP Servers')}
              value={mcpTotal}
              subtitle={t('dashboard.mcpSub', `${enabledMcp} enabled`, { enabled: enabledMcp })}
              color={errorCount > 0 ? 'red' : 'green'}
              onClick={() => navigate('/mcp')}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              icon={<Package style={{ width: 16, height: 16 }} />}
              label={t('dashboard.sources', 'Sources')}
              value={sources.length}
              subtitle={t('dashboard.sourcesSub', 'configured')}
              color="violet"
              onClick={() => navigate('/skills')}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              icon={<Wrench style={{ width: 16, height: 16 }} />}
              label={t('dashboard.tools', 'Tools')}
              value={detectedTools}
              subtitle={t('dashboard.toolsSub', `${tools.length} configured`)}
              color={detectedTools > 0 ? 'green' : 'muted'}
              onClick={() => navigate('/tools')}
            />
          </StaggerItem>
        </StaggerContainer>

        <FadeIn delay={0.2}>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <h3 style={{ color: 'var(--c-text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                {t('dashboard.statusDistribution', 'Skill Status Distribution')}
              </h3>
              {skills.length === 0 ? (
                <div className="flex items-center justify-center" style={{ height: 180 }}>
                  <p style={{ color: 'var(--c-text-faint)', fontSize: 11 }}>{t('dashboard.noData', 'No data')}</p>
                </div>
              ) : (
                <ReactECharts
                  option={{
                    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
                    legend: { bottom: 0, textStyle: { fontSize: 10, color: 'var(--c-text-muted)' }, itemWidth: 10, itemHeight: 10 },
                    series: [{
                      type: 'pie',
                      radius: ['45%', '72%'],
                      center: ['50%', '45%'],
                      avoidLabelOverlap: false,
                      itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
                      label: { show: false },
                      emphasis: { label: { show: true, fontSize: 12, fontWeight: 'bold' } },
                      data: [
                        { value: installedCount, name: t('dashboard.installed', 'Installed'), itemStyle: { color: '#22C55E' } },
                        { value: updateCount, name: t('dashboard.updateAvail', 'Update Available'), itemStyle: { color: '#F59E0B' } },
                        { value: errorCount, name: t('dashboard.error', 'Error'), itemStyle: { color: '#EF4444' } },
                        { value: Math.max(0, skills.length - installedCount - updateCount - errorCount), name: t('dashboard.other', 'Other'), itemStyle: { color: '#94A3B8' } },
                      ].filter(d => d.value > 0),
                    }],
                  }}
                  style={{ height: 200 }}
                />
              )}
            </div>
            <div className="glass-card p-4">
              <h3 style={{ color: 'var(--c-text-secondary)', fontSize: 12, fontWeight: 600, marginBottom: 12 }}>
                {t('dashboard.toolDistribution', 'Tool Integration Status')}
              </h3>
              {tools.length === 0 ? (
                <div className="flex items-center justify-center" style={{ height: 180 }}>
                  <p style={{ color: 'var(--c-text-faint)', fontSize: 11 }}>{t('dashboard.noData', 'No data')}</p>
                </div>
              ) : (
                <ReactECharts
                  option={{
                    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
                    grid: { left: 60, right: 20, top: 10, bottom: 30 },
                    xAxis: { type: 'category', data: tools.map(t => t.displayName || t.toolName), axisLabel: { fontSize: 9, color: 'var(--c-text-faint)', rotate: 15 } },
                    yAxis: { type: 'value', axisLabel: { fontSize: 9, color: 'var(--c-text-faint)' }, splitLine: { lineStyle: { color: 'var(--c-border)' } } },
                    series: [{
                      type: 'bar',
                      data: tools.map(t => ({
                        value: t.isDetected ? 1 : 0,
                        itemStyle: { color: t.isDetected ? '#22C55E' : '#94A3B8', borderRadius: [4, 4, 0, 0] },
                      })),
                      barWidth: 28,
                    }],
                  }}
                  style={{ height: 200 }}
                />
              )}
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div>
            <h2 style={{ color: 'var(--c-text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              {t('dashboard.quickActions', 'Quick Actions')}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <QuickAction
                icon={<Download style={{ width: 16, height: 16 }} />}
                label={t('dashboard.installSkill', 'Install Skill')}
                description={t('dashboard.installSkillDesc', 'Add from Git or local')}
                color="green"
                onClick={() => navigate('/install')}
              />
              <QuickAction
                icon={<Plus style={{ width: 16, height: 16 }} />}
                label={t('dashboard.addMcp', 'Add MCP Server')}
                description={t('dashboard.addMcpDesc', 'Configure a new MCP server')}
                color="accent"
                onClick={() => navigate('/install?tab=mcp')}
              />
              <QuickAction
                icon={<Search style={{ width: 16, height: 16 }} />}
                label={t('dashboard.scanLocal', 'Scan Local')}
                description={t('dashboard.scanLocalDesc', 'Discover local SKILL.md files')}
                color="amber"
                onClick={() => navigate('/skills')}
              />
              <QuickAction
                icon={<Globe style={{ width: 16, height: 16 }} />}
                label={t('dashboard.marketplace', 'Marketplace')}
                description={t('dashboard.marketplaceDesc', 'Browse skill marketplace')}
                color="violet"
                onClick={() => navigate('/marketplace')}
              />
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div>
            <h2 style={{ color: 'var(--c-text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
              {t('dashboard.healthCheck', 'Health Check')}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="status-dot" style={{ background: installedCount > 0 ? 'var(--c-green)' : 'var(--c-text-faint)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-secondary)' }}>{t('dashboard.installed', 'Installed')}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--c-text)' }}>{installedCount}</span>
                  <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>/ {skillTotal}</span>
                </div>
                <div
                  className="mt-2 rounded-full overflow-hidden"
                  style={{ height: 3, background: 'var(--c-bg-input)' }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      height: '100%',
                      width: skillTotal > 0 ? `${(installedCount / skillTotal) * 100}%` : '0%',
                      background: 'var(--c-green)',
                      transition: 'width 0.5s ease',
                    }}
                  />
                </div>
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="status-dot" style={{ background: updateCount > 0 ? 'var(--c-amber)' : 'var(--c-green)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-secondary)' }}>{t('dashboard.updates', 'Updates')}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span style={{ fontSize: 24, fontWeight: 700, color: updateCount > 0 ? 'var(--c-amber)' : 'var(--c-text)' }}>{updateCount}</span>
                  <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{t('dashboard.available', 'available')}</span>
                </div>
                {updateCount > 0 && (
                  <button
                    onClick={() => navigate('/skills')}
                    className="mt-2 text-[10px] font-medium transition-colors"
                    style={{ color: 'var(--c-amber)' }}
                  >
                    {t('dashboard.viewUpdates', 'View updates')} →
                  </button>
                )}
              </div>
              <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="status-dot" style={{ background: errorCount > 0 ? 'var(--c-red)' : 'var(--c-green)' }} />
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-secondary)' }}>{t('dashboard.errors', 'Errors')}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span style={{ fontSize: 24, fontWeight: 700, color: errorCount > 0 ? 'var(--c-red)' : 'var(--c-text)' }}>{errorCount}</span>
                  <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{t('dashboard.issues', 'issues')}</span>
                </div>
                {errorCount > 0 && (
                  <button
                    onClick={() => navigate('/skills')}
                    className="mt-2 text-[10px] font-medium transition-colors"
                    style={{ color: 'var(--c-red)' }}
                  >
                    {t('dashboard.viewErrors', 'View errors')} →
                  </button>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 style={{ color: 'var(--c-text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                {t('dashboard.recentSkills', 'Recent Skills')}
              </h2>
              {skills.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <Zap style={{ width: 28, height: 28, color: 'var(--c-text-faint)', margin: '0 auto 8px' }} />
                  <p style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>{t('dashboard.noSkills', 'No skills yet')}</p>
                  <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>{t('dashboard.noSkillsDesc', 'Install your first skill to get started')}</p>
                </div>
              ) : (
                <div className="glass-card overflow-hidden" style={{ maxHeight: 320 }}>
                  <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
                  {skills.slice(0, 5).map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid var(--c-border)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-card-hover)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
                      onClick={() => navigate('/skills')}
                    >
                      <div className={`status-dot ${
                        skill.status === 'installed' ? 'status-dot-installed' :
                        skill.status === 'update_available' ? 'status-dot-update' :
                        skill.status === 'error' ? 'status-dot-error' : 'status-dot-disabled'
                      }`} />
                      <span style={{ color: 'var(--c-text-secondary)', fontSize: 12, fontWeight: 500 }} className="truncate flex-1">{skill.name}</span>
                      <span style={{ color: 'var(--c-text-faint)', fontSize: 10 }} className="shrink-0">
                        {new Date(skill.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                  </div>
                </div>
              )}
            </div>
            <div>
              <h2 style={{ color: 'var(--c-text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                {t('dashboard.activityTimeline', 'Activity Timeline')}
              </h2>
              {activities.length === 0 ? (
                <div className="glass-card p-6 text-center">
                  <Clock style={{ width: 28, height: 28, color: 'var(--c-text-faint)', margin: '0 auto 8px' }} />
                  <p style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>{t('dashboard.noActivity', 'No recent activity')}</p>
                  <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>{t('dashboard.noActivityDesc', 'Activities will appear here as you use the app')}</p>
                </div>
              ) : (
                <div className="glass-card overflow-hidden flex flex-col" style={{ maxHeight: 320 }}>
                  <div className="overflow-y-auto flex-1">
                    {pagedActivities.map((activity, idx) => {
                    const icon = activity.type === 'install' ? <CheckCircle2 style={{ width: 14, height: 14, color: '#22C55E' }} /> :
                                 activity.type === 'delete' ? <Trash2 style={{ width: 14, height: 14, color: '#EF4444' }} /> :
                                 activity.type === 'sync' ? <ArrowRight style={{ width: 14, height: 14, color: '#3B82F6' }} /> :
                                 activity.type === 'error' ? <XCircle style={{ width: 14, height: 14, color: '#EF4444' }} /> :
                                 <AlertCircle style={{ width: 14, height: 14, color: '#F59E0B' }} />
                    const typeLabel = activity.type === 'install' ? t('dashboard.actInstall', 'Installed') :
                                      activity.type === 'delete' ? t('dashboard.actDelete', 'Removed') :
                                      activity.type === 'sync' ? t('dashboard.actSync', 'Synced') :
                                      activity.type === 'error' ? t('dashboard.actError', 'Error') :
                                      activity.type
                    const typeBadge = activity.targetType === 'skill' ? t('dashboard.badgeSkill', 'Skill') :
                                      activity.targetType === 'mcp' ? t('dashboard.badgeMcp', 'MCP') :
                                      activity.targetType === 'tool' ? t('dashboard.badgeTool', 'Tool') : activity.targetType
                    return (
                      <div
                        key={activity.id}
                        className="flex items-center gap-3 px-4 py-3 transition-colors"
                        style={{ borderBottom: idx < pagedActivities.length - 1 ? '1px solid var(--c-border)' : 'none' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-card-hover)' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
                      >
                        <div className="shrink-0">{icon}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span style={{ color: 'var(--c-text)', fontSize: 12, fontWeight: 500 }} className="truncate">{activity.targetName}</span>
                            <span
                              style={{
                                fontSize: 9,
                                fontWeight: 600,
                                padding: '1px 6px',
                                borderRadius: 4,
                                background: activity.targetType === 'skill' ? 'rgba(59, 130, 246, 0.08)' : activity.targetType === 'mcp' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(34, 197, 94, 0.08)',
                                color: activity.targetType === 'skill' ? '#3B82F6' : activity.targetType === 'mcp' ? '#8B5CF6' : '#22C55E',
                              }}
                            >
                              {typeBadge}
                            </span>
                          </div>
                          {activity.detail && (
                            <p style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 2 }} className="truncate">{activity.detail}</p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-2">
                          <span
                            style={{
                              fontSize: 9,
                              fontWeight: 500,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: activity.type === 'install' ? 'rgba(34, 197, 94, 0.08)' : activity.type === 'delete' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                              color: activity.type === 'install' ? '#22C55E' : activity.type === 'delete' ? '#EF4444' : '#3B82F6',
                            }}
                          >
                            {typeLabel}
                          </span>
                          <span style={{ color: 'var(--c-text-faint)', fontSize: 10 }}>
                            {new Date(activity.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                  </div>
                  {totalActivityPages > 1 && (
                    <div
                      className="flex items-center justify-center gap-1 px-4 py-2"
                      style={{ borderTop: '1px solid var(--c-border)' }}
                    >
                      <button
                        onClick={() => setActivityPage((p) => Math.max(1, p - 1))}
                        disabled={activityPage <= 1}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          border: '1px solid var(--c-border)',
                          background: 'var(--c-bg-input)',
                          color: activityPage <= 1 ? 'var(--c-text-faint)' : 'var(--c-text)',
                          cursor: activityPage <= 1 ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          opacity: activityPage <= 1 ? 0.4 : 1,
                        }}
                      >
                        ‹
                      </button>
                      {Array.from({ length: totalActivityPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setActivityPage(page)}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            border: page === activityPage ? '1px solid var(--c-accent)' : '1px solid var(--c-border)',
                            background: page === activityPage ? 'var(--c-accent-soft)' : 'var(--c-bg-input)',
                            color: page === activityPage ? 'var(--c-accent)' : 'var(--c-text)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: page === activityPage ? 600 : 400,
                          }}
                        >
                          {page}
                        </button>
                      ))}
                      <button
                        onClick={() => setActivityPage((p) => Math.min(totalActivityPages, p + 1))}
                        disabled={activityPage >= totalActivityPages}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 6,
                          border: '1px solid var(--c-border)',
                          background: 'var(--c-bg-input)',
                          color: activityPage >= totalActivityPages ? 'var(--c-text-faint)' : 'var(--c-text)',
                          cursor: activityPage >= totalActivityPages ? 'not-allowed' : 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          opacity: activityPage >= totalActivityPages ? 0.4 : 1,
                        }}
                      >
                        ›
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {(updateCount > 0 || errorCount > 0) && (
          <FadeIn delay={0.5}>
            <div>
              <h2 style={{ color: 'var(--c-text-secondary)', fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
                {t('dashboard.attention', 'Needs Attention')}
              </h2>
              <div className="space-y-2">
                {updateCount > 0 && (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: 'var(--c-amber-soft)',
                      border: '1px solid rgba(245, 158, 11, 0.12)',
                    }}
                  >
                    <div className="status-dot status-dot-update" style={{ animation: 'pulse 2s infinite' }} />
                    <span style={{ color: 'var(--c-amber)', fontSize: 12, opacity: 0.85 }}>
                      {t('dashboard.updatesAvailable', `${updateCount} skills have updates available`, { count: updateCount })}
                    </span>
                    <button
                      onClick={() => navigate('/skills')}
                      style={{ color: 'var(--c-amber)', fontSize: 11, opacity: 0.5 }}
                      className="ml-auto hover:opacity-100 transition-opacity"
                    >
                      {t('dashboard.view', 'View')} →
                    </button>
                  </div>
                )}
                {errorCount > 0 && (
                  <div
                    className="flex items-center gap-3 px-4 py-3 rounded-xl"
                    style={{
                      background: 'var(--c-red-soft)',
                      border: '1px solid rgba(239, 68, 68, 0.12)',
                    }}
                  >
                    <div className="status-dot status-dot-error" />
                    <span style={{ color: 'var(--c-red)', fontSize: 12, opacity: 0.85 }}>
                      {t('dashboard.errorsFound', `${errorCount} skills have errors`, { count: errorCount })}
                    </span>
                    <button
                      onClick={() => navigate('/skills')}
                      style={{ color: 'var(--c-red)', fontSize: 11, opacity: 0.5 }}
                      className="ml-auto hover:opacity-100 transition-opacity"
                    >
                      {t('dashboard.view', 'View')} →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  )
}
