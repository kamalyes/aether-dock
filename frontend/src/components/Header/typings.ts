import type { ReactNode } from 'react'

export interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  actions?: ReactNode
  controls?: ReactNode
  meta?: ReactNode
}
