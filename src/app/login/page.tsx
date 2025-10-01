// @ts-nocheck
"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, googleLogin, clearError, setSSOInitializer, enableBwengePlus } from '@/lib/features/auth/auth-slice'
import type { AppDispatch, RootState } from '@/lib/store'
import { initializeSocket } from '@/lib/services/communityChatSocket'
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  ArrowLeft, LogIn, Sparkles, BookOpen, Award, Users, TrendingUp,
  Search, MapPin, Globe, GraduationCap, Building
} from 'lucide-react'
import Link from 'next/link'
import SSOInitializer from '@/components/auth/SSOInitializer'
import { clearAuthData, hasValidAuth } from '@/lib/auth-cleanup'
import debounce from 'lodash/debounce'

// Floating Particles Component
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            y: [-10, -50],
            opacity: [0, 1, 1, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Rwanda search suggestions
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

const features = [
  {
    icon: BookOpen,
    title: "Access Rwanda Research Library",
    description: "Explore research papers, theses, and academic materials from Rwandan universities and institutions.",
    color: "#0158B7"
  },
  {
    icon: Users,
    title: "Connect with Local Researchers",
    description: "Collaborate with over 1,200 researchers, lecturers, and students across Rwanda's higher learning institutions.",
    color: "#0362C3"
  },
  {
    icon: Award,
    title: "Showcase Your Research",
    description: "Publish and share your findings to gain recognition within Rwanda's academic and innovation ecosystem.",
    color: "#5E96D2"
  },
  {
    icon: TrendingUp,
    title: "Track Your Academic Growth",
    description: "Monitor your research impact and academic journey through Rwanda-focused analytics and insights.",
    color: "#8DB6E1"
  }
]

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement | null, config: any) => void;
        };
      };
    };
  }
}

export default function EnhancedLoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const {
    isLoading,
    error,
    isAuthenticated,
    user,
    requiresVerification, verificationEmail,
    ssoRedirectToken,
    showSSOInitializer
  } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [enableQuickAccess, setEnableQuickAccess] = useState(true)

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [socketInitializing, setSocketInitializing] = useState(false)
  
  // Rwanda Search State
  const [showRwandaSearch, setShowRwandaSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSuggestions, setFilteredSuggestions] = useState(rwandaSearchSuggestions)
  const [searchFocused, setSearchFocused] = useState(false)

  useEffect(() => {
    if (!isAuthenticated && hasValidAuth()) {
      clearAuthData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (requiresVerification && verificationEmail) {
      router.push(`/verify-email?email=${encodeURIComponent(verificationEmail)}`)
    } else if (isAuthenticated && user) {
      const dashboard = user.account_type === 'admin' ? '/dashboard/admin' : '/dashboard'
      router.push(dashboard)
    }
  }, [isAuthenticated, user, requiresVerification, verificationEmail, router])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Feature carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isAuthenticated && user && !showSSOInitializer) {
      const dashboard = user.account_type === 'admin' ? '/dashboard/admin' : '/dashboard/user'
      router.push(dashboard)
    }
  }, [isAuthenticated, user, showSSOInitializer, router])

  // Filter search suggestions
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (!query.trim()) {
        setFilteredSuggestions(rwandaSearchSuggestions)
        return
      }
      const filtered = rwandaSearchSuggestions.filter(suggestion =>
        suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.type.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredSuggestions(filtered)
    }, 300),
    []
  )

  useEffect(() => {
    debouncedSearch(searchQuery)
    return () => debouncedSearch.cancel()
  }, [searchQuery, debouncedSearch])

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      if (typeof window !== 'undefined' && window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        })
        const buttonElement = document.getElementById('googleSignInButton')
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with'
          })
        }
      }
    }

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleGoogleResponse = async (response: any) => {
    setGoogleLoading(true)
    try {
      const result = await dispatch(googleLogin({ token: response.credential })).unwrap()

      if (result.token) {
        setSocketInitializing(true)
        try {
          await initializeSocket(result.token)
          console.log('✅ Socket initialized and connected after Google login')
        } catch (socketError) {
          console.error('❌ Socket initialization failed:', socketError)
        } finally {
          setSocketInitializing(false)
        }
      }
    } catch (err: any) {
      console.error('Google login failed:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const result = await dispatch(loginUser(formData)).unwrap()

      if (result.user.sso_redirect_token && enableQuickAccess) {
        dispatch(enableBwengePlus())
        dispatch(setSSOInitializer(true))
      }
    } catch (err: any) {
      console.error('Login failed:', err)
    }
  }

  const handleSSOComplete = () => {
    dispatch(setSSOInitializer(false))
    const dashboard = user?.account_type === 'admin' ? '/dashboard/admin' : '/dashboard/user'
    router.push(dashboard)
  }

  const handleSSOSkip = () => {
    dispatch(setSSOInitializer(false))
    const dashboard = user?.account_type === 'admin' ? '/dashboard/admin' : '/dashboard/user'
    router.push(dashboard)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSearchSelect = (suggestion: typeof rwandaSearchSuggestions[0]) => {
    setSearchQuery(suggestion.name)
    setShowRwandaSearch(false)
    
    // You can add additional functionality here based on the selected suggestion
    console.log(`Selected: ${suggestion.name} (${suggestion.type})`)
    
    // Example: Navigate to search results page
    // router.push(`/search?q=${encodeURIComponent(suggestion.name)}&type=${suggestion.type}`)
  }

  const feature = features[currentFeature]
  const FeatureIcon = feature.icon

  const isProcessing = isLoading || googleLoading || socketInitializing

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center p-3 lg:p-4 relative overflow-hidden">
      {/* Crescent Background Layers */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute right-[-10%] top-[10%] w-[60%] h-[70%] opacity-30"
          style={{
            clipPath: 'ellipse(40% 50% at 100% 50%)',
            background: '#0362C3',
            transform: 'rotate(-15deg)'
          }}
          animate={{
            y: [0, 20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute left-[-5%] bottom-[-5%] w-[40%] h-[60%] opacity-25"
          style={{
            clipPath: 'circle(50% at 0% 100%)',
            background: '#5E96D2',
            transform: 'rotate(25deg)'
          }}
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <FloatingParticles />

      {/* Rwanda Search Modal */}
      <AnimatePresence>
        {showRwandaSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-20"
            onClick={() => setShowRwandaSearch(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                      <Globe className="w-6 h-6 mr-3 text-[#0158B7]" />
                      Search Rwanda
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">Discover research, institutions, and academics in Rwanda</p>
                  </div>
                  <button
                    onClick={() => setShowRwandaSearch(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                    className="absolute z-10 w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 mt-2 max-h-96 overflow-y-auto"
                  >
                    {filteredSuggestions.map((suggestion) => {
                      const Icon = suggestion.icon
                      return (
                        <motion.button
                          key={suggestion.id}
                          whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
                          onClick={() => handleSearchSelect(suggestion)}
                          className="w-full p-4 flex items-center hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="mr-4">
                            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[#0158B7]" />
                            </div>
                          </div>
                          <div className="flex-1 text-left">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">{suggestion.name}</h4>
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full capitalize">
                                {suggestion.type}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {suggestion.type === 'university' ? 'Higher Education Institution' :
                               suggestion.type === 'institution' ? 'Research & Development Center' :
                               suggestion.type === 'research' ? 'Research Projects & Publications' :
                               'Academic Community Hub'}
                            </p>
                          </div>
                        </motion.button>
                      )
                    })}
                  </motion.div>
                )}

                {!searchFocused && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <h4 className="font-medium text-gray-900 mb-2"> Rwanda Research Ecosystem</h4>
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Form */}
            <div className="p-5 md:p-6 lg:p-7">
              <div className="flex items-center justify-between mb-3">
                <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#0158B7] transition-colors text-sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
                
              </div>

              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 flex items-center">
                 Search for Rwanda!
                </h1>
                <p className="text-sm text-gray-600">Sign in to continue your research journey in Rwanda</p>
                

              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </motion.div>
              )}

              {socketInitializing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2"
                >
                  <Loader2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                  <p className="text-xs text-blue-600">Initializing chat connection...</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                        placeholder="your.email@example.com"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                        placeholder="••••••••"
                        required
                        disabled={isProcessing}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isProcessing}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 text-[#0158B7] border-gray-300 rounded focus:ring-[#0158B7]"
                        disabled={isProcessing}
                      />
                      <span className="ml-2 text-xs text-gray-600">Remember me</span>
                    </label>

                    <Link href="/change-password" className="text-xs font-medium text-[#0158B7] hover:text-[#0362C3] transition-colors">
                      Change Password
                    </Link>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={isProcessing}
                    whileHover={{ scale: isProcessing ? 1 : 1.02 }}
                    whileTap={{ scale: isProcessing ? 1 : 0.98 }}
                    className="w-full bg-[#0158B7] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0362C3] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : socketInitializing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </motion.button>

                  <div className="relative my-3.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div id="googleSignInButton" className="flex justify-center"></div>

                  <div className="relative my-3.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-gray-500">New to Bwenge?</span>
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className="w-full border-2 border-[#0158B7] text-[#0158B7] py-2 rounded-lg text-sm font-semibold hover:bg-[#0158B7] hover:text-white transition-all transform hover:scale-[1.02] flex items-center justify-center"
                  >
                    Create an Account
                  </Link>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableQuickAccess"
                      checked={enableQuickAccess}
                      onChange={(e) => setEnableQuickAccess(e.target.checked)}
                      className="w-3.5 h-3.5 text-[#0158B7] border-gray-300 rounded focus:ring-[#0158B7]"
                    />
                    <label htmlFor="enableQuickAccess" className="text-xs text-gray-600">
                      Enable quick access to BwengePlus
                    </label>
                  </div>
                </div>
              </form>
              {user?.has_multi_system_access && (
                <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-700 text-center">
                    ✓ Connected to Bwenge & BwengePlus
                  </p>
                </div>
              )}
            </div>

            {/* Right Side - Animated Features */}
            <div className="bg-gradient-to-br from-[#0158B7] to-[#0362C3] p-6 md:p-7 lg:p-8 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>

              <div className="relative z-10">
                <Sparkles className="w-10 h-10 mb-4" />
                <h1 className="text-white text-2xl md:text-3xl font-bold  mb-1 flex items-center">
               Your Research Hub in Rwanda
                </h1>
                <p className="text-sm md:text-base mb-7 opacity-90">
                  Join the community advancing knowledge and innovation in Rwanda
                </p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3.5"
                  >
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: feature.color }}
                    >
                      <FeatureIcon className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm md:text-base opacity-90 leading-relaxed">{feature.description}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex space-x-2 mt-6">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`h-1.5 rounded-full transition-all ${index === currentFeature ? 'w-6 bg-white' : 'w-1.5 bg-white bg-opacity-40'
                        }`}
                    />
                  ))}
                </div>
                
                {/* Rwanda Quick Stats */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <h4 className="text-sm font-semibold mb-3">🇷🇼 Rwanda Research Network</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-lg font-bold">500+</div>
                      <div className="text-xs opacity-80">Research Papers</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                      <div className="text-lg font-bold">1.2K+</div>
                      <div className="text-xs opacity-80">Researchers</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
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