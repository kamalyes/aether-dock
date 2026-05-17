import { useState } from 'react'
import { Zap } from 'lucide-react'
import type { IconAvatarProps } from './typings'

const GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #5ee7df 0%, #b490ca 100%)',
]

function getGradient(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i)
    hash = hash & hash
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

export function IconAvatar({ iconUrl, iconEmoji, iconBackground, name, size = 'md', className = '', style, fallbackIcon }: IconAvatarProps) {
  const [imgError, setImgError] = useState(false)

  const sizeMap = {
    sm: { container: 28, icon: 13, emoji: 14, letter: 11 },
    md: { container: 36, icon: 16, emoji: 18, letter: 13 },
    lg: { container: 56, icon: 24, emoji: 26, letter: 20 },
  }

  const s = sizeMap[size]
  const gradient = iconBackground || getGradient(name)
  const firstLetter = name.charAt(0).toUpperCase()

  const containerStyle: React.CSSProperties = {
    width: s.container,
    height: s.container,
    borderRadius: size === 'lg' ? 12 : size === 'md' ? 10 : 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: gradient,
    flexShrink: 0,
    position: 'relative' as const,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    ...style,
  }

  if (iconUrl && !imgError) {
    return (
      <div style={containerStyle} className={className}>
        <img src={iconUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} onError={() => setImgError(true)} />
      </div>
    )
  }

  if (iconEmoji) {
    return (
      <div style={containerStyle} className={className}>
        <span style={{ fontSize: s.emoji, lineHeight: 1 }}>{iconEmoji}</span>
      </div>
    )
  }

  if (/^[a-zA-Z]/.test(name)) {
    return (
      <div style={containerStyle} className={className}>
        <span style={{ fontSize: s.letter, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.15)', lineHeight: 1 }}>{firstLetter}</span>
      </div>
    )
  }

  return (
    <div style={containerStyle} className={className}>
      {fallbackIcon || <Zap style={{ width: s.icon, height: s.icon, color: '#fff', opacity: 0.9 }} />}
    </div>
  )
}
