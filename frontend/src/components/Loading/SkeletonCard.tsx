import { Skeleton } from './Skeleton'
import type { SkeletonCardProps } from './typings'

export function SkeletonCard({ rows = 3, className }: SkeletonCardProps) {
  return (
    <div className={`glass-card p-5 ${className || ''}`}>
      <Skeleton width="45%" height={12} style={{ marginBottom: 12 }} />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} width={`${80 - i * 10}%`} height={10} style={{ marginBottom: i < rows - 1 ? 8 : 0 }} />
      ))}
    </div>
  )
}
