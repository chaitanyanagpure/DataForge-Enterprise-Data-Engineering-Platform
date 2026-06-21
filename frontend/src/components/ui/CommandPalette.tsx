import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Database, GitBranch, Layers, Star, Workflow, BarChart3, Settings, Command } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'

interface CommandItem {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  category: string
}

export const CommandPalette: React.FC = () => {
  const { commandPaletteOpen, setCommandPaletteOpen } = useAppStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const commands: CommandItem[] = [
    { id: 'dashboard', label: 'Go to Dashboard', icon: <BarChart3 size={14} />, action: () => navigate('/dashboard'), category: 'Navigation' },
    { id: 'catalog', label: 'Go to Data Catalog', icon: <Database size={14} />, action: () => navigate('/catalog'), category: 'Navigation' },
    { id: 'pipelines', label: 'Go to Pipelines', icon: <GitBranch size={14} />, action: () => navigate('/pipelines'), category: 'Navigation' },
    { id: 'features', label: 'Go to Feature Store', icon: <Star size={14} />, action: () => navigate('/features'), category: 'Navigation' },
    { id: 'lineage', label: 'Go to Data Lineage', icon: <Layers size={14} />, action: () => navigate('/lineage'), category: 'Navigation' },
    { id: 'workflows', label: 'Go to Workflows', icon: <Workflow size={14} />, action: () => navigate('/workflows'), category: 'Navigation' },
    { id: 'settings', label: 'Go to Settings', icon: <Settings size={14} />, action: () => navigate('/settings'), category: 'Navigation' },
    { id: 'new-pipeline', label: 'Create New Pipeline', description: 'Open the pipeline builder', icon: <GitBranch size={14} />, action: () => navigate('/pipelines/new'), category: 'Actions' },
    { id: 'new-dataset', label: 'Upload Dataset', description: 'Upload a CSV, Parquet, or JSON file', icon: <Database size={14} />, action: () => navigate('/catalog'), category: 'Actions' },
  ]

  const filtered = query
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, cmd) => {
    if (!acc[cmd.category]) acc[cmd.category] = []
    acc[cmd.category].push(cmd)
    return acc
  }, {})

  const [activeIndex, setActiveIndex] = useState(0)
  const flatFiltered = filtered

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandPaletteOpen(!commandPaletteOpen)
      setQuery('')
      setActiveIndex(0)
    }
    if (!commandPaletteOpen) return
    if (e.key === 'Escape') { setCommandPaletteOpen(false); setQuery('') }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex(i => Math.min(i + 1, flatFiltered.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && flatFiltered[activeIndex]) {
      flatFiltered[activeIndex].action()
      setCommandPaletteOpen(false)
      setQuery('')
    }
  }, [commandPaletteOpen, flatFiltered, activeIndex, setCommandPaletteOpen])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setCommandPaletteOpen(false); setQuery('') }}
          />
          <motion.div
            className="fixed top-[20vh] left-1/2 -translate-x-1/2 w-full max-w-xl z-50"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className="bg-[#121826] border border-[rgba(255,255,255,0.12)] rounded-[14px] shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[rgba(255,255,255,0.06)]">
                <Search size={16} className="text-[#64748B] shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={e => { setQuery(e.target.value); setActiveIndex(0) }}
                  placeholder="Search commands, datasets, pipelines..."
                  className="flex-1 bg-transparent text-sm text-[#F8FAFC] placeholder-[#475569] outline-none"
                />
                <kbd className="px-1.5 py-0.5 text-[10px] text-[#64748B] bg-[rgba(255,255,255,0.06)] rounded border border-[rgba(255,255,255,0.08)] font-mono">ESC</kbd>
              </div>

              {/* Results */}
              <div className="max-h-[320px] overflow-y-auto py-2">
                {Object.entries(grouped).map(([category, items]) => (
                  <div key={category}>
                    <div className="px-4 py-1.5">
                      <span className="text-[10px] font-semibold text-[#475569] uppercase tracking-widest">{category}</span>
                    </div>
                    {items.map(item => {
                      const globalIndex = flatFiltered.indexOf(item)
                      return (
                        <button
                          key={item.id}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            globalIndex === activeIndex ? 'bg-[#6366F1]/10 text-[#F8FAFC]' : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] hover:text-[#F8FAFC]'
                          }`}
                          onClick={() => { item.action(); setCommandPaletteOpen(false); setQuery('') }}
                          onMouseEnter={() => setActiveIndex(globalIndex)}
                        >
                          <span className={globalIndex === activeIndex ? 'text-[#6366F1]' : 'text-[#64748B]'}>{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium">{item.label}</div>
                            {item.description && <div className="text-xs text-[#475569]">{item.description}</div>}
                          </div>
                          {globalIndex === activeIndex && (
                            <kbd className="px-1.5 py-0.5 text-[10px] text-[#6366F1] bg-[rgba(99,102,241,0.12)] rounded border border-[rgba(99,102,241,0.2)] font-mono">↵</kbd>
                          )}
                        </button>
                      )
                    })}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="flex flex-col items-center py-8 text-[#475569]">
                    <Command size={24} className="mb-2 opacity-40" />
                    <p className="text-sm">No results for "{query}"</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[rgba(255,255,255,0.06)]">
                {[['↑↓', 'Navigate'], ['↵', 'Select'], ['ESC', 'Close']].map(([key, label]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 text-[10px] text-[#64748B] bg-[rgba(255,255,255,0.06)] rounded border border-[rgba(255,255,255,0.08)] font-mono">{key}</kbd>
                    <span className="text-[11px] text-[#475569]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
