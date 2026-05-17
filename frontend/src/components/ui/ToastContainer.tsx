import { useToastStore } from '@/stores/toastStore'
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react'

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
}

const STYLE_MAP = {
  success: 'border-emerald-500/20 bg-emerald-500/[0.06]',
  error: 'border-red-500/20 bg-red-500/[0.06]',
  info: 'border-white/10 bg-white/[0.04]',
  warning: 'border-amber-500/20 bg-amber-500/[0.06]',
}

const ICON_STYLE_MAP = {
  success: 'text-emerald-400',
  error: 'text-red-400',
  info: 'text-white/40',
  warning: 'text-amber-400',
}

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => {
        const Icon = ICON_MAP[toast.type]
        return (
          <div
            key={toast.id}
            className={`flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl border backdrop-blur-sm animate-slide-in ${STYLE_MAP[toast.type]}`}
          >
            <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${ICON_STYLE_MAP[toast.type]}`} />
            <p className="flex-1 text-[11.5px] text-white/70 leading-relaxed">{toast.message}</p>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 p-0.5 rounded text-white/20 hover:text-white/50 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
