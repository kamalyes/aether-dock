import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useSkillStore } from '@/stores/skillStore'
import {
  ChevronRight,
  ChevronDown,
  GitBranch,
  FolderOpen,
  Package,
  RefreshCw,
  Plus,
  CheckSquare,
  Square,
  RefreshCcw,
} from 'lucide-react'
import type { Skill } from '@/types'
import ConfirmDialog, { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { SkillCard } from '@/components/skills/SkillCard'
import { SkillListItem } from '@/components/skills/SkillListItem'
import SkillDetailPage from '@/components/skills/SkillDetailPage'
import { BatchActionBar } from '@/components/skills/BatchActionBar'
import { ViewToggle } from '@/components/ui/ViewToggle'
import { SortDropdown } from '@/components/ui/SortDropdown'
import { SearchInput } from '@/components/ui/Form'
import { motion, AnimatePresence } from 'framer-motion'
import { StaggerContainer } from '@/components/ui/motion'
import { FadeIn } from '@/components/ui/motion'
import { ListLoading } from '@/components/ui/Loading'

export default function SkillsPage() {
  const { t } = useTranslation()

  const {
    skills, total, loading, sources, filter,
    viewMode, sortField, sortOrder, searchQuery, selectedSkillIds, favorites,
    fetchSkills, fetchSources, setFilter,
    setViewMode, setSortField, setSortOrder, setSearchQuery,
    toggleSkillSelection, selectAllVisible, clearSelection, toggleFavorite,
    deleteSkill, enableForTool, disableForTool, pullSkill,
    batchEnableForTool, batchDelete,
    checkAllUpdates, updateChecking,
  } = useSkillStore()

  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set())
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [selectedSourceId, setSelectedSourceId] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const { dialogState, confirm, cancel } = useConfirmDialog()

  useEffect(() => {
    fetchSkills()
    fetchSources()
  }, [filter.page, filter.status, filter.sourceId])

  const toggleSource = (id: string) => {
    setExpandedSources((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectSource = (id: string) => {
    if (selectedSourceId === id) {
      setSelectedSourceId('')
      setFilter({ sourceId: '' })
    } else {
      setSelectedSourceId(id)
      setFilter({ sourceId: id })
    }
  }

  const filteredSkills = useMemo(() => {
    let result = skills

    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.tags?.some((tag) => tag.toLowerCase().includes(q))
      )
    }

    if (statusFilter) {
      result = result.filter((s) => s.status === statusFilter)
    }

    if (selectedSourceId) {
      result = result.filter((s) => s.sourceId === selectedSourceId)
    }

    result = [...result].sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name)
          break
        case 'updatedAt':
          cmp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        case 'createdAt':
          cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'status':
          cmp = a.status.localeCompare(b.status)
          break
      }
      return sortOrder === 'asc' ? cmp : -cmp
    })

    return result
  }, [skills, searchQuery, statusFilter, selectedSourceId, sortField, sortOrder])

  const statusCounts = skills.reduce<Record<string, number>>((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {})

  const STATUS_CONFIG: Record<string, { dot: string; label: string; color: string }> = {
    installed: { dot: 'status-dot-installed', label: t('skills.installed'), color: 'var(--c-green)' },
    update_available: { dot: 'status-dot-update', label: t('skills.update'), color: 'var(--c-amber)' },
    modified: { dot: 'status-dot-modified', label: t('skills.modified'), color: 'var(--c-cyan)' },
    error: { dot: 'status-dot-error', label: t('skills.error'), color: 'var(--c-red)' },
    installing: { dot: 'status-dot-installing', label: t('skills.installing'), color: 'var(--c-text-secondary)' },
  }

  const handleSkillClick = (skill: Skill) => {
    if (isSelectionMode) {
      toggleSkillSelection(skill.id)
    } else {
      setSelectedSkill(skill)
    }
  }

  const handleDelete = async (skill: Skill) => {
    const ok = await confirm({
      title: t('skills.delete'),
      description: t('skills.deleteConfirm', { name: skill.name }),
      confirmLabel: t('confirm.delete'),
    })
    if (ok) {
      await deleteSkill(skill.id)
      if (selectedSkill?.id === skill.id) setSelectedSkill(null)
    }
  }

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedSkillIds)
    const ok = await confirm({
      title: t('skills.batchDelete', 'Batch Delete'),
      description: t('skills.batchDeleteConfirm', `Delete ${ids.length} skills?`, { count: ids.length }),
      confirmLabel: t('confirm.delete'),
    })
    if (ok) {
      await batchDelete(ids)
    }
  }

  return (
    <div className="flex h-full relative">
      <div
        className="w-[220px] flex flex-col shrink-0"
        style={{
          background: 'var(--c-bg-panel)',
          borderRight: '1px solid var(--c-border)',
        }}
      >
        <div className="px-3 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t('skills.search')}
          />
        </div>

        <div className="flex-1 overflow-y-auto py-1.5 px-2">
          <button
            onClick={() => { setSelectedSourceId(''); setFilter({ sourceId: '' }) }}
            className={`w-full flex items-center gap-2 px-2.5 py-[6px] rounded-lg text-[11.5px] font-medium transition-all duration-150 ${
              selectedSourceId === '' ? 'nav-link-active' : 'nav-link'
            }`}
          >
            <Package style={{ width: 14, height: 14 }} />
            <span className="flex-1 text-left">{t('skills.all')}</span>
            <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }} className="tabular-nums">{total}</span>
          </button>

          <div className="mt-3 mb-1 px-2.5">
            <span className="section-label">Sources</span>
          </div>

          {sources.map((source) => (
            <div key={source.id}>
              <button
                onClick={() => selectSource(source.id)}
                className={`w-full flex items-center gap-1.5 px-2.5 py-[6px] rounded-lg text-[11.5px] font-medium transition-all duration-150 ${
                  selectedSourceId === source.id ? 'nav-link-active' : 'nav-link'
                }`}
              >
                <span
                  className="shrink-0 cursor-pointer"
                  style={{ color: 'var(--c-text-faint)' }}
                  onClick={(e) => { e.stopPropagation(); toggleSource(source.id) }}
                >
                  {expandedSources.has(source.id) ? (
                    <ChevronDown style={{ width: 12, height: 12 }} />
                  ) : (
                    <ChevronRight style={{ width: 12, height: 12 }} />
                  )}
                </span>
                {source.type === 'git' ? (
                  <GitBranch style={{ width: 14, height: 14, color: 'var(--c-text-faint)' }} className="shrink-0" />
                ) : (
                  <FolderOpen style={{ width: 14, height: 14, color: 'var(--c-amber)' }} className="shrink-0" />
                )}
                <span className="truncate flex-1 text-left">{source.name}</span>
                <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }} className="tabular-nums">
                  {skills.filter((s) => s.sourceId === source.id).length}
                </span>
              </button>

              {expandedSources.has(source.id) && (
                <div className="ml-5 mt-0.5 space-y-px mb-1">
                  {filteredSkills
                    .filter((s) => s.sourceId === source.id)
                    .map((skill) => (
                      <button
                        key={skill.id}
                        onClick={() => handleSkillClick(skill)}
                        className="w-full flex items-center gap-1.5 px-2 py-[5px] rounded-md text-[11px] transition-all duration-150"
                        style={{
                          color: selectedSkill?.id === skill.id ? 'var(--c-text)' : 'var(--c-text-muted)',
                          background: selectedSkill?.id === skill.id ? 'var(--c-accent-soft)' : 'transparent',
                        }}
                        onMouseEnter={(e) => { if (selectedSkill?.id !== skill.id) e.currentTarget.style.background = 'rgba(15, 23, 42, 0.03)' }}
                        onMouseLeave={(e) => { if (selectedSkill?.id !== skill.id) e.currentTarget.style.background = 'transparent' }}
                      >
                        {isSelectionMode && (
                          <span className="shrink-0">
                            {selectedSkillIds.has(skill.id) ? (
                              <CheckSquare style={{ width: 12, height: 12, color: 'var(--c-green)' }} />
                            ) : (
                              <Square style={{ width: 12, height: 12, color: 'var(--c-text-faint)' }} />
                            )}
                          </span>
                        )}
                        <span className={`status-dot ${STATUS_CONFIG[skill.status]?.dot || 'status-dot-installed'}`} />
                        <span className="truncate">{skill.name}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="flex items-center justify-between px-5 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}
        >
          <div className="flex items-center gap-3">
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t('skills.title')}</h2>
            <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }} className="tabular-nums">{filteredSkills.length} {t('skills.configured')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 mr-1">
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                const count = statusCounts[key] || 0
                if (count === 0) return null
                return (
                  <button
                    key={key}
                    onClick={() => setStatusFilter(statusFilter === key ? '' : key)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all duration-150"
                    style={{
                      color: statusFilter === key ? cfg.color : 'var(--c-text-faint)',
                      background: statusFilter === key ? 'var(--c-accent-soft)' : 'transparent',
                    }}
                    onMouseEnter={(e) => { if (statusFilter !== key) e.currentTarget.style.background = 'rgba(15, 23, 42, 0.03)' }}
                    onMouseLeave={(e) => { if (statusFilter !== key) e.currentTarget.style.background = 'transparent' }}
                  >
                    <span className={`status-dot ${cfg.dot}`} />
                    {count}
                  </button>
                )
              })}
            </div>

            <div style={{ width: 1, height: 16, background: 'var(--c-border)' }} />

            <ViewToggle value={viewMode} onChange={setViewMode} />
            <SortDropdown
              field={sortField}
              order={sortOrder}
              onFieldChange={setSortField}
              onOrderChange={setSortOrder}
            />

            <button
              onClick={() => setIsSelectionMode(!isSelectionMode)}
              className="p-1.5 rounded-lg transition-colors"
              style={{
                color: isSelectionMode ? 'var(--c-green)' : 'var(--c-text-faint)',
                background: isSelectionMode ? 'var(--c-green-soft)' : 'transparent',
              }}
              title={t('skills.selectionMode', 'Selection Mode')}
            >
              <CheckSquare style={{ width: 14, height: 14 }} />
            </button>

            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--c-text-faint)' }}
              onClick={() => fetchSkills()}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
            </button>

            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--c-amber)' }}
              onClick={() => checkAllUpdates()}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-amber-soft)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
              title={t('skills.checkUpdates', 'Check for updates')}
            >
              <RefreshCcw style={{ width: 14, height: 14 }} className={updateChecking ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={() => window.location.hash = '/install'}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: 'var(--c-green-soft)', color: 'var(--c-green)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(5, 150, 105, 0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-green-soft)' }}
            >
              <Plus style={{ width: 12, height: 12 }} />
              {t('skills.install')}
            </button>
          </div>
        </div>

        {isSelectionMode && (
          <div className="px-5 py-2" style={{ borderBottom: '1px solid var(--c-border)' }}>
            <BatchActionBar
              selectedCount={selectedSkillIds.size}
              totalCount={filteredSkills.length}
              onSelectAll={() => selectAllVisible(filteredSkills.map((s) => s.id))}
              onClearSelection={clearSelection}
              onBatchEnable={(toolName) => batchEnableForTool(Array.from(selectedSkillIds), toolName)}
              onBatchDisable={() => {}}
              onBatchDelete={handleBatchDelete}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <ListLoading mode="skeleton" count={6} />
          ) : filteredSkills.length === 0 ? (
            <FadeIn>
              <div className="flex flex-col items-center justify-center py-20">
                <Package style={{ width: 40, height: 40, color: 'var(--c-text-faint)', marginBottom: 12 }} />
                <p style={{ color: 'var(--c-text-muted)', fontSize: 13, fontWeight: 500 }}>{t('skills.noSkills')}</p>
                <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>{t('skills.noSkillsDesc')}</p>
              </div>
            </FadeIn>
          ) : viewMode === 'gallery' ? (
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredSkills.map((skill) => (
                <SkillCard
                  key={skill.id}
                  skill={skill}
                  onClick={handleSkillClick}
                  onToggleFavorite={toggleFavorite}
                  onDelete={handleDelete}
                  isFavorite={favorites.has(skill.id)}
                  hasUpdate={skill.status === 'update_available'}
                />
              ))}
            </StaggerContainer>
          ) : (
            <div className="glass-card overflow-hidden">
              {filteredSkills.map((skill) => (
                <SkillListItem
                  key={skill.id}
                  skill={skill}
                  onClick={handleSkillClick}
                  onToggleFavorite={toggleFavorite}
                  onDelete={handleDelete}
                  isFavorite={favorites.has(skill.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedSkill && (
          <motion.div
          className="absolute inset-y-0 right-0 z-40"
          style={{ width: 520, borderLeft: '1px solid var(--c-border)', background: 'var(--c-bg)', boxShadow: '-8px 0 24px rgba(0,0,0,0.06)' }}
          initial={{ x: 520, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 520, opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <SkillDetailPage
            skillId={selectedSkill.id}
            onBack={() => setSelectedSkill(null)}
          />
        </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        description={dialogState.description}
        confirmLabel={dialogState.confirmLabel}
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm}
        onCancel={cancel}
      />
    </div>
  )
}
