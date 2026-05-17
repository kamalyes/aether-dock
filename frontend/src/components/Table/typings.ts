import type { CSSProperties, ReactNode } from 'react'

export interface Column<T> {
  key: string
  title: string
  width?: string
  render?: (value: any, record: T, index: number) => ReactNode
  sortable?: boolean
}

export interface TableProps<T extends Record<string, any>> {
  columns: Column<T>[]
  data: T[]
  rowKey: string | ((record: T) => string)
  loading?: boolean
  emptyText?: string
  onRowClick?: (record: T) => void
  rowStyle?: (record: T) => CSSProperties
  className?: string
  compact?: boolean
}
