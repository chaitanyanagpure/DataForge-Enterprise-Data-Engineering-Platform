import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, Search, Plus, Database, Code, Cpu, Tag,
  TrendingUp, CheckCircle, XCircle, Wifi, WifiOff,
  ChevronRight, BarChart2, User, Clock, X, AlertCircle,
} from 'lucide-react'
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import { Card, Badge, Button, Input, Progress, SectionHeader, StatusDot, Divider } from '@/components/ui'
import { MOCK_FEATURES } from '@/lib/mockData'
import { useAppStore } from '@/stores/appStore'
import { formatRelativeTime, formatNumber, isProjectMatch } from '@/lib/utils'
import type { Feature } from '@/types'

const FeatureSparkline: React.FC<{ color: string }> = ({ color }) => {
  const data = Array.from({ length: 14 }, (_, i) => ({ v: 50 + Math.sin(i * 0.8) * 30 + Math.random() * 20 }))
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`sg-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${color})`} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

const FeatureDetailPanel: React.FC<{ feature: Feature; onClose: () => void }> = ({ feature, onClose }) => {
  const histData = Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 86400000).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
    value: (feature.statistics?.mean ?? 0) + Math.sin(i * 0.5) * (feature.statistics?.stddev ?? 1),
  }))

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed right-0 top-0 bottom-0 w-[520px] bg-[#121826] border-l border-[rgba(255,255,255,0.06)] z-40 flex flex-col shadow-2xl overflow-y-auto"
    >
      <div className="flex items-start gap-3 px-6 py-5 border-b border-[rgba(255,255,255,0.06)]">
        <div className="w-9 h-9 rounded-[8px] bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center shrink-0">
          <Star size={16} className="text-[#6366F1]" />
        </div>
        <div className="flex-1 min-w-0">
          <code className="text-sm font-bold text-[#F8FAFC]">{feature.name}</code>
          <p className="text-xs text-[#64748B] mt-0.5">{feature.description}</p>
        </div>
        <button onClick={onClose} className="p-1.5 text-[#475569] hover:text-[#94A3B8] transition-colors">×</button>
      </div>

      <div className="p-6 space-y-5">
        {/* Serving modes */}
        <div className="flex gap-3">
          <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-[8px] border ${feature.isOnline ? 'bg-[rgba(16,185,129,0.08)] border-[rgba(16,185,129,0.2)]' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]'}`}>
            <Wifi size={14} className={feature.isOnline ? 'text-[#10B981]' : 'text-[#475569]'} />
            <div>
              <p className="text-[10px] text-[#475569]">Online Store</p>
              <p className={`text-xs font-semibold ${feature.isOnline ? 'text-[#10B981]' : 'text-[#475569]'}`}>{feature.isOnline ? 'Available' : 'Not Served'}</p>
            </div>
          </div>
          <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-[8px] border ${feature.isOffline ? 'bg-[rgba(99,102,241,0.08)] border-[rgba(99,102,241,0.2)]' : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]'}`}>
            <WifiOff size={14} className={feature.isOffline ? 'text-[#6366F1]' : 'text-[#475569]'} />
            <div>
              <p className="text-[10px] text-[#475569]">Offline Store</p>
              <p className={`text-xs font-semibold ${feature.isOffline ? 'text-[#6366F1]' : 'text-[#475569]'}`}>{feature.isOffline ? 'Available' : 'Not Served'}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        {feature.statistics && (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Mean', value: feature.statistics.mean?.toFixed(3) ?? '—' },
              { label: 'Std Dev', value: feature.statistics.stddev?.toFixed(3) ?? '—' },
              { label: 'Null %', value: `${feature.statistics.nullPercent}%` },
            ].map(s => (
              <div key={s.label} className="bg-[#0A0F1C] rounded-[8px] p-3 border border-[rgba(255,255,255,0.04)]">
                <p className="text-[10px] text-[#475569] uppercase">{s.label}</p>
                <p className="text-sm font-bold text-[#F8FAFC] font-mono mt-0.5">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Sparkline */}
        <div>
          <p className="text-xs font-medium text-[#94A3B8] mb-2">Value Distribution (14d)</p>
          <div className="bg-[#0A0F1C] rounded-[8px] p-3 border border-[rgba(255,255,255,0.04)]">
            <ResponsiveContainer width="100%" height={80}>
              <AreaChart data={histData}>
                <defs>
                  <linearGradient id="ftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" hide />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#121826', border: '1px solid rgba(255,255,255,0.10)', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="value" stroke="#6366F1" strokeWidth={2} fill="url(#ftGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Transformation */}
        <div>
          <p className="text-xs font-medium text-[#94A3B8] mb-2">Transformation Logic</p>
          <div className="bg-[#0A0F1C] rounded-[8px] p-3 border border-[rgba(255,255,255,0.04)] font-mono text-[11px] text-[#94A3B8] leading-relaxed">
            {feature.transformation ?? 'No transformation defined'}
          </div>
        </div>

        {/* Models using this feature */}
        <div>
          <p className="text-xs font-medium text-[#94A3B8] mb-2">Used by Models ({feature.usedByModels.length})</p>
          <div className="space-y-1.5">
            {feature.usedByModels.map(model => (
              <div key={model} className="flex items-center gap-2 px-3 py-2 rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.04)]">
                <Cpu size={13} className="text-[#6366F1]" />
                <span className="text-xs text-[#94A3B8] font-mono">{model}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="text-xs font-medium text-[#94A3B8] mb-2">Tags</p>
          <div className="flex gap-1.5 flex-wrap">
            {feature.tags.map(tag => <Badge key={tag} variant="indigo">{tag}</Badge>)}
          </div>
        </div>

        {/* Meta */}
        <Divider />
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div><p className="text-[#475569]">Owner</p><p className="text-[#F8FAFC] mt-0.5">{feature.owner.name}</p></div>
          <div><p className="text-[#475569]">Data Type</p><code className="text-[#94A3B8] mt-0.5 block font-mono">{feature.dataType}</code></div>
          <div><p className="text-[#475569]">Version</p><p className="text-[#F8FAFC] mt-0.5">{feature.version}</p></div>
          <div><p className="text-[#475569]">Updated</p><p className="text-[#F8FAFC] mt-0.5">{formatRelativeTime(feature.updatedAt)}</p></div>
        </div>
      </div>
    </motion.div>
  )
}

export const FeatureStorePage: React.FC = () => {
  const { addNotification, features, setFeatures, activeProject } = useAppStore()

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Feature | null>(null)

  const projectFeatures = features.filter(f => isProjectMatch(f.projectId, activeProject?.id))
  const [registerOpen, setRegisterOpen] = useState(false)

  // Form states
  const [featureName, setFeatureName] = useState('')
  const [featureDesc, setFeatureDesc] = useState('')
  const [dataType, setDataType] = useState('float64')
  const [isOnline, setIsOnline] = useState(true)
  const [isOffline, setIsOffline] = useState(true)
  const [transformation, setTransformation] = useState('')
  const [featureTags, setFeatureTags] = useState('')
  const [featureError, setFeatureError] = useState('')

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!featureName.trim() || !featureDesc.trim()) {
      setFeatureError('Name and Description are required.')
      return
    }

    const tagsArray = featureTags
      ? featureTags.split(',').map(t => t.trim()).filter(Boolean)
      : ['ml-ready']

    const newFeature: Feature = {
      id: Math.random().toString(36).slice(2),
      name: featureName.trim().toLowerCase(),
      description: featureDesc.trim(),
      projectId: activeProject?.id || 'proj_1',
      datasetId: 'ds_1',
      columnName: featureName.trim().toLowerCase(),
      dataType,
      isOnline,
      isOffline,
      transformation: transformation.trim() || undefined,
      tags: tagsArray,
      version: 'v1.0',
      owner: {
        id: 'u1',
        name: 'Alex Chen',
        email: 'alex@dataforge.io',
        role: 'admin',
        organizationId: 'org_1',
        createdAt: new Date().toISOString()
      },
      usedByModels: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statistics: {
        mean: Math.random() * 10,
        stddev: Math.random() * 2,
        nullPercent: 0
      }
    }

    setFeatures([newFeature, ...features])
    addNotification({
      title: 'Feature Registered',
      message: `Feature "${featureName.trim()}" successfully registered to store.`,
      type: 'success'
    })

    setRegisterOpen(false)
    setFeatureName('')
    setFeatureDesc('')
    setDataType('float64')
    setIsOnline(true)
    setIsOffline(true)
    setTransformation('')
    setFeatureTags('')
    setFeatureError('')
  }

  const filtered = projectFeatures.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.description.toLowerCase().includes(search.toLowerCase()) ||
    f.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  const colors = ['#6366F1', '#06B6D4', '#10B981', '#F59E0B', '#EF4444']

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      <SectionHeader
        title="Feature Store"
        description={`${projectFeatures.length} features · ${projectFeatures.filter(f => f.isOnline).length} online · ${projectFeatures.filter(f => f.isOffline).length} offline`}
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => { setRegisterOpen(true); setFeatureError(''); setFeatureName(''); setFeatureDesc(''); setDataType('float64'); setIsOnline(true); setIsOffline(true); setTransformation(''); setFeatureTags('') }}>
            Register Feature
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Features', value: projectFeatures.length, icon: <Star size={15} />, color: '#6366F1' },
          { label: 'Online Serving', value: projectFeatures.filter(f => f.isOnline).length, icon: <Wifi size={15} />, color: '#10B981' },
          { label: 'Models Using', value: [...new Set(projectFeatures.flatMap(f => f.usedByModels))].length, icon: <Cpu size={15} />, color: '#06B6D4' },
          { label: 'Avg Null Rate', value: projectFeatures.length > 0 ? `${(projectFeatures.reduce((s, f) => s + (f.statistics?.nullPercent ?? 0), 0) / projectFeatures.length).toFixed(1)}%` : '0%', icon: <BarChart2 size={15} />, color: '#F59E0B' },
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

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search features..."
            className="w-full bg-[#161F32] border border-[rgba(255,255,255,0.08)] rounded-[8px] pl-9 pr-3 py-2 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-colors"
          />
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((feature, i) => (
          <motion.div
            key={feature.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => setSelected(selected?.id === feature.id ? null : feature)}
            className={`bg-[#161F32] border rounded-[12px] p-5 cursor-pointer transition-all hover:border-[rgba(255,255,255,0.12)] hover:bg-[#1a2540] ${
              selected?.id === feature.id ? 'border-[rgba(99,102,241,0.4)]' : 'border-[rgba(255,255,255,0.06)]'
            }`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-[8px] bg-[rgba(99,102,241,0.12)] border border-[rgba(99,102,241,0.2)] flex items-center justify-center shrink-0">
                <Star size={14} className="text-[#6366F1]" />
              </div>
              <div className="flex-1 min-w-0">
                <code className="text-xs font-bold text-[#F8FAFC] block truncate">{feature.name}</code>
                <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{feature.description}</p>
              </div>
            </div>

            {/* Sparkline */}
            <div className="mb-3">
              <FeatureSparkline color={colors[i % colors.length]} />
            </div>

            {/* Meta row */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {feature.isOnline && (
                  <Badge variant="success" size="sm"><Wifi size={10} /> Online</Badge>
                )}
                {feature.isOffline && (
                  <Badge variant="indigo" size="sm"><WifiOff size={10} /> Offline</Badge>
                )}
              </div>
              <code className="text-[10px] text-[#475569] font-mono">{feature.dataType}</code>
            </div>

            {/* Tags */}
            <div className="flex gap-1 flex-wrap mb-3">
              {feature.tags.slice(0, 3).map(tag => <Badge key={tag} variant="default" size="sm">{tag}</Badge>)}
            </div>

            {/* Models */}
            <div className="pt-3 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] text-[#475569]">
                <Cpu size={11} />
                <span>{feature.usedByModels.length} model{feature.usedByModels.length !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-[11px] text-[#475569]">{feature.version}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detail Panel */}
      {selected && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          />
          <FeatureDetailPanel feature={selected} onClose={() => setSelected(null)} />
        </>
      )}

      {/* --- REGISTER FEATURE DIALOG MODAL --- */}
      <AnimatePresence>
        {registerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setRegisterOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-[#121826] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-2xl p-6 z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Register Feature Metadata</h3>
                <button onClick={() => setRegisterOpen(false)} className="text-[#475569] hover:text-[#94A3B8] transition-colors"><X size={15} /></button>
              </div>
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Feature Name</label>
                  <input type="text" value={featureName} onChange={e => setFeatureName(e.target.value)} placeholder="e.g. user_avg_orders_30d" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Description</label>
                  <textarea value={featureDesc} onChange={e => setFeatureDesc(e.target.value)} placeholder="Aggregated average transaction amount for a customer within the last 30 days" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] h-16" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Data Type</label>
                    <select value={dataType} onChange={e => setDataType(e.target.value)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                      <option value="float64" className="bg-[#121826]">float64</option>
                      <option value="int32" className="bg-[#121826]">int32</option>
                      <option value="string" className="bg-[#121826]">string</option>
                      <option value="boolean" className="bg-[#121826]">boolean</option>
                      <option value="array<float32>" className="bg-[#121826]">array&lt;float32&gt;</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Tags (comma-separated)</label>
                    <input type="text" value={featureTags} onChange={e => setFeatureTags(e.target.value)} placeholder="e.g. user, orders, features" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Serving Stores</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer">
                      <input type="checkbox" checked={isOnline} onChange={e => setIsOnline(e.target.checked)} className="rounded border-[rgba(255,255,255,0.08)] bg-[#0D121F] text-[#6366F1] focus:ring-0 cursor-pointer" />
                      Online Store
                    </label>
                    <label className="flex items-center gap-2 text-xs text-[#94A3B8] cursor-pointer">
                      <input type="checkbox" checked={isOffline} onChange={e => setIsOffline(e.target.checked)} className="rounded border-[rgba(255,255,255,0.08)] bg-[#0D121F] text-[#6366F1] focus:ring-0 cursor-pointer" />
                      Offline Store
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Transformation Expression (SQL/DSL)</label>
                  <textarea value={transformation} onChange={e => setTransformation(e.target.value)} placeholder="SELECT AVG(amount) FROM transactions GROUP BY user_id" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-xs font-mono text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] h-20" />
                </div>

                {featureError && (
                  <div className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-2.5 flex items-center gap-1.5">
                    <AlertCircle size={13} /> {featureError}
                  </div>
                )}

                <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setRegisterOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Register Feature</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
