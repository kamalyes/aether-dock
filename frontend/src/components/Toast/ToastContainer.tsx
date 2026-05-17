import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { useToastStore, type Toast } from '@/stores/toastStore'

const TOAST_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  success: { icon: <CheckCircle style={{ width: 16, height: 16 }} />, color: 'var(--c-green)' },
  error:   { icon: <XCircle style={{ width: 16, height: 16 }} />,   color: 'var(--c-red)' },
  info:    { icon: <Info style={{ width: 16, height: 16 }} />,       color: 'var(--c-accent)' },
  warning: { icon: <AlertTriangle style={{ width: 16, height: 16 }} />, color: 'var(--c-amber)' },
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const config = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      className="flex items-center gap-2.5 px-4 py-3 rounded-lg min-w-[280px] max-w-[400px]"
      style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
    >
      <div className="shrink-0" style={{ color: config.color }}>{config.icon}</div>
      <span className="flex-1" style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>{toast.message}</span>
      <button onClick={() => onDismiss(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-faint)', padding: 2 }} type="button">
        <X style={{ width: 14, height: 14 }} />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const removeToast = useToastStore((s) => s.removeToast)

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  )
}
