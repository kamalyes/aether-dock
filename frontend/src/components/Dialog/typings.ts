import type { ReactNode } from 'react'

export interface ConfirmDialogProps {
  open: boolean
  title: string
  description?: string
  confirmText?: string
  confirmLabel?: string
  cancelText?: string
  cancelLabel?: string
  tone?: 'danger' | 'warning' | 'default'
  variant?: 'danger' | 'warning' | 'default'
  icon?: ReactNode
  onConfirm: () => void
  onCancel: () => void
}
