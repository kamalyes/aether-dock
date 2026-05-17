import { Skeleton } from './Skeleton'

interface SkeletonStatsProps {
  count?: number
}

export function SkeletonStats({ count = 4 }: SkeletonStatsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-5">
          <Skeleton width={24} height={24} borderRadius={6} style={{ marginBottom: 12 }} />
          <Skeleton width="50%" height={18} style={{ marginBottom: 6 }} />
          <Skeleton width="70%" height={10} />
        </div>
      ))}
    </div>
  )
}
