import { AlertCircle, Download, ExternalLink, Loader2, RefreshCw, Star, Store } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { wailsApi } from '@/services/wailsBridge'
import { MetricTile } from '@/components/Card'
import { Pagination } from '@/components/Control'
import { SearchInput } from '@/components/Input'
import { SkeletonCard } from '@/components/Loading'

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

interface SkillMarketplacePanelProps {
  installedSkillNames: Set<string>
  installingIds: Set<string>
  onInstallSkill: (item: MarketplaceItem) => void
}

export function SkillMarketplacePanel({ installedSkillNames, installingIds, onInstallSkill }: SkillMarketplacePanelProps) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [skills, setSkills] = useState<MarketplaceItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pageSize = 12

  const load = useCallback(async (value: string, nextPage: number) => {
    setLoading(true)
    setError(null)
    try {
      const skillResp = await wailsApi.searchMarketplace(value, nextPage, pageSize)
      if (skillResp.success) {
        const data = skillResp.data as { skills?: MarketplaceItem[]; total?: number } | MarketplaceItem[] | undefined
        const nextSkills = Array.isArray(data) ? data : data?.skills ?? []
        setSkills(nextSkills)
        setTotal(Array.isArray(data) ? nextSkills.length : data?.total ?? nextSkills.length)
      } else {
        setError(skillResp.error || t('install.searchFailed'))
      }
    } catch (err) {
      setError(String(err))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load(query, page)
    }, 300)
    return () => window.clearTimeout(timer)
  }, [load, page, query])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  const categories = useMemo(() => {
    const values = new Set(skills.map((item) => item.category).filter(Boolean))
    return ['all', ...Array.from(values)]
  }, [skills])

  const filteredSkills = skills.filter((item) => category === 'all' || item.category === category)

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1fr) 280px' }}>
      <section className="space-y-4 min-w-0">
        <div
          className="glass-card p-4"
          style={{ background: 'linear-gradient(135deg, rgba(35,99,235,0.08), rgba(8,145,178,0.05))' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <span
                className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold"
                style={{ color: 'var(--c-accent)', background: 'var(--c-accent-soft)' }}
              >
                {t('skills.marketFeatured')}
              </span>
              <h2 style={{ fontSize: 20, fontWeight: 750, color: 'var(--c-text)', marginTop: 10 }}>
                {t('skills.marketTitle')}
              </h2>
              <p style={{ fontSize: 12, color: 'var(--c-text-muted)', marginTop: 5, maxWidth: 560 }}>
                {t('skills.marketDesc')}
              </p>
              {installingIds.size > 0 ? (
                <span
                  className="inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold"
                  style={{ color: 'var(--c-accent)', background: 'var(--c-accent-soft)', marginTop: 10 }}
                >
                  {t('skills.installing')} {installingIds.size}
                </span>
              ) : null}
            </div>
            <Store style={{ width: 58, height: 58, color: 'var(--c-accent)', opacity: 0.24 }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <SearchInput
            className="flex-1"
            value={query}
            onChange={handleQueryChange}
            placeholder={t('install.searchMarket')}
          />
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-medium"
            onClick={() => load(query, page)}
            style={{ color: 'var(--c-text-muted)', background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
            type="button"
          >
            <RefreshCw style={{ width: 14, height: 14 }} className={loading ? 'animate-spin' : ''} />
            {t('install.retry')}
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((item) => (
            <button
              key={item}
              className="rounded-lg px-2.5 py-1 text-[10px] font-semibold"
              onClick={() => setCategory(item)}
              style={{
                color: category === item ? 'var(--c-accent)' : 'var(--c-text-muted)',
                background: category === item ? 'var(--c-accent-soft)' : 'var(--c-bg-input)',
                border: category === item ? '1px solid var(--c-border-accent)' : '1px solid var(--c-border)',
              }}
              type="button"
            >
              {item === 'all' ? t('install.all') : item}
            </button>
          ))}
        </div>

        {error ? (
          <div className="glass-card p-5 flex items-center gap-3">
            <AlertCircle style={{ width: 20, height: 20, color: 'var(--c-red)' }} />
            <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>{error}</span>
          </div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonCard key={i} rows={3} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredSkills.map((item) => (
              <MarketSkillCard
                key={item.id}
                item={item}
                installed={isMarketplaceItemInstalled(item, installedSkillNames)}
                installing={installingIds.has(item.id)}
                onInstall={() => onInstallSkill(item)}
              />
            ))}
          </div>
        )}

        {!loading && !error && total > pageSize ? (
          <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
        ) : null}
      </section>

      <aside className="space-y-4 min-w-0">
        <section className="glass-card p-4">
          <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700 }}>{t('skills.marketStats')}</h3>
          <div className="grid gap-2 mt-3">
            <MetricTile label={t('skills.marketSkills')} value={total || skills.length} />
            <MetricTile label={t('install.installed')} value={skills.filter((item) => installedSkillNames.has(item.name.toLowerCase())).length} />
            <MetricTile label={t('skills.marketSources')} value={new Set(skills.map((item) => item.author)).size} />
          </div>
        </section>

        <section className="glass-card p-4">
          <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700 }}>{t('skills.marketFeatured')}</h3>
          <div className="space-y-2 mt-3">
            {filteredSkills.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-lg p-2" style={{ background: 'var(--c-bg-input)' }}>
                <p style={{ fontSize: 11, color: 'var(--c-text-secondary)', fontWeight: 650 }} className="truncate">
                  {item.name}
                </p>
                <p style={{ fontSize: 10, color: 'var(--c-text-faint)', marginTop: 2 }} className="truncate">
                  {item.author || item.category || '-'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </aside>
    </div>
  )
}

function isMarketplaceItemInstalled(item: MarketplaceItem, installedSkillNames: Set<string>): boolean {
  const keys = [
    item.name,
    item.url,
    item.name.split('/').pop(),
  ]
  return keys.some((key) => key ? installedSkillNames.has(key.toLowerCase()) : false)
}

function MarketSkillCard({
  item,
  installed,
  installing,
  onInstall,
}: {
  item: MarketplaceItem
  installed: boolean
  installing: boolean
  onInstall: () => void
}) {
  const { t } = useTranslation()
  return (
    <article className="glass-card p-4 min-w-0">
      <div className="flex items-start gap-3">
        <span className="icon-box icon-box-accent" style={{ width: 40, height: 40 }}>
          {item.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 style={{ fontSize: 13, color: 'var(--c-text)', fontWeight: 700 }} className="truncate">
              {item.name}
            </h3>
            {item.category ? (
              <span style={{ fontSize: 9, color: 'var(--c-green)', background: 'var(--c-green-soft)', padding: '2px 6px', borderRadius: 5 }}>
                {item.category}
              </span>
            ) : null}
          </div>
          <p style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 4, minHeight: 34 }} className="line-clamp-2">
            {item.description || t('skills.noDesc')}
          </p>
          <div className="flex items-center gap-3 mt-3">
            {item.author ? <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>{t('install.byAuthor', { author: item.author })}</span> : null}
            {item.stars ? (
              <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-amber)' }}>
                <Star style={{ width: 11, height: 11, fill: 'currentColor' }} />
                {item.stars}
              </span>
            ) : null}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-4">
        <button
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold disabled:opacity-55"
          disabled={installed || installing || !item.url}
          onClick={onInstall}
          style={{ color: installed ? 'var(--c-green)' : '#fff', background: installed ? 'var(--c-green-soft)' : 'var(--c-accent)', border: 'none' }}
          type="button"
        >
          {installing ? <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" /> : <Download style={{ width: 13, height: 13 }} />}
          {installed ? t('install.installed') : installing ? t('install.installing') : t('install.installBtn')}
        </button>
        {item.url ? (
          <a
            className="flex items-center justify-center rounded-lg"
            href={item.url}
            rel="noreferrer"
            target="_blank"
            style={{ width: 36, height: 34, color: 'var(--c-text-muted)', background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
          >
            <ExternalLink style={{ width: 14, height: 14 }} />
          </a>
        ) : null}
      </div>
    </article>
  )
}
