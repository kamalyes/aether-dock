import type { ReactNode } from 'react'

export interface ToggleGridItem {
  id: string
  label: string
  icon?: string | ReactNode
  enabled: boolean
}

export interface ToggleGridProps {
  columns?: number
  stopPropagation?: boolean
  items: ToggleGridItem[]
  onToggle: (id: string, enabled: boolean) => void
}

export interface SwitchProps {
  checked: boolean
  onClick: () => void
  disabled?: boolean
  size?: 'sm' | 'md'
}

export interface ViewToggleProps {
  value: string
  options: { value: string; label: string; icon?: ReactNode }[]
  onChange: (value: string) => void
  style?: React.CSSProperties
}

export interface SortDropdownProps {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  style?: React.CSSProperties
}

export interface ColumnDef {
  key: string
  label: string
  disabled?: boolean
}

export interface ColumnVisibilityProps {
  columns: ColumnDef[]
  visible: Set<string>
  onChange: (visible: Set<string>) => void
  icon?: ReactNode
}
