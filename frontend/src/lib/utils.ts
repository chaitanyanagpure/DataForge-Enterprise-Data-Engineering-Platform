import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString()
}

export function formatRelativeTime(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true })
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  return format(new Date(dateStr), fmt)
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ${Math.floor((ms % 60_000) / 1000)}s`
  return `${Math.floor(ms / 3_600_000)}h ${Math.floor((ms % 3_600_000) / 60_000)}m`
}

export function getQualityColor(score: number): string {
  if (score >= 90) return '#10B981'
  if (score >= 70) return '#F59E0B'
  if (score >= 50) return '#F97316'
  return '#EF4444'
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    success: '#10B981',
    active: '#10B981',
    ready: '#10B981',
    running: '#3B82F6',
    processing: '#3B82F6',
    warning: '#F59E0B',
    stale: '#F59E0B',
    error: '#EF4444',
    failure: '#EF4444',
    idle: '#64748B',
    draft: '#64748B',
    paused: '#94A3B8',
  }
  return map[status] ?? '#64748B'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const CRON_PRESETS = [
  { label: 'Every hour', value: '0 * * * *' },
  { label: 'Every 6 hours', value: '0 */6 * * *' },
  { label: 'Daily at midnight', value: '0 0 * * *' },
  { label: 'Daily at 6am', value: '0 6 * * *' },
  { label: 'Weekly (Monday)', value: '0 0 * * 1' },
  { label: 'Monthly (1st)', value: '0 0 1 * *' },
]

export function isProjectMatch(itemProjectId: string | undefined, activeProjectId: string | undefined): boolean {
  if (!itemProjectId || !activeProjectId) return false
  const cleanItem = itemProjectId.replace('proj', '').replace('_', '')
  const cleanActive = activeProjectId.replace('proj', '').replace('_', '')
  return cleanItem === cleanActive
}
