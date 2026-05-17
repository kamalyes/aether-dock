import { useEffect } from 'react'
import { useToolStore } from '@/stores/toolStore'
import { wailsApi } from '@/services/wailsBridge'
import {
  RefreshCw,
  Wrench,
  CheckCircle2,
  XCircle,
  FolderOpen,
  FileText,
  ExternalLink,
} from 'lucide-react'
import { TOOL_ICONS } from '@/constants/tools'
import { CardLoading } from '@/components/ui/Loading'

export default function ToolsPage() {
  const { tools, loading, fetchTools, detectTools, enableTool, disableTool } = useToolStore()

  useEffect(() => {
    fetchTools()
  }, [])

  const detectedCount = tools.filter((t) => t.isDetected).length
  const enabledCount = tools.filter((t) => t.isEnabled).length

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}
      >
        <div className="flex items-center gap-3">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>Supported Tools</h2>
          <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }} className="tabular-nums">
            {detectedCount} detected · {enabledCount} enabled
          </span>
        </div>
        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{ color: 'var(--c-text-muted)', background: 'rgba(15, 23, 42, 0.04)' }}
          onClick={detectTools}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
        >
          <RefreshCw style={{ width: 12, height: 12 }} className={loading ? 'animate-spin' : ''} />
          Re-detect
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {loading && tools.length === 0 ? (
          <CardLoading mode="skeleton" count={8} rows={2} />
        ) : tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Wrench style={{ width: 40, height: 40, color: 'var(--c-text-faint)', marginBottom: 12 }} />
            <p style={{ color: 'var(--c-text-muted)', fontSize: 13, fontWeight: 500 }}>No tools detected</p>
            <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>Click "Re-detect" to scan for supported tools</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onToggle={() => tool.isEnabled ? disableTool(tool.toolName) : enableTool(tool.toolName)} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ToolCard({ tool, onToggle }: { tool: any; onToggle: () => void }) {
  const icon = TOOL_ICONS[tool.toolName]

  const handleOpenDir = (path: string) => {
    wailsApi.openInExplorer(path)
  }

  return (
    <div className="glass-card p-4 transition-all duration-150"
      style={{ opacity: tool.isDetected ? 1 : 0.55 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          {icon ? (
            <img src={icon} alt={tool.toolName} style={{ width: 28, height: 28 }} className="rounded-md object-contain" />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--c-bg-input)' }} className="flex items-center justify-center">
              <Wrench style={{ width: 15, height: 15, color: 'var(--c-text-faint)' }} />
            </div>
          )}
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{tool.displayName}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {tool.isDetected ? (
                <CheckCircle2 style={{ width: 12, height: 12, color: 'var(--c-green)' }} />
              ) : (
                <XCircle style={{ width: 12, height: 12, color: 'var(--c-text-faint)' }} />
              )}
              <span style={{ fontSize: 10, color: tool.isDetected ? 'var(--c-green)' : 'var(--c-text-faint)' }}>
                {tool.isDetected ? 'Detected' : 'Not found'}
              </span>
            </div>
          </div>
        </div>
        <button onClick={onToggle} className={tool.isEnabled ? 'toggle-on' : 'toggle-off'} />
      </div>

      <div className="space-y-2">
        {tool.skillDir && (
          <PathRow
            icon={<FolderOpen style={{ width: 13, height: 13, color: 'var(--c-accent)' }} className="shrink-0" />}
            path={tool.skillDir}
            label="Skills Dir"
            onOpen={() => handleOpenDir(tool.skillDir)}
          />
        )}
        {tool.mcpConfigPath && (
          <PathRow
            icon={<FileText style={{ width: 13, height: 13, color: 'var(--c-violet)' }} className="shrink-0" />}
            path={tool.mcpConfigPath}
            label="MCP Config"
            onOpen={() => handleOpenDir(tool.mcpConfigPath)}
          />
        )}
        {!tool.skillDir && !tool.mcpConfigPath && (
          <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>No paths configured</span>
        )}
      </div>
    </div>
  )
}

function PathRow({ icon, path, label, onOpen }: { icon: React.ReactNode; path: string; label: string; onOpen: () => void }) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
      style={{ background: 'var(--c-bg-input)' }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-elevated)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-bg-input)' }}
      onClick={onOpen}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <span style={{ fontSize: 9, color: 'var(--c-text-faint)', letterSpacing: '0.05em', fontWeight: 600 }} className="uppercase">{label}</span>
        <p style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }} className="truncate leading-relaxed">{path}</p>
      </div>
      <ExternalLink style={{ width: 12, height: 12, color: 'var(--c-text-faint)', flexShrink: 0 }} />
    </div>
  )
}
