import type { ReactNode } from 'react'

export interface ToastItem {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

export interface ToastContainerProps {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
}
