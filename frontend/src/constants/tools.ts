import claudeIcon from '@/assets/icon/claude.png'
import cursorIcon from '@/assets/icon/cursor.png'
import geminiIcon from '@/assets/icon/gemini.png'
import kiroIcon from '@/assets/icon/kiro.png'
import openaiIcon from '@/assets/icon/openai.png'
import githubIcon from '@/assets/icon/github.png'
import windsurfIcon from '@/assets/icon/windsurf.png'
import openclawIcon from '@/assets/icon/openclaw.png'
import opencodeIcon from '@/assets/icon/opencode.png'
import traeIcon from '@/assets/icon/trae.png'

export const TOOL_ICONS: Record<string, string> = {
  'Claude Code': claudeIcon,
  'Codex': openaiIcon,
  'Cursor': cursorIcon,
  'Windsurf': windsurfIcon,
  'Gemini CLI': geminiIcon,
  'Gemini': geminiIcon,
  'GitHub Copilot': githubIcon,
  'Trae': traeIcon,
  'Trae CN': traeIcon,
  'Kiro': kiroIcon,
  'OpenCode': opencodeIcon,
  'OpenClaw': openclawIcon,
}

export const SUPPORTED_TOOLS = Object.keys(TOOL_ICONS)

export function getToolIcon(name: string): string | undefined {
  return TOOL_ICONS[name]
}
