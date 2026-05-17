import React, { useEffect } from 'react'

let styleInjected = false

function injectKeyframes() {
  if (styleInjected || typeof document === 'undefined') return
  const id = 'aether-loading-keyframes'
  if (document.getElementById(id)) { styleInjected = true; return }
  const style = document.createElement('style')
  style.id = id
  style.textContent = `
@keyframes aether-shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes aether-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
`
  document.head.appendChild(style)
  styleInjected = true
}

function useKeyframes() {
  useEffect(() => { injectKeyframes() }, [])
}

interface SkeletonProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: React.CSSProperties
  className?: string
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 6, style, className }: SkeletonProps) {
  useKeyframes()
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, rgba(15,23,42,0.04) 25%, rgba(15,23,42,0.08) 50%, rgba(15,23,42,0.04) 75%)',
        backgroundSize: '200% 100%',
        animation: 'aether-shimmer 1.5s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

export function SkeletonCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton width={36} height={36} borderRadius={8} />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" height={12} />
          <Skeleton width="40%" height={10} />
        </div>
      </div>
      {Array.from({ length: rows - 1 }).map((_, i) => (
        <Skeleton key={i} width={`${80 - i * 15}%`} height={10} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card flex items-center gap-3 px-4 py-3">
          <Skeleton width={28} height={28} borderRadius={6} />
          <div className="flex-1 space-y-1.5">
            <Skeleton width={`${70 - i * 5}%`} height={11} />
            <Skeleton width={`${45 - i * 3}%`} height={9} />
          </div>
          <Skeleton width={60} height={24} borderRadius={6} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton width={24} height={24} borderRadius={6} />
            <Skeleton width={28} height={28} borderRadius={14} />
          </div>
          <Skeleton width="50%" height={20} />
          <Skeleton width="70%" height={10} />
        </div>
      ))}
    </div>
  )
}

type LoadingMode = 'spinner' | 'skeleton'

interface LoadingProps {
  mode?: LoadingMode
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  tip?: string
  size?: number
}

export function Spinner({ size = 20, style }: { size?: number; style?: React.CSSProperties }) {
  useKeyframes()
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid var(--c-border)`,
        borderTopColor: 'var(--c-accent)',
        borderRadius: '50%',
        animation: 'aether-spin 0.6s linear infinite',
        ...style,
      }}
    />
  )
}

export function Loading({ mode = 'spinner', children, className, style, tip, size = 20 }: LoadingProps) {
  if (mode === 'skeleton' && children) {
    return <div className={className} style={style}>{children}</div>
  }

  if (mode === 'skeleton') {
    return (
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 8, ...style }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="80%" height={10} />
        <Skeleton width="45%" height={10} />
      </div>
    )
  }

  return (
    <div className={className} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 32, ...style }}>
      <Spinner size={size} />
      {tip && <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>{tip}</span>}
    </div>
  )
}

interface PageLoadingProps {
  mode?: LoadingMode
}

export function PageLoading({ mode = 'skeleton' }: PageLoadingProps) {
  if (mode === 'skeleton') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
          <Skeleton width={140} height={20} />
          <SkeletonStats count={4} />
          <div className="grid grid-cols-2 gap-4">
            <SkeletonCard rows={4} />
            <SkeletonCard rows={4} />
          </div>
          <SkeletonList count={4} />
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex items-center justify-center">
      <Loading mode="spinner" tip="Loading..." />
    </div>
  )
}

interface ListLoadingProps {
  mode?: LoadingMode
  count?: number
}

export function ListLoading({ mode = 'skeleton', count = 5 }: ListLoadingProps) {
  if (mode === 'skeleton') {
    return <SkeletonList count={count} />
  }
  return <Loading mode="spinner" tip="Loading..." />
}

interface CardLoadingProps {
  mode?: LoadingMode
  count?: number
  rows?: number
}

export function CardLoading({ mode = 'skeleton', count = 4, rows = 2 }: CardLoadingProps) {
  if (mode === 'skeleton') {
    return (
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} rows={rows} />
        ))}
      </div>
    )
  }
  return <Loading mode="spinner" tip="Loading..." />
}
