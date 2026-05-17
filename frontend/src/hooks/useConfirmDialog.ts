import { useState, useCallback, useRef } from 'react'

export interface ConfirmDialogState {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm?: () => void
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    open: false,
    title: '',
  })

  const resolveRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback((options: Omit<ConfirmDialogState, 'open' | 'onConfirm'>): Promise<boolean> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve
      setDialogState({
        ...options,
        open: true,
        onConfirm: () => {
          resolve(true)
          setDialogState((prev) => ({ ...prev, open: false }))
        },
      })
    })
  }, [])

  const cancel = useCallback(() => {
    resolveRef.current?.(false)
    resolveRef.current = null
    setDialogState((prev) => ({ ...prev, open: false }))
  }, [])

  return { dialogState, confirm, cancel }
}
