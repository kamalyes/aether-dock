import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onChange: (page: number) => void
}

export function Pagination({ page, pageSize, total, onChange }: PaginationProps) {
  const { t } = useTranslation()
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const start = Math.min((page - 1) * pageSize + 1, total)
  const end = Math.min(page * pageSize, total)

  if (total <= 0) return null

  return (
    <div className="flex items-center justify-between px-1 py-2">
      <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>
        {t('pagination.range', { start, end, total })}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="flex items-center justify-center rounded-md"
          style={{
            width: 28,
            height: 28,
            border: '1px solid var(--c-border)',
            background: 'var(--c-bg-input)',
            color: page <= 1 ? 'var(--c-text-faint)' : 'var(--c-text-secondary)',
            cursor: page <= 1 ? 'not-allowed' : 'pointer',
            opacity: page <= 1 ? 0.5 : 1,
          }}
        >
          <ChevronLeft style={{ width: 14, height: 14 }} />
        </button>
        <span style={{ fontSize: 11, color: 'var(--c-text-muted)', minWidth: 48, textAlign: 'center' }}>
          {page} / {totalPages}
        </span>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="flex items-center justify-center rounded-md"
          style={{
            width: 28,
            height: 28,
            border: '1px solid var(--c-border)',
            background: 'var(--c-bg-input)',
            color: page >= totalPages ? 'var(--c-text-faint)' : 'var(--c-text-secondary)',
            cursor: page >= totalPages ? 'not-allowed' : 'pointer',
            opacity: page >= totalPages ? 0.5 : 1,
          }}
        >
          <ChevronRight style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  )
}
