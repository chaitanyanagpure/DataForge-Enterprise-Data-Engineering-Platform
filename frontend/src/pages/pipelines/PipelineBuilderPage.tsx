import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactFlow, {
  Background, Controls, MiniMap, addEdge, useNodesState, useEdgesState,
  type Node, type Edge, type Connection, type NodeTypes, BackgroundVariant,
  Handle, Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import {
  Database, ShieldCheck, Sparkles, HardDrive, Play, Save,
  Plus, X, Settings, ChevronRight, Clock, CheckCircle, XCircle,
  Filter, Merge, LayoutGrid, Zap, GitBranch, Trash2,
} from 'lucide-react'
import { Card, Badge, Button, StatusDot, Tabs, SectionHeader } from '@/components/ui'
import { useAppStore } from '@/stores/appStore'
import { formatDuration, formatRelativeTime, isProjectMatch } from '@/lib/utils'
import type { Pipeline, PipelineNode, PipelineEdge, PipelineRun } from '@/types'

// ─── NODE CONFIGS ─────────────────────────────

const NODE_TYPE_CONFIG = {
  source: { label: 'Data Source', icon: <Database size={14} />, color: '#6366F1', bg: '#6366F115' },
  validation: { label: 'Validation', icon: <ShieldCheck size={14} />, color: '#10B981', bg: '#10B98115' },
  cleaning: { label: 'Cleaning', icon: <Sparkles size={14} />, color: '#06B6D4', bg: '#06B6D415' },
  transformation: { label: 'Transformation', icon: <Zap size={14} />, color: '#F59E0B', bg: '#F59E0B15' },
  feature_engineering: { label: 'Feature Eng.', icon: <Sparkles size={14} />, color: '#8B5CF6', bg: '#8B5CF615' },
  storage: { label: 'Storage', icon: <HardDrive size={14} />, color: '#EF4444', bg: '#EF444415' },
  filter: { label: 'Filter', icon: <Filter size={14} />, color: '#F97316', bg: '#F9731615' },
  join: { label: 'Join', icon: <Merge size={14} />, color: '#14B8A6', bg: '#14B8A615' },
  aggregate: { label: 'Aggregate', icon: <LayoutGrid size={14} />, color: '#EC4899', bg: '#EC489915' },
}

// ─── CUSTOM NODE COMPONENT ────────────────────

interface PipelineNodeData {
  label: string
  type: keyof typeof NODE_TYPE_CONFIG
  status?: 'idle' | 'running' | 'success' | 'error'
  config?: Record<string, unknown>
  onSelect?: (id: string) => void
}

const PipelineNodeComponent: React.FC<{ data: PipelineNodeData; id: string; selected: boolean }> = ({ data, id, selected }) => {
  const config = NODE_TYPE_CONFIG[data.type] ?? NODE_TYPE_CONFIG.source
  const statusColors = { idle: undefined, running: '#3B82F6', success: '#10B981', error: '#EF4444' }
  const statusColor = statusColors[data.status ?? 'idle']

  return (
    <div
      className="relative"
      style={{
        background: '#161F32',
        border: `1px solid ${selected ? config.color : 'rgba(255,255,255,0.10)'}`,
        borderRadius: 10,
        minWidth: 160,
        boxShadow: selected ? `0 0 16px ${config.color}30` : '0 4px 12px rgba(0,0,0,0.5)',
        transition: 'all 0.15s ease',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: config.color, border: '2px solid #161F32', width: 10, height: 10 }} />

      <div className="px-3.5 py-2.5">
        <div className="flex items-center gap-2 mb-1.5">
          <div
            className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: config.bg, border: `1px solid ${config.color}30` }}
          >
            <span style={{ color: config.color }}>{config.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold text-[#F8FAFC] truncate">{data.label}</p>
            <p className="text-[10px]" style={{ color: config.color }}>{config.label}</p>
          </div>
          {statusColor && (
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor, boxShadow: `0 0 6px ${statusColor}80` }} />
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} style={{ background: config.color, border: '2px solid #161F32', width: 10, height: 10 }} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  pipelineNode: PipelineNodeComponent as React.ComponentType<any>,
}

// ─── NODE PALETTE ─────────────────────────────

const NODE_PALETTE = Object.entries(NODE_TYPE_CONFIG).map(([type, cfg]) => ({ type, ...cfg }))

// ─── PIPELINE BUILDER PAGE ────────────────────

const pipelineToNodes = (pipeline: Pipeline): Node[] =>
  pipeline.nodes.map((n: PipelineNode) => ({
    id: n.id,
    type: 'pipelineNode',
    position: n.position,
    data: {
      label: n.label,
      type: n.type as keyof typeof NODE_TYPE_CONFIG,
      status: n.status ?? 'idle',
      config: n.config,
    },
    selected: false,
  }))

const pipelineToEdges = (pipeline: Pipeline): Edge[] =>
  pipeline.edges.map((e: PipelineEdge) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'smoothstep',
    style: { stroke: '#6366F150', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed' as any, color: '#6366F1' },
  }))

export const PipelineBuilderPage: React.FC = () => {
  const { activeProject, pipelines, pipelineRuns, updatePipeline, addPipelineRun, addNotification } = useAppStore()
  
  // Find pipeline for the active project
  const activePipeline = pipelines.find(p => isProjectMatch(p.projectId, activeProject?.id)) || pipelines[0]
  
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('builder')
  const [isRunning, setIsRunning] = useState(false)

  // Settings form states
  const [pipelineName, setPipelineName] = useState('')
  const [pipelineDesc, setPipelineDesc] = useState('')
  const [pipelineTrigger, setPipelineTrigger] = useState('manual')
  const [pipelineSchedule, setPipelineSchedule] = useState('')
  const [showSavedPopup, setShowSavedPopup] = useState(false)

  // Sync state when active pipeline changes
  useEffect(() => {
    if (activePipeline) {
      setNodes(pipelineToNodes(activePipeline))
      setEdges(pipelineToEdges(activePipeline))
      setPipelineName(activePipeline.name)
      setPipelineDesc(activePipeline.description || '')
      setPipelineTrigger(activePipeline.trigger)
      setPipelineSchedule(activePipeline.schedule || '')
    }
  }, [activePipeline?.id, setNodes, setEdges])

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ ...params, type: 'smoothstep', style: { stroke: '#6366F150', strokeWidth: 2 }, markerEnd: { type: 'arrowclosed' as any, color: '#6366F1' } }, eds))
  }, [setEdges])

  const handleAddNode = (type: string) => {
    const config = NODE_TYPE_CONFIG[type as keyof typeof NODE_TYPE_CONFIG]
    const newNode: Node = {
      id: `n-${Date.now()}`,
      type: 'pipelineNode',
      position: { x: 200 + Math.random() * 400, y: 100 + Math.random() * 200 },
      data: { label: config.label, type, status: 'idle' },
    }
    setNodes(ns => [...ns, newNode])
  }

  const handleSave = () => {
    const savedNodes = nodes.map(n => ({
      id: n.id,
      type: n.data.type as any,
      label: n.data.label,
      description: n.data.description || '',
      position: n.position,
      config: n.data.config || {},
      status: n.data.status
    }))

    const savedEdges = edges.map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle || undefined,
      targetHandle: e.targetHandle || undefined
    }))

    updatePipeline(activePipeline.id, {
      nodes: savedNodes,
      edges: savedEdges
    })

    addNotification({
      title: 'Pipeline Saved',
      message: `Pipeline configuration for "${activePipeline.name}" has been successfully saved.`,
      type: 'success'
    })
  }

  const handleRun = async () => {
    setIsRunning(true)
    addNotification({
      title: 'Pipeline Triggered',
      message: `Execution run for pipeline "${activePipeline.name}" has started.`,
      type: 'info'
    })
    
    // Simulate run animation
    for (let i = 0; i < nodes.length; i++) {
      setNodes(ns => ns.map((n, idx) => idx === i ? { ...n, data: { ...n.data, status: 'running' } } : n))
      await new Promise(r => setTimeout(r, 600))
      setNodes(ns => ns.map((n, idx) => idx === i ? { ...n, data: { ...n.data, status: 'success' } } : n))
    }
    
    setIsRunning(false)

    // Create new PipelineRun object
    const runId = `run-${Math.random().toString(36).slice(2, 9)}`
    const startedAt = new Date().toISOString()
    const nodesStatus: Record<string, 'pending' | 'running' | 'success' | 'error'> = {}
    nodes.forEach(n => {
      nodesStatus[n.id] = 'success'
    })
    
    const newRun: PipelineRun = {
      id: runId,
      pipelineId: activePipeline.id,
      status: 'success',
      startedAt,
      finishedAt: new Date().toISOString(),
      duration: nodes.length * 600,
      triggeredBy: 'manual',
      nodesStatus,
      logs: [
        { timestamp: startedAt, level: 'info', message: 'Pipeline execution started' },
        { timestamp: new Date(Date.now() + 200).toISOString(), level: 'info', message: 'Connecting to data sources...' },
        ...nodes.map((n, index) => ({
          timestamp: new Date(Date.now() + 200 + index * 600).toISOString(),
          level: 'info' as const,
          message: `Execution of node "${n.data.label}" completed successfully.`,
          nodeId: n.id
        })),
        { timestamp: new Date().toISOString(), level: 'info', message: 'Pipeline run completed successfully' }
      ]
    }
    
    addPipelineRun(newRun)

    // Update pipeline run stats
    updatePipeline(activePipeline.id, {
      lastRunAt: startedAt,
      lastRunStatus: 'success',
      lastRunDuration: nodes.length * 600,
      totalRuns: activePipeline.totalRuns + 1,
    })
    
    addNotification({
      title: 'Pipeline Run Completed',
      message: `Pipeline "${activePipeline.name}" executed successfully with 0 failures.`,
      type: 'success'
    })
  }

  const handleSaveSettings = () => {
    updatePipeline(activePipeline.id, {
      name: pipelineName,
      description: pipelineDesc,
      trigger: pipelineTrigger as any,
      schedule: pipelineSchedule,
    })
    
    addNotification({
      title: 'Settings Saved',
      message: `Pipeline settings for "${pipelineName}" have been updated successfully.`,
      type: 'success'
    })
    
    setShowSavedPopup(true)
  }

  const activeRuns = pipelineRuns.filter(run => run.pipelineId === activePipeline?.id)

  const tabs = [
    { id: 'builder', label: 'Builder', icon: <GitBranch size={12} /> },
    { id: 'runs', label: 'Run History', icon: <Clock size={12} />, count: activeRuns.length },
    { id: 'settings', label: 'Settings', icon: <Settings size={12} /> },
  ]

  const selectedNodeData = nodes.find(n => n.id === selectedNode)

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-4">
        <div className="flex-1">
          <h2 className="text-sm font-semibold text-[#F8FAFC]">{activePipeline.name}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <StatusDot status={activePipeline.status === 'active' ? 'success' : activePipeline.status === 'error' ? 'error' : 'idle'} size="sm" />
            <span className="text-xs text-[#64748B] capitalize">{activePipeline.status}</span>
            <span className="text-xs text-[#334155]">·</span>
            <span className="text-xs text-[#64748B]">{activePipeline.totalRuns} runs · {activePipeline.successRate}% success</span>
          </div>
        </div>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" leftIcon={<Save size={13} />} onClick={handleSave}>Save</Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={isRunning ? undefined : <Play size={13} />}
            loading={isRunning}
            onClick={handleRun}
          >
            {isRunning ? 'Running...' : 'Run Now'}
          </Button>
        </div>
      </div>

      {activeTab === 'builder' && (
        <div className="flex flex-1 overflow-hidden">
          {/* Node Palette */}
          <div className="w-52 bg-[#0A0F1C] border-r border-[rgba(255,255,255,0.06)] flex flex-col overflow-y-auto shrink-0">
            <div className="px-3 py-3 border-b border-[rgba(255,255,255,0.06)]">
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Node Types</p>
              <p className="text-[11px] text-[#334155] mt-0.5">Drag to canvas or click to add</p>
            </div>
            <div className="p-2 space-y-1">
              {NODE_PALETTE.map(nodeType => (
                <button
                  key={nodeType.type}
                  onClick={() => handleAddNode(nodeType.type)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[8px] hover:bg-[rgba(255,255,255,0.04)] transition-colors group text-left"
                >
                  <div
                    className="w-6 h-6 rounded-[6px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: nodeType.bg, border: `1px solid ${nodeType.color}30` }}
                  >
                    <span style={{ color: nodeType.color }}>{nodeType.icon}</span>
                  </div>
                  <span className="text-xs text-[#64748B] group-hover:text-[#94A3B8] transition-colors">{nodeType.label}</span>
                  <Plus size={10} className="ml-auto text-[#334155] group-hover:text-[#475569] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onNodeClick={(_, node) => setSelectedNode(node.id === selectedNode ? null : node.id)}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              proOptions={{ hideAttribution: true }}
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(255,255,255,0.05)" />
              <Controls />
              <MiniMap
                nodeColor={node => {
                  const cfg = NODE_TYPE_CONFIG[(node.data as PipelineNodeData)?.type ?? 'source']
                  return cfg?.color ?? '#6366F1'
                }}
                maskColor="rgba(10,15,28,0.8)"
              />
            </ReactFlow>
          </div>

          {/* Node Config Panel */}
          <AnimatePresence>
            {selectedNode && selectedNodeData && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#121826] border-l border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden shrink-0"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <p className="text-xs font-semibold text-[#F8FAFC]">Node Config</p>
                  <button onClick={() => setSelectedNode(null)} className="p-1 text-[#475569] hover:text-[#94A3B8] transition-colors">
                    <X size={12} />
                  </button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  {(() => {
                    const nodeType = (selectedNodeData.data as PipelineNodeData).type
                    const cfg = NODE_TYPE_CONFIG[nodeType]
                    return (
                      <>
                        <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-[rgba(255,255,255,0.06)]">
                          <div className="w-8 h-8 rounded-[8px] flex items-center justify-center" style={{ backgroundColor: cfg?.bg, border: `1px solid ${cfg?.color}30` }}>
                            <span style={{ color: cfg?.color }}>{cfg?.icon}</span>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-[#F8FAFC]">{(selectedNodeData.data as PipelineNodeData).label}</p>
                            <p className="text-[11px]" style={{ color: cfg?.color }}>{cfg?.label}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {nodeType === 'source' && (
                            <>
                              <div>
                                <label className="block text-[10px] font-medium text-[#475569] uppercase tracking-wide mb-1.5">Source Type</label>
                                <select className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                                  {['PostgreSQL', 'MySQL', 'S3', 'REST API', 'Kafka'].map(s => (
                                    <option key={s} className="bg-[#121826]">{s}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-[#475569] uppercase tracking-wide mb-1.5">Connection</label>
                                <input className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-2 text-xs text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1]" placeholder="db.nexus.io:5432" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-[#475569] uppercase tracking-wide mb-1.5">Table / Query</label>
                                <textarea className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-2 text-xs text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] font-mono resize-none" rows={3} placeholder="SELECT * FROM customers WHERE..." />
                              </div>
                            </>
                          )}
                          {nodeType === 'validation' && (
                            <>
                              <div>
                                <label className="block text-[10px] font-medium text-[#475569] uppercase tracking-wide mb-1.5">Mode</label>
                                <select className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                                  <option className="bg-[#121826]">Strict (fail on any error)</option>
                                  <option className="bg-[#121826]">Warn (continue with warnings)</option>
                                </select>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#94A3B8]">Schema validation</span>
                                <div className="w-8 h-4 bg-[#6366F1] rounded-full relative cursor-pointer">
                                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#94A3B8]">Null checks</span>
                                <div className="w-8 h-4 bg-[#6366F1] rounded-full relative cursor-pointer">
                                  <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full" />
                                </div>
                              </div>
                            </>
                          )}
                          {nodeType === 'cleaning' && (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-[#94A3B8]">Drop null rows</span>
                                <div className="w-8 h-4 bg-[rgba(255,255,255,0.06)] rounded-full relative cursor-pointer">
                                  <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-[#64748B] rounded-full" />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-[#475569] uppercase tracking-wide mb-1.5">Fill Strategy</label>
                                <select className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                                  {['Median', 'Mean', 'Mode', 'Zero', 'Forward fill'].map(s => (
                                    <option key={s} className="bg-[#121826]">{s}</option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}
                          {(nodeType === 'transformation' || nodeType === 'feature_engineering') && (
                            <>
                              <div>
                                <label className="block text-[10px] font-medium text-[#475569] uppercase tracking-wide mb-1.5">Transform Script</label>
                                <textarea className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-2 text-xs text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] font-mono resize-none" rows={5} placeholder="# PySpark transform&#10;df = df.withColumn('clv',&#10;  F.log1p(F.col('spend')))" />
                              </div>
                            </>
                          )}
                          {nodeType === 'storage' && (
                            <>
                              <div>
                                <label className="block text-[10px] font-medium text-[#475569] uppercase tracking-wide mb-1.5">Destination</label>
                                <select className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                                  {['MinIO / S3', 'PostgreSQL', 'Feature Store', 'Data Catalog'].map(s => (
                                    <option key={s} className="bg-[#121826]">{s}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-medium text-[#475569] uppercase tracking-wide mb-1.5">Format</label>
                                <select className="w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.08)] rounded-[6px] px-2.5 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                                  {['Parquet', 'CSV', 'JSON', 'Delta'].map(s => (
                                    <option key={s} className="bg-[#121826]">{s}</option>
                                  ))}
                                </select>
                              </div>
                            </>
                          )}

                          <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
                            <Button variant="danger" size="xs" leftIcon={<Trash2 size={11} />} onClick={() => {
                              setNodes(ns => ns.filter(n => n.id !== selectedNode))
                              setSelectedNode(null)
                            }}>
                              Remove Node
                            </Button>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {activeTab === 'runs' && (
        <div className="p-6 overflow-y-auto flex-1">
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    {['Run ID', 'Status', 'Started', 'Duration', 'Triggered By', 'Nodes'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#475569] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {activeRuns.map(run => (
                    <tr key={run.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-5 py-3.5 text-xs font-mono text-[#94A3B8]">#{run.id}</td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={run.status === 'success' ? 'success' : run.status === 'failure' ? 'error' : 'info'}
                          dot
                        >
                          {run.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-[#64748B]">{formatRelativeTime(run.startedAt)}</td>
                      <td className="px-5 py-3.5 text-xs font-mono text-[#94A3B8]">{run.duration ? formatDuration(run.duration) : '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-[#64748B] capitalize">{run.triggeredBy}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1">
                          {Object.entries(run.nodesStatus).map(([nodeId, status]) => (
                            <div
                              key={nodeId}
                              className="w-2 h-2 rounded-full"
                              title={`${nodeId}: ${status}`}
                              style={{
                                backgroundColor: status === 'success' ? '#10B981' : status === 'error' ? '#EF4444' : status === 'running' ? '#3B82F6' : '#475569',
                              }}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Logs */}
            <div className="border-t border-[rgba(255,255,255,0.06)] p-4">
              <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest mb-3">Execution Logs — Latest Run</p>
              <div className="bg-[#0A0F1C] rounded-[8px] p-3 font-mono text-[11px] max-h-48 overflow-y-auto space-y-1">
                {activeRuns.length > 0 ? (
                  activeRuns[0].logs.map((log, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-[#334155] whitespace-nowrap">{new Date(log.timestamp).toISOString().slice(11, 19)}</span>
                      <span className={
                        log.level === 'error' ? 'text-[#EF4444]' :
                        log.level === 'warning' ? 'text-[#F59E0B]' :
                        log.level === 'debug' ? 'text-[#475569]' :
                        'text-[#64748B]'
                      }>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-[#94A3B8]">{log.message}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#475569] py-2 text-center">No execution logs available. Run the pipeline to generate logs.</div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-6 overflow-y-auto flex-1">
          <div className="max-w-lg space-y-6">
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-2">Pipeline Name</label>
              <input value={pipelineName} onChange={e => setPipelineName(e.target.value)} className="w-full bg-[#161F32] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-2">Description</label>
              <textarea value={pipelineDesc} onChange={e => setPipelineDesc(e.target.value)} className="w-full bg-[#161F32] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] transition-colors resize-none" rows={3} />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-2">Trigger</label>
              <select value={pipelineTrigger} onChange={e => setPipelineTrigger(e.target.value as any)} className="w-full bg-[#161F32] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] cursor-pointer">
                {['manual', 'scheduled', 'event'].map(t => (
                  <option key={t} value={t} className="bg-[#121826]">{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-2">Cron Schedule</label>
              <input value={pipelineSchedule} onChange={e => setPipelineSchedule(e.target.value)} className="w-full bg-[#161F32] border border-[rgba(255,255,255,0.08)] rounded-[8px] px-3 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] font-mono transition-colors" placeholder="0 2 * * *" />
              <p className="text-xs text-[#475569] mt-1.5">Current: Daily at 2:00 AM UTC</p>
            </div>
            <Button variant="primary" size="md" onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </div>
      )}

      {/* Settings Saved Confirmation Modal */}
      <AnimatePresence>
        {showSavedPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSavedPopup(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-sm bg-[#121826] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-2xl p-6 z-10 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.2)] flex items-center justify-center mx-auto text-[#10B981]">
                <CheckCircle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Settings Saved</h3>
                <p className="text-xs text-[#64748B]">Pipeline settings for "{pipelineName}" updated successfully.</p>
              </div>
              <div className="pt-2">
                <Button variant="primary" size="sm" className="w-full" onClick={() => setShowSavedPopup(false)}>
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
