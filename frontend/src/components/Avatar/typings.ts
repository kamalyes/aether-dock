import type { CSSProperties, ReactNode } from 'react'

export interface IconAvatarProps {
  iconUrl?: string
  iconEmoji?: string
  iconBackground?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: CSSProperties
  fallbackIcon?: ReactNode
}
