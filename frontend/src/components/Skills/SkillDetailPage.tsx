import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { wailsApi } from '@/services/wailsBridge'
import { CopyableField } from '@/components/Field'
import { TagList } from '@/components/Field'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Star,
  GitFork,
  Circle,
  ExternalLink,
  FolderOpen,
  FileText,
  Shield,
  Download,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Tag,
  Globe,
  Code2,
  Wrench,
  Package,
  Hash,
  ChevronRight,
  RefreshCw,
  Loader2,
  GitCommit,
  BellDot,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import SkillDiffModal from './SkillDiffModal'
import { useSkillStore } from '@/stores/skillStore'
import { SkillIcon } from './SkillIcon'
import { SkillStatusBadge } from './SkillStatusBadge'
import { getToolIconByName } from './utils'
import { Skeleton, SkeletonCard } from '@/components/Loading'
const Markdown = ReactMarkdown as any

type DetailTab = 'overview' | 'readme' | 'locations' | 'verify'

interface SkillDetailData {
  skill: {
    id: string
    name: string
    description: string
    version: string
    sourceId: string
    installPath: string
    gitUrl: string
    gitBranch: string
    gitCommit: string
    status: string
    enabledTools: string[]
    tags: string[]
    metadata: Record<string, any>
    createdAt: string
    updatedAt: string
  }
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
}

interface SkillDetailPageProps {
  skillId: string
  onBack: () => void
}

const toolIcons: Record<string, { color: string; label: string }> = {
  claude: { color: '#D97757', label: 'Claude' },
  codex: { color: '#10A37F', label: 'Codex' },
  gemini: { color: '#4285F4', label: 'Gemini' },
  cursor: { color: '#7C3AED', label: 'Cursor' },
  windsurf: { color: '#0EA5E9', label: 'Windsurf' },
  custom: { color: '#6B7280', label: 'Custom' },
}

const tabConfig: { key: DetailTab; labelKey: string; icon: typeof FileText }[] = [
  { key: 'overview', labelKey: 'detail.tabOverview', icon: Globe },
  { key: 'readme', labelKey: 'detail.tabReadme', icon: FileText },
  { key: 'locations', labelKey: 'detail.tabLocations', icon: FolderOpen },
  { key: 'verify', labelKey: 'detail.tabVerify', icon: Shield },
]

export default function SkillDetailPage({ skillId, onBack }: SkillDetailPageProps) {
  const { t } = useTranslation()
  const [detail, setDetail] = useState<SkillDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<DetailTab>('overview')
  const [diffOpen, setDiffOpen] = useState(false)
  const versionDiffs = useSkillStore((s) => s.versionDiffs)
  const skillFromStore = useSkillStore((s) => s.skills.find((sk) => sk.id === skillId))

  const loadDetail = useCallback(async () => {
    setLoading(true)
    setError(null)
    const resp = await wailsApi.getSkillDetail(skillId)
    if (resp.success && resp.data) {
      setDetail(resp.data as SkillDetailData)
    } else {
      setError(resp.error ?? 'Failed to load skill detail')
      if (skillFromStore) {
        setDetail({
          skill: skillFromStore,
          content: skillFromStore.description || '',
          contentHash: '',
          relatedFiles: [],
          installLocations: [],
        })
      }
    }
    setLoading(false)
  }, [skillId, skillFromStore])

  useEffect(() => {
    loadDetail()
  }, [loadDetail])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      const d = new Date(dateStr)
      return d.toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    } catch {
      return dateStr
    }
  }

  const formatNumber = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
    return String(n)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <div className="shrink-0 px-5 py-3" style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}>
          <Skeleton width={60} height={14} style={{ marginBottom: 12 }} />
          <div className="flex items-start gap-4">
            <Skeleton width={56} height={56} borderRadius={12} />
            <div className="flex-1 space-y-2">
              <Skeleton width="40%" height={18} />
              <Skeleton width="70%" height={10} />
              <div className="flex gap-2">
                <Skeleton width={60} height={22} borderRadius={4} />
                <Skeleton width={80} height={22} borderRadius={4} />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          <div className="grid gap-5" style={{ gridTemplateColumns: '1fr 280px' }}>
            <div className="space-y-4">
              <SkeletonCard rows={4} />
              <SkeletonCard rows={6} />
            </div>
            <div className="space-y-4">
              <SkeletonCard rows={3} />
              <SkeletonCard rows={2} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <XCircle style={{ width: 40, height: 40, color: 'var(--c-red)' }} />
        <p style={{ color: 'var(--c-text-muted)', fontSize: 13, fontWeight: 600 }}>{t('detail.loadFailed', 'Failed to load skill detail')}</p>
        {error && (
          <p style={{ color: 'var(--c-text-faint)', fontSize: 11, maxWidth: 400, textAlign: 'center', lineHeight: 1.5 }}>{error}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <button
            className="ghost-button"
            onClick={loadDetail}
            style={{ color: 'var(--c-accent)', fontSize: 12, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', background: 'var(--c-accent-soft)', border: '1px solid var(--c-border)' }}
          >
            <RefreshCw style={{ width: 12, height: 12, marginRight: 4 }} />
            {t('detail.retry', 'Retry')}
          </button>
          <button
            className="ghost-button"
            onClick={onBack}
            style={{ color: 'var(--c-text-muted)', fontSize: 12, padding: '6px 14px', borderRadius: 6, cursor: 'pointer', background: 'transparent', border: '1px solid var(--c-border)' }}
          >
            ‹ {t('detail.back', 'Back')}
          </button>
        </div>
      </div>
    )
  }

  const { skill, content, contentHash, relatedFiles, installLocations, gitInfo } = detail
  const installedCount = installLocations.filter((l) => l.installed).length
  const totalLocations = installLocations.length

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {error && (
        <div
          className="shrink-0 flex items-center gap-2 px-5 py-2"
          style={{ background: 'rgba(220, 38, 38, 0.08)', borderBottom: '1px solid rgba(220, 38, 38, 0.2)' }}
        >
          <XCircle style={{ width: 13, height: 13, color: 'var(--c-red)', flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: 'var(--c-red)', flex: 1 }}>{error}</span>
          <button
            onClick={loadDetail}
            style={{ fontSize: 10, color: 'var(--c-red)', background: 'transparent', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: 4, padding: '2px 8px', cursor: 'pointer' }}
          >
            {t('detail.retry', 'Retry')}
          </button>
        </div>
      )}
      {/* Header */}
      <div
        className="shrink-0 px-5 py-3"
        style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-[12px] font-medium transition-colors"
            style={{ color: 'var(--c-text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-muted)' }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            {t('detail.back', 'Back')}
          </button>
        </div>

        {/* Hero Section */}
        <div className="flex items-start gap-4">
          <SkillIcon
            iconUrl={skill.metadata?.iconUrl as string}
            iconEmoji={skill.metadata?.iconEmoji as string}
            iconBackground={skill.metadata?.iconBackground as string}
            name={skill.name}
            size="lg"
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--c-text)', margin: 0 }}>{skill.name}</h2>
              {skill.version && (
                <span
                  style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-accent)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: 999 }}
                >
                  v{skill.version}
                </span>
              )}
              <SkillStatusBadge status={skill.status} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 4, lineHeight: 1.5, margin: '4px 0 0' }}>
              {skill.description || gitInfo?.description || t('detail.noDesc', 'No description')}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <TagList tags={skill.tags || []} size="xs" />
              {gitInfo && (
                <>
                  <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                    <Star style={{ width: 11, height: 11, color: '#F59E0B' }} />
                    {formatNumber(gitInfo.stars)}
                  </span>
                  <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                    <GitFork style={{ width: 11, height: 11 }} />
                    {formatNumber(gitInfo.forks)}
                  </span>
                  {gitInfo.license && (
                    <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                      📄 {gitInfo.license}
                    </span>
                  )}
                  {gitInfo.language && (
                    <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                      <Circle style={{ width: 7, height: 7, fill: 'var(--c-accent)' }} />
                      {gitInfo.language}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(skill.status === 'update_available' || versionDiffs[skillId]?.hasUpdate) && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                style={{ color: 'var(--c-amber)', background: 'var(--c-amber-soft)', border: '1px solid rgba(245, 158, 11, 0.2)', cursor: 'pointer' }}
                onClick={() => setDiffOpen(true)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(245, 158, 11, 0.15)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-amber-soft)' }}
              >
                <BellDot style={{ width: 12, height: 12 }} className="animate-pulse" />
                {t('detail.hasUpdate', 'Update Available')}
              </button>
            )}
            {skill.gitUrl && (
              <a
                href={skill.gitUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                style={{ color: 'var(--c-text-muted)', background: 'var(--c-bg-input)', border: '1px solid var(--c-border)', textDecoration: 'none' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--c-accent)'; e.currentTarget.style.color = 'var(--c-accent)' }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.color = 'var(--c-text-muted)' }}
              >
                <Code2 style={{ width: 12, height: 12 }} />
                GitHub
              </a>
            )}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{ color: '#fff', background: 'var(--c-accent)', border: 'none', cursor: 'pointer' }}
              onClick={() => wailsApi.openInExplorer(skill.installPath)}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
            >
              <FolderOpen style={{ width: 12, height: 12 }} />
              {t('detail.openFolder', 'Open folder')}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4" style={{ borderBottom: '1px solid var(--c-border)', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20 }}>
          {tabConfig.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors"
                style={{
                  color: isActive ? 'var(--c-accent)' : 'var(--c-text-faint)',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--c-accent)' : '2px solid transparent',
                  cursor: 'pointer',
                  marginBottom: -1,
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--c-text-secondary)' }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = 'var(--c-text-faint)' }}
              >
                <Icon style={{ width: 13, height: 13 }} />
                {t(tab.labelKey, tab.labelKey.split('.').pop() ?? tab.key)}
              </button>
            )
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === 'overview' && <OverviewTab detail={detail} formatDate={formatDate} formatNumber={formatNumber} installedCount={installedCount} totalLocations={totalLocations} />}
            {activeTab === 'readme' && <ReadmeTab content={gitInfo?.readme || content} />}
            {activeTab === 'locations' && <LocationsTab locations={installLocations} skillPath={skill.installPath} skillId={skill.id} onRefresh={loadDetail} />}
            {activeTab === 'verify' && <VerifyTab contentHash={contentHash} relatedFiles={relatedFiles} installLocations={installLocations} />}
          </motion.div>
        </AnimatePresence>
      </div>
      <SkillDiffModal
        skillId={skillId}
        skillName={skill.name}
        open={diffOpen}
        onClose={() => setDiffOpen(false)}
      />
    </div>
  )
}

function OverviewTab({ detail, formatDate, formatNumber, installedCount, totalLocations }: {
  detail: SkillDetailData
  formatDate: (d: string) => string
  formatNumber: (n: number) => string
  installedCount: number
  totalLocations: number
}) {
  const { t } = useTranslation()
  const { skill, gitInfo, installLocations, relatedFiles } = detail

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr 340px' }}>
      {/* Main Column */}
      <div className="space-y-4">
        {/* Summary Card */}
        <div className="glass-card p-4">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 12px' }}>{t('detail.overview', 'Overview')}</h3>
          <div className="space-y-4">
            <div>
              <strong style={{ display: 'block', fontSize: 12, color: 'var(--c-text)', marginBottom: 6 }}>{t('detail.useCases', 'Use Cases')}</strong>
              <p style={{ fontSize: 12, color: 'var(--c-text-secondary)', lineHeight: 1.6, margin: 0 }}>
                {skill.description || gitInfo?.description || t('detail.enhanceAI', 'Enhance specific capabilities of AI coding assistants.')}
              </p>
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: 12, color: 'var(--c-text)', marginBottom: 6 }}>{t('detail.howToUse', 'How to Use')}</strong>
              <ul style={{ fontSize: 12, color: 'var(--c-text-secondary)', lineHeight: 1.8, margin: 0, paddingLeft: 18 }}>
                <li>{t('detail.howTo1', 'View the full content and verification info.')}</li>
                <li>{t('detail.howTo2', 'Manage installation locations across platforms.')}</li>
                <li>{t('detail.howTo3', 'Check which apps it has been synced to.')}</li>
                <li>{t('detail.howTo4', 'View source code and updates on GitHub.')}</li>
              </ul>
            </div>
            {skill.tags && skill.tags.length > 0 && (
              <div>
                <strong style={{ display: 'block', fontSize: 12, color: 'var(--c-text)', marginBottom: 6 }}>{t('detail.tags', 'Tags')}</strong>
                <TagList tags={skill.tags} />
              </div>
            )}
            {skill.enabledTools && skill.enabledTools.length > 0 && (
              <div>
                <strong style={{ display: 'block', fontSize: 12, color: 'var(--c-text)', marginBottom: 6 }}>{t('detail.enabledPlatforms', 'Enabled Platforms')}</strong>
                <div className="flex flex-wrap gap-2">
                  {skill.enabledTools.map((tool) => {
                    const info = toolIcons[tool] || { color: '#6B7280', label: tool }
                    const brandIcon = getToolIconByName(info.label) || getToolIconByName(tool)
                    return (
                      <span
                        key={tool}
                        className="flex items-center gap-1.5"
                        style={{ fontSize: 11, color: info.color, background: `${info.color}10`, padding: '3px 10px', borderRadius: 999, border: `1px solid ${info.color}20` }}
                      >
                        {brandIcon ? (
                          <img src={brandIcon} alt={info.label} style={{ width: 12, height: 12 }} className="rounded-sm object-contain" />
                        ) : (
                          <Circle style={{ width: 6, height: 6, fill: info.color }} />
                        )}
                        {info.label}
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Files */}
        {relatedFiles && relatedFiles.length > 0 && (
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>{t('detail.relatedFiles', 'Related Files')}</h3>
              <span style={{ fontSize: 11, color: 'var(--c-text-faint)', background: 'var(--c-bg-input)', padding: '2px 8px', borderRadius: 6 }}>
                {relatedFiles.length} {t('detail.files', 'files')}
              </span>
            </div>
            <div className="space-y-1">
              {relatedFiles.map((file) => (
                <div
                  key={file}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg"
                  style={{ background: 'var(--c-bg-input)' }}
                >
                  <FileText style={{ width: 13, height: 13, color: 'var(--c-text-faint)', flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}>{file}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Side Column */}
      <div className="space-y-4">
        {/* Status Card */}
        <div className="glass-card p-4">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 12px' }}>{t('detail.currentStatus', 'Current Status')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('detail.installStatus', 'Install Status')}</span>
              <SkillStatusBadge status={skill.status} />
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('detail.locations', 'Locations')}</span>
              <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>
                {installedCount}/{totalLocations}
              </span>
            </div>
            {skill.gitBranch && (
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('detail.gitBranch', 'Git branch')}</span>
                <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}>{skill.gitBranch}</span>
              </div>
            )}
            {skill.gitCommit && (
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Git Commit</span>
                <span style={{ fontSize: 12, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}>{skill.gitCommit.slice(0, 8)}</span>
              </div>
            )}
          </div>
        </div>

        {/* GitHub Info */}
        {gitInfo && (
          <div className="glass-card p-4">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 12px' }}>{t('detail.githubRepo', 'GitHub Repository')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                  <Star style={{ width: 13, height: 13, color: '#F59E0B' }} />
                  Stars
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{formatNumber(gitInfo.stars)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                  <GitFork style={{ width: 13, height: 13 }} />
                  Forks
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{formatNumber(gitInfo.forks)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5" style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                  <Hash style={{ width: 13, height: 13 }} />
                  Issues
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{gitInfo.openIssues}</span>
              </div>
              {gitInfo.license && (
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>License</span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>{gitInfo.license}</span>
                </div>
              )}
              {gitInfo.lastUpdated && (
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('detail.lastUpdated', 'Last updated')}</span>
                  <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>{formatDate(gitInfo.lastUpdated)}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Basic Info */}
        <div className="glass-card p-4">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 12px' }}>{t('detail.basicInfo', 'Basic Info')}</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('detail.sourceType', 'Source type')}</span>
              <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>
                {skill.gitUrl ? t('detail.gitRepository', 'Git repository') : t('detail.localInstall', 'Local install')}
              </span>
            </div>
            {skill.version && (
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('detail.version', 'Version')}</span>
                <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>v{skill.version}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('detail.installedAt', 'Installed at')}</span>
              <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>{formatDate(skill.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{t('detail.updatedAt', 'Updated at')}</span>
              <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>{formatDate(skill.updatedAt)}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, color: 'var(--c-text-muted)', display: 'block', marginBottom: 4 }}>{t('detail.installDir', 'Install directory')}</span>
              <div
                className="flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-colors"
                style={{ background: 'var(--c-bg-input)' }}
                onClick={() => wailsApi.openInExplorer(skill.installPath)}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-elevated)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-bg-input)' }}
              >
                <FolderOpen style={{ width: 13, height: 13, color: 'var(--c-accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }} className="truncate">{skill.installPath}</span>
                <ExternalLink style={{ width: 11, height: 11, color: 'var(--c-text-faint)', flexShrink: 0, marginLeft: 'auto' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Compatible Apps */}
        <div className="glass-card p-4">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 12px' }}>{t('detail.compatibleApps', 'Compatible apps')}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            {installLocations.map((loc) => {
              const info = toolIcons[loc.icon] || toolIcons[loc.toolName] || { color: '#6B7280', label: loc.toolName }
              const brandIcon = getToolIconByName(info.label) || getToolIconByName(loc.toolName)
              return (
                <div
                  key={loc.toolName}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                  style={{ background: loc.installed ? `${info.color}10` : 'var(--c-bg-input)', border: `1px solid ${loc.installed ? `${info.color}20` : 'var(--c-border)'}` }}
                >
                  {brandIcon ? (
                    <img src={brandIcon} alt={info.label} style={{ width: 14, height: 14 }} className="rounded-sm object-contain" />
                  ) : (
                    <Circle style={{ width: 7, height: 7, fill: loc.installed ? info.color : 'var(--c-text-faint)' }} />
                  )}
                  <span style={{ fontSize: 11, color: loc.installed ? info.color : 'var(--c-text-faint)', fontWeight: 500 }}>{info.label}</span>
                </div>
              )
            })}
          </div>
          <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 8 }}>
            {t('detail.compatibleAppsCount', '{{count}} apps installed', { count: installedCount })}
          </p>
        </div>
      </div>
    </div>
  )
}

function ReadmeTab({ content }: { content: string }) {
  const { t } = useTranslation()

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <FileText style={{ width: 40, height: 40, color: 'var(--c-text-faint)' }} />
        <p style={{ color: 'var(--c-text-muted)', fontSize: 13 }}>{t('detail.noReadme', 'No README content')}</p>
      </div>
    )
  }

  return (
    <div className="glass-card p-5 max-w-3xl">
      <div className="markdown-body" style={{ color: 'var(--c-text)', lineHeight: 1.6, fontSize: 13 }}>
        <Markdown>{content}</Markdown>
      </div>
    </div>
  )
}

function LocationsTab({ locations, skillPath, skillId, onRefresh }: { locations: SkillDetailData['installLocations']; skillPath: string; skillId: string; onRefresh: () => void }) {
  const { t } = useTranslation()
  const installedCount = locations.filter((l) => l.installed).length
  const [syncing, setSyncing] = useState<string | null>(null)

  const handleInstall = async (toolName: string) => {
    setSyncing(toolName)
    await wailsApi.syncSkillToTool(skillId, toolName)
    setSyncing(null)
    onRefresh()
  }

  const handleRemove = async (toolName: string) => {
    setSyncing(toolName)
    await wailsApi.unsyncSkillFromTool(skillId, toolName)
    setSyncing(null)
    onRefresh()
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>{t('detail.locationManager', 'Installation locations')}</h3>
          <p style={{ fontSize: 11, color: 'var(--c-text-faint)', margin: '4px 0 0' }}>
            {t('detail.locationManagerDesc', 'Manage this skill across apps. Click an installed path to open its folder.')}
          </p>
        </div>
        <span style={{ fontSize: 11, color: 'var(--c-accent)', background: 'rgba(99, 102, 241, 0.1)', padding: '3px 10px', borderRadius: 999, fontWeight: 600 }}>
          {t('detail.locationInstalledCount', '{{installed}}/{{total}} installed', { installed: installedCount, total: locations.length })}
        </span>
      </div>

      <div className="space-y-2">
        {locations.map((loc) => {
          const info = toolIcons[loc.icon] || toolIcons[loc.toolName] || { color: '#6B7280', label: loc.toolName }
          const brandIcon = getToolIconByName(info.label) || getToolIconByName(loc.toolName)
          const isPrimary = loc.path === skillPath
          return (
            <motion.div
              key={loc.toolName + loc.path}
              className="glass-card p-4 flex items-center gap-3"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={isPrimary ? { borderLeft: `3px solid var(--c-accent)` } : undefined}
            >
              <div
                className="shrink-0 flex items-center justify-center rounded-lg"
                style={{ width: 36, height: 36, background: `${info.color}12` }}
              >
                {brandIcon ? (
                  <img src={brandIcon} alt={info.label} style={{ width: 20, height: 20 }} className="rounded object-contain" />
                ) : (
                  <Wrench style={{ width: 16, height: 16, color: info.color }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{info.label}</span>
                  {isPrimary && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--c-accent)', background: 'rgba(99, 102, 241, 0.1)', padding: '1px 6px', borderRadius: 4 }}>
                      {t('detail.primaryInstall', 'Primary')}
                    </span>
                  )}
                  {loc.installed ? (
                    <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-green)' }}>
                      <CheckCircle2 style={{ width: 11, height: 11 }} />
                      {t('detail.installed', 'Installed')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
                      <XCircle style={{ width: 11, height: 11 }} />
                      {t('detail.notInstalled', 'Not installed')}
                    </span>
                  )}
                </div>
                <div
                  className="flex items-center gap-2 mt-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{ background: 'var(--c-bg-input)' }}
                  onClick={() => loc.installed && wailsApi.openInExplorer(loc.path)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-elevated)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-bg-input)' }}
                >
                  <FolderOpen style={{ width: 12, height: 12, color: loc.installed ? 'var(--c-accent)' : 'var(--c-text-faint)', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }} className="truncate">{loc.path}</span>
                  {loc.installed && <ExternalLink style={{ width: 11, height: 11, color: 'var(--c-text-faint)', flexShrink: 0, marginLeft: 'auto' }} />}
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {loc.installed ? (
                  <button
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                    style={{ color: '#DC2626', background: 'rgba(220, 38, 38, 0.06)', border: '1px solid rgba(220, 38, 38, 0.15)', cursor: 'pointer' }}
                    disabled={syncing === loc.toolName}
                    onClick={() => handleRemove(loc.toolName)}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.12)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(220, 38, 38, 0.06)' }}
                  >
                    {syncing === loc.toolName ? <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" /> : <Trash2 style={{ width: 11, height: 11 }} />}
                    {t('detail.remove', 'Remove')}
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                    style={{ color: '#fff', background: 'var(--c-accent)', border: 'none', cursor: 'pointer' }}
                    disabled={syncing === loc.toolName}
                    onClick={() => handleInstall(loc.toolName)}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85' }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                  >
                    {syncing === loc.toolName ? <Loader2 style={{ width: 11, height: 11 }} className="animate-spin" /> : <Download style={{ width: 11, height: 11 }} />}
                    {t('detail.install', 'Install')}
                  </button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

function VerifyTab({ contentHash, relatedFiles, installLocations }: {
  contentHash: string
  relatedFiles: string[]
  installLocations: SkillDetailData['installLocations']
}) {
  const { t } = useTranslation()
  const safeLocations = installLocations ?? []
  const safeFiles = relatedFiles ?? []
  const installedLocations = safeLocations.filter((l) => l.installed && l.hash)

  return (
    <div className="max-w-2xl space-y-4">
      {/* Content Hash */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>{t('detail.contentVerify', 'Content verification')}</h3>
          <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--c-green)' }}>
            <Shield style={{ width: 13, height: 13 }} />
            {t('detail.md5Verify', 'MD5 verification')}
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <span style={{ fontSize: 11, color: 'var(--c-text-faint)', display: 'block', marginBottom: 4 }}>{t('detail.contentHash', 'SKILL.md content hash (MD5)')}</span>
            <CopyableField
              value={contentHash}
              displayValue={contentHash || t('detail.hashUnavailable', 'Unable to calculate')}
              icon={<Hash style={{ width: 13, height: 13, color: 'var(--c-accent)', flexShrink: 0 }} />}
            />
          </div>

          {installedLocations.length > 0 && (
            <div>
              <span style={{ fontSize: 11, color: 'var(--c-text-faint)', display: 'block', marginBottom: 6 }}>{t('detail.locationHashCompare', 'Install location hash comparison')}</span>
              <div className="space-y-1.5">
                {installedLocations.map((loc) => {
                  const info = toolIcons[loc.icon] || toolIcons[loc.toolName] || { color: '#6B7280', label: loc.toolName }
                  const brandIcon = getToolIconByName(info.label) || getToolIconByName(loc.toolName)
                  const hashMatch = !contentHash || loc.hash === contentHash
                  return (
                    <div
                      key={loc.toolName}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: 'var(--c-bg-input)' }}
                    >
                      {brandIcon ? (
                        <img src={brandIcon} alt={info.label} style={{ width: 14, height: 14, flexShrink: 0 }} className="rounded-sm object-contain" />
                      ) : (
                        <Circle style={{ width: 7, height: 7, fill: hashMatch ? 'var(--c-green)' : '#DC2626', flexShrink: 0 }} />
                      )}
                      <span style={{ fontSize: 11, color: info.color, fontWeight: 500, width: 60 }}>{info.label}</span>
                      <span style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }} className="truncate flex-1">{loc.hash}</span>
                      {hashMatch ? (
                        <CheckCircle2 style={{ width: 13, height: 13, color: 'var(--c-green)', flexShrink: 0 }} />
                      ) : (
                        <span style={{ fontSize: 10, color: '#DC2626', fontWeight: 600, flexShrink: 0 }}>{t('detail.hashMismatch', 'Mismatch')}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* File Integrity */}
      <div className="glass-card p-4">
        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: '0 0 12px' }}>{t('detail.fileIntegrity', 'File integrity')}</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--c-bg-input)' }}>
            <span className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>
              <FileText style={{ width: 13, height: 13, color: 'var(--c-accent)' }} />
              SKILL.md
            </span>
            <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--c-green)' }}>
              <CheckCircle2 style={{ width: 12, height: 12 }} />
              {t('detail.exists', 'Exists')}
            </span>
          </div>
          {safeFiles.map((file) => (
            <div key={file} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ background: 'var(--c-bg-input)' }}>
              <span className="flex items-center gap-2" style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>
                <FileText style={{ width: 13, height: 13, color: 'var(--c-text-faint)' }} />
                {file}
              </span>
              <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: 'var(--c-green)' }}>
                <CheckCircle2 style={{ width: 12, height: 12 }} />
                {t('detail.exists', 'Exists')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
