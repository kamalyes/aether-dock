import { useKeyframes } from '../../hooks/useKeyframes'
import type { SkeletonProps } from './typings'

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style, className }: SkeletonProps) {
  useKeyframes()
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(15,23,42,0.04) 25%, rgba(15,23,42,0.08) 50%, rgba(15,23,42,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'aether-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}
