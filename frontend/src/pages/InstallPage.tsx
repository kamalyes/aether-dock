import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useSkillStore } from '@/stores/skillStore'
import { useMcpStore } from '@/stores/mcpStore'
import { wailsApi } from '@/services/wailsBridge'
import {
  GitBranch,
  FolderOpen,
  ShoppingBag,
  Star,
  Server,
  Terminal,
  Plus,
  ExternalLink,
  Loader2,
  Download,
  Upload as UploadIcon,
  FolderSync,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Input, SearchInput, Select } from '@/components/Input'
import { Loading, ListLoading } from '@/components/Loading'
import { Upload as UploadComp } from '@/components/Upload'

type InstallTab = 'marketplace' | 'git' | 'local' | 'mcp' | 'import-export'

interface MarketplaceItem {
  id: string
  name: string
  description: string
  author: string
  url: string
  stars: number
  type: string
  category: string
}

export default function InstallPage() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const initialTab = (searchParams.get('tab') as InstallTab) || 'marketplace'
  const [activeTab, setActiveTab] = useState<InstallTab>(initialTab)

  const [gitUrl, setGitUrl] = useState('')
  const [gitBranch, setGitBranch] = useState('main')
  const [gitName, setGitName] = useState('')
  const [branches, setBranches] = useState<string[]>([])
  const [branchesLoading, setBranchesLoading] = useState(false)
  const [localPath, setLocalPath] = useState('')
  const [localName, setLocalName] = useState('')
  const [marketQuery, setMarketQuery] = useState('')
  const [installing, setInstalling] = useState(false)

  const [mcpName, setMcpName] = useState('')
  const [mcpCommand, setMcpCommand] = useState('')
  const [mcpArgs, setMcpArgs] = useState('')
  const [mcpDesc, setMcpDesc] = useState('')

  const [marketSkills, setMarketSkills] = useState<MarketplaceItem[]>([])
  const [marketMcp, setMarketMcp] = useState<MarketplaceItem[]>([])
  const [marketLoading, setMarketLoading] = useState(false)
  const [marketError, setMarketError] = useState<string | null>(null)
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')

  const categories = [
    { key: 'all', label: t('install.all') },
    { key: 'coding', label: t('install.coding') },
    { key: 'writing', label: t('install.writing') },
    { key: 'analysis', label: t('install.analysis') },
    { key: 'automation', label: t('install.automation') },
    { key: 'devops', label: t('install.devops') },
    { key: 'data', label: t('install.data') },
  ]

  const [importZipPath, setImportZipPath] = useState('')
  const [importTarget, setImportTarget] = useState('')
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [detailItem, setDetailItem] = useState<MarketplaceItem | null>(null)
  const [installError, setInstallError] = useState<string | null>(null)

  const { installFromGit, installFromLocal, skills, installStatus, installLog, clearInstallLog } = useSkillStore()
  const { addServer } = useMcpStore()

  const tabs: { key: InstallTab; icon: typeof GitBranch; label: string }[] = [
    { key: 'marketplace', icon: ShoppingBag, label: t('install.fromMarket') },
    { key: 'git', icon: GitBranch, label: t('install.fromGit') },
    { key: 'local', icon: FolderOpen, label: t('install.fromLocal') },
    { key: 'mcp', icon: Server, label: t('install.mcpServer') },
    { key: 'import-export', icon: FolderSync, label: t('install.importExport') },
  ]

  const parseGitUrl = (url: string) => {
    let owner = ''
    let repo = ''
    let httpsUrl = url

    const sshMatch = url.match(/^git@([^:]+):([^/]+)\/(.+?)(?:\.git)?$/)
    if (sshMatch) {
      const host = sshMatch[1]
      owner = sshMatch[2]
      repo = sshMatch[3]
      httpsUrl = `https://${host}/${owner}/${repo}`
    } else {
      const httpsMatch = url.match(/(?:https?:\/\/|git:\/\/)([^/]+)\/([^/]+)\/(.+?)(?:\.git)?$/)
      if (httpsMatch) {
        owner = httpsMatch[2]
        repo = httpsMatch[3]
      } else {
        const shorthand = url.match(/^([^/]+)\/([^/]+)$/)
        if (shorthand) {
          owner = shorthand[1]
          repo = shorthand[2]
          httpsUrl = `https://github.com/${owner}/${repo}`
        }
      }
    }

    return { owner, repo, httpsUrl }
  }

  const fetchBranches = useCallback(async (url: string) => {
    const { owner, repo } = parseGitUrl(url)
    if (!owner || !repo) return

    setBranchesLoading(true)
    try {
      const resp = await wailsApi.listGitBranches(owner, repo)
      if (resp.success && resp.data) {
        const branchList = resp.data as string[]
        setBranches(branchList)
        if (branchList.length > 0 && !branchList.includes(gitBranch)) {
          const mainBranch = branchList.find(b => b === 'main' || b === 'master')
          if (mainBranch) setGitBranch(mainBranch)
        }
      }
    } catch {
      setBranches([])
    }
    setBranchesLoading(false)
  }, [gitBranch])

  useEffect(() => {
    if (gitUrl && (gitUrl.includes('github.com') || gitUrl.startsWith('git@'))) {
      const timer = setTimeout(() => fetchBranches(gitUrl), 800)
      return () => clearTimeout(timer)
    } else {
      setBranches([])
    }
  }, [gitUrl, fetchBranches])

  const searchMarketplace = useCallback(async (query: string) => {
    setMarketLoading(true)
    setMarketError(null)
    try {
      const [skillResp, mcpResp] = await Promise.all([
        wailsApi.searchMarketplace(query),
        wailsApi.searchMcpMarketplace(query),
      ])
      if (skillResp.success && skillResp.data?.skills) {
        setMarketSkills(skillResp.data.skills)
      }
      if (mcpResp.success && mcpResp.data?.skills) {
        setMarketMcp(mcpResp.data.skills)
      }
      if (!skillResp.success && !mcpResp.success) {
        setMarketError(skillResp.error || mcpResp.error || t('install.searchFailed'))
      }
    } catch (e) {
      setMarketError(String(e))
    }
    setMarketLoading(false)
  }, [t])

  useEffect(() => {
    searchMarketplace('')
  }, [searchMarketplace])

  useEffect(() => {
    const timer = setTimeout(() => {
      searchMarketplace(marketQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [marketQuery, searchMarketplace])

  const handleMarketInstall = async (item: MarketplaceItem) => {
    setInstallingId(item.id)
    if (item.type === 'mcp') {
      await addServer(item.name, 'npx', [], {}, item.description)
    } else {
      await installFromGit(item.url, 'main', '', '')
    }
    setInstallingId(null)
  }

  const handleGitInstall = async () => {
    if (!gitUrl) return
    setInstalling(true)
    setInstallError(null)
    const { httpsUrl } = parseGitUrl(gitUrl)
    const ok = await installFromGit(httpsUrl || gitUrl, gitBranch, gitName, '')
    setInstalling(false)
    if (ok) {
      navigate('/')
    } else {
      setInstallError(t('install.gitFailed'))
    }
  }

  const handleLocalInstall = async () => {
    if (!localPath) return
    setInstalling(true)
    setInstallError(null)
    const ok = await installFromLocal(localPath, localName, '')
    setInstalling(false)
    if (ok) {
      navigate('/')
    } else {
      setInstallError(t('install.localFailed'))
    }
  }

  const handleMcpAdd = async () => {
    if (!mcpName || !mcpCommand) return
    setInstalling(true)
    setInstallError(null)
    try {
      await addServer(mcpName, mcpCommand, mcpArgs ? mcpArgs.split(/\s+/) : [], {}, mcpDesc)
      setInstalling(false)
      navigate('/mcp')
    } catch (e) {
      setInstalling(false)
      setInstallError(String(e))
    }
  }

  const handleImport = async () => {
    if (!importZipPath) return
    setImporting(true)
    const resp = await wailsApi.importSkillsZip({
      zipPath: importZipPath,
      targetRoot: importTarget,
    })
    setImporting(false)
    if (resp.success && resp.data) {
      navigate('/skills')
    }
  }

  const handleExport = async () => {
    if (skills.length === 0) return
    setExporting(true)
    const exportSkills = skills
      .filter((s) => s.installPath)
      .map((s) => ({
        skillId: s.id,
        sourceSkillPath: s.installPath,
      }))
    if (exportSkills.length === 0) {
      setExporting(false)
      return
    }
    const saveResp = await wailsApi.saveFile(`aether-dock-export-${exportSkills.length}-skills.zip`)
    if (!saveResp.success || !saveResp.data) {
      setExporting(false)
      return
    }
    await wailsApi.exportSkillsZip({
      outputPath: saveResp.data,
      skills: exportSkills,
    })
    setExporting(false)
  }

  const { owner, repo } = parseGitUrl(gitUrl)

  return (
    <div className="flex h-full flex-col">
      <div
        className="flex items-center justify-between px-5 py-2.5 shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg-panel)' }}
      >
        <div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)' }}>{t('install.title')}</h2>
          <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 2 }}>{t('install.subtitle')}</p>
        </div>
      </div>

      <div className="px-5 py-2.5 shrink-0" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <div
          className="flex gap-0.5 rounded-lg p-[3px] w-fit"
          style={{ background: 'var(--c-bg-input)' }}
        >
          {tabs.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex items-center gap-1.5 px-3.5 py-[6px] rounded-md text-[11px] font-medium transition-all duration-150"
              style={{
                background: activeTab === key ? 'var(--c-bg-card)' : 'transparent',
                color: activeTab === key ? 'var(--c-text)' : 'var(--c-text-faint)',
                boxShadow: activeTab === key ? '0 1px 3px rgba(15, 23, 42, 0.08)' : 'none',
              }}
            >
              <Icon style={{ width: 14, height: 14 }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {activeTab === 'marketplace' && (
          <div>
            <div className="mb-4 max-w-md">
              <SearchInput
                value={marketQuery}
                onChange={setMarketQuery}
                placeholder={t('install.searchMarket')}
              />
            </div>

            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => setCategoryFilter(cat.key)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-medium transition-all duration-150"
                  style={{
                    background: categoryFilter === cat.key ? 'var(--c-accent-soft)' : 'rgba(15, 23, 42, 0.03)',
                    color: categoryFilter === cat.key ? 'var(--c-accent)' : 'var(--c-text-faint)',
                    border: categoryFilter === cat.key ? '1px solid rgba(35, 99, 235, 0.15)' : '1px solid transparent',
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {marketLoading && <ListLoading mode="skeleton" count={4} />}

            {!marketLoading && marketSkills.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2 px-0.5">
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.1em' }} className="uppercase">{t('install.skills')}</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--c-border)' }} />
                  <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>{marketSkills.filter(s => categoryFilter === 'all' || s.category === categoryFilter).length} {t('install.results')}</span>
                </div>
                <div className="space-y-1.5">
                  {marketSkills
                    .filter(s => categoryFilter === 'all' || s.category === categoryFilter)
                    .map((skill) => (
                    <MarketplaceCard
                      key={skill.id}
                      item={skill}
                      installing={installingId === skill.id}
                      onInstall={() => handleMarketInstall(skill)}
                      onViewDetail={() => setDetailItem(skill)}
                    />
                  ))}
                </div>
              </div>
            )}

            {!marketLoading && marketMcp.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2 px-0.5">
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.1em' }} className="uppercase">{t('install.mcpServers')}</span>
                  <div className="flex-1 h-px" style={{ background: 'var(--c-border)' }} />
                  <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>{marketMcp.length} {t('install.results')}</span>
                </div>
                <div className="space-y-1.5">
                  {marketMcp.map((item) => (
                    <MarketplaceCard
                      key={item.id}
                      item={item}
                      installing={installingId === item.id}
                      onInstall={() => handleMarketInstall(item)}
                      onViewDetail={() => setDetailItem(item)}
                    />
                  ))}
                </div>
              </div>
            )}

            {!marketLoading && marketError && (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle style={{ width: 36, height: 36, color: 'var(--c-red)', marginBottom: 12 }} />
                <p style={{ color: 'var(--c-text-muted)', fontSize: 13, fontWeight: 500 }}>{t('install.searchFailed')}</p>
                <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4, maxWidth: 300, textAlign: 'center' }}>{marketError}</p>
                <button
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
                  style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
                  onClick={() => searchMarketplace(marketQuery)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(35, 99, 235, 0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-accent-soft)' }}
                >
                  <RefreshCw style={{ width: 12, height: 12 }} />
                  {t('install.retry')}
                </button>
              </div>
            )}

            {!marketLoading && !marketError && marketSkills.length === 0 && marketMcp.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <ShoppingBag style={{ width: 36, height: 36, color: 'var(--c-text-faint)', marginBottom: 12 }} />
                <p style={{ color: 'var(--c-text-muted)', fontSize: 13, fontWeight: 500 }}>No results found</p>
                <p style={{ color: 'var(--c-text-faint)', fontSize: 11, marginTop: 4 }}>Try a different search term</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'git' && (
          <div className="max-w-lg">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch style={{ width: 16, height: 16, color: 'var(--c-text-muted)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t('install.fromGit')}</h3>
              </div>
              <div className="space-y-3">
                <Input
                  label={t('install.gitUrl')}
                  value={gitUrl}
                  onChange={(e) => setGitUrl(e.target.value)}
                  placeholder="https://github.com/user/skill-repo"
                  monospace
                  hint={owner && repo ? `→ ${owner}/${repo}` : t('install.urlHint')}
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    {branches.length > 0 ? (
                      <Select
                        label={t('install.branch')}
                        value={gitBranch}
                        onChange={(e) => setGitBranch(e.target.value)}
                        options={branches.map(b => ({ value: b, label: b }))}
                        selectStyle={{ fontFamily: 'monospace' }}
                      />
                    ) : (
                      <Input
                        label={t('install.branch')}
                        value={gitBranch}
                        onChange={(e) => setGitBranch(e.target.value)}
                        placeholder="main"
                        suffix={branchesLoading ? <Loader2 style={{ width: 12, height: 12 }} className="animate-spin" /> : undefined}
                      />
                    )}
                  </div>
                  <Input
                    label={t('install.skillName')}
                    value={gitName}
                    onChange={(e) => setGitName(e.target.value)}
                    placeholder={repo || 'Auto-detect'}
                  />
                </div>
                <button
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-medium transition-colors mt-2 disabled:opacity-50"
                  style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
                  disabled={installing || !gitUrl}
                  onClick={handleGitInstall}
                  onMouseEnter={(e) => { if (!installing && gitUrl) e.currentTarget.style.background = 'rgba(35, 99, 235, 0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-accent-soft)' }}
                >
                  {installing ? (
                    <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                  ) : (
                    <GitBranch style={{ width: 14, height: 14 }} />
                  )}
                  {installing ? t('install.installing') : t('install.cloneInstall')}
                </button>

                {installError && activeTab === 'git' && (
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                    style={{ background: 'var(--c-red-soft)', border: '1px solid rgba(239, 68, 68, 0.12)' }}
                  >
                    <AlertCircle style={{ width: 14, height: 14, color: 'var(--c-red)', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--c-red)', fontWeight: 500 }}>{t('install.failed')}</p>
                      <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 2 }}>{installError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {installLog.length > 0 && activeTab === 'git' && (
              <div className="mt-4 glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.1em' }} className="uppercase">{t('install.log')}</h4>
                  <button
                    className="text-[10px] transition-colors"
                    style={{ color: 'var(--c-text-faint)' }}
                    onClick={clearInstallLog}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text-muted)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
                  >
                    {t('install.clearLog')}
                  </button>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {installLog.map((entry, idx) => (
                    <div key={idx} className="flex items-start gap-2 px-2 py-1 rounded" style={{ background: entry.level === 'error' ? 'rgba(239, 68, 68, 0.04)' : 'transparent' }}>
                      <span style={{ fontSize: 9, color: 'var(--c-text-faint)', fontFamily: 'monospace', flexShrink: 0, marginTop: 1 }}>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </span>
                      <span style={{
                        fontSize: 10,
                        color: entry.level === 'error' ? 'var(--c-red)' : entry.level === 'success' ? 'var(--c-green)' : entry.level === 'warn' ? 'var(--c-amber)' : 'var(--c-text-muted)',
                        fontFamily: 'monospace',
                      }}>
                        {entry.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          }
            <div className="mt-4 glass-card p-4">
              <h4 style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.1em', marginBottom: 10 }} className="uppercase">{t('install.supportedHosts')}</h4>
              <div className="space-y-1.5">
                {[
                  { format: 'HTTPS', example: 'https://github.com/user/repo' },
                  { format: 'SSH', example: 'git@github.com:user/repo' },
                  { format: 'Shorthand', example: 'user/repo' },
                ].map(({ format, example }) => (
                  <div key={format} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--c-bg-input)' }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-faint)', width: 60 }}>{format}</span>
                    <code style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontFamily: 'monospace' }}>{example}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'local' && (
          <div className="max-w-lg">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <FolderOpen style={{ width: 16, height: 16, color: 'var(--c-amber)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t('install.fromLocal')}</h3>
              </div>
              <div className="space-y-3">
                <Input
                  label={t('install.localPath')}
                  value={localPath}
                  onChange={(e) => setLocalPath(e.target.value)}
                  placeholder="/path/to/skill-folder"
                  monospace
                  suffix={
                    <button
                      style={{ cursor: 'pointer', color: 'var(--c-text-faint)' }}
                      onClick={async () => {
                        const resp = await wailsApi.browseFolder()
                        if (resp.success && resp.data) setLocalPath(resp.data)
                      }}
                    >
                      <FolderOpen style={{ width: 14, height: 14 }} />
                    </button>
                  }
                />
                <Input
                  label={t('install.skillName')}
                  value={localName}
                  onChange={(e) => setLocalName(e.target.value)}
                  placeholder="my-skill"
                />
                <button
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-medium transition-colors mt-2 disabled:opacity-50"
                  style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
                  disabled={installing || !localPath}
                  onClick={handleLocalInstall}
                  onMouseEnter={(e) => { if (!installing && localPath) e.currentTarget.style.background = 'rgba(35, 99, 235, 0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-accent-soft)' }}
                >
                  {installing ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <FolderOpen style={{ width: 14, height: 14 }} />}
                  {installing ? t('install.importing') : t('install.importInstall')}
                </button>

                {installError && activeTab === 'local' && (
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                    style={{ background: 'var(--c-red-soft)', border: '1px solid rgba(239, 68, 68, 0.12)' }}
                  >
                    <AlertCircle style={{ width: 14, height: 14, color: 'var(--c-red)', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--c-red)', fontWeight: 500 }}>{t('install.failed')}</p>
                      <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 2 }}>{installError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'mcp' && (
          <div className="max-w-lg">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Server style={{ width: 16, height: 16, color: 'var(--c-text-muted)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t('install.addMcpServer')}</h3>
              </div>
              <div className="space-y-3">
                <Input
                  label="Server Name"
                  value={mcpName}
                  onChange={(e) => setMcpName(e.target.value)}
                  placeholder="my-mcp-server"
                />
                <Input
                  label="Command"
                  value={mcpCommand}
                  onChange={(e) => setMcpCommand(e.target.value)}
                  placeholder="npx"
                  monospace
                  prefix={<Terminal style={{ width: 12, height: 12 }} />}
                />
                <Input
                  label="Arguments"
                  value={mcpArgs}
                  onChange={(e) => setMcpArgs(e.target.value)}
                  placeholder="-y @modelcontextprotocol/server-filesystem /path"
                  monospace
                />
                <Input
                  label="Description (optional)"
                  value={mcpDesc}
                  onChange={(e) => setMcpDesc(e.target.value)}
                  placeholder="What this server does..."
                />
                <button
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-medium transition-colors mt-2 disabled:opacity-50"
                  style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
                  disabled={installing || !mcpName || !mcpCommand}
                  onClick={handleMcpAdd}
                  onMouseEnter={(e) => { if (!installing && mcpName && mcpCommand) e.currentTarget.style.background = 'rgba(35, 99, 235, 0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-accent-soft)' }}
                >
                  {installing ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Plus style={{ width: 14, height: 14 }} />}
                  {installing ? t('install.adding') : t('install.addServer')}
                </button>

                {installError && activeTab === 'mcp' && (
                  <div
                    className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                    style={{ background: 'var(--c-red-soft)', border: '1px solid rgba(239, 68, 68, 0.12)' }}
                  >
                    <AlertCircle style={{ width: 14, height: 14, color: 'var(--c-red)', flexShrink: 0, marginTop: 1 }} />
                    <div>
                      <p style={{ fontSize: 11, color: 'var(--c-red)', fontWeight: 500 }}>{t('install.failed')}</p>
                      <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 2 }}>{installError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 glass-card p-4">
              <div className="flex items-center justify-between mb-2.5">
                <h4 style={{ fontSize: 10, fontWeight: 600, color: 'var(--c-text-faint)', letterSpacing: '0.1em' }} className="uppercase">{t('install.mcpMarketplace')}</h4>
                <a
                  href="https://mcpmarket.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 transition-colors"
                  style={{ fontSize: 10, color: 'var(--c-text-faint)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-accent)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
                >
                  Browse <ExternalLink style={{ width: 10, height: 10 }} />
                </a>
              </div>
              <p style={{ fontSize: 11, color: 'var(--c-text-faint)', lineHeight: 1.5 }}>
                {t('install.mcpMarketplaceDesc')}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'import-export' && (
          <div className="max-w-lg space-y-4">
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <UploadIcon style={{ width: 16, height: 16, color: 'var(--c-green)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t('install.importZip')}</h3>
              </div>
              <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginBottom: 12, lineHeight: 1.5 }}>
                Import skills from a ZIP archive. Each skill folder should contain a SKILL.md file.
              </p>
              <div className="space-y-3">
                <UploadComp
                  label="ZIP File Path"
                  value={importZipPath}
                  onChange={setImportZipPath}
                  accept=".zip"
                  icon="zip"
                  placeholder="Select a ZIP file to import..."
                />
                <Input
                  label="Target Directory (optional)"
                  value={importTarget}
                  onChange={(e) => setImportTarget(e.target.value)}
                  placeholder="Default: ~/.aether-dock/skills"
                  monospace
                />
                <button
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-medium transition-colors mt-2 disabled:opacity-50"
                  style={{ background: 'var(--c-green-soft)', color: 'var(--c-green)' }}
                  disabled={importing || !importZipPath}
                  onClick={handleImport}
                  onMouseEnter={(e) => { if (!importing && importZipPath) e.currentTarget.style.background = 'rgba(5, 150, 105, 0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-green-soft)' }}
                >
                  {importing ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <UploadIcon style={{ width: 14, height: 14 }} />}
                  {importing ? t('install.importing') : t('install.import')}
                </button>
              </div>
            </div>

            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Download style={{ width: 16, height: 16, color: 'var(--c-accent)' }} />
                <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text)' }}>{t('install.exportSkills')}</h3>
              </div>
              <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginBottom: 12, lineHeight: 1.5 }}>
                Export all installed skills as a ZIP archive for backup or migration.
              </p>
              <div className="flex items-center gap-3 mb-4 px-3 py-2.5 rounded-lg" style={{ background: 'var(--c-bg-input)' }}>
                <span style={{ fontSize: 12, color: 'var(--c-text-secondary)' }}>
                  {skills.length} skill{skills.length !== 1 ? 's' : ''} available for export
                </span>
              </div>
              <button
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
                disabled={exporting || skills.length === 0}
                onClick={handleExport}
                onMouseEnter={(e) => { if (!exporting && skills.length > 0) e.currentTarget.style.background = 'rgba(35, 99, 235, 0.12)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-accent-soft)' }}
              >
                {exporting ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Download style={{ width: 14, height: 14 }} />}
                {exporting ? t('install.exporting') : t('install.exportAllSkills')}
              </button>
            </div>
          </div>
        )}
      </div>

      {detailItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
          onClick={() => setDetailItem(null)}
        >
          <div
            className="glass-card w-full max-w-lg mx-4 overflow-hidden"
            style={{ borderRadius: 12, maxHeight: '80vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="shrink-0 flex items-center justify-center"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: detailItem.type === 'mcp' ? 'var(--c-violet-soft)' : 'var(--c-accent-soft)',
                    color: detailItem.type === 'mcp' ? 'var(--c-violet)' : 'var(--c-accent)',
                  }}
                >
                  {detailItem.type === 'mcp' ? (
                    <Server style={{ width: 20, height: 20 }} />
                  ) : (
                    <GitBranch style={{ width: 20, height: 20 }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text)' }}>{detailItem.name}</h3>
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 4,
                        background: detailItem.type === 'mcp' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(35, 99, 235, 0.08)',
                        color: detailItem.type === 'mcp' ? '#8B5CF6' : '#2563EB',
                      }}
                    >
                      {detailItem.type === 'mcp' ? t('install.typeMcp') : t('install.typeSkill')}
                    </span>
                  </div>
                  {detailItem.author && (
                    <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 2 }}>{t('install.byAuthor', { author: detailItem.author })}</p>
                  )}
                </div>
                <button
                  onClick={() => setDetailItem(null)}
                  style={{ color: 'var(--c-text-faint)', cursor: 'pointer', padding: 4 }}
                  className="transition-colors"
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-text)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
                >
                  ✕
                </button>
              </div>

              {detailItem.description && (
                <p style={{ fontSize: 13, color: 'var(--c-text-secondary)', lineHeight: 1.6, marginBottom: 16 }}>
                  {detailItem.description}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {detailItem.category && detailItem.category !== 'uncategorized' && (
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 6, background: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
                    {detailItem.category}
                  </span>
                )}
                {detailItem.stars > 0 && (
                  <span style={{ fontSize: 10, fontWeight: 500, padding: '3px 10px', borderRadius: 6, background: 'rgba(245, 158, 11, 0.08)', color: '#D97706' }}>
                    ⭐ {detailItem.stars} {t('install.stars')}
                  </span>
                )}
              </div>

              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg" style={{ background: 'var(--c-bg-input)' }}>
                  <span style={{ fontSize: 10, color: 'var(--c-text-faint)', fontWeight: 600, width: 50 }}>{t('install.url')}</span>
                  <a
                    href={detailItem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 11, color: 'var(--c-accent)', fontFamily: 'monospace' }}
                    className="truncate flex-1"
                  >
                    {detailItem.url}
                  </a>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-medium transition-colors disabled:opacity-50"
                  style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
                  disabled={installingId === detailItem.id}
                  onClick={() => { handleMarketInstall(detailItem) }}
                  onMouseEnter={(e) => { if (installingId !== detailItem.id) e.currentTarget.style.background = 'rgba(35, 99, 235, 0.12)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-accent-soft)' }}
                >
                  {installingId === detailItem.id ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Download style={{ width: 14, height: 14 }} />}
                  {installingId === detailItem.id ? t('install.installing') : t('install.installBtn')}
                </button>
                <a
                  href={detailItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[11px] font-medium transition-colors"
                  style={{ background: 'rgba(15, 23, 42, 0.04)', color: 'var(--c-text-muted)', border: '1px solid var(--c-border)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.08)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(15, 23, 42, 0.04)' }}
                >
                  <ExternalLink style={{ width: 12, height: 12 }} />
                  {t('install.openInBrowser')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MarketplaceCard({
  item,
  installing,
  onInstall,
  onViewDetail,
}: {
  item: MarketplaceItem
  installing: boolean
  onInstall: () => void
  onViewDetail: () => void
}) {
  const { t } = useTranslation()
  return (
    <div
      className="glass-card-hover flex items-center gap-3 px-4 py-3 cursor-pointer"
      onClick={onViewDetail}
    >
      <div
        className="icon-box shrink-0"
        style={{
          background: item.type === 'mcp' ? 'var(--c-violet-soft)' : 'var(--c-accent-soft)',
          color: item.type === 'mcp' ? 'var(--c-violet)' : 'var(--c-accent)',
        }}
      >
        {item.type === 'mcp' ? (
          <Server style={{ width: 14, height: 14 }} />
        ) : (
          <GitBranch style={{ width: 14, height: 14 }} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)' }} className="truncate">{item.name}</span>
          {item.category && item.category !== 'uncategorized' && (
            <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(139, 92, 246, 0.08)', color: '#8B5CF6' }}>
              {item.category}
            </span>
          )}
          {item.author && (
            <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>{t('install.byAuthor', { author: item.author })}</span>
          )}
        </div>
        {item.description && (
          <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }} className="truncate">{item.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {item.stars > 0 && (
          <div className="flex items-center gap-1" style={{ color: 'var(--c-amber)' }}>
            <Star style={{ width: 11, height: 11, fill: 'var(--c-amber)' }} />
            <span style={{ fontSize: 10, fontWeight: 500 }}>{item.stars}</span>
          </div>
        )}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors"
          style={{ color: 'var(--c-text-faint)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--c-accent)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-faint)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink style={{ width: 12, height: 12 }} />
        </a>
        <button
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors disabled:opacity-50"
          style={{ background: 'var(--c-accent-soft)', color: 'var(--c-accent)' }}
          disabled={installing}
          onClick={(e) => { e.stopPropagation(); onInstall() }}
          onMouseEnter={(e) => { if (!installing) e.currentTarget.style.background = 'rgba(35, 99, 235, 0.12)' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--c-accent-soft)' }}
        >
          {installing ? <Loader2 style={{ width: 10, height: 10 }} className="animate-spin" /> : <Download style={{ width: 10, height: 10 }} />}
          {installing ? t('install.installingBtn') : t('install.installBtn')}
        </button>
      </div>
    </div>
  )
}
