import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Database, ChevronLeft } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { Logo } from '@/components/ui'
import { AuthLeftPanel } from './AuthLeftPanel'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('alex@dataforge.io')
  const [password, setPassword] = useState('password')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Invalid email or password. Please check your credentials.')
    }
  }

  return (
    <div className="min-h-screen bg-[#070A13] flex">
      {/* Visual Showcase Panel */}
      <AuthLeftPanel />

      {/* Form Entry Panel */}
      <div className="flex-1 flex items-center justify-center px-8 sm:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile Header Branding */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Logo size={28} />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              Sign In
            </h1>
            <p className="text-base text-[#64748B]">
              Enter your credentials to access your workspaces.
            </p>
          </div>

          {/* Alert Callout for Demo Mode */}
          <div className="p-4 bg-[rgba(99,102,241,0.06)] border border-[rgba(99,102,241,0.15)] rounded-[12px] flex gap-3">
            <div className="mt-0.5 text-[#818CF8]">
              <Database size={15} />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#818CF8]">Enterprise Dev Sandbox Mode</div>
              <div className="text-[11px] text-[#5A6E85] mt-0.5">
                Local SQLite is loaded. Pre-filled account is active for immediate access.
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[#111726] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all shadow-inner"
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                  Password
                </label>
                <a href="#" className="text-xs text-[#6366F1] hover:text-[#818CF8] font-medium transition-colors">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-[#111726] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 pr-11 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all shadow-inner"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#475569] hover:text-[#94A3B8] transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-3"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.99] text-white font-semibold text-sm rounded-[10px] transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In to Workspace <ArrowRight size={15} /></>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col items-center gap-4">
            <p className="text-sm text-[#64748B]">
              New to DataForge?{' '}
              <Link to="/signup" className="text-[#6366F1] hover:text-[#818CF8] font-semibold transition-colors">
                Create an account
              </Link>
            </p>
            
            <div className="flex items-center gap-4 text-[10px] text-[#334155] font-medium uppercase tracking-wider mt-2">
              <span>SOC 2 Type II</span>
              <span>•</span>
              <span>GDPR Ready</span>
              <span>•</span>
              <span>99.9% SLA</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export const SignupPage: React.FC = () => {
  const navigate = useNavigate()
  const { signup, login, isLoading } = useAuthStore()
  const [step, setStep] = useState(1)
  
  // Form states
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [org, setOrg] = useState('')
  const [teamSize, setTeamSize] = useState('1-5')
  const [useCase, setUseCase] = useState('ML/AI Platform')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (step === 1) {
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.')
        return
      }
      setStep(2)
      return
    }

    try {
      // Call signup on authStore
      await signup(email, password, name, org)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message || 'Failed to register account. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-[#070A13] flex">
      {/* Left panel visuals */}
      <AuthLeftPanel />

      {/* Right panel input form */}
      <div className="flex-1 flex items-center justify-center px-8 sm:px-16 py-12">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md space-y-8"
        >
          {/* Mobile logo header */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Logo size={28} />
          </div>

          {/* Navigation link / Step back indicator */}
          <div className="flex items-center justify-between">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs text-[#64748B] hover:text-[#94A3B8] transition-colors focus:outline-none cursor-pointer"
              >
                <ChevronLeft size={14} /> Back
              </button>
            )}
            <div className="text-xs text-[#475569] font-mono ml-auto">
              Step {step} of 2
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC] tracking-tight">
              {step === 1 ? 'Get Started' : 'Configure Workspace'}
            </h1>
            <p className="text-base text-[#64748B]">
              {step === 1 ? 'Build production-ready data systems today.' : 'Add your organizational details.'}
            </p>
          </div>

          {/* Multi-step progress bar indicator */}
          <div className="flex gap-2">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  s <= step ? 'bg-gradient-to-r from-[#6366F1] to-[#06B6D4]' : 'bg-[rgba(255,255,255,0.06)]'
                }`}
              />
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-[#111726] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all shadow-inner"
                      placeholder="Alex Chen"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Work Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-[#111726] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all shadow-inner"
                      placeholder="alex@company.com"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-[#111726] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all shadow-inner"
                      placeholder="At least 8 characters"
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      value={org}
                      onChange={e => setOrg(e.target.value)}
                      className="w-full bg-[#111726] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-sm text-[#F8FAFC] placeholder-[#475569] focus:outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/30 transition-all shadow-inner"
                      placeholder="Acme Datatech"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Team Size
                    </label>
                    <select
                      value={teamSize}
                      onChange={e => setTeamSize(e.target.value)}
                      className="w-full bg-[#111726] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] transition-all"
                    >
                      {['1-5', '6-20', '21-50', '51-200', '200+'].map(s => (
                        <option key={s} value={s} className="bg-[#111726]">
                          {s} people
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">
                      Primary Use Case
                    </label>
                    <select
                      value={useCase}
                      onChange={e => setUseCase(e.target.value)}
                      className="w-full bg-[#111726] border border-[rgba(255,255,255,0.08)] rounded-[10px] px-4 py-3 text-sm text-[#F8FAFC] focus:outline-none focus:border-[#6366F1] transition-all"
                    >
                      {['ML/AI Platform', 'Data Analytics', 'ETL Automation', 'Data Quality', 'Other'].map(s => (
                        <option key={s} value={s} className="bg-[#111726]">
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -2 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-[#EF4444] bg-[#EF4444]/5 border border-[#EF4444]/15 rounded-[8px] p-3"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#6366F1] hover:bg-[#4F46E5] active:scale-[0.99] text-white font-semibold text-sm rounded-[10px] transition-all shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_24px_rgba(99,102,241,0.35)] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 cursor-pointer"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {step === 1 ? 'Continue' : 'Create Workspace'} <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] flex flex-col items-center">
            <p className="text-sm text-[#64748B]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#6366F1] hover:text-[#818CF8] font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
