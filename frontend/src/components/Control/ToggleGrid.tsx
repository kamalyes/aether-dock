import { motion } from 'framer-motion'
import type { ToggleGridProps } from './typings'

export function ToggleGrid({ columns = 2, stopPropagation = false, items, onToggle }: ToggleGridProps) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
    >
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onToggle(item.id, !item.enabled)}
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
          style={{
            background: item.enabled ? 'var(--c-accent-soft)' : 'var(--c-bg-input)',
            border: `1px solid ${item.enabled ? 'var(--c-accent)' : 'var(--c-border)'}`,
            cursor: 'pointer',
            fontSize: 11,
            color: item.enabled ? 'var(--c-accent)' : 'var(--c-text-muted)',
            fontWeight: item.enabled ? 600 : 400,
          }}
          type="button"
        >
          {item.icon && (
            <span className="shrink-0">{typeof item.icon === 'string' ? <span>{item.icon}</span> : item.icon}</span>
          )}
          <span className="truncate">{item.label}</span>
          <motion.span
            className="ml-auto shrink-0 rounded-full"
            style={{ width: 8, height: 8, background: item.enabled ? 'var(--c-accent)' : 'var(--c-text-faint)' }}
            animate={{ scale: item.enabled ? 1 : 0.6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          />
        </button>
      ))}
    </div>
  )
}
