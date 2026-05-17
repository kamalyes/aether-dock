import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { CopyableField } from '@/components/Field'
import { TagList } from '@/components/Field'
import { SkillIcon } from './SkillIcon'
import { SkillStatusBadge } from './SkillStatusBadge'
import { CORE_SKILL_TOOLS, getToolIconFor, isSkillEnabledForTool } from './utils'
import {
  FolderOpen,
  GitBranch,
  Clock,
  Tag,
  ArrowUpFromLine,
  ExternalLink,
  Star,
} from 'lucide-react'

interface SkillDetailDrawerProps {
  skill: Skill
  onEnableForTool: (id: string, toolName: string) => void
  onDisableForTool: (id: string, toolName: string) => void
  onPull: (installPath: string) => void
  onToggleFavorite?: (id: string) => void
  isFavorite?: boolean
}

export function SkillDetailDrawer({
  skill,
  onEnableForTool,
  onDisableForTool,
  onPull,
  onToggleFavorite,
  isFavorite,
}: SkillDetailDrawerProps) {
  const { t } = useTranslation()

  return (
    <div className="p-5 space-y-5">
      <div className="flex items-start gap-4">
        <SkillIcon
          iconUrl={skill.metadata?.iconUrl as string}
          iconEmoji={skill.metadata?.iconEmoji as string}
          iconBackground={skill.metadata?.iconBackground as string}
          name={skill.name}
          size="lg"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--c-text)' }} className="truncate">
              {skill.name}
            </h2>
            {onToggleFavorite && (
              <button
                onClick={() => onToggleFavorite(skill.id)}
                className="p-1 rounded transition-colors"
                style={{ color: isFavorite ? 'var(--c-amber)' : 'var(--c-text-faint)' }}
              >
                <Star style={{ width: 16, height: 16 }} className={isFavorite ? 'fill-current' : ''} />
              </button>
            )}
          </div>
          <SkillStatusBadge status={skill.status} size="md" />
        </div>
      </div>

      {skill.description && (
        <p style={{ fontSize: 12, color: 'var(--c-text-muted)', lineHeight: 1.6 }}>
          {skill.description}
        </p>
      )}

      {skill.tags && skill.tags.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5" style={{ color: 'var(--c-text-faint)' }}>
            <Tag style={{ width: 12, height: 12 }} />
            <span style={{ fontSize: 11, fontWeight: 500 }}>{t('skills.tags', 'Tags')}</span>
          </div>
          <TagList tags={skill.tags} />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2" style={{ color: 'var(--c-text-faint)' }}>
          <FolderOpen style={{ width: 12, height: 12 }} />
          <span style={{ fontSize: 11, fontWeight: 500 }}>{t('skills.path', 'Path')}</span>
        </div>
        <CopyableField value={skill.installPath} />
      </div>

      {skill.gitUrl && (
        <div className="space-y-2">
          <div className="flex items-center gap-2" style={{ color: 'var(--c-text-faint)' }}>
            <GitBranch style={{ width: 12, height: 12 }} />
            <span style={{ fontSize: 11, fontWeight: 500 }}>{t('skills.gitInfo', 'Git')}</span>
          </div>
          <div className="rounded-lg px-3 py-2 space-y-1" style={{ background: 'var(--c-bg-input)' }}>
            <div className="flex items-center gap-2">
              <ExternalLink style={{ width: 12, height: 12, color: 'var(--c-text-faint)' }} />
              <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }} className="font-mono truncate">
                {skill.gitUrl}
              </span>
            </div>
            {skill.gitBranch && (
              <div style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                {t('skills.branch', 'Branch')}: {skill.gitBranch}
                {skill.gitCommit && ` @ ${skill.gitCommit.slice(0, 7)}`}
              </div>
            )}
            <button
              onClick={() => onPull(skill.installPath)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] transition-colors mt-1"
              style={{ color: 'var(--c-text-muted)', background: 'rgba(15, 23, 42, 0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
            >
              <ArrowUpFromLine style={{ width: 12, height: 12 }} />
              {t('skills.pull', 'Pull')}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--c-text-faint)' }}>
          {t('skills.enabledTools', 'Enabled Tools')}
        </span>
        <div className="space-y-1.5">
          {CORE_SKILL_TOOLS.map((tool) => {
            const isEnabled = isSkillEnabledForTool(skill, tool)
            const icon = getToolIconFor(tool)
            return (
              <div
                key={tool.id}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'var(--c-bg-input)' }}
              >
                <div className="flex items-center gap-2">
                  {icon ? (
                    <img src={icon} alt={tool.label} style={{ width: 16, height: 16 }} />
                  ) : (
                    <div
                      className="flex items-center justify-center"
                      style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(15, 23, 42, 0.06)', fontSize: 8, color: 'var(--c-text-faint)' }}
                    >
                      {tool.label[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--c-text-secondary)' }}>{tool.label}</span>
                </div>
                <button
                  onClick={() =>
                    isEnabled
                      ? onDisableForTool(skill.id, tool.toolName)
                      : onEnableForTool(skill.id, tool.toolName)
                  }
                  className={isEnabled ? 'toggle-on' : 'toggle-off'}
                />
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2" style={{ color: 'var(--c-text-faint)' }}>
        <Clock style={{ width: 12, height: 12 }} />
        <span style={{ fontSize: 10 }}>
          {t('skills.updatedAt', 'Updated')}: {new Date(skill.updatedAt).toLocaleString()}
        </span>
      </div>
    </div>
  )
}
