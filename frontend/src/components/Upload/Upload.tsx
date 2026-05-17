import { Upload as UploadIcon, FolderOpen } from 'lucide-react'
import { useRef } from 'react'
import type { UploadProps } from './typings'

export function Upload({ accept, multiple = false, onFiles, children, className = '', style, label, icon, value, onChange, onBrowse, placeholder, hint }: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length) onFiles?.(files)
    e.target.value = ''
  }

  if (onBrowse || value !== undefined) {
    return (
      <div className={className} style={style}>
        {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>{label}</label>}
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', cursor: onBrowse ? 'pointer' : 'default' }}
          onClick={() => onBrowse?.()}
        >
          {icon && <span className="shrink-0" style={{ color: 'var(--c-text-faint)' }}>{typeof icon === 'string' ? <UploadIcon style={{ width: 14, height: 14 }} /> : icon}</span>}
          <input
            type="text"
            readOnly
            value={value || ''}
            placeholder={placeholder}
            onChange={(e) => onChange?.(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 11, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}
          />
          <FolderOpen style={{ width: 14, height: 14, color: 'var(--c-text-faint)', flexShrink: 0 }} />
        </div>
        {hint && <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 3 }}>{hint}</p>}
      </div>
    )
  }

  return (
    <div className={className} style={style}>
      {label && <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>{label}</label>}
      <input ref={inputRef} type="file" accept={accept} multiple={multiple} onChange={handleChange} style={{ display: 'none' }} />
      <div
        onClick={() => inputRef.current?.click()}
        className="glass-card-hover flex flex-col items-center justify-center gap-2 cursor-pointer"
        style={{ padding: '24px 16px', border: '2px dashed var(--c-border)', borderRadius: 'var(--radius-md)' }}
      >
        {children || (
          <>
            <UploadIcon style={{ width: 24, height: 24, color: 'var(--c-text-faint)' }} />
            <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>点击上传文件</span>
          </>
        )}
      </div>
    </div>
  )
}
