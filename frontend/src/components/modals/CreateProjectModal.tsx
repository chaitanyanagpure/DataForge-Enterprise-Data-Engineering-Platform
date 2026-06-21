import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Folder, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { Button } from '@/components/ui'

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
]

export const CreateProjectModal: React.FC = () => {
  const { newProjectModalOpen, setNewProjectModalOpen, createProject, addNotification } = useAppStore()
  
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0])
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleClose = () => {
    setName('')
    setDescription('')
    setSelectedColor(PRESET_COLORS[0])
    setError('')
    setNewProjectModalOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!name.trim()) {
      setError('Project name is required.')
      return
    }

    setIsSubmitting(true)
    try {
      await createProject(name.trim(), description.trim(), selectedColor)
      
      // Add notification
      addNotification({
        title: 'Project Created',
        message: `Project "${name.trim()}" was created successfully.`,
        type: 'success'
      })

      setIsSubmitting(false)
      handleClose()
    } catch (err: any) {
      setIsSubmitting(false)
      setError(err?.message || 'Failed to create project. Please try again.')
    }
  }

  return (
    <AnimatePresence>
      {newProjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-[#121826] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-2xl p-6 overflow-hidden z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[rgba(255,255,255,0.06)] mb-5">
              <div className="flex items-center gap-2">
                <Folder size={18} className="text-[#6366F1]" />
                <h3 className="text-base font-semibold text-[#F8FAFC]">New Data Project</h3>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-[6px] text-[#475569] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)] transition-colors focus:outline-none"
              >
                <X size={15} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Project Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Sales Forecast Model"
                  className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all shadow-inner"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Summarize this project's pipelines and features..."
                  className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2.5 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all min-h-[80px] max-h-[140px] shadow-inner"
                />
              </div>

              {/* Color Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Color Tag
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110 focus:outline-none relative flex items-center justify-center cursor-pointer"
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <span className="w-2 h-2 bg-white rounded-full shadow-md" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/10 rounded-[8px] p-3 flex gap-2 items-start">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-[rgba(255,255,255,0.06)] mt-5">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  loading={isSubmitting}
                >
                  Create Project
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
