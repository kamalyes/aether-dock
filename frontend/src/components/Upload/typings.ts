import type { ReactNode, CSSProperties } from 'react'

export interface UploadProps {
  accept?: string
  multiple?: boolean
  onFiles?: (files: File[]) => void
  children?: ReactNode
  className?: string
  style?: CSSProperties
  label?: string
  icon?: string | ReactNode
  value?: string
  onChange?: (value: string) => void
  onBrowse?: () => void | Promise<void>
  placeholder?: string
  hint?: string
}
