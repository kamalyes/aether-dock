import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null

  const isDanger = variant === 'danger'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: 'rgba(15, 23, 42, 0.2)' }}
        onClick={onCancel}
      />
      <div
        className="relative rounded-2xl p-5 max-w-sm w-full mx-4 animate-scale-in"
        style={{
          background: 'var(--c-bg-card)',
          border: '1px solid var(--c-border)',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)',
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: isDanger ? 'var(--c-red-soft)' : 'var(--c-amber-soft)' }}
          >
            <AlertTriangle
              style={{ width: 16, height: 16, color: isDanger ? 'var(--c-red)' : 'var(--c-amber)', opacity: 0.7 }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{title}</h3>
            <p style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.5, marginTop: 4 }}>{description}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-md transition-colors shrink-0"
            style={{ color: 'var(--c-text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
          >
            <X style={{ width: 14, height: 14 }} />
          </button>
        </div>
        <div className="flex items-center justify-end gap-2 mt-4">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{ background: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
            style={{
              background: isDanger ? 'var(--c-red-soft)' : 'var(--c-amber-soft)',
              color: isDanger ? 'var(--c-red)' : 'var(--c-amber)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = isDanger
                ? 'rgba(220, 38, 38, 0.12)'
                : 'rgba(217, 119, 6, 0.12)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = isDanger ? 'var(--c-red-soft)' : 'var(--c-amber-soft)'
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export function useConfirmDialog() {
  const [state, setState] = useState<{
    open: boolean
    title: string
    description: string
    confirmLabel: string
    variant: 'danger' | 'warning'
    onConfirm: () => void
  }>({
    open: false,
    title: '',
    description: '',
    confirmLabel: 'Confirm',
    variant: 'danger',
    onConfirm: () => {},
  })

  const confirm = (opts: {
    title: string
    description: string
    confirmLabel?: string
    variant?: 'danger' | 'warning'
  }): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        open: true,
        title: opts.title,
        description: opts.description,
        confirmLabel: opts.confirmLabel ?? 'Confirm',
        variant: opts.variant ?? 'danger',
        onConfirm: () => {
          setState((prev) => ({ ...prev, open: false }))
          resolve(true)
        },
      })
    })
  }

  const cancel = () => {
    setState((prev) => ({ ...prev, open: false }))
  }

  return { dialogState: state, confirm, cancel }
}
