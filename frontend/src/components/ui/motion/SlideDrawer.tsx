import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface SlideDrawerProps {
  children: ReactNode
  isOpen: boolean
  onClose: () => void
  title?: string
  width?: string
}

export function SlideDrawer({
  children,
  isOpen,
  onClose,
  title,
  width = '420px',
}: SlideDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-40 backdrop-blur-sm"
            style={{ background: 'rgba(15, 23, 42, 0.15)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width,
              background: 'var(--c-bg-panel)',
              borderLeft: '1px solid var(--c-border)',
              boxShadow: '-8px 0 30px rgba(15, 23, 42, 0.08)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            {title && (
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--c-border)' }}
              >
                <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{title}</h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--c-text-faint)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)'; e.currentTarget.style.background = 'transparent' }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
