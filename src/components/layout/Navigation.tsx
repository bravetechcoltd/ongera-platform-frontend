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
  LayoutDashboard,
  LogOut
} from 'lucide-react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { logout } from '@/lib/features/auth/auth-slice'
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import Image from 'next/image'
import { googleLogin } from '@/lib/features/auth/auth-slice'
import { toast } from 'sonner'

export default function SharedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [socketInitializing, setSocketInitializing] = useState(false)
  
  // Real backend data states
  const [researchCategories, setResearchCategories] = useState<Array<{ name: string; icon: string; count: number; field: string }>>([])
  const [communitiesCategories, setCommunitiesCategories] = useState<Array<{ name: string; icon: string; members: number; id: string; slug: string }>>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  
  const { isAuthenticated, user, isLoading } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const pathname = usePathname()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Fetch real data for mega menus
  useEffect(() => {
    const fetchMegaMenuData = async () => {
      setIsLoadingCategories(true)
      try {
        // Fetch research fields from projects API
        const projectsResponse = await api.get('/projects?page=1&limit=100&status=Published')
        if (projectsResponse.data?.data?.projects) {
          const projects = projectsResponse.data.data.projects
          // Extract unique fields of study
          const fieldCounts = new Map<string, number>()
          projects.forEach((project: any) => {
            if (project.field_of_study) {
              fieldCounts.set(project.field_of_study, (fieldCounts.get(project.field_of_study) || 0) + 1)
            }
          })
          
          // Convert to research categories with icons
          const categories = Array.from(fieldCounts.entries()).map(([name, count]) => ({
            name,
            icon: getIconForField(name),
            count,
            field: name
          })).slice(0, 6)
          
          setResearchCategories(categories)
        }
        
        // Fetch communities for mega menu
        const communitiesResponse = await api.get('/communities?page=1&limit=50')
        if (communitiesResponse.data?.data?.communities) {
          const communities = communitiesResponse.data.data.communities
          // Get top communities by member count
          const topCommunities = communities
            .sort((a: any, b: any) => (b.member_count || 0) - (a.member_count || 0))
            .slice(0, 6)
            .map((community: any) => ({
              name: community.name,
              icon: getIconForCommunity(community.category),
              members: community.member_count || 0,
              id: community.id,
              slug: community.slug
            }))
          
          setCommunitiesCategories(topCommunities)
        }
      } catch (error) {
      } finally {
        setIsLoadingCategories(false)
      }
    }
    
    fetchMegaMenuData()
  }, [])

  // Helper function to get icon for research field
  const getIconForField = (field: string): string => {
    const fieldMap: Record<string, string> = {
      'Agriculture': '🌾',
      'Technology & Engineering': '💻',
      'Health Sciences': '🏥',
      'Social Sciences': '👥',
      'Environmental Science': '🌍',
      'Education': '📚',
      'Economics': '📈',
      'Artificial Intelligence': '🤖',
      'Data Science': '📊',
      'Biotechnology': '🧬'
    }
    return fieldMap[field] || '🔬'
  }

  // Helper function to get icon for community category
  const getIconForCommunity = (category: string): string => {
    const categoryMap: Record<string, string> = {
      'Technology & Engineering': '💻',
      'Innovation': '💡',
      'Health & Medicine': '🏥',
      'Education': '📚',
      'Agriculture': '🌾',
      'Social Sciences': '👥',
      'Arts & Humanities': '🎨',
      'Business': '💼'
    }
    return categoryMap[category] || '👥'
  }

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
        
        const buttonElement = document.getElementById('googleSignInButton')
        if (buttonElement) {
          window.google.accounts.id.renderButton(buttonElement, {
            theme: 'outline',
            size: 'large',
            width: buttonElement.offsetWidth || 280,
            text: 'signin_with'
          })
        }

        const mobileButtonElement = document.getElementById('googleSignInButtonMobile')
        if (mobileButtonElement) {
          window.google.accounts.id.renderButton(mobileButtonElement, {
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
          toast.success(`Welcome ${result.user.first_name}! Login successful`)
        } catch (socketError) {
        } finally {
          setSocketInitializing(false)
        }
      }
      
      setIsMobileMenuOpen(false)
      const dashboardPath = result.user.account_type === 'admin' ? '/dashboard/admin' : '/dashboard/user'
      router.push(dashboardPath)
      
    } catch (err: any) {
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
    { label: 'Events', href: '/events', megaMenu: null },
  ]

  const getUserInitials = () => {
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase()
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return 'U'
  }

  const getRoleDisplayName = () => {
    if (user?.account_type === 'admin') return 'Admin'
    return 'Researcher'
  }

  // Determine if we're on a page that should have transparent header
  const isHomePage = pathname === '/'
  const headerBgClass = isHomePage && !isScrolled && !activeMegaMenu
    ? 'bg-transparent'
    : 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-200/50'

  const textColorClass = isHomePage && !isScrolled && !activeMegaMenu
    ? 'text-white'
    : 'text-gray-700'

  const hoverTextColorClass = isHomePage && !isScrolled && !activeMegaMenu
    ? 'hover:text-gray-200'
    : 'hover:text-[#0158B7]'

  return (
    <>
      <motion.header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${headerBgClass}`}
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
                  <Link
                    href={link.href}
                    className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-md flex items-center gap-1 ${textColorClass} ${hoverTextColorClass}`}
                  >
                    {link.label}
                    {link.megaMenu && (
                      <ChevronDown className={`w-3 h-3 transition-transform ${activeMegaMenu === link.megaMenu ? 'rotate-180' : ''}`} />
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href={user.account_type === 'admin' ? "/dashboard/admin" : "/dashboard/user"}
                    className={`text-sm font-medium transition-colors ${textColorClass} ${hoverTextColorClass}`}
                  >
                    Dashboard
                  </Link>
                  
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
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showUserMenu ? 'rotate-180' : ''} ${textColorClass}`} />
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50"
                        >
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
                  <div id="googleSignInButton" className="min-w-[120px]"></div>
                  <div className={`text-xs ${textColorClass} opacity-60`}>or</div>
                  <Link
                    href="/login"
                    className={`text-sm font-medium transition-colors ${textColorClass} ${hoverTextColorClass}`}
                  >
                    Sign In
                  </Link>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Link
                      href="/register"
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all shadow-md ${
                        isHomePage && !isScrolled && !activeMegaMenu
                          ? 'bg-white text-[#0158B7] hover:bg-gray-100'
                          : 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white hover:shadow-lg'
                      }`}
                    >
                      Get Started
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden p-2 rounded-md transition-colors ${textColorClass} ${
                isHomePage && !isScrolled && !activeMegaMenu 
                  ? 'hover:bg-white/10' 
                  : 'hover:bg-gray-100'
              }`}
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
                  <Link href="/research-projects" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border-l-2 border-transparent hover:border-[#0158B7]">
                    Research Projects
                  </Link>
                  <Link href="/communities" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border-l-2 border-transparent hover:border-[#0158B7]">
                    Communities
                  </Link>
                  <Link href="/events" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md border-l-2 border-transparent hover:border-[#0158B7]">
                    Events
                  </Link>
                  
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
                        <div className="px-3 mb-3">
                          <div id="googleSignInButtonMobile" className="w-full"></div>
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

      {/* Mega Menu - Research (Dynamic) */}
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
                {isLoadingCategories ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : researchCategories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {researchCategories.map((cat) => (
                      <Link
                        key={cat.name}
                        href={`/research-projects?field=${encodeURIComponent(cat.field)}`}
                        className="group flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-[#0158B7]/5 transition-all border border-gray-100"
                        onClick={() => setActiveMegaMenu(null)}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-800 group-hover:text-[#0158B7] truncate">{cat.name}</div>
                          <div className="text-[10px] text-gray-500">{cat.count} projects</div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-[#0158B7] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No research fields available yet
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                <Link href="/research-projects" className="text-xs text-[#0158B7] font-semibold flex items-center gap-1" onClick={() => setActiveMegaMenu(null)}>
                  Explore all research <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mega Menu - Communities (Dynamic) */}
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
                {isLoadingCategories ? (
                  <div className="grid grid-cols-2 gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : communitiesCategories.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {communitiesCategories.map((comm) => (
                      <Link
                        key={comm.id}
                        href={`/communities/${comm.slug || comm.id}`}
                        className="group flex items-center gap-2 p-2 rounded-lg bg-gray-50 hover:bg-[#0158B7]/5 transition-all border border-gray-100"
                        onClick={() => setActiveMegaMenu(null)}
                      >
                        <span className="text-xl">{comm.icon}</span>
                        <div className="flex-1">
                          <div className="text-xs font-semibold text-gray-800 group-hover:text-[#0158B7] truncate">{comm.name}</div>
                          <div className="text-[10px] text-gray-500">{comm.members.toLocaleString()} members</div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-[#0158B7] group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No communities available yet
                  </div>
                )}
              </div>
              <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                <Link href="/communities" className="text-xs text-[#0158B7] font-semibold flex items-center gap-1" onClick={() => setActiveMegaMenu(null)}>
                  Explore all communities <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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