import type { SpinnerProps } from './typings'

export function Spinner({ size = 20, color = 'var(--c-accent)', className }: SpinnerProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'aether-spin 0.8s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" stroke="var(--c-border)" strokeWidth="2.5" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  )
}
