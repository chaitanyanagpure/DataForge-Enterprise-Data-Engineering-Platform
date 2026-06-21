import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Workflow, Play, Pause, Plus, Clock, CheckCircle, XCircle,
  Calendar, BarChart2, TrendingUp, AlertCircle, ChevronRight,
  ToggleLeft, ToggleRight, Check, Trash2,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Card, Badge, Button, Progress, SectionHeader, StatusDot, Tabs } from '@/components/ui'
import { useAppStore } from '@/stores/appStore'
import { formatDuration, formatRelativeTime, CRON_PRESETS, isProjectMatch } from '@/lib/utils'
import type { Workflow as WorkflowType } from '@/types'

const parseCron = (cron: string | undefined): string => {
  if (!cron) return 'Manual only'
  const preset = CRON_PRESETS.find(p => p.value === cron)
  return preset?.label ?? cron
}

export const WorkflowsPage: React.FC = () => {
  const { addNotification, workflows, setWorkflows, workflowRuns, addWorkflowRun, activeProject } = useAppStore()

  const [activeTab, setActiveTab] = useState('workflows')
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType | null>(null)

  const projectWorkflows = workflows.filter(w => isProjectMatch(w.projectId, activeProject?.id))

  // Filter workflow runs belonging to workflows of the active project
  const projectWorkflowRuns = workflowRuns.filter(run => 
    projectWorkflows.some(w => w.id === run.workflowId)
  )

  // Create workflow form states
  const [newWorkflowName, setNewWorkflowName] = useState('')
  const [targetPipeline, setTargetPipeline] = useState('Customer ETL Pipeline')
  const [cronExpression, setCronExpression] = useState('0 2 * * *')
  const [alertEmail, setAlertEmail] = useState('')
  const [createError, setCreateError] = useState('')

  const tabs = [
    { id: 'workflows', label: 'Workflows', icon: <Workflow size={12} />, count: projectWorkflows.length },
    { id: 'history', label: 'Run History', icon: <Clock size={12} />, count: projectWorkflowRuns.length },
    { id: 'create', label: 'New Schedule', icon: <Plus size={12} /> },
  ]

  const runBarData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000)
    return {
      date: d.toLocaleDateString('en', { weekday: 'short' }),
      success: Math.floor(Math.random() * 8 + 4),
      failure: Math.floor(Math.random() * 3),
    }
  })

  const handleToggleWorkflow = (id: string) => {
    const updated = workflows.map(w => {
      if (w.id === id) {
        const nextActive = !w.isActive
        addNotification({
          title: nextActive ? 'Workflow Activated' : 'Workflow Paused',
          message: `Workflow schedule "${w.name}" has been ${nextActive ? 'activated' : 'paused'}.`,
          type: nextActive ? 'success' : 'info'
        })
        return { ...w, isActive: nextActive }
      }
      return w
    })
    setWorkflows(updated)
  }

  const handleRunWorkflow = (id: string, name: string) => {
    // 1. Create a stateful workflow run
    const newRun = {
      id: Math.random().toString(36).slice(2),
      workflowId: id,
      status: 'success' as const,
      startedAt: new Date().toISOString(),
      finishedAt: new Date(Date.now() + 5000).toISOString(),
      duration: Math.floor(180000 + Math.random() * 240000), // ~3 to 7 minutes
      triggeredBy: 'manual' as const,
    }

    addWorkflowRun(newRun)

    // 2. Update workflow stats in store
    const updated = workflows.map(w => {
      if (w.id === id) {
        const nextRunCount = w.runCount + 1
        const nextSuccessCount = w.successCount + 1
        return {
          ...w,
          runCount: nextRunCount,
          successCount: nextSuccessCount,
          lastRunAt: new Date().toISOString(),
          lastStatus: 'success' as const,
          avgDuration: w.avgDuration ? Math.round((w.avgDuration + newRun.duration) / 2) : newRun.duration
        }
      }
      return w
    })
    setWorkflows(updated)

    addNotification({
      title: 'Workflow Triggered',
      message: `Workflow run for "${name}" has been queued.`,
      type: 'success'
    })
  }

  const handleDeleteWorkflow = (id: string, name: string) => {
    const updated = workflows.filter(w => w.id !== id)
    setWorkflows(updated)
    addNotification({
      title: 'Workflow Deleted',
      message: `Workflow schedule "${name}" has been deleted.`,
      type: 'warning'
    })
  }

  const handleCreateWorkflowSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkflowName.trim()) {
      setCreateError('Workflow name is required.')
      return
    }

    const newWorkflow: WorkflowType = {
      id: Math.random().toString(36).slice(2),
      name: newWorkflowName.trim(),
      description: `Run ${targetPipeline} on schedule`,
      projectId: activeProject?.id || 'proj1',
      pipelineId: 'pl1',
      schedule: cronExpression,
      isActive: true,
      createdAt: new Date().toISOString(),
      runCount: 0,
      successCount: 0,
      failureCount: 0,
      avgDuration: 0,
    }

    setWorkflows([newWorkflow, ...workflows])
    addNotification({
      title: 'Workflow Registered',
      message: `Successfully created workflow "${newWorkflowName.trim()}".`,
      type: 'success'
    })

    setActiveTab('workflows')
    setNewWorkflowName('')
    setTargetPipeline('Customer ETL Pipeline')
    setCronExpression('0 2 * * *')
    setAlertEmail('')
    setCreateError('')
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <SectionHeader
        title="Workflow Automation"
        description="Schedule and monitor your data pipeline workflows"
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => { setActiveTab('create'); setCreateError(''); setNewWorkflowName(''); setTargetPipeline('Customer ETL Pipeline'); setCronExpression('0 2 * * *'); setAlertEmail('') }}>
            New Workflow
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Active Workflows', value: projectWorkflows.filter(w => w.isActive).length, color: '#10B981', icon: <Workflow size={15} /> },
          { label: 'Total Runs (30d)', value: projectWorkflowRuns.length, color: '#6366F1', icon: <Play size={15} /> },
          { label: 'Success Rate', value: projectWorkflowRuns.length > 0 ? `${((projectWorkflowRuns.filter(r => r.status === 'success').length / projectWorkflowRuns.length) * 100).toFixed(0)}%` : '0%', color: '#06B6D4', icon: <CheckCircle size={15} /> },
          { label: 'Failures (30d)', value: projectWorkflowRuns.filter(r => r.status === 'failure').length, color: '#EF4444', icon: <AlertCircle size={15} /> },
        ].map(s => (
          <div key={s.label} className="bg-[#161F32] border border-[rgba(255,255,255,0.06)] rounded-[12px] p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-[8px] shrink-0" style={{ backgroundColor: `${s.color}18`, border: `1px solid ${s.color}25` }}>
              <span style={{ color: s.color }}>{s.icon}</span>
            </div>
            <div>
              <p className="text-[10px] text-[#64748B] uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold text-[#F8FAFC]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Run chart */}
      <Card padding="md" className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Daily Run Summary (7 days)</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#10B981]" /><span className="text-xs text-[#64748B]">Success</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-[#EF4444]" /><span className="text-xs text-[#64748B]">Failure</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={runBarData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 11 }} />
            <Bar dataKey="success" fill="#10B981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="failure" fill="#EF4444" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'workflows' && (
        <div className="space-y-3">
          {projectWorkflows.map((workflow, i) => (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card hover onClick={() => setSelectedWorkflow(selectedWorkflow?.id === workflow.id ? null : workflow)}>
                <div className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-[8px] shrink-0 ${workflow.isActive ? 'bg-[rgba(16,185,129,0.10)] border border-[rgba(16,185,129,0.2)]' : 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)]'}`}>
                    <Workflow size={15} className={workflow.isActive ? 'text-[#10B981]' : 'text-[#475569]'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[#F8FAFC]">{workflow.name}</span>
                      <Badge variant={workflow.isActive ? 'success' : 'default'} dot>
                        {workflow.isActive ? 'active' : 'paused'}
                      </Badge>
                    </div>
                    <p className="text-xs text-[#64748B] mb-2">{workflow.description}</p>
                    <div className="flex items-center gap-4 text-[11px] text-[#475569]">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {parseCron(workflow.schedule)}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> Last run {workflow.lastRunAt ? formatRelativeTime(workflow.lastRunAt) : 'never'}</span>
                      <span className="flex items-center gap-1"><BarChart2 size={11} /> {workflow.runCount > 0 ? `${((workflow.successCount / workflow.runCount) * 100).toFixed(0)}% success (${workflow.runCount} runs)` : 'no runs'}</span>
                      <span className="flex items-center gap-1"><TrendingUp size={11} /> avg {formatDuration(workflow.avgDuration)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {workflow.lastStatus && (
                      <Badge variant={workflow.lastStatus === 'success' ? 'success' : workflow.lastStatus === 'failure' ? 'error' : 'info'}>
                        {workflow.lastStatus === 'success' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {workflow.lastStatus}
                      </Badge>
                    )}
                    <Button variant="ghost" size="xs" leftIcon={<Play size={11} />} onClick={(e) => { e.stopPropagation(); handleRunWorkflow(workflow.id, workflow.name) }}>Run</Button>
                    <button onClick={(e) => { e.stopPropagation(); handleToggleWorkflow(workflow.id) }} className="text-[#475569] hover:text-[#94A3B8] transition-colors mr-1">
                      {workflow.isActive ? <ToggleRight size={20} className="text-[#10B981]" /> : <ToggleLeft size={20} />}
                    </button>
                    <Button 
                      variant="danger" 
                      size="xs" 
                      leftIcon={<Trash2 size={11} />} 
                      onClick={(e) => { e.stopPropagation(); handleDeleteWorkflow(workflow.id, workflow.name) }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Success rate bar */}
                {workflow.runCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.04)]">
                    <Progress
                      value={(workflow.successCount / workflow.runCount) * 100}
                      color={workflow.successCount / workflow.runCount >= 0.9 ? '#10B981' : workflow.successCount / workflow.runCount >= 0.75 ? '#F59E0B' : '#EF4444'}
                      size="sm"
                    />
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'history' && (
        <Card padding="none">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {['Workflow', 'Status', 'Started', 'Duration', 'Triggered By', 'Error'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#475569] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {projectWorkflowRuns.map(run => {
                const workflow = workflows.find(w => w.id === run.workflowId)
                return (
                  <tr key={run.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-xs font-medium text-[#F8FAFC]">{workflow?.name ?? run.workflowId}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={run.status === 'success' ? 'success' : run.status === 'failure' ? 'error' : 'info'} dot>
                        {run.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#64748B]">{formatRelativeTime(run.startedAt)}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-[#94A3B8]">{run.duration ? formatDuration(run.duration) : '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-[#64748B] capitalize">{run.triggeredBy}</td>
                    <td className="px-5 py-3.5 text-xs text-[#EF4444]">{run.errorMessage ?? '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      {activeTab === 'create' && (
        <Card padding="md" className="max-w-lg">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-6">Create New Workflow Schedule</h3>
          <form onSubmit={handleCreateWorkflowSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1.5">Name</label>
              <input type="text" value={newWorkflowName} onChange={e => setNewWorkflowName(e.target.value)} className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-colors" placeholder="My Workflow" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1.5">Pipeline</label>
              <select value={targetPipeline} onChange={e => setTargetPipeline(e.target.value)} className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] cursor-pointer">
                {['Customer ETL Pipeline', 'Fraud Feature Pipeline', 'Supply Chain Aggregator', 'Recommendation Refresh'].map(p => (
                  <option key={p} value={p} className="bg-[#121826]">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1.5">Schedule</label>
              <div className="flex gap-2 flex-wrap mb-2">
                {CRON_PRESETS.map(p => (
                  <button type="button" key={p.value} onClick={() => setCronExpression(p.value)} className={`px-2.5 py-1 rounded-[6px] border text-xs transition-all ${cronExpression === p.value ? 'bg-[#6366F1] border-[#6366F1] text-white' : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.06)] text-[#64748B] hover:text-[#F8FAFC]'}`}>
                    {p.label}
                  </button>
                ))}
              </div>
              <input type="text" value={cronExpression} onChange={e => setCronExpression(e.target.value)} className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-2 text-sm text-[#F8FAFC] font-mono focus:outline-none focus:border-[#6366F1] transition-colors" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1.5">Alert On Failure</label>
              <input type="email" value={alertEmail} onChange={e => setAlertEmail(e.target.value)} className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[8px] px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-colors" placeholder="team@company.com" />
            </div>

            {createError && (
              <div className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-2.5 flex items-center gap-1.5">
                <AlertCircle size={13} /> {createError}
              </div>
            )}

            <Button type="submit" variant="primary" size="md">Create Workflow</Button>
          </form>
        </Card>
      )}
    </div>
  )
}
