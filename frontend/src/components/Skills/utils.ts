import type { Skill, SkillSource } from '@/types'
import { getToolIcon } from '@/constants/tools'

export type CoreSkillToolId = 'claude' | 'codex' | 'gemini' | 'opencode' | 'cursor' | 'windsurf' | 'github_copilot' | 'trae' | 'kiro' | 'openclaw'

export interface CoreSkillTool {
  id: CoreSkillToolId
  toolName: string
  label: string
  iconKeys: string[]
  color: string
  soft: string
}

export const CORE_SKILL_TOOLS: CoreSkillTool[] = [
  {
    id: 'claude',
    toolName: 'claude_code',
    label: 'Claude',
    iconKeys: ['Claude Code', 'Claude'],
    color: '#D97757',
    soft: 'rgba(217, 119, 87, 0.10)',
  },
  {
    id: 'codex',
    toolName: 'codex',
    label: 'Codex',
    iconKeys: ['Codex'],
    color: '#111827',
    soft: 'rgba(17, 24, 39, 0.08)',
  },
  {
    id: 'gemini',
    toolName: 'gemini',
    label: 'Gemini',
    iconKeys: ['Gemini CLI', 'Gemini'],
    color: '#4285F4',
    soft: 'rgba(66, 133, 244, 0.10)',
  },
  {
    id: 'opencode',
    toolName: 'opencode',
    label: 'OpenCode',
    iconKeys: ['OpenCode'],
    color: '#2563EB',
    soft: 'rgba(37, 99, 235, 0.10)',
  },
  {
    id: 'cursor',
    toolName: 'cursor',
    label: 'Cursor',
    iconKeys: ['Cursor'],
    color: '#7C3AED',
    soft: 'rgba(124, 58, 237, 0.10)',
  },
  {
    id: 'windsurf',
    toolName: 'windsurf',
    label: 'Windsurf',
    iconKeys: ['Windsurf'],
    color: '#0EA5E9',
    soft: 'rgba(14, 165, 233, 0.10)',
  },
  {
    id: 'github_copilot',
    toolName: 'github_copilot',
    label: 'GitHub Copilot',
    iconKeys: ['GitHub Copilot'],
    color: '#24292F',
    soft: 'rgba(36, 41, 47, 0.08)',
  },
  {
    id: 'trae',
    toolName: 'trae',
    label: 'Trae',
    iconKeys: ['Trae', 'Trae CN'],
    color: '#6366F1',
    soft: 'rgba(99, 102, 241, 0.10)',
  },
  {
    id: 'kiro',
    toolName: 'kiro',
    label: 'Kiro',
    iconKeys: ['Kiro'],
    color: '#10B981',
    soft: 'rgba(16, 185, 129, 0.10)',
  },
  {
    id: 'openclaw',
    toolName: 'openclaw',
    label: 'OpenClaw',
    iconKeys: ['OpenClaw'],
    color: '#F59E0B',
    soft: 'rgba(245, 158, 11, 0.10)',
  },
]

const TOOL_ALIASES: Record<string, CoreSkillToolId> = {
  claude: 'claude',
  claude_code: 'claude',
  'claude-code': 'claude',
  'claude code': 'claude',
  codex: 'codex',
  openai: 'codex',
  'openai codex': 'codex',
  gemini: 'gemini',
  gemini_cli: 'gemini',
  'gemini-cli': 'gemini',
  'gemini cli': 'gemini',
  opencode: 'opencode',
  open_code: 'opencode',
  'open-code': 'opencode',
  'open code': 'opencode',
  cursor: 'cursor',
  windsurf: 'windsurf',
  'github copilot': 'github_copilot',
  github_copilot: 'github_copilot',
  'github-copilot': 'github_copilot',
  trae: 'trae',
  'trae cn': 'trae',
  trae_cn: 'trae',
  kiro: 'kiro',
  openclaw: 'openclaw',
  open_claw: 'openclaw',
  'open-claw': 'openclaw',
}

export function normalizeToolKey(value: string): CoreSkillToolId | null {
  const normalized = value.trim().toLowerCase().replace(/[./\\]+/g, '_')
  const loose = normalized.replace(/[\s-]+/g, '_')
  return TOOL_ALIASES[normalized] ?? TOOL_ALIASES[loose] ?? null
}

export function isSkillEnabledForTool(skill: Skill, tool: CoreSkillTool): boolean {
  const desired = tool.id
  return skill.enabledTools?.some((enabled) => normalizeToolKey(enabled) === desired) ?? false
}

export function getToolIconFor(tool: CoreSkillTool): string | undefined {
  for (const key of tool.iconKeys) {
    const icon = getToolIcon(key)
    if (icon) return icon
  }
  return undefined
}

export function getToolIconByName(name: string): string | undefined {
  const toolId = normalizeToolKey(name)
  if (toolId) {
    const tool = CORE_SKILL_TOOLS.find((t) => t.id === toolId)
    if (tool) return getToolIconFor(tool)
  }
  return getToolIcon(name)
}

export function sourceLabel(skill: Skill, sources: SkillSource[]): string {
  return skill.sourceName || sources.find((source) => source.id === skill.sourceId)?.name || '-'
}

export function shortPath(path: string): string {
  if (!path) return '-'
  return path.replace(/^([A-Za-z]:)?[\\/](Users|home)[\\/][^\\/]+/u, '~')
}

export function formatSkillDate(value: string): string {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat(undefined, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function getSkillUsage(skill: Skill): number {
  const raw = skill.metadata?.usageCount ?? skill.metadata?.calls ?? skill.metadata?.callCount
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') {
    const parsed = Number(raw)
    if (!Number.isNaN(parsed)) return parsed
  }
  return Math.max(8, skill.name.length * 5)
}

export function uniqueSourceOptions(sources: SkillSource[]) {
  return sources.map((source) => ({ value: source.id, label: source.name }))
}
