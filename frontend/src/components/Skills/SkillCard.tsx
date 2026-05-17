import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Download, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { TagList } from '@/components/Field'
import { SkillIcon } from './SkillIcon'
import { SkillStatusBadge } from './SkillStatusBadge'
import { StaggerItem } from '@/components/Motion'
import SkillDiffModal from './SkillDiffModal'
import { useSkillStore } from '@/stores/skillStore'

interface SkillCardProps {
  skill: Skill
  onClick: (skill: Skill) => void
  onToggleFavorite?: (id: string) => void
  onQuickInstall?: (skill: Skill) => void
  onDelete?: (skill: Skill) => void
  isFavorite?: boolean
  hasUpdate?: boolean
}

export function SkillCard({
  skill,
  onClick,
  onToggleFavorite,
  onQuickInstall,
  onDelete,
  isFavorite,
  hasUpdate,
}: SkillCardProps) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)
  const [diffOpen, setDiffOpen] = useState(false)
  const versionDiffs = useSkillStore((s) => s.versionDiffs)
  const diffInfo = versionDiffs[skill.id]
  const showUpdate = hasUpdate || diffInfo?.hasUpdate

  return (
    <StaggerItem>
      <motion.div
        className="glass-card-hover group relative cursor-pointer overflow-hidden"
        style={{ padding: 14, height: 150 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick(skill)}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {showUpdate && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setDiffOpen(true)
            }}
            className="absolute top-0 right-0 z-10"
            style={{ width: 0, height: 0, borderStyle: 'solid', borderWidth: '0 28px 28px 0', borderColor: 'transparent var(--c-amber) transparent transparent', cursor: 'pointer' }}
            title={t('skills.viewDiff', 'View version diff')}
          >
            <span
              className="absolute flex items-center justify-center"
              style={{ top: 2, right: -25, width: 18, height: 18 }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="18 15 12 9 6 15" />
              </svg>
            </span>
          </button>
        )}

        <div className="flex items-start justify-between mb-2.5">
          <SkillIcon
            iconUrl={skill.metadata?.iconUrl as string}
            iconEmoji={skill.metadata?.iconEmoji as string}
            iconBackground={skill.metadata?.iconBackground as string}
            name={skill.name}
            size="lg"
            className="transition-transform group-hover:scale-110"
          />
          <div
            className={`flex gap-1 transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {onQuickInstall && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickInstall(skill)
                }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--c-text-faint)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-green)'; e.currentTarget.style.background = 'var(--c-green-soft)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)'; e.currentTarget.style.background = 'transparent' }}
                title={t('skills.quickInstall', 'Quick Install')}
              >
                <Download style={{ width: 14, height: 14 }} />
              </button>
            )}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFavorite(skill.id)
                }}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: isFavorite ? 'var(--c-amber)' : 'var(--c-text-faint)' }}
                onMouseEnter={(e) => { if (!isFavorite) { e.currentTarget.style.color = 'var(--c-amber)'; e.currentTarget.style.background = 'var(--c-amber-soft)' } }}
                onMouseLeave={(e) => { if (!isFavorite) { e.currentTarget.style.color = 'var(--c-text-faint)'; e.currentTarget.style.background = 'transparent' } }}
                title={t('skills.favorite', 'Favorite')}
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
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--c-text-faint)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-red)'; e.currentTarget.style.background = 'var(--c-red-soft)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)'; e.currentTarget.style.background = 'transparent' }}
                title={t('skills.delete', 'Delete')}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1.5">
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }} className="truncate flex-1">
            {skill.name}
          </h3>
          <SkillStatusBadge status={skill.status} size="sm" />
        </div>

        <p style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.45 }} className="line-clamp-2 mb-3">
          {skill.description || ' '}
        </p>

        <div className="absolute bottom-3.5 left-3.5 right-3.5">
          <TagList tags={skill.tags || []} max={3} appearance="color" />
        </div>
      </motion.div>
      <SkillDiffModal
        skillId={skill.id}
        skillName={skill.name}
        open={diffOpen}
        onClose={() => setDiffOpen(false)}
      />
    </StaggerItem>
  )
}
