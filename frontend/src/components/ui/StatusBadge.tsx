import { useTranslation } from 'react-i18next'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

const STATUS_CONFIG: Record<string, { dot: string; bg: string; color: string }> = {
  installed: { dot: 'status-dot-installed', bg: 'var(--c-green-soft)', color: 'var(--c-green)' },
  update_available: { dot: 'status-dot-update', bg: 'var(--c-amber-soft)', color: 'var(--c-amber)' },
  modified: { dot: 'status-dot-modified', bg: 'var(--c-cyan-soft)', color: 'var(--c-cyan)' },
  error: { dot: 'status-dot-error', bg: 'var(--c-red-soft)', color: 'var(--c-red)' },
  installing: { dot: 'status-dot-installing', bg: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-secondary)' },
  enabled: { dot: 'status-dot-installed', bg: 'var(--c-green-soft)', color: 'var(--c-green)' },
  disabled: { dot: 'status-dot-disabled', bg: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-faint)' },
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const { t } = useTranslation()
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.error

  const statusLabels: Record<string, string> = {
    installed: t('skills.installed'),
    update_available: t('skills.update'),
    modified: t('skills.modified'),
    error: t('skills.error'),
    installing: t('skills.installing'),
    enabled: t('mcp.enabled'),
    disabled: t('mcp.disabled'),
  }

  const px = size === 'sm' ? 6 : 8
  const py = size === 'sm' ? 2 : 2
  const fs = size === 'sm' ? 10 : 11
  const dotSize = size === 'sm' ? 6 : 8

  return (
    <span
      className="inline-flex items-center rounded-full font-medium"
      style={{
        background: config.bg,
        color: config.color,
        fontSize: fs,
        paddingLeft: px,
        paddingRight: px,
        paddingTop: py,
        paddingBottom: py,
        gap: 4,
      }}
    >
      <span className={`status-dot ${config.dot}`} style={{ width: dotSize, height: dotSize }} />
      {statusLabels[status] || status}
    </span>
  )
}
