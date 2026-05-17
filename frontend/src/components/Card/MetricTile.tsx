import type { MetricTileProps } from './typings'

const TONE_MAP: Record<string, { value: string; bg: string }> = {
  accent: { value: 'var(--c-accent)', bg: 'var(--c-accent-soft)' },
  green:  { value: 'var(--c-green)',  bg: 'var(--c-green-soft)' },
  amber:  { value: 'var(--c-amber)',  bg: 'var(--c-amber-soft)' },
  red:    { value: 'var(--c-red)',    bg: 'var(--c-red-soft)' },
  violet: { value: 'var(--c-violet)', bg: 'var(--c-violet-soft)' },
  cyan:   { value: 'var(--c-cyan)',   bg: 'var(--c-cyan-soft)' },
  muted:  { value: 'var(--c-text)',   bg: 'var(--c-bg-input)' },
}

export function MetricTile({ label, value, icon, tone = 'muted', surface = 'flat' }: MetricTileProps) {
  const c = TONE_MAP[tone]

  return (
    <div className={surface === 'card' ? 'glass-card p-4' : 'flex flex-col items-center gap-1'} style={surface === 'flat' ? { padding: '8px 12px' } : undefined}>
      {icon && <div style={{ color: c.value, marginBottom: surface === 'card' ? 8 : 4 }}>{icon}</div>}
      <div style={{ fontSize: surface === 'card' ? 20 : 16, fontWeight: 700, color: c.value, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: 'var(--c-text-muted)', fontWeight: 500, marginTop: 2 }}>{label}</div>
    </div>
  )
}
