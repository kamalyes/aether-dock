import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMcpStore } from '@/stores/mcpStore'
import {
  Server,
  RefreshCw,
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronRight,
  Wrench,
  X,
  Zap,
  Copy,
  Check,
  Globe,
  Terminal,
  Loader2,
} from 'lucide-react'
import type { McpServer } from '@/types'
import { TOOL_ICONS, SUPPORTED_TOOLS } from '@/constants/tools'
import ConfirmDialog, { useConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ListLoading } from '@/components/ui/Loading'
import { SearchInput, Select } from '@/components/ui/Form'

export default function McpPage() {
  const { t } = useTranslation()

  const {
    servers, total, loading, filter,
    fetchServers, setFilter,
    deleteServer, enableForTool, disableForTool,
    discoverTools, updateServer,
  } = useMcpStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedServer, setExpandedServer] = useState<string | null>(null)
  const [selectedServer, setSelectedServer] = useState<McpServer | null>(null)
  const [editingServer, setEditingServer] = useState<McpServer | null>(null)
  const { dialogState, confirm, cancel } = useConfirmDialog()

  useEffect(() => {
    fetchServers()
  }, [filter.page, filter.status])

  const filteredServers = searchQuery
    ? servers.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.command?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : servers

  const toggleExpand = (id: string) => {
    setExpandedServer(expandedServer === id ? null : id)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-w-0">
        <div
          className="flex items-center justify-between px-5 py-2.5 shrink-0"
          style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}
        >
          <div className="flex items-center gap-3">
            <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t('mcp.title')}</h2>
            <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }} className="tabular-nums">{total} {t('mcp.configured')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('mcp.search')}
              style={{ width: 176 }}
            />
            <Select
              value={filter.status}
              onChange={(e) => setFilter({ status: e.target.value })}
              options={[
                { value: '', label: t('skills.all') },
                { value: 'enabled', label: t('mcp.enabled') },
                { value: 'disabled', label: t('mcp.disabled') },
                { value: 'error', label: t('skills.error') },
              ]}
              selectStyle={{ width: 100 }}
            />
            <button
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--c-text-faint)' }}
              onClick={() => fetchServers()}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => window.location.hash = '/install?tab=mcp'}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(35, 99, 235, 0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-accent-soft)' }}
            >
              <Plus style={{ width: 12, height: 12 }} />
              {t('mcp.addServer')}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-3">
          {loading ? (
            <ListLoading mode="skeleton" count={5} />
          ) : filteredServers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Server style={{ width: 40, height: 40, color: 'var(--c-text-faint)', marginBottom: 12 }} />
              <p style={{ color: 'var(--c-text-muted)', fontSize: 13, fontWeight: 500 }}>{t('mcp.noServers')}</p>
              <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>{t('mcp.noServersDesc')}</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {filteredServers.map((server) => (
                <McpServerRow
                  key={server.id}
                  server={server}
                  isExpanded={expandedServer === server.id}
                  onToggle={() => toggleExpand(server.id)}
                  onSelect={() => setSelectedServer(server)}
                  onDiscoverTools={() => discoverTools(server.id)}
                  onEnableTool={enableForTool}
                  onDisableTool={disableForTool}
                  onDelete={() => deleteServer(server.id)}
                  onEdit={() => setEditingServer(server)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedServer && (
        <McpDetailPanel
          server={selectedServer}
          onClose={() => setSelectedServer(null)}
          onDelete={async (id) => {
            const ok = await confirm({
              title: t('mcp.delete'),
              description: t('mcp.deleteConfirm', { name: selectedServer.name }),
              confirmLabel: t('confirm.delete'),
            })
            if (ok) {
              await deleteServer(id)
              setSelectedServer(null)
            }
          }}
          onEnableTool={enableForTool}
          onDisableTool={disableForTool}
          onDiscoverTools={() => discoverTools(selectedServer.id)}
        />
      )}

      <ConfirmDialog
        open={dialogState.open}
        title={dialogState.title}
        description={dialogState.description}
        confirmLabel={dialogState.confirmLabel}
        variant={dialogState.variant}
        onConfirm={dialogState.onConfirm}
        onCancel={cancel}
      />

      {editingServer && (
        <EditMcpDialog
          server={editingServer}
          onClose={() => setEditingServer(null)}
          onSave={async (id, name, command, args, env, description) => {
            return await updateServer(id, name, command, args, env, description)
          }}
        />
      )}
    </div>
  )
}

function McpServerRow({
  server,
  isExpanded,
  onToggle,
  onDiscoverTools,
  onEnableTool,
  onDisableTool,
  onDelete,
  onEdit,
}: {
  server: McpServer
  isExpanded: boolean
  onToggle: () => void
  onSelect: () => void
  onDiscoverTools: () => void
  onEnableTool: (id: string, toolName: string) => Promise<boolean>
  onDisableTool: (id: string, toolName: string) => Promise<boolean>
  onDelete: () => void
  onEdit: () => void
}) {
  const { t } = useTranslation()

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors"
        onClick={onToggle}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-card-hover)' }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '' }}
      >
        <span className="shrink-0" style={{ color: 'var(--c-text-faint)' }}>
          {isExpanded ? <ChevronDown style={{ width: 14, height: 14 }} /> : <ChevronRight style={{ width: 14, height: 14 }} />}
        </span>
        <Server style={{ width: 16, height: 16, color: 'var(--c-text-faint)' }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`status-dot ${server.status === 'enabled' ? 'status-dot-installed' : server.status === 'error' ? 'status-dot-error' : 'status-dot-disabled'}`} />
            <span style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--c-text)' }}>{server.name}</span>
            {server.sourceType === 'marketplace' && (
              <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 4, background: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-muted)', fontWeight: 500 }}>marketplace</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-1 pl-3.5">
            <Terminal style={{ width: 10, height: 10, color: 'var(--c-text-faint)' }} className="shrink-0" />
            <p style={{ fontSize: 10, color: 'var(--c-text-faint)' }} className="font-mono truncate">
              {server.command} {server.args?.join(' ')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {server.tools && server.tools.length > 0 && (
            <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
              <Zap style={{ width: 10, height: 10 }} />
              {server.tools.length}
            </span>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 space-y-3 animate-fade-in" style={{ borderTop: '1px solid var(--c-border)' }}>
          {server.description && (
            <p style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{server.description}</p>
          )}

          <div>
            <span className="section-label">{t('skills.enabledTools')}</span>
            <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-px">
              {SUPPORTED_TOOLS.map((tool) => {
                const enabled = server.enabledTools?.includes(tool) ?? false
                const icon = TOOL_ICONS[tool]
                return (
                  <div key={tool} className="flex items-center justify-between px-2 py-[5px] rounded-md transition-colors"
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.02)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                  >
                    <div className="flex items-center gap-1.5">
                      {icon ? (
                        <img src={icon} alt={tool} style={{ width: 16, height: 16 }} className="rounded object-contain" />
                      ) : (
                        <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(15, 23, 42, 0.06)', fontSize: 7, color: 'var(--c-text-faint)' }} className="flex items-center justify-center font-medium">
                          {tool[0]}
                        </div>
                      )}
                      <span style={{ fontSize: 10.5, color: enabled ? 'var(--c-text-secondary)' : 'var(--c-text-faint)' }}>{tool}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        enabled ? onDisableTool(server.id, tool) : onEnableTool(server.id, tool)
                      }}
                      className={enabled ? 'toggle-on' : 'toggle-off'}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={(e) => { e.stopPropagation(); onDiscoverTools() }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10.5px] transition-colors"
              style={{ color: 'var(--c-text-muted)', background: 'rgba(15, 23, 42, 0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
            >
              <Wrench style={{ width: 12, height: 12 }} />
              {t('mcp.discoverTools')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onEdit() }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10.5px] transition-colors"
              style={{ color: 'var(--c-text-muted)', background: 'rgba(15, 23, 42, 0.04)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
            >
              <Pencil style={{ width: 12, height: 12 }} />
              {t('mcp.editServer')}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10.5px] transition-colors"
              style={{ color: 'var(--c-red)', background: 'var(--c-red-soft)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.12)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-red-soft)' }}
            >
              <Trash2 style={{ width: 12, height: 12 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function McpDetailPanel({
  server,
  onClose,
  onDelete,
  onEnableTool,
  onDisableTool,
  onDiscoverTools,
}: {
  server: McpServer
  onClose: () => void
  onDelete: (id: string) => void
  onEnableTool: (id: string, toolName: string) => Promise<boolean>
  onDisableTool: (id: string, toolName: string) => Promise<boolean>
  onDiscoverTools: () => void
}) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const copyCommand = () => {
    const cmd = `${server.command} ${server.args?.join(' ')}`
    navigator.clipboard.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      className="w-[300px] flex flex-col shrink-0 animate-slide-in"
      style={{ background: 'var(--c-bg-panel)', borderLeft: '1px solid var(--c-border)' }}
    >
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text-secondary)' }}>{t('mcp.detail')}</h3>
        <button onClick={onClose} className="p-1 rounded-md transition-colors"
          style={{ color: 'var(--c-text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)'; e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)'; e.currentTarget.style.background = 'transparent' }}
        >
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`status-dot ${server.status === 'enabled' ? 'status-dot-installed' : server.status === 'error' ? 'status-dot-error' : 'status-dot-disabled'}`} />
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{server.name}</span>
          </div>
          {server.description && (
            <p style={{ fontSize: 11, color: 'var(--c-text-muted)', lineHeight: 1.5, marginTop: 4 }}>{server.description}</p>
          )}
        </div>

        <div>
          <span className="section-label">{t('mcp.command')}</span>
          <div className="mt-1.5 flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: 'var(--c-bg-input)' }}>
            <Terminal style={{ width: 12, height: 12, color: 'var(--c-text-faint)' }} className="shrink-0" />
            <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }} className="font-mono break-all leading-relaxed flex-1">
              {server.command} {server.args?.join(' ')}
            </span>
            <button
              onClick={copyCommand}
              className="p-1 rounded transition-colors shrink-0"
              style={{ color: 'var(--c-text-faint)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text-secondary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
            >
              {copied ? <Check style={{ width: 12, height: 12, color: 'var(--c-green)' }} /> : <Copy style={{ width: 12, height: 12 }} />}
            </button>
          </div>
        </div>

        {server.env && Object.keys(server.env).length > 0 && (
          <div>
            <span className="section-label">{t('mcp.env')}</span>
            <div className="mt-1.5 rounded-lg p-3 space-y-1.5" style={{ background: 'var(--c-bg-input)' }}>
              {Object.entries(server.env).map(([key, value]) => (
                <div key={key} className="text-[10px] font-mono flex items-center gap-1">
                  <span style={{ color: 'var(--c-text-muted)' }}>{key}</span>
                  <span style={{ color: 'var(--c-text-faint)' }}>=</span>
                  <span style={{ color: 'var(--c-text-faint)' }}>{'•'.repeat(Math.min(String(value).length, 16))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {server.sourceUrl && (
          <div>
            <span className="section-label">{t('skills.source')}</span>
            <div className="mt-1.5 flex items-center gap-1.5 rounded-lg px-3 py-2" style={{ background: 'var(--c-bg-input)' }}>
              <Globe style={{ width: 12, height: 12, color: 'var(--c-text-faint)' }} className="shrink-0" />
              <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }} className="truncate">{server.sourceUrl}</span>
            </div>
          </div>
        )}

        <div>
          <span className="section-label">{t('skills.enabledTools')}</span>
          <div className="mt-1.5 space-y-px">
            {SUPPORTED_TOOLS.map((tool) => {
              const enabled = server.enabledTools?.includes(tool) ?? false
              const icon = TOOL_ICONS[tool]
              return (
                <div key={tool} className="flex items-center justify-between px-2.5 py-[6px] rounded-md transition-colors"
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.02)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <div className="flex items-center gap-2">
                    {icon ? (
                      <img src={icon} alt={tool} style={{ width: 16, height: 16 }} className="rounded object-contain" />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(15, 23, 42, 0.06)', fontSize: 7, color: 'var(--c-text-faint)' }} className="flex items-center justify-center font-medium">
                        {tool[0]}
                      </div>
                    )}
                    <span style={{ fontSize: 11, color: enabled ? 'var(--c-text-secondary)' : 'var(--c-text-faint)' }}>{tool}</span>
                  </div>
                  <button
                    onClick={() => enabled ? onDisableTool(server.id, tool) : onEnableTool(server.id, tool)}
                    className={enabled ? 'toggle-on' : 'toggle-off'}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 flex gap-1.5" style={{ borderTop: '1px solid var(--c-border)' }}>
        <button
          onClick={onDiscoverTools}
          className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
          style={{ background: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-muted)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
        >
          <Wrench style={{ width: 12, height: 12 }} />
          {t('mcp.discoverTools')}
        </button>
        <button
          onClick={() => onDelete(server.id)}
          className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-[11px] transition-colors"
          style={{ background: 'var(--c-red-soft)', color: 'var(--c-red)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.12)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-red-soft)' }}
        >
          <Trash2 style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  )
}

function EditMcpDialog({
  server,
  onClose,
  onSave,
}: {
  server: McpServer
  onClose: () => void
  onSave: (id: string, name: string, command: string, args: string[], env: Record<string, unknown>, description: string) => Promise<boolean>
}) {
  const [name, setName] = useState(server.name)
  const [command, setCommand] = useState(server.command || '')
  const [argsStr, setArgsStr] = useState(server.args?.join(' ') || '')
  const [description, setDescription] = useState(server.description || '')
  const [saving, setSaving] = useState(false)

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    background: 'var(--c-bg-input)',
    border: '1px solid var(--c-border)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 12,
    color: 'var(--c-text)',
    outline: 'none',
  }

  const handleSave = async () => {
    if (!name || !command) return
    setSaving(true)
    const args = argsStr.trim() ? argsStr.trim().split(/\s+/) : []
    const ok = await onSave(server.id, name, command, args, server.env || {}, description)
    setSaving(false)
    if (ok) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="w-[420px] rounded-xl p-5 space-y-4"
        style={{ background: 'var(--c-bg-panel)', border: '1px solid var(--c-border)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>Edit MCP Server</h3>
          <button onClick={onClose} className="p-1 rounded-md" style={{ color: 'var(--c-text-faint)' }}>
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label style={{ fontSize: 11, color: 'var(--c-text-muted)', display: 'block', marginBottom: 4 }}>Name</label>
            <input
              type="text"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'var(--c-border-accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--c-border)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--c-text-muted)', display: 'block', marginBottom: 4 }}>Command</label>
            <input
              type="text"
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'var(--c-border-accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--c-border)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--c-text-muted)', display: 'block', marginBottom: 4 }}>Arguments (space-separated)</label>
            <input
              type="text"
              style={{ ...inputStyle, fontFamily: 'monospace' }}
              value={argsStr}
              onChange={(e) => setArgsStr(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'var(--c-border-accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--c-border)' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, color: 'var(--c-text-muted)', display: 'block', marginBottom: 4 }}>Description</label>
            <input
              type="text"
              style={inputStyle}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={(e) => { e.target.style.borderColor = 'var(--c-border-accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--c-border)' }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-[12px] font-medium transition-colors"
            style={{ color: 'var(--c-text-muted)', background: 'rgba(15, 23, 42, 0.04)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name || !command}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--c-accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
            onMouseEnter={(e) => { if (!saving) e.currentTarget.style.opacity = '0.85' }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
          >
            {saving ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Check style={{ width: 14, height: 14 }} />}
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
