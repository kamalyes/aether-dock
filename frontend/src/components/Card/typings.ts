import type { ReactNode } from 'react'

export interface StatsCardProps {
  icon: ReactNode
  label: string
  value: number | string
  subtitle?: string
  color?: 'accent' | 'green' | 'amber' | 'red' | 'violet' | 'cyan' | 'muted'
  onClick?: () => void
}

export interface MetricTileProps {
  label: string
  value: number | string
  icon?: ReactNode
  tone?: 'accent' | 'green' | 'amber' | 'red' | 'violet' | 'cyan' | 'muted'
  surface?: 'card' | 'flat'
}

export interface QuickActionProps {
  icon: ReactNode
  label: string
  description?: string
  color?: 'accent' | 'green' | 'amber' | 'violet'
  onClick: () => void
}
