import { BarChart3, CalendarDays, Database, RefreshCw, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { wailsApi } from '@/services/wailsBridge'
import { MetricTile } from '@/components/Card'
import { Pagination } from '@/components/Control'
import { Skeleton, SkeletonCard } from '@/components/Loading'
import { CORE_SKILL_TOOLS, getSkillUsage, getToolIconByName, normalizeToolKey } from './utils'

interface Activity {
  id: string
  type: string
  targetName: string
  targetType: string
  toolName: string
  detail: string
  createdAt: string
}

interface SkillUsagePanelProps {
  skills: Skill[]
}

const RANK_PAGE_SIZE = 10
const RECORD_PAGE_SIZE = 10

export function SkillUsagePanel({ skills }: SkillUsagePanelProps) {
  const { t } = useTranslation()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [rankPage, setRankPage] = useState(1)
  const [recordPage, setRecordPage] = useState(1)

  const load = async () => {
    setLoading(true)
    const resp = await wailsApi.listActivities(500)
    if (resp.success && resp.data) {
      setActivities(resp.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const allUsageRows = useMemo(() => {
    const counts = new Map<string, number>()
    for (const activity of activities) {
      if (activity.targetType === 'skill' && activity.targetName) {
        counts.set(activity.targetName, (counts.get(activity.targetName) ?? 0) + 1)
      }
    }
    return skills
      .map((skill) => ({
        skill,
        value: counts.get(skill.name) ?? getSkillUsage(skill),
      }))
      .sort((left, right) => right.value - left.value)
  }, [activities, skills])

  const rankTotalPages = Math.max(1, Math.ceil(allUsageRows.length / RANK_PAGE_SIZE))
  const pagedUsageRows = allUsageRows.slice((rankPage - 1) * RANK_PAGE_SIZE, rankPage * RANK_PAGE_SIZE)
  const maxUsage = Math.max(1, ...allUsageRows.map((row) => row.value))

  const recordTotalPages = Math.max(1, Math.ceil(activities.length / RECORD_PAGE_SIZE))
  const pagedActivities = activities.slice((recordPage - 1) * RECORD_PAGE_SIZE, recordPage * RECORD_PAGE_SIZE)

  const toolCounts = CORE_SKILL_TOOLS.map((tool) => ({
    tool,
    value: activities.filter((activity) => normalizeToolKey(activity.toolName) === tool.id).length,
  }))
  const totalCalls = allUsageRows.reduce((sum, row) => sum + row.value, 0)
  const todayCalls = activities.filter((activity) => isToday(activity.createdAt)).length
  const activeSkills = allUsageRows.filter((row) => row.value > 0).length

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 style={{ fontSize: 16, color: 'var(--c-text)', fontWeight: 700 }}>{t('skills.usageTitle')}</h2>
          <Skeleton width={92} height={34} borderRadius={8} />
        </div>
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} rows={2} />
          ))}
        </div>
        <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px' }}>
          <SkeletonCard rows={6} />
          <SkeletonCard rows={5} />
        </div>
        <SkeletonCard rows={5} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 style={{ fontSize: 16, color: 'var(--c-text)', fontWeight: 700 }}>{t('skills.usageTitle')}</h2>
        <button
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium"
          onClick={load}
          style={{ color: 'var(--c-text-muted)', background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
          type="button"
        >
          <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
          {t('skills.refreshUsage')}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricTile surface="card" tone="accent" icon={<TrendingUp style={{ width: 18, height: 18 }} />} label={t('skills.totalCalls')} value={totalCalls} />
        <MetricTile surface="card" tone="green" icon={<CalendarDays style={{ width: 18, height: 18 }} />} label={t('skills.todayCalls')} value={todayCalls} />
        <MetricTile surface="card" tone="violet" icon={<BarChart3 style={{ width: 18, height: 18 }} />} label={t('skills.activeSkills')} value={activeSkills} />
        <MetricTile surface="card" tone="amber" icon={<Database style={{ width: 18, height: 18 }} />} label={t('skills.logRecords')} value={activities.length} />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px' }}>
        <section className="glass-card p-4">
          <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700, marginBottom: 14 }}>
            {t('skills.usageRanking')}
          </h3>
          <div className="space-y-3">
            {pagedUsageRows.map((row, index) => {
              const globalIndex = (rankPage - 1) * RANK_PAGE_SIZE + index
              return (
                <div key={row.skill.id} className="grid items-center gap-3" style={{ gridTemplateColumns: '28px 150px 1fr 46px' }}>
                  <span style={{ fontSize: 12, color: globalIndex < 3 ? 'var(--c-accent)' : 'var(--c-text-faint)', fontWeight: 700 }}>
                    {globalIndex + 1}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 600 }} className="truncate">
                    {row.skill.name}
                  </span>
                  <span className="rounded-full overflow-hidden" style={{ height: 7, background: 'var(--c-bg-input)' }}>
                    <span
                      className="block h-full rounded-full"
                      style={{ width: `${Math.max(6, (row.value / maxUsage) * 100)}%`, background: 'var(--c-accent)' }}
                    />
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-muted)', textAlign: 'right' }}>{row.value}</span>
                </div>
              )
            })}
          </div>
          {allUsageRows.length > RANK_PAGE_SIZE && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--c-border)', paddingTop: 8 }}>
              <Pagination page={rankPage} pageSize={RANK_PAGE_SIZE} total={allUsageRows.length} onChange={setRankPage} />
            </div>
          )}
        </section>

        <section className="glass-card p-4">
          <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700, marginBottom: 14 }}>
            {t('skills.usageByApp')}
          </h3>
          <div className="space-y-3">
            {toolCounts.map(({ tool, value }) => {
              const total = Math.max(1, activities.length)
              return (
                <div key={tool.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getToolIconByName(tool.toolName) ? (
                        <img src={getToolIconByName(tool.toolName)} alt={tool.label} style={{ width: 16, height: 16, borderRadius: 3 }} />
                      ) : (
                        <span className="flex items-center justify-center rounded" style={{ width: 16, height: 16, background: tool.soft, color: tool.color, fontSize: 9, fontWeight: 750 }}>
                          {tool.label.slice(0, 1)}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontWeight: 600 }}>{tool.label}</span>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{value}</span>
                  </div>
                  <span className="block rounded-full overflow-hidden" style={{ height: 7, background: 'var(--c-bg-input)' }}>
                    <span className="block h-full rounded-full" style={{ width: `${(value / total) * 100}%`, background: tool.color }} />
                  </span>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      <section className="glass-card overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700 }}>{t('skills.recentUsage')}</h3>
        </div>
        {pagedActivities.length > 0 ? (
          pagedActivities.map((activity, index) => (
            <div
              key={activity.id}
              className="grid items-center gap-3 px-4 py-3"
              style={{
                gridTemplateColumns: '130px 120px minmax(0, 1fr) 90px',
                borderBottom: index < pagedActivities.length - 1 ? '1px solid var(--c-border)' : undefined,
              }}
            >
              <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{formatActivityTime(activity.createdAt)}</span>
              <div className="flex items-center gap-2">
                {getToolIconByName(activity.toolName) ? (
                  <img src={getToolIconByName(activity.toolName)} alt={activity.toolName} style={{ width: 14, height: 14, borderRadius: 3 }} />
                ) : null}
                <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{activity.toolName || '-'}</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }} className="truncate">{activity.targetName}</span>
              <span style={{ fontSize: 10, color: 'var(--c-accent)', background: 'var(--c-accent-soft)', padding: '3px 7px', borderRadius: 6, textAlign: 'center' }}>
                {activity.type}
              </span>
            </div>
          ))
        ) : (
          <div className="p-8 text-center">
            <p style={{ fontSize: 12, color: 'var(--c-text-faint)' }}>{t('skills.noUsageRecords')}</p>
          </div>
        )}
        {activities.length > RECORD_PAGE_SIZE && (
          <div className="px-4 py-2" style={{ borderTop: '1px solid var(--c-border)' }}>
            <Pagination page={recordPage} pageSize={RECORD_PAGE_SIZE} total={activities.length} onChange={setRecordPage} />
          </div>
        )}
      </section>
    </div>
  )
}

function isToday(value: string): boolean {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false
  return date.toDateString() === new Date().toDateString()
}

function formatActivityTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
