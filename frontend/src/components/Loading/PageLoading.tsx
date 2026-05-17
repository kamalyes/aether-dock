import { Spinner } from './Spinner'
import type { PageLoadingProps } from './typings'

export function PageLoading({ message = '加载中...' }: PageLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ height: '100%', minHeight: 300 }}>
      <Spinner size={28} />
      <span style={{ fontSize: 12, color: 'var(--c-text-faint)', marginTop: 12 }}>{message}</span>
    </div>
  )
}
