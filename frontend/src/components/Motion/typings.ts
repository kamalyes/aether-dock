import type { ReactNode } from 'react'

export interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
  duration?: number
}

export interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
}

export interface StaggerItemProps {
  children: ReactNode
  className?: string
}

export interface SlideDrawerProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  width?: string
}

export interface PageTransitionProps {
  children: ReactNode
}

export interface ScaleHoverProps {
  children: ReactNode
  className?: string
  scale?: number
  y?: number
}
