import { useTranslation } from 'react-i18next'
import { Spinner } from './Spinner'
import type { LoadingProps } from './typings'

export function Loading({ text, size = 'md', className }: LoadingProps) {
  const { t } = useTranslation()
  const displayText = text ?? t('loading.default')
  const spinnerSize = size === 'sm' ? 16 : size === 'lg' ? 28 : 20
  const fontSize = size === 'sm' ? 10 : size === 'lg' ? 13 : 11

  return (
    <div className={`flex flex-col items-center justify-center gap-2 ${className || ''}`}>
      <Spinner size={spinnerSize} />
      {displayText && <span style={{ fontSize, color: 'var(--c-text-faint)' }}>{displayText}</span>}
    </div>
  )
}
