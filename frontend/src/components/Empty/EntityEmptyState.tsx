import { Inbox } from 'lucide-react'
import type { EntityEmptyStateProps } from './typings'

export function EntityEmptyState({ icon, title, description, action }: EntityEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ padding: '40px 16px', textAlign: 'center' }}>
      <div style={{ color: 'var(--c-text-faint)', marginBottom: 12, opacity: 0.6 }}>
        {icon || <Inbox style={{ width: 40, height: 40 }} />}
      </div>
      <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-muted)', marginBottom: 4 }}>{title}</h3>
      {description && <p style={{ fontSize: 11, color: 'var(--c-text-faint)', maxWidth: 280, lineHeight: 1.5 }}>{description}</p>}
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}
