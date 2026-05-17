export interface StatusBadgeProps {
  status?: string
  label?: string
  tone?: 'green' | 'amber' | 'red' | 'cyan' | 'muted'
  size?: 'sm' | 'md'
}

export interface StatusDotProps {
  tone: 'green' | 'amber' | 'red' | 'cyan' | 'muted'
  size?: number
}
