import type {
  ApiResponse,
  SkillListResult,
  Skill,
  McpServerListResult,
  McpServer,
  McpTool,
  ToolConfig,
  GitStatus,
  SkillVersionDiff,
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
  CheckSkillUpdate(skillID: string): Promise<string>
  GetSkillVersionDiff(skillID: string): Promise<string>
  CheckAllSkillUpdates(): Promise<string>
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

const isDev = typeof window !== 'undefined' && !window?.go?.main?.App

const mockSkills: Skill[] = [
  {
    id: 'mock-1', name: 'react-patterns', description: 'Common React patterns and best practices',
    version: '1.0.0', gitUrl: 'https://github.com/example/react-patterns', gitBranch: 'main', gitCommit: 'abc1234',
    status: 'installed', sourceId: 'mock-src', sourceName: 'GitHub',
    installPath: '/skills/react-patterns', enabledTools: ['cursor', 'windsurf'],
    tags: ['react', 'frontend', 'patterns'], metadata: {}, createdAt: '2025-01-15T10:00:00Z', updatedAt: '2025-03-20T14:30:00Z',
  },
  {
    id: 'mock-2', name: 'go-clean-arch', description: 'Clean architecture patterns for Go projects',
    version: '2.1.0', gitUrl: 'https://github.com/example/go-clean-arch', gitBranch: 'main', gitCommit: 'def5678',
    status: 'installed', sourceId: 'mock-src', sourceName: 'GitHub',
    installPath: '/skills/go-clean-arch', enabledTools: ['cursor'],
    tags: ['go', 'architecture', 'backend'], metadata: {}, createdAt: '2025-02-10T08:00:00Z', updatedAt: '2025-04-01T09:15:00Z',
  },
  {
    id: 'mock-3', name: 'typescript-advanced', description: 'Advanced TypeScript type gymnastics',
    version: '3.0.0', gitUrl: 'https://github.com/example/typescript-advanced', gitBranch: 'main', gitCommit: 'ghi9012',
    status: 'update_available', sourceId: 'mock-src', sourceName: 'GitHub',
    installPath: '/skills/typescript-advanced', enabledTools: ['cursor', 'claude-code'],
    tags: ['typescript', 'types', 'advanced'], metadata: {}, createdAt: '2025-01-20T12:00:00Z', updatedAt: '2025-02-28T16:45:00Z',
  },
  {
    id: 'mock-4', name: 'docker-compose', description: 'Docker Compose configuration patterns',
    version: '1.2.0', gitUrl: 'https://github.com/example/docker-compose', gitBranch: 'main', gitCommit: 'jkl3456',
    status: 'error', sourceId: 'mock-src-2', sourceName: 'GitLab',
    installPath: '/skills/docker-compose', enabledTools: [],
    tags: ['docker', 'devops'], metadata: {}, createdAt: '2025-03-01T15:00:00Z', updatedAt: '2025-03-15T11:20:00Z',
  },
  {
    id: 'mock-5', name: 'rust-async', description: 'Async programming patterns in Rust',
    version: '0.9.0', gitUrl: 'https://github.com/example/rust-async', gitBranch: 'main', gitCommit: 'mno7890',
    status: 'installed', sourceId: 'mock-src', sourceName: 'GitHub',
    installPath: '/skills/rust-async', enabledTools: ['windsurf'],
    tags: ['rust', 'async', 'systems'], metadata: {}, createdAt: '2025-02-05T09:00:00Z', updatedAt: '2025-04-10T13:00:00Z',
  },
]

const mockMcpServers: McpServer[] = [
  {
    id: 'mock-mcp-1', name: 'filesystem-server', command: 'npx', args: ['-y', '@modelcontextprotocol/server-filesystem', '/home'],
    env: {}, sourceType: 'manual', sourceUrl: '',
    status: 'enabled', description: 'File system access MCP server', enabledTools: ['cursor', 'claude-code'],
    createdAt: '2025-02-01T10:00:00Z', updatedAt: '2025-03-20T14:30:00Z',
  },
  {
    id: 'mock-mcp-2', name: 'github-server', command: 'npx', args: ['-y', '@modelcontextprotocol/server-github'],
    env: {}, sourceType: 'marketplace', sourceUrl: 'https://github.com/modelcontextprotocol/servers',
    status: 'disabled', description: 'GitHub API MCP server', enabledTools: [],
    createdAt: '2025-03-01T08:00:00Z', updatedAt: '2025-03-15T09:15:00Z',
  },
]

const mockTools: ToolConfig[] = [
  { id: 't1', toolName: 'cursor', displayName: 'Cursor', configPath: '/cursor/config.json', skillDir: '/cursor/skills', mcpDir: '/cursor/mcp', isDetected: true, isEnabled: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 't2', toolName: 'windsurf', displayName: 'Windsurf', configPath: '/windsurf/config.json', skillDir: '/windsurf/skills', mcpDir: '/windsurf/mcp', isDetected: true, isEnabled: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 't3', toolName: 'claude-code', displayName: 'Claude Code', configPath: '/claude/config.json', skillDir: '/claude/skills', mcpDir: '/claude/mcp', isDetected: true, isEnabled: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 't4', toolName: 'trae', displayName: 'Trae', configPath: '/trae/config.json', skillDir: '/trae/skills', mcpDir: '/trae/mcp', isDetected: true, isEnabled: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 't5', toolName: 'github-copilot', displayName: 'GitHub Copilot', configPath: '/github/config.json', skillDir: '/github/skills', mcpDir: '/github/mcp', isDetected: false, isEnabled: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 't6', toolName: 'gemini-cli', displayName: 'Gemini CLI', configPath: '/gemini/config.json', skillDir: '/gemini/skills', mcpDir: '/gemini/mcp', isDetected: true, isEnabled: true, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
]

const mockSources: SkillSource[] = [
  { id: 'mock-src', name: 'GitHub', type: 'git', url: 'https://github.com/skills', branch: 'main', localPath: '', description: 'GitHub skills repository', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  { id: 'mock-src-2', name: 'GitLab', type: 'git', url: 'https://gitlab.com/skills', branch: 'main', localPath: '', description: 'GitLab skills repository', createdAt: '2025-01-15T00:00:00Z', updatedAt: '2025-01-15T00:00:00Z' },
]

function mockCall<T>(key: string): ApiResponse<T> {
  const delay = () => new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 300))
  const mockData: Record<string, unknown> = {
    'getAppInfo': { name: 'AetherDock', version: '0.2.0-dev' },
    'listSkills': { skills: mockSkills, total: mockSkills.length },
    'listMcpServers': { servers: mockMcpServers, total: mockMcpServers.length },
    'listTools': mockTools,
    'detectTools': mockTools,
    'listSources': mockSources,
    'getSettings': { 'app.language': 'auto', 'app.theme': 'light', 'install.autoSync': 'true', 'app.checkUpdates': 'true' },
    'listActivities': [
      { id: 'a1', type: 'install', targetName: 'react-patterns', targetType: 'skill', toolName: '', detail: 'Installed from GitHub', createdAt: '2025-04-10T13:00:00Z' },
      { id: 'a2', type: 'sync', targetName: 'go-clean-arch', targetType: 'skill', toolName: 'cursor', detail: 'Synced to Cursor', createdAt: '2025-04-09T10:00:00Z' },
      { id: 'a3', type: 'install', targetName: 'filesystem-server', targetType: 'mcp', toolName: '', detail: 'Added MCP server', createdAt: '2025-04-08T15:00:00Z' },
      { id: 'a4', type: 'error', targetName: 'docker-compose', targetType: 'skill', toolName: '', detail: 'Hash mismatch detected', createdAt: '2025-04-07T09:00:00Z' },
    ],
    'getHomeDir': '/home/user',
    'checkSkillUpdate': { skillId: 'mock-3', hasUpdate: true, currentVersion: '3.0.0', latestVersion: '3.1.0', behindCount: 3, aheadCount: 0 },
    'checkAllSkillUpdates': [
      { skillId: 'mock-3', hasUpdate: true, currentVersion: '3.0.0', latestVersion: '3.1.0', behindCount: 3, aheadCount: 0 },
    ],
    'getSkillVersionDiff': {
      skillId: 'mock-3',
      currentCommit: 'ghi9012',
      latestCommit: 'xyz9999',
      currentVersion: '3.0.0',
      latestVersion: '3.1.0',
      behindCount: 3,
      aheadCount: 0,
      hasUpdate: true,
      commits: [
        { hash: 'a1b2c3d', author: 'developer', message: 'feat: add new pattern matching', date: '2025-04-08T10:00:00Z' },
        { hash: 'e4f5g6h', author: 'contributor', message: 'fix: resolve type inference issue', date: '2025-04-06T14:30:00Z' },
        { hash: 'i7j8k9l', author: 'developer', message: 'docs: update README with examples', date: '2025-04-05T09:15:00Z' },
      ],
    },
  }
  const data = mockData[key]
  if (data !== undefined) {
    return { success: true, data: data as T }
  }
  return { success: true, data: undefined as T }
}

async function callApi<T>(fn: () => Promise<string>, mockKey?: string): Promise<ApiResponse<T>> {
  const app = getApp()
  if (!app) {
    if (isDev && mockKey) {
      await new Promise<void>((r) => setTimeout(r, 200 + Math.random() * 300))
      return mockCall<T>(mockKey)
    }
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
  getAppInfo: () => callApi<Record<string, string>>(() => getApp()!.GetAppInfo(), 'getAppInfo'),

  listSkills: (page: number, pageSize: number, status = '', sourceID = '') =>
    callApi<SkillListResult>(() => getApp()!.ListSkills(page, pageSize, status, sourceID), 'listSkills'),

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

  listSources: () => callApi<SkillSource[]>(() => getApp()!.ListSources(), 'listSources'),

  createSource: (req: CreateSourceRequest) =>
    callApi<SkillSource>(() => getApp()!.CreateSource(JSON.stringify(req))),

  deleteSource: (id: string) => callApi<void>(() => getApp()!.DeleteSource(id)),

  listMcpServers: (page: number, pageSize: number, status = '') =>
    callApi<McpServerListResult>(() => getApp()!.ListMcpServers(page, pageSize, status), 'listMcpServers'),

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

  listTools: () => callApi<ToolConfig[]>(() => getApp()!.ListTools(), 'listTools'),

  detectTools: () => callApi<ToolConfig[]>(() => getApp()!.DetectTools(), 'detectTools'),

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

  getSettings: () => callApi<Record<string, string>>(() => getApp()!.GetSettings(), 'getSettings'),

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

  getHomeDir: () => callApi<string>(() => getApp()!.GetHomeDir(), 'getHomeDir'),

  browseFolder: () => callApi<string>(() => getApp()!.BrowseFolder()),

  browseFile: () => callApi<string>(() => getApp()!.BrowseFile()),

  saveFile: (defaultFilename: string) => callApi<string>(() => getApp()!.SaveFile(defaultFilename)),

  listActivities: (limit: number) => callApi<{ id: string; type: string; targetName: string; targetType: string; toolName: string; detail: string; createdAt: string }[]>(() => getApp()!.ListActivities(limit), 'listActivities'),

  listGitBranches: (owner: string, repo: string) => callApi<string[]>(() => getApp()!.ListGitBranches(owner, repo)),

  checkSkillUpdate: (skillID: string) =>
    callApi<{ skillId: string; hasUpdate: boolean; currentVersion: string; latestVersion: string; behindCount: number; aheadCount: number }>(() => getApp()!.CheckSkillUpdate(skillID), 'checkSkillUpdate'),

  getSkillVersionDiff: (skillID: string) =>
    callApi<SkillVersionDiff>(() => getApp()!.GetSkillVersionDiff(skillID), 'getSkillVersionDiff'),

  checkAllSkillUpdates: () =>
    callApi<{ skillId: string; hasUpdate: boolean; currentVersion: string; latestVersion: string; behindCount: number; aheadCount: number }[]>(() => getApp()!.CheckAllSkillUpdates(), 'checkAllSkillUpdates'),
}
