import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/landing/LandingPage'
import { LoginPage, SignupPage } from '@/pages/auth/AuthPages'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { CatalogPage } from '@/pages/catalog/CatalogPage'
import { QualityPage } from '@/pages/quality/QualityPage'
import { PipelineBuilderPage } from '@/pages/pipelines/PipelineBuilderPage'
import { VersioningPage } from '@/pages/versioning/VersioningPage'
import { FeatureStorePage } from '@/pages/features/FeatureStorePage'
import { LineagePage } from '@/pages/lineage/LineagePage'
import { WorkflowsPage } from '@/pages/workflows/WorkflowsPage'
import { ObservabilityPage } from '@/pages/observability/ObservabilityPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { useAuthStore } from '@/stores/authStore'
import { useAppStore } from '@/stores/appStore'
import { Logo } from '@/components/ui'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export const App: React.FC = () => {
  const { isAuthenticated, checkSession } = useAuthStore()
  const { fetchProjects } = useAppStore()
  const [loading, setLoading] = React.useState(true)

  useEffect(() => {
    const initSession = async () => {
      await checkSession()
      await fetchProjects()
      setLoading(false)
    }
    initSession()
  }, [isAuthenticated, checkSession, fetchProjects])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex flex-col items-center justify-center gap-5">
        <Logo size={36} />
        <div className="relative">
          <div className="w-5 h-5 border-2 border-[rgba(99,102,241,0.2)] border-t-[#6366F1] rounded-full animate-spin" />
        </div>
        <p className="text-xs text-[#475569] font-medium tracking-wide">Initializing session...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected app routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="quality" element={<QualityPage />} />
          <Route path="pipelines" element={<PipelineBuilderPage />} />
          <Route path="pipelines/new" element={<PipelineBuilderPage />} />
          <Route path="versioning" element={<VersioningPage />} />
          <Route path="features" element={<FeatureStorePage />} />
          <Route path="lineage" element={<LineagePage />} />
          <Route path="workflows" element={<WorkflowsPage />} />
          <Route path="observability" element={<ObservabilityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
