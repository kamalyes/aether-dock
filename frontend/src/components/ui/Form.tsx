import React, { forwardRef } from 'react'

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

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'style' | 'prefix' | 'suffix'> {
  label?: string
  hint?: string
  error?: string
  prefix?: React.ReactNode
  suffix?: React.ReactNode
  inputStyle?: React.CSSProperties
  monospace?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, prefix, suffix, inputStyle, monospace, className, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>
            {label}
          </label>
        )}
        <div className="flex items-center gap-0" style={{ position: 'relative' }}>
          {prefix && (
            <div
              className="shrink-0 flex items-center pl-3"
              style={{
                height: 34,
                background: 'var(--c-bg-input)',
                border: '1px solid var(--c-border)',
                borderRight: 'none',
                borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                color: 'var(--c-text-faint)',
                fontSize: 11,
              }}
            >
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
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--c-border-accent)'
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? '#EF4444' : 'var(--c-border)'
              props.onBlur?.(e)
            }}
            {...props}
          />
          {suffix && (
            <div
              className="shrink-0 flex items-center pr-3"
              style={{
                height: 34,
                background: 'var(--c-bg-input)',
                border: '1px solid var(--c-border)',
                borderLeft: 'none',
                borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                color: 'var(--c-text-faint)',
                fontSize: 11,
              }}
            >
              {suffix}
            </div>
          )}
        </div>
        {(hint || error) && (
          <p style={{ fontSize: 10, color: error ? '#EF4444' : 'var(--c-text-faint)', marginTop: 3 }}>
            {error || hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'style'> {
  label?: string
  options: { value: string; label: string }[]
  selectStyle?: React.CSSProperties
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, selectStyle, className, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>
            {label}
          </label>
        )}
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
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--c-border-accent)'
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--c-border)'
            props.onBlur?.(e)
          }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
)

Select.displayName = 'Select'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

export function SearchInput({ value, onChange, placeholder = 'Search...', className, style }: SearchInputProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      prefix={
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      }
      className={className}
      inputStyle={style}
    />
  )
}

interface TextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'style'> {
  label?: string
  textareaStyle?: React.CSSProperties
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, textareaStyle, className, ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          style={{
            ...baseInputStyle,
            minHeight: 80,
            resize: 'vertical',
            ...textareaStyle,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--c-border-accent)'
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--c-border)'
            props.onBlur?.(e)
          }}
          {...props}
        />
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
