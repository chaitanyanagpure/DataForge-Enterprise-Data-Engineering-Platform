import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, Command, ChevronLeft, ChevronRight, Check,
  AlertCircle, CheckCircle, Info, AlertTriangle, X,
  LogOut, Settings, User as UserIcon, Calendar, Key,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useAppStore } from '@/stores/appStore'
import { useAuthStore } from '@/stores/authStore'
import type { Notification } from '@/types'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/catalog': 'Data Catalog',
  '/quality': 'Data Quality',
  '/pipelines': 'Pipeline Builder',
  '/versioning': 'Data Versioning',
  '/features': 'Feature Store',
  '/lineage': 'Data Lineage',
  '/workflows': 'Workflow Automation',
  '/observability': 'Observability',
  '/settings': 'Settings',
}

const NotifIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const map = {
    success: <CheckCircle size={13} className="text-[#10B981]" />,
    error: <AlertCircle size={13} className="text-[#EF4444]" />,
    warning: <AlertTriangle size={13} className="text-[#F59E0B]" />,
    info: <Info size={13} className="text-[#3B82F6]" />,
  }
  return map[type]
}

export const Header: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { notifications, unreadCount, markNotificationRead, markAllRead, setCommandPaletteOpen, sidebarCollapsed, toggleSidebar } = useAppStore()
  const { user, logout } = useAuthStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const title = PAGE_TITLES[location.pathname] ?? 'DataForge'

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <header className="h-14 bg-[#0A0F1C]/80 backdrop-blur-md border-b border-[rgba(255,255,255,0.06)] flex items-center px-4 gap-4 sticky top-0 z-20">
      {/* Sidebar toggle */}
      <button
        onClick={toggleSidebar}
        className="p-1.5 rounded-[6px] text-[#475569] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
      >
        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Breadcrumb / Title */}
      <div>
        <h1 className="text-sm font-semibold text-[#F8FAFC]">{title}</h1>
      </div>

      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Command Palette Button */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-[8px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#475569] hover:text-[#64748B] hover:border-[rgba(255,255,255,0.10)] transition-all text-xs"
        >
          <Command size={12} />
          <span>Search</span>
          <kbd className="text-[10px] font-mono ml-1">⌘K</kbd>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative p-2 rounded-[8px] text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-[360px] bg-[#121826] border border-[rgba(255,255,255,0.10)] rounded-[12px] shadow-2xl overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F8FAFC]">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[rgba(239,68,68,0.15)] text-[#EF4444] rounded-full font-medium">{unreadCount}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={markAllRead} className="text-[11px] text-[#475569] hover:text-[#6366F1] transition-colors flex items-center gap-1">
                      <Check size={11} /> Mark all read
                    </button>
                    <button onClick={() => setNotifOpen(false)} className="p-1 text-[#475569] hover:text-[#94A3B8] transition-colors ml-1">
                      <X size={13} />
                    </button>
                  </div>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.slice(0, 8).map(notif => (
                    <button
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={cn(
                        'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[rgba(255,255,255,0.03)] transition-colors border-b border-[rgba(255,255,255,0.04)] last:border-0',
                        !notif.isRead && 'bg-[rgba(255,255,255,0.02)]'
                      )}
                    >
                      <div className="mt-0.5 shrink-0"><NotifIcon type={notif.type} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-[#F8FAFC] truncate">{notif.title}</p>
                          {!notif.isRead && <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-[#64748B] mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-[#475569] mt-1">{formatRelativeTime(notif.createdAt)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar with Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-white text-xs font-bold focus:outline-none hover:ring-2 hover:ring-[#6366F1]/50 transition-all cursor-pointer select-none"
          >
            {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -4 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-72 bg-[#121826] border border-[rgba(255,255,255,0.10)] rounded-[12px] shadow-2xl overflow-hidden p-4 space-y-4"
              >
                {/* Header Profile Summary */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F8FAFC] truncate">{user?.name}</p>
                    <p className="text-xs text-[#64748B] truncate">{user?.email}</p>
                  </div>
                </div>

                <div className="h-[1px] bg-[rgba(255,255,255,0.06)]" />

                {/* User Role and Auth Meta */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#475569] font-medium uppercase tracking-wider">Role</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#818CF8] font-semibold capitalize">
                      {user?.role?.replace('_', ' ') || 'Viewer'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#475569]">
                    <span className="font-medium uppercase tracking-wider">Workspace</span>
                    <span className="text-[#94A3B8] font-mono truncate max-w-[120px]">
                      {user?.organizationId || 'org_1'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#475569]">
                    <span className="font-medium uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={11} /> Created
                    </span>
                    <span className="text-[#94A3B8]">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'June 20, 2026'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#475569]">
                    <span className="font-medium uppercase tracking-wider flex items-center gap-1">
                      <Key size={11} /> Provider
                    </span>
                    <span className="text-[#94A3B8]">DataForge SSO</span>
                  </div>
                </div>

                <div className="h-[1px] bg-[rgba(255,255,255,0.06)]" />

                {/* Account Actions */}
                <div className="space-y-1">
                  <button
                    onClick={() => { setProfileOpen(false); navigate('/settings') }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-xs font-medium text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[rgba(255,255,255,0.04)] transition-colors text-left cursor-pointer"
                  >
                    <Settings size={13} /> Account Settings
                  </button>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-[8px] text-xs font-medium text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut size={13} /> Sign Out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
