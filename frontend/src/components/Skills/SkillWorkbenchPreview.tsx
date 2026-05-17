import { AlertTriangle, CheckCircle2, ChevronRight, ExternalLink, FileText, FolderOpen, ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { SkillIcon } from './SkillIcon'
import {
  CORE_SKILL_TOOLS,
  formatSkillDate,
  getSkillUsage,
  getToolIconFor,
  isSkillEnabledForTool,
  shortPath,
} from './utils'

interface SkillWorkbenchPreviewProps {
  skill: Skill | null
  onOpenDetail?: (skill: Skill) => void
}

export function SkillWorkbenchPreview({ skill, onOpenDetail }: SkillWorkbenchPreviewProps) {
  const { t } = useTranslation()

  if (!skill) {
    return (
      <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0, 1fr) 420px 420px' }}>
        <section className="glass-card p-5">
          <p style={{ color: 'var(--c-text-muted)', fontSize: 12, fontWeight: 650 }}>
            {t('skills.previewEmptyTitle', 'Select a skill to preview')}
          </p>
          <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>
            {t('skills.previewEmptyDesc', 'The workbench preview will show SKILL.md content, install locations and validation notes.')}
          </p>
        </section>
      </div>
    )
  }

  const enabledTools = CORE_SKILL_TOOLS.filter((tool) => isSkillEnabledForTool(skill, tool))
  const hasIssue = skill.status === 'error' || skill.status === 'modified' || skill.status === 'update_available'
  const mdPreview = buildSkillMarkdownPreview(skill)

  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: 'minmax(0, 1fr) 420px 420px' }}>
      <section className="glass-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate" style={{ fontSize: 11, color: 'var(--c-text-muted)', fontWeight: 650 }}>
              {skill.name}
            </span>
            <ChevronRight style={{ width: 13, height: 13, color: 'var(--c-text-faint)' }} />
            <span style={{ fontSize: 12, color: 'var(--c-text)', fontWeight: 700 }}>SKILL.md</span>
          </div>
          <button
            className="toolbar-button min-h-0 px-2 py-1 text-[10px]"
            onClick={() => onOpenDetail?.(skill)}
            type="button"
          >
            <ExternalLink style={{ width: 12, height: 12 }} />
            {t('skills.openDetail', 'Detail')}
          </button>
        </div>
        <div className="p-4">
          <div
            className="rounded-md p-4"
            style={{
              minHeight: 250,
              maxHeight: 320,
              overflow: 'auto',
              background: 'var(--c-bg-input)',
              border: '1px solid var(--c-border)',
            }}
          >
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                color: 'var(--c-text-secondary)',
                fontSize: 12,
                lineHeight: 1.65,
                fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
              }}
            >
              {mdPreview}
            </pre>
          </div>
          <p style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 9 }}>
            Markdown - {skill.version ? `v${skill.version}` : t('skills.noVersion', 'No version')}
          </p>
        </div>
      </section>

      <section className="glass-card overflow-hidden">
        <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
          <h3 style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 750 }}>
            {t('skills.installLocations', 'Install locations')}
          </h3>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {CORE_SKILL_TOOLS.map((tool, index) => {
            const enabled = isSkillEnabledForTool(skill, tool)
            const icon = getToolIconFor(tool)
            return (
              <div
                key={tool.id}
                className="grid items-center gap-3 px-4 py-3"
                style={{
                  gridTemplateColumns: '30px minmax(0,1fr) auto',
                  borderBottom: index < CORE_SKILL_TOOLS.length - 1 ? '1px solid var(--c-border)' : undefined,
                }}
              >
                <span
                  className="flex items-center justify-center rounded-md"
                  style={{ width: 30, height: 30, background: tool.soft, color: tool.color }}
                >
                  {icon ? <img src={icon} alt="" style={{ width: 17, height: 17 }} /> : tool.label.slice(0, 1)}
                </span>
                <span className="min-w-0">
                  <strong className="block truncate" style={{ color: 'var(--c-text-secondary)', fontSize: 12 }}>
                    {tool.label}
                  </strong>
                  <span className="block truncate" style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 2 }}>
                    {shortPath(`${tool.toolName}/skills/${skill.name}`)}
                  </span>
                </span>
                <span
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1"
                  style={{
                    color: enabled ? 'var(--c-green)' : 'var(--c-text-faint)',
                    background: enabled ? 'var(--c-green-soft)' : 'var(--c-bg-input)',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  <span className={`status-dot ${enabled ? 'status-dot-installed' : 'status-dot-disabled'}`} />
                  {enabled ? t('skills.installed', 'Installed') : t('skills.notInstalled', 'Not installed')}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="grid gap-3">
        <div className="glass-card overflow-hidden">
          <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--c-border)' }}>
            <h3 style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 750 }}>
              {t('skills.validationResults', 'Validation results')}
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <ValidationLine
              icon={<FileText style={{ width: 13, height: 13 }} />}
              label={t('skills.fileIntegrity', 'File integrity')}
              ok={skill.status !== 'error'}
            />
            <ValidationLine
              icon={<ShieldCheck style={{ width: 13, height: 13 }} />}
              label={t('skills.schemaCheck', 'Schema check')}
              ok={skill.status !== 'error'}
            />
            <ValidationLine
              icon={<FolderOpen style={{ width: 13, height: 13 }} />}
              label={t('skills.referenceCheck', 'Reference files')}
              ok={!hasIssue}
              warning={hasIssue}
            />
            <button className="inline-flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--c-accent)' }} type="button">
              {t('skills.viewDetails', 'View details')}
              <ChevronRight style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label={t('skills.compatibleApps', 'Compatible apps')}
            value={`${enabledTools.length}`}
            helper={enabledTools.map((tool) => tool.label).join(' / ') || t('skills.none', 'None')}
          />
          <MetricCard
            label={t('skills.recentCalls', 'Recent calls')}
            value={`${getSkillUsage(skill)}`}
            helper={formatSkillDate(skill.updatedAt)}
          />
        </div>
      </section>
    </div>
  )
}

function ValidationLine({ icon, label, ok, warning }: { icon: ReactNode; label: string; ok: boolean; warning?: boolean }) {
  const tone = ok ? 'green' : warning ? 'amber' : 'red'
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-2 min-w-0">
        <span style={{ color: `var(--c-${tone})` }}>{icon}</span>
        <span className="truncate" style={{ color: 'var(--c-text-secondary)', fontSize: 12 }}>{label}</span>
      </span>
      <span className="inline-flex items-center gap-1" style={{ color: `var(--c-${tone})`, fontSize: 11, fontWeight: 700 }}>
        {ok ? <CheckCircle2 style={{ width: 13, height: 13 }} /> : <AlertTriangle style={{ width: 13, height: 13 }} />}
        {ok ? 'OK' : warning ? 'Warning' : 'Error'}
      </span>
    </div>
  )
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div className="glass-card p-4 min-w-0">
      <p className="truncate" style={{ color: 'var(--c-text-muted)', fontSize: 11, fontWeight: 650 }}>{label}</p>
      <strong style={{ display: 'block', color: 'var(--c-accent)', fontSize: 24, lineHeight: 1.1, marginTop: 6 }}>{value}</strong>
      <p className="truncate" style={{ color: 'var(--c-text-faint)', fontSize: 10, marginTop: 5 }}>{helper}</p>
    </div>
  )
}

function buildSkillMarkdownPreview(skill: Skill): string {
  const tags = skill.tags?.length ? skill.tags.map((tag) => `#${tag}`).join(' ') : ''
  const lines = [
    `# ${skill.name}`,
    '',
    skill.description || 'No description yet.',
    '',
    tags ? `Tags: ${tags}` : '',
    '',
    '## Metadata',
    `- Version: ${skill.version || '-'}`,
    `- Source: ${skill.sourceName || '-'}`,
    `- Path: ${shortPath(skill.installPath)}`,
    `- Updated: ${formatSkillDate(skill.updatedAt)}`,
  ]
  return lines.filter((line, index) => line || lines[index - 1] !== '').join('\n')
}
