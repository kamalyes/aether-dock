import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import type { Skill } from '@/types'
import { useSkillStore } from '@/stores/skillStore'
import { wailsApi } from '@/services/wailsBridge'
import { toast } from '@/stores/toastStore'
import { ConfirmDialog } from '@/components/Dialog'
import { Skeleton, SkeletonList, SkeletonStats } from '@/components/Loading'
import { useConfirmDialog } from '@/hooks/useConfirmDialog'
import SkillDetailPage from '@/components/Skills/SkillDetailPage'
import {
  BatchActionBar,
  CORE_SKILL_TOOLS,
  SkillFilterBar,
  SkillImportExportPanel,
  SkillMarketplacePanel,
  SkillMatrixTable,
  SkillWorkbenchPreview,
  SkillUsagePanel,
  type CoreSkillTool,
  type CoreSkillToolId,
  type SkillsWorkbenchView,
  isSkillEnabledForTool,
} from '@/components/Skills'

export default function SkillsPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const {
    skills,
    total,
    loading,
    sources,
    searchQuery,
    selectedSkillIds,
    updateChecking,
    fetchSkills,
    fetchSources,
    setFilter,
    setSearchQuery,
    toggleSkillSelection,
    selectAllVisible,
    clearSelection,
    enableForTool,
    disableForTool,
    batchEnableForTool,
    batchDelete,
    checkAllUpdates,
    installFromGit,
    installFromLocal,
  } = useSkillStore()

  const [activeView, setActiveViewState] = useState<SkillsWorkbenchView>(() => {
    const requested = searchParams.get('view')
    return requested === 'transfer' || requested === 'market' || requested === 'usage' ? requested : 'library'
  })
  const [statusFilter, setStatusFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState('all')
  const [toolFilter, setToolFilter] = useState<string>('all')
  const [previewSkill, setPreviewSkill] = useState<Skill | null>(null)
  const [detailSkill, setDetailSkill] = useState<Skill | null>(null)
  const [marketInstallingId, setMarketInstallingId] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const { dialogState, confirm, cancel } = useConfirmDialog()

  const refreshAll = async () => {
    await Promise.all([fetchSkills(), fetchSources()])
  }

  const setActiveView = (view: SkillsWorkbenchView) => {
    setActiveViewState(view)
    setSearchParams(view === 'library' ? {} : { view })
  }

  useEffect(() => {
    setFilter({ status: '', sourceId: '', page: 1, pageSize: 200 })
    void (async () => {
      await refreshAll()
      setInitialLoading(false)
    })()
  }, [])

  useEffect(() => {
    const requested = searchParams.get('view')
    if (requested === 'transfer' || requested === 'market' || requested === 'usage') {
      setActiveViewState(requested)
    } else {
      setActiveViewState('library')
    }
  }, [searchParams])

  const filteredSkills = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return skills.filter((skill) => {
      if (query) {
        const matchesQuery = [
          skill.name,
          skill.description,
          skill.sourceName,
          skill.installPath,
          ...(skill.tags ?? []),
        ]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLowerCase().includes(query))
        if (!matchesQuery) return false
      }

      if (statusFilter !== 'all' && skill.status !== statusFilter) {
        return false
      }

      if (sourceFilter !== 'all' && skill.sourceId !== sourceFilter) {
        return false
      }

      if (toolFilter !== 'all') {
        const tool = CORE_SKILL_TOOLS.find((item) => item.id === toolFilter)
        if (tool && !isSkillEnabledForTool(skill, tool)) {
          return false
        }
      }

      return true
    })
  }, [searchQuery, skills, sourceFilter, statusFilter, toolFilter])

  const installedSkillNames = useMemo(
    () => new Set(skills.map((skill) => skill.name.toLowerCase())),
    [skills],
  )

  const selectedVisibleIds = filteredSkills.map((skill) => skill.id)

  useEffect(() => {
    if (activeView !== 'library') return
    if (previewSkill && filteredSkills.some((skill) => skill.id === previewSkill.id)) return
    setPreviewSkill(filteredSkills[0] ?? null)
  }, [activeView, filteredSkills, previewSkill])

  const toggleAllVisible = () => {
    if (filteredSkills.length > 0 && filteredSkills.every((skill) => selectedSkillIds.has(skill.id))) {
      clearSelection()
      return
    }
    selectAllVisible(selectedVisibleIds)
  }

  const handleToggleTool = async (skill: Skill, tool: CoreSkillTool, enabled: boolean) => {
    if (enabled) {
      await enableForTool(skill.id, tool.toolName)
    } else {
      await disableForTool(skill.id, tool.toolName)
    }
    await fetchSources()
  }

  const handleBatchDisable = async (toolName: string) => {
    const ids = Array.from(selectedSkillIds)
    for (const id of ids) {
      await disableForTool(id, toolName)
    }
    clearSelection()
  }

  const handleBatchDelete = async () => {
    const ids = Array.from(selectedSkillIds)
    const ok = await confirm({
      title: t('skills.batchDelete'),
      description: t('skills.batchDeleteConfirm', { count: ids.length }),
      confirmLabel: t('confirm.delete'),
    })
    if (ok) {
      await batchDelete(ids)
      if (previewSkill && ids.includes(previewSkill.id)) {
        setPreviewSkill(null)
      }
      if (detailSkill && ids.includes(detailSkill.id)) {
        setDetailSkill(null)
      }
    }
  }

  const handleAddFolder = async () => {
    const resp = await wailsApi.browseFolder()
    if (!resp.success || !resp.data) return
    const ok = await installFromLocal(resp.data, '', '')
    if (ok) {
      await refreshAll()
    }
  }

  const handleInstallMarketSkill = async (item: { id: string; name: string; url: string; author?: string }) => {
    if (!item.url) return
    setMarketInstallingId(item.id)
    const ok = await installFromGit(item.url, 'main', '', item.author || 'Marketplace')
    setMarketInstallingId(null)
    if (ok) {
      toast.success(t('skills.marketInstallSuccess', { name: item.name }))
      await refreshAll()
    }
  }

  const activeTool = CORE_SKILL_TOOLS.find((tool) => tool.id === (toolFilter as CoreSkillToolId))

  if (initialLoading) {
    return (
      <div className="h-full overflow-y-auto px-5 py-5">
        <div className="max-w-[1320px] mx-auto space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 750, color: 'var(--c-text)' }}>{t('skills.title')}</h1>
              <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 2 }}>{t('skills.workbenchSubtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton width={92} height={34} borderRadius={8} />
              <Skeleton width={124} height={34} borderRadius={8} />
              <Skeleton width={128} height={34} borderRadius={8} />
            </div>
          </div>
          <Skeleton width="100%" height={58} borderRadius={12} />
          <SkeletonStats count={4} />
          <SkeletonList count={6} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <div className="h-full overflow-y-auto px-5 py-4">
        <div className="mx-auto max-w-[1500px] space-y-3">
          <SkillFilterBar
            activeView={activeView}
            searchQuery={searchQuery}
            statusFilter={statusFilter}
            sourceFilter={sourceFilter}
            toolFilter={toolFilter}
            sources={sources}
            loading={loading}
            updateChecking={updateChecking}
            onActiveViewChange={setActiveView}
            onSearchChange={setSearchQuery}
            onStatusFilterChange={setStatusFilter}
            onSourceFilterChange={setSourceFilter}
            onToolFilterChange={setToolFilter}
            onRefresh={refreshAll}
            onCheckUpdates={checkAllUpdates}
            onAddFolder={handleAddFolder}
          />

          {activeView === 'library' ? (
            <div className="space-y-2.5">
              <BatchActionBar
                selectedCount={selectedSkillIds.size}
                totalCount={filteredSkills.length}
                onSelectAll={toggleAllVisible}
                onClearSelection={clearSelection}
                onBatchEnable={(toolName) => batchEnableForTool(Array.from(selectedSkillIds), toolName)}
                onBatchDisable={handleBatchDisable}
                onBatchDelete={handleBatchDelete}
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontWeight: 650 }}>
                    {t('skills.libraryTitle')}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>
                    {t('skills.libraryCount', {
                      visible: filteredSkills.length,
                      total: total || skills.length,
                    })}
                  </span>
                </div>
                {activeTool ? (
                  <span style={{ fontSize: 11, color: 'var(--c-accent)', background: 'var(--c-accent-soft)', padding: '4px 8px', borderRadius: 8 }}>
                    {t('skills.filteredByApp', { app: activeTool.label })}
                  </span>
                ) : null}
              </div>

              <SkillMatrixTable
                skills={filteredSkills}
                sources={sources}
                selectedSkillIds={selectedSkillIds}
                selectedSkillId={previewSkill?.id}
                loading={loading}
                onSelectSkill={setPreviewSkill}
                onOpenSkill={setDetailSkill}
                onToggleSelection={toggleSkillSelection}
                onToggleAll={toggleAllVisible}
                onToggleTool={handleToggleTool}
              />

              <SkillWorkbenchPreview
                skill={previewSkill}
                onOpenDetail={setDetailSkill}
              />
            </div>
          ) : null}

          {activeView === 'transfer' ? (
            <SkillImportExportPanel
              skills={skills}
              selectedSkillIds={selectedSkillIds}
              onImported={refreshAll}
            />
          ) : null}

          {activeView === 'market' ? (
            <SkillMarketplacePanel
              installedSkillNames={installedSkillNames}
              installingId={marketInstallingId}
              onInstallSkill={handleInstallMarketSkill}
            />
          ) : null}

          {activeView === 'usage' ? (
            <SkillUsagePanel skills={skills} />
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {detailSkill ? (
          <motion.div
            className="absolute inset-y-0 right-0 z-40"
            style={{
              width: 760,
              maxWidth: 'calc(100vw - 176px)',
              borderLeft: '1px solid var(--c-border)',
              background: 'var(--c-bg)',
              boxShadow: '-8px 0 24px rgba(0,0,0,0.08)',
            }}
            initial={{ x: 760, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 760, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <SkillDetailPage skillId={detailSkill.id} onBack={() => setDetailSkill(null)} />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        description={dialogState.description}
        confirmLabel={dialogState.confirmLabel}
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm || (() => {})}
        onCancel={cancel}
      />
    </div>
  )
}
