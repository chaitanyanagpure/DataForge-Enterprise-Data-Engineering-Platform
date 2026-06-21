import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import {
  Database, GitBranch, ShieldCheck, AlertCircle, HardDrive,
  Activity, Zap, TrendingUp, Clock, CheckCircle, XCircle,
  MoreHorizontal, ArrowRight, Star,
} from 'lucide-react'
import {
  Card, StatCard, Badge, Progress, StatusDot, Divider, SectionHeader,
} from '@/components/ui'
import { MOCK_DASHBOARD_STATS, MOCK_DATASETS, MOCK_NOTIFICATIONS } from '@/lib/mockData'
import { useAppStore } from '@/stores/appStore'
import { formatBytes, formatNumber, formatRelativeTime, getStatusColor } from '@/lib/utils'

const CustomTooltip: React.FC<{ active?: boolean; payload?: { value: number; name: string }[]; label?: string }> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#121826] border border-[rgba(255,255,255,0.10)] rounded-[10px] px-3 py-2.5 shadow-xl">
      <p className="text-xs text-[#64748B] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs font-semibold text-[#F8FAFC]">{formatNumber(p.value)} {p.name === 'rows' ? 'rows' : ''}</p>
      ))}
    </div>
  )
}

const container = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.3 } } }

export const DashboardPage: React.FC = () => {
  const { datasets, pipelines } = useAppStore()
  const stats = MOCK_DASHBOARD_STATS
  const storagePercent = (stats.storageUsed / stats.storageTotal) * 100

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">

        {/* ─── TOP STATS ─────────────────────────── */}
        <motion.div variants={item} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Data Health Score"
            value={`${stats.dataHealthScore}%`}
            trend={stats.dataHealthTrend}
            subValue="vs last week"
            icon={<ShieldCheck size={16} />}
            color="#10B981"
          />
          <StatCard
            label="Active Pipelines"
            value={`${stats.activePipelines}/${stats.totalPipelines}`}
            subValue={`${stats.totalPipelines - stats.activePipelines} paused`}
            icon={<GitBranch size={16} />}
            color="#6366F1"
          />
          <StatCard
            label="Total Datasets"
            value={stats.totalDatasets}
            subValue={`${stats.activeDatasets} ready`}
            icon={<Database size={16} />}
            color="#06B6D4"
          />
          <StatCard
            label="Failed Jobs"
            value={stats.failedJobs}
            trend={stats.failedJobsTrend}
            subValue="last 24h"
            icon={<AlertCircle size={16} />}
            color="#EF4444"
          />
        </motion.div>

        {/* ─── CHARTS ROW ────────────────────────── */}
        <motion.div variants={item} className="grid md:grid-cols-3 gap-4">
          {/* Processing Volume */}
          <Card className="md:col-span-2" padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Processing Volume</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Rows processed per day (14 days)</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-[#10B981]" />
                <span className="text-xs text-[#10B981] font-medium">+{stats.processingTrend}%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={stats.chartData.dailyProcessing}>
                <defs>
                  <linearGradient id="rowsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="rows" name="rows" stroke="#6366F1" strokeWidth={2} fill="url(#rowsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Pipeline Status Donut */}
          <Card padding="md">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Pipeline Runs (30d)</h3>
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={stats.chartData.pipelineStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={3} dataKey="value">
                    {stats.chartData.pipelineStatus.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {stats.chartData.pipelineStatus.map(s => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-xs text-[#94A3B8]">{s.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-[#F8FAFC]">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ─── QUALITY TREND + STORAGE ───────────── */}
        <motion.div variants={item} className="grid md:grid-cols-3 gap-4">
          <Card className="md:col-span-2" padding="md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Data Quality Trend</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Average quality score across all datasets</p>
              </div>
              <Badge variant="success" dot>
                {stats.avgQualityScore.toFixed(1)}% avg
              </Badge>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={stats.chartData.qualityTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[60, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 11 }} />
                <Bar dataKey="score" radius={[3, 3, 0, 0]}>
                  {stats.chartData.qualityTrend.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 90 ? '#10B981' : entry.score >= 75 ? '#F59E0B' : '#EF4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card padding="md">
            <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Storage Usage</h3>
            <div className="flex items-end gap-1 mb-2">
              <span className="text-2xl font-bold text-[#F8FAFC]">{formatBytes(stats.storageUsed)}</span>
              <span className="text-xs text-[#64748B] mb-1">/ {formatBytes(stats.storageTotal)}</span>
            </div>
            <Progress value={storagePercent} color={storagePercent > 80 ? '#F59E0B' : '#6366F1'} showValue size="md" className="mb-4" />
            <Divider className="mb-4" />
            <div className="space-y-3">
              {[
                { label: 'Raw datasets', used: 8_100_000_000, color: '#6366F1' },
                { label: 'Processed data', used: 4_124_000_000, color: '#06B6D4' },
                { label: 'Feature store', used: 1_502_000_000, color: '#10B981' },
              ].map(s => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#64748B]">{s.label}</span>
                    <span className="text-[#94A3B8] font-medium">{formatBytes(s.used)}</span>
                  </div>
                  <Progress value={(s.used / stats.storageTotal) * 100} color={s.color} size="sm" />
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ─── PIPELINES + RECENT DATASETS ───────── */}
        <motion.div variants={item} className="grid md:grid-cols-2 gap-4">
          {/* Active Pipelines */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Pipeline Status</h3>
              <button className="text-xs text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1 transition-colors">
                View all <ArrowRight size={11} />
              </button>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {pipelines.map(pipeline => (
                <div key={pipeline.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <StatusDot
                    status={pipeline.lastRunStatus === 'success' ? 'success' : pipeline.lastRunStatus === 'failure' ? 'error' : 'running'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#F8FAFC] truncate">{pipeline.name}</p>
                    <p className="text-[11px] text-[#475569]">
                      {pipeline.lastRunAt ? formatRelativeTime(pipeline.lastRunAt) : 'Never run'} · {pipeline.successRate}% success
                    </p>
                  </div>
                  <Badge
                    variant={pipeline.status === 'active' ? 'success' : pipeline.status === 'error' ? 'error' : 'default'}
                    dot
                  >
                    {pipeline.status}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Datasets */}
          <Card padding="none">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Recent Datasets</h3>
              <button className="text-xs text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1 transition-colors">
                View all <ArrowRight size={11} />
              </button>
            </div>
            <div className="divide-y divide-[rgba(255,255,255,0.04)]">
              {datasets.slice(0, 4).map(ds => (
                <div key={ds.id} className="px-5 py-3.5 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <div className="w-7 h-7 rounded-[6px] bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.15)] flex items-center justify-center shrink-0">
                    <Database size={12} className="text-[#6366F1]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[#F8FAFC] truncate font-mono">{ds.name}</p>
                    <p className="text-[11px] text-[#475569]">{formatNumber(ds.rowCount)} rows · {formatBytes(ds.sizeBytes)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold" style={{ color: ds.qualityScore >= 90 ? '#10B981' : ds.qualityScore >= 70 ? '#F59E0B' : '#EF4444' }}>
                      {ds.qualityScore}%
                    </div>
                    <div className="text-[10px] text-[#475569]">quality</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* ─── ACTIVITY FEED ─────────────────────── */}
        <motion.div variants={item}>
          <Card padding="none">
            <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
              <h3 className="text-sm font-semibold text-[#F8FAFC]">Activity Timeline</h3>
            </div>
            <div className="px-5 py-4 space-y-4">
              {MOCK_NOTIFICATIONS.map((notif, i) => (
                <div key={notif.id} className="flex gap-3">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                    notif.type === 'success' ? 'bg-[#10B981]' :
                    notif.type === 'error' ? 'bg-[#EF4444]' :
                    notif.type === 'warning' ? 'bg-[#F59E0B]' : 'bg-[#3B82F6]'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-[#F8FAFC]">{notif.title}</p>
                      {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1]" />}
                    </div>
                    <p className="text-[11px] text-[#64748B] mt-0.5">{notif.message}</p>
                    <p className="text-[10px] text-[#475569] mt-1">{formatRelativeTime(notif.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  )
}
