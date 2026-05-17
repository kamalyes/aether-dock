import React from 'react'
import { Skeleton } from './Loading'

interface Column<T> {
  key: string
  title: string
  width?: number | string
  render?: (value: any, record: T, index: number) => React.ReactNode
  align?: 'left' | 'center' | 'right'
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  rowKey: string | ((record: T) => string)
  loading?: boolean
  emptyText?: string
  onRowClick?: (record: T) => void
  rowStyle?: (record: T) => React.CSSProperties
  className?: string
  compact?: boolean
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  loading,
  emptyText = 'No data',
  onRowClick,
  rowStyle,
  className,
  compact = false,
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
    <div className={`glass-card overflow-hidden ${className || ''}`}>
      <div style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div className="flex" style={{ padding: py, background: 'rgba(15, 23, 42, 0.02)' }}>
          {columns.map((col) => (
            <div
              key={col.key}
              style={{
                width: col.width || undefined,
                flex: col.width ? undefined : 1,
                fontSize: 10,
                fontWeight: 600,
                color: 'var(--c-text-faint)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                textAlign: col.align || 'left',
              }}
            >
              {col.title}
            </div>
          ))}
        </div>
      </div>
      {data.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--c-text-faint)', fontSize: 12 }}>{emptyText}</p>
        </div>
      ) : (
        data.map((record, idx) => (
          <div
            key={getKey(record)}
            className="flex transition-colors"
            style={{
              padding: py,
              borderBottom: idx < data.length - 1 ? '1px solid var(--c-border)' : 'none',
              cursor: onRowClick ? 'pointer' : undefined,
              ...rowStyle?.(record),
            }}
            onClick={() => onRowClick?.(record)}
            onMouseEnter={(e) => {
              if (onRowClick) e.currentTarget.style.background = 'var(--c-bg-card-hover)'
            }}
            onMouseLeave={(e) => {
              if (onRowClick) e.currentTarget.style.background = ''
            }}
          >
            {columns.map((col) => (
              <div
                key={col.key}
                style={{
                  width: col.width || undefined,
                  flex: col.width ? undefined : 1,
                  fontSize,
                  color: 'var(--c-text-secondary)',
                  textAlign: col.align || 'left',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {col.render ? col.render(record[col.key], record, idx) : record[col.key]}
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  )
}
