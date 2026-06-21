import React from 'react'
import { motion } from 'framer-motion'
import { Database, ShieldCheck, GitBranch } from 'lucide-react'
import { Logo } from '@/components/ui'

export const AuthLeftPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-[#090D1A] border-r border-[rgba(255,255,255,0.06)] p-16 flex-col justify-between relative overflow-hidden">
      {/* Background grids and glowing blobs */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#6366F1]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#06B6D4]/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Header logo */}
      <div className="relative z-10">
        <Logo size={32} />
      </div>

      {/* Central Visual: Animated Data Flow Pipeline */}
      <div className="relative z-10 my-auto flex flex-col items-center">
        <div className="w-full max-w-[440px] aspect-[4/3] bg-[#111726]/60 border border-[rgba(255,255,255,0.04)] rounded-[20px] shadow-2xl p-6 relative backdrop-blur-md overflow-hidden">
          <div className="absolute top-3 left-3 flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]/30" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#10B981]/30" />
          </div>
          <div className="text-[11px] font-mono text-[#475569] absolute top-2 right-4">DATA_LINEAGE_STAGE_01</div>

          {/* Animated SVG Network Graph */}
          <svg className="w-full h-full" viewBox="0 0 320 220" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#818CF8" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.4" />
              </linearGradient>
              <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Static Grid Lines */}
            <path d="M40 0V220M160 0V220M280 0V220M0 60H320M0 160H320" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

            {/* Connection Pathways */}
            <path d="M60 60 L160 110 L260 60" stroke="url(#pathGrad)" strokeWidth="2" strokeLinecap="round" />
            <path d="M60 160 L160 110 L260 160" stroke="url(#pathGrad)" strokeWidth="2" strokeLinecap="round" />
            <path d="M160 110 H260" stroke="url(#pathGrad)" strokeWidth="2" strokeLinecap="round" />

            {/* Flowing Data Packets (Dots) */}
            <motion.circle
              r="3.5"
              fill="#818CF8"
              animate={{
                cx: [60, 160, 260],
                cy: [60, 110, 60]
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              r="3.5"
              fill="#34D399"
              animate={{
                cx: [60, 160, 260],
                cy: [160, 110, 160]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />
            <motion.circle
              r="3.5"
              fill="#22D3EE"
              animate={{
                cx: [160, 260],
                cy: [110, 110]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
            />

            {/* Nodes */}
            {/* Input Sources */}
            <g transform="translate(60, 60)">
              <circle r="16" fill="#1E1B4B" stroke="#6366F1" strokeWidth="1.5" />
              <foreignObject x="-7" y="-7" width="14" height="14">
                <Database size={14} className="text-[#818CF8]" />
              </foreignObject>
            </g>
            <g transform="translate(60, 160)">
              <circle r="16" fill="#064E3B" stroke="#10B981" strokeWidth="1.5" />
              <foreignObject x="-7" y="-7" width="14" height="14">
                <Database size={14} className="text-[#34D399]" />
              </foreignObject>
            </g>

            {/* Processing Engine */}
            <g transform="translate(160, 110)">
              <circle r="22" fill="#121826" stroke="#818CF8" strokeWidth="2" />
              <circle r="30" fill="url(#nodeGlow)" />
              <foreignObject x="-9" y="-9" width="18" height="18">
                <GitBranch size={18} className="text-[#818CF8] animate-pulse" />
              </foreignObject>
            </g>

            {/* Output Targets */}
            <g transform="translate(260, 60)">
              <circle r="16" fill="#164E63" stroke="#06B6D4" strokeWidth="1.5" />
              <foreignObject x="-7" y="-7" width="14" height="14">
                <ShieldCheck size={14} className="text-[#22D3EE]" />
              </foreignObject>
            </g>
            <g transform="translate(260, 160)">
              <circle r="16" fill="#1E1B4B" stroke="#6366F1" strokeWidth="1.5" />
              <foreignObject x="-7" y="-7" width="14" height="14">
                <Database size={14} className="text-[#818CF8]" />
              </foreignObject>
            </g>
          </svg>
        </div>

        {/* Text descriptions under visual */}
        <div className="text-center mt-8 max-w-sm">
          <h3 className="text-xl font-bold text-[#F8FAFC] mb-2.5">
            Ingest & Transform in Real-Time
          </h3>
          <p className="text-sm text-[#64748B] leading-relaxed">
            Construct automated pipelines, validate schemas, map lineages, and feed low-latency ML feature stores seamlessly.
          </p>
        </div>
      </div>

      {/* Footer stats */}
      <div className="relative z-10 flex justify-between gap-6 pt-6 border-t border-[rgba(255,255,255,0.06)]">
        {[
          { value: '10B+', label: 'Daily events' },
          { value: '99.99%', label: 'Uptime SLA' },
          { value: '< 2ms', label: 'Feature latency' }
        ].map(item => (
          <div key={item.label} className="flex-1">
            <div className="text-base font-bold text-[#F8FAFC]">{item.value}</div>
            <div className="text-[10px] text-[#475569] uppercase font-semibold tracking-wider mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
