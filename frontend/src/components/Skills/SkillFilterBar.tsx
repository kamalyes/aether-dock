import { FolderPlus, RefreshCcw, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { SkillSource } from '@/types'
import { PageHeader } from '@/components/Header'
import { Select } from '@/components/Input'
import { CORE_SKILL_TOOLS, uniqueSourceOptions } from './utils'

export type SkillsWorkbenchView = 'library' | 'transfer' | 'market' | 'usage'

interface SkillFilterBarProps {
  activeView: SkillsWorkbenchView
  searchQuery: string
  statusFilter: string
  sourceFilter: string
  toolFilter: string
  sources: SkillSource[]
  loading?: boolean
  updateChecking?: boolean
  onActiveViewChange: (view: SkillsWorkbenchView) => void
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: string) => void
  onSourceFilterChange: (value: string) => void
  onToolFilterChange: (value: string) => void
  onRefresh: () => void
  onCheckUpdates: () => void
  onAddFolder: () => void
}

export function SkillFilterBar({
  activeView,
  searchQuery,
  statusFilter,
  sourceFilter,
  toolFilter,
  sources,
  loading,
  updateChecking,
  onActiveViewChange,
  onSearchChange,
  onStatusFilterChange,
  onSourceFilterChange,
  onToolFilterChange,
  onRefresh,
  onCheckUpdates,
  onAddFolder,
}: SkillFilterBarProps) {
  const { t } = useTranslation()

  const headerTitle = activeView === 'library'
    ? t('skills.libraryTitle', 'Skill library')
    : activeView === 'transfer'
      ? t('skills.viewTransfer', 'Import / Export')
      : activeView === 'market'
        ? t('skills.viewMarket', 'Market')
        : t('skills.viewUsage', 'Usage')

  return (
    <div className="space-y-3">
      <PageHeader
        title={headerTitle}
        subtitle={t('skills.workbenchSubtitle', 'Manage skill files, app installs, import/export and usage from one place.')}
        actions={(
          <>
          <button
            className="toolbar-button"
            onClick={onRefresh}
            type="button"
          >
            <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
            {t('skills.rescan', 'Rescan')}
          </button>
          {activeView === 'library' ? (
            <>
          <button
            className="toolbar-button toolbar-button-warning"
            onClick={onCheckUpdates}
            type="button"
          >
            <RefreshCcw style={{ width: 14, height: 14 }} className={updateChecking ? 'animate-spin' : ''} />
            {t('skills.checkUpdates', 'Check for updates')}
          </button>
          <button
            className="toolbar-button toolbar-button-primary"
            onClick={onAddFolder}
            type="button"
          >
            <FolderPlus style={{ width: 14, height: 14 }} />
            {t('skills.addFolder', 'Add skill folder')}
          </button>
            </>
          ) : null}
          </>
        )}
        controls={activeView === 'library' ? (
          <>
        <label
          className="flex h-8 w-[280px] max-w-full items-center gap-2 rounded-md px-3"
          style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
        >
          <Search style={{ width: 15, height: 15, color: 'var(--c-text-faint)' }} />
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            placeholder={t('skills.search', 'Search skills...')}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--c-text-secondary)',
              fontSize: 12,
            }}
          />
        </label>

        <Select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.currentTarget.value)}
          options={[
            { value: 'all', label: t('skills.allStatuses', 'All statuses') },
            { value: 'installed', label: t('skills.installed', 'Installed') },
            { value: 'update_available', label: t('skills.updateAvailable', 'Update available') },
            { value: 'modified', label: t('skills.modified', 'Modified') },
            { value: 'error', label: t('skills.error', 'Error') },
          ]}
          selectStyle={{ width: 118, height: 32, background: 'var(--c-bg-input)', paddingTop: 6, paddingBottom: 6 }}
        />
        <Select
          value={sourceFilter}
          onChange={(event) => onSourceFilterChange(event.currentTarget.value)}
          options={[{ value: 'all', label: t('skills.allSources', 'All sources') }, ...uniqueSourceOptions(sources)]}
          selectStyle={{ width: 128, height: 32, background: 'var(--c-bg-input)', paddingTop: 6, paddingBottom: 6 }}
        />
        <Select
          value={toolFilter}
          onChange={(event) => onToolFilterChange(event.currentTarget.value)}
          options={[
            { value: 'all', label: t('skills.allApps', 'All apps') },
            ...CORE_SKILL_TOOLS.map((tool) => ({ value: tool.id, label: tool.label })),
          ]}
          selectStyle={{ width: 116, height: 32, background: 'var(--c-bg-input)', paddingTop: 6, paddingBottom: 6 }}
        />
          </>
        ) : null}
      />
    </div>
  )
}
