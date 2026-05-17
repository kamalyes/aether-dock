import { motion } from 'framer-motion'
import type { QuickActionProps } from './typings'

const COLOR_MAP: Record<string, { icon: string; border: string }> = {
  accent: { icon: 'icon-box-accent', border: 'var(--c-accent-soft)' },
  green:  { icon: 'icon-box-green',  border: 'var(--c-green-soft)' },
  amber:  { icon: 'icon-box-amber',  border: 'var(--c-amber-soft)' },
  violet: { icon: 'icon-box-violet', border: 'var(--c-violet-soft)' },
}

export function QuickAction({ icon, label, description, color = 'accent', onClick }: QuickActionProps) {
  const c = COLOR_MAP[color]

  return (
    <motion.button
      className="glass-card-hover flex items-center gap-3 px-4 py-3"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      <div className={`icon-box ${c.icon}`}>{icon}</div>
      <div className="text-left">
        <div style={{ color: 'var(--c-text)', fontSize: 12, fontWeight: 600 }}>{label}</div>
        {description && <div style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 2 }}>{description}</div>}
      </div>
    </motion.button>
  )
}
