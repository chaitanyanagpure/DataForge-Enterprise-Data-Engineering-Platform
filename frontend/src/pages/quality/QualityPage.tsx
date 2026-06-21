import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, Plus, Play, CheckCircle, XCircle, AlertTriangle,
  Clock, TrendingUp, TrendingDown, Info, Filter, X, AlertCircle,
} from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts'
import { Card, Badge, Button, Progress, Tabs, StatCard, SectionHeader, Divider } from '@/components/ui'
import { MOCK_QUALITY_REPORTS, MOCK_DATASETS } from '@/lib/mockData'
import { useAppStore } from '@/stores/appStore'
import type { ValidationRule, QualityReport } from '@/types'
import { formatRelativeTime, getQualityColor, isProjectMatch } from '@/lib/utils'

const QUALITY_HISTORY = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
  completeness: 88 + Math.sin(i * 0.5) * 6,
  consistency: 90 + Math.cos(i * 0.4) * 5,
  uniqueness: 85 + Math.sin(i * 0.6) * 8,
  validity: 93 + Math.cos(i * 0.3) * 4,
  timeliness: 78 + Math.sin(i * 0.7) * 10,
}))

export const QualityPage: React.FC = () => {
  const { addNotification, datasets, qualityReports: reports, setQualityReports: setReports, activeProject } = useAppStore()

  // Filter datasets belonging to activeProject
  const projectDatasets = datasets.filter(d => isProjectMatch(d.projectId, activeProject?.id))

  const [activeTab, setActiveTab] = useState('overview')
  const [selectedDataset, setSelectedDataset] = useState('')

  // Sync selected dataset when the project changes
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

  const [newRuleOpen, setNewRuleOpen] = useState(false)

  // New Rule form states
  const [ruleName, setRuleName] = useState('')
  const [ruleDescription, setRuleDescription] = useState('')
  const [targetColumn, setTargetColumn] = useState('')
  const [ruleType, setRuleType] = useState('null_check')
  const [severity, setSeverity] = useState<'critical' | 'warning' | 'info'>('warning')
  const [ruleParam, setRuleParam] = useState('')
  const [ruleError, setRuleError] = useState('')

  const dataset = projectDatasets.find(d => d.id === selectedDataset) ?? projectDatasets[0] ?? datasets[0] ?? MOCK_DATASETS[0]
  
  const report: QualityReport = reports.find(r => r.datasetId === selectedDataset) ?? {
    id: `rep_${selectedDataset || 'default'}`,
    datasetId: selectedDataset || 'default',
    overallScore: dataset?.qualityScore || 100,
    rowsChecked: dataset?.rowCount || 0,
    failedRows: 0,
    generatedAt: new Date().toISOString(),
    dimensions: [
      { name: 'completeness', score: dataset?.qualityScore || 100, failedChecks: 0, totalChecks: 0, trend: 0 },
      { name: 'consistency', score: dataset?.qualityScore || 100, failedChecks: 0, totalChecks: 0, trend: 0 },
      { name: 'uniqueness', score: dataset?.qualityScore || 100, failedChecks: 0, totalChecks: 0, trend: 0 },
      { name: 'validity', score: dataset?.qualityScore || 100, failedChecks: 0, totalChecks: 0, trend: 0 },
      { name: 'timeliness', score: dataset?.qualityScore || 100, failedChecks: 0, totalChecks: 0, trend: 0 },
    ],
    rules: []
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <ShieldCheck size={12} /> },
    { id: 'rules', label: 'Validation Rules', icon: <CheckCircle size={12} />, count: report.rules?.length || 0 },
    { id: 'history', label: 'History', icon: <Clock size={12} /> },
  ]

  const radarData = (report.dimensions || []).map(d => ({
    subject: d.name.charAt(0).toUpperCase() + d.name.slice(1),
    score: d.score,
    fullMark: 100,
  }))

  const handleNewRuleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleName.trim() || !ruleDescription.trim()) {
      setRuleError('Name and Description are required.')
      return
    }

    const typeMapping: Record<string, 'not_null' | 'unique' | 'range' | 'regex' | 'custom'> = {
      null_check: 'not_null',
      uniqueness: 'unique',
      value_range: 'range',
      regex_pattern: 'regex',
      type_check: 'custom',
    }

    const newRuleItem: ValidationRule = {
      id: Math.random().toString(36).slice(2),
      name: ruleName.trim(),
      description: ruleDescription.trim(),
      datasetId: selectedDataset,
      columnName: targetColumn || undefined,
      ruleType: typeMapping[ruleType] ?? 'custom',
      parameters: ruleParam ? { value: ruleParam } : {},
      severity,
      lastResult: 'pass',
      failureCount: 0,
      lastRunAt: new Date().toISOString(),
      isActive: true,
    }

    const reportExists = reports.some(r => r.datasetId === selectedDataset)
    let updatedReports;
    if (reportExists) {
      updatedReports = reports.map(r => {
        if (r.datasetId === selectedDataset) {
          return {
            ...r,
            rules: [...(r.rules || []), newRuleItem]
          }
        }
        return r
      })
    } else {
      const newReport: QualityReport = {
        id: Math.random().toString(36).slice(2),
        datasetId: selectedDataset,
        overallScore: dataset.qualityScore,
        rowsChecked: dataset.rowCount,
        failedRows: 0,
        generatedAt: new Date().toISOString(),
        dimensions: [
          { name: 'completeness', score: dataset.qualityScore, failedChecks: 0, totalChecks: 1, trend: 0 },
          { name: 'consistency', score: dataset.qualityScore, failedChecks: 0, totalChecks: 1, trend: 0 },
          { name: 'uniqueness', score: dataset.qualityScore, failedChecks: 0, totalChecks: 1, trend: 0 },
          { name: 'validity', score: dataset.qualityScore, failedChecks: 0, totalChecks: 1, trend: 0 },
          { name: 'timeliness', score: dataset.qualityScore, failedChecks: 0, totalChecks: 1, trend: 0 },
        ],
        rules: [newRuleItem]
      }
      updatedReports = [newReport, ...reports]
    }

    setReports(updatedReports)
    addNotification({
      title: 'Validation Rule Created',
      message: `Rule "${ruleName.trim()}" successfully registered for ${dataset.name}.`,
      type: 'success'
    })

    setNewRuleOpen(false)
    setRuleName('')
    setRuleDescription('')
    setTargetColumn('')
    setRuleType('null_check')
    setSeverity('warning')
    setRuleParam('')
    setRuleError('')
  }

  const handleRunRule = (ruleId: string, ruleName: string) => {
    const updatedReports = reports.map(r => {
      if (r.datasetId === selectedDataset) {
        return {
          ...r,
          rules: (r.rules || []).map(rule => {
            if (rule.id === ruleId) {
              return {
                ...rule,
                lastRunAt: new Date().toISOString(),
                lastResult: 'pass' as const,
                failureCount: 0
              }
            }
            return rule
          })
        }
      }
      return r
    })
    setReports(updatedReports)

    addNotification({
      title: 'Rule Check Completed',
      message: `Verification check for rule "${ruleName}" completed successfully with 0 anomalies.`,
      type: 'success'
    })
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <SectionHeader
        title="Data Quality"
        description="Monitor and enforce data quality standards across your datasets"
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => { setNewRuleOpen(true); setRuleError(''); setRuleName(''); setRuleDescription(''); setTargetColumn(''); setRuleType('null_check'); setSeverity('warning'); setRuleParam('') }}>
            New Rule
          </Button>
        }
      />

      {/* Dataset selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {projectDatasets.map(ds => (
          <button
            key={ds.id}
            onClick={() => setSelectedDataset(ds.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-xs font-medium border transition-all ${
              selectedDataset === ds.id
                ? 'bg-[rgba(99,102,241,0.12)] border-[rgba(99,102,241,0.3)] text-[#818CF8]'
                : 'bg-[#161F32] border-[rgba(255,255,255,0.06)] text-[#64748B] hover:text-[#94A3B8] hover:border-[rgba(255,255,255,0.10)]'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: getQualityColor(ds.qualityScore) }}
            />
            <span className="font-mono">{ds.name}</span>
            <span className={selectedDataset === ds.id ? 'text-[#818CF8]' : 'text-[#475569]'}>{ds.qualityScore}%</span>
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Overall Score"
          value={`${report.overallScore.toFixed(1)}%`}
          icon={<ShieldCheck size={16} />}
          color={getQualityColor(report.overallScore)}
          subValue={dataset.name}
        />
        <StatCard
          label="Rows Checked"
          value={report.rowsChecked.toLocaleString()}
          icon={<CheckCircle size={16} />}
          color="#06B6D4"
          subValue="in last run"
        />
        <StatCard
          label="Failed Rows"
          value={report.failedRows.toLocaleString()}
          icon={<XCircle size={16} />}
          color="#EF4444"
          subValue={`${((report.failedRows / report.rowsChecked) * 100).toFixed(2)}% failure rate`}
        />
        <StatCard
          label="Active Rules"
          value={report.rules.filter(r => r.isActive).length}
          icon={<Filter size={16} />}
          color="#F59E0B"
          subValue={`${report.rules.length} total rules`}
        />
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'overview' && (
        <div className="grid md:grid-cols-5 gap-4">
          {/* Radar Chart */}
          <Card className="md:col-span-2" padding="md">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Quality Dimensions</h3>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
                <Radar name="Score" dataKey="score" stroke="#6366F1" fill="#6366F1" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>

          {/* Dimension Details */}
          <Card className="md:col-span-3" padding="md">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Dimension Breakdown</h3>
            <div className="space-y-4">
              {report.dimensions.map(dim => (
                <div key={dim.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-[#94A3B8] capitalize">{dim.name}</span>
                      {dim.trend !== 0 && (
                        <span className={`flex items-center gap-0.5 text-[11px] font-medium ${dim.trend > 0 ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                          {dim.trend > 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {Math.abs(dim.trend)}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#64748B]">
                      <span>{dim.failedChecks}/{dim.totalChecks} checks</span>
                      <span className="font-bold" style={{ color: getQualityColor(dim.score) }}>{dim.score.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Progress value={dim.score} color={getQualityColor(dim.score)} size="md" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'rules' && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  {['Rule', 'Column', 'Type', 'Severity', 'Last Result', 'Failures', 'Last Run', ''].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#475569] uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                {report.rules.map(rule => (
                  <motion.tr
                    key={rule.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-xs font-semibold text-[#F8FAFC] font-mono">{rule.name}</p>
                        <p className="text-[11px] text-[#475569] mt-0.5">{rule.description}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#94A3B8] font-mono">{rule.columnName ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant="default">{rule.ruleType.replace(/_/g, ' ')}</Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={rule.severity === 'critical' ? 'error' : rule.severity === 'warning' ? 'warning' : 'info'} dot>
                        {rule.severity}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5">
                      {rule.lastResult === 'pass' ? (
                        <div className="flex items-center gap-1.5 text-[#10B981]">
                          <CheckCircle size={13} /> <span className="text-xs font-medium">Pass</span>
                        </div>
                      ) : rule.lastResult === 'fail' ? (
                        <div className="flex items-center gap-1.5 text-[#EF4444]">
                          <XCircle size={13} /> <span className="text-xs font-medium">Fail</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[#F59E0B]">
                          <AlertTriangle size={13} /> <span className="text-xs font-medium">Warning</span>
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs font-mono text-[#94A3B8]">{rule.failureCount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-xs text-[#475569]">{formatRelativeTime(rule.lastRunAt)}</td>
                    <td className="px-5 py-3.5">
                      <Button variant="ghost" size="xs" leftIcon={<Play size={11} />} onClick={() => handleRunRule(rule.id, rule.name)}>Run</Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card padding="md">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Quality Score History (14 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={QUALITY_HISTORY}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 11 }} />
              {[
                { key: 'completeness', color: '#6366F1' },
                { key: 'consistency', color: '#06B6D4' },
                { key: 'uniqueness', color: '#10B981' },
                { key: 'validity', color: '#F59E0B' },
                { key: 'timeliness', color: '#EF4444' },
              ].map(d => (
                <Line key={d.key} type="monotone" dataKey={d.key} stroke={d.color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 mt-4">
            {[
              { label: 'Completeness', color: '#6366F1' },
              { label: 'Consistency', color: '#06B6D4' },
              { label: 'Uniqueness', color: '#10B981' },
              { label: 'Validity', color: '#F59E0B' },
              { label: 'Timeliness', color: '#EF4444' },
            ].map(d => (
              <div key={d.label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-[11px] text-[#64748B]">{d.label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* --- NEW RULE DIALOG MODAL --- */}
      <AnimatePresence>
        {newRuleOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNewRuleOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-[#121826] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-2xl p-6 z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Create Validation Rule</h3>
                <button onClick={() => setNewRuleOpen(false)} className="text-[#475569] hover:text-[#94A3B8] transition-colors"><X size={15} /></button>
              </div>
              <form onSubmit={handleNewRuleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Rule Name</label>
                  <input type="text" value={ruleName} onChange={e => setRuleName(e.target.value)} placeholder="e.g. email_valid_pattern" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Description</label>
                  <textarea value={ruleDescription} onChange={e => setRuleDescription(e.target.value)} placeholder="Validate that the email column contains a valid @ address structure" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] h-16" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Target Column</label>
                    <select value={targetColumn} onChange={e => setTargetColumn(e.target.value)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                      <option value="" className="bg-[#121826]">All Columns (Dataset)</option>
                      {dataset.schema?.map(col => (
                        <option key={col.name} value={col.name} className="bg-[#121826]">{col.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Rule Type</label>
                    <select value={ruleType} onChange={e => setRuleType(e.target.value)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                      <option value="null_check" className="bg-[#121826]">Null Check</option>
                      <option value="uniqueness" className="bg-[#121826]">Unique Check</option>
                      <option value="value_range" className="bg-[#121826]">Value Range</option>
                      <option value="regex_pattern" className="bg-[#121826]">Regex Pattern</option>
                      <option value="type_check" className="bg-[#121826]">Type Check</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Severity</label>
                    <select value={severity} onChange={e => setSeverity(e.target.value as any)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                      <option value="info" className="bg-[#121826]">Info (Log only)</option>
                      <option value="warning" className="bg-[#121826]">Warning (Notify)</option>
                      <option value="critical" className="bg-[#121826]">Critical (Stop Run)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Parameter / Value</label>
                    <input type="text" value={ruleParam} onChange={e => setRuleParam(e.target.value)} placeholder="e.g. [a-zA-Z0-9]+@.+" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" />
                  </div>
                </div>

                {ruleError && (
                  <div className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-2.5 flex items-center gap-1.5">
                    <AlertCircle size={13} /> {ruleError}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setNewRuleOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Create Rule</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
