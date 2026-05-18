import { useTranslation } from 'react-i18next'
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { useSkillStore } from '@/stores/skillStore'
import { useToolStore } from '@/stores/toolStore'

export default function SidebarScanWidget() {
  const { t } = useTranslation()
  const { skills, total, sources, error: skillError } = useSkillStore()
  const { tools } = useToolStore()

  const hasError = !!skillError
  const detectedTools = tools.filter((t) => t.isDetected).length
  const errorSkills = skills.filter((s) => s.status === 'error').length
  const updateSkills = skills.filter((s) => s.status === 'update_available').length
  const hasIssues = hasError || errorSkills > 0

  const statusColor = hasIssues ? 'var(--c-red)' : updateSkills > 0 ? 'var(--c-amber)' : 'var(--c-green)'
  const statusBg = hasIssues ? 'var(--c-red-soft)' : updateSkills > 0 ? 'var(--c-amber-soft)' : 'var(--c-green-soft)'
  const statusLabel = hasIssues ? t('sidebar.hasIssues') : updateSkills > 0 ? t('sidebar.updates') : t('sidebar.ok')
  const StatusIcon = hasIssues ? AlertCircle : updateSkills > 0 ? RefreshCw : CheckCircle2

  return (
    <div
      className="rounded-md px-3 py-3"
      style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
    >
      <div className="flex items-center justify-between gap-2">
        <strong style={{ fontSize: 12, color: 'var(--c-text)', fontWeight: 750 }}>{t('sidebar.scan')}</strong>
        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5" style={{ color: statusColor, background: statusBg, fontSize: 10, fontWeight: 700 }}>
          <StatusIcon style={{ width: 9, height: 9 }} />
          {statusLabel}
        </span>
      </div>
      <p style={{ marginTop: 9, fontSize: 10.5, color: 'var(--c-text-faint)' }}>
        {t('sidebar.skillCount', { count: total || skills.length })}
        {errorSkills > 0 && <span style={{ color: 'var(--c-red)', marginLeft: 4 }}>· {errorSkills} {t('sidebar.errors')}</span>}
        {updateSkills > 0 && <span style={{ color: 'var(--c-amber)', marginLeft: 4 }}>· {updateSkills} {t('sidebar.updates')}</span>}
      </p>
      <p style={{ marginTop: 4, fontSize: 10.5, color: 'var(--c-text-faint)' }}>
        {t('sidebar.sourceCount', { count: sources.length })} · {t('sidebar.toolCount', { count: detectedTools })}
      </p>
    </div>
  )
}
