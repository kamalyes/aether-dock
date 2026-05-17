import { LayoutGrid, List } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ViewToggleProps {
  value: 'gallery' | 'list'
  onChange: (mode: 'gallery' | 'list') => void
}

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  const { t } = useTranslation()

  return (
    <div
      className="flex items-center rounded-lg p-0.5"
      style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
    >
      <button
        onClick={() => onChange('gallery')}
        className="p-1.5 rounded-md transition-all duration-150"
        style={{
          background: value === 'gallery' ? 'var(--c-bg-card)' : 'transparent',
          color: value === 'gallery' ? 'var(--c-text)' : 'var(--c-text-faint)',
          boxShadow: value === 'gallery' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
        }}
        title={t('skills.galleryView', 'Gallery')}
      >
        <LayoutGrid style={{ width: 14, height: 14 }} />
      </button>
      <button
        onClick={() => onChange('list')}
        className="p-1.5 rounded-md transition-all duration-150"
        style={{
          background: value === 'list' ? 'var(--c-bg-card)' : 'transparent',
          color: value === 'list' ? 'var(--c-text)' : 'var(--c-text-faint)',
          boxShadow: value === 'list' ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
        }}
        title={t('skills.listView', 'List')}
      >
        <List style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )
}
