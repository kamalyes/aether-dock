import { Skeleton } from '../Loading/Skeleton'
import type { TableProps, Column } from './typings'

export function Table<T extends Record<string, any>>({
  columns, data, rowKey, loading, emptyText = 'No data', onRowClick, rowStyle, className = '', compact = false,
}: TableProps<T>) {
  const getKey = typeof rowKey === 'function' ? rowKey : (record: T) => record[rowKey]
  const py = compact ? '6px 12px' : '10px 16px'
  const fontSize = compact ? 11 : 12

  if (loading) {
    return (
      <div className="glass-card overflow-hidden">
        <div style={{ borderBottom: '1px solid var(--c-border)' }}>
          <div className="flex" style={{ padding: py }}>
            {columns.map((col) => (
              <div key={col.key} style={{ width: col.width || `${100 / columns.length}%`, flex: col.width ? undefined : 1 }}>
                <Skeleton width="60%" height={10} />
              </div>
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex" style={{ padding: py, borderBottom: i < 4 ? '1px solid var(--c-border)' : 'none' }}>
            {columns.map((col) => (
              <div key={col.key} style={{ width: col.width || `${100 / columns.length}%`, flex: col.width ? undefined : 1 }}>
                <Skeleton width={`${70 - i * 8}%`} height={10} />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`glass-card overflow-hidden ${className}`}>
      <div style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div className="flex" style={{ padding: py }}>
          {columns.map((col) => (
            <div key={col.key} style={{ width: col.width || `${100 / columns.length}%`, flex: col.width ? undefined : 1, fontSize, fontWeight: 600, color: 'var(--c-text-muted)' }}>
              {col.title}
            </div>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <div className="flex items-center justify-center" style={{ padding: '32px 16px', color: 'var(--c-text-faint)', fontSize: 12 }}>
          {emptyText}
        </div>
      ) : (
        data.map((record, i) => (
          <div
            key={getKey(record)}
            className="flex transition-colors"
            style={{
              padding: py,
              borderBottom: i < data.length - 1 ? '1px solid var(--c-border)' : 'none',
              cursor: onRowClick ? 'pointer' : 'default',
              ...rowStyle?.(record),
            }}
            onClick={() => onRowClick?.(record)}
            onMouseEnter={(e) => { if (onRowClick) e.currentTarget.style.background = 'var(--c-bg-hover)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
          >
            {columns.map((col) => (
              <div key={col.key} style={{ width: col.width || `${100 / columns.length}%`, flex: col.width ? undefined : 1, fontSize, color: 'var(--c-text-secondary)' }}>
                {col.render ? col.render(record[col.key], record, i) : String(record[col.key] ?? '')}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
