import React, { useEffect, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { CommandPalette } from '@/components/ui/CommandPalette'
import { CreateProjectModal } from '@/components/modals/CreateProjectModal'
import { useAppStore } from '@/stores/appStore'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

const pageVariants = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
}

export const AppLayout: React.FC = () => {
  const location = useLocation()
  const { notifications } = useAppStore()
  const [activeToasts, setActiveToasts] = useState<any[]>([])
  const prevCount = useRef(notifications.length)

  useEffect(() => {
    if (notifications.length > prevCount.current) {
      const newNotif = notifications[0]
      setActiveToasts(prev => [...prev, newNotif])
      setTimeout(() => {
        setActiveToasts(prev => prev.filter(t => t.id !== newNotif.id))
      }, 4000)
    }
    prevCount.current = notifications.length
  }, [notifications])

  return (
    <div className="flex h-screen overflow-hidden bg-[#0A0F1C] relative">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CommandPalette />
      <CreateProjectModal />

      {/* Floating Toast Notification Stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm pointer-events-none">
        <AnimatePresence>
          {activeToasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-[12px] bg-[#121826]/95 border border-[rgba(255,255,255,0.08)] shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <div className="shrink-0 mt-0.5">
                {toast.type === 'success' ? <CheckCircle size={16} className="text-[#10B981]" /> :
                 toast.type === 'error' ? <AlertCircle size={16} className="text-[#EF4444]" /> :
                 toast.type === 'warning' ? <AlertCircle size={16} className="text-[#F59E0B]" /> :
                 <Info size={16} className="text-[#6366F1]" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-[#F8FAFC]">{toast.title}</h4>
                <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{toast.message}</p>
              </div>
              <button
                onClick={() => setActiveToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="text-[#475569] hover:text-[#94A3B8] transition-colors self-start p-0.5 rounded"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
