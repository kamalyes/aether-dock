import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { SkillIcon } from '@/components/ui/SkillIcon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { TOOL_ICONS, SUPPORTED_TOOLS } from '@/constants/tools'
import {
  FolderOpen,
  GitBranch,
  Clock,
  Tag,
  ArrowUpFromLine,
  ExternalLink,
  Copy,
  Check,
  Star,
} from 'lucide-react'
import { useState } from 'react'

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
  const [copied, setCopied] = useState(false)

  const copyPath = () => {
    navigator.clipboard.writeText(skill.installPath)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <StatusBadge status={skill.status} size="md" />
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
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-full text-[10px]"
                style={{ background: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-muted)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2" style={{ color: 'var(--c-text-faint)' }}>
          <FolderOpen style={{ width: 12, height: 12 }} />
          <span style={{ fontSize: 11, fontWeight: 500 }}>{t('skills.path', 'Path')}</span>
        </div>
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2"
          style={{ background: 'var(--c-bg-input)' }}
        >
          <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }} className="font-mono truncate flex-1">
            {skill.installPath}
          </span>
          <button
            onClick={copyPath}
            className="p-1 transition-colors shrink-0"
            style={{ color: 'var(--c-text-faint)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
          >
            {copied ? (
              <Check style={{ width: 14, height: 14, color: 'var(--c-green)' }} />
            ) : (
              <Copy style={{ width: 14, height: 14 }} />
            )}
          </button>
        </div>
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
          {SUPPORTED_TOOLS.map((toolName) => {
            const isEnabled = skill.enabledTools?.includes(toolName)
            const Icon = TOOL_ICONS[toolName]
            return (
              <div
                key={toolName}
                className="flex items-center justify-between px-3 py-2 rounded-lg"
                style={{ background: 'var(--c-bg-input)' }}
              >
                <div className="flex items-center gap-2">
                  {Icon ? (
                    <img src={Icon} alt={toolName} style={{ width: 16, height: 16 }} />
                  ) : (
                    <div
                      className="flex items-center justify-center"
                      style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(15, 23, 42, 0.06)', fontSize: 8, color: 'var(--c-text-faint)' }}
                    >
                      {toolName[0].toUpperCase()}
                    </div>
                  )}
                  <span style={{ fontSize: 11, color: 'var(--c-text-secondary)' }}>{toolName}</span>
                </div>
                <button
                  onClick={() =>
                    isEnabled
                      ? onDisableForTool(skill.id, toolName)
                      : onEnableForTool(skill.id, toolName)
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
