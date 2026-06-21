import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Settings, User, Users, Shield, Bell, Key, Database,
  Clock, ChevronRight, Check, Trash2, Edit, Plus, X, AlertCircle, Copy,
} from 'lucide-react'
import { Card, Badge, Button, Input, Tabs, Divider, SectionHeader } from '@/components/ui'
import { MOCK_USERS, MOCK_AUDIT_LOGS, MOCK_ORG } from '@/lib/mockData'
import { formatRelativeTime, formatDate } from '@/lib/utils'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import type { UserRole } from '@/types'
import axios from 'axios'

const ROLE_CONFIG: Record<UserRole, { label: string; color: string; variant: 'indigo' | 'success' | 'cyan' | 'default' }> = {
  admin: { label: 'Admin', color: '#6366F1', variant: 'indigo' },
  data_engineer: { label: 'Data Engineer', color: '#10B981', variant: 'success' },
  data_scientist: { label: 'Data Scientist', color: '#06B6D4', variant: 'cyan' },
  viewer: { label: 'Viewer', color: '#94A3B8', variant: 'default' },
}

const PERMISSION_MATRIX: { resource: string; admin: boolean; data_engineer: boolean; data_scientist: boolean; viewer: boolean }[] = [
  { resource: 'View Dashboards', admin: true, data_engineer: true, data_scientist: true, viewer: true },
  { resource: 'Upload Datasets', admin: true, data_engineer: true, data_scientist: false, viewer: false },
  { resource: 'Delete Datasets', admin: true, data_engineer: false, data_scientist: false, viewer: false },
  { resource: 'Create Pipelines', admin: true, data_engineer: true, data_scientist: false, viewer: false },
  { resource: 'Run Pipelines', admin: true, data_engineer: true, data_scientist: true, viewer: false },
  { resource: 'Manage Features', admin: true, data_engineer: true, data_scientist: true, viewer: false },
  { resource: 'Manage Workflows', admin: true, data_engineer: true, data_scientist: false, viewer: false },
  { resource: 'View Audit Logs', admin: true, data_engineer: false, data_scientist: false, viewer: false },
  { resource: 'Manage Team', admin: true, data_engineer: false, data_scientist: false, viewer: false },
  { resource: 'Billing & Settings', admin: true, data_engineer: false, data_scientist: false, viewer: false },
]

export const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore()
  const { addNotification } = useAppStore()
  
  const [activeTab, setActiveTab] = useState('profile')
  const [saved, setSaved] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  // --- STATE FOR PROFILE TAB ---
  const [profileName, setProfileName] = useState(user?.name || '')
  const [profileEmail, setProfileEmail] = useState(user?.email || '')
  const [savingProfile, setSavingProfile] = useState(false)

  // --- STATE FOR TEAM TAB ---
  const [team, setTeam] = useState<any[]>([])
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [activeMember, setActiveMember] = useState<any>(null)

  // Invite form states
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('viewer')
  const [inviteError, setInviteError] = useState('')

  // Edit form states
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState<UserRole>('viewer')
  const [editError, setEditError] = useState('')

  // --- STATE FOR API KEYS ---
  const [apiKeys, setApiKeys] = useState<any[]>([
    { id: 'key_1', name: 'Production API Key', created: '2024-01-15', lastUsed: '2024-06-19', prefix: 'df_live_k4x...' },
    { id: 'key_2', name: 'Development API Key', created: '2024-03-01', lastUsed: '2024-06-18', prefix: 'df_test_m8z...' },
  ])
  const [generateKeyOpen, setGenerateKeyOpen] = useState(false)
  const [newKeyName, setNewKeyName] = useState('')
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [keyError, setKeyError] = useState('')
  const [copied, setCopied] = useState(false)

  // --- STATE FOR NOTIFICATIONS ---
  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    pipeline_failures: true,
    data_quality: true,
    sla_breaches: true,
    pipeline_completions: false,
    team_members: true,
    feature_updates: false,
  })
  const [savingNotifications, setSavingNotifications] = useState(false)

  // --- FETCH SETTINGS ON LOAD ---
  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('dataforge_token')
      if (!token) {
        setLoadingSettings(false)
        return
      }
      try {
        const response = await axios.get('/api/v1/settings', {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = response.data.settings_data
        if (data) {
          setProfileName(data.profile?.full_name || user?.name || '')
          setProfileEmail(data.profile?.email || user?.email || '')
          if (data.team) setTeam(data.team)
          if (data.notifications) setNotifications(data.notifications)
        }
      } catch (err) {
        console.error("Failed to load settings:", err)
        addNotification({
          title: 'Error Loading Settings',
          message: 'Failed to fetch settings from the database.',
          type: 'error'
        })
      } finally {
        setLoadingSettings(false)
      }
    }
    fetchSettings()
  }, [user?.name, user?.email])

  // --- SAVE SETTINGS MUTATION ---
  const saveSettings = async (
    newProfile = { full_name: profileName, email: profileEmail },
    newTeam = team,
    newNotifications = notifications
  ) => {
    const token = localStorage.getItem('dataforge_token')
    if (!token) return false

    try {
      const response = await axios.put('/api/v1/settings', {
        settings_data: {
          profile: newProfile,
          team: newTeam,
          notifications: newNotifications,
          theme: 'dark'
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const savedData = response.data.settings_data
      if (savedData) {
        setProfileName(savedData.profile?.full_name || '')
        setProfileEmail(savedData.profile?.email || '')
        setTeam(savedData.team || [])
        setNotifications(savedData.notifications || {})

        // Update auth state so name/email updates show in header/sidebar instantly
        setUser({
          ...user!,
          name: savedData.profile?.full_name || user?.name || '',
          email: savedData.profile?.email || user?.email || '',
        })
      }
      return true
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || 'Failed to save settings to database.'
      addNotification({
        title: 'Error Saving Settings',
        message: errMsg,
        type: 'error'
      })
      return false
    }
  }

  const handleSave = async () => {
    if (!profileName.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Full Name is required.',
        type: 'error'
      })
      return
    }
    if (!profileEmail.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Email address is required.',
        type: 'error'
      })
      return
    }

    setSavingProfile(true)
    const success = await saveSettings({ full_name: profileName.trim(), email: profileEmail.trim() })
    setSavingProfile(false)

    if (success) {
      setSaved(true)
      addNotification({
        title: 'Profile Updated',
        message: 'Personal profile changes saved successfully.',
        type: 'success'
      })
      setTimeout(() => setSaved(false), 2000)
    }
  }

  // --- TEAM MEMBER ACTIONS ---
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError('')

    if (!inviteName.trim() || !inviteEmail.trim()) {
      setInviteError('All fields are required.')
      return
    }

    if (team.some(m => m.email.toLowerCase() === inviteEmail.trim().toLowerCase())) {
      setInviteError('A member with this email already exists.')
      return
    }

    const newMember = {
      id: Math.random().toString(36).slice(2),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      organizationId: 'org_1',
      createdAt: new Date().toISOString()
    }

    const updatedTeam = [...team, newMember]
    setTeam(updatedTeam)

    const success = await saveSettings(
      { full_name: profileName, email: profileEmail },
      updatedTeam,
      notifications
    )

    if (success) {
      addNotification({
        title: 'Member Invited',
        message: `${inviteName.trim()} was successfully added to your organization.`,
        type: 'success'
      })
      setInviteOpen(false)
      setInviteName('')
      setInviteEmail('')
      setInviteRole('viewer')
    }
  }

  const handleEditClick = (member: any) => {
    setActiveMember(member)
    setEditName(member.name)
    setEditEmail(member.email)
    setEditRole(member.role)
    setEditError('')
    setEditOpen(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEditError('')

    if (!editName.trim() || !editEmail.trim()) {
      setEditError('All fields are required.')
      return
    }

    if (team.some(m => m.id !== activeMember.id && m.email.toLowerCase() === editEmail.trim().toLowerCase())) {
      setEditError('Another member already uses this email.')
      return
    }

    const updatedTeam = team.map(m => m.id === activeMember.id ? { ...m, name: editName.trim(), email: editEmail.trim(), role: editRole } : m)
    setTeam(updatedTeam)

    const success = await saveSettings(
      { full_name: profileName, email: profileEmail },
      updatedTeam,
      notifications
    )

    if (success) {
      addNotification({
        title: 'Member Profile Updated',
        message: `Updated profile details for ${editName.trim()}.`,
        type: 'success'
      })
      setEditOpen(false)
      setActiveMember(null)
    }
  }

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    const updatedTeam = team.filter(m => m.id !== memberId)
    setTeam(updatedTeam)

    const success = await saveSettings(
      { full_name: profileName, email: profileEmail },
      updatedTeam,
      notifications
    )

    if (success) {
      addNotification({
        title: 'Member Removed',
        message: `Removed ${memberName} from this organization workspace.`,
        type: 'warning'
      })
    }
  }

  // --- API KEY ACTIONS ---
  const handleRevokeKey = (keyId: string, keyName: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== keyId))
    addNotification({
      title: 'API Key Revoked',
      message: `Successfully revoked developer key "${keyName}".`,
      type: 'warning'
    })
  }

  const handleGenerateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setKeyError('')

    if (!newKeyName.trim()) {
      setKeyError('Key name is required.')
      return
    }

    const randomHex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const fullKey = `df_live_${randomHex}`
    setGeneratedKey(fullKey)
    setCopied(false)

    const newKey = {
      id: Math.random().toString(36).slice(2),
      name: newKeyName.trim(),
      created: new Date().toISOString().split('T')[0],
      lastUsed: new Date().toISOString(),
      prefix: `${fullKey.slice(0, 11)}...`
    }

    setApiKeys([...apiKeys, newKey])
    addNotification({
      title: 'API Key Generated',
      message: `Key "${newKeyName.trim()}" generated. Copy the secret now.`,
      type: 'success'
    })
  }

  const handleCopyKey = () => {
    if (generatedKey) {
      navigator.clipboard.writeText(generatedKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // --- NOTIFICATION ACTIONS ---
  const handleToggleNotification = (id: string) => {
    setNotifications(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const handleSaveNotifications = async () => {
    setSavingNotifications(true)
    const success = await saveSettings(
      { full_name: profileName, email: profileEmail },
      team,
      notifications
    )
    setSavingNotifications(false)

    if (success) {
      addNotification({
        title: 'Preferences Saved',
        message: 'Notification preferences have been successfully updated.',
        type: 'success'
      })
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={12} /> },
    { id: 'team', label: 'Team', icon: <Users size={12} /> },
    { id: 'access', label: 'Access Control', icon: <Shield size={12} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={12} /> },
    { id: 'audit', label: 'Audit Logs', icon: <Clock size={12} /> },
  ]

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-2 border-[#6366F1] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto relative">
      <SectionHeader title="Settings" description="Manage your organization, team, and platform preferences" />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="mb-6" />

      {activeTab === 'profile' && (
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <Card padding="md">
              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Personal Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Name" value={profileName} onChange={e => setProfileName(e.target.value)} />
                  <Input label="Email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} type="email" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1.5">Role</label>
                    <div className="px-3 py-2 bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[8px]">
                      <Badge variant={ROLE_CONFIG[user?.role ?? 'viewer'].variant}>
                        {ROLE_CONFIG[user?.role ?? 'viewer'].label}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94A3B8] uppercase tracking-wide mb-1.5">Organization</label>
                    <div className="px-3 py-2 bg-[#0A0F1C] border border-[rgba(255,255,255,0.10)] rounded-[8px] text-sm text-[#F8FAFC]">
                      {MOCK_ORG.name}
                    </div>
                  </div>
                </div>
                <Button variant="primary" size="sm" leftIcon={saved ? <Check size={13} /> : undefined} onClick={handleSave} disabled={savingProfile}>
                  {saved ? 'Saved!' : 'Save Changes'}
                </Button>
              </div>
            </Card>

            <Card padding="md">
              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Password & Security</h3>
              <div className="space-y-3">
                <Input label="Current Password" type="password" placeholder="••••••••" />
                <Input label="New Password" type="password" placeholder="••••••••" />
                <Input label="Confirm New Password" type="password" placeholder="••••••••" />
                <div className="flex items-center justify-between">
                  <Button variant="secondary" size="sm">Update Password</Button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B]">2FA</span>
                    <div className="w-8 h-4 bg-[rgba(255,255,255,0.06)] rounded-full relative cursor-pointer">
                      <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-[#64748B] rounded-full" />
                    </div>
                    <span className="text-xs text-[#475569]">Disabled</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">API Keys</h3>
              <div className="space-y-3">
                {apiKeys.map(key => (
                  <div key={key.id} className="flex items-center justify-between p-3 bg-[#0A0F1C] rounded-[8px] border border-[rgba(255,255,255,0.06)]">
                    <div className="flex items-center gap-3">
                      <Key size={13} className="text-[#475569]" />
                      <div>
                        <p className="text-xs font-medium text-[#F8FAFC]">{key.name}</p>
                        <code className="text-[10px] text-[#475569]">{key.prefix}</code>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-[#475569]">Used {formatRelativeTime(key.lastUsed)}</span>
                      <Button variant="danger" size="xs" leftIcon={<Trash2 size={10} />} onClick={() => handleRevokeKey(key.id, key.name)}>Revoke</Button>
                    </div>
                  </div>
                ))}
                <Button variant="secondary" size="sm" leftIcon={<Plus size={12} />} onClick={() => { setGenerateKeyOpen(true); setGeneratedKey(null); setNewKeyName(''); setKeyError('') }}>Generate New Key</Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card padding="md">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-[10px] bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-white text-sm font-bold">
                  {MOCK_ORG.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F8FAFC]">{MOCK_ORG.name}</p>
                  <p className="text-xs text-[#64748B]">{MOCK_ORG.slug}</p>
                </div>
              </div>
              <Divider className="mb-3" />
              <div className="space-y-2.5">
                {[
                  { label: 'Plan', value: <Badge variant="indigo">{MOCK_ORG.plan}</Badge> },
                  { label: 'Members', value: `${team.length} users` },
                  { label: 'Created', value: formatDate(MOCK_ORG.createdAt) },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center">
                    <span className="text-xs text-[#64748B]">{item.label}</span>
                    <span className="text-xs text-[#94A3B8]">{item.value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-[#64748B]">{team.length} members in {MOCK_ORG.name}</p>
            <Button variant="primary" size="sm" leftIcon={<Plus size={13} />} onClick={() => { setInviteOpen(true); setInviteError(''); setInviteName(''); setInviteEmail(''); setInviteRole('viewer') }}>Invite Member</Button>
          </div>
          {team.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <Card padding="md" className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#F8FAFC]">{member.name}</p>
                    {member.email === user?.email && <Badge variant="indigo" size="sm">You</Badge>}
                  </div>
                  <p className="text-xs text-[#64748B]">{member.email}</p>
                </div>
                <Badge variant={ROLE_CONFIG[member.role as UserRole].variant}>{ROLE_CONFIG[member.role as UserRole].label}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="xs" leftIcon={<Edit size={11} />} onClick={() => handleEditClick(member)}>Edit</Button>
                  {member.email !== user?.email && <Button variant="danger" size="xs" leftIcon={<Trash2 size={11} />} onClick={() => handleRemoveMember(member.id, member.name)}>Remove</Button>}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'access' && (
        <div className="space-y-4">
          <p className="text-sm text-[#64748B] mb-4">Role-Based Access Control (RBAC) — permission matrix for all platform resources.</p>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.06)]">
                    <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#475569] uppercase tracking-wide">Permission</th>
                    {(['admin', 'data_engineer', 'data_scientist', 'viewer'] as UserRole[]).map(role => (
                      <th key={role} className="px-4 py-3 text-center text-[10px] uppercase tracking-wide">
                        <Badge variant={ROLE_CONFIG[role].variant}>{ROLE_CONFIG[role].label}</Badge>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
                  {PERMISSION_MATRIX.map(row => (
                    <tr key={row.resource} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="px-5 py-3 text-xs text-[#94A3B8]">{row.resource}</td>
                      {(['admin', 'data_engineer', 'data_scientist', 'viewer'] as UserRole[]).map(role => (
                        <td key={role} className="px-4 py-3 text-center">
                          {row[role as keyof typeof row] ? (
                            <Check size={14} className="text-[#10B981] mx-auto" />
                          ) : (
                            <span className="text-[#334155] text-xs">—</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'notifications' && (
        <Card padding="md" className="max-w-lg">
          <h3 className="text-sm font-semibold text-[#F8FAFC] mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            {[
              { id: 'pipeline_failures', label: 'Pipeline Failures', description: 'Get notified when any pipeline fails' },
              { id: 'data_quality', label: 'Data Quality Drops', description: 'Alert when quality score falls below threshold' },
              { id: 'sla_breaches', label: 'SLA Breaches', description: 'Notify when data freshness SLA is breached' },
              { id: 'pipeline_completions', label: 'Pipeline Completions', description: 'Confirm when pipelines complete successfully' },
              { id: 'team_members', label: 'New Team Members', description: 'Alert when someone joins the organization' },
              { id: 'feature_updates', label: 'Feature Updates', description: 'Notify when ML features are published' },
            ].map(pref => (
              <div key={pref.id} className="flex items-start justify-between gap-4 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <div>
                  <p className="text-xs font-medium text-[#F8FAFC]">{pref.label}</p>
                  <p className="text-[11px] text-[#475569] mt-0.5">{pref.description}</p>
                </div>
                <div
                  onClick={() => handleToggleNotification(pref.id)}
                  className={`w-9 h-5 rounded-full relative cursor-pointer transition-colors shrink-0 border transition-all ${
                    notifications[pref.id]
                      ? 'bg-[#6366F1] border-[#6366F1]'
                      : 'bg-[#0D121F] border-[rgba(255,255,255,0.08)]'
                  }`}
                >
                  <div
                    className={`absolute top-[2px] w-3.5 h-3.5 rounded-full transition-all ${
                      notifications[pref.id]
                        ? 'right-[2px] bg-[#F8FAFC]'
                        : 'left-[2px] bg-[#64748B]'
                    }`}
                  />
                </div>
              </div>
            ))}
            <Button variant="primary" size="sm" onClick={handleSaveNotifications} disabled={savingNotifications} leftIcon={savingNotifications ? <Check size={13} /> : undefined}>
              {savingNotifications ? 'Saved!' : 'Save Preferences'}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === 'audit' && (
        <Card padding="none">
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)]">
            <h3 className="text-sm font-semibold text-[#F8FAFC]">Audit Log</h3>
            <p className="text-xs text-[#64748B] mt-0.5">All platform actions are logged for compliance</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[rgba(255,255,255,0.06)]">
                {['User', 'Action', 'Resource', 'Resource ID', 'IP Address', 'Time'].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] font-semibold text-[#475569] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {MOCK_AUDIT_LOGS.map((log, i) => (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#6366F1] to-[#06B6D4] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {log.userName.charAt(0)}
                      </div>
                      <span className="text-xs text-[#F8FAFC]">{log.userName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <code className="text-xs text-[#6366F1] font-mono">{log.action}</code>
                  </td>
                  <td className="px-5 py-3 text-xs text-[#94A3B8]">{log.resource}</td>
                  <td className="px-5 py-3 text-xs font-mono text-[#475569]">{log.resourceId}</td>
                  <td className="px-5 py-3 text-xs font-mono text-[#475569]">{log.ipAddress}</td>
                  <td className="px-5 py-3 text-xs text-[#475569]">{formatRelativeTime(log.createdAt)}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* --- INVITE MEMBER DIALOG MODAL --- */}
      <AnimatePresence>
        {inviteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setInviteOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-[#121826] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-2xl p-6 z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Invite Organization Member</h3>
                <button onClick={() => setInviteOpen(false)} className="text-[#475569] hover:text-[#94A3B8] transition-colors"><X size={15} /></button>
              </div>
              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Full Name</label>
                  <input type="text" value={inviteName} onChange={e => setInviteName(e.target.value)} placeholder="e.g. Sarah Jenkins" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Work Email</label>
                  <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="e.g. sarah@company.com" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Access Role</label>
                  <select value={inviteRole} onChange={e => setInviteRole(e.target.value as UserRole)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                    <option value="viewer" className="bg-[#121826]">Viewer (Read-only)</option>
                    <option value="data_scientist" className="bg-[#121826]">Data Scientist</option>
                    <option value="data_engineer" className="bg-[#121826]">Data Engineer</option>
                    <option value="admin" className="bg-[#121826]">Admin (Full Access)</option>
                  </select>
                </div>
                {inviteError && (
                  <div className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-2.5 flex items-center gap-1.5">
                    <AlertCircle size={13} /> {inviteError}
                  </div>
                )}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setInviteOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Invite Member</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- EDIT MEMBER DIALOG MODAL --- */}
      <AnimatePresence>
        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-[#121826] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-2xl p-6 z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">Edit Member Settings</h3>
                <button onClick={() => setEditOpen(false)} className="text-[#475569] hover:text-[#94A3B8] transition-colors"><X size={15} /></button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Full Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Work Email</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" required />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Access Role</label>
                  <select value={editRole} onChange={e => setEditRole(e.target.value as UserRole)} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]">
                    <option value="viewer" className="bg-[#121826]">Viewer (Read-only)</option>
                    <option value="data_scientist" className="bg-[#121826]">Data Scientist</option>
                    <option value="data_engineer" className="bg-[#121826]">Data Engineer</option>
                    <option value="admin" className="bg-[#121826]">Admin (Full Access)</option>
                  </select>
                </div>
                {editError && (
                  <div className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-2.5 flex items-center gap-1.5">
                    <AlertCircle size={13} /> {editError}
                  </div>
                )}
                <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" size="sm">Save Changes</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- GENERATE NEW KEY DIALOG MODAL --- */}
      <AnimatePresence>
        {generateKeyOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGenerateKeyOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-md bg-[#121826] border border-[rgba(255,255,255,0.08)] rounded-[16px] shadow-2xl p-6 z-10 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
                <h3 className="text-sm font-semibold text-[#F8FAFC]">
                  {generatedKey ? 'API Key Generated' : 'Create Developer API Key'}
                </h3>
                <button onClick={() => setGenerateKeyOpen(false)} className="text-[#475569] hover:text-[#94A3B8] transition-colors"><X size={15} /></button>
              </div>

              {!generatedKey ? (
                <form onSubmit={handleGenerateKeySubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">Key Label / Name</label>
                    <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="e.g. CI/CD Ingestion Key" className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-3.5 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1]" required />
                  </div>
                  {keyError && (
                    <div className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-2.5 flex items-center gap-1.5">
                      <AlertCircle size={13} /> {keyError}
                    </div>
                  )}
                  <div className="flex justify-end gap-2.5 pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <Button type="button" variant="ghost" size="sm" onClick={() => setGenerateKeyOpen(false)}>Cancel</Button>
                    <Button type="submit" variant="primary" size="sm">Generate Key</Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)] rounded-[10px] flex gap-2.5">
                    <AlertCircle size={16} className="text-[#F59E0B] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#D97706] leading-relaxed">
                      Make sure to copy your API key now. For security purposes, you will not be able to view it again.
                    </p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase">API Token</label>
                    <div className="relative">
                      <input type="text" readOnly value={generatedKey} className="w-full bg-[#0D121F] border border-[rgba(255,255,255,0.08)] rounded-[10px] pl-3.5 pr-20 py-2.5 text-xs text-[#F8FAFC] font-mono focus:outline-none" />
                      <button onClick={handleCopyKey} className="absolute right-1 top-1 bottom-1 px-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-[6px] text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer">
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end pt-3 border-t border-[rgba(255,255,255,0.06)]">
                    <Button variant="primary" size="sm" onClick={() => setGenerateKeyOpen(false)}>Close</Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
