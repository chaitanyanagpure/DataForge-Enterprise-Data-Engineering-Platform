import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database, Search, Upload, Filter, Tag, MoreHorizontal,
  ChevronDown, ChevronUp, X, Plus, Eye, BarChart2,
  CheckCircle, AlertCircle, Clock, Layers,
  ArrowUpDown, FileText, Grid3X3,
} from 'lucide-react'
import {
  Card, Badge, Button, Input, Tabs, Progress, StatusDot,
  EmptyState, Skeleton, Divider, SectionHeader,
} from '@/components/ui'
import { MOCK_DATASETS } from '@/lib/mockData'
import { useAppStore } from '@/stores/appStore'
import { formatBytes, formatNumber, formatRelativeTime, getQualityColor } from '@/lib/utils'
import type { Dataset, ColumnSchema } from '@/types'

const FORMAT_ICONS: Record<string, string> = {
  parquet: '⬡', csv: '⊞', json: '{ }', excel: '⊟', avro: '⊗',
}

const ColumnRow: React.FC<{ col: ColumnSchema }> = ({ col }) => (
  <tr className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] transition-colors">
    <td className="px-4 py-2.5">
      <span className="text-xs font-mono text-[#F8FAFC]">{col.name}</span>
    </td>
    <td className="px-4 py-2.5">
      <Badge variant={col.type === 'string' ? 'cyan' : col.type === 'integer' || col.type === 'float' ? 'indigo' : 'default'}>
        {col.type}
      </Badge>
    </td>
    <td className="px-4 py-2.5 text-xs text-[#94A3B8]">
      {col.nullable ? <CheckCircle size={12} className="text-[#10B981]" /> : <X size={12} className="text-[#EF4444]" />}
    </td>
    <td className="px-4 py-2.5">
      <div className="flex items-center gap-2">
        <Progress value={100 - col.missingPercent} size="sm" color={col.missingPercent > 5 ? '#EF4444' : '#10B981'} className="w-16" />
        <span className="text-[11px] text-[#64748B]">{col.missingPercent.toFixed(1)}%</span>
      </div>
    </td>
    <td className="px-4 py-2.5 text-xs text-[#64748B] font-mono">
      {col.cardinality !== undefined ? formatNumber(col.cardinality) : '—'}
    </td>
    <td className="px-4 py-2.5">
      <div className="flex gap-1 flex-wrap max-w-[180px]">
        {col.sampleValues.slice(0, 2).map((v, i) => (
          <span key={i} className="text-[10px] px-1.5 py-0.5 bg-[rgba(255,255,255,0.04)] rounded text-[#64748B] font-mono truncate max-w-[80px]">
            {String(v)}
          </span>
        ))}
      </div>
    </td>
  </tr>
)

const DatasetDetailPanel: React.FC<{ dataset: Dataset; onClose: () => void }> = ({ dataset, onClose }) => {
  const [activeTab, setActiveTab] = useState('schema')
  const tabs = [
    { id: 'schema', label: 'Schema', icon: <Grid3X3 size={12} /> },
    { id: 'quality', label: 'Quality', icon: <CheckCircle size={12} /> },
    { id: 'history', label: 'History', icon: <Clock size={12} /> },
  ]

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed right-0 top-0 bottom-0 w-[640px] bg-[#121826] border-l border-[rgba(255,255,255,0.06)] z-40 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-start gap-3 px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="w-9 h-9 rounded-[8px] bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center shrink-0">
          <Database size={16} className="text-[#6366F1]" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-[#F8FAFC] font-mono">{dataset.name}</h2>
          <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{dataset.description}</p>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-[6px] text-[#475569] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-3 gap-px bg-[rgba(255,255,255,0.04)] border-b border-[rgba(255,255,255,0.06)]">
        {[
          { label: 'Rows', value: formatNumber(dataset.rowCount) },
          { label: 'Columns', value: dataset.columnCount },
          { label: 'Size', value: formatBytes(dataset.sizeBytes) },
          { label: 'Format', value: dataset.format.toUpperCase() },
          { label: 'Version', value: dataset.version },
          { label: 'Quality', value: `${dataset.qualityScore}%` },
        ].map(m => (
          <div key={m.label} className="bg-[#121826] px-4 py-2.5">
            <p className="text-[10px] text-[#475569] uppercase tracking-wide">{m.label}</p>
            <p className="text-sm font-semibold text-[#F8FAFC] mt-0.5">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Tags */}
      <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-2 flex-wrap">
        {dataset.tags.map(tag => (
          <Badge key={tag} variant="indigo">{tag}</Badge>
        ))}
        <button className="text-[#475569] hover:text-[#6366F1] transition-colors">
          <Plus size={12} />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-6 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'schema' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  {['Column', 'Type', 'Nullable', 'Completeness', 'Cardinality', 'Samples'].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-[#475569] uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.schema.map(col => <ColumnRow key={col.name} col={col} />)}
              </tbody>
            </table>
          </div>
        )}
        {activeTab === 'quality' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full border-4 flex items-center justify-center" style={{ borderColor: getQualityColor(dataset.qualityScore) }}>
                <span className="text-lg font-bold" style={{ color: getQualityColor(dataset.qualityScore) }}>{Math.round(dataset.qualityScore)}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#F8FAFC]">Overall Quality Score</p>
                <p className="text-xs text-[#64748B]">Based on 5 quality dimensions</p>
              </div>
            </div>
            {['Completeness', 'Consistency', 'Uniqueness', 'Validity', 'Timeliness'].map((dim, i) => {
              const scores = [dataset.qualityScore - 2, dataset.qualityScore + 3, dataset.qualityScore - 5, dataset.qualityScore + 1, dataset.qualityScore - 8]
              const score = Math.max(0, Math.min(100, scores[i]))
              return (
                <div key={dim}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#94A3B8] font-medium">{dim}</span>
                    <span className="font-semibold" style={{ color: getQualityColor(score) }}>{score.toFixed(1)}%</span>
                  </div>
                  <Progress value={score} color={getQualityColor(score)} size="md" />
                </div>
              )
            })}
          </div>
        )}
        {activeTab === 'history' && (
          <div className="p-6 space-y-3">
            {[
              { action: 'Schema updated', user: 'Alex Chen', time: '2 hours ago', type: 'update' },
              { action: 'Data refreshed (95,420 rows)', user: 'Scheduler', time: '8 hours ago', type: 'refresh' },
              { action: 'Quality report generated', user: 'System', time: '8 hours ago', type: 'quality' },
              { action: 'Tags updated', user: 'Sarah Kim', time: '2 days ago', type: 'update' },
              { action: 'Dataset created', user: 'Alex Chen', time: '5 months ago', type: 'create' },
            ].map((entry, i) => (
              <div key={i} className="flex gap-3">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${entry.type === 'create' ? 'bg-[#10B981]' : entry.type === 'refresh' ? 'bg-[#6366F1]' : 'bg-[#94A3B8]'}`} />
                <div>
                  <p className="text-xs font-medium text-[#F8FAFC]">{entry.action}</p>
                  <p className="text-[11px] text-[#475569]">{entry.user} · {entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export const CatalogPage: React.FC = () => {
  const { addNotification } = useAppStore()

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Dataset | null>(null)
  const [formatFilter, setFormatFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const { datasets, setDatasets } = useAppStore()
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [newName, setNewName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newFormat, setNewFormat] = useState<string>('csv')
  const [newTags, setNewTags] = useState('')
  const [uploadError, setUploadError] = useState('')

  const startMockUpload = (file: { name: string; size: number }) => {
    setIsUploading(true)
    setFileName(file.name)
    setFileSize(file.size)
    setUploadProgress(0)
    setUploadError('')

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          return 100
        }
        return prev + 10
      })
    }, 150)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext && ['csv', 'parquet', 'json', 'xlsx', 'xls'].includes(ext)) {
        setNewFormat(ext === 'xlsx' || ext === 'xls' ? 'excel' : ext)
      }
      startMockUpload({ name: file.name, size: file.size })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext && ['csv', 'parquet', 'json', 'xlsx', 'xls'].includes(ext)) {
        setNewFormat(ext === 'xlsx' || ext === 'xls' ? 'excel' : ext)
      }
      startMockUpload({ name: file.name, size: file.size })
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || !newDescription.trim()) {
      setUploadError('Please fill in Name and Description.')
      return
    }
    if (!fileName) {
      setUploadError('Please select or drop a file to upload.')
      return
    }
    if (uploadProgress < 100) {
      setUploadError('Please wait for the file upload to complete.')
      return
    }

    const tagsArray = newTags
      ? newTags.split(',').map(t => t.trim()).filter(Boolean)
      : ['uploaded']

    const newDataset: Dataset = {
      id: Math.random().toString(36).slice(2),
      name: newName.trim(),
      description: newDescription.trim(),
      projectId: 'proj_1',
      format: newFormat as any,
      source: 'upload',
      rowCount: Math.floor(Math.random() * 500000) + 10000,
      columnCount: 2,
      sizeBytes: fileSize || Math.floor(Math.random() * 50000000) + 1000000,
      qualityScore: Math.floor(Math.random() * 20) + 80,
      status: 'ready',
      tags: tagsArray,
      owner: {
        id: 'u1',
        name: 'Alex Chen',
        email: 'alex@dataforge.io',
        role: 'admin',
        organizationId: 'org_1',
        createdAt: new Date().toISOString()
      },
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      lastRefreshed: new Date().toISOString(),
      version: 'v1.0.0',
      schema: [
        { name: 'id', type: 'integer', nullable: false, unique: true, missing: 0, missingPercent: 0, cardinality: 5000, sampleValues: [1, 2] },
        { name: 'created_at', type: 'string', nullable: false, unique: false, missing: 0, missingPercent: 0, cardinality: 5000, sampleValues: ['2026-06-20T12:00:00Z'] },
      ]
    }

    setDatasets([newDataset, ...datasets])
    addNotification({
      title: 'Dataset Uploaded',
      message: `Successfully uploaded and indexed "${newName.trim()}".`,
      type: 'success'
    })

    setUploadOpen(false)
    setNewName('')
    setNewDescription('')
    setNewTags('')
    setFileName('')
    setFileSize(0)
    setUploadProgress(0)
    setUploadError('')
  }

  const filtered = datasets.filter(ds => {
    const matchSearch = ds.name.toLowerCase().includes(search.toLowerCase()) ||
      ds.description.toLowerCase().includes(search.toLowerCase()) ||
      ds.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchFormat = formatFilter === 'all' || ds.format === formatFilter
    const matchStatus = statusFilter === 'all' || ds.status === statusFilter
    return matchSearch && matchFormat && matchStatus
  })

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <SectionHeader
        title="Data Catalog"
        description={`${datasets.length} datasets across all projects`}
        action={
          <Button variant="primary" size="sm" leftIcon={<Upload size={13} />} onClick={() => { setUploadOpen(true); setUploadError(''); setNewName(''); setNewDescription(''); setNewTags(''); setFileName(''); setFileSize(0); setUploadProgress(0) }}>
            Upload Dataset
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search datasets, tags..."
            className="w-full bg-[#161F32] border border-[rgba(255,255,255,0.08)] rounded-[8px] pl-9 pr-3 py-2 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>
        <select
          value={formatFilter}
          onChange={e => setFormatFilter(e.target.value)}
          className="bg-[#161F32] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2 text-sm text-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors cursor-pointer"
        >
          {['all', 'parquet', 'csv', 'json', 'excel'].map(f => (
            <option key={f} value={f} className="bg-[#121826]">{f === 'all' ? 'All formats' : f.toUpperCase()}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="bg-[#161F32] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2 text-sm text-[#94A3B8] focus:outline-none focus:border-[#6366F1] transition-colors cursor-pointer"
        >
          {['all', 'ready', 'processing', 'error', 'stale'].map(s => (
            <option key={s} value={s} className="bg-[#121826]">{s === 'all' ? 'All status' : s}</option>
          ))}
        </select>
        <span className="text-xs text-[#475569]">{filtered.length} results</span>
      </div>

      {/* Dataset Table */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {['Name', 'Format', 'Rows', 'Size', 'Quality', 'Status', 'Updated', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#475569] uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              <AnimatePresence>
                {filtered.map((ds, i) => (
                  <motion.tr
                    key={ds.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors group"
                    onClick={() => setSelected(selected?.id === ds.id ? null : ds)}
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[6px] bg-[rgba(99,102,241,0.10)] border border-[rgba(99,102,241,0.15)] flex items-center justify-center shrink-0 text-xs font-mono text-[#6366F1]">
                          {FORMAT_ICONS[ds.format] || '📄'}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[#F8FAFC] font-mono">{ds.name}</p>
                          <div className="flex gap-1 mt-0.5">
                            {ds.tags.slice(0, 2).map(t => <Badge key={t} variant="default" size="sm">{t}</Badge>)}
                            {ds.tags.length > 2 && <span className="text-[10px] text-[#475569]">+{ds.tags.length - 2}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant="indigo">{ds.format.toUpperCase()}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#94A3B8] font-mono">{formatNumber(ds.rowCount)}</td>
                    <td className="px-5 py-3.5 text-xs text-[#94A3B8] font-mono">{formatBytes(ds.sizeBytes)}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12">
                          <Progress value={ds.qualityScore} color={getQualityColor(ds.qualityScore)} size="sm" />
                        </div>
                        <span className="text-xs font-semibold" style={{ color: getQualityColor(ds.qualityScore) }}>
                          {ds.qualityScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusDot
                        status={ds.status === 'ready' ? 'success' : ds.status === 'error' ? 'error' : ds.status === 'processing' ? 'running' : 'idle'}
                        label={ds.status}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#475569] whitespace-nowrap">{formatRelativeTime(ds.updatedAt)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(ds) }}
                        className="p-1.5 rounded-[6px] text-[#475569] hover:text-[#F8FAFC] hover:bg-[rgba(255,255,255,0.06)] transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState icon={<Database size={20} />} title="No datasets found" description="Try adjusting your search or filters" />
          )}
        </div>
      </Card>

      {/* Detail Panel */}
      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
            />
            <DatasetDetailPanel dataset={selected} onClose={() => setSelected(null)} />
          </>
        )}
      </AnimatePresence>

      {/* --- UPLOAD DATASET MODAL --- */}
      <AnimatePresence>
        {uploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setUploadOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-[#121826] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-2xl p-6 z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Upload New Dataset</h3>
                <button onClick={() => setUploadOpen(false)} className="text-[#475569] hover:text-[#94A3B8] transition-colors"><X size={15} /></button>
              </div>
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Dataset Name</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. customers_churn_data" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Description</label>
                  <textarea value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Dataset containing weekly customer subscription status" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] h-20" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Format</label>
                    <select value={newFormat} onChange={e => setNewFormat(e.target.value)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                      <option value="csv" className="bg-[#121826]">CSV</option>
                      <option value="parquet" className="bg-[#121826]">PARQUET</option>
                      <option value="json" className="bg-[#121826]">JSON</option>
                      <option value="excel" className="bg-[#121826]">Excel</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Tags (comma-separated)</label>
                    <input type="text" value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="e.g. churn, weekly" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" />
                  </div>
                </div>

                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-[rgba(255,255,255,0.08)] hover:border-[#6366F1]/50 rounded-[10px] p-6 text-center cursor-pointer transition-colors relative"
                >
                  <input type="file" id="fileInput" onChange={handleFileSelect} className="hidden" />
                  <label htmlFor="fileInput" className="cursor-pointer space-y-2 block">
                    <Upload size={24} className="mx-auto text-[#64748B] hover:text-[#6366F1] transition-colors" />
                    <div>
                      <p className="text-xs text-[#F8FAFC]">Drag & Drop your file or <span className="text-[#6366F1] hover:underline">browse</span></p>
                      <p className="text-[10px] text-[#475569] mt-1">Supports CSV, Parquet, JSON (max 500MB)</p>
                    </div>
                  </label>
                </div>

                {fileName && (
                  <div className="p-3 bg-[#0D121F] border border-[rgba(255,255,255,0.06)] rounded-[10px] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#94A3B8] truncate max-w-[200px]">{fileName}</span>
                      <span className="text-[#475569]">{formatBytes(fileSize)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[rgba(255,255,255,0.04)] h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#6366F1] transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                      </div>
                      <span className="text-[10px] font-semibold text-[#6366F1]">{uploadProgress}%</span>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-2.5 flex items-center gap-1.5">
                    <AlertCircle size={13} /> {uploadError}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setUploadOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm" disabled={uploadProgress < 100 || isUploading}>Register Dataset</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
