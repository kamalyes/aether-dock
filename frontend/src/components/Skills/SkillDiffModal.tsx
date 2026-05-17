import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  GitCommit,
  ArrowDown,
  RefreshCw,
  Download,
  Clock,
  User,
  FileCode,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import type { SkillVersionDiff } from '@/types'
import { useSkillStore } from '@/stores/skillStore'
import { Skeleton, SkeletonCard } from '@/components/Loading'

interface SkillDiffModalProps {
  skillId: string
  skillName: string
  open: boolean
  onClose: () => void
}

export default function SkillDiffModal({ skillId, skillName, open, onClose }: SkillDiffModalProps) {
  const { t } = useTranslation()
  const { versionDiffs, getSkillVersionDiff, updateSkill } = useSkillStore()
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const diff = versionDiffs[skillId]

  useEffect(() => {
    if (open && skillId) {
      setLoading(true)
      getSkillVersionDiff(skillId).finally(() => setLoading(false))
    }
  }, [open, skillId])

  const handleUpdate = async () => {
    setUpdating(true)
    const ok = await updateSkill(skillId)
    setUpdating(false)
    if (ok) {
      onClose()
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays === 0) return t('diff.today', 'Today')
      if (diffDays === 1) return t('diff.yesterday', 'Yesterday')
      if (diffDays < 7) return t('diff.daysAgo', '{{count}} days ago', { count: diffDays })
      return d.toLocaleDateString()
    } catch {
      return dateStr
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed z-[201] flex items-center justify-center"
            style={{ inset: 0, pointerEvents: 'none' }}
          >
            <div
              style={{
                width: 560,
                maxHeight: '80vh',
                pointerEvents: 'auto',
                background: 'var(--c-bg-card)',
                border: '1px solid var(--c-border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="flex items-center justify-between px-5 py-4 shrink-0"
                style={{ borderBottom: '1px solid var(--c-border)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: 'var(--c-amber-soft)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GitCommit style={{ width: 16, height: 16, color: 'var(--c-amber)' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
                      {t('diff.title', 'Version Diff')}
                    </h3>
                    <p style={{ fontSize: 11, color: 'var(--c-text-faint)', margin: 0 }}>
                      {skillName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg transition-colors"
                  style={{ color: 'var(--c-text-faint)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-bg-input)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                >
                  <X style={{ width: 16, height: 16 }} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4">
                {loading ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Skeleton width={40} height={40} borderRadius={10} />
                      <div className="flex-1 space-y-2">
                        <Skeleton width="50%" height={14} />
                        <Skeleton width="30%" height={10} />
                      </div>
                    </div>
                    <SkeletonCard rows={2} />
                    <SkeletonCard rows={3} />
                    <SkeletonCard rows={2} />
                  </div>
                ) : diff ? (
                  <>
                    <VersionComparison diff={diff} />

                    {diff.behindCount > 0 && (
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                          <ArrowDown style={{ width: 14, height: 14, color: 'var(--c-amber)' }} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--c-text)' }}>
                            {t('diff.newCommits', '{{count}} new commits', { count: diff.behindCount })}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {diff.commits.map((commit) => (
                            <CommitItem key={commit.hash} commit={commit} formatDate={formatDate} />
                          ))}
                        </div>
                      </div>
                    )}

                    {diff.behindCount === 0 && !diff.hasUpdate && (
                      <div className="flex flex-col items-center py-8">
                        <FileCode style={{ width: 32, height: 32, color: 'var(--c-green)', marginBottom: 8 }} />
                        <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--c-text)' }}>
                          {t('diff.upToDate', 'Already up to date')}
                        </p>
                        <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 4 }}>
                          {t('diff.upToDateDesc', 'This skill is at the latest version')}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center py-8">
                    <AlertCircle style={{ width: 32, height: 32, color: 'var(--c-text-faint)', marginBottom: 8 }} />
                    <p style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>
                      {t('diff.failedToLoad', 'Failed to load version diff')}
                    </p>
                  </div>
                )}
              </div>

              {diff && diff.hasUpdate && (
                <div
                  className="flex items-center justify-between px-5 py-3 shrink-0"
                  style={{ borderTop: '1px solid var(--c-border)', background: 'var(--c-bg-elevated)' }}
                >
                  <span style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>
                    {t('diff.updateHint', 'Update to get the latest features and fixes')}
                  </span>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-medium transition-all"
                    style={{
                      color: '#fff',
                      background: updating ? 'var(--c-text-faint)' : 'var(--c-green)',
                      border: 'none',
                      cursor: updating ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {updating ? (
                      <Loader2 style={{ width: 13, height: 13 }} className="animate-spin" />
                    ) : (
                      <Download style={{ width: 13, height: 13 }} />
                    )}
                    {updating ? t('diff.updating', 'Updating...') : t('diff.updateNow', 'Update Now')}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function VersionComparison({ diff }: { diff: SkillVersionDiff }) {
  const { t } = useTranslation()

  return (
    <div
      className="flex items-center gap-3 p-4 rounded-lg"
      style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
    >
      <div className="flex-1 text-center">
        <span style={{ fontSize: 10, color: 'var(--c-text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('diff.current', 'Current')}
        </span>
        <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text)', fontFamily: 'monospace', margin: '4px 0 0' }}>
          {diff.currentVersion || diff.currentCommit.slice(0, 8)}
        </p>
        {diff.currentCommit && diff.currentVersion && (
          <p style={{ fontSize: 10, color: 'var(--c-text-faint)', fontFamily: 'monospace', margin: '2px 0 0' }}>
            {diff.currentCommit.slice(0, 8)}
          </p>
        )}
      </div>

      <div className="flex flex-col items-center gap-1">
        <ArrowDown style={{ width: 16, height: 16, color: diff.hasUpdate ? 'var(--c-amber)' : 'var(--c-green)' }} />
        {diff.behindCount > 0 && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: '#fff',
              background: diff.hasUpdate ? 'var(--c-amber)' : 'var(--c-green)',
              padding: '1px 6px',
              borderRadius: 999,
            }}
          >
            +{diff.behindCount}
          </span>
        )}
      </div>

      <div className="flex-1 text-center">
        <span style={{ fontSize: 10, color: 'var(--c-text-faint)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {t('diff.latest', 'Latest')}
        </span>
        <p style={{ fontSize: 16, fontWeight: 700, color: diff.hasUpdate ? 'var(--c-amber)' : 'var(--c-green)', fontFamily: 'monospace', margin: '4px 0 0' }}>
          {diff.latestVersion || diff.latestCommit.slice(0, 8)}
        </p>
        {diff.latestCommit && diff.latestVersion && (
          <p style={{ fontSize: 10, color: 'var(--c-text-faint)', fontFamily: 'monospace', margin: '2px 0 0' }}>
            {diff.latestCommit.slice(0, 8)}
          </p>
        )}
      </div>
    </div>
  )
}

function CommitItem({ commit, formatDate }: { commit: { hash: string; author: string; message: string; date: string }; formatDate: (d: string) => string }) {
  return (
    <div
      className="flex items-start gap-3 p-3 rounded-lg"
      style={{ background: 'var(--c-bg-input)' }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          background: 'var(--c-accent-soft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        <GitCommit style={{ width: 12, height: 12, color: 'var(--c-accent)' }} />
      </div>
      <div className="min-w-0 flex-1">
        <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--c-text)', margin: 0, lineHeight: 1.4 }}>
          {commit.message}
        </p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
            <User style={{ width: 10, height: 10 }} />
            {commit.author}
          </span>
          <span className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--c-text-faint)' }}>
            <Clock style={{ width: 10, height: 10 }} />
            {formatDate(commit.date)}
          </span>
          <span style={{ fontSize: 10, color: 'var(--c-text-faint)', fontFamily: 'monospace' }}>
            {commit.hash.slice(0, 7)}
          </span>
        </div>
      </div>
    </div>
  )
}
