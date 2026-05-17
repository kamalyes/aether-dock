import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Columns3 } from 'lucide-react'

export interface ColumnDef {
  key: string
  label: string
  disabled?: boolean
}

export interface ColumnVisibilityProps {
  columns: ColumnDef[]
  visible: Set<string>
  onChange: (visible: Set<string>) => void
  icon?: ReactNode
}

export function ColumnVisibility({ columns, visible, onChange, icon }: ColumnVisibilityProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const toggle = (key: string) => {
    const next = new Set(visible)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange(next)
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="toolbar-button"
        onClick={() => setOpen((prev) => !prev)}
        type="button"
      >
        {icon ?? <Columns3 style={{ width: 13, height: 13 }} />}
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 glass-card p-1.5"
          style={{ minWidth: 160, borderRadius: 'var(--radius-md)' }}
        >
          {columns.map((col) => {
            const checked = visible.has(col.key)
            return (
              <label
                key={col.key}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                style={{ background: checked ? 'var(--c-accent-soft)' : 'transparent' }}
              >
                <input
                  checked={checked}
                  disabled={col.disabled}
                  onChange={() => toggle(col.key)}
                  type="checkbox"
                  className="accent-[var(--c-accent)]"
                />
                <span style={{ fontSize: 11, fontWeight: checked ? 600 : 400, color: col.disabled ? 'var(--c-text-faint)' : 'var(--c-text-secondary)' }}>
                  {col.label}
                </span>
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}
