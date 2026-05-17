import { create } from 'zustand'
import type { ToolConfig } from '@/types'
import { wailsApi } from '@/services/wailsBridge'
import { toast } from '@/stores/toastStore'

interface ToolState {
  tools: ToolConfig[]
  loading: boolean
  error: string | null
  fetchTools: () => Promise<void>
  detectTools: () => Promise<void>
  enableTool: (name: string) => Promise<boolean>
  disableTool: (name: string) => Promise<boolean>
}

export const useToolStore = create<ToolState>((set, get) => ({
  tools: [],
  loading: false,
  error: null,

  fetchTools: async () => {
    set({ loading: true })
    const resp = await wailsApi.listTools()
    if (resp.success && resp.data) {
      set({ tools: resp.data, loading: false })
    } else {
      set({ error: resp.error ?? 'Failed to fetch tools', loading: false })
    }
  },

  detectTools: async () => {
    set({ loading: true })
    const resp = await wailsApi.detectTools()
    if (resp.success && resp.data) {
      set({ tools: resp.data, loading: false })
      toast.success(`Detected ${resp.data.filter((t) => t.isDetected).length} tools`)
    } else {
      set({ loading: false })
      toast.error(resp.error ?? 'Detection failed')
    }
    get().fetchTools()
  },

  enableTool: async (name) => {
    set((state) => ({
      tools: state.tools.map((t) =>
        t.toolName === name ? { ...t, isEnabled: true } : t
      ),
    }))
    const resp = await wailsApi.enableTool(name)
    if (resp.success) {
      toast.success(`${name} enabled`)
      return true
    }
    toast.error(`Failed to enable ${name}`)
    get().fetchTools()
    return false
  },

  disableTool: async (name) => {
    set((state) => ({
      tools: state.tools.map((t) =>
        t.toolName === name ? { ...t, isEnabled: false } : t
      ),
    }))
    const resp = await wailsApi.disableTool(name)
    if (resp.success) {
      toast.info(`${name} disabled`)
      return true
    }
    toast.error(`Failed to disable ${name}`)
    get().fetchTools()
    return false
  },
}))
