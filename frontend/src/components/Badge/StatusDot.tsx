import type { StatusDotProps } from './typings'

const TONE_MAP: Record<string, string> = {
  green: 'var(--c-green)',
  amber: 'var(--c-amber)',
  red: 'var(--c-red)',
  cyan: 'var(--c-cyan)',
  muted: 'var(--c-text-faint)',
}

export function StatusDot({ tone, size = 7 }: StatusDotProps) {
  return (
    <span
      className="inline-block rounded-full"
      style={{ width: size, height: size, background: TONE_MAP[tone] || TONE_MAP.muted, flexShrink: 0 }}
    />
  )
}
