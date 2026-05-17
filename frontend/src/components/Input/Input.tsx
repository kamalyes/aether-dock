import React, { forwardRef } from 'react'
import type { InputProps } from './typings'

const baseInputStyle: React.CSSProperties = {
  padding: '8px 12px',
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

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, prefix, suffix, inputStyle, monospace, className, ...props }, ref) => {
    return (
      <div className={className}>
        {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>{label}</label>}
        <div className="flex items-center gap-0" style={{ position: 'relative' }}>
          {prefix && (
            <div className="shrink-0 flex items-center pl-3" style={{ height: 34, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', borderRight: 'none', borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', color: 'var(--c-text-faint)', fontSize: 11 }}>
              {prefix}
            </div>
          )}
          <input
            ref={ref}
            style={{
              ...baseInputStyle,
              ...(prefix ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 } : {}),
              ...(suffix ? { borderTopRightRadius: 0, borderBottomRightRadius: 0 } : {}),
              ...(error ? { borderColor: '#EF4444' } : {}),
              ...(monospace ? { fontFamily: 'monospace' } : {}),
              ...inputStyle,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--c-border-accent)'; props.onFocus?.(e) }}
            onBlur={(e) => { e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--c-border)'; props.onBlur?.(e) }}
            {...props}
          />
          {suffix && (
            <div className="shrink-0 flex items-center pr-3" style={{ height: 34, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', borderLeft: 'none', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', color: 'var(--c-text-faint)', fontSize: 11 }}>
              {suffix}
            </div>
          )}
        </div>
        {(hint || error) && <p style={{ fontSize: 10, color: error ? '#EF4444' : 'var(--c-text-faint)', marginTop: 3 }}>{error || hint}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
