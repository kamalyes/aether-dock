import type { PageHeaderProps } from './typings'

export function PageHeader({ title, subtitle, icon, actions, controls, meta }: PageHeaderProps) {
  return (
    <div className="mb-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          {icon && <div style={{ color: 'var(--c-accent)' }}>{icon}</div>}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 style={{ fontSize: 18, fontWeight: 750, color: 'var(--c-text)', lineHeight: 1.2 }}>{title}</h1>
              {meta}
            </div>
            {subtitle && <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 2 }}>{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
      {controls && <div className="mt-3 flex flex-wrap items-center gap-2">{controls}</div>}
    </div>
  )
}
