import { SkeletonCard } from './SkeletonCard'
import { Spinner } from './Spinner'
import type { CardLoadingProps } from './typings'

export function CardLoading({ mode = 'skeleton', count = 6, rows = 2 }: CardLoadingProps) {
  if (mode === 'spinner') {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size={20} />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} rows={rows} />
      ))}
    </div>
  )
}
