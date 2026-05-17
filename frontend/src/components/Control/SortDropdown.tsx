import { ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { SortDropdownProps } from './typings'

export function SortDropdown({ value, options, onChange, style }: SortDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = options.find((o) => o.value === value)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative" style={style}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
        style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', fontSize: 11, color: 'var(--c-text-muted)', cursor: 'pointer' }}
        type="button"
      >
        {current?.label || 'Sort'}
        <ChevronDown style={{ width: 12, height: 12, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>
      {open && (
        <div
          className="absolute right-0 top-full mt-1 z-50 rounded-lg py-1 min-w-[140px]"
          style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className="w-full text-left px-3 py-1.5 transition-colors"
              style={{
                fontSize: 11,
                color: opt.value === value ? 'var(--c-accent)' : 'var(--c-text-secondary)',
                background: opt.value === value ? 'var(--c-accent-soft)' : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontWeight: opt.value === value ? 600 : 400,
              }}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
