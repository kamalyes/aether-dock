import { useTranslation } from 'react-i18next'
import { StatusBadge } from '@/components/Badge'

interface SkillStatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const STATUS_META: Record<string, { tone: 'green' | 'amber' | 'cyan' | 'red' | 'muted'; key: string; fallback: string }> = {
  installed: { tone: 'green', key: 'skills.installed', fallback: 'Installed' },
  update_available: { tone: 'amber', key: 'skills.update', fallback: 'Update' },
  modified: { tone: 'cyan', key: 'skills.modified', fallback: 'Modified' },
  error: { tone: 'red', key: 'skills.error', fallback: 'Error' },
  installing: { tone: 'muted', key: 'skills.installing', fallback: 'Installing' },
}

export function SkillStatusBadge({ status, size = 'sm' }: SkillStatusBadgeProps) {
  const { t } = useTranslation()
  const meta = STATUS_META[status] ?? STATUS_META.error

  return (
    <StatusBadge
      label={STATUS_META[status] ? t(meta.key, meta.fallback) : status}
      tone={meta.tone}
      size={size}
    />
  )
}
