import { Zap } from 'lucide-react'
import type { CSSProperties } from 'react'
import { IconAvatar } from '@/components/Avatar'

interface SkillIconProps {
  iconUrl?: string
  iconEmoji?: string
  iconBackground?: string
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  style?: CSSProperties
}

export function SkillIcon({
  iconUrl,
  iconEmoji,
  iconBackground,
  name,
  size = 'md',
  className = '',
  style,
}: SkillIconProps) {
  return (
    <IconAvatar
      iconUrl={iconUrl}
      iconEmoji={iconEmoji}
      iconBackground={iconBackground}
      name={name}
      size={size}
      className={className}
      style={style}
      fallbackIcon={<Zap style={{ width: '55%', height: '55%', color: '#fff', opacity: 0.9 }} />}
    />
  )
}
