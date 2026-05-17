import { useTranslation } from 'react-i18next'
import type { StatusBadgeProps } from './typings'

const STATUS_CONFIG: Record<string, { dot: string; bg: string; color: string }> = {
  installed: { dot: 'status-dot-installed', bg: 'var(--c-green-soft)', color: 'var(--c-green)' },
  update_available: { dot: 'status-dot-update', bg: 'var(--c-amber-soft)', color: 'var(--c-amber)' },
  modified: { dot: 'status-dot-modified', bg: 'var(--c-cyan-soft)', color: 'var(--c-cyan)' },
  error: { dot: 'status-dot-error', bg: 'var(--c-red-soft)', color: 'var(--c-red)' },
  installing: { dot: 'status-dot-installing', bg: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-secondary)' },
  enabled: { dot: 'status-dot-installed', bg: 'var(--c-green-soft)', color: 'var(--c-green)' },
  disabled: { dot: 'status-dot-disabled', bg: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-faint)' },
}

const TONE_CONFIG: Record<string, { bg: string; color: string }> = {
  green: { bg: 'var(--c-green-soft)', color: 'var(--c-green)' },
  amber: { bg: 'var(--c-amber-soft)', color: 'var(--c-amber)' },
  red: { bg: 'var(--c-red-soft)', color: 'var(--c-red)' },
  cyan: { bg: 'var(--c-cyan-soft)', color: 'var(--c-cyan)' },
  muted: { bg: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-faint)' },
}

const STATUS_LABELS: Record<string, string> = {
  installed: 'skills.installed',
  update_available: 'skills.update',
  modified: 'skills.modified',
  error: 'skills.error',
  installing: 'skills.installing',
  enabled: 'mcp.enabled',
  disabled: 'mcp.disabled',
}

export function StatusBadge({ status, label, tone, size = 'sm' }: StatusBadgeProps) {
  const { t } = useTranslation()

  const config = tone
    ? TONE_CONFIG[tone]
    : STATUS_CONFIG[status || 'error'] || STATUS_CONFIG.error

  const displayLabel = label || (status ? t(STATUS_LABELS[status] || status, status) : '')

  const px = size === 'sm' ? 6 : 8
  const fs = size === 'sm' ? 10 : 11
  const dotSize = size === 'sm' ? 6 : 8

  return (
    <span
      className="inline-flex items-center rounded-full font-medium"
      style={{ background: config.bg, color: config.color, fontSize: fs, paddingLeft: px, paddingRight: px, paddingTop: 2, paddingBottom: 2, gap: 4 }}
    >
      {('dot' in config) && <span className={`status-dot ${(config as { dot: string }).dot}`} style={{ width: dotSize, height: dotSize }} />}
      {displayLabel}
    </span>
  )
}
