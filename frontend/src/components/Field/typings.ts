import type { ReactNode } from 'react'

export interface CopyableFieldProps {
  value?: string
  displayValue?: string
  placeholder?: string
  icon?: ReactNode
  className?: string
  monospace?: boolean
}

export interface TagListProps {
  tags: string[]
  max?: number
  size?: 'xs' | 'sm' | 'md'
  appearance?: 'default' | 'color'
}
