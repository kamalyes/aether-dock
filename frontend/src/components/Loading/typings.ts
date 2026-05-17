import type { CSSProperties } from 'react'

export interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: number
  style?: CSSProperties
  className?: string
}

export interface SpinnerProps {
  size?: number
  color?: string
  className?: string
}

export interface LoadingProps {
  text?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export interface PageLoadingProps {
  message?: string
}

export interface SkeletonCardProps {
  rows?: number
  className?: string
}

export interface ListLoadingProps {
  mode?: 'skeleton' | 'spinner'
  count?: number
  text?: string
}

export interface CardLoadingProps {
  mode?: 'skeleton' | 'spinner'
  count?: number
  rows?: number
}
