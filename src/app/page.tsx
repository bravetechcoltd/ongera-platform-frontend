// @ts-nocheck
"use client"
import api from "@/lib/api"
import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion'
import {
  Menu, X, Upload, Users, Calendar, TrendingUp, Award,
  BookOpen, MessageSquare, ChevronDown, ChevronRight, Star,
  CheckCircle, Globe, ArrowRight, Eye, ThumbsUp,
  MapPin, Clock, User, FileText, Send, Mail, Loader2, Video,
  Shield, Building2, Sparkles, Zap,
  Settings,
  LayoutDashboard
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/features/auth/auth-slice'
import { fetchHomePageSummary, fetchHomePageContent, fetchLatestUpcomingEvents } from '@/lib/features/auth/homePageSlice'
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import Image from 'next/image'
import { clearAuthData, hasValidAuth } from "@/lib/auth-cleanup"
import {  googleLogin } from '@/lib/features/auth/auth-slice'
import { toast } from 'sonner'


// ==================== FLOATING PARTICLES (REDUCED COUNT) ====================
function FloatingParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 12 + 18,
    delay: Math.random() * 5,
    blur: Math.random() * 2 + 0.5
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            filter: `blur(${particle.blur}px)`
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 0.6, 0.6, 0],
            scale: [1, 1.3, 1]
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

// ==================== Skeleton Loader ====================
function SkeletonLoader({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200/50 rounded ${className}`}>
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-3 border border-white/20">
      <SkeletonLoader className="h-28 mb-2" />
      <SkeletonLoader className="h-4 mb-1.5 w-3/4" />
      <SkeletonLoader className="h-2.5 mb-1.5 w-full" />
      <SkeletonLoader className="h-2.5 w-2/3" />
    </div>
  )
}

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [socketInitializing, setSocketInitializing] = useState(false)
  
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Load Google Sign-In script
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
        
        // Render Google button if element exists
        const buttonElement = document.getElementById('googleSignInButton')
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            width: buttonElement.offsetWidth || 280,
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
          toast.success(`Welcome ${result.user.first_name}! Login successful`)
        } catch (socketError) {
          console.error('❌ Socket initialization failed:', socketError)
        } finally {
          setSocketInitializing(false)
        }
      }
      
      // Close mobile menu if open
      setIsMobileMenuOpen(false)
      
      // Navigate to dashboard
      const dashboardPath = result.user.account_type === 'admin' ? '/dashboard/admin' : '/dashboard/user'
      router.push(dashboardPath)
      
    } catch (err: any) {
      console.error('Google login failed:', err)
      toast.error(err || 'Google login failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showUserMenu])

  const handleLogout = () => {
    dispatch(logout())
    toast.success('Logged out successfully')
    router.push('/')
  }

  const openMegaMenu = (menu: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
    setActiveMegaMenu(menu)
  }

  const closeMegaMenu = () => {
    closeTimer.current = setTimeout(() => setActiveMegaMenu(null), 150)
  }

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current)
  }

  const navLinks = [
    { label: 'Research Projects', href: '/research-projects' },
    { label: 'Communities', href: '/communities' },
    { label: 'Events', href: '#events', megaMenu: null },
  ]

  const researchCategories = [
    { name: 'Health Sciences', icon: '🏥', count: 45 },
    { name: 'Technology & AI', icon: '💻', count: 78 },
    { name: 'Agriculture', icon: '🌾', count: 32 },
    { name: 'Social Sciences', icon: '👥', count: 56 },
  ]

  const communitiesCategories = [
    { name: 'Data Science Rwanda', icon: '📊', members: 1250 },
    { name: 'Health Research Network', icon: '🏥', members: 890 },
    { name: 'AI Enthusiasts', icon: '🤖', members: 2100 },
    { name: 'AgriTech Innovators', icon: '🌱', members: 567 },
  ]

  // Helper to get user initials
  const getUserInitials = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  // Helper to get role display name
  const getRoleDisplayName = () => {
    if (user?.account_type === 'admin') return 'Admin'
    return 'Researcher'
  }

  return (
    <>
      <motion.header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${isScrolled || activeMegaMenu ? 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50' : 'bg-transparent'}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center group">
              <motion.div
                className="w-[140px] h-14 rounded-xl flex items-center justify-center overflow-hidden"
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/BwengeLogo.png"
                  alt="Bwenge logo"
                  width={140}
                  height={54}
                  priority
                  className="object-contain"
                />
              </motion.div>
            </Link>

            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.megaMenu && openMegaMenu(link.megaMenu)}
                  onMouseLeave={closeMegaMenu}
                >
                  <a
                    href={link.href}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md flex items-center gap-1 ${
                      isScrolled || activeMegaMenu ? 'text-gray-700 hover:text-[#0158B7]' : 'text-white hover:text-gray-200'
                    }`}
                  >
                    {link.label}
                    {link.megaMenu && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${activeMegaMenu === link.megaMenu ? 'rotate-180' : ''}`} />
                    )}
                  </a>
                </div>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href={user.account_type === 'admin' ? "/dashboard/admin" : "/dashboard/user"}
                    className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#0158B7]' : 'text-white hover:text-gray-200'}`}
                  >
                    Dashboard
                  </Link>
                  
                  {/* User Avatar Dropdown */}
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center gap-2 focus:outline-none"
                    >
                      <motion.div 
                        className="relative group"
                        whileHover={{ scale: 1.05 }}
                      >
                        {user.profile_picture_url ? (
                          <img
                            src={user.profile_picture_url}
                            alt={user.first_name}
                            className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-md"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center text-white font-bold text-sm shadow-md ring-2 ring-white/20">
                            {getUserInitials()}
                          </div>
                        )}
                        <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      </motion.div>
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showUserMenu ? 'rotate-180' : ''} ${isScrolled ? 'text-gray-600' : 'text-white'}`} />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                        >
                          {/* User Info Header */}
                          <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                              {user.profile_picture_url ? (
                                <img
                                  src={user.profile_picture_url}
                                  alt={user.first_name}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center text-white font-bold text-lg">
                                  {getUserInitials()}
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">
                                  {user.first_name} {user.last_name}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                  {user.email}
                                </div>
                              </div>
                            </div>
                            <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-full">
                              <span className="text-xs font-medium text-blue-700">
                                {getRoleDisplayName()}
                              </span>
                            </div>
                          </div>

                          {/* Menu Items */}
                          <div className="py-1">
                            <Link
                              href={user.account_type === 'admin' ? "/dashboard/admin" : "/dashboard/user"}
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Dashboard
                            </Link>

                            <Link
                              href="/dashboard/user/profile"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <User className="w-4 h-4" />
                              Profile
                            </Link>

                            <Link
                              href="/dashboard/user/settings"
                              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className="w-4 h-4" />
                              Settings
                            </Link>
                          </div>

                          {/* Logout */}
                          <div className="border-t border-gray-100 py-1">
                            <button
                              onClick={() => {
                                setShowUserMenu(false)
                                handleLogout()
                              }}
                              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                              <LogOut className="w-4 h-4" />
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
                  {/* Google Sign-In Button */}
                  <div id="googleSignInButton" className="min-w-[120px]"></div>
                  
                  {/* Divider */}
                  <div className="text-xs text-gray-400">or</div>
                  
                  <Link
                    href="/login"
                    className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#0158B7]' : 'text-white hover:text-gray-200'}`}
                  >
                    Sign In
                  </Link>
                  
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/register"
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-md ${
                        isScrolled
                          ? 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white hover:shadow-lg'
                          : 'bg-white text-[#0158B7] hover:bg-gray-100'
                      }`}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md transition-colors ${isScrolled ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white'}`}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 right-0 bottom-0 w-72 bg-white shadow-xl z-50 overflow-y-auto"
            >
              <div className="p-4">
                <div className="flex justify-end mb-4">
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-md">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="space-y-1">
                  <a href="#research" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border-l-2 border-transparent hover:border-[#0158B7]">
                    Research
                  </a>
                  <a href="#communities" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border-l-2 border-transparent hover:border-[#0158B7]">
                    Communities
                  </a>
                  <a href="#events" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border-l-2 border-transparent hover:border-[#0158B7]">
                    Events
                  </a>
                  
                  <div className="pt-3 mt-2 border-t border-gray-200">
                    {isAuthenticated && user ? (
                      <>
                        <div className="px-3 py-2 mb-2">
                          <div className="flex items-center gap-2 mb-2">
                            {user.profile_picture_url ? (
                              <img src={user.profile_picture_url} alt={user.first_name} className="w-10 h-10 rounded-full object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center text-white font-bold text-lg">
                                {getUserInitials()}
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-semibold text-gray-900">{user.first_name} {user.last_name}</div>
                              <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-blue-50 rounded-full">
                            <span className="text-xs font-medium text-blue-700">{getRoleDisplayName()}</span>
                          </div>
                        </div>
                        
                        <Link href={user.account_type === 'admin' ? "/dashboard/admin" : "/dashboard/user"} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                          Dashboard
                        </Link>
                        <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="block w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md">
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Google Sign-In for Mobile */}
                        <div className="px-3 mb-3">
                          <div id="googleSignInButtonMobile" className="w-full"></div>
                          <script dangerouslySetInnerHTML={{
                            __html: `
                              if (window.google && window.google.accounts) {
                                window.google.accounts.id.renderButton(
                                  document.getElementById('googleSignInButtonMobile'),
                                  { theme: 'outline', size: 'large', width: '100%', text: 'signin_with' }
                                );
                              }
                            `
                          }} />
                        </div>
                        
                        <div className="relative py-2">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                          </div>
                          <div className="relative flex justify-center text-xs">
                            <span className="px-2 bg-white text-gray-500">OR</span>
                          </div>
                        </div>
                        
                        <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md">
                          Sign In with Email
                        </Link>
                        <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 mt-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white text-center rounded-md text-sm font-medium">
                          Get Started
                        </Link>
                      </>
                    )}
                  </div>
                </nav>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Mega Menu - Research */}
      <AnimatePresence>
        {activeMegaMenu === 'research' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-0 right-0 top-16 z-40 flex justify-center pointer-events-none"
            onMouseEnter={cancelClose}
            onMouseLeave={closeMegaMenu}
          >
            <div className="w-full max-w-3xl mx-4 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden pointer-events-auto">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#0158B7]" />
                  <h3 className="text-sm font-bold text-gray-900">Research Fields</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {researchCategories.map((cat) => (
                    <a
                      key={cat.name}
                      href={`#research?field=${cat.name}`}
                      className="group flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-[#0158B7]/5 transition-all border border-gray-100"
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-800 group-hover:text-[#0158B7]">{cat.name}</div>
                        <div className="text-[10px] text-gray-500">{cat.count} projects</div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-[#0158B7] group-hover:translate-x-0.5 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                <Link href="#research" className="text-xs text-[#0158B7] font-semibold flex items-center gap-1">
                  Explore all research <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mega Menu - Communities */}
      <AnimatePresence>
        {activeMegaMenu === 'communities' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="fixed left-0 right-0 top-16 z-40 flex justify-center pointer-events-none"
            onMouseEnter={cancelClose}
            onMouseLeave={closeMegaMenu}
          >
            <div className="w-full max-w-3xl mx-4 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden pointer-events-auto">
              <div className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#0158B7]" />
                  <h3 className="text-sm font-bold text-gray-900">Active Communities</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {communitiesCategories.map((comm) => (
                    <a
                      key={comm.name}
                      href={`#communities?name=${comm.name}`}
                      className="group flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-[#0158B7]/5 transition-all border border-gray-100"
                    >
                      <span className="text-xl">{comm.icon}</span>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-gray-800 group-hover:text-[#0158B7]">{comm.name}</div>
                        <div className="text-[10px] text-gray-500">{comm.members.toLocaleString()} members</div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-[#0158B7] group-hover:translate-x-0.5 transition-all" />
                    </a>
                  ))}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                <Link href="#communities" className="text-xs text-[#0158B7] font-semibold flex items-center gap-1">
                  Explore all communities <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading overlay for Google sign-in */}
      {(googleLoading || socketInitializing) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-[#0158B7]" />
            <p className="text-sm text-gray-700 font-medium">
              {socketInitializing ? 'Connecting to chat...' : 'Signing in with Google...'}
            </p>
          </div>
        </div>
      )}
    </>
  )
}


function HeroSection({ summary, isLoading }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 150])
  const y2 = useTransform(scrollY, [0, 500], [0, 250])

  // Animated text cycling
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const animatedTexts = [
    "Empowering Rwanda's",
    "Dushakashake",
    "Dushakira U'Rwanda"
  ]

  // Scroll functions
  const scrollToNextSection = () => {
    const nextSection = document.getElementById('features-section')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % animatedTexts.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const stats = [
    { value: summary?.projectsCount || 0, label: 'Projects', suffix: '+' },
    { value: summary?.researchersCount || 0, label: 'Researchers', suffix: '+' },
    { value: summary?.communitiesCount || 0, label: 'Communities', suffix: '+' },
    { value: summary?.eventsCount || 0, label: 'Events', suffix: '+' }
  ]

  // Trust indicators for integrated trust bar
  const trustIndicators = [
    { icon: CheckCircle, text: 'University Partnerships' },
    { icon: CheckCircle, text: 'Secure & Private' },
    { icon: CheckCircle, text: 'Government Supported' },
    { icon: CheckCircle, text: 'Free for Researchers' }
  ]

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-16">
      {/* Base Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0158B7] to-[#0362C3]" />

      {/* Crescent Layers */}
      <motion.div
        className="absolute right-[-10%] top-[20%] w-[60%] h-[80%] opacity-40"
        style={{
          y: y1,
          clipPath: 'ellipse(40% 50% at 100% 50%)',
          background: '#0362C3',
          transform: 'rotate(-15deg)'
        }}
      />
      <motion.div
        className="absolute left-[-5%] bottom-[-10%] w-[40%] h-[60%] opacity-30"
        style={{
          y: y2,
          clipPath: 'circle(50% at 0% 100%)',
          background: '#5E96D2',
          transform: 'rotate(25deg)'
        }}
      />

      <FloatingParticles />

      <div className="relative z-10 max-w-6xl mx-auto px-4">
        {/* TWO-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* LEFT COLUMN - Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            {/* Animated Headline */}
            <div className="text-3xl md:text-5xl font-bold mb-4 leading-tight min-h-[6rem] md:min-h-[7rem]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTextIndex}
                  initial={{ opacity: 0, y: 50, rotateX: -90 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  exit={{ opacity: 0, y: -50, rotateX: 90 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="origin-center"
                >
                  {animatedTexts[currentTextIndex]}
                </motion.div>
              </AnimatePresence>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Research Community
              </motion.div>
            </div>

            <motion.p
              className="text-lg md:text-xl mb-6 text-gray-100 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Connect • Collaborate • Contribute to knowledge that shapes Rwanda's future
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-start mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  className="inline-block bg-white text-[#0158B7] font-bold py-3 px-6 rounded-full shadow-lg hover:shadow-2xl transition-all text-sm"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Start Sharing Research"}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href={isAuthenticated ? "/dashboard/user/communities" : "#communities"}
                  className="inline-block border border-white text-white font-bold py-3 px-6 rounded-full hover:bg-white hover:text-[#0158B7] transition-all text-sm"
                >
                  Explore Communities
                </Link>
              </motion.div>
            </motion.div>

            {/* INTEGRATED TRUST INDICATORS (from TrustBar) */}
            <motion.div
              className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {trustIndicators.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-center space-x-1.5"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <item.icon className="w-3.5 h-3.5 text-white/80" />
                  <span className="text-xs text-white/80">{item.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN - Platform Capabilities Panel */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative"
          >
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-2xl border border-white/20 mt-2 mb-2">
              {/* Decorative elements */}
              <svg
                className="absolute -top-10 -right-10 w-[150px] h-[150px] opacity-20"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="140" cy="40" r="120" stroke="white" strokeWidth="20" fill="none" />
              </svg>

              <div className="mb-5">
                <span className="text-[#C9932A] text-[0.625rem] uppercase tracking-[0.15em] font-semibold">PLATFORM CAPABILITIES</span>
                <div className="w-12 h-0.5 bg-[#C9932A] mt-2" />
              </div>

              {/* Stats Row - Compact */}
              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonLoader key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      className="bg-white/20 rounded-lg p-3 text-center"
                    >
                      <div className="text-xl md:text-2xl font-bold text-white">
                        <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                      </div>
                      <div className="text-xs text-white/80">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Key Features List */}
              <div className="space-y-2.5">
                {[
                  { icon: Upload, text: "Share Research", tag: "DOI Integration" },
                  { icon: Users, text: "Join Communities", tag: "50+ Groups" },
                  { icon: Calendar, text: "Attend Events", tag: "Webinars & Conferences" },
                  { icon: TrendingUp, text: "Track Impact", tag: "Analytics & Metrics" },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 1.0 + (index * 0.1) }}
                    className="group flex items-center gap-3 hover:bg-white/10 rounded-lg p-1.5 -mx-1.5 transition-all duration-300 cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-white text-sm font-medium flex-1">{item.text}</span>
                    <span className="bg-white/20 text-white/80 text-[0.625rem] font-medium px-2 py-1 rounded-full">
                      {item.tag}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-white/50 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </motion.div>
                ))}
              </div>

    
            </div>
          </motion.div>
        </div>


      </div>

      {/* Wave Divider */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 Q360,0 720,50 T1440,50 L1440,80 L0,80 Z"
          fill="#F8F9FA"
        />
      </svg>
    </section>
  )
}
function TrustBar() {
  const [institutions, setInstitutions] = useState<Array<{ id: string; name: string; logo_url?: string }>>([])
  const [isPaused, setIsPaused] = useState(false)
  const [duplicatedInstitutions, setDuplicatedInstitutions] = useState<any[]>([])

  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await api.get('/institution-work')
        
        // Fixed: Check the actual response structure
        if (response.data?.data) {
          // The data is an object with 'institutions' property, not directly an array
          const institutionsData = response.data.data.institutions || []
          setInstitutions(institutionsData)
          
          // Only duplicate if there are institutions
          if (institutionsData.length > 0) {
            setDuplicatedInstitutions([...institutionsData, ...institutionsData, ...institutionsData])
          } else {
            setDuplicatedInstitutions([])
          }
        } else if (Array.isArray(response.data?.data)) {
          // Fallback: if data is directly an array
          setInstitutions(response.data.data)
          setDuplicatedInstitutions([...response.data.data, ...response.data.data, ...response.data.data])
        } else {
          setInstitutions([])
          setDuplicatedInstitutions([])
        }
      } catch (error) {
        console.error('Failed to fetch institutions:', error)
        setInstitutions([])
        setDuplicatedInstitutions([])
      }
    }
    fetchInstitutions()
  }, [])

  const trustIndicators = [
    { icon: CheckCircle, text: 'University Partnerships' },
    { icon: Shield, text: 'Secure & Private' },
    { icon: Building2, text: 'Government Supported' },
    { icon: Award, text: 'Free for Researchers' },
  ]

  // Show simplified trust bar if no institutions
  if (institutions.length === 0) {
    return (
      <section id="trust-bar" className="bg-[#F8F9FA] py-2 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
            {trustIndicators.map((item, i) => (
              <div key={i} className="flex items-center space-x-1">
                <item.icon className="w-3 h-3 text-[#0362C3]" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="trust-bar" className="bg-[#F8F9FA] py-1.5 border-b border-gray-200 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <div className="hidden md:flex items-center justify-center gap-4 mb-1.5">
          {trustIndicators.map((item, i) => (
            <div key={i} className="flex items-center space-x-1">
              <item.icon className="w-3 h-3 text-[#0362C3]" />
              <span className="text-[11px] font-medium text-gray-700">{item.text}</span>
            </div>
          ))}
          <div className="w-px h-3 bg-gray-300" />
          <span className="text-[11px] font-semibold text-[#0158B7]">Partner Institutions:</span>
        </div>

        <div
          className="relative w-full overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div
            className="flex gap-4 py-1.5"
            style={{
              animation: `scroll-marquee 20s linear infinite`,
              animationPlayState: isPaused ? 'paused' : 'running',
              width: 'max-content',
            }}
          >
            {duplicatedInstitutions.map((inst, idx) => (
              <div key={`${inst.id}-${idx}`} className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full shadow-sm border border-gray-200">
                {inst.logo_url ? (
                  <img src={inst.logo_url} alt={inst.name} className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <Building2 className="w-3 h-3 text-[#0158B7]" />
                )}
                <span className="text-[10px] font-medium text-gray-700 whitespace-nowrap">{inst.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  )
}

// ==================== ENHANCED FEATURES GRID ====================
function FeaturesGrid() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const features = [
    {
      icon: Upload,
      title: 'Share Research',
      desc: 'Publish projects, papers, datasets with DOI integration',
      link: isAuthenticated ? '/dashboard/user/research' : '/login',
      linkText: isAuthenticated ? 'Upload Now' : 'Sign In to Upload',
      color: 'from-[#0158B7] to-[#0362C3]',
      dark: true,
    },
    {
      icon: Users,
      title: 'Join Communities',
      desc: '50+ interest-based groups from Health to AI',
      link: isAuthenticated ? '/dashboard/user/communities' : '/login',
      linkText: isAuthenticated ? 'Browse Communities' : 'Sign In to Join',
      color: 'from-[#0362C3] to-[#5E96D2]',
      dark: false,
    },
    {
      icon: Calendar,
      title: 'Attend Events',
      desc: 'Webinars, conferences, workshops - online & in-person',
      link: isAuthenticated ? '/dashboard/user/events' : '/login',
      linkText: isAuthenticated ? 'View Events' : 'Sign In to View',
      color: 'from-[#5E96D2] to-[#8DB6E1]',
      dark: false,
    }
  ]

  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1F3A] mb-1.5">
            Complete Research Platform
          </h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Everything you need to share knowledge, collaborate, and advance research in Rwanda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <TiltCard key={i} delay={i * 0.08} dark={feature.dark}>
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#0158B7] to-[#C9932A] rounded-t-lg" />
              <div className="absolute top-0 right-0 w-14 h-14 bg-gradient-to-br from-[#0158B7] to-transparent opacity-10 rounded-bl-lg pointer-events-none" />
              
              <div className={`w-10 h-10 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-2.5 shadow-md`}>
                <feature.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className={`text-base font-bold ${feature.dark ? 'text-white' : 'text-[#1A1F3A]'} mb-1`}>{feature.title}</h3>
              <p className={`${feature.dark ? 'text-gray-300' : 'text-gray-600'} mb-2.5 text-xs`}>{feature.desc}</p>
              <Link
                href={feature.link}
                className={`${feature.dark ? 'text-[#C9932A] hover:text-[#e8aa4a]' : 'text-[#0158B7] hover:text-[#0362C3]'} font-semibold transition-colors flex items-center group text-xs`}
              >
                {feature.linkText}
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

function TiltCard({ children, delay = 0, dark = false }: { children: React.ReactNode; delay?: number; dark?: boolean }) {
  const ref = useRef(null)
  const [rotateX, setRotateX] = useState(0)
  const [rotateY, setRotateY] = useState(0)

  const handleMouseMove = (e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    setRotateY(((x - centerX) / centerX) * 6)
    setRotateX(((centerY - y) / centerY) * 6)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.08s ease-out'
      }}
      className={`relative rounded-lg p-4 shadow-md hover:shadow-lg transition-all border ${dark ? 'bg-[#1B2F4E] border-white/10' : 'bg-white border-gray-100'}`}
    >
      {children}
    </motion.div>
  )
}



// ==================== COMMUNITY HIGHLIGHTS (Optimized Compact Cards) ====================
function CommunityHighlights({ communities, isLoadingContent }) {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const getRecentMembers = () => {
    return [
      { name: 'A', color: 'bg-red-500' },
      { name: 'B', color: 'bg-blue-500' },
      { name: 'C', color: 'bg-green-500' },
    ]
  }

  return (
    <section id="communities" className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1F3A] mb-1.5">
            Active Communities
          </h2>
          <p className="text-gray-600 text-sm">
            Join vibrant groups of researchers sharing your interests
          </p>
        </div>

        {isLoadingContent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 text-sm mb-3">No communities available yet</p>
            {isAuthenticated && (
              <Link href="/dashboard/user/communities" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white rounded-md text-sm font-semibold">
                <Users className="w-3.5 h-3.5" />
                Create Community
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {communities.slice(0, 3).map((community, i) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                onClick={() => router.push(`/communities/${community.id}`)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 group flex flex-col h-full"
              >
                {/* Enhanced Image Container with Smart Aspect Ratio */}
                <div className="relative w-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] overflow-hidden" style={{ height: '200px' }}>
                  {community.cover_image_url ? (
                    <>
                      <img 
                        src={community.cover_image_url} 
                        alt={community.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      {/* Smart Gradient Overlay for Better Text Readability */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="w-16 h-16 text-white opacity-40" />
                    </div>
                  )}
                  
                  {/* Member Count Badge - Enhanced */}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] px-2 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Users className="w-3 h-3" />
                    <span className="font-semibold">{community.member_count.toLocaleString()}</span>
                  </div>
                  
                  {/* Active Status Badge - Enhanced */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full shadow-md">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white font-medium">Active Community</span>
                  </div>
                  
                  {/* Category/Tag Badge - New Addition */}
                  {community.category && (
                    <div className="absolute top-3 left-3 bg-[#0158B7]/90 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full font-medium">
                      {community.category}
                    </div>
                  )}
                </div>
        
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-[#1A1F3A] mb-2 line-clamp-2 min-h-[3rem] hover:text-[#0158B7] transition-colors">
                    {community.name}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                    {community.description || 'Join this community to connect with researchers and share knowledge'}
                  </p>
        
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center text-[10px] text-gray-500">
                      <Calendar className="w-3 h-3 mr-1" />
                      <span>{new Date(community.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center text-[10px] text-gray-500">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      <span>{community.post_count || 0} posts</span>
                    </div>
                  </div>
        
                  {/* Member Avatars - Enhanced */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center -space-x-2">
                      {getRecentMembers().map((member, idx) => (
                        <div 
                          key={idx} 
                          className={`w-7 h-7 rounded-full ${member.color} border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm`}
                          title={`Member ${member.name}`}
                        >
                          {member.name}
                        </div>
                      ))}
                      <div className="ml-2 text-[10px] text-gray-500 font-medium">
                        +{Math.min(community.member_count - 3, 99)} more
                      </div>
                    </div>
                    
                    {/* Engagement Rate - New Addition */}
                    <div className="text-[9px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      ★ High engagement
                    </div>
                  </div>
        
                  <button className="w-full bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white py-2 rounded-lg text-xs font-semibold hover:shadow-md transition-all duration-300 hover:from-[#0158B7] hover:to-[#0362C3] group-hover:shadow-lg">
                    Explore Community
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/communities" className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all">
            Explore More Communities <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ==================== EVENTS PREVIEW (Optimized Compact Cards) ====================
function EventsPreview() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { latestUpcomingEvents, isLoadingUpcomingEvents } = useSelector((state: RootState) => state.homepage)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchLatestUpcomingEvents())
  }, [dispatch])

  const formatEventDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatEventTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const getDaysRemaining = (startDate: string) => {
    const days = Math.ceil((new Date(startDate).getTime() - Date.now()) / 86400000)
    return days > 0 ? days : 0
  }

  const displayEvents = latestUpcomingEvents.slice(0, 3)

  return (
    <section id="events" className="py-10 bg-gradient-to-br from-[#F8F9FA] to-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1F3A] mb-1.5">
            Upcoming Events
          </h2>
          <p className="text-gray-600 text-sm">
            Connect with researchers through conferences and workshops
          </p>
        </motion.div>

        {isLoadingUpcomingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <CardSkeleton /><CardSkeleton /><CardSkeleton />
          </div>
        ) : latestUpcomingEvents.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 text-sm mb-3">No upcoming events</p>
            {isAuthenticated && (
              <Link href="/dashboard/user/events" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-md text-sm font-semibold">
                <Calendar className="w-3.5 h-3.5" />
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayEvents.map((event, index) => {
              const isExpanded = expandedCard === event.id
              const daysRemaining = getDaysRemaining(event.start_datetime)

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  viewport={{ once: true }}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-gray-100 group flex flex-col h-full"
                  onMouseEnter={() => setExpandedCard(event.id)}
                  onMouseLeave={() => setExpandedCard(null)}
                >
                  {/* Enhanced Image Container with Smart Aspect Ratio */}
                  <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#0158B7] to-[#0362C3]" style={{ height: '200px' }}>
                    {event.cover_image_url ? (
                      <>
                        <img 
                          src={event.cover_image_url} 
                          alt={event.title} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-16 h-16 text-white opacity-40" />
                      </div>
                    )}
                    
                    {/* Date Badge - Enhanced */}
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] px-2 py-1 rounded-lg font-semibold shadow-lg">
                      {formatEventDate(event.start_datetime)}
                    </div>
                    
                    {/* Featured Badge - Enhanced */}
                    {index === 0 && (
                      <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] px-2 py-1 rounded-lg font-bold shadow-md flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        FEATURED
                      </div>
                    )}
                    
                    {/* Days Remaining Badge - Enhanced */}
                    {daysRemaining > 0 && daysRemaining <= 7 && (
                      <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-medium shadow-md">
                        {daysRemaining === 0 ? 'Today!' : `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} away`}
                      </div>
                    )}
                    
                    {/* Time Badge - New Addition */}
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {formatEventTime(event.start_datetime)}
                    </div>
                  </div>
  
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-base font-bold text-[#1A1F3A] mb-2 line-clamp-2 min-h-[3rem] hover:text-[#0158B7] transition-colors">
                      {event.title}
                    </h3>
  
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center text-[11px] text-gray-600">
                        <Clock className="w-3.5 h-3.5 mr-1.5 text-[#0158B7]" />
                        <span className="font-medium">{formatEventTime(event.start_datetime)} - {formatEventTime(event.end_datetime)}</span>
                      </div>
                      
                      {/* Location/Location Info - New Addition */}
                      {event.location && (
                        <div className="flex items-center text-[11px] text-gray-500">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#0158B7]" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
  
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <p className="text-[11px] text-gray-600 mb-3 pt-2 border-t border-gray-100 leading-relaxed">
                            {event.short_description?.substring(0, 80)}...
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
  
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-semibold rounded-full ${
                        event.event_mode === 'Online' ? 'bg-blue-100 text-blue-700' :
                        event.event_mode === 'Physical' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {event.event_mode === 'Online' && <Video className="w-2.5 h-2.5" />}
                        {event.event_mode}
                      </span>
                      <span className="inline-block px-2 py-1 text-[10px] font-semibold rounded-full bg-gray-100 text-gray-700">
                        {event.event_type || 'Conference'}
                      </span>
                      {event.is_free !== false && (
                        <span className="inline-block px-2 py-1 text-[10px] font-semibold rounded-full bg-green-100 text-green-700">
                          Free
                        </span>
                      )}
                    </div>
  
                    <button className="w-full bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white py-2 rounded-lg text-xs font-semibold hover:shadow-md transition-all duration-300 hover:from-[#0158B7] hover:to-[#0362C3] mt-auto">
                      View Details
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {latestUpcomingEvents.length > 0 && (
          <div className="text-center mt-6">
            <Link href="/events" className="inline-flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all">
              Explore More Events <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,35 Q360,70 720,35 T1440,35 L1440,40 L0,40 Z" fill="#ffffff" />
      </svg>
    </section>
  )
}

// ==================== RESEARCH SHOWCASE (Optimized Compact Cards) ====================
function ResearchShowcase({ projects, isLoadingContent }) {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [activeFilter, setActiveFilter] = useState('All')

  const uniqueCategories = ['All', ...new Set(projects.map(p => p.field_of_study).filter(Boolean))]
  const filters = uniqueCategories.slice(0, 5)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const filteredProjects = activeFilter === 'All' ? projects : projects.filter(p => p.field_of_study === activeFilter)

  return (
    <section id="research" className="py-10 bg-gradient-to-br from-[#F8F9FA] to-white relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1F3A] mb-1.5">
            Latest Research from Our Community
          </h2>
          <p className="text-gray-600 text-sm">
            Discover cutting-edge research shaping Rwanda's future
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 mb-5">
          {filters.map((filter) => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative px-3 py-1 rounded-full font-medium transition-all text-xs ${
                activeFilter === filter
                  ? 'text-[#0158B7]'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter}
              {activeFilter === filter && (
                <motion.div
                  layoutId="activeFilter"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0158B7]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {isLoadingContent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-600 text-sm mb-3">No research projects available yet</p>
            {isAuthenticated && (
              <Link href="/dashboard/user/research" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-md text-sm font-semibold">
                <Upload className="w-3.5 h-3.5" />
                Share Your Research
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {filteredProjects.slice(0, 3).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                onClick={() => router.push(`/research-projects/${item.id}`)}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 group flex flex-col h-full"
              >
                <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#0158B7] to-[#0362C3]" style={{ height: '200px' }}>
                  {item.cover_image_url ? (
                    <>
                      <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="w-16 h-16 text-white opacity-40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-lg font-medium shadow-lg">
                    {formatDate(item.created_at)}
                  </div>
                  {i === 0 && (
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white text-[10px] px-2 py-1 rounded-lg font-bold shadow-md flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      FEATURED
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-white text-[9px] font-medium">
                    {item.view_count || 0} views
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="text-base font-bold text-[#1A1F3A] mb-2 line-clamp-2 min-h-[3rem] hover:text-[#0158B7] transition-colors">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center text-[11px] text-gray-600 mb-2">
                    <User className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate font-medium">{item.author?.first_name} {item.author?.last_name}</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {item.tags?.slice(0, 2).map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-[#0158B7]/10 text-[#0158B7] text-[10px] rounded-full font-medium">
                        {tag.name}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto">
                    <div className="flex items-center space-x-3 text-[10px] text-gray-500">
                      <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{item.view_count || 0}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{item.like_count || 0}</span>
                    </div>
                    <button className="text-[#0158B7] font-semibold text-[11px] flex items-center hover:gap-2 transition-all">
                      Read More <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredProjects.length > 0 && (
          <div className="text-center mt-6">
            <Link href="/research-projects" className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0158B7] text-white rounded-lg text-sm font-semibold hover:bg-[#0362C3] transition">
              Explore More Research Projects <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,35 Q360,70 720,35 T1440,35 L1440,40 L0,40 Z" fill="white" />
      </svg>
    </section>
  )
}

// ==================== IMPACT STATS ====================
function ImpactStats({ summary, isLoading }) {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 60])
  const y2 = useTransform(scrollY, [0, 500], [0, 80])

  const stats = [
    { icon: FileText, value: summary?.projectsCount || 0, label: 'Research Projects', suffix: '+' },
    { icon: Users, value: summary?.researchersCount || 0, label: 'Active Researchers', suffix: '+' },
    { icon: Users, value: summary?.communitiesCount || 0, label: 'Communities Created', suffix: '+' },
    { icon: Calendar, value: summary?.eventsCount || 0, label: 'Events Hosted', suffix: '+' }
  ]

  return (
    <section className="py-12 bg-gradient-to-br from-[#0158B7] to-[#0362C3] text-white relative overflow-hidden">
      <motion.div
        className="absolute right-[-15%] top-[10%] w-[50%] h-[70%] opacity-30"
        style={{ y: y1, clipPath: 'ellipse(45% 55% at 100% 50%)', background: '#5E96D2', transform: 'rotate(-20deg)' }}
      />
      <motion.div
        className="absolute left-[-10%] bottom-[-5%] w-[45%] h-[65%] opacity-25"
        style={{ y: y2, clipPath: 'circle(50% at 0% 100%)', background: '#8DB6E1', transform: 'rotate(30deg)' }}
      />

      <FloatingParticles />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-6"
        >
          <h2 className="text-xl md:text-2xl font-bold mb-1.5">
            Platform Impact
          </h2>
          <p className="text-white/90 text-sm max-w-2xl mx-auto">
            Growing Rwanda's research ecosystem together
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <SkeletonLoader key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                viewport={{ once: true }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-md"
              >
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.4 }}>
                  <stat.icon className="w-7 h-7 mx-auto mb-1.5 opacity-90" />
                </motion.div>
                <div className="text-xl md:text-2xl font-bold mb-0.5">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-[10px] text-white/90 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,40 Q360,80 720,40 T1440,40 L1440,60 L0,60 Z" fill="#ffffff" />
      </svg>
    </section>
  )
}

// ==================== HOW IT WORKS ====================
function HowItWorks() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  const steps = [
    { icon: User, title: 'Create Profile', desc: 'Set up your researcher profile', color: 'from-[#0158B7] to-[#0362C3]' },
    { icon: Upload, title: 'Share Research', desc: 'Upload your projects and papers', color: 'from-[#0362C3] to-[#5E96D2]' },
    { icon: Users, title: 'Join Communities', desc: 'Connect with peers', color: 'from-[#5E96D2] to-[#8DB6E1]' },
    { icon: TrendingUp, title: 'Collaborate & Grow', desc: 'Advance knowledge together', color: 'from-[#8DB6E1] to-[#0158B7]' }
  ]

  return (
    <section className="py-12 bg-gradient-to-br from-[#F8F9FA] to-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1F3A] mb-1.5">
            How It Works
          </h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            Get started in four simple steps
          </p>
        </motion.div>

        <div className="relative">
          <svg className="absolute top-1/2 left-0 w-full h-8 -translate-y-1/2 hidden md:block" viewBox="0 0 1000 20" preserveAspectRatio="none">
            <motion.path
              d="M 0,10 L 1000,10"
              stroke="#C9932A"
              strokeWidth="1.5"
              strokeDasharray="5 5"
              fill="none"
              initial={{ strokeDashoffset: 100 }}
              whileInView={{ strokeDashoffset: 0 }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "loop", ease: "linear" }}
              style={{ animation: 'dash-move 0.4s linear infinite' }}
            />
          </svg>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                viewport={{ once: true }}
                className="text-center"
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div className="relative inline-block mb-2">
                  <motion.div
                    className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-lg mx-auto`}
                    animate={{
                      boxShadow: hoveredStep === i ? "0 8px 25px rgba(1,88,183,0.3)" : "0 4px 12px rgba(1,88,183,0.2)"
                    }}
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-[#0158B7] rounded-full flex items-center justify-center text-white font-bold text-[10px] shadow-md">
                    {i + 1}
                  </div>
                  {hoveredStep === i && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#0158B7]/20"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />
                  )}
                </div>
                <h3 className="text-sm font-bold text-[#1A1F3A] mb-0.5">{step.title}</h3>
                <p className="text-gray-600 text-[11px]">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white px-6 py-2 rounded-full font-semibold hover:shadow-md transition-all text-sm"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes dash-move {
          to { stroke-dashoffset: 10; }
        }
      `}</style>
    </section>
  )
}

// ==================== TESTIMONIALS ====================
function Testimonials() {
  const testimonials = [
    {
      quote: "Bwenge has transformed how I collaborate with fellow researchers. The platform makes sharing knowledge seamless.",
      name: "Dr. Alice Mukamana",
      title: "Health Researcher",
      institution: "University of Rwanda",
      rating: 5,
      color: "from-[#0158B7] to-[#0362C3]",
      verified: true,
    },
    {
      quote: "Finally, a platform built for African researchers. The community support has been invaluable for my work.",
      name: "Prof. Jean Nsengimana",
      title: "Computer Science",
      institution: "Carnegie Mellon - Africa",
      rating: 5,
      color: "from-[#0362C3] to-[#5E96D2]",
      verified: true,
    },
    {
      quote: "The diaspora network helped me connect with researchers back home. Bwenge bridges the gap beautifully.",
      name: "Dr. Emmanuel Kayitare",
      title: "Environmental Scientist",
      institution: "Diaspora Scholar",
      rating: 5,
      color: "from-[#5E96D2] to-[#8DB6E1]",
      verified: false,
    }
  ]

  return (
    <section className="py-12 bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA] relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-xl md:text-2xl font-bold text-[#1A1F3A] mb-1.5">
            What Researchers Say
          </h2>
          <p className="text-gray-600 text-sm">
            Join thousands of satisfied researchers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
              className="bg-white backdrop-blur-sm rounded-lg p-4 shadow-md hover:shadow-lg transition-all border border-gray-100 relative overflow-hidden"
            >
              <div className="absolute top-2 right-3 text-[#0158B7] text-5xl font-serif opacity-5 pointer-events-none">
                "
              </div>
              <div className={`absolute top-0 right-0 w-14 h-14 bg-gradient-to-br ${testimonial.color} opacity-5 rounded-bl-full`} />

              <div className="flex mb-2">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-3 h-3 text-[#0362C3] fill-current" />
                ))}
              </div>

              <p className="text-gray-700 mb-3 italic leading-relaxed text-xs">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center">
                <div className={`w-8 h-8 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-sm mr-2 shadow-md relative`}>
                  {testimonial.name.charAt(0)}
                  {testimonial.verified && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#0158B7] rounded-full flex items-center justify-center border border-white">
                      <CheckCircle className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-[#1A1F3A] text-xs">{testimonial.name}</div>
                  <div className="text-[10px] text-gray-600">{testimonial.title}</div>
                  <div className="text-[9px] text-gray-500">{testimonial.institution}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ==================== NEWSLETTER CTA ====================
function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setSubscriptionStatus('error')
      setMessage('Please enter your email address')
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setSubscriptionStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setSubscriptionStatus('idle')
    setMessage('')

    try {
      const response = await api.post('/subscribe', { email })
      if (response.data && response.data.success) {
        setSubscriptionStatus('success')
        setMessage('Thank you for subscribing! You will receive updates on new research projects, events, and communities.')
        setEmail('')
      } else {
        setSubscriptionStatus('error')
        setMessage(response.data?.message || 'Subscription failed. Please try again.')
      }
    } catch (error: any) {
      setSubscriptionStatus('error')
      setMessage(error.response?.data?.message || 'Network error. Please check your connection.')
    } finally {
      setIsSubmitting(false)
      setTimeout(() => {
        setMessage('')
        setSubscriptionStatus('idle')
      }, 5000)
    }
  }

  const benefits = [
    { icon: FileText, text: 'New Research Projects' },
    { icon: Calendar, text: 'Upcoming Events' },
    { icon: Users, text: 'Community Updates' }
  ]

  return (
    <section className="py-12 bg-gradient-to-br from-[#0158B7] via-[#0362C3] to-[#5E96D2] relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="inline-block mb-3"
          >
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto shadow-md">
              <Mail className="w-5 h-5" />
            </div>
          </motion.div>

          <h2 className="text-xl md:text-2xl font-bold mb-2">
            Stay Updated on Rwanda's Research
          </h2>
          <p className="text-white/90 mb-5 max-w-2xl mx-auto text-sm">
            Get notified about new research projects, events, and communities in Rwanda's research ecosystem
          </p>

          <AnimatePresence>
            {subscriptionStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="mb-4 p-2.5 bg-green-500/20 backdrop-blur-sm rounded-lg border border-green-400/30 max-w-md mx-auto"
              >
                <div className="flex items-center justify-center gap-1.5 text-green-100">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-xs font-medium">{message}</p>
                </div>
              </motion.div>
            )}
            {subscriptionStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                className="mb-4 p-2.5 bg-red-500/20 backdrop-blur-sm rounded-lg border border-red-400/30 max-w-md mx-auto"
              >
                <div className="flex items-center justify-center gap-1.5 text-red-100">
                  <X className="w-4 h-4" />
                  <p className="text-xs font-medium">{message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto mb-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-white/30 text-sm"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-white text-[#0158B7] px-5 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all shadow-md disabled:opacity-50 text-sm min-w-[100px]"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Subscribe"}
            </button>
          </motion.form>

          <div className="text-xs text-white/80 mb-3">
            <p>We respect your privacy. Unsubscribe at any time.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
            {benefits.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-1.5 text-white/80 text-xs"
              >
                <item.icon className="w-3 h-3" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      <svg className="absolute bottom-0 left-0 w-full" viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,40 Q360,80 720,40 T1440,40 L1440,60 L0,60 Z" fill="#ffffffff" />
      </svg>
    </section>
  )
}

// ==================== FOOTER ====================
function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gradient-to-br from-[#0158B7] to-[#0362C3] text-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between pt-5 pb-4 border-b border-white/20">
          <span className="text-[11px] font-semibold text-white/70">Bwenge Research Platform · Empowering Rwanda's Research Community</span>
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/20 transition-all group"
            title="Back to Top"
          >
            <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
              <ChevronDown className="w-4 h-4 rotate-180 text-white" />
            </motion.div>
          </motion.button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="inline-block">
              <div className="w-[120px] h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-sm mb-2">
                <Image src="/BwengeLogo.png" alt="Bwenge logo" width={120} height={48} className="object-contain" />
              </div>
            </Link>
            <p className="text-white/90 text-xs font-semibold mb-0.5">Bwenge Research Platform</p>
            <p className="text-white/60 text-[10px] leading-relaxed">Empowering Rwanda's Research Community</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold text-xs mb-2.5">Quick Links</h3>
            <nav className="space-y-1.5">
              <Link href="/research-projects" className="block text-white/60 hover:text-white text-[11px] transition-colors">Research Library</Link>
              <Link href="/communities" className="block text-white/60 hover:text-white text-[11px] transition-colors">Communities</Link>
              <Link href="/events" className="block text-white/60 hover:text-white text-[11px] transition-colors">Events</Link>
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.16 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold text-xs mb-2.5 flex items-center gap-1.5">
              <Shield className="w-3 h-3" />
              Legal & Policies
            </h3>
            <nav className="space-y-1.5">
              <Link href="/policy#privacy-policy" className="block text-white/60 hover:text-white text-[11px] transition-colors">Privacy Policy</Link>
              <Link href="/policy#terms-service" className="block text-white/60 hover:text-white text-[11px] transition-colors">Terms of Service</Link>
              <Link href="/policy#community-standards" className="block text-white/60 hover:text-white text-[11px] transition-colors">Community Standards</Link>
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.24 }}
            viewport={{ once: true }}
          >
            <h3 className="text-white font-semibold text-xs mb-2.5">Get in Touch</h3>
            <div className="space-y-2">
              <a href="mailto:bwengeorg@gmail.com" className="flex items-center gap-1.5 text-white/60 hover:text-white text-[11px] transition-colors">
                <Mail className="w-3 h-3" />
                bwengeorg@gmail.com
              </a>
              <div className="flex items-center gap-1.5">
                <a href="mailto:bwengeorg@gmail.com" className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center hover:bg-[#0158B7]/30 transition-all">
                  <Mail className="w-3.5 h-3.5 text-white/70" />
                </a>
                <a href="https://Bwenge.rw" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-md bg-white/10 border border-white/20 flex items-center justify-center hover:bg-[#0158B7]/30 transition-all">
                  <Globe className="w-3.5 h-3.5 text-white/70" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/20 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-white/60 text-[10px]">© 2025 Bwenge • All rights reserved</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
              <Link href="/policy#privacy-policy" className="text-white/50 hover:text-white transition-colors">Privacy</Link>
              <span className="text-white/30">•</span>
              <Link href="/policy#terms-service" className="text-white/50 hover:text-white transition-colors">Terms</Link>
              <span className="text-white/30">•</span>
              <Link href="/policy#community-standards" className="text-white/50 hover:text-white transition-colors">Standards</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ==================== ANIMATED COUNTER ====================
function AnimatedCounter({ end, suffix = "", duration = 1500 }: { end: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0)
  const countRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(countRef, { once: true, margin: "-50px" })

  useEffect(() => {
    if (!inView) return
    let startTime: number | null = null
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOutQuart = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(easeOutQuart * end))
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }
    animationFrame = requestAnimationFrame(animate)
    return () => { if (animationFrame) cancelAnimationFrame(animationFrame) }
  }, [inView, end, duration])

  return (
    <span ref={countRef} className="tabular-nums">
      {count.toLocaleString()}
      <span className="text-[10px] ml-0.5 opacity-80">{suffix}</span>
    </span>
  )
}

// ==================== MAIN PAGE ====================
export default function BwengeHomePage() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    summary,
    featuredProjects,
    featuredCommunities,
    isLoading,
    isLoadingContent,
  } = useSelector((state: RootState) => state.homepage)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!isAuthenticated && hasValidAuth()) {
      clearAuthData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    dispatch(fetchHomePageSummary())
    dispatch(fetchHomePageContent())
    dispatch(fetchLatestUpcomingEvents())
  }, [dispatch])

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection summary={summary} isLoading={isLoading} />
      <TrustBar />
      <FeaturesGrid />
      <ResearchShowcase projects={featuredProjects} isLoadingContent={isLoadingContent} />
      <CommunityHighlights communities={featuredCommunities} isLoadingContent={isLoadingContent} />
      <EventsPreview />
      <ImpactStats summary={summary} isLoading={isLoading} />
      <HowItWorks />
      <Testimonials />
      <NewsletterCTA />
      <Footer />
    </div>
  )
}