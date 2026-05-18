import { useMemo, useState, type ReactNode } from 'react'
import { Check, CircleMinus, Columns3, MoreHorizontal } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Skill, SkillSource } from '@/types'
import { SkillIcon } from './SkillIcon'
import { SkillStatusBadge } from './SkillStatusBadge'
import {
  CORE_SKILL_TOOLS,
  type CoreSkillTool,
  formatSkillDate,
  getSkillUsage,
  getToolIconFor,
  isSkillEnabledForTool,
  shortPath,
  sourceLabel,
} from './utils'

type ColumnKey = 'description' | 'status' | 'matrix' | 'calls' | 'updated'

const DEFAULT_VISIBLE = new Set<ColumnKey>(['status', 'matrix', 'calls', 'updated'])

interface SkillMatrixTableProps {
  skills: Skill[]
  sources: SkillSource[]
  selectedSkillIds: Set<string>
  selectedSkillId?: string
  loading?: boolean
  onSelectSkill: (skill: Skill) => void
  onOpenSkill?: (skill: Skill) => void
  onToggleSelection: (skillId: string) => void
  onToggleAll: () => void
  onToggleTool: (skill: Skill, tool: CoreSkillTool, enabled: boolean) => void
}

export function SkillMatrixTable({
  skills,
  sources,
  selectedSkillIds,
  selectedSkillId,
  loading,
  onSelectSkill,
  onOpenSkill,
  onToggleSelection,
  onToggleAll,
  onToggleTool,
}: SkillMatrixTableProps) {
  const { t } = useTranslation()
  const [visibleCols, setVisibleCols] = useState<Set<ColumnKey>>(DEFAULT_VISIBLE)
  const allSelected = skills.length > 0 && skills.every((skill) => selectedSkillIds.has(skill.id))
  const someSelected = skills.some((skill) => selectedSkillIds.has(skill.id))

  const showDescription = visibleCols.has('description')
  const showStatus = visibleCols.has('status')
  const showMatrix = visibleCols.has('matrix')
  const showCalls = visibleCols.has('calls')
  const showUpdated = visibleCols.has('updated')

  const columnDefs = useMemo(
    () => [
      { key: 'description' as ColumnKey, label: t('skills.description') },
      { key: 'status' as ColumnKey, label: t('skills.status'), disabled: true },
      { key: 'matrix' as ColumnKey, label: t('skills.toolMatrix'), disabled: true },
      { key: 'calls' as ColumnKey, label: t('skills.calls') },
      { key: 'updated' as ColumnKey, label: t('skills.updatedAt') },
    ],
    [t],
  )

  const toolColumnWidth = 78
  const toolMatrixWidth = Math.max(304, CORE_SKILL_TOOLS.length * toolColumnWidth)
  const toolGridColumns = `repeat(${CORE_SKILL_TOOLS.length}, minmax(${toolColumnWidth}px, 1fr))`

  const columns = useMemo(() => {
    const parts: string[] = ['36px', 'minmax(180px,1.15fr)']
    if (showDescription) parts.push('minmax(160px,1fr)')
    if (showStatus) parts.push('104px')
    if (showMatrix) parts.push(`${toolMatrixWidth}px`)
    if (showCalls) parts.push('72px')
    if (showUpdated) parts.push('104px')
    parts.push('38px')
    return parts.join(' ')
  }, [showDescription, showStatus, showMatrix, showCalls, showUpdated, toolMatrixWidth])

  const tableMinWidth = useMemo(() => {
    let w = 360
    if (showDescription) w += 160
    if (showStatus) w += 104
    if (showMatrix) w += toolMatrixWidth
    if (showCalls) w += 72
    if (showUpdated) w += 104
    return w
  }, [showDescription, showStatus, showMatrix, showCalls, showUpdated, toolMatrixWidth])

  if (loading) {
    return (
      <div className="glass-card p-8 text-center">
        <p style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>{t('skills.loading')}</p>
      </div>
    )
  }

  if (skills.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <p style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 600 }}>{t('skills.noSkills')}</p>
        <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>
          {t('skills.noSkillsDesc')}
        </p>
      </div>
    )
  }

  return (
    <section className="glass-card overflow-hidden">
      <div
        className="flex items-center justify-between px-3 shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-elevated)', height: 34 }}
      >
        <span style={{ fontSize: 11, color: 'var(--c-text-faint)', fontWeight: 600 }}>
          {skills.length} {t('skills.countLabel')}
        </span>
        <ColumnVisibilityControl
          columns={columnDefs}
          visible={visibleCols}
          onChange={setVisibleCols}
        />
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: tableMinWidth }}>
          <div
            className="grid items-center"
            style={{
              gridTemplateColumns: columns,
              borderBottom: '1px solid var(--c-border)',
              minHeight: 36,
            }}
          >
            <div className="flex items-center justify-center">
              <input
                aria-label={t('skills.selectAll')}
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected && !allSelected
                }}
                onChange={onToggleAll}
                type="checkbox"
              />
            </div>
            <HeaderCell>{t('skills.tableSkillName')}</HeaderCell>
            {showDescription && <HeaderCell>{t('skills.description')}</HeaderCell>}
            {showStatus && <HeaderCell>{t('skills.status')}</HeaderCell>}
            {showMatrix && (
              <div
                className="grid h-full"
                style={{
                  gridTemplateColumns: toolGridColumns,
                  borderLeft: '1px solid var(--c-border)',
                  borderRight: '1px solid var(--c-border)',
                }}
              >
                {CORE_SKILL_TOOLS.map((tool, toolIndex) => (
                  <div
                    key={tool.id}
                    className="flex min-w-0 items-center justify-center px-1"
                    style={{ borderRight: toolIndex < CORE_SKILL_TOOLS.length - 1 ? '1px solid var(--c-border)' : undefined }}
                  >
                    <span
                      className="truncate"
                      style={{ maxWidth: '100%', fontSize: 10, fontWeight: 600, color: 'var(--c-text-faint)' }}
                      title={tool.label}
                    >
                      {tool.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
            {showCalls && <HeaderCell align="center">{t('skills.calls')}</HeaderCell>}
            {showUpdated && <HeaderCell>{t('skills.updatedAt')}</HeaderCell>}
            <div />
          </div>

          <div>
            {skills.map((skill, index) => (
              <div
                key={skill.id}
                className="grid items-stretch transition-colors hover:bg-[var(--c-bg-card-hover)]"
                style={{
                  gridTemplateColumns: columns,
                  minHeight: 52,
                  borderBottom: index < skills.length - 1 ? '1px solid var(--c-border)' : undefined,
                  background: selectedSkillIds.has(skill.id) || selectedSkillId === skill.id ? 'var(--c-accent-soft)' : undefined,
                }}
              >
                <div className="flex items-center justify-center">
                  <input
                    aria-label={t('skills.selectSkill', { name: skill.name })}
                    checked={selectedSkillIds.has(skill.id)}
                    onChange={() => onToggleSelection(skill.id)}
                    onClick={(event) => event.stopPropagation()}
                    type="checkbox"
                  />
                </div>

                <button
                  className="flex items-center gap-2.5 min-w-0 px-2 text-left transition-colors"
                  onClick={() => onSelectSkill(skill)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  type="button"
                >
                  <SkillIcon
                    iconUrl={skill.metadata?.iconUrl as string}
                    iconEmoji={skill.metadata?.iconEmoji as string}
                    iconBackground={skill.metadata?.iconBackground as string}
                    name={skill.name}
                    size="sm"
                  />
                  <span className="min-w-0">
                    <span style={{ display: 'block', fontSize: 12, fontWeight: 650, color: 'var(--c-text)' }} className="truncate">
                      {skill.name}
                    </span>
                    <span style={{ display: 'block', fontSize: 10, color: 'var(--c-text-faint)', marginTop: 2 }} className="truncate">
                      {sourceLabel(skill, sources)} - {shortPath(skill.installPath)}
                    </span>
                  </span>
                </button>

                {showDescription && (
                  <div className="flex flex-col justify-center min-w-0 px-2">
                    <span style={{ fontSize: 11, color: 'var(--c-text-secondary)' }} className="truncate">
                      {skill.description || t('skills.noDesc')}
                    </span>
                    {skill.tags?.length ? (
                      <span style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 3 }} className="truncate">
                        {skill.tags.slice(0, 3).join(' / ')}
                      </span>
                    ) : null}
                  </div>
                )}

                {showStatus && (
                  <div className="flex items-center px-2">
                    <SkillStatusBadge status={skill.status} />
                  </div>
                )}

                {showMatrix && (
                  <div
                    className="grid"
                    style={{
                      gridTemplateColumns: toolGridColumns,
                      borderLeft: '1px solid var(--c-border)',
                      borderRight: '1px solid var(--c-border)',
                    }}
                  >
                    {CORE_SKILL_TOOLS.map((tool, toolIndex) => {
                      const enabled = isSkillEnabledForTool(skill, tool)
                      const icon = getToolIconFor(tool)
                      return (
                        <div
                          key={tool.id}
                          className="flex items-center justify-center"
                          style={{ borderRight: toolIndex < CORE_SKILL_TOOLS.length - 1 ? '1px solid var(--c-border)' : undefined }}
                        >
                          <button
                            aria-label={enabled ? t('skills.removeFrom') + ` ${tool.label}` : t('skills.installTo') + ` ${tool.label}`}
                            className="flex items-center justify-center rounded-lg transition-all"
                            onClick={() => onToggleTool(skill, tool, !enabled)}
                            style={{
                              width: 28,
                              height: 28,
                              border: enabled ? `1px solid ${tool.color}33` : '1px solid var(--c-border)',
                              background: enabled ? tool.soft : 'var(--c-bg-input)',
                              color: enabled ? tool.color : 'var(--c-text-faint)',
                              cursor: 'pointer',
                            }}
                            title={enabled ? t('skills.installed') : t('skills.notInstalled')}
                            type="button"
                          >
                            {enabled ? (
                              icon ? <img src={icon} alt="" style={{ width: 15, height: 15 }} /> : <Check style={{ width: 15, height: 15 }} />
                            ) : (
                              <CircleMinus style={{ width: 15, height: 15 }} />
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                {showCalls && (
                  <div className="flex items-center justify-center">
                    <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      {getSkillUsage(skill)}
                    </span>
                  </div>
                )}

                {showUpdated && (
                  <div className="flex items-center px-2">
                    <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{formatSkillDate(skill.updatedAt)}</span>
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <button
                    className="p-1.5 rounded-lg transition-colors"
                    onClick={() => onOpenSkill?.(skill) ?? onSelectSkill(skill)}
                    style={{ color: 'var(--c-text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    type="button"
                  >
                    <MoreHorizontal style={{ width: 15, height: 15 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function HeaderCell({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'center' }) {
  return (
    <div
      className="flex items-center px-2"
      style={{
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        fontSize: 10.5,
        fontWeight: 650,
        color: 'var(--c-text-faint)',
        letterSpacing: 0,
        textTransform: 'none',
      }}
    >
      {children}
    </div>
  )
}

function ColumnVisibilityControl<K extends string>({
  columns,
  visible,
  onChange,
}: {
  columns: { key: K; label: string; disabled?: boolean }[]
  visible: Set<K>
  onChange: (visible: Set<K>) => void
}) {
  const [open, setOpen] = useState(false)

  const toggle = (key: K) => {
    const next = new Set(visible)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    onChange(next)
  }

  return (
    <div className="relative">
      <button
        className="flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          color: open ? 'var(--c-accent)' : 'var(--c-text-faint)',
          background: open ? 'var(--c-accent-soft)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
        }}
        type="button"
      >
        <Columns3 style={{ width: 13, height: 13 }} />
        {t('skills.columns')}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 top-full mt-1 z-50 glass-card p-1.5"
            style={{ minWidth: 150, borderRadius: 'var(--radius-md)' }}
          >
            {columns.map((col) => {
              const checked = visible.has(col.key)
              return (
                <label
                  key={col.key}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-colors"
                  style={{ background: checked ? 'var(--c-accent-soft)' : 'transparent', opacity: col.disabled ? 0.5 : 1 }}
                >
                  <input
                    checked={checked}
                    disabled={col.disabled}
                    onChange={() => toggle(col.key)}
                    type="checkbox"
                    className="accent-[var(--c-accent)]"
                  />
                  <span style={{ fontSize: 11, fontWeight: checked ? 600 : 400, color: col.disabled ? 'var(--c-text-faint)' : 'var(--c-text-secondary)' }}>
                    {col.label}
                  </span>
                </label>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
