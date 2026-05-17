import { AlertTriangle, CheckCircle2, Layers, RefreshCw, TrendingUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { CORE_SKILL_TOOLS, getToolIconFor, isSkillEnabledForTool } from './utils'

interface SkillStatsPanelProps {
  skills: Skill[]
  visibleCount: number
}

export function SkillStatsPanel({ skills, visibleCount }: SkillStatsPanelProps) {
  const { t } = useTranslation()
  const installed = skills.filter((skill) => skill.status === 'installed').length
  const updates = skills.filter((skill) => skill.status === 'update_available').length
  const errors = skills.filter((skill) => skill.status === 'error').length

  const cards = [
    {
      key: 'total',
      label: t('skills.statsTotal', 'Skills'),
      value: skills.length,
      helper: t('skills.statsVisible', '{{count}} visible', { count: visibleCount }),
      icon: Layers,
      color: 'var(--c-accent)',
      bg: 'var(--c-accent-soft)',
    },
    {
      key: 'installed',
      label: t('skills.statsInstalled', 'Installed'),
      value: installed,
      helper: t('skills.statsReady', 'Ready to use'),
      icon: CheckCircle2,
      color: 'var(--c-green)',
      bg: 'var(--c-green-soft)',
    },
    {
      key: 'updates',
      label: t('skills.statsUpdates', 'Updates'),
      value: updates,
      helper: updates > 0 ? t('skills.statsNeedsPull', 'Needs pull') : t('skills.statsNoUpdates', 'No pending updates'),
      icon: RefreshCw,
      color: 'var(--c-amber)',
      bg: 'var(--c-amber-soft)',
    },
    {
      key: 'errors',
      label: t('skills.statsErrors', 'Errors'),
      value: errors,
      helper: errors > 0 ? t('skills.statsNeedsReview', 'Needs review') : t('skills.statsHealthy', 'Healthy'),
      icon: AlertTriangle,
      color: errors > 0 ? 'var(--c-red)' : 'var(--c-green)',
      bg: errors > 0 ? 'var(--c-red-soft)' : 'var(--c-green-soft)',
    },
    {
      key: 'usage',
      label: t('skills.statsUsage', 'App installs'),
      value: CORE_SKILL_TOOLS.reduce(
        (sum, tool) => sum + skills.filter((skill) => isSkillEnabledForTool(skill, tool)).length,
        0,
      ),
      helper: t('skills.statsMatrix', 'Across core apps'),
      icon: TrendingUp,
      color: 'var(--c-violet)',
      bg: 'var(--c-violet-soft)',
    },
  ]

  return (
    <div className="glass-card flex flex-wrap items-center gap-2 px-3 py-2">
      {cards.map((card) => (
        <div
          key={card.key}
          className="flex min-w-[128px] items-center gap-2 rounded-md px-2.5 py-2"
          style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
          title={card.helper}
        >
          <span
            className="flex shrink-0 items-center justify-center rounded-md"
            style={{ width: 24, height: 24, background: card.bg, color: card.color }}
          >
            <card.icon style={{ width: 13, height: 13 }} />
          </span>
          <span className="min-w-0">
            <span className="block truncate" style={{ fontSize: 10, color: 'var(--c-text-faint)', lineHeight: 1.15 }}>
              {card.label}
            </span>
            <strong style={{ display: 'block', fontSize: 14, color: 'var(--c-text)', lineHeight: 1.2 }}>
              {card.value}
            </strong>
          </span>
        </div>
      ))}

      <div className="min-w-[1px] flex-1" />

      <div className="flex flex-wrap items-center gap-1.5">
        <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--c-text-faint)', marginRight: 2 }}>
          {t('skills.coreApps', 'Core apps')}
        </span>
        {CORE_SKILL_TOOLS.map((tool) => {
          const icon = getToolIconFor(tool)
          const count = skills.filter((skill) => isSkillEnabledForTool(skill, tool)).length
          return (
            <div
              key={tool.id}
              className="flex items-center gap-1.5 rounded-md px-2 py-1"
              style={{ background: tool.soft, color: tool.color, border: `1px solid ${tool.color}1F` }}
            >
              {icon ? <img src={icon} alt="" style={{ width: 13, height: 13 }} /> : null}
              <span style={{ fontSize: 10, fontWeight: 700 }}>{tool.label}</span>
              <span style={{ fontSize: 10, fontVariantNumeric: 'tabular-nums' }}>{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
