import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Download, Trash2, BellDot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { SkillIcon } from '@/components/ui/SkillIcon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { StaggerItem } from '@/components/ui/motion'

interface SkillCardProps {
  skill: Skill
  onClick: (skill: Skill) => void
  onToggleFavorite?: (id: string) => void
  onQuickInstall?: (skill: Skill) => void
  onDelete?: (skill: Skill) => void
  isFavorite?: boolean
  hasUpdate?: boolean
}

const TAG_COLORS = [
  { bg: 'var(--c-green-soft)', text: 'var(--c-green)' },
  { bg: 'var(--c-accent-soft)', text: 'var(--c-accent)' },
  { bg: 'var(--c-violet-soft)', text: 'var(--c-violet)' },
  { bg: 'var(--c-amber-soft)', text: 'var(--c-amber)' },
  { bg: 'var(--c-red-soft)', text: 'var(--c-red)' },
  { bg: 'var(--c-cyan-soft)', text: 'var(--c-cyan)' },
]

function getTagColor(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash) + tag.charCodeAt(i)
    hash = hash & hash
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
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
  const visibleTags = skill.tags?.slice(0, 3) || []

  return (
    <StaggerItem>
      <motion.div
        className="glass-card-hover group relative p-5 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick(skill)}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {hasUpdate && (
          <div
            className="absolute left-4 top-4 z-10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: 'var(--c-amber-soft)', color: 'var(--c-amber)' }}
          >
            <BellDot style={{ width: 12, height: 12 }} className="animate-pulse" />
            {t('skills.updateAvailable', 'Update')}
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
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
          <StatusBadge status={skill.status} size="sm" />
        </div>

        {skill.description && (
          <p style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.5 }} className="line-clamp-2 mb-3">
            {skill.description}
          </p>
        )}

        {visibleTags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {visibleTags.map((tag) => {
              const color = getTagColor(tag)
              return (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{ background: color.bg, color: color.text }}
                >
                  {tag}
                </span>
              )
            })}
            {skill.tags && skill.tags.length > 3 && (
              <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                +{skill.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </motion.div>
    </StaggerItem>
  )
}
