import React, { forwardRef } from 'react'
import type { TextareaProps } from './typings'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, textareaStyle, className, ...props }, ref) => {
    return (
      <div className={className}>
        {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>{label}</label>}
        <textarea
          ref={ref}
          style={{
            padding: '8px 12px',
            background: 'var(--c-bg-input)',
            border: '1px solid var(--c-border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            color: 'var(--c-text-secondary)',
            outline: 'none',
            width: '100%',
            minHeight: 80,
            resize: 'vertical',
            transition: 'border-color 0.15s ease',
            fontFamily: 'inherit',
            ...textareaStyle,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-border-accent)'; props.onFocus?.(e) }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--c-border)'; props.onBlur?.(e) }}
          {...props}
        />
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'
