import type { TagListProps } from './typings'

const TAG_COLORS = [
  { bg: 'var(--c-accent-soft)', color: 'var(--c-accent)' },
  { bg: 'var(--c-green-soft)', color: 'var(--c-green)' },
  { bg: 'var(--c-amber-soft)', color: 'var(--c-amber)' },
  { bg: 'var(--c-violet-soft)', color: 'var(--c-violet)' },
  { bg: 'var(--c-cyan-soft)', color: 'var(--c-cyan)' },
]

function getTagColor(tag: string) {
  let hash = 0
  for (let i = 0; i < tag.length; i++) {
    hash = ((hash << 5) - hash) + tag.charCodeAt(i)
    hash = hash & hash
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}

export function TagList({ tags, max, size = 'sm', appearance = 'default' }: TagListProps) {
  const displayTags = max ? tags.slice(0, max) : tags
  const remaining = max ? tags.length - max : 0

  const sizeMap = {
    xs: { fontSize: 9, px: 5, py: 1, gap: 3 },
    sm: { fontSize: 10, px: 6, py: 2, gap: 4 },
    md: { fontSize: 11, px: 8, py: 2, gap: 4 },
  }

  const s = sizeMap[size]

  return (
    <div className="flex flex-wrap items-center" style={{ gap: s.gap }}>
      {displayTags.map((tag) => {
        const c = appearance === 'color' ? getTagColor(tag) : { bg: 'var(--c-bg-input)', color: 'var(--c-text-muted)' }
        return (
          <span key={tag} className="rounded-full font-medium" style={{ fontSize: s.fontSize, paddingLeft: s.px, paddingRight: s.px, paddingTop: s.py, paddingBottom: s.py, background: c.bg, color: c.color }}>
            {tag}
          </span>
        )
      })}
      {remaining > 0 && <span style={{ fontSize: s.fontSize, color: 'var(--c-text-faint)' }}>+{remaining}</span>}
    </div>
  )
}
