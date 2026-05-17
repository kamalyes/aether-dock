import { BarChart3, CalendarDays, Database, RefreshCw, TrendingUp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { wailsApi } from '@/services/wailsBridge'
import { MetricTile } from '@/components/Card'
import { CORE_SKILL_TOOLS, getSkillUsage, normalizeToolKey } from './utils'

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

export function SkillUsagePanel({ skills }: SkillUsagePanelProps) {
  const { t } = useTranslation()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const resp = await wailsApi.listActivities(80)
    if (resp.success && resp.data) {
      setActivities(resp.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    void load()
  }, [])

  const usageRows = useMemo(() => {
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
      .slice(0, 8)
  }, [activities, skills])

  const toolCounts = CORE_SKILL_TOOLS.map((tool) => ({
    tool,
    value: activities.filter((activity) => normalizeToolKey(activity.toolName) === tool.id).length,
  }))
  const totalCalls = usageRows.reduce((sum, row) => sum + row.value, 0)
  const todayCalls = activities.filter((activity) => isToday(activity.createdAt)).length
  const activeSkills = usageRows.filter((row) => row.value > 0).length
  const maxUsage = Math.max(1, ...usageRows.map((row) => row.value))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontSize: 16, color: 'var(--c-text)', fontWeight: 700 }}>{t('skills.usageTitle', 'Skill usage')}</h2>
          <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 2 }}>
            {t('skills.usageDesc', 'Usage is estimated from local activity records and skill metadata.')}
          </p>
        </div>
        <button
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium"
          onClick={load}
          style={{ color: 'var(--c-text-muted)', background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
          type="button"
        >
          <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
          {t('skills.refreshUsage', 'Refresh usage')}
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <MetricTile surface="card" tone="accent" icon={<TrendingUp style={{ width: 18, height: 18 }} />} label={t('skills.totalCalls', 'Total calls')} value={totalCalls} />
        <MetricTile surface="card" tone="green" icon={<CalendarDays style={{ width: 18, height: 18 }} />} label={t('skills.todayCalls', 'Today')} value={todayCalls} />
        <MetricTile surface="card" tone="violet" icon={<BarChart3 style={{ width: 18, height: 18 }} />} label={t('skills.activeSkills', 'Active skills')} value={activeSkills} />
        <MetricTile surface="card" tone="amber" icon={<Database style={{ width: 18, height: 18 }} />} label={t('skills.logRecords', 'Log records')} value={activities.length} />
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 340px' }}>
        <section className="glass-card p-4">
          <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700, marginBottom: 14 }}>
            {t('skills.usageRanking', 'Skill call ranking')}
          </h3>
          <div className="space-y-3">
            {usageRows.map((row, index) => (
              <div key={row.skill.id} className="grid items-center gap-3" style={{ gridTemplateColumns: '28px 150px 1fr 46px' }}>
                <span style={{ fontSize: 12, color: index < 3 ? 'var(--c-accent)' : 'var(--c-text-faint)', fontWeight: 700 }}>
                  {index + 1}
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
            ))}
          </div>
        </section>

        <section className="glass-card p-4">
          <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700, marginBottom: 14 }}>
            {t('skills.usageByApp', 'Usage by app')}
          </h3>
          <div className="space-y-3">
            {toolCounts.map(({ tool, value }) => {
              const total = Math.max(1, activities.length)
              return (
                <div key={tool.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontWeight: 600 }}>{tool.label}</span>
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
          <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700 }}>{t('skills.recentUsage', 'Recent records')}</h3>
        </div>
        {activities.slice(0, 8).map((activity, index) => (
          <div
            key={activity.id}
            className="grid items-center gap-3 px-4 py-3"
            style={{
              gridTemplateColumns: '130px 120px minmax(0, 1fr) 90px',
              borderBottom: index < Math.min(activities.length, 8) - 1 ? '1px solid var(--c-border)' : undefined,
            }}
          >
            <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{formatActivityTime(activity.createdAt)}</span>
            <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{activity.toolName || '-'}</span>
            <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }} className="truncate">{activity.targetName}</span>
            <span style={{ fontSize: 10, color: 'var(--c-accent)', background: 'var(--c-accent-soft)', padding: '3px 7px', borderRadius: 6, textAlign: 'center' }}>
              {activity.type}
            </span>
          </div>
        ))}
        {activities.length === 0 ? (
          <div className="p-8 text-center">
            <p style={{ fontSize: 12, color: 'var(--c-text-faint)' }}>{t('skills.noUsageRecords', 'No usage records yet.')}</p>
          </div>
        ) : null}
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
