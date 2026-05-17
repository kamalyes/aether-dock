import type { ViewToggleProps } from './typings'

export function ViewToggle({ value, options, onChange, style }: ViewToggleProps) {
  return (
    <div className="inline-flex items-center rounded-lg p-0.5" style={{ background: 'var(--c-bg-input)', ...style }}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-1.5 transition-all"
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: active ? 600 : 400,
              color: active ? 'var(--c-accent)' : 'var(--c-text-muted)',
              background: active ? 'var(--c-bg)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              boxShadow: active ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
            }}
            type="button"
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
