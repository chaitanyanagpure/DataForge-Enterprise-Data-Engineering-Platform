import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Database, GitBranch, Star, Network, ShieldCheck, Activity,
  ArrowRight, Check, Zap, Lock, Globe, Users, ChevronRight,
  Play, BarChart3, Layers,
} from 'lucide-react'
import { Logo } from '@/components/ui'

const features = [
  { icon: <Database size={20} />, title: 'Data Catalog', description: 'Unified catalog with schema inference, column statistics, and data profiling across all your sources.', color: '#6366F1' },
  { icon: <GitBranch size={20} />, title: 'Pipeline Builder', description: 'Visual drag-and-drop pipeline builder with React Flow. Connect nodes, configure transforms, deploy instantly.', color: '#06B6D4' },
  { icon: <ShieldCheck size={20} />, title: 'Data Quality', description: 'Great Expectations-powered validation with custom rules, quality scoring, and automated alerts.', color: '#10B981' },
  { icon: <Star size={20} />, title: 'Feature Store', description: 'Centralized ML feature registry with online/offline serving, versioning, and model lineage tracking.', color: '#F59E0B' },
  { icon: <Network size={20} />, title: 'Data Lineage', description: 'End-to-end interactive lineage graph from source to model. Click any node to inspect metadata.', color: '#EF4444' },
  { icon: <Activity size={20} />, title: 'Observability', description: 'Real-time pipeline health monitoring, execution metrics, failure rates, and data freshness SLAs.', color: '#8B5CF6' },
]

const techStack = [
  { label: 'Apache Spark', color: '#E25A1C' },
  { label: 'Apache Airflow', color: '#017CEE' },
  { label: 'Great Expectations', color: '#6366F1' },
  { label: 'MLflow', color: '#0194E2' },
  { label: 'MinIO', color: '#C72E49' },
  { label: 'PostgreSQL', color: '#336791' },
  { label: 'Redis', color: '#DC382D' },
  { label: 'Kafka', color: '#231F20' },
  { label: 'FastAPI', color: '#009688' },
  { label: 'Prometheus', color: '#E6522C' },
]

const AnimatedStat: React.FC<{ value: string; label: string; delay: number }> = ({ value, label, delay }) => (
  <motion.div
    className="text-center"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }}
  >
    <div className="text-3xl font-bold text-[#F8FAFC] mb-1 gradient-text">{value}</div>
    <div className="text-sm text-[#64748B]">{label}</div>
  </motion.div>
)

export const LandingPage: React.FC = () => {
  const navigate = useNavigate()
  const [activeFeature, setActiveFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setActiveFeature(f => (f + 1) % features.length), 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0F1C] overflow-x-hidden">
      {/* ─── NAVBAR ─────────────────────────────── */}
      <nav className="sticky top-0 z-50 glass border-b border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-6">
          <Logo size={28} />
          <div className="flex-1" />
          <div className="hidden md:flex items-center gap-6">
            {['Features', 'Docs', 'Blog'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-[#64748B] hover:text-[#F8FAFC] transition-colors">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/login')}
              className="px-3 py-1.5 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="px-4 py-1.5 bg-[#6366F1] hover:bg-[#818CF8] text-white text-sm font-medium rounded-[8px] transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────── */}
      <section className="relative dot-grid">
        {/* Background glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6366F1]/12 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-10 pb-24 relative">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.25)] rounded-full text-xs text-[#6366F1] font-medium mb-8"
            >
              <Zap size={12} />
              Now with Apache Spark 3.5 & Great Expectations 1.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6 text-center"
            >
              The Data Platform
              <br />
              <span className="gradient-text">Built for Modern AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-[#64748B] max-w-2xl mb-10 leading-relaxed text-center mx-auto"
            >
              DataForge unifies data ingestion, quality validation, pipeline orchestration, and ML feature management into a single enterprise-grade platform. From raw data to production models.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <button
                onClick={() => navigate('/signup')}
                className="flex items-center gap-2 px-6 py-3 bg-[#6366F1] hover:bg-[#818CF8] text-white font-medium rounded-[10px] transition-all shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_32px_rgba(99,102,241,0.5)]"
              >
                Start Building Free <ArrowRight size={16} />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex items-center gap-2 px-6 py-3 bg-[rgba(255,255,255,0.05)] hover:bg-[rgba(255,255,255,0.08)] text-[#F8FAFC] font-medium rounded-[10px] border border-[rgba(255,255,255,0.10)] transition-all"
              >
                <Play size={14} /> View Demo
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-4 mt-8"
            >
              {['No credit card required', 'SOC 2 Type II', 'GDPR compliant'].map(item => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-[#475569]">
                  <Check size={12} className="text-[#10B981]" /> {item}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-[16px] overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-[0_24px_80px_rgba(0,0,0,0.8)]">
              {/* Mock Dashboard */}
              <div className="bg-[#0A0F1C] p-0">
                {/* Dashboard header bar */}
                <div className="bg-[#121826] border-b border-[rgba(255,255,255,0.06)] px-4 py-2.5 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#EF4444]/60" />
                    <div className="w-3 h-3 rounded-full bg-[#F59E0B]/60" />
                    <div className="w-3 h-3 rounded-full bg-[#10B981]/60" />
                  </div>
                  <div className="flex-1 h-5 bg-[rgba(255,255,255,0.04)] rounded-full max-w-xs" />
                </div>
                {/* Mock content */}
                <div className="flex">
                  {/* Sidebar mock */}
                  <div className="w-48 bg-[#0A0F1C] border-r border-[rgba(255,255,255,0.06)] p-3 hidden md:block">
                    {['Dashboard', 'Data Catalog', 'Quality', 'Pipelines', 'Features', 'Lineage'].map((item, i) => (
                      <div key={item} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] mb-0.5 ${i === 0 ? 'bg-[rgba(99,102,241,0.12)]' : ''}`}>
                        <div className={`w-3 h-3 rounded ${i === 0 ? 'bg-[#6366F1]' : 'bg-[rgba(255,255,255,0.08)]'}`} />
                        <div className={`h-2 rounded flex-1 ${i === 0 ? 'bg-[rgba(255,255,255,0.15)]' : 'bg-[rgba(255,255,255,0.06)]'}`} />
                      </div>
                    ))}
                  </div>
                  {/* Main mock */}
                  <div className="flex-1 p-5">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      {[
                        { label: 'Health Score', val: '88.4', color: '#10B981' },
                        { label: 'Pipelines', val: '3/4', color: '#6366F1' },
                        { label: 'Datasets', val: '41', color: '#06B6D4' },
                        { label: 'Failed Jobs', val: '2', color: '#EF4444' },
                      ].map(s => (
                        <div key={s.label} className="bg-[#161F32] rounded-[10px] p-3 border border-[rgba(255,255,255,0.06)]">
                          <div className="text-[10px] text-[#475569] mb-1">{s.label}</div>
                          <div className="text-lg font-bold" style={{ color: s.color }}>{s.val}</div>
                          <div className="h-1 bg-[rgba(255,255,255,0.04)] rounded-full mt-2 overflow-hidden">
                            <div className="h-full rounded-full" style={{ backgroundColor: s.color, width: '70%' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Chart mock */}
                    <div className="bg-[#161F32] rounded-[10px] p-3 border border-[rgba(255,255,255,0.06)] h-28 flex items-end gap-1.5">
                      {Array.from({ length: 20 }, (_, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 rounded-t-sm"
                          style={{ backgroundColor: i % 5 === 0 ? '#EF4444' : '#6366F1' }}
                          initial={{ height: 0 }}
                          animate={{ height: `${20 + Math.sin(i * 0.8) * 40 + Math.random() * 30}%` }}
                          transition={{ delay: i * 0.05, duration: 0.4 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Glow effect under preview */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-16 bg-[#6366F1]/20 blur-2xl rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────── */}
      <section className="py-16 border-y border-[rgba(255,255,255,0.06)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedStat value="10B+" label="Records processed daily" delay={0} />
            <AnimatedStat value="99.9%" label="Pipeline reliability" delay={0.1} />
            <AnimatedStat value="500+" label="Data teams worldwide" delay={0.2} />
            <AnimatedStat value="<2ms" label="Feature serving latency" delay={0.3} />
          </div>
        </div>
      </section>

      {/* ─── FEATURES ────────────────────────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-xs font-semibold text-[#6366F1] uppercase tracking-widest">Platform Features</span>
              <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">Everything Your Data Team Needs</h2>
              <p className="text-[#64748B]">
                From raw data ingestion to production ML serving — DataForge handles the full data lifecycle in a single unified platform.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-[#161F32] border border-[rgba(255,255,255,0.06)] rounded-[14px] p-6 hover:border-[rgba(255,255,255,0.12)] transition-all cursor-pointer group"
              >
                <div
                  className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${feature.color}18`, border: `1px solid ${feature.color}30` }}
                >
                  <span style={{ color: feature.color }}>{feature.icon}</span>
                </div>
                <h3 className="text-sm font-semibold text-[#F8FAFC] mb-2">{feature.title}</h3>
                <p className="text-xs text-[#64748B] leading-relaxed">{feature.description}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: feature.color }}>
                  Learn more <ChevronRight size={12} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE ────────────────────────── */}
      <section className="py-24 bg-[#121826]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-semibold text-[#06B6D4] uppercase tracking-widest">Architecture</span>
            <h2 className="text-3xl font-bold mt-3 mb-4">Production-Ready Stack</h2>
            <p className="text-[#64748B]">Built on battle-tested open-source technologies trusted by the world's largest data teams.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="px-4 py-2 bg-[#161F32] border border-[rgba(255,255,255,0.06)] rounded-[8px] text-sm text-[#94A3B8] font-medium hover:border-[rgba(255,255,255,0.12)] transition-colors"
              >
                {tech.label}
              </motion.div>
            ))}
          </div>

          {/* Architecture Diagram */}
          <div className="mt-16 bg-[#161F32] border border-[rgba(255,255,255,0.06)] rounded-[16px] p-8 overflow-x-auto">
            <div className="flex items-center justify-between gap-4 min-w-max mx-auto max-w-4xl">
              {[
                { label: 'Sources', items: ['PostgreSQL', 'Kafka', 'S3', 'REST API'], color: '#64748B' },
                { label: 'Ingestion', items: ['DataForge\nConnectors', 'Change Data\nCapture'], color: '#6366F1' },
                { label: 'Processing', items: ['Apache Spark', 'Pandas/Polars', 'Great Expectations'], color: '#06B6D4' },
                { label: 'Storage', items: ['MinIO', 'PostgreSQL', 'Redis Cache'], color: '#10B981' },
                { label: 'Serving', items: ['Feature Store', 'REST API', 'ML Models'], color: '#F59E0B' },
              ].map((layer, i) => (
                <React.Fragment key={layer.label}>
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: layer.color }}>{layer.label}</div>
                    {layer.items.map(item => (
                      <div
                        key={item}
                        className="px-3 py-2 rounded-[8px] text-[11px] text-center text-[#94A3B8] border whitespace-pre-line"
                        style={{ borderColor: `${layer.color}30`, backgroundColor: `${layer.color}08` }}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                  {i < 4 && <ArrowRight size={16} className="text-[#334155] shrink-0" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>



      {/* ─── CTA ─────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#6366F1]/10 to-[#06B6D4]/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#6366F1]/15 rounded-full blur-3xl" />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Build Your Data Platform?</h2>
            <p className="text-[#64748B] mb-8">Join 500+ data teams already using DataForge to power their AI pipelines.</p>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#6366F1] hover:bg-[#818CF8] text-white font-semibold rounded-[12px] transition-all shadow-[0_0_32px_rgba(99,102,241,0.4)] hover:shadow-[0_0_48px_rgba(99,102,241,0.5)] text-sm"
            >
              Start Building Free <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────── */}
      <footer className="border-t border-[rgba(255,255,255,0.06)] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <Logo size={24} className="mb-4" />
              <p className="text-xs text-[#475569] leading-relaxed">The enterprise data platform for modern AI teams.</p>
            </div>
            {[
              { label: 'Product', links: ['Features', 'Changelog', 'Roadmap'] },
              { label: 'Resources', links: ['Documentation', 'API Reference', 'Blog', 'Status'] },
              { label: 'Company', links: ['About', 'Careers', 'Privacy', 'Terms'] },
            ].map(col => (
              <div key={col.label}>
                <h4 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wide mb-3">{col.label}</h4>
                <div className="space-y-2">
                  {col.links.map(link => (
                    <a key={link} href="#" className="block text-xs text-[#475569] hover:text-[#94A3B8] transition-colors">{link}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#334155]">© 2024 DataForge, Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              {[<Lock size={14} />, <Globe size={14} />, <Users size={14} />].map((icon, i) => (
                <a key={i} href="#" className="text-[#334155] hover:text-[#64748B] transition-colors">{icon}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
