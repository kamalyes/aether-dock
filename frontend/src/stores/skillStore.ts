import { create } from 'zustand'
import type { Skill, SkillSource, SkillViewMode, SortField, SortOrder } from '@/types'
import { wailsApi } from '@/services/wailsBridge'
import { toast } from '@/stores/toastStore'

interface SkillState {
  skills: Skill[]
  total: number
  loading: boolean
  error: string | null
  currentSkill: Skill | null
  sources: SkillSource[]
  filter: {
    status: string
    sourceId: string
    page: number
    pageSize: number
  }
  viewMode: SkillViewMode
  sortField: SortField
  sortOrder: SortOrder
  searchQuery: string
  selectedSkillIds: Set<string>
  favorites: Set<string>
  fetchSkills: () => Promise<void>
  fetchSources: () => Promise<void>
  setCurrentSkill: (skill: Skill | null) => void
  setFilter: (filter: Partial<SkillState['filter']>) => void
  setViewMode: (mode: SkillViewMode) => void
  setSortField: (field: SortField) => void
  setSortOrder: (order: SortOrder) => void
  setSearchQuery: (query: string) => void
  toggleSkillSelection: (id: string) => void
  selectAllVisible: (ids: string[]) => void
  clearSelection: () => void
  toggleFavorite: (id: string) => void
  installFromGit: (url: string, branch: string, name: string, sourceName: string) => Promise<boolean>
  installFromLocal: (localPath: string, name: string, sourceName: string) => Promise<boolean>
  deleteSkill: (id: string) => Promise<boolean>
  enableForTool: (id: string, toolName: string) => Promise<boolean>
  disableForTool: (id: string, toolName: string) => Promise<boolean>
  batchEnableForTool: (ids: string[], toolName: string) => Promise<void>
  batchDelete: (ids: string[]) => Promise<void>
  pullSkill: (installPath: string) => Promise<boolean>
}

export const useSkillStore = create<SkillState>((set, get) => ({
  skills: [],
  total: 0,
  loading: false,
  error: null,
  currentSkill: null,
  sources: [],
  filter: {
    status: '',
    sourceId: '',
    page: 1,
    pageSize: 50,
  },
  viewMode: 'gallery',
  sortField: 'updatedAt',
  sortOrder: 'desc',
  searchQuery: '',
  selectedSkillIds: new Set(),
  favorites: new Set(),

  fetchSkills: async () => {
    set({ loading: true, error: null })
    const { filter } = get()
    const resp = await wailsApi.listSkills(filter.page, filter.pageSize, filter.status, filter.sourceId)
    if (resp.success && resp.data) {
      set({ skills: resp.data.skills, total: resp.data.total, loading: false })
    } else {
      set({ error: resp.error ?? 'Failed to fetch skills', loading: false })
    }
  },

  fetchSources: async () => {
    const resp = await wailsApi.listSources()
    if (resp.success && resp.data) {
      set({ sources: resp.data })
    }
  },

  setCurrentSkill: (skill) => set({ currentSkill: skill }),

  setFilter: (filter) => set({ filter: { ...get().filter, ...filter } }),

  setViewMode: (mode) => set({ viewMode: mode }),

  setSortField: (field) => set({ sortField: field }),

  setSortOrder: (order) => set({ sortOrder: order }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleSkillSelection: (id) => {
    set((state) => {
      const next = new Set(state.selectedSkillIds)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { selectedSkillIds: next }
    })
  },

  selectAllVisible: (ids) => set({ selectedSkillIds: new Set(ids) }),

  clearSelection: () => set({ selectedSkillIds: new Set() }),

  toggleFavorite: (id) => {
    set((state) => {
      const next = new Set(state.favorites)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { favorites: next }
    })
  },

  installFromGit: async (url, branch, name, sourceName) => {
    const resp = await wailsApi.installSkillFromGit({ url, branch, name, sourceName })
    if (resp.success) {
      toast.success(`Skill "${name || url}" installed from Git`)
      get().fetchSkills()
      return true
    }
    toast.error(resp.error ?? 'Failed to install from Git')
    set({ error: resp.error })
    return false
  },

  installFromLocal: async (localPath, name, sourceName) => {
    const resp = await wailsApi.installSkillFromLocal({ localPath, name, sourceName })
    if (resp.success) {
      toast.success(`Skill "${name || localPath}" imported`)
      get().fetchSkills()
      return true
    }
    toast.error(resp.error ?? 'Failed to import from local')
    set({ error: resp.error })
    return false
  },

  deleteSkill: async (id) => {
    const skill = get().skills.find((s) => s.id === id)
    set((state) => ({
      skills: state.skills.filter((s) => s.id !== id),
      total: state.total - 1,
    }))
    const resp = await wailsApi.deleteSkill(id)
    if (resp.success) {
      toast.success(`Skill "${skill?.name ?? id}" deleted`)
      if (get().currentSkill?.id === id) {
        set({ currentSkill: null })
      }
      return true
    }
    toast.error(resp.error ?? 'Failed to delete skill')
    get().fetchSkills()
    set({ error: resp.error })
    return false
  },

  enableForTool: async (id, toolName) => {
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, enabledTools: [...s.enabledTools, toolName] } : s
      ),
    }))
    const resp = await wailsApi.enableSkillForTool(id, toolName)
    if (resp.success) {
      toast.success(`Synced to ${toolName}`)
      return true
    }
    toast.error(`Failed to sync to ${toolName}`)
    get().fetchSkills()
    return false
  },

  disableForTool: async (id, toolName) => {
    set((state) => ({
      skills: state.skills.map((s) =>
        s.id === id ? { ...s, enabledTools: s.enabledTools.filter((t) => t !== toolName) } : s
      ),
    }))
    const resp = await wailsApi.disableSkillForTool(id, toolName)
    if (resp.success) {
      toast.info(`Removed from ${toolName}`)
      return true
    }
    toast.error(`Failed to remove from ${toolName}`)
    get().fetchSkills()
    return false
  },

  batchEnableForTool: async (ids, toolName) => {
    for (const id of ids) {
      await get().enableForTool(id, toolName)
    }
    get().clearSelection()
  },

  batchDelete: async (ids) => {
    for (const id of ids) {
      await get().deleteSkill(id)
    }
    get().clearSelection()
  },

  pullSkill: async (installPath) => {
    const resp = await wailsApi.gitPull(installPath)
    if (resp.success) {
      toast.success('Pull successful')
      get().fetchSkills()
      return true
    }
    toast.error(resp.error ?? 'Pull failed')
    return false
  },
}))
