import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import type { User, Organization } from '@/types'
import { MOCK_USERS, MOCK_ORG } from '@/lib/mockData'

const API_BASE = '/api/v1'

interface AuthState {
  user: User | null
  org: Organization | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string, orgName: string) => Promise<void>
  logout: () => void
  checkSession: () => Promise<void>
  setLoading: (loading: boolean) => void
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      org: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true })
        try {
          const params = new URLSearchParams()
          params.append('username', email)
          params.append('password', password)

          const response = await axios.post(`${API_BASE}/auth/login`, params, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          })

          const { access_token, user: dbUser } = response.data
          localStorage.setItem('dataforge_token', access_token)

          const mappedUser: User = {
            id: String(dbUser.id),
            name: dbUser.full_name || dbUser.email.split('@')[0],
            email: dbUser.email,
            role: dbUser.role || 'viewer',
            organizationId: 'org_1',
            createdAt: dbUser.created_at || new Date().toISOString(),
          }

          set({
            user: mappedUser,
            org: { ...MOCK_ORG, name: 'Acme Workspace' },
            isAuthenticated: true,
            isLoading: false
          })
          
          try {
            const { useAppStore } = await import('./appStore')
            await useAppStore.getState().fetchProjects()
          } catch (fetchErr) {
            console.error('Failed to trigger fetchProjects after login:', fetchErr)
          }
        } catch (error) {
          console.warn('API authentication failed, checking mock credentials:', error)
          // Failover to local mock credentials
          const mockUser = MOCK_USERS.find(u => u.email === email)
          if (mockUser && password === 'password') {
            localStorage.setItem('dataforge_token', 'mock_token_12345')
            set({
              user: mockUser,
              org: MOCK_ORG,
              isAuthenticated: true,
              isLoading: false
            })
            
            try {
              const { useAppStore } = await import('./appStore')
              await useAppStore.getState().fetchProjects()
            } catch (fetchErr) {
              console.error('Failed to trigger fetchProjects after mock login:', fetchErr)
            }
          } else {
            set({ isLoading: false })
            throw new Error('Invalid email or password.')
          }
        }
      },

      signup: async (email, password, name, orgName) => {
        set({ isLoading: true })
        try {
          // 1. Trigger registration
          await axios.post(`${API_BASE}/auth/signup`, {
            email,
            password,
            full_name: name,
            role: 'admin'
          })

          // 2. Perform direct login
          set({ isLoading: false })
          const loginFn = get().login
          await loginFn(email, password)
        } catch (error: any) {
          console.warn('API registration failed, falling back to mock registration:', error)
          
          // Failover to mock creation
          const newUser: User = {
            id: Math.random().toString(36).slice(2),
            name,
            email,
            role: 'admin',
            organizationId: 'org_new',
            createdAt: new Date().toISOString(),
          }
          localStorage.setItem('dataforge_token', 'mock_token_12345')
          set({
            user: newUser,
            org: { ...MOCK_ORG, name: orgName },
            isAuthenticated: true,
            isLoading: false
          })
        }
      },

      checkSession: async () => {
        const token = localStorage.getItem('dataforge_token')
        if (!token) {
          set({ user: null, org: null, isAuthenticated: false })
          return
        }

        try {
          // If it's the mock token, bypass backend call
          if (token === 'mock_token_12345') {
            return
          }

          const response = await axios.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const dbUser = response.data
          const mappedUser: User = {
            id: String(dbUser.id),
            name: dbUser.full_name || dbUser.email.split('@')[0],
            email: dbUser.email,
            role: dbUser.role || 'viewer',
            organizationId: 'org_1',
            createdAt: dbUser.created_at || new Date().toISOString(),
          }
          set({
            user: mappedUser,
            org: { ...MOCK_ORG, name: 'Acme Workspace' },
            isAuthenticated: true
          })
        } catch (error) {
          console.warn('Failed to validate session token, clearing credentials:', error)
          localStorage.removeItem('dataforge_token')
          set({ user: null, org: null, isAuthenticated: false })
        }
      },

      logout: () => {
        localStorage.removeItem('dataforge_token')
        set({ user: null, org: null, isAuthenticated: false })
        // Fully redirect to landing page and force reload state
        window.location.href = '/'
      },

      setLoading: (isLoading) => set({ isLoading }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'dataforge-auth',
      partialize: (state) => ({ user: state.user, org: state.org, isAuthenticated: state.isAuthenticated }),
    }
  )
)
