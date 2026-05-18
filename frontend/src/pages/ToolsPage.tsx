import { useEffect, useState } from 'react'
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
  FolderLock,
} from 'lucide-react'
import { getToolIconByName } from '@/components/Skills'
import { CardLoading } from '@/components/Loading'
import { useTranslation } from 'react-i18next'
import { toast } from '@/stores/toastStore'

export default function ToolsPage() {
  const { t } = useTranslation()
  const { tools, loading, fetchTools, detectTools, enableTool, disableTool } = useToolStore()
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      await fetchTools()
      setInitialLoading(false)
    })()
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
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{t('tools.title')}</h2>
          <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }} className="tabular-nums">
            {detectedCount} {t('tools.detected')} · {enabledCount} {t('tools.enabled')}
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
          {t('tools.detect')}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {initialLoading ? (
          <CardLoading mode="skeleton" count={8} rows={2} />
        ) : tools.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Wrench style={{ width: 40, height: 40, color: 'var(--c-text-faint)', marginBottom: 12 }} />
            <p style={{ color: 'var(--c-text-muted)', fontSize: 13, fontWeight: 500 }}>{t('tools.noTools')}</p>
            <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>{t('tools.noToolsDesc')}</p>
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
  const { t } = useTranslation()
  const icon = getToolIconByName(tool.displayName) || getToolIconByName(tool.toolName)
  const canEnable = tool.isDetected
  const canOpenDir = tool.isEnabled && tool.isDetected
  const showToggleOn = tool.isEnabled && tool.isDetected

  const handleOpenDir = (path: string) => {
    if (!canOpenDir) {
      toast.warning(t('tools.enableFirst'))
      return
    }
    wailsApi.openInExplorer(path)
  }

  const handleIconClick = () => {
    if (!canOpenDir) {
      toast.warning(t('tools.enableFirst'))
      return
    }
    if (tool.skillDir) {
      wailsApi.openInExplorer(tool.skillDir)
    } else if (tool.mcpDir) {
      wailsApi.openInExplorer(tool.mcpDir)
    }
  }

  const handleToggle = () => {
    if (!canEnable) {
      toast.warning(t('tools.detectFirst'))
      return
    }
    onToggle()
  }

  return (
    <div className="glass-card p-4 transition-all duration-150"
      style={{ opacity: tool.isDetected ? 1 : 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={handleIconClick}
            className="shrink-0 transition-transform duration-150 hover:scale-110 active:scale-95"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: canOpenDir ? 'var(--c-bg-input)' : 'var(--c-bg-elevated)',
              border: canOpenDir ? '1px solid var(--c-border)' : '1px dashed var(--c-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: canOpenDir ? 'pointer' : 'not-allowed',
              position: 'relative',
            }}
            title={canOpenDir ? t('tools.openDir') : t('tools.enableFirst')}
          >
            {icon ? (
              <img src={icon} alt={tool.displayName || tool.toolName} style={{ width: 24, height: 24 }} className="rounded object-contain" />
            ) : (
              <Wrench style={{ width: 20, height: 20, color: 'var(--c-text-faint)' }} />
            )}
            {canOpenDir && (
              <div
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 14,
                  height: 14,
                  borderRadius: 4,
                  background: 'var(--c-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid var(--c-bg-card)',
                }}
              >
                <FolderOpen style={{ width: 7, height: 7, color: '#fff' }} />
              </div>
            )}
          </button>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{tool.displayName || tool.toolName}</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {tool.isDetected ? (
                <CheckCircle2 style={{ width: 12, height: 12, color: 'var(--c-green)' }} />
              ) : (
                <XCircle style={{ width: 12, height: 12, color: 'var(--c-text-faint)' }} />
              )}
              <span style={{ fontSize: 10, color: tool.isDetected ? 'var(--c-green)' : 'var(--c-text-faint)' }}>
                {tool.isDetected ? t('tools.detectedLabel') : t('tools.notDetected')}
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={handleToggle}
          className={showToggleOn ? 'toggle-on' : 'toggle-off'}
          style={!canEnable ? { opacity: 0.35, cursor: 'not-allowed', pointerEvents: 'auto' } : undefined}
          title={!canEnable ? t('tools.detectFirst') : undefined}
        />
      </div>

      <div className="space-y-2">
        <PathRow
          icon={<FolderOpen style={{ width: 13, height: 13, color: 'var(--c-accent)' }} className="shrink-0" />}
          path={tool.skillDir || '—'}
          label={t('tools.skillDir')}
          enabled={canOpenDir && !!tool.skillDir}
          onOpen={() => tool.skillDir && handleOpenDir(tool.skillDir)}
        />
        <PathRow
          icon={<FileText style={{ width: 13, height: 13, color: 'var(--c-violet)' }} className="shrink-0" />}
          path={tool.mcpDir || '—'}
          label={t('tools.mcpDir')}
          enabled={canOpenDir && !!tool.mcpDir}
          onOpen={() => tool.mcpDir && handleOpenDir(tool.mcpDir)}
        />
      </div>
    </div>
  )
}

function PathRow({ icon, path, label, enabled, onOpen }: { icon: React.ReactNode; path: string; label: string; enabled: boolean; onOpen: () => void }) {
  return (
    <div
      className="flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors"
      style={{
        background: enabled ? 'var(--c-bg-input)' : 'var(--c-bg-elevated)',
        opacity: enabled ? 1 : 0.6,
        cursor: enabled ? 'pointer' : 'not-allowed',
      }}
      onMouseEnter={(e) => { if (enabled) e.currentTarget.style.background = 'var(--c-bg-elevated)' }}
      onMouseLeave={(e) => { if (enabled) e.currentTarget.style.background = 'var(--c-bg-input)' }}
      onClick={enabled ? onOpen : undefined}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <span style={{ fontSize: 9, color: 'var(--c-text-faint)', letterSpacing: '0.05em', fontWeight: 600 }} className="uppercase">{label}</span>
        <p style={{ fontSize: 11, color: enabled ? 'var(--c-text-secondary)' : 'var(--c-text-faint)', fontFamily: 'monospace' }} className="truncate leading-relaxed">{path}</p>
      </div>
      {enabled ? (
        <ExternalLink style={{ width: 12, height: 12, color: 'var(--c-text-faint)', flexShrink: 0 }} />
      ) : (
        <FolderLock style={{ width: 12, height: 12, color: 'var(--c-text-faint)', flexShrink: 0 }} />
      )}
    </div>
  )
}
