import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

// ============================================
// BUTTON
// ============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const variants = {
      primary: 'bg-[#6366F1] hover:bg-[#818CF8] text-white border-transparent shadow-[0_0_20px_rgba(99,102,241,0.25)]',
      secondary: 'bg-[#161F32] hover:bg-[#1a2540] text-[#F8FAFC] border-[rgba(255,255,255,0.10)]',
      ghost: 'bg-transparent hover:bg-[#161F32] text-[#94A3B8] hover:text-[#F8FAFC] border-transparent',
      danger: 'bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/20',
      outline: 'bg-transparent hover:bg-[#6366F1]/10 text-[#6366F1] border-[#6366F1]/30',
    }
    const sizes = {
      xs: 'px-2.5 py-1 text-xs gap-1.5',
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-sm gap-2',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium border rounded-[8px] transition-all duration-150 cursor-pointer select-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'focus-visible:outline-2 focus-visible:outline-[#6366F1] focus-visible:outline-offset-2',
          variants[variant], sizes[size], className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : leftIcon}
        {children}
        {!loading && rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'

// ============================================
// BADGE
// ============================================
interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'indigo' | 'cyan'
  size?: 'sm' | 'md'
  dot?: boolean
  children: React.ReactNode
  className?: string
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', size = 'sm', dot, children, className }) => {
  const variants = {
    default: 'bg-[rgba(255,255,255,0.06)] text-[#94A3B8] border-[rgba(255,255,255,0.10)]',
    success: 'bg-[rgba(16,185,129,0.12)] text-[#10B981] border-[rgba(16,185,129,0.2)]',
    warning: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B] border-[rgba(245,158,11,0.2)]',
    error: 'bg-[rgba(239,68,68,0.12)] text-[#EF4444] border-[rgba(239,68,68,0.2)]',
    info: 'bg-[rgba(59,130,246,0.12)] text-[#3B82F6] border-[rgba(59,130,246,0.2)]',
    indigo: 'bg-[rgba(99,102,241,0.12)] text-[#6366F1] border-[rgba(99,102,241,0.2)]',
    cyan: 'bg-[rgba(6,182,212,0.12)] text-[#06B6D4] border-[rgba(6,182,212,0.2)]',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  }
  const dotColors = {
    default: 'bg-[#64748B]', success: 'bg-[#10B981]', warning: 'bg-[#F59E0B]',
    error: 'bg-[#EF4444]', info: 'bg-[#3B82F6]', indigo: 'bg-[#6366F1]', cyan: 'bg-[#06B6D4]',
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-medium rounded-full border', variants[variant], sizes[size], className)}>
      {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />}
      {children}
    </span>
  )
}

// ============================================
// CARD
// ============================================
interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  onClick?: () => void
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card: React.FC<CardProps> = ({ children, className, hover, onClick, padding = 'md' }) => {
  const paddings = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#161F32] border border-[rgba(255,255,255,0.06)] rounded-[12px]',
        hover && 'hover:border-[rgba(255,255,255,0.12)] hover:bg-[#1a2540] transition-all duration-200',
        onClick && 'cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================
// INPUT
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightElement, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide">{label}</label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">{leftIcon}</div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[8px]',
            'px-3 py-2 text-sm text-[#F8FAFC] placeholder-[#475569]',
            'focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30',
            'transition-colors duration-150',
            leftIcon && 'pl-9',
            rightElement && 'pr-10',
            error && 'border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20',
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</div>
        )}
      </div>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ============================================
// SELECT
// ============================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { label: string; value: string }[]
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, className, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide">{label}</label>}
      <select
        ref={ref}
        className={cn(
          'w-full bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[8px]',
          'px-3 py-2 text-sm text-[#F8FAFC]',
          'focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30',
          'transition-colors duration-150 cursor-pointer',
          className
        )}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-[#121826]">{opt.label}</option>
        ))}
      </select>
    </div>
  )
)
Select.displayName = 'Select'

// ============================================
// SKELETON
// ============================================
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('skeleton rounded-[6px]', className)} />
)

export const SkeletonCard: React.FC = () => (
  <Card>
    <Skeleton className="h-4 w-32 mb-3" />
    <Skeleton className="h-8 w-24 mb-2" />
    <Skeleton className="h-3 w-full" />
  </Card>
)

// ============================================
// PROGRESS
// ============================================
interface ProgressProps {
  value: number
  max?: number
  color?: string
  size?: 'sm' | 'md'
  label?: string
  showValue?: boolean
  className?: string
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, color = '#6366F1', size = 'md', label, showValue, className }) => {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className={cn('space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex justify-between text-xs text-[#94A3B8]">
          {label && <span>{label}</span>}
          {showValue && <span>{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// ============================================
// STAT CARD
// ============================================
interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: number
  icon?: React.ReactNode
  color?: string
  loading?: boolean
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, trend, icon, color = '#6366F1', loading }) => {
  if (loading) return <SkeletonCard />
  return (
    <Card className="flex items-start gap-4">
      {icon && (
        <div className="p-2.5 rounded-[10px] shrink-0" style={{ backgroundColor: `${color}18`, border: `1px solid ${color}25` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#64748B] font-medium uppercase tracking-wide mb-1">{label}</p>
        <p className="text-2xl font-bold text-[#F8FAFC] tracking-tight">{value}</p>
        <div className="flex items-center gap-2 mt-1">
          {subValue && <p className="text-xs text-[#64748B]">{subValue}</p>}
          {trend !== undefined && (
            <span className={cn('text-xs font-medium', trend >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]')}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}

// ============================================
// TABS
// ============================================
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode; count?: number }[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className }) => (
  <div className={cn('flex gap-1 p-1 bg-[#0A0F1C] rounded-[10px] border border-[rgba(255,255,255,0.06)]', className)}>
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all duration-150',
          activeTab === tab.id
            ? 'bg-[#6366F1] text-white shadow-[0_0_12px_rgba(99,102,241,0.3)]'
            : 'text-[#64748B] hover:text-[#94A3B8] hover:bg-[rgba(255,255,255,0.04)]'
        )}
      >
        {tab.icon}
        {tab.label}
        {tab.count !== undefined && (
          <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full', activeTab === tab.id ? 'bg-white/20' : 'bg-[rgba(255,255,255,0.06)]')}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
)

// ============================================
// DIVIDER
// ============================================
export const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('border-t border-[rgba(255,255,255,0.06)]', className)} />
)

// ============================================
// EMPTY STATE
// ============================================
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <motion.div
    className="flex flex-col items-center justify-center py-16 text-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    {icon && (
      <div className="w-14 h-14 rounded-2xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.06)] flex items-center justify-center mb-4 text-[#64748B]">
        {icon}
      </div>
    )}
    <h3 className="text-sm font-semibold text-[#F8FAFC] mb-1">{title}</h3>
    {description && <p className="text-sm text-[#64748B] max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </motion.div>
)

// ============================================
// TOOLTIP
// ============================================
interface TooltipProps {
  content: string
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => (
  <div className="relative group inline-flex">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[6px] text-xs text-[#F8FAFC] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
      {content}
    </div>
  </div>
)

// ============================================
// SECTION HEADER
// ============================================
interface SectionHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h2 className="text-lg font-semibold text-[#F8FAFC]">{title}</h2>
      {description && <p className="text-sm text-[#64748B] mt-0.5">{description}</p>}
    </div>
    {action}
  </div>
)

// ============================================
// STATUS INDICATOR
// ============================================
interface StatusDotProps {
  status: 'success' | 'error' | 'warning' | 'running' | 'idle' | 'paused'
  label?: string
  size?: 'sm' | 'md'
}

export const StatusDot: React.FC<StatusDotProps> = ({ status, label, size = 'md' }) => {
  const colors = {
    success: '#10B981', error: '#EF4444', warning: '#F59E0B',
    running: '#3B82F6', idle: '#64748B', paused: '#94A3B8',
  }
  const color = colors[status]
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative">
        <div
          className={cn('rounded-full', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')}
          style={{ backgroundColor: color }}
        />
        {status === 'running' && (
          <div
            className={cn('absolute inset-0 rounded-full opacity-60 animate-ping', size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')}
            style={{ backgroundColor: color }}
          />
        )}
      </div>
      {label && <span className="text-xs text-[#94A3B8] capitalize">{label || status}</span>}
    </div>
  )
}

export * from './Logo'
