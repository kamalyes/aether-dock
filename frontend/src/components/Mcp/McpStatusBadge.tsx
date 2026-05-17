import { useTranslation } from 'react-i18next'
import { StatusBadge, StatusDot } from '@/components/Badge'

interface McpStatusProps {
  status: string
  size?: 'sm' | 'md'
}

const STATUS_META: Record<string, { tone: 'green' | 'red' | 'muted'; key: string; fallback: string }> = {
  enabled: { tone: 'green', key: 'mcp.enabled', fallback: 'Enabled' },
  disabled: { tone: 'muted', key: 'mcp.disabled', fallback: 'Disabled' },
  error: { tone: 'red', key: 'skills.error', fallback: 'Error' },
}

export function McpStatusBadge({ status, size = 'sm' }: McpStatusProps) {
  const { t } = useTranslation()
  const meta = STATUS_META[status] ?? STATUS_META.disabled

  return (
    <StatusBadge
      label={STATUS_META[status] ? t(meta.key, meta.fallback) : status}
      tone={meta.tone}
      size={size}
    />
  )
}

export function McpStatusDot({ status, size = 7 }: { status: string; size?: number }) {
  const meta = STATUS_META[status] ?? STATUS_META.disabled
  return <StatusDot tone={meta.tone} size={size} />
}
