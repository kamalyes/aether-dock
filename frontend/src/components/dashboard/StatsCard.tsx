import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface StatsCardProps {
  icon: ReactNode
  label: string
  value: number | string
  subtitle?: string
  color?: 'accent' | 'green' | 'amber' | 'red' | 'violet' | 'cyan' | 'muted'
  onClick?: () => void
}

const COLOR_MAP: Record<string, { icon: string; value: string }> = {
  accent: { icon: 'icon-box-accent', value: 'var(--c-accent)' },
  green:  { icon: 'icon-box-green',  value: 'var(--c-green)' },
  amber:  { icon: 'icon-box-amber',  value: 'var(--c-amber)' },
  red:    { icon: 'icon-box-red',    value: 'var(--c-red)' },
  violet: { icon: 'icon-box-violet', value: 'var(--c-violet)' },
  cyan:   { icon: 'icon-box-cyan',   value: 'var(--c-cyan)' },
  muted:  { icon: 'icon-box-muted',  value: 'var(--c-text)' },
}

export function StatsCard({
  icon,
  label,
  value,
  subtitle,
  color = 'muted',
  onClick,
}: StatsCardProps) {
  const c = COLOR_MAP[color]

  return (
    <motion.div
      className="glass-card-hover cursor-pointer p-5"
      style={{ height: '100%', minHeight: 120 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`icon-box ${c.icon}`}>{icon}</div>
      </div>
      <div
        className="text-[24px] font-bold tabular-nums leading-none mb-1"
        style={{ color: c.value }}
      >
        {value}
      </div>
      <div style={{ color: 'var(--c-text-muted)', fontSize: 11, fontWeight: 500 }}>{label}</div>
      {subtitle ? (
        <div style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 4 }}>{subtitle}</div>
      ) : (
        <div style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 4, opacity: 0 }}>&nbsp;</div>
      )}
    </motion.div>
  )
}
