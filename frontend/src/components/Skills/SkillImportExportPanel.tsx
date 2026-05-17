import { Download, FolderOpen, Loader2, Upload as UploadIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Skill } from '@/types'
import { wailsApi } from '@/services/wailsBridge'
import { toast } from '@/stores/toastStore'
import { MetricTile } from '@/components/Card'
import { Upload } from '@/components/Upload'
import { shortPath } from './utils'

interface SkillImportExportPanelProps {
  skills: Skill[]
  selectedSkillIds: Set<string>
  onImported: () => void
}

export function SkillImportExportPanel({ skills, selectedSkillIds, onImported }: SkillImportExportPanelProps) {
  const { t } = useTranslation()
  const [zipPath, setZipPath] = useState('')
  const [targetRoot, setTargetRoot] = useState('')
  const [busy, setBusy] = useState<'import' | 'export' | null>(null)

  const selectedSkills = useMemo(
    () => skills.filter((skill) => selectedSkillIds.has(skill.id) && skill.installPath),
    [skills, selectedSkillIds],
  )

  const chooseZip = async () => {
    const resp = await wailsApi.browseFile()
    if (resp.success && resp.data) {
      setZipPath(resp.data)
    }
  }

  const chooseTarget = async () => {
    const resp = await wailsApi.browseFolder()
    if (resp.success && resp.data) {
      setTargetRoot(resp.data)
    }
  }

  const importZip = async () => {
    if (!zipPath) return
    setBusy('import')
    const resp = await wailsApi.importSkillsZip({ zipPath, targetRoot })
    setBusy(null)
    if (resp.success) {
      toast.success(t('skills.importSuccess', 'Skills imported'))
      onImported()
      return
    }
    toast.error(resp.error ?? t('skills.importFailed', 'Import failed'))
  }

  const exportSelected = async () => {
    if (selectedSkills.length === 0) return
    setBusy('export')
    const filename = selectedSkills.length === 1
      ? `${selectedSkills[0].name}.zip`
      : `aether-dock-export-${selectedSkills.length}-skills.zip`
    const saveResp = await wailsApi.saveFile(filename)
    if (!saveResp.success || !saveResp.data) {
      setBusy(null)
      return
    }

    const resp = await wailsApi.exportSkillsZip({
      outputPath: saveResp.data,
      skills: selectedSkills.map((skill) => ({
        skillId: skill.id,
        sourceSkillPath: skill.installPath,
      })),
    })
    setBusy(null)
    if (resp.success) {
      toast.success(t('skills.exportSuccess', 'Skills exported'))
      return
    }
    toast.error(resp.error ?? t('skills.exportFailed', 'Export failed'))
  }

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: 'minmax(0, 1.2fr) minmax(360px, 0.8fr)' }}>
      <section className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="icon-box icon-box-green" style={{ width: 34, height: 34 }}>
            <UploadIcon style={{ width: 17, height: 17 }} />
          </span>
          <div>
            <h2 style={{ fontSize: 14, color: 'var(--c-text)', fontWeight: 700 }}>
              {t('skills.importZipTitle', 'Import skills from ZIP')}
            </h2>
            <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 2 }}>
              {t('skills.importZipDesc', 'Import one or more skill folders from a ZIP archive.')}
            </p>
          </div>
        </div>

        <Upload
          accept=".zip"
          icon="zip"
          value={zipPath ? shortPath(zipPath) : ''}
          onChange={(value) => {
            if (!value) setZipPath('')
          }}
          onBrowse={chooseZip}
          placeholder={t('skills.chooseZipHint', 'Choose a ZIP file to import')}
          hint={t('skills.zipFormatHint', 'The archive can contain one or more folders with SKILL.md files.')}
        />

        <div className="mt-4 grid gap-3">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
          >
            <FolderOpen style={{ width: 14, height: 14, color: 'var(--c-text-faint)' }} />
            <span style={{ fontSize: 11, color: targetRoot ? 'var(--c-text-secondary)' : 'var(--c-text-faint)' }} className="truncate flex-1">
              {targetRoot || t('skills.defaultImportTarget', 'Default import target')}
            </span>
            <button
              className="px-2 py-1 rounded-md text-[10px]"
              onClick={chooseTarget}
              style={{ color: 'var(--c-accent)', background: 'var(--c-accent-soft)', border: 'none' }}
              type="button"
            >
              {t('settings.change', 'Change')}
            </button>
          </div>

          <button
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-semibold disabled:opacity-50"
            disabled={!zipPath || busy !== null}
            onClick={importZip}
            style={{ color: '#fff', background: 'var(--c-accent)', border: 'none' }}
            type="button"
          >
            {busy === 'import' ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <UploadIcon style={{ width: 14, height: 14 }} />}
            {busy === 'import' ? t('install.importing', 'Importing...') : t('skills.importAndScan', 'Import and rescan')}
          </button>
        </div>
      </section>

      <section className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="icon-box icon-box-accent" style={{ width: 34, height: 34 }}>
            <Download style={{ width: 17, height: 17 }} />
          </span>
          <div>
            <h2 style={{ fontSize: 14, color: 'var(--c-text)', fontWeight: 700 }}>
              {t('skills.exportSelectedTitle', 'Export selected skills')}
            </h2>
            <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 2 }}>
              {t('skills.exportSelectedDesc', 'Back up or migrate the selected skills as one ZIP archive.')}
            </p>
          </div>
        </div>

        <div className="space-y-2" style={{ minHeight: 184 }}>
          {selectedSkills.length === 0 ? (
            <div className="rounded-xl p-5 text-center" style={{ background: 'var(--c-bg-input)' }}>
              <p style={{ fontSize: 12, color: 'var(--c-text-muted)', fontWeight: 600 }}>
                {t('skills.noExportSelection', 'Select skills in the library first')}
              </p>
              <p style={{ fontSize: 11, color: 'var(--c-text-faint)', marginTop: 4 }}>
                {t('skills.noExportSelectionDesc', 'Only selected skills with local paths can be exported.')}
              </p>
            </div>
          ) : (
            selectedSkills.slice(0, 6).map((skill) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 rounded-lg px-3 py-2"
                style={{ background: 'var(--c-bg-input)' }}
              >
                <span style={{ fontSize: 12, color: 'var(--c-text)', fontWeight: 600 }} className="truncate">
                  {skill.name}
                </span>
                <span style={{ fontSize: 10, color: 'var(--c-text-faint)' }} className="truncate">
                  {shortPath(skill.installPath)}
                </span>
              </div>
            ))
          )}
          {selectedSkills.length > 6 ? (
            <p style={{ fontSize: 11, color: 'var(--c-text-faint)' }}>
              {t('skills.moreSelected', '+ {{count}} more', { count: selectedSkills.length - 6 })}
            </p>
          ) : null}
        </div>

        <div
          className="grid grid-cols-3 gap-2 my-4 rounded-xl p-3"
          style={{ background: 'var(--c-bg-input)', border: '1px solid var(--c-border)' }}
        >
          <MetricTile label={t('skills.summarySkills', 'Skills')} value={selectedSkills.length} />
          <MetricTile label={t('skills.summaryFiles', 'Files')} value={selectedSkills.length ? selectedSkills.length * 4 : 0} />
          <MetricTile label={t('skills.summaryFormat', 'Format')} value="ZIP" />
        </div>

        <button
          className="flex w-full items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-[12px] font-semibold disabled:opacity-50"
          disabled={selectedSkills.length === 0 || busy !== null}
          onClick={exportSelected}
          style={{ color: '#fff', background: 'var(--c-accent)', border: 'none' }}
          type="button"
        >
          {busy === 'export' ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <Download style={{ width: 14, height: 14 }} />}
          {busy === 'export' ? t('skills.exporting', 'Exporting...') : t('skills.exportZip', 'Export ZIP')}
        </button>
      </section>
    </div>
  )
}
