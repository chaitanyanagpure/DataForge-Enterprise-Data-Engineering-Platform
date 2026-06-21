import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Database, ShieldCheck, GitBranch,
  GitMerge, Star, Network, Workflow, Activity, Settings,
  ChevronDown, ChevronRight, Plus, Folder, LogOut, Command,
  FolderOpen,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import { Logo } from '@/components/ui'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  badge?: string | number
  badgeColor?: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={15} />, path: '/dashboard' },
  { id: 'catalog', label: 'Data Catalog', icon: <Database size={15} />, path: '/catalog' },
  { id: 'quality', label: 'Data Quality', icon: <ShieldCheck size={15} />, path: '/quality' },
  { id: 'pipelines', label: 'Pipeline Builder', icon: <GitBranch size={15} />, path: '/pipelines' },
  { id: 'versioning', label: 'Versioning', icon: <GitMerge size={15} />, path: '/versioning' },
  { id: 'features', label: 'Feature Store', icon: <Star size={15} />, path: '/features' },
  { id: 'lineage', label: 'Data Lineage', icon: <Network size={15} />, path: '/lineage' },
  { id: 'workflows', label: 'Workflows', icon: <Workflow size={15} />, path: '/workflows' },
  { id: 'observability', label: 'Observability', icon: <Activity size={15} />, path: '/observability' },
]

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, activeProject, projects, setActiveProject, setCommandPaletteOpen, setNewProjectModalOpen } = useAppStore()
  const { user, org, logout } = useAuthStore()
  const navigate = useNavigate()
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="h-screen bg-[#0A0F1C] border-r border-[rgba(255,255,255,0.06)] flex flex-col shrink-0 overflow-hidden z-30"
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[rgba(255,255,255,0.06)] shrink-0">
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <Logo iconOnly={sidebarCollapsed} size={26} />
        </div>
        <div className="flex-1" />
        {!sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-[6px] text-[#475569] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 flex flex-col gap-1 px-2">
        {/* Command Palette Trigger */}
        {!sidebarCollapsed && (
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 mb-1 rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#475569] hover:text-[#64748B] hover:border-[rgba(255,255,255,0.10)] transition-all text-xs w-full"
          >
            <Command size={12} />
            <span className="flex-1 text-left">Quick search...</span>
            <kbd className="text-[10px] font-mono">⌘K</kbd>
          </button>
        )}

        {/* Project Selector */}
        {!sidebarCollapsed && (
          <div className="mb-2">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] hover:bg-[rgba(255,255,255,0.04)] transition-colors group"
            >
              <FolderOpen size={13} className="text-[#6366F1] shrink-0" />
              <span className="flex-1 text-xs font-medium text-[#94A3B8] text-left truncate">{activeProject?.name}</span>
              <ChevronDown size={12} className={cn('text-[#475569] transition-transform', projectDropdownOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {projectDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-1 space-y-0.5 pl-2">
                    {projects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { setActiveProject(p); setProjectDropdownOpen(false) }}
                        className={cn(
                          'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-left transition-colors',
                          activeProject?.id === p.id
                            ? 'bg-[rgba(99,102,241,0.1)] text-[#F8FAFC]'
                            : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)]'
                        )}
                      >
                        <Folder size={12} style={{ color: p.color }} />
                        <span className="text-xs truncate">{p.name}</span>
                      </button>
                    ))}
                    <button
                      onClick={() => { setNewProjectModalOpen(true); setProjectDropdownOpen(false) }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[6px] text-[#475569] hover:text-[#6366F1] hover:bg-[rgba(99,102,241,0.06)] transition-colors cursor-pointer"
                    >
                      <Plus size={12} />
                      <span className="text-xs">New Project</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Separator */}
        {!sidebarCollapsed && (
          <div className="px-2 mb-1">
            <span className="text-[10px] font-semibold text-[#334155] uppercase tracking-widest">Platform</span>
          </div>
        )}

        {/* Navigation */}
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] transition-all duration-150 group relative',
              sidebarCollapsed ? 'justify-center' : '',
              isActive
                ? 'bg-[rgba(99,102,241,0.12)] text-[#818CF8] border border-[rgba(99,102,241,0.2)]'
                : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] border border-transparent'
            )}
          >
            {({ isActive }) => (
              <>
                <span className={cn('shrink-0 transition-colors', isActive ? 'text-[#6366F1]' : 'text-[#475569] group-hover:text-[#64748B]')}>
                  {item.icon}
                </span>
                <AnimatePresence>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-medium whitespace-nowrap overflow-hidden flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {item.badge && !sidebarCollapsed && (
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${item.badgeColor || '#EF4444'}22`, color: item.badgeColor || '#EF4444' }}
                  >
                    {item.badge}
                  </span>
                )}
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-[#121826] border border-[rgba(255,255,255,0.10)] rounded-[6px] text-xs text-[#F8FAFC] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
                    {item.label}
                  </div>
                )}
              </>
            )}
          </NavLink>
        ))}

        <div className="flex-1" />

        <div className="border-t border-[rgba(255,255,255,0.06)] pt-2 mt-1">
          <NavLink
            to="/settings"
            className={({ isActive }) => cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-[8px] transition-all duration-150 border border-transparent',
              sidebarCollapsed ? 'justify-center' : '',
              isActive
                ? 'bg-[rgba(99,102,241,0.12)] text-[#818CF8] border-[rgba(99,102,241,0.2)]'
                : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)]'
            )}
          >
            <Settings size={15} className="shrink-0" />
            {!sidebarCollapsed && <span className="text-xs font-medium">Settings</span>}
          </NavLink>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
        {!sidebarCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#F8FAFC] truncate">{user?.name}</p>
              <p className="text-[11px] text-[#475569] truncate">{org?.name}</p>
            </div>
            <button
              onClick={logout}
              className="p-1 text-[#475569] hover:text-[#EF4444] transition-colors"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) ?? 'A'}
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  )
}
