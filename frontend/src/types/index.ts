export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

export interface Skill {
  id: string
  name: string
  description: string
  version: string
  sourceId: string
  sourceName?: string
  installPath: string
  gitUrl: string
  gitBranch: string
  gitCommit: string
  status: 'installed' | 'update_available' | 'modified' | 'error' | 'installing'
  enabledTools: string[]
  tags: string[]
  metadata: Record<string, unknown>
  source?: SkillSource
  createdAt: string
  updatedAt: string
}

export interface SkillSource {
  id: string
  name: string
  type: 'git' | 'local' | 'marketplace'
  url: string
  branch: string
  localPath: string
  description: string
  skills?: Skill[]
  createdAt: string
  updatedAt: string
}

export interface McpServer {
  id: string
  name: string
  description: string
  command: string
  args: string[]
  env: Record<string, unknown>
  sourceType: 'marketplace' | 'manual' | 'import'
  sourceUrl: string
  enabledTools: string[]
  status: 'enabled' | 'disabled' | 'error'
  tools?: McpTool[]
  createdAt: string
  updatedAt: string
}

export interface McpTool {
  id: string
  serverId: string
  name: string
  description: string
  inputSchema: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface ToolConfig {
  id: string
  toolName: string
  displayName: string
  configPath: string
  skillDir: string
  mcpDir: string
  isDetected: boolean
  isEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface GitStatus {
  isGitRepo: boolean
  branch: string
  commit: string
  hasChanges: boolean
  aheadCount: number
  behindCount: number
  remoteUrl: string
  stagedFiles: number
  unstagedFiles: number
  untrackedFiles: number
}

export interface SkillListResult {
  skills: Skill[]
  total: number
}

export interface McpServerListResult {
  servers: McpServer[]
  total: number
}

export interface InstallFromGitRequest {
  url: string
  branch: string
  name: string
  sourceName: string
}

export interface InstallFromLocalRequest {
  localPath: string
  name: string
  sourceName: string
}

export interface AddMcpServerRequest {
  name: string
  description: string
  command: string
  args: string[]
  env: Record<string, unknown>
  sourceType: string
  sourceUrl: string
}

export interface CreateSourceRequest {
  name: string
  type: string
  url: string
  branch: string
  localPath: string
  description: string
}

export interface Tag {
  id: string
  name: string
  parentId?: string
  color?: string
  children?: Tag[]
}

export interface Activity {
  id: string
  type: 'install' | 'update' | 'delete' | 'enable' | 'disable'
  skillName: string
  toolName?: string
  timestamp: string
}

export interface RegistrySkill {
  slug: string
  name: string
  description: string
  category: string
  iconUrl?: string
  iconEmoji?: string
  contentUrl: string
  sourceUrl: string
  tags: string[]
}

export interface StoreSource {
  id: string
  name: string
  type: 'marketplace-json' | 'git-repo' | 'local-dir'
  url: string
  enabled: boolean
  lastSyncedAt?: string
}

export type SkillViewMode = 'gallery' | 'list'
export type SortField = 'name' | 'updatedAt' | 'createdAt' | 'status'
export type SortOrder = 'asc' | 'desc'
