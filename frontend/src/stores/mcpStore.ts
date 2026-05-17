import { create } from 'zustand'
import type { McpServer, McpTool } from '@/types'
import { wailsApi } from '@/services/wailsBridge'
import { toast } from '@/stores/toastStore'

interface McpState {
  servers: McpServer[]
  total: number
  loading: boolean
  error: string | null
  currentServer: McpServer | null
  discoveredTools: McpTool[]
  filter: {
    status: string
    page: number
    pageSize: number
  }
  fetchServers: () => Promise<void>
  setCurrentServer: (server: McpServer | null) => void
  setFilter: (filter: Partial<McpState['filter']>) => void
  addServer: (name: string, command: string, args: string[], env: Record<string, unknown>, description: string) => Promise<boolean>
  updateServer: (id: string, name: string, command: string, args: string[], env: Record<string, unknown>, description: string) => Promise<boolean>
  deleteServer: (id: string) => Promise<boolean>
  enableForTool: (id: string, toolName: string) => Promise<boolean>
  disableForTool: (id: string, toolName: string) => Promise<boolean>
  discoverTools: (id: string) => Promise<void>
}

export const useMcpStore = create<McpState>((set, get) => ({
  servers: [],
  total: 0,
  loading: false,
  error: null,
  currentServer: null,
  discoveredTools: [],
  filter: {
    status: '',
    page: 1,
    pageSize: 50,
  },

  fetchServers: async () => {
    set({ loading: true, error: null })
    const { filter } = get()
    const resp = await wailsApi.listMcpServers(filter.page, filter.pageSize, filter.status)
    if (resp.success && resp.data) {
      set({ servers: resp.data.servers, total: resp.data.total, loading: false })
    } else {
      set({ error: resp.error ?? 'Failed to fetch MCP servers', loading: false })
    }
  },

  setCurrentServer: (server) => set({ currentServer: server }),

  setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),

  addServer: async (name, command, args, env, description) => {
    const resp = await wailsApi.addMcpServer({
      name, command, args, env, description, sourceType: 'manual', sourceUrl: '',
    })
    if (resp.success) {
      toast.success(`MCP server "${name}" added`)
      get().fetchServers()
      return true
    }
    toast.error(resp.error ?? 'Failed to add MCP server')
    set({ error: resp.error })
    return false
  },

  updateServer: async (id, name, command, args, env, description) => {
    const resp = await wailsApi.updateMcpServer(id, {
      name, command, args, env, description, sourceType: 'manual', sourceUrl: '',
    })
    if (resp.success) {
      toast.success(`MCP server "${name}" updated`)
      get().fetchServers()
      return true
    }
    toast.error(resp.error ?? 'Failed to update MCP server')
    set({ error: resp.error })
    return false
  },

  deleteServer: async (id) => {
    const server = get().servers.find((s) => s.id === id)
    set((state) => ({
      servers: state.servers.filter((s) => s.id !== id),
      total: state.total - 1,
    }))
    const resp = await wailsApi.deleteMcpServer(id)
    if (resp.success) {
      toast.success(`MCP server "${server?.name ?? id}" deleted`)
      if (get().currentServer?.id === id) {
        set({ currentServer: null })
      }
      return true
    }
    toast.error(resp.error ?? 'Failed to delete MCP server')
    get().fetchServers()
    set({ error: resp.error })
    return false
  },

  enableForTool: async (id, toolName) => {
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === id ? { ...s, enabledTools: [...s.enabledTools, toolName] } : s
      ),
    }))
    const resp = await wailsApi.enableMcpForTool(id, toolName)
    if (resp.success) {
      toast.success(`MCP synced to ${toolName}`)
      get().fetchServers()
      return true
    }
    toast.error(`Failed to sync to ${toolName}`)
    get().fetchServers()
    return false
  },

  disableForTool: async (id, toolName) => {
    set((state) => ({
      servers: state.servers.map((s) =>
        s.id === id ? { ...s, enabledTools: s.enabledTools.filter((t) => t !== toolName) } : s
      ),
    }))
    const resp = await wailsApi.disableMcpForTool(id, toolName)
    if (resp.success) {
      toast.info(`MCP removed from ${toolName}`)
      get().fetchServers()
      return true
    }
    toast.error(`Failed to remove from ${toolName}`)
    get().fetchServers()
    return false
  },

  discoverTools: async (id) => {
    const resp = await wailsApi.discoverMcpTools(id)
    if (resp.success && resp.data) {
      set({ discoveredTools: resp.data })
      toast.success(`Discovered ${resp.data.length} tools`)
    } else {
      toast.error(resp.error ?? 'Failed to discover tools')
    }
  },
}))
