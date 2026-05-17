import { Search, X } from 'lucide-react'
import type { SearchInputProps } from './typings'

export function SearchInput({ value, onChange, placeholder = 'Search...', className = '', style }: SearchInputProps) {
  return (
    <div className={`relative ${className}`} style={style}>
      <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--c-text-faint)', pointerEvents: 'none' }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          height: 32,
          padding: '6px 30px 6px 30px',
          background: 'var(--c-bg-input)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 12,
          color: 'var(--c-text-secondary)',
          outline: 'none',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--c-border-accent)' }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--c-border)' }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-faint)', padding: 2, display: 'flex', alignItems: 'center' }}
          type="button"
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      )}
    </div>
  )
}
