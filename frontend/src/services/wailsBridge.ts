import type {
  ApiResponse,
  SkillListResult,
  Skill,
  McpServerListResult,
  McpServer,
  McpTool,
  ToolConfig,
  GitStatus,
  InstallFromGitRequest,
  InstallFromLocalRequest,
  AddMcpServerRequest,
  CreateSourceRequest,
  SkillSource,
} from '@/types'

type WailsApp = {
  GetAppInfo(): Promise<string>
  ListSkills(page: number, pageSize: number, status: string, sourceID: string): Promise<string>
  GetSkill(id: string): Promise<string>
  InstallSkillFromGit(jsonReq: string): Promise<string>
  InstallSkillFromLocal(jsonReq: string): Promise<string>
  DeleteSkill(id: string): Promise<string>
  EnableSkillForTool(id: string, toolName: string): Promise<string>
  DisableSkillForTool(id: string, toolName: string): Promise<string>
  ListSources(): Promise<string>
  CreateSource(jsonReq: string): Promise<string>
  DeleteSource(id: string): Promise<string>
  ListMcpServers(page: number, pageSize: number, status: string): Promise<string>
  GetMcpServer(id: string): Promise<string>
  AddMcpServer(jsonReq: string): Promise<string>
  UpdateMcpServer(id: string, jsonReq: string): Promise<string>
  DeleteMcpServer(id: string): Promise<string>
  EnableMcpForTool(id: string, toolName: string): Promise<string>
  DisableMcpForTool(id: string, toolName: string): Promise<string>
  DiscoverMcpTools(id: string): Promise<string>
  ListTools(): Promise<string>
  DetectTools(): Promise<string>
  EnableTool(name: string): Promise<string>
  DisableTool(name: string): Promise<string>
  SyncAllSkills(): Promise<string>
  SyncAllMcp(): Promise<string>
  SyncSkillToTool(skillID: string, toolName: string): Promise<string>
  UnsyncSkillFromTool(skillID: string, toolName: string): Promise<string>
  SyncMcpToTool(serverID: string, toolName: string): Promise<string>
  UnsyncMcpFromTool(serverID: string, toolName: string): Promise<string>
  GetGitStatus(repoPath: string): Promise<string>
  GitPull(repoPath: string): Promise<string>
  GetSettings(): Promise<string>
  SetSetting(key: string, value: string): Promise<string>
  ResetSettings(): Promise<string>
  SearchMarketplace(query: string): Promise<string>
  SearchMcpMarketplace(query: string): Promise<string>
  ImportSkillsZip(jsonReq: string): Promise<string>
  ExportSkillsZip(jsonReq: string): Promise<string>
  OpenInExplorer(path: string): Promise<string>
  GetSkillDetail(id: string): Promise<string>
  GetHomeDir(): Promise<string>
  BrowseFolder(): Promise<string>
  BrowseFile(): Promise<string>
  SaveFile(defaultFilename: string): Promise<string>
  ListActivities(limit: number): Promise<string>
  ListGitBranches(owner: string, repo: string): Promise<string>
}

declare global {
  interface Window {
    go: {
      main: {
        App: WailsApp
      }
    }
  }
}

function getApp(): WailsApp | null {
  try {
    return window?.go?.main?.App ?? null
  } catch {
    return null
  }
}

function parseResponse<T>(raw: string): ApiResponse<T> {
  try {
    return JSON.parse(raw) as ApiResponse<T>
  } catch {
    return { success: false, error: 'Failed to parse response' }
  }
}

async function callApi<T>(fn: () => Promise<string>): Promise<ApiResponse<T>> {
  const app = getApp()
  if (!app) {
    return { success: false, error: 'Wails runtime not available' }
  }
  try {
    const raw = await fn()
    return parseResponse<T>(raw)
  } catch (e) {
    return { success: false, error: String(e) }
  }
}

export const wailsApi = {
  getAppInfo: () => callApi<Record<string, string>>(() => getApp()!.GetAppInfo()),

  listSkills: (page: number, pageSize: number, status = '', sourceID = '') =>
    callApi<SkillListResult>(() => getApp()!.ListSkills(page, pageSize, status, sourceID)),

  getSkill: (id: string) => callApi<Skill>(() => getApp()!.GetSkill(id)),

  installSkillFromGit: (req: InstallFromGitRequest) =>
    callApi<Skill>(() => getApp()!.InstallSkillFromGit(JSON.stringify(req))),

  installSkillFromLocal: (req: InstallFromLocalRequest) =>
    callApi<Skill>(() => getApp()!.InstallSkillFromLocal(JSON.stringify(req))),

  deleteSkill: (id: string) => callApi<void>(() => getApp()!.DeleteSkill(id)),

  enableSkillForTool: (id: string, toolName: string) =>
    callApi<void>(() => getApp()!.EnableSkillForTool(id, toolName)),

  disableSkillForTool: (id: string, toolName: string) =>
    callApi<void>(() => getApp()!.DisableSkillForTool(id, toolName)),

  listSources: () => callApi<SkillSource[]>(() => getApp()!.ListSources()),

  createSource: (req: CreateSourceRequest) =>
    callApi<SkillSource>(() => getApp()!.CreateSource(JSON.stringify(req))),

  deleteSource: (id: string) => callApi<void>(() => getApp()!.DeleteSource(id)),

  listMcpServers: (page: number, pageSize: number, status = '') =>
    callApi<McpServerListResult>(() => getApp()!.ListMcpServers(page, pageSize, status)),

  getMcpServer: (id: string) => callApi<McpServer>(() => getApp()!.GetMcpServer(id)),

  addMcpServer: (req: AddMcpServerRequest) =>
    callApi<McpServer>(() => getApp()!.AddMcpServer(JSON.stringify(req))),

  updateMcpServer: (id: string, req: AddMcpServerRequest) =>
    callApi<McpServer>(() => getApp()!.UpdateMcpServer(id, JSON.stringify(req))),

  deleteMcpServer: (id: string) => callApi<void>(() => getApp()!.DeleteMcpServer(id)),

  enableMcpForTool: (id: string, toolName: string) =>
    callApi<void>(() => getApp()!.EnableMcpForTool(id, toolName)),

  disableMcpForTool: (id: string, toolName: string) =>
    callApi<void>(() => getApp()!.DisableMcpForTool(id, toolName)),

  discoverMcpTools: (id: string) => callApi<McpTool[]>(() => getApp()!.DiscoverMcpTools(id)),

  listTools: () => callApi<ToolConfig[]>(() => getApp()!.ListTools()),

  detectTools: () => callApi<ToolConfig[]>(() => getApp()!.DetectTools()),

  enableTool: (name: string) => callApi<void>(() => getApp()!.EnableTool(name)),

  disableTool: (name: string) => callApi<void>(() => getApp()!.DisableTool(name)),

  syncAllSkills: () => callApi<void>(() => getApp()!.SyncAllSkills()),

  syncAllMcp: () => callApi<void>(() => getApp()!.SyncAllMcp()),

  syncSkillToTool: (skillID: string, toolName: string) =>
    callApi<void>(() => getApp()!.SyncSkillToTool(skillID, toolName)),

  unsyncSkillFromTool: (skillID: string, toolName: string) =>
    callApi<void>(() => getApp()!.UnsyncSkillFromTool(skillID, toolName)),

  syncMcpToTool: (serverID: string, toolName: string) =>
    callApi<void>(() => getApp()!.SyncMcpToTool(serverID, toolName)),

  unsyncMcpFromTool: (serverID: string, toolName: string) =>
    callApi<void>(() => getApp()!.UnsyncMcpFromTool(serverID, toolName)),

  getGitStatus: (repoPath: string) => callApi<GitStatus>(() => getApp()!.GetGitStatus(repoPath)),

  gitPull: (repoPath: string) => callApi<void>(() => getApp()!.GitPull(repoPath)),

  getSettings: () => callApi<Record<string, string>>(() => getApp()!.GetSettings()),

  setSetting: (key: string, value: string) => callApi<void>(() => getApp()!.SetSetting(key, value)),

  resetSettings: () => callApi<void>(() => getApp()!.ResetSettings()),

  searchMarketplace: (query: string) => callApi<any>(() => getApp()!.SearchMarketplace(query)),

  searchMcpMarketplace: (query: string) => callApi<any>(() => getApp()!.SearchMcpMarketplace(query)),

  importSkillsZip: (req: { zipPath: string; targetRoot: string }) =>
    callApi<{ targetRoot: string; importedSkillPaths: string[] }>(() =>
      getApp()!.ImportSkillsZip(JSON.stringify(req))
    ),

  exportSkillsZip: (req: { outputPath: string; skills: { skillId: string; sourceSkillPath: string }[] }) =>
    callApi<{ outputPath: string; exportedSkillCount: number }>(() =>
      getApp()!.ExportSkillsZip(JSON.stringify(req))
    ),

  openInExplorer: (path: string) => callApi<void>(() => getApp()!.OpenInExplorer(path)),

  getSkillDetail: (id: string) =>
    callApi<{
      skill: Skill
      content: string
      contentHash: string
      relatedFiles: string[]
      installLocations: {
        toolName: string
        icon: string
        path: string
        installed: boolean
        hash: string
      }[]
      gitInfo?: {
        stars: number
        forks: number
        openIssues: number
        license: string
        lastUpdated: string
        language: string
        description: string
        readme: string
      }
    }>(() => getApp()!.GetSkillDetail(id)),

  getHomeDir: () => callApi<string>(() => getApp()!.GetHomeDir()),

  browseFolder: () => callApi<string>(() => getApp()!.BrowseFolder()),

  browseFile: () => callApi<string>(() => getApp()!.BrowseFile()),

  saveFile: (defaultFilename: string) => callApi<string>(() => getApp()!.SaveFile(defaultFilename)),

  listActivities: (limit: number) => callApi<{ id: string; type: string; targetName: string; targetType: string; toolName: string; detail: string; createdAt: string }[]>(() => getApp()!.ListActivities(limit)),

  listGitBranches: (owner: string, repo: string) => callApi<string[]>(() => getApp()!.ListGitBranches(owner, repo)),
}
