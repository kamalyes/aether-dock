import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import type { CopyableFieldProps } from './typings'

export function CopyableField({ value, displayValue, placeholder = '-', icon, className = '', monospace = true }: CopyableFieldProps) {
  const [copied, setCopied] = useState(false)
  const shownValue = displayValue || value || placeholder
  const canCopy = Boolean(value)

  const copy = async () => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 min-w-0 ${className}`} style={{ background: 'var(--c-bg-input)' }}>
      {icon ? <span className="shrink-0">{icon}</span> : null}
      <span className="truncate flex-1" style={{ fontSize: 11, color: 'var(--c-text-muted)', fontFamily: monospace ? 'monospace' : undefined }} title={value}>
        {shownValue}
      </span>
      {canCopy && (
        <button
          onClick={copy}
          className="shrink-0 p-1 rounded transition-colors"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--c-text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
          type="button"
        >
          {copied ? <Check style={{ width: 14, height: 14, color: 'var(--c-green)' }} /> : <Copy style={{ width: 14, height: 14 }} />}
        </button>
      )}
    </div>
  )
}
