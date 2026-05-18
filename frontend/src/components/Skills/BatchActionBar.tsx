import { useState } from 'react'
import { CheckSquare, Square, Download, Trash2, X, MinusCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { CORE_SKILL_TOOLS } from './utils'

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
  const [activeMenu, setActiveMenu] = useState<'install' | 'remove' | null>(null)

  if (selectedCount === 0) return null

  return (
    <div
      className="glass-card flex items-center gap-3 px-3 py-2"
    >
      <span style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontWeight: 700 }}>
        {selectedCount} {t('skills.selected')}
      </span>

      <div className="flex items-center gap-1.5 ml-2">
        <button
          onClick={onSelectAll}
          className="toolbar-button min-h-0 px-2 py-1 text-[10px]"
          style={{ color: 'var(--c-text-muted)' }}
        >
          {selectedCount === totalCount ? (
            <CheckSquare style={{ width: 12, height: 12 }} />
          ) : (
            <Square style={{ width: 12, height: 12 }} />
          )}
          {t('skills.selectAll')}
        </button>

        <div className="relative">
          <button
            onClick={() => setActiveMenu((menu) => menu === 'install' ? null : 'install')}
            className="toolbar-button min-h-0 px-2 py-1 text-[10px]"
            style={{ color: 'var(--c-text-muted)' }}
          >
            <Download style={{ width: 12, height: 12 }} />
            {t('skills.batchInstall')}
          </button>
          {activeMenu === 'install' && (
            <div
              className="absolute top-full left-0 mt-1 rounded-md py-1 z-50 w-[180px]"
              style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-border)' }}
            >
              {CORE_SKILL_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  title={`${t('skills.installTo')} ${tool.label}`}
                  onClick={() => {
                    onBatchEnable(tool.toolName)
                    setActiveMenu(null)
                  }}
                  className="w-full truncate text-left px-3 py-1.5 text-[11px] transition-colors"
                  style={{ color: 'var(--c-text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.03)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-muted)'; e.currentTarget.style.background = 'transparent' }}
                >
                  {t('skills.installTo')} {tool.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setActiveMenu((menu) => menu === 'remove' ? null : 'remove')}
            className="toolbar-button min-h-0 px-2 py-1 text-[10px]"
            style={{ color: 'var(--c-text-muted)' }}
          >
            <MinusCircle style={{ width: 12, height: 12 }} />
            {t('skills.batchRemove')}
          </button>
          {activeMenu === 'remove' && (
            <div
              className="absolute top-full left-0 mt-1 rounded-md py-1 z-50 w-[180px]"
              style={{ background: 'var(--c-bg-card)', border: '1px solid var(--c-border)' }}
            >
              {CORE_SKILL_TOOLS.map((tool) => (
                <button
                  key={tool.id}
                  title={`${t('skills.removeFrom')} ${tool.label}`}
                  onClick={() => {
                    onBatchDisable(tool.toolName)
                    setActiveMenu(null)
                  }}
                  className="w-full truncate text-left px-3 py-1.5 text-[11px] transition-colors"
                  style={{ color: 'var(--c-text-muted)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.03)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-muted)'; e.currentTarget.style.background = 'transparent' }}
                >
                  {t('skills.removeFrom')} {tool.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onBatchDelete}
          className="toolbar-button min-h-0 px-2 py-1 text-[10px]"
          style={{ color: 'var(--c-red)' }}
        >
          <Trash2 style={{ width: 12, height: 12 }} />
          {t('skills.batchDelete')}
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
