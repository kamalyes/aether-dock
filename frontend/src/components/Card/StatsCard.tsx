import { motion } from 'framer-motion'
import type { StatsCardProps } from './typings'

const COLOR_MAP: Record<string, { icon: string; value: string }> = {
  accent: { icon: 'icon-box-accent', value: 'var(--c-accent)' },
  green:  { icon: 'icon-box-green',  value: 'var(--c-green)' },
  amber:  { icon: 'icon-box-amber',  value: 'var(--c-amber)' },
  red:    { icon: 'icon-box-red',    value: 'var(--c-red)' },
  violet: { icon: 'icon-box-violet', value: 'var(--c-violet)' },
  cyan:   { icon: 'icon-box-cyan',   value: 'var(--c-cyan)' },
  muted:  { icon: 'icon-box-muted',  value: 'var(--c-text)' },
}

export function StatsCard({ icon, label, value, subtitle, color = 'muted', onClick }: StatsCardProps) {
  const c = COLOR_MAP[color]

  return (
    <motion.div
      className="glass-card-hover cursor-pointer p-3"
      style={{ height: '100%', minHeight: 92 }}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className={`icon-box ${c.icon}`} style={{ width: 32, height: 32, borderRadius: 8 }}>{icon}</div>
      </div>
      <div className="mb-1 text-[22px] font-bold tabular-nums leading-none" style={{ color: c.value }}>{value}</div>
      <div style={{ color: 'var(--c-text-muted)', fontSize: 11, fontWeight: 650 }}>{label}</div>
      {subtitle ? (
        <div style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 4 }}>{subtitle}</div>
      ) : (
        <div style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 4, opacity: 0 }}>&nbsp;</div>
      )}
    </motion.div>
  )
}
