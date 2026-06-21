import React, { useState, useCallback } from 'react'
import ReactFlow, {
  Background, Controls, MiniMap, useNodesState, useEdgesState,
  type Node, type Edge, type NodeTypes, BackgroundVariant, Handle, Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { motion, AnimatePresence } from 'framer-motion'
import { Network, Database, GitBranch, Star, Cpu, HardDrive, Link2, X, Info } from 'lucide-react'
import { Card, Badge, SectionHeader } from '@/components/ui'
import { MOCK_LINEAGE_NODES, MOCK_LINEAGE_EDGES } from '@/lib/mockData'
import type { LineageNode } from '@/types'

// ─── LINEAGE NODE CONFIGS ─────────────────────

const LINEAGE_TYPE_CONFIG = {
  source: { icon: <Database size={13} />, color: '#6366F1', label: 'Source' },
  dataset: { icon: <Database size={13} />, color: '#06B6D4', label: 'Dataset' },
  pipeline: { icon: <GitBranch size={13} />, color: '#10B981', label: 'Pipeline' },
  feature: { icon: <Star size={13} />, color: '#F59E0B', label: 'Feature' },
  model: { icon: <Cpu size={13} />, color: '#8B5CF6', label: 'Model' },
  sink: { icon: <HardDrive size={13} />, color: '#EF4444', label: 'Sink' },
}

// ─── CUSTOM LINEAGE NODE ──────────────────────

interface LineageNodeData {
  label: string
  nodeType: keyof typeof LINEAGE_TYPE_CONFIG
  description: string
  metadata: Record<string, unknown>
  selected?: boolean
}

const LineageNodeComponent: React.FC<{ data: LineageNodeData; selected: boolean }> = ({ data, selected }) => {
  const config = LINEAGE_TYPE_CONFIG[data.nodeType]
  return (
    <div
      style={{
        background: '#161F32',
        border: `1.5px solid ${selected ? config.color : 'rgba(255,255,255,0.10)'}`,
        borderRadius: 10,
        minWidth: 130,
        boxShadow: selected ? `0 0 20px ${config.color}40` : '0 4px 12px rgba(0,0,0,0.5)',
        transition: 'all 0.15s',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: config.color, border: '2px solid #161F32', width: 8, height: 8 }} />
      <div className="px-3.5 py-2.5">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${config.color}18`, border: `1px solid ${config.color}30` }}
          >
            <span style={{ color: config.color }}>{config.icon}</span>
          </div>
          <p className="text-[10px]" style={{ color: config.color }}>{config.label}</p>
        </div>
        <p className="text-[11px] font-semibold text-[#F8FAFC] whitespace-pre-line leading-tight">{data.label}</p>
      </div>
      <Handle type="source" position={Position.Right} style={{ background: config.color, border: '2px solid #161F32', width: 8, height: 8 }} />
    </div>
  )
}

const nodeTypes: NodeTypes = {
  lineageNode: LineageNodeComponent as React.ComponentType<any>,
}

// ─── Convert mock data to React Flow format ────

const toFlowNodes = (nodes: LineageNode[]): Node[] =>
  nodes.map(n => ({
    id: n.id,
    type: 'lineageNode',
    position: n.position,
    data: {
      label: n.label,
      nodeType: n.type as keyof typeof LINEAGE_TYPE_CONFIG,
      description: n.description,
      metadata: n.metadata,
    },
  }))

const toFlowEdges = (edges: typeof MOCK_LINEAGE_EDGES): Edge[] =>
  edges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    label: e.label,
    type: 'smoothstep',
    style: { stroke: 'rgba(99,102,241,0.4)', strokeWidth: 1.5 },
    labelStyle: { fill: '#475569', fontSize: 10, fontFamily: 'Inter' },
    markerEnd: { type: 'arrowclosed' as any, color: 'rgba(99,102,241,0.4)' },
  }))

// ─── LINEAGE PAGE ─────────────────────────────

export const LineagePage: React.FC = () => {
  const [nodes, , onNodesChange] = useNodesState(toFlowNodes(MOCK_LINEAGE_NODES))
  const [edges, , onEdgesChange] = useEdgesState(toFlowEdges(MOCK_LINEAGE_EDGES))
  const [selectedNode, setSelectedNode] = useState<LineageNodeData | null>(null)

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node.data as LineageNodeData)
  }, [])

  const typeFilters = Object.entries(LINEAGE_TYPE_CONFIG)
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set(Object.keys(LINEAGE_TYPE_CONFIG)))

  const toggleType = (type: string) => {
    setActiveTypes(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const filteredNodes = nodes.filter(n => activeTypes.has((n.data as LineageNodeData).nodeType))

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-6 py-4 border-b border-[rgba(255,255,255,0.06)] flex items-center gap-6 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-[#F8FAFC]">Data Lineage</h2>
          <p className="text-xs text-[#64748B] mt-0.5">Interactive end-to-end data lineage graph</p>
        </div>

        {/* Type filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {typeFilters.map(([type, cfg]) => (
            <button
              key={type}
              onClick={() => toggleType(type)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                activeTypes.has(type)
                  ? `border-[${cfg.color}40] text-[${cfg.color}]`
                  : 'border-[rgba(255,255,255,0.06)] text-[#475569]'
              }`}
              style={activeTypes.has(type) ? { borderColor: `${cfg.color}40`, color: cfg.color, backgroundColor: `${cfg.color}10` } : {}}
            >
              {cfg.icon}
              <span>{cfg.label}</span>
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-[#475569]">
          <Info size={12} />
          Click any node to inspect metadata
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Flow Canvas */}
        <div className="flex-1">
          <ReactFlow
            nodes={filteredNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="rgba(255,255,255,0.04)" />
            <Controls />
            <MiniMap
              nodeColor={node => {
                const cfg = LINEAGE_TYPE_CONFIG[(node.data as LineageNodeData)?.nodeType ?? 'dataset']
                return cfg?.color ?? '#6366F1'
              }}
              maskColor="rgba(10,15,28,0.8)"
            />
          </ReactFlow>
        </div>

        {/* Node Inspector Panel */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-[#121826] border-l border-[rgba(255,255,255,0.06)] flex flex-col overflow-hidden shrink-0"
            >
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-[6px] flex items-center justify-center"
                    style={{
                      backgroundColor: `${LINEAGE_TYPE_CONFIG[selectedNode.nodeType]?.color}18`,
                      border: `1px solid ${LINEAGE_TYPE_CONFIG[selectedNode.nodeType]?.color}30`
                    }}
                  >
                    <span style={{ color: LINEAGE_TYPE_CONFIG[selectedNode.nodeType]?.color }}>
                      {LINEAGE_TYPE_CONFIG[selectedNode.nodeType]?.icon}
                    </span>
                  </div>
                  <Badge variant={selectedNode.nodeType === 'source' ? 'indigo' : selectedNode.nodeType === 'model' ? 'info' : 'default'}>
                    {LINEAGE_TYPE_CONFIG[selectedNode.nodeType]?.label}
                  </Badge>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-1 text-[#475569] hover:text-[#94A3B8] transition-colors">
                  <X size={13} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <p className="text-sm font-bold text-[#F8FAFC] whitespace-pre-line leading-tight">{selectedNode.label}</p>
                  <p className="text-xs text-[#64748B] mt-1">{selectedNode.description}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-[#475569] uppercase tracking-widest">Metadata</p>
                  {Object.entries(selectedNode.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center py-1.5 border-b border-[rgba(255,255,255,0.04)]">
                      <span className="text-xs text-[#64748B] capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="text-xs font-mono text-[#94A3B8]">{String(value)}</span>
                    </div>
                  ))}
                </div>

                {/* Upstream/Downstream counts */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Upstream', count: edges.filter(e => e.target === nodes.find(n => n.data.label === selectedNode.label)?.id).length },
                    { label: 'Downstream', count: edges.filter(e => e.source === nodes.find(n => n.data.label === selectedNode.label)?.id).length },
                  ].map(d => (
                    <div key={d.label} className="bg-[#0A0F1C] rounded-[8px] p-3 border border-[rgba(255,255,255,0.04)] text-center">
                      <p className="text-[10px] text-[#475569] uppercase">{d.label}</p>
                      <p className="text-xl font-bold text-[#F8FAFC]">{d.count}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.15)]">
                  <Link2 size={12} className="text-[#6366F1]" />
                  <span className="text-[11px] text-[#6366F1]">View full lineage subgraph</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-t border-[rgba(255,255,255,0.06)] flex items-center gap-6 shrink-0">
        {typeFilters.map(([type, cfg]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: cfg.color }} />
            <span className="text-[11px] text-[#475569]">{cfg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
