import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GitMerge, GitCommit, Clock, User, RotateCcw, ChevronRight, Plus, Minus, ArrowUpDown } from 'lucide-react'
import { Card, Badge, Button, SectionHeader, Tabs, Divider } from '@/components/ui'
import { MOCK_VERSIONS, MOCK_DATASETS } from '@/lib/mockData'
import { useAppStore } from '@/stores/appStore'
import { formatBytes, formatNumber, formatDate, formatRelativeTime, isProjectMatch } from '@/lib/utils'
import type { DatasetVersion } from '@/types'

const VersionCard: React.FC<{ version: DatasetVersion; isSelected: boolean; onClick: () => void }> = ({ version, isSelected, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-start gap-3 px-4 py-3.5 border-b border-[rgba(255,255,255,0.04)] cursor-pointer transition-colors hover:bg-[rgba(255,255,255,0.02)] ${isSelected ? 'bg-[rgba(99,102,241,0.06)]' : ''}`}
  >
    <div className="mt-0.5">
      <GitCommit size={14} className={isSelected ? 'text-[#6366F1]' : 'text-[#475569]'} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-1">
        <code className="text-xs font-bold text-[#F8FAFC] font-mono">{version.version}</code>
        {version.isCurrent && <Badge variant="indigo" size="sm">current</Badge>}
      </div>
      <p className="text-[11px] text-[#64748B] truncate">{version.description}</p>
      <div className="flex items-center gap-3 mt-1.5 text-[10px] text-[#475569]">
        <span className="flex items-center gap-1">
          <User size={9} /> {version.author.name}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={9} /> {formatRelativeTime(version.createdAt)}
        </span>
      </div>
    </div>
  </div>
)

const ChangeTag: React.FC<{ type: DatasetVersion['changes'][0]['type'] }> = ({ type }) => {
  const config = {
    added: { label: 'Added', icon: <Plus size={11} />, variant: 'success' as const },
    removed: { label: 'Removed', icon: <Minus size={11} />, variant: 'error' as const },
    modified: { label: 'Modified', icon: <ArrowUpDown size={11} />, variant: 'warning' as const },
    schema_change: { label: 'Schema', icon: <GitMerge size={11} />, variant: 'indigo' as const },
  }
  const c = config[type]
  return (
    <Badge variant={c.variant} size="sm">
      <span className="flex items-center gap-1">{c.icon} {c.label}</span>
    </Badge>
  )
}

export const VersioningPage: React.FC = () => {
  const { datasets, datasetVersions, restoreDatasetVersion, activeProject } = useAppStore()

  // Filter datasets belonging to activeProject
  const projectDatasets = datasets.filter(d => isProjectMatch(d.projectId, activeProject?.id))

  const [selectedDataset, setSelectedDataset] = useState(() => {
    return projectDatasets[0]?.id || ''
  })

  const [selectedVersion, setSelectedVersion] = useState<DatasetVersion | null>(() => {
    const defaultDsId = projectDatasets[0]?.id || ''
    const versions = MOCK_VERSIONS.filter(v => v.datasetId === defaultDsId)
    return versions.find(v => v.isCurrent) || versions[0] || null
  })

  const [compareMode, setCompareMode] = useState(false)
  const [compareVersion, setCompareVersion] = useState<DatasetVersion | null>(() => {
    const defaultDsId = projectDatasets[0]?.id || ''
    const versions = MOCK_VERSIONS.filter(v => v.datasetId === defaultDsId)
    return versions.find(v => !v.isCurrent) || null
  })

  useEffect(() => {
    if (projectDatasets.length > 0) {
      const exists = projectDatasets.find(d => d.id === selectedDataset)
      if (!exists) {
        setSelectedDataset(projectDatasets[0].id)
      }
    } else {
      setSelectedDataset('')
    }
  }, [activeProject?.id, projectDatasets, selectedDataset])

  // Get versions belonging to the selected dataset
  const currentVersions = datasetVersions.filter(v => v.datasetId === selectedDataset)

  // Keep selectedVersion and compareVersion synchronized with selectedDataset versions
  useEffect(() => {
    if (selectedDataset) {
      const versions = datasetVersions.filter(v => v.datasetId === selectedDataset)
      if (versions.length > 0) {
        const belongsToDataset = selectedVersion && selectedVersion.datasetId === selectedDataset
        if (!belongsToDataset) {
          const currentV = versions.find(v => v.isCurrent) || versions[0]
          setSelectedVersion(currentV)
          
          const otherV = versions.find(v => !v.isCurrent) || null
          setCompareVersion(otherV)
        }
      } else {
        setSelectedVersion(null)
        setCompareVersion(null)
      }
    } else {
      setSelectedVersion(null)
      setCompareVersion(null)
    }
  }, [selectedDataset, datasetVersions, selectedVersion])

  const dataset = projectDatasets.find(d => d.id === selectedDataset) ?? projectDatasets[0] ?? datasets[0] ?? MOCK_DATASETS[0]

  if (!dataset) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto text-center py-20 text-[#64748B]">
        No datasets found in this project.
      </div>
    )
  }

  if (!selectedVersion) {
    return (
      <div className="p-6 max-w-[1400px] mx-auto">
        <SectionHeader
          title="Data Versioning"
          description="Track, compare, and restore dataset versions — Git-style"
        />
        <div className="text-center py-20 text-[#64748B]">
          No version history found for dataset "{dataset.name}".
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <SectionHeader
        title="Data Versioning"
        description="Track, compare, and restore dataset versions — Git-style"
        action={
          <Button variant="secondary" size="sm" leftIcon={<GitMerge size={13} />} onClick={() => setCompareMode(prev => !prev)}>
            {compareMode ? 'Exit Compare' : 'Compare Versions'}
          </Button>
        }
      />

      {/* Dataset Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {projectDatasets.map(ds => (
          <button
            key={ds.id}
            onClick={() => setSelectedDataset(ds.id)}
            className={`px-3 py-1.5 rounded-[8px] text-xs font-mono font-medium border transition-all ${
              selectedDataset === ds.id
                ? 'bg-[rgba(99,102,241,0.12)] border-[rgba(99,102,241,0.3)] text-[#818CF8]'
                : 'bg-[#161F32] border-[rgba(255,255,255,0.06)] text-[#64748B] hover:text-[#94A3B8] hover:border-[rgba(255,255,255,0.10)]'
            }`}
          >
            {ds.name}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Version Timeline */}
        <Card padding="none" className="md:col-span-1">
          <div className="px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Version History</h3>
            <p className="text-[11px] text-[#475569] mt-0.5">{currentVersions.length} versions · {dataset.name}</p>
          </div>
          <div className="divide-y divide-[rgba(255,255,255,0.04)]">
            {currentVersions.map(v => (
              <VersionCard
                key={v.id}
                version={v}
                isSelected={selectedVersion?.id === v.id}
                onClick={() => setSelectedVersion(v)}
              />
            ))}
          </div>
        </Card>

        {/* Version Detail */}
        <div className="md:col-span-2 space-y-4">
          <Card padding="md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-base font-bold text-[#F8FAFC] font-mono">{selectedVersion.version}</code>
                  {selectedVersion.isCurrent && <Badge variant="indigo">current</Badge>}
                </div>
                <p className="text-sm text-[#64748B]">{selectedVersion.description}</p>
              </div>
              {!selectedVersion.isCurrent && (
                <Button 
                  variant="secondary" 
                  size="sm" 
                  leftIcon={<RotateCcw size={12} />}
                  onClick={() => {
                    restoreDatasetVersion(dataset.id, selectedVersion.id);
                    // Update current selectedVersion locally so the "current" badge renders immediately
                    setSelectedVersion(prev => prev ? { ...prev, isCurrent: true } : null);
                  }}
                >
                  Restore
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-[#0A0F1C] rounded-[10px] border border-[rgba(255,255,255,0.04)]">
              <div>
                <p className="text-[10px] text-[#475569] uppercase tracking-wide mb-1">Rows</p>
                <p className="text-sm font-bold text-[#F8FAFC]">{formatNumber(selectedVersion.rowCount)}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#475569] uppercase tracking-wide mb-1">Columns</p>
                <p className="text-sm font-bold text-[#F8FAFC]">{selectedVersion.columnCount}</p>
              </div>
              <div>
                <p className="text-[10px] text-[#475569] uppercase tracking-wide mb-1">Size</p>
                <p className="text-sm font-bold text-[#F8FAFC]">{formatBytes(selectedVersion.sizeBytes)}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#64748B]">
              <span className="flex items-center gap-1.5"><User size={12} /> {selectedVersion.author.name}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} /> {formatDate(selectedVersion.createdAt, 'MMM d, yyyy HH:mm')}</span>
            </div>
          </Card>

          {/* Changes */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">
              Changes in {selectedVersion.version}
            </h3>
            <div className="space-y-3">
              {selectedVersion.changes.map((change, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 p-3 rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
                >
                  <ChangeTag type={change.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[#F8FAFC]">{change.description}</p>
                    {change.affectedColumns && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {change.affectedColumns.map(col => (
                          <code key={col} className="text-[10px] px-1.5 py-0.5 bg-[rgba(99,102,241,0.1)] text-[#818CF8] rounded border border-[rgba(99,102,241,0.15)] font-mono">
                            {col}
                          </code>
                        ))}
                      </div>
                    )}
                    {change.rowDelta !== undefined && (
                      <p className="text-[11px] text-[#10B981] mt-1">
                        {change.rowDelta > 0 ? '+' : ''}{change.rowDelta.toLocaleString()} rows
                      </p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Version Comparison */}
          {compareMode && compareVersion && (
            <Card padding="md">
              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">
                Comparing {compareVersion.version} → {selectedVersion.version}
              </h3>
              <div className="grid grid-cols-2 gap-4 p-3 bg-[#0A0F1C] rounded-[10px] border border-[rgba(255,255,255,0.04)] mb-4">
                {[
                  { label: 'Rows diff', old: compareVersion.rowCount, new: selectedVersion.rowCount, format: formatNumber },
                  { label: 'Size diff', old: compareVersion.sizeBytes, new: selectedVersion.sizeBytes, format: formatBytes },
                ].map(m => {
                  const delta = m.new - m.old
                  return (
                    <div key={m.label}>
                      <p className="text-[10px] text-[#475569] uppercase tracking-wide mb-1">{m.label}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#64748B] line-through">{m.format(m.old)}</span>
                        <ChevronRight size={11} className="text-[#334155]" />
                        <span className="text-sm font-bold text-[#F8FAFC]">{m.format(m.new)}</span>
                        <span className={`text-xs font-medium ${delta >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {delta >= 0 ? '+' : ''}{m.format(Math.abs(delta))}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Diff view */}
              <div className="font-mono text-[11px] bg-[#0A0F1C] rounded-[8px] p-3 border border-[rgba(255,255,255,0.04)] space-y-0.5">
                <div className="text-[#10B981]">+ Added: country_code STRING</div>
                <div className="text-[#10B981]">+ Modified: total_spend FLOAT (USD normalized)</div>
                <div className="text-[#EF4444]">- Removed: source STRING (deprecated)</div>
                <div className="text-[#64748B]">  Unchanged: customer_id, age, email, signup_date, is_active, last_login</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
