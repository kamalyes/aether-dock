import { useState } from 'react'
import { CheckSquare, Square, Download, Trash2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_TOOLS } from '@/constants/tools'

interface BatchActionBarProps {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
  onBatchEnable: (toolName: string) => void
  onBatchDisable: (toolName: string) => void
  onBatchDelete: () => void
}

export function BatchActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBatchEnable,
  onBatchDisable,
  onBatchDelete,
}: BatchActionBarProps) {
  const { t } = useTranslation()
  const [showToolMenu, setShowToolMenu] = useState(false)

  if (selectedCount === 0) return null

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
      style={{ background: 'var(--c-green-soft)', border: '1px solid rgba(5, 150, 105, 0.12)' }}
    >
      <span style={{ fontSize: 11, color: 'var(--c-green)', fontWeight: 500 }}>
        {selectedCount} {t('skills.selected', 'selected')}
      </span>

      <div className="flex items-center gap-1.5 ml-2">
        <button
          onClick={onSelectAll}
          className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md transition-colors"
          style={{ color: 'var(--c-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
        >
          {selectedCount === totalCount ? (
            <CheckSquare style={{ width: 12, height: 12 }} />
          ) : (
            <Square style={{ width: 12, height: 12 }} />
          )}
          {t('skills.selectAll', 'Select All')}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowToolMenu(!showToolMenu)}
            className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md transition-colors"
            style={{ color: 'var(--c-text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-green)'; e.currentTarget.style.background = 'var(--c-green-soft)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <Download style={{ width: 12, height: 12 }} />
            {t('skills.batchInstall', 'Batch Install')}
          </button>
          {showToolMenu && (
            <div
              className="absolute top-full left-0 mt-1 rounded-lg shadow-xl py-1 z-50 min-w-[140px]"
              style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-border)' }}
            >
              {SUPPORTED_TOOLS.map((tool) => (
                <button
                  key={tool}
                  onClick={() => {
                    onBatchEnable(tool)
                    setShowToolMenu(false)
                  }}
                  className="w-full text-left px-3 py-1.5 text-[11px] transition-colors"
                  style={{ color: 'var(--c-text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.03)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-muted)'; e.currentTarget.style.background = 'transparent' }}
                >
                  {t('skills.installTo', 'Install to')} {tool}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onBatchDelete}
          className="flex items-center gap-1 px-2 py-1 text-[10px] rounded-md transition-colors"
          style={{ color: 'var(--c-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-red)'; e.currentTarget.style.background = 'var(--c-red-soft)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-muted)'; e.currentTarget.style.background = 'transparent' }}
        >
          <Trash2 style={{ width: 12, height: 12 }} />
          {t('skills.batchDelete', 'Delete')}
        </button>
      </div>

      <div className="flex-1" />

      <button
        onClick={onClearSelection}
        className="p-1 rounded transition-colors"
        style={{ color: 'var(--c-text-faint)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  )
}
