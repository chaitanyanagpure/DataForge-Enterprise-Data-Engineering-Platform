import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import type { Project, Notification, Dataset, QualityReport, Feature, Workflow as WorkflowType, Pipeline, PipelineRun, DatasetVersion, WorkflowRun } from '@/types'
import { MOCK_PROJECTS, MOCK_NOTIFICATIONS, MOCK_DATASETS, MOCK_QUALITY_REPORTS, MOCK_FEATURES, MOCK_WORKFLOWS, MOCK_PIPELINES, MOCK_PIPELINE_RUNS, MOCK_VERSIONS, MOCK_WORKFLOW_RUNS } from '@/lib/mockData'

interface AppState {
  activeProject: Project | null
  projects: Project[]
  notifications: Notification[]
  unreadCount: number
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  newProjectModalOpen: boolean
  theme: 'dark' | 'light'
  
  // Persisted Lists
  datasets: Dataset[]
  datasetVersions: DatasetVersion[]
  qualityReports: QualityReport[]
  features: Feature[]
  workflows: WorkflowType[]
  workflowRuns: WorkflowRun[]
  pipelines: Pipeline[]
  pipelineRuns: PipelineRun[]

  setActiveProject: (project: Project | null) => void
  markNotificationRead: (id: string) => void
  markAllRead: () => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (open: boolean) => void
  setNewProjectModalOpen: (open: boolean) => void
  addNotification: (n: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void
  fetchProjects: () => Promise<void>
  createProject: (name: string, description: string, color: string) => Promise<void>
  
  setDatasets: (datasets: Dataset[]) => void
  setQualityReports: (reports: QualityReport[]) => void
  setFeatures: (features: Feature[]) => void
  setWorkflows: (workflows: WorkflowType[]) => void
  setPipelines: (pipelines: Pipeline[]) => void
  setPipelineRuns: (runs: PipelineRun[]) => void
  updatePipeline: (id: string, updates: Partial<Pipeline>) => void
  addPipelineRun: (run: PipelineRun) => void
  restoreDatasetVersion: (datasetId: string, versionId: string) => void
  setWorkflowRuns: (runs: WorkflowRun[]) => void
  addWorkflowRun: (run: WorkflowRun) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeProject: null,
      projects: [],
      notifications: MOCK_NOTIFICATIONS,
      unreadCount: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      newProjectModalOpen: false,
      theme: 'dark',

      // Initial Persisted Lists
      datasets: MOCK_DATASETS,
      datasetVersions: MOCK_VERSIONS,
      qualityReports: MOCK_QUALITY_REPORTS,
      features: MOCK_FEATURES,
      workflows: MOCK_WORKFLOWS,
      workflowRuns: MOCK_WORKFLOW_RUNS,
      pipelines: MOCK_PIPELINES,
      pipelineRuns: MOCK_PIPELINE_RUNS,

      setActiveProject: (project) => set({ activeProject: project }),

      markNotificationRead: (id) =>
        set(state => {
          const updated = state.notifications.map(n => n.id === id ? { ...n, isRead: true } : n)
          return { notifications: updated, unreadCount: updated.filter(n => !n.isRead).length }
        }),

      markAllRead: () =>
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, isRead: true })),
          unreadCount: 0,
        })),

      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
      setNewProjectModalOpen: (newProjectModalOpen) => set({ newProjectModalOpen }),

      addNotification: (n) =>
        set(state => {
          const notification: Notification = {
            ...n, id: Math.random().toString(36).slice(2),
            createdAt: new Date().toISOString(), isRead: false,
          }
          return {
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }
        }),

      fetchProjects: async () => {
        const token = localStorage.getItem('dataforge_token')
        if (!token) {
          // Fallback if not already initialized to preserve locally added projects
          if (get().projects.length === 0) {
            set({ projects: MOCK_PROJECTS })
          }
          const currentActive = get().activeProject
          const newActive = get().projects.find(p => p.id === currentActive?.id || p.name === currentActive?.name) || get().projects[0] || null
          set({ activeProject: newActive })
          return
        }

        try {
          const response = await axios.get('/api/v1/projects', {
            headers: { Authorization: `Bearer ${token}` }
          })
          const dbProjects: Project[] = response.data.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            description: p.description || '',
            organizationId: 'org_1',
            color: p.color || '#6366F1',
            icon: p.icon || 'Folder',
            datasetCount: 0,
            pipelineCount: 0,
            createdAt: p.created_at,
            updatedAt: p.updated_at || p.created_at,
            status: p.status || 'active'
          }))
          
          const currentActive = get().activeProject
          const newActive = dbProjects.find(p => p.id === currentActive?.id || p.name === currentActive?.name) || dbProjects[0] || null

          set({
            projects: dbProjects,
            activeProject: newActive
          })
        } catch (error) {
          console.warn('Failed to fetch projects from API, falling back to mock projects:', error)
          if (get().projects.length === 0) {
            set({
              projects: MOCK_PROJECTS
            })
          }
          const currentActive = get().activeProject
          const newActive = get().projects.find(p => p.id === currentActive?.id || p.name === currentActive?.name) || get().projects[0] || null
          set({ activeProject: newActive })
        }
      },

      createProject: async (name, description, color) => {
        const token = localStorage.getItem('dataforge_token')
        
        // Check if name is unique locally
        const existing = get().projects.find(p => p.name.toLowerCase() === name.toLowerCase())
        if (existing) {
          throw new Error('A project with this name already exists.')
        }

        if (!token || token === 'mock_token_12345') {
          // Offline fallback creation
          const newProj: Project = {
            id: Math.random().toString(36).slice(2),
            name,
            description,
            organizationId: 'org_1',
            color,
            icon: 'Folder',
            datasetCount: 0,
            pipelineCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'active'
          }
          set(state => ({
            projects: [...state.projects, newProj],
            activeProject: newProj
          }))
          return
        }

        try {
          const response = await axios.post('/api/v1/projects', {
            name,
            description,
            color,
            icon: 'Folder',
            status: 'active'
          }, {
            headers: { Authorization: `Bearer ${token}` }
          })

          const p = response.data
          const newProj: Project = {
            id: String(p.id),
            name: p.name,
            description: p.description || '',
            organizationId: 'org_1',
            color: p.color || '#6366F1',
            icon: p.icon || 'Folder',
            datasetCount: 0,
            pipelineCount: 0,
            createdAt: p.created_at,
            updatedAt: p.updated_at || p.created_at,
            status: p.status || 'active'
          }

          set(state => ({
            projects: [...state.projects, newProj],
            activeProject: newProj
          }))
        } catch (error: any) {
          console.error('Failed to create project:', error)
          throw new Error(error.response?.data?.detail || 'Failed to create project.')
        }
      },

      setDatasets: (datasets) => set({ datasets }),
      setQualityReports: (qualityReports) => set({ qualityReports }),
      setFeatures: (features) => set({ features }),
      setWorkflows: (workflows) => set({ workflows }),
      setPipelines: (pipelines) => set({ pipelines }),
      setPipelineRuns: (pipelineRuns) => set({ pipelineRuns }),
      updatePipeline: (id, updates) =>
        set(state => ({
          pipelines: state.pipelines.map(p => p.id === id ? { ...p, ...updates } : p)
        })),
      addPipelineRun: (run) =>
        set(state => ({
          pipelineRuns: [run, ...state.pipelineRuns]
        })),
      restoreDatasetVersion: (datasetId, versionId) =>
        set(state => {
          const version = state.datasetVersions.find(v => v.id === versionId)
          if (!version) return {}

          const updatedDatasets = state.datasets.map(d =>
            d.id === datasetId
              ? {
                  ...d,
                  version: version.version,
                  rowCount: version.rowCount,
                  columnCount: version.columnCount,
                  sizeBytes: version.sizeBytes,
                  lastRefreshed: new Date().toISOString(),
                }
              : d
          )

          const updatedVersions = state.datasetVersions.map(v =>
            v.datasetId === datasetId
              ? { ...v, isCurrent: v.id === versionId }
              : v
          )

          const notification: Notification = {
            id: Math.random().toString(36).slice(2),
            title: 'Version Restored',
            message: `Restored to version ${version.version} for dataset ${
              state.datasets.find(d => d.id === datasetId)?.name || 'unknown'
            }.`,
            type: 'success',
            createdAt: new Date().toISOString(),
            isRead: false,
          }

          return {
            datasets: updatedDatasets,
            datasetVersions: updatedVersions,
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }
        }),
      setWorkflowRuns: (workflowRuns) => set({ workflowRuns }),
      addWorkflowRun: (run) =>
        set(state => ({
          workflowRuns: [run, ...state.workflowRuns]
        })),
    }),
    {
      name: 'dataforge-app-store',
    }
  )
)
