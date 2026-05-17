import { Skeleton } from './Skeleton'
import { Spinner } from './Spinner'
import type { ListLoadingProps } from './typings'

export function ListLoading({ mode = 'skeleton', count = 5, text }: ListLoadingProps) {
  if (mode === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-2">
        <Spinner size={20} />
        {text && <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{text}</span>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-3 flex items-center gap-3">
          <Skeleton width={32} height={32} borderRadius={8} />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton width={`${60 - i * 5}%`} height={10} />
            <Skeleton width={`${40 - i * 3}%`} height={8} />
          </div>
        </div>
      ))}
    </div>
  )
}
