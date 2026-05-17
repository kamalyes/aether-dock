import React, { forwardRef } from 'react'
import type { SelectProps } from './typings'

const baseInputStyle: React.CSSProperties = {
  height: 32,
  padding: '6px 12px',
  background: 'var(--c-bg-input)',
  border: '1px solid var(--c-border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 12,
  color: 'var(--c-text-secondary)',
  outline: 'none',
  width: '100%',
  transition: 'border-color 0.15s ease',
  fontFamily: 'inherit',
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, selectStyle, className, ...props }, ref) => {
    return (
      <div className={className}>
        {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>{label}</label>}
        <select
          ref={ref}
          style={{
            ...baseInputStyle,
            cursor: 'pointer',
            appearance: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: 28,
            ...selectStyle,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-border-accent)'; props.onFocus?.(e) }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--c-border)'; props.onBlur?.(e) }}
          {...props}
        >
          {options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
    )
  }
)
Select.displayName = 'Select'
