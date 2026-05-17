import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { TagList } from '@/components/Field'
import { SkillStatusBadge } from './SkillStatusBadge'
import { SkillIcon } from './SkillIcon'
import { FolderOpen, Clock, Star, Trash2 } from 'lucide-react'

interface SkillListItemProps {
  skill: Skill
  onClick: (skill: Skill) => void
  onToggleFavorite?: (id: string) => void
  onDelete?: (skill: Skill) => void
  isFavorite?: boolean
}

export function SkillListItem({
  skill,
  onClick,
  onToggleFavorite,
  onDelete,
  isFavorite,
}: SkillListItemProps) {
  const { t } = useTranslation()

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
      style={{ borderBottom: '1px solid var(--c-border)' }}
      onClick={() => onClick(skill)}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-card-hover)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
    >
      <SkillIcon
        iconUrl={skill.metadata?.iconUrl as string}
        iconEmoji={skill.metadata?.iconEmoji as string}
        iconBackground={skill.metadata?.iconBackground as string}
        name={skill.name}
        size="sm"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-text)' }} className="truncate">
            {skill.name}
          </span>
          <SkillStatusBadge status={skill.status} size="sm" />
        </div>
        {skill.description && (
          <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }} className="truncate">
            {skill.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <TagList tags={skill.tags || []} max={2} size="xs" />

        <div className="flex items-center gap-1.5" style={{ color: 'var(--c-text-faint)' }}>
          <FolderOpen style={{ width: 12, height: 12 }} />
          <span style={{ fontSize: 10 }} className="truncate max-w-[120px]" title={skill.installPath}>
            {skill.installPath.split(/[/\\]/).pop()}
          </span>
        </div>

        <div className="flex items-center gap-1.5" style={{ color: 'var(--c-text-faint)' }}>
          <Clock style={{ width: 12, height: 12 }} />
          <span style={{ fontSize: 10 }}>
            {new Date(skill.updatedAt).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleFavorite(skill.id)
              }}
              className="p-1 rounded transition-colors"
              style={{ color: isFavorite ? 'var(--c-amber)' : 'var(--c-text-faint)' }}
              onMouseEnter={(e) => { if (!isFavorite) e.currentTarget.style.color = 'var(--c-amber)' }}
              onMouseLeave={(e) => { if (!isFavorite) e.currentTarget.style.color = 'var(--c-text-faint)' }}
            >
              <Star style={{ width: 14, height: 14 }} className={isFavorite ? 'fill-current' : ''} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(skill)
              }}
              className="p-1 rounded transition-colors"
              style={{ color: 'var(--c-text-faint)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-red)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
            >
              <Trash2 style={{ width: 14, height: 14 }} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
