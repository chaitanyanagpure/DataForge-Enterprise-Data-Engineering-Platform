import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Activity, TrendingUp, TrendingDown, AlertCircle, CheckCircle,
  Clock, Zap, BarChart2, RefreshCw,
} from 'lucide-react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { Card, Badge, Progress, SectionHeader, StatusDot, StatCard } from '@/components/ui'
import { MOCK_DASHBOARD_STATS } from '@/lib/mockData'
import { useAppStore } from '@/stores/appStore'
import { formatDuration } from '@/lib/utils'

const genSeries = (base: number, noise: number, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    t: new Date(Date.now() - (count - 1 - i) * 3600 * 1000).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    v: Math.max(0, Math.min(100, base + (Math.random() - 0.5) * noise * 2)),
  }))

export const ObservabilityPage: React.FC = () => {
  const { pipelines, addNotification } = useAppStore()
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Local state for statistics so they can update on refresh
  const [stats, setStats] = useState({
    systemHealth: '98.7%',
    systemHealthTrend: 0.2,
    avgExecTime: 315000,
    failureRate: '2.6%',
    failureRateTrend: -0.8,
    throughput: '4.2M/h',
    throughputTrend: 12.1
  })

  // Local state for charts data
  const [healthTimeSeries, setHealthTimeSeries] = useState(() => genSeries(88, 8, 24))
  const [execTimeSeries, setExecTimeSeries] = useState(() => genSeries(350, 100, 24))
  const [failureRateSeries, setFailureRateSeries] = useState(() => genSeries(5, 3, 24))
  const [resourceSeries, setResourceSeries] = useState(() => Array.from({ length: 24 }, (_, i) => ({
    t: `${i}:00`,
    cpu: 20 + Math.random() * 50,
    memory: 40 + Math.random() * 35,
  })))

  const healthMetrics = pipelines.map(p => ({
    pipelineId: p.id,
    pipelineName: p.name,
    lastRunStatus: p.lastRunStatus || 'idle',
    successRate: p.successRate,
    runs30d: p.totalRuns,
  }))

  const handleTimeRangeChange = (range: typeof timeRange) => {
    setTimeRange(range)
    const count = range === '1h' ? 12 : range === '6h' ? 18 : range === '24h' ? 24 : 30
    setHealthTimeSeries(genSeries(88, 5, count))
    setExecTimeSeries(genSeries(320, 80, count))
    setFailureRateSeries(genSeries(4, 2, count))
    setResourceSeries(Array.from({ length: count }, (_, i) => ({
      t: range === '7d' ? `Day ${i + 1}` : `${i}:00`,
      cpu: 15 + Math.random() * 60,
      memory: 35 + Math.random() * 40,
    })))
  }

  const handleRefresh = () => {
    if (isRefreshing) return
    setIsRefreshing(true)
    
    setTimeout(() => {
      // Slightly fluctuate metrics
      const newHealthVal = (98 + Math.random() * 1.5).toFixed(1) + '%'
      const newHealthTrend = Number(((Math.random() - 0.4) * 0.5).toFixed(2))
      const newExecTime = Math.floor(290000 + Math.random() * 50000)
      const newFailureVal = (2 + Math.random() * 1.5).toFixed(1) + '%'
      const newFailureTrend = Number(((Math.random() - 0.6) * 0.5).toFixed(2))
      const newThroughput = (4 + Math.random() * 0.6).toFixed(1) + 'M/h'
      const newThroughputTrend = Number((10 + Math.random() * 4).toFixed(1))

      setStats({
        systemHealth: newHealthVal,
        systemHealthTrend: newHealthTrend,
        avgExecTime: newExecTime,
        failureRate: newFailureVal,
        failureRateTrend: newFailureTrend,
        throughput: newThroughput,
        throughputTrend: newThroughputTrend
      })

      // Update time series
      const count = timeRange === '1h' ? 12 : timeRange === '6h' ? 18 : timeRange === '24h' ? 24 : 30
      setHealthTimeSeries(genSeries(88, 6, count))
      setExecTimeSeries(genSeries(330, 90, count))
      setFailureRateSeries(genSeries(4.5, 2.5, count))
      setResourceSeries(Array.from({ length: count }, (_, i) => ({
        t: timeRange === '7d' ? `Day ${i + 1}` : `${i}:00`,
        cpu: 18 + Math.random() * 55,
        memory: 38 + Math.random() * 38,
      })))

      addNotification({
        title: 'Metrics Refreshed',
        message: 'Observability metrics and SLA standings have been updated.',
        type: 'success'
      })

      setIsRefreshing(false)
    }, 800)
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-[#F8FAFC]">Observability</h2>
          <p className="text-sm text-[#64748B] mt-0.5">Real-time pipeline health and infrastructure monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 p-0.5 bg-[#161F32] border border-[rgba(255,255,255,0.06)] rounded-[8px]">
            {(['1h', '6h', '24h', '7d'] as const).map(range => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-3 py-1.5 text-xs rounded-[6px] font-medium transition-all ${
                  timeRange === range ? 'bg-[#6366F1] text-white' : 'text-[#64748B] hover:text-[#94A3B8]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-[8px] text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#6366F1]' : ''} />
          </button>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="System Health" value={stats.systemHealth} trend={stats.systemHealthTrend} icon={<Activity size={16} />} color="#10B981" />
        <StatCard label="Avg Exec Time" value={formatDuration(stats.avgExecTime)} icon={<Clock size={16} />} color="#6366F1" />
        <StatCard label="Failure Rate" value={stats.failureRate} trend={stats.failureRateTrend} icon={<AlertCircle size={16} />} color="#EF4444" />
        <StatCard label="Throughput" value={stats.throughput} trend={stats.throughputTrend} icon={<Zap size={16} />} color="#F59E0B" />
      </div>

      {/* Charts row 1 */}
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <Card padding="md" className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Data Health Score</h3>
            <Badge variant="success" dot>Live</Badge>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={healthTimeSeries}>
              <defs>
                <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
              <YAxis domain={[60, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 11 }} />
              <Area type="monotone" dataKey="v" name="Health %" stroke="#10B981" strokeWidth={2} fill="url(#healthGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Pipeline Health</h3>
          <div className="space-y-3">
            {healthMetrics.map(m => (
              <div key={m.pipelineId}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <StatusDot status={m.lastRunStatus === 'success' ? 'success' : m.lastRunStatus === 'failure' ? 'error' : 'running'} size="sm" />
                    <span className="text-xs text-[#94A3B8] truncate max-w-[120px]">{m.pipelineName.split(' ')[0]}</span>
                  </div>
                  <span className="text-xs font-semibold" style={{ color: m.successRate >= 90 ? '#10B981' : m.successRate >= 75 ? '#F59E0B' : '#EF4444' }}>
                    {m.successRate}%
                  </span>
                </div>
                <Progress value={m.successRate} color={m.successRate >= 90 ? '#10B981' : m.successRate >= 75 ? '#F59E0B' : '#EF4444'} size="sm" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <Card padding="md">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Execution Time Trend (avg seconds)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={execTimeSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 11 }} />
              <Line type="monotone" dataKey="v" name="Exec Time (s)" stroke="#6366F1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card padding="md">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Failure Rate (%)</h3>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={failureRateSeries}>
              <defs>
                <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 11 }} />
              <Area type="monotone" dataKey="v" name="Failure %" stroke="#EF4444" strokeWidth={2} fill="url(#failGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Resource Utilization */}
      <Card padding="md" className="mb-4">
        <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Resource Utilization</h3>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={resourceSeries.slice(-12)} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="t" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 10, fontSize: 11 }} formatter={(v: any) => [`${Number(v).toFixed(1)}%`]} />
            <Bar dataKey="cpu" name="CPU" fill="#6366F1" radius={[2, 2, 0, 0]} />
            <Bar dataKey="memory" name="Memory" fill="#06B6D4" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3">
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#6366F1] rounded" /><span className="text-xs text-[#64748B]">CPU</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#06B6D4] rounded" /><span className="text-xs text-[#64748B]">Memory</span></div>
        </div>
      </Card>

      {/* Data Freshness Table */}
      <Card padding="none">
        <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
          <h3 className="text-sm font-semibold text-[#F8FAFC]">Data Freshness SLAs</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[rgba(255,255,255,0.06)]">
              {['Pipeline', 'SLA', 'Last Run', 'Status', 'Freshness'].map(h => (
                <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#475569] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
            {pipelines.map(p => {
              const slaHours = p.trigger === 'scheduled' ? 24 : 6
              const lastRun = p.lastRunAt ? new Date(p.lastRunAt) : null
              const hoursSince = lastRun ? (Date.now() - lastRun.getTime()) / 3600000 : 999
              const isBreached = hoursSince > slaHours
              const freshness = Math.max(0, Math.min(100, ((slaHours - hoursSince) / slaHours) * 100))
              return (
                <tr key={p.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="px-5 py-3.5 text-xs font-medium text-[#F8FAFC]">{p.name}</td>
                  <td className="px-5 py-3.5 text-xs font-mono text-[#94A3B8]">{slaHours}h</td>
                  <td className="px-5 py-3.5 text-xs text-[#64748B]">{lastRun ? `${hoursSince.toFixed(1)}h ago` : '—'}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={isBreached ? 'error' : 'success'} dot>
                      {isBreached ? 'SLA Breached' : 'Within SLA'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 w-40">
                    <Progress value={freshness} color={isBreached ? '#EF4444' : '#10B981'} size="sm" />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
