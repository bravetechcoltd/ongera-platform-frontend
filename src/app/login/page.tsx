"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  loginUser, googleLogin, clearError,
  setSSOInitializer, enableBwengePlus,
} from '@/lib/features/auth/auth-slice'
import type { AppDispatch, RootState } from '@/lib/store'
import { initializeSocket } from '@/lib/services/communityChatSocket'
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  LogIn, BookOpen, Award, Users, TrendingUp,
  Search, MapPin, Globe, GraduationCap, Building,
  UserPlus, Clock, XCircle, Info, ArrowRight, Home,
  CheckCircle, Upload, Calendar,
} from 'lucide-react'
import Link from 'next/link'
import SSOInitializer from '@/components/auth/SSOInitializer'
import { clearAuthData, hasValidAuth } from '@/lib/auth-cleanup'
import debounce from 'lodash/debounce'

// ─── Rwanda search data (original, unchanged) ────────────────────────────────
const rwandaSearchSuggestions = [
  { id: 1, type: 'university', name: 'University of Rwanda', icon: GraduationCap },
  { id: 2, type: 'university', name: 'University of Kigali', icon: GraduationCap },
  { id: 3, type: 'university', name: 'KIST - Kigali Institute of Science and Technology', icon: GraduationCap },
  { id: 4, type: 'institution', name: 'Rwanda Biomedical Centre', icon: Building },
  { id: 5, type: 'institution', name: 'Rwanda Agriculture Board', icon: Building },
  { id: 6, type: 'research', name: 'Rwanda Research Projects', icon: Search },
  { id: 7, type: 'location', name: 'Kigali Research Community', icon: MapPin },
  { id: 8, type: 'location', name: 'Rwanda Innovation Hub', icon: MapPin },
]

// ─── Feature carousel data (original, unchanged) ─────────────────────────────
const features = [
  {
    icon: BookOpen,
    title: "Access Rwanda Research Library",
    description: "Explore research papers, theses, and academic materials from Rwandan universities and institutions.",
    color: "#0158B7",
  },
  {
    icon: Users,
    title: "Connect with Local Researchers",
    description: "Collaborate with over 1,200 researchers, lecturers, and students across Rwanda's higher learning institutions.",
    color: "#0362C3",
  },
  {
    icon: Award,
    title: "Showcase Your Research",
    description: "Publish and share your findings to gain recognition within Rwanda's academic and innovation ecosystem.",
    color: "#5E96D2",
  },
  {
    icon: TrendingUp,
    title: "Track Your Academic Growth",
    description: "Monitor your research impact and academic journey through Rwanda-focused analytics and insights.",
    color: "#8DB6E1",
  },
]

// ─── Ticker items for the right panel ────────────────────────────────────────
const TICKER_ITEMS = [
  "Health Sciences", "Technology & AI", "Agriculture Innovation",
  "Social Sciences", "Environmental Research", "Education Studies",
  "Data Science", "Public Policy", "Biomedical Research",
]

// ─── Thin animated input ─────────────────────────────────────────────────────
function FormInput({
  id, name, type = 'text', value, onChange, placeholder,
  required, disabled, rightEl, icon: Icon,
}: {
  id: string; name: string; type?: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder: string; required?: boolean; disabled?: boolean
  rightEl?: React.ReactNode; icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="relative group">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-[#0158B7] transition-colors" />
      )}
      <input
        id={id} name={name} type={type} value={value}
        onChange={onChange} placeholder={placeholder}
        required={required} disabled={disabled}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3.5'} ${rightEl ? 'pr-9' : 'pr-3.5'} py-2.5 text-sm
          bg-gray-50/80 border border-gray-200 rounded-lg outline-none
          transition-all duration-150
          focus:border-[#0158B7] focus:bg-white focus:ring-2 focus:ring-[#0158B7]/10
          text-gray-900 placeholder:text-gray-400
          disabled:opacity-50 disabled:cursor-not-allowed`}
      />
      {rightEl && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-10">{rightEl}</div>
      )}
    </div>
  )
}

// ─── Right panel: animated research feature carousel ─────────────────────────
function RightPanel({ currentFeature }: { currentFeature: number }) {
  const feature = features[currentFeature]
  const FeatureIcon = feature.icon
  const [tickerOffset, setTickerOffset] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setTickerOffset(p => p + 1), 30)
    return () => clearInterval(id)
  }, [])

  const stats = [
    { val: "500+", label: "Research\nPapers" },
    { val: "1.2K+", label: "Active\nResearchers" },
    { val: "50+", label: "Communities" },
    { val: "30+", label: "Partner\nInstitutions" },
  ]

  return (
    <div className="hidden lg:flex w-full lg:w-[58%] h-full flex-col" style={{ background: '#0158B7' }}>

      {/* Top strip */}
      <div className="flex items-center justify-between px-10 h-11 border-b border-white/10 flex-shrink-0">
        <span className="text-[9px] font-black uppercase tracking-[0.22em] text-white">
          Research Platform
        </span>
        <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-white">
          Rwanda · Knowledge
        </span>
      </div>

      {/* Main editorial body */}
      <div className="flex-1 flex flex-col justify-center px-10 py-6 gap-6 overflow-hidden">

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.45, ease: 'easeOut' }}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white mb-3">
            Ubwenge burarahurwa
          </p>
          <div className="space-y-0.5">
            <h2 className="text-[40px] font-black text-white leading-[1.0] tracking-tight">Search.</h2>
            <h2 className="text-[40px] font-black text-white/60 leading-[1.0] tracking-tight">Discover.</h2>
            <h2 className="text-[40px] font-black text-white/25 leading-[1.0] tracking-tight">Contribute.</h2>
          </div>
          <p className="text-[13px] text-white mt-0 leading-relaxed max-w-xs">
            Rwanda's premier research community — connecting academics,
            students and institutions nationwide.
          </p>
        </motion.div>

        {/* Divider rule */}
        <div className="w-12 h-px bg-white/20" />

        {/* Animated feature block */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.45 }}
        >
          <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white mb-1">
            Why Bwenge
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentFeature}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="space-y-2.5"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <FeatureIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-[15px] font-bold text-white leading-snug">{feature.title}</h3>
              <p className="text-[12px] text-white/65 leading-relaxed max-w-xs">{feature.description}</p>
            </motion.div>
          </AnimatePresence>

          {/* Dot nav */}
          <div className="flex items-center gap-1.5 mt-4">
            {features.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-350"
                style={{
                  width: i === currentFeature ? 20 : 5,
                  height: 5,
                  background: i === currentFeature ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.25)',
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.32, duration: 0.45 }}
          className="grid grid-cols-4 gap-2 pt-0"
        >
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.38 + i * 0.06 }}
              className="flex flex-col items-center text-center py-2.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
            >
              <span className="text-[17px] font-black text-white leading-none tabular-nums">{s.val}</span>
              <span className="text-[9px] text-white/50 mt-1 leading-tight whitespace-pre-line">{s.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scrolling ticker */}
      <div className="border-t border-white/10 py-2.5 overflow-hidden flex-shrink-0">
        <div className="flex items-center gap-0 whitespace-nowrap">
          <motion.div
            className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.16em] text-white/35"
            animate={{ x: [0, -600] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          >
            {[...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-3">
                {item}
                <span className="text-white/20">·</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// ─── Rwanda Search modal (original, unchanged) ───────────────────────────────
function RwandaSearchModal({
  show, onClose, searchQuery, setSearchQuery,
  filteredSuggestions, searchFocused, setSearchFocused,
  onSelect,
}: {
  show: boolean; onClose: () => void; searchQuery: string
  setSearchQuery: (v: string) => void; filteredSuggestions: typeof rwandaSearchSuggestions
  searchFocused: boolean; setSearchFocused: (v: boolean) => void
  onSelect: (s: typeof rwandaSearchSuggestions[0]) => void
}) {
  if (!show) return null
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Globe className="w-6 h-6 mr-3 text-[#0158B7]" />
                    Search Rwanda
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Discover research, institutions, and academics in Rwanda
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  ✕
                </button>
              </div>

              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  className="w-full pl-12 pr-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 transition-all"
                  placeholder="Search universities, institutions, research topics..."
                  autoFocus
                />
              </div>

              {searchFocused && filteredSuggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1 max-h-72 overflow-y-auto"
                >
                  {filteredSuggestions.map(s => {
                    const Icon = s.icon
                    return (
                      <button
                        key={s.id}
                        onClick={() => onSelect(s)}
                        className="w-full p-3 flex items-center hover:bg-gray-50 rounded-xl transition-colors border border-gray-100"
                      >
                        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center mr-3 flex-shrink-0">
                          <Icon className="w-4 h-4 text-[#0158B7]" />
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-gray-900 text-sm">{s.name}</h4>
                          <p className="text-xs text-gray-500 capitalize">{s.type}</p>
                        </div>
                      </button>
                    )
                  })}
                </motion.div>
              )}

              {!searchFocused && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <h4 className="font-medium text-gray-900 mb-2">🔬 Rwanda Research Ecosystem</h4>
                    <p className="text-sm text-gray-600">Access 500+ research papers from Rwandan institutions</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                    <h4 className="font-medium text-gray-900 mb-2">🎓 Academic Partnerships</h4>
                    <p className="text-sm text-gray-600">Connect with 30+ universities and colleges in Rwanda</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── Main Login Page ──────────────────────────────────────────────────────────
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void
          renderButton: (el: HTMLElement | null, config: any) => void
        }
      }
    }
  }
}

export default function EnhancedLoginPage() {
  const router   = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const {
    isLoading, error, errorCode, rejectionReason, isAuthenticated, user,
    requiresVerification, verificationEmail,
    ssoRedirectToken, showSSOInitializer,
  } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData]               = useState({ email: '', password: '' })
  const [enableQuickAccess, setEnableQuickAccess] = useState(true)
  const [showPassword, setShowPassword]       = useState(false)
  const [rememberMe, setRememberMe]           = useState(false)
  const [currentFeature, setCurrentFeature]   = useState(0)
  const [googleLoading, setGoogleLoading]     = useState(false)
  const [socketInitializing, setSocketInitializing] = useState(false)
  const [showRwandaSearch, setShowRwandaSearch] = useState(false)
  const [searchQuery, setSearchQuery]         = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState(rwandaSearchSuggestions)
  const [searchFocused, setSearchFocused]     = useState(false)

  useEffect(() => {
    if (!isAuthenticated && hasValidAuth()) clearAuthData()
  }, [isAuthenticated])

  useEffect(() => {
    if (requiresVerification && verificationEmail) {
      router.push(`/verify-email?email=${encodeURIComponent(verificationEmail)}`)
    } else if (isAuthenticated && user) {
      const dashboard = user.account_type === 'admin' ? '/dashboard/admin' : '/dashboard'
      router.push(dashboard)
    }
  }, [isAuthenticated, user, requiresVerification, verificationEmail, router])

  useEffect(() => () => { dispatch(clearError()) }, [dispatch])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user && !showSSOInitializer) {
      const dashboard = user.account_type === 'admin' ? '/dashboard/admin' : '/dashboard/user'
      router.push(dashboard)
    }
  }, [isAuthenticated, user, showSSOInitializer, router])

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) { setFilteredSuggestions(rwandaSearchSuggestions); return }
      setFilteredSuggestions(
        rwandaSearchSuggestions.filter(s =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.type.toLowerCase().includes(query.toLowerCase())
        )
      )
    }, 300),
    []
  )
  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => debouncedSearch.cancel()
  }, [searchQuery, debouncedSearch])

  // Google sign-in
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
    script.onload = () => {
      if (window.google?.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        })
        const btn = document.getElementById('googleSignInButton')
        if (btn) {
          window.google.accounts.id.renderButton(btn, {
            theme: 'outline', size: 'large',
            width: btn.offsetWidth || 280, text: 'signin_with',
          })
        }
      }
    }
    return () => { if (script.parentNode) document.body.removeChild(script) }
  }, [])

  const handleGoogleResponse = async (response: any) => {
    setGoogleLoading(true)
    try {
      const result = await dispatch(googleLogin({ token: response.credential })).unwrap()
      if (result.token) {
        setSocketInitializing(true)
        try { await initializeSocket(result.token) } catch (_) {}
        finally { setSocketInitializing(false) }
      }
    } catch (_) {}
    finally { setGoogleLoading(false) }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const result = await dispatch(loginUser(formData)).unwrap()
      if (result.user.sso_redirect_token && enableQuickAccess) {
        dispatch(enableBwengePlus())
        dispatch(setSSOInitializer(true))
      }
    } catch (_) {}
  }

  const handleSSOComplete = () => {
    dispatch(setSSOInitializer(false))
    router.push(user?.account_type === 'admin' ? '/dashboard/admin' : '/dashboard/user')
  }
  const handleSSOSkip = () => {
    dispatch(setSSOInitializer(false))
    router.push(user?.account_type === 'admin' ? '/dashboard/admin' : '/dashboard/user')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  const isProcessing = isLoading || googleLoading || socketInitializing

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden">

      {/* Rwanda Search modal */}
      <RwandaSearchModal
        show={showRwandaSearch}
        onClose={() => setShowRwandaSearch(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filteredSuggestions={filteredSuggestions}
        searchFocused={searchFocused}
        setSearchFocused={setSearchFocused}
        onSelect={s => { setSearchQuery(s.name); setShowRwandaSearch(false) }}
      />

      {/* ══ LEFT — Form column ══════════════════════════════════════════════ */}
      <div className="w-full lg:w-[42%] h-full flex flex-col bg-white border-r border-gray-100">

        {/* Top nav */}
        <div className="flex items-center justify-between px-6 h-11 border-b border-gray-100 flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: '#0158B7' }}>
              <span className="text-white font-black text-[10px]">B</span>
            </div>
            <span className="text-sm font-black text-gray-900 tracking-tight">Bwenge</span>
          </Link>

          <Link href="/" className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors">
            <Home className="w-3 h-3" /> Home
          </Link>
        </div>

        {/* Form — vertically centered */}
        <div className="flex-1 flex items-center justify-center px-8 py-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-[300px] space-y-3.5"
          >
            {/* Heading */}
            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Sign in</p>
              <h1 className="text-[22px] font-black text-gray-900 leading-none tracking-tight">Search for Rwanda!</h1>
              <p className="text-[11px] text-gray-500">Sign in to continue your research journey</p>
            </div>

            {/* Error states (original, unchanged) */}
            <AnimatePresence>
              {error && errorCode === 'NO_ACCOUNT' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                  className="border-l-[3px] border-amber-400 bg-amber-50 pl-3 pr-3 py-2.5 rounded-r"
                >
                  <div className="flex items-start gap-1.5 mb-2">
                    <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-900 mb-0.5">No account found</p>
                      <p className="text-[11px] text-amber-800 leading-snug">{error}</p>
                    </div>
                  </div>
                  <Link href="/register" className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500 text-white rounded text-[10px] font-black uppercase tracking-widest">
                    <UserPlus className="w-3 h-3" /> Apply to Join
                  </Link>
                </motion.div>
              )}

              {error && errorCode === 'PENDING_APPROVAL' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                  className="border-l-[3px] border-[#0158B7] bg-blue-50 pl-3 pr-3 py-2.5 rounded-r"
                >
                  <div className="flex items-start gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#0158B7] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#0158B7] mb-0.5">Under Review</p>
                      <p className="text-[11px] text-blue-800 leading-snug">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {error && errorCode === 'APPLICATION_REJECTED' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                  className="border-l-[3px] border-red-400 bg-red-50 pl-3 pr-3 py-2.5 rounded-r"
                >
                  <div className="flex items-start gap-1.5 mb-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-900 mb-0.5">Not Approved</p>
                      <p className="text-[11px] text-red-800 leading-snug">{error}</p>
                      {rejectionReason && (
                        <p className="text-[10px] text-red-600 mt-1 italic">Reason: {rejectionReason}</p>
                      )}
                    </div>
                  </div>
                  <a href="mailto:support@bwenge.com" className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500 text-white rounded text-[10px] font-black uppercase tracking-widest">
                    <Mail className="w-3 h-3" /> Contact Support
                  </a>
                </motion.div>
              )}

              {error && !['NO_ACCOUNT', 'PENDING_APPROVAL', 'APPLICATION_REJECTED'].includes(errorCode || '') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                  className="border-l-[3px] border-red-400 bg-red-50 pl-3 pr-3 py-2.5 rounded-r flex items-start gap-2"
                >
                  <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-600 leading-snug">{error}</p>
                </motion.div>
              )}

              {socketInitializing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                  className="border-l-[3px] border-[#0158B7] bg-blue-50 pl-3 pr-3 py-2 rounded-r flex items-center gap-2"
                >
                  <Loader2 className="w-3 h-3 text-[#0158B7] animate-spin flex-shrink-0" />
                  <p className="text-[11px] text-blue-700">Initializing chat connection…</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <FormInput
                id="email" name="email" type="email"
                value={formData.email} onChange={handleChange}
                placeholder="Email address" icon={Mail}
                required disabled={isProcessing}
              />
              <FormInput
                id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange}
                placeholder="Password" icon={Lock}
                required disabled={isProcessing}
                rightEl={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isProcessing}
                    className="text-gray-400 hover:text-gray-600 transition-colors">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                }
              />

              {/* Remember + Change Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 cursor-pointer select-none group/rm">
                  <button type="button" role="checkbox" aria-checked={rememberMe}
                    onClick={() => !isProcessing && setRememberMe(!rememberMe)} disabled={isProcessing}
                    className={`w-3.5 h-3.5 rounded-sm border-[1.5px] flex items-center justify-center transition-all flex-shrink-0 ${
                      rememberMe ? 'border-[#0158B7]' : 'bg-white border-gray-300 group-hover/rm:border-gray-400'
                    }`}
                    style={rememberMe ? { background: '#0158B7' } : {}}
                  >
                    {rememberMe && (
                      <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 10 10">
                        <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className="text-[11px] text-gray-500">Remember me</span>
                </label>
                <Link href="/change-password" className="text-[11px] font-semibold text-[#0158B7] hover:text-[#0362C3] transition-colors underline underline-offset-2">
                  Change Password
                </Link>
              </div>

              {/* Submit */}
              <motion.button
                type="submit" disabled={isProcessing}
                whileHover={{ scale: isProcessing ? 1 : 1.01 }}
                whileTap={{ scale: isProcessing ? 1 : 0.99 }}
                className="w-full py-2.5 rounded-lg text-sm font-black uppercase tracking-[0.1em]
                  text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
                style={{ background: '#0158B7' }}
              >
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                ) : socketInitializing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Connecting…</>
                ) : (
                  <><LogIn className="w-4 h-4" /> Sign In</>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Google sign-in */}
              <div id="googleSignInButton" className="flex justify-center" />

              {/* Divider 2 */}
              <div className="flex items-center gap-3 py-0.5">
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-[9px] font-black uppercase tracking-[0.18em] text-gray-400">new here?</span>
                <div className="flex-1 h-px bg-gray-100" />
              </div>

              {/* Register link */}
              <Link
                href="/register"
                className="w-full border-2 py-2.5 rounded-lg text-sm font-black uppercase tracking-[0.1em]
                  transition-all flex items-center justify-center gap-2 hover:text-white"
                style={{ borderColor: '#0158B7', color: '#0158B7' }}
                onMouseEnter={e => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background = '#0158B7'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = 'white'
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLAnchorElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLAnchorElement).style.color = '#0158B7'
                }}
              >
                <UserPlus className="w-4 h-4" /> Apply to Join Bwenge
              </Link>

              {/* Quick access toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none group/qa">
                <input
                  type="checkbox" id="enableQuickAccess"
                  checked={enableQuickAccess}
                  onChange={e => setEnableQuickAccess(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#0158B7] border-gray-300 rounded focus:ring-[#0158B7]"
                />
                <span className="text-[11px] text-gray-400">Enable quick access to Bwenge ecosystem</span>
              </label>
            </form>

            {/* Multi-system indicator */}
            {user?.has_multi_system_access && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="border-l-[3px] border-[#0158B7] bg-blue-50 pl-3 pr-3 py-2 rounded-r"
              >
                <p className="text-[11px] text-[#0158B7] font-semibold">✓ Connected to Bwenge & BwengePlus</p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 h-8 border-t border-gray-100 flex items-center flex-shrink-0">
          <p className="text-[9px] text-gray-300 tracking-widest uppercase font-medium">
            © {new Date().getFullYear()} Bwenge · Rwanda's Research Community
          </p>
        </div>
      </div>

      {/* ══ RIGHT — Editorial panel ═════════════════════════════════════════ */}
      <RightPanel currentFeature={currentFeature} />

      {/* SSO initializer (original, unchanged) */}
      <AnimatePresence>
        {showSSOInitializer && ssoRedirectToken && (
          <SSOInitializer
            ssoToken={ssoRedirectToken}
            onComplete={handleSSOComplete}
            onSkip={handleSSOSkip}
          />
        )}
      </AnimatePresence>
    </div>
  )
}