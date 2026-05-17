import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'

type SortField = 'name' | 'updatedAt' | 'createdAt' | 'status'
type SortOrder = 'asc' | 'desc'

interface SortDropdownProps {
  field: SortField
  order: SortOrder
  onFieldChange: (field: SortField) => void
  onOrderChange: (order: SortOrder) => void
}

export function SortDropdown({
  field,
  order,
  onFieldChange,
  onOrderChange,
}: SortDropdownProps) {
  const { t } = useTranslation()

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'name', label: t('skills.sortName', 'Name') },
    { value: 'updatedAt', label: t('skills.sortUpdated', 'Updated') },
    { value: 'createdAt', label: t('skills.sortCreated', 'Created') },
    { value: 'status', label: t('skills.sortStatus', 'Status') },
  ]

  return (
    <div className="flex items-center gap-1">
      <select
        value={field}
        onChange={(e) => onFieldChange(e.target.value as SortField)}
        style={{
          padding: '4px 8px',
          background: 'var(--c-bg-input)',
          border: '1px solid var(--c-border)',
          borderRadius: 'var(--radius-sm)',
          fontSize: 11,
          color: 'var(--c-text-muted)',
          outline: 'none',
          cursor: 'pointer',
        }}
      >
        {sortOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <button
        onClick={() => onOrderChange(order === 'asc' ? 'desc' : 'asc')}
        className="p-1 rounded-md transition-colors"
        style={{ color: 'var(--c-text-faint)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)'; e.currentTarget.style.background = 'transparent' }}
        title={order === 'asc' ? t('skills.ascending', 'Ascending') : t('skills.descending', 'Descending')}
      >
        {order === 'asc' ? (
          <ChevronUp style={{ width: 14, height: 14 }} />
        ) : (
          <ChevronDown style={{ width: 14, height: 14 }} />
        )}
      </button>
    </div>
  )
}
