import React, { useRef, useState } from 'react'
import { Upload as UploadIcon, X, FileArchive, FileCode, File } from 'lucide-react'

interface UploadProps {
  accept?: string
  label?: string
  hint?: string
  value?: string
  onChange: (path: string) => void
  onFileSelect?: (file: File) => void
  className?: string
  icon?: 'zip' | 'code' | 'default'
  placeholder?: string
  dragDrop?: boolean
}

export function Upload({
  accept,
  label,
  hint,
  value,
  onChange,
  onFileSelect,
  className,
  icon = 'default',
  placeholder = 'Click to select or drag file here',
  dragDrop = true,
}: UploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const IconComponent = icon === 'zip' ? FileArchive : icon === 'code' ? FileCode : File

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      onChange(file.name)
      onFileSelect?.(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => {
    setDragging(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onChange(file.name)
      onFileSelect?.(file)
    }
  }

  return (
    <div className={className}>
      {label && (
        <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--c-text-muted)', marginBottom: 4 }}>
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      {value ? (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
        >
          <IconComponent style={{ width: 14, height: 14, color: 'var(--c-accent)', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', flex: 1 }} className="truncate">{value}</span>
          <button
            onClick={() => onChange('')}
            style={{ color: 'var(--c-text-faint)', cursor: 'pointer', padding: 2, flexShrink: 0 }}
            className="transition-colors"
            onMouseEnter={(e) => { e.currentTarget.style.color = '#EF4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
          >
            <X style={{ width: 12, height: 12 }} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={dragDrop ? handleDrop : undefined}
          onDragOver={dragDrop ? handleDragOver : undefined}
          onDragLeave={dragDrop ? handleDragLeave : undefined}
          className="flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg cursor-pointer transition-colors"
          style={{
            background: dragging ? 'var(--c-accent-soft)' : 'var(--c-bg-input)',
            border: `2px dashed ${dragging ? 'var(--c-accent)' : 'var(--c-border)'}`,
          }}
          onMouseEnter={(e) => { if (!dragging) e.currentTarget.style.borderColor = 'var(--c-border-accent)' }}
          onMouseLeave={(e) => { if (!dragging) e.currentTarget.style.borderColor = 'var(--c-border)' }}
        >
          <UploadIcon style={{ width: 20, height: 20, color: dragging ? 'var(--c-accent)' : 'var(--c-text-faint)' }} />
          <span style={{ fontSize: 11, color: dragging ? 'var(--c-accent)' : 'var(--c-text-muted)' }}>{placeholder}</span>
        </div>
      )}
      {hint && (
        <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 3 }}>{hint}</p>
      )}
    </div>
  )
}
