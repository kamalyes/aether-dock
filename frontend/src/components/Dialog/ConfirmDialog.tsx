import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'
import type { ConfirmDialogProps } from './typings'

const TONE_COLORS: Record<string, { bg: string; color: string }> = {
  danger: { bg: 'var(--c-red-soft)', color: 'var(--c-red)' },
  warning: { bg: 'var(--c-amber-soft)', color: 'var(--c-amber)' },
  default: { bg: 'var(--c-accent-soft)', color: 'var(--c-accent)' },
}

export function ConfirmDialog({ open, title, description, confirmText, confirmLabel, cancelText, cancelLabel, tone, variant, icon, onConfirm, onCancel }: ConfirmDialogProps) {
  const effectiveTone = tone || variant || 'default'
  const c = TONE_COLORS[effectiveTone]
  const confirmBtnText = confirmLabel || confirmText || '确认'
  const cancelBtnText = cancelLabel || cancelText || '取消'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} onClick={onCancel} />
          <motion.div
            className="relative z-10 w-full max-w-sm mx-4"
            style={{ background: 'var(--c-bg)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--c-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 flex items-center justify-center rounded-lg" style={{ width: 36, height: 36, background: c.bg }}>
                  {icon || <AlertTriangle style={{ width: 18, height: 18, color: c.color }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', marginBottom: 4 }}>{title}</h3>
                  {description && <p style={{ fontSize: 12, color: 'var(--c-text-muted)', lineHeight: 1.5 }}>{description}</p>}
                </div>
                <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-faint)', padding: 2 }} type="button">
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-5 py-3" style={{ borderTop: '1px solid var(--c-border)' }}>
              <button
                onClick={onCancel}
                className="rounded-lg px-4 py-1.5 transition-colors"
                style={{ fontSize: 12, fontWeight: 500, background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', color: 'var(--c-text-secondary)', cursor: 'pointer' }}
                type="button"
              >
                {cancelBtnText}
              </button>
              <button
                onClick={onConfirm}
                className="rounded-lg px-4 py-1.5 transition-colors"
                style={{ fontSize: 12, fontWeight: 500, background: c.color, border: 'none', color: '#fff', cursor: 'pointer' }}
                type="button"
              >
                {confirmBtnText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
