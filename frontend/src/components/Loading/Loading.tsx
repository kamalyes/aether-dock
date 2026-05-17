import { Spinner } from './Spinner'
import type { LoadingProps } from './typings'

export function Loading({ text = '加载中...', size = 'md', className }: LoadingProps) {
  const spinnerSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 20
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className || ''}`}>
      <Spinner size={spinnerSize} />
      {text && <span style={{ fontSize, color: 'var(--c-text-faint)' }}>{text}</span>}
    </div>
  )
}
