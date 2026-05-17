import { create } from 'zustand'
import type { Skill, SkillSource, SkillViewMode, SortField, SortOrder, SkillVersionDiff } from '@/types'
import { wailsApi } from '@/services/wailsBridge'
import { toast } from '@/stores/toastStore'

interface InstallLogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'success'
  message: string
}

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
  installStatus: 'idle' | 'installing' | 'success' | 'error'
  installLog: InstallLogEntry[]
  versionDiffs: Record<string, SkillVersionDiff>
  updateChecking: boolean
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
  addInstallLog: (level: InstallLogEntry['level'], message: string) => void
  clearInstallLog: () => void
  installFromGit: (url: string, branch: string, name: string, sourceName: string) => Promise<boolean>
  installFromLocal: (localPath: string, name: string, sourceName: string) => Promise<boolean>
  deleteSkill: (id: string) => Promise<boolean>
  enableForTool: (id: string, toolName: string) => Promise<boolean>
  disableForTool: (id: string, toolName: string) => Promise<boolean>
  batchEnableForTool: (ids: string[], toolName: string) => Promise<void>
  batchDelete: (ids: string[]) => Promise<void>
  pullSkill: (installPath: string) => Promise<boolean>
  checkSkillUpdate: (skillId: string) => Promise<SkillVersionDiff | null>
  checkAllUpdates: () => Promise<void>
  getSkillVersionDiff: (skillId: string) => Promise<SkillVersionDiff | null>
  updateSkill: (skillId: string) => Promise<boolean>
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
  installStatus: 'idle',
  installLog: [],
  versionDiffs: {},
  updateChecking: false,

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

  addInstallLog: (level, message) => {
    set((state) => ({
      installLog: [...state.installLog, { timestamp: new Date().toISOString(), level, message }],
    }))
  },

  clearInstallLog: () => set({ installLog: [], installStatus: 'idle' }),

  installFromGit: async (url, branch, name, sourceName) => {
    const existing = get().skills.find(
      (s) => s.gitUrl === url && s.gitBranch === branch
    )
    if (existing) {
      toast.warning(`Skill "${existing.name}" is already installed from this URL and branch`)
      return false
    }
    set({ installStatus: 'installing' })
    get().addInstallLog('info', `Cloning from ${url} (branch: ${branch})`)
    const resp = await wailsApi.installSkillFromGit({ url, branch, name, sourceName })
    if (resp.success) {
      set({ installStatus: 'success' })
      get().addInstallLog('success', `Skill "${name || url}" installed successfully`)
      toast.success(`Skill "${name || url}" installed from Git`)
      get().fetchSkills()
      get().fetchSources()
      return true
    }
    set({ installStatus: 'error', error: resp.error })
    get().addInstallLog('error', resp.error ?? 'Failed to install from Git')
    toast.error(resp.error ?? 'Failed to install from Git')
    return false
  },

  installFromLocal: async (localPath, name, sourceName) => {
    const existing = get().skills.find(
      (s) => s.name === name || s.installPath === localPath
    )
    if (existing) {
      toast.warning(`Skill "${existing.name}" already exists with the same name or path`)
      return false
    }
    set({ installStatus: 'installing' })
    get().addInstallLog('info', `Importing from ${localPath}`)
    const resp = await wailsApi.installSkillFromLocal({ localPath, name, sourceName })
    if (resp.success) {
      set({ installStatus: 'success' })
      get().addInstallLog('success', `Skill "${name || localPath}" imported successfully`)
      toast.success(`Skill "${name || localPath}" imported`)
      get().fetchSkills()
      get().fetchSources()
      return true
    }
    set({ installStatus: 'error', error: resp.error })
    get().addInstallLog('error', resp.error ?? 'Failed to import from local')
    toast.error(resp.error ?? 'Failed to import from local')
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
      get().fetchSources()
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
      get().fetchSkills()
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
      get().fetchSkills()
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

  checkSkillUpdate: async (skillId) => {
    const resp = await wailsApi.checkSkillUpdate(skillId)
    if (resp.success && resp.data) {
      const diff: SkillVersionDiff = {
        skillId,
        currentCommit: '',
        latestCommit: '',
        currentVersion: resp.data.currentVersion,
        latestVersion: resp.data.latestVersion,
        behindCount: resp.data.behindCount,
        aheadCount: resp.data.aheadCount,
        hasUpdate: resp.data.hasUpdate,
        commits: [],
      }
      set((state) => ({
        versionDiffs: { ...state.versionDiffs, [skillId]: diff },
        skills: state.skills.map((s) =>
          s.id === skillId ? { ...s, status: resp.data!.hasUpdate ? 'update_available' as const : s.status } : s
        ),
      }))
      return diff
    }
    return null
  },

  checkAllUpdates: async () => {
    set({ updateChecking: true })
    const resp = await wailsApi.checkAllSkillUpdates()
    if (resp.success && resp.data) {
      const diffs: Record<string, SkillVersionDiff> = {}
      for (const item of resp.data) {
        diffs[item.skillId] = {
          skillId: item.skillId,
          currentCommit: '',
          latestCommit: '',
          currentVersion: item.currentVersion,
          latestVersion: item.latestVersion,
          behindCount: item.behindCount,
          aheadCount: item.aheadCount,
          hasUpdate: item.hasUpdate,
          commits: [],
        }
      }
      set((state) => ({
        versionDiffs: { ...state.versionDiffs, ...diffs },
        skills: state.skills.map((s) => {
          const diff = diffs[s.id]
          if (diff) {
            return { ...s, status: diff.hasUpdate ? 'update_available' as const : s.status }
          }
          return s
        }),
        updateChecking: false,
      }))
      const updateCount = resp.data.filter((d) => d.hasUpdate).length
      if (updateCount > 0) {
        toast.info(`${updateCount} skill(s) have updates available`)
      } else {
        toast.success('All skills are up to date')
      }
    } else {
      set({ updateChecking: false })
    }
  },

  getSkillVersionDiff: async (skillId) => {
    const resp = await wailsApi.getSkillVersionDiff(skillId)
    if (resp.success && resp.data) {
      set((state) => ({
        versionDiffs: { ...state.versionDiffs, [skillId]: resp.data! },
      }))
      return resp.data
    }
    return null
  },

  updateSkill: async (skillId) => {
    const skill = get().skills.find((s) => s.id === skillId)
    if (!skill) return false
    const resp = await wailsApi.gitPull(skill.installPath)
    if (resp.success) {
      toast.success(`Skill "${skill.name}" updated successfully`)
      get().fetchSkills()
      get().fetchSources()
      set((state) => {
        const newDiffs = { ...state.versionDiffs }
        delete newDiffs[skillId]
        return { versionDiffs: newDiffs }
      })
      return true
    }
    toast.error(resp.error ?? 'Update failed')
    return false
  },
}))
