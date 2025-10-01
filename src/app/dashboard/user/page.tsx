// @ts-nocheck
"use client"

import { useEffect, useState, useRef } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { fetchDashboardSummary } from "@/lib/features/auth/dashboardSlices"
import { fetchUserProfile } from "@/lib/features/auth/profileSlice"
import { fetchMyProjects } from "@/lib/features/auth/projectSlice"
import { fetchMyCommunities } from "@/lib/features/auth/communitiesSlice"
import { fetchInstitutionWorkTogether, type InstitutionWork } from "@/lib/features/auth/institutionWorktogetherSlices"
import DashboardStats from "@/components/dashboard/DashboardStats"
import QuickActions from "@/components/dashboard/QuickActions"
import ActivityFeed from "@/components/dashboard/ActivityFeed"
import ProfileCompletionBanner from "@/components/dashboard/ProfileCompletionBanner"
import OnboardingModal from "@/components/dashboard/OnboardingModal"
import { checkProfileCompletion } from "@/lib/utils/profileUtils"
import { Loader2, Search, Users, Building2, ArrowRight, ChevronRight, Sparkles, BookOpen, GraduationCap, Clock, Globe, Zap, TrendingUp, Award } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence, useInView } from "framer-motion"
import { useRouter } from "next/navigation"

// Add this component at the top of your file or import it
function AnimatedCounter({ end, suffix = "", duration = 2000 }: { end: number; suffix?: string; duration?: number }) {
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

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOutQuart * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame)
    }
  }, [inView, end, duration])

  return (
    <span ref={countRef} className="tabular-nums">
      {count}
      <span className="text-sm ml-0.5 opacity-80">{suffix}</span>
    </span>
  )
}

function SmartSearchSection() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [searchType, setSearchType] = useState<"projects" | "communities">("projects")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const searchData = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      setIsSearching(true)
      setShowResults(true)

      try {
        let results = []
        if (searchType === "projects") {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/projects/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
          const data = await response.json()
          results = data.data?.projects || []
        } else {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/communities/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
          const data = await response.json()
          results = data.data?.communities || []
        }
        setSearchResults(results)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchData, 500)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery, searchType])

  const handleResultClick = (id: string) => {
    router.push(`/dashboard/user/${searchType}/${id}`)
    setShowResults(false)
    setSearchQuery("")
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/30 rounded-xl border-2 border-[#0158B7]/20 p-5 mb-4 shadow-lg hover:shadow-xl transition-all duration-300"
      ref={searchRef}
      whileHover={{ borderColor: "rgba(1, 88, 183, 0.4)" }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_#0158B7_1px,transparent_1px)] bg-[length:20px_20px]" />
      </div>

      {/* Glowing orb effect */}
      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-10 -right-10 w-40 h-40 bg-[#0158B7] rounded-full blur-3xl opacity-10"
      />

      <div className="relative max-w-4xl mx-auto z-10">
        {/* Header with enhanced AI badge */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="p-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg shadow-md"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </motion.div>
          
          <h3 className="text-base font-bold text-gray-900">Smart Search</h3>
          
          <motion.span 
            animate={{
              scale: [1, 1.05, 1],
              opacity: [1, 0.9, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-xs bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white px-3 py-1 rounded-full font-semibold shadow-md"
          >
            AI-Powered
          </motion.span>
        </div>

        {/* Search Bar - Enhanced */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Dynamic Dropdown */}
          <div className="relative">
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as "projects" | "communities")}
              className="h-12 px-5 pr-12 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm font-medium appearance-none cursor-pointer shadow-sm hover:shadow-md transition-all duration-200"
            >
              <option value="projects" className="py-2">🔬 Research Projects</option>
              <option value="communities" className="py-2">👥 Communities</option>
            </select>
            <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0158B7] pointer-events-none" />
          </div>

          {/* Search Input - Enhanced with larger placeholder */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#0158B7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Find Best ${searchType === "projects" ? "Research Project" : "Community"}...`}
              className="w-full pl-12 pr-12 h-12 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-base placeholder:text-gray-400 placeholder:text-base placeholder:font-medium shadow-sm hover:shadow-md transition-all duration-200"
            />
            {isSearching && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-[#0158B7]" />
            )}
            
            {/* Floating label effect */}
            <motion.div 
              className="absolute -top-2 left-4 px-2 bg-white text-xs text-[#0158B7] font-medium"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: searchQuery ? 1 : 0, y: searchQuery ? 0 : 5 }}
              transition={{ duration: 0.2 }}
            >
              {searchType === "projects" ? "Searching projects..." : "Searching communities..."}
            </motion.div>
          </div>

          {/* Search Button - Enhanced */}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="h-12 px-8 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-base font-semibold shadow-md flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search
          </motion.button>
        </div>

        {/* Search Results Dropdown - Enhanced */}
        <AnimatePresence>
          {showResults && searchResults.length > 0 && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-2 w-full max-w-2xl bg-white rounded-xl shadow-2xl border-2 border-[#0158B7]/20 overflow-hidden"
            >
              <div className="p-2 max-h-96 overflow-y-auto">
                {searchResults.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => handleResultClick(item.id)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, backgroundColor: "#F3F4F6" }}
                    className="w-full flex items-start gap-4 p-4 hover:bg-gray-50 rounded-lg transition-all text-left border-b border-gray-100 last:border-0"
                  >
                    {searchType === "projects" ? (
                      <>
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate">{item.title}</h4>
                          <p className="text-sm text-gray-600 truncate">
                            by {item.author?.first_name} {item.author?.last_name} • {item.research_type}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">👁️ {item.view_count || 0} views</span>
                            <span className="flex items-center gap-1">❤️ {item.like_count || 0} likes</span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-lg">
                          <Users className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base font-semibold text-gray-900 truncate">{item.name}</h4>
                          <p className="text-sm text-gray-600 truncate">{item.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">👥 {item.member_count || 0} members</span>
                            <span className="flex items-center gap-1">📝 {item.post_count || 0} posts</span>
                          </div>
                        </div>
                      </>
                    )}
                    <ArrowRight className="w-5 h-5 text-[#0158B7] opacity-50 group-hover:opacity-100 transition-opacity" />
                  </motion.button>
                ))}
                
                {/* View all results link */}
                <div className="p-3 text-center border-t border-gray-100">
                  <button className="text-sm text-[#0158B7] font-semibold hover:underline">
                    View all results →
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features with enhanced styling */}
        <div className="flex flex-wrap items-center gap-6 mt-4">
          <motion.div 
            whileHover={{ scale: 1.05, x: 5 }}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm"
          >
            <Zap className="w-4 h-4 text-[#0158B7]" />
            <span className="font-medium">AI-powered relevance</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, x: 5 }}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm"
          >
            <Globe className="w-4 h-4 text-[#0158B7]" />
            <span className="font-medium">{searchType === "projects" ? "10k+ projects" : "500+ communities"}</span>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.05, x: 5 }}
            className="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm"
          >
            <Clock className="w-4 h-4 text-[#0158B7]" />
            <span className="font-medium">Instant results</span>
          </motion.div>
        </div>

        {/* Animated progress bar for typing */}
        {searchQuery.length > 0 && (
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] origin-left"
            style={{ borderRadius: "0 0 0.75rem 0.75rem" }}
          />
        )}
      </div>
    </motion.div>
  )
}

// ==================== TRUSTED INSTITUTIONS SECTION - ENHANCED ====================
function TrustedInstitutionsSection() {
  const dispatch = useAppDispatch()
  const { institutions, isLoading } = useAppSelector((state) => state.institutionWorktogether)
  const [duplicatedInstitutions, setDuplicatedInstitutions] = useState<InstitutionWork[]>([])
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    dispatch(fetchInstitutionWorkTogether())
  }, [dispatch])

  // Duplicate institutions for infinite scroll effect (3 times for seamless loop)
  useEffect(() => {
    if (institutions.length > 0) {
      setDuplicatedInstitutions([...institutions, ...institutions, ...institutions, ...institutions])
    }
  }, [institutions])

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-[#0158B7]/10 rounded-lg">
            <Building2 className="w-5 h-5 text-[#0158B7]" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Dushakashake Dushakire U Rwanda</h2>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </motion.div>
    )
  }

  if (institutions.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white via-white to-gray-50 rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-xl shadow-md">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Dushakashake Dushakire U Rwanda</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {institutions.length}+ partner institutions worldwide
            </p>
          </div>
        </div>

        {/* Speed control indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`} />
          <span className="text-xs text-gray-500">
            {isPaused ? 'Paused' : 'Live'}
          </span>
        </div>
      </div>

      {/* Infinite Scroll Container */}
      <div
        className="relative w-full overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Gradient overlays for fade effect - more subtle */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />

        <div
          className="flex gap-6"
          style={{
            animation: `scroll-infinite 25s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
            width: 'max-content',
            willChange: 'transform',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitFontSmoothing: 'antialiased'
          }}
        >
          {/* Render duplicated institutions for seamless loop */}
          {duplicatedInstitutions.map((inst, index) => (
            <Link
              key={`${inst.id}-${index}`}
              href={inst.website_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group block focus:outline-none"
            >
              <motion.div
                whileHover={{ scale: 1.02, y: -2 }}
                className="w-56 h-36 bg-gradient-to-br mb-2 from-gray-50 to-white border border-gray-200 rounded-xl flex flex-col items-center justify-center p-4 hover:border-[#0158B7] hover:shadow-lg transition-all duration-200"
              >
                {/* Logo Container */}
                <div className="relative mb-3">
                  {inst.logo_url ? (
                    <div className="relative">
                      <img
                        src={inst.logo_url}
                        alt={inst.name}
                        className="w-14 h-14 object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
                      />
                      {/* Subtle glow effect on hover */}
                      <div className="absolute inset-0 rounded-lg bg-[#0158B7]/10 opacity-0 group-hover:opacity-100 blur-md transition-opacity -z-10" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 bg-gradient-to-br from-[#0158B7]/10 to-[#5E96D2]/10 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                      <Building2 className="w-7 h-7 text-[#0158B7]" />
                    </div>
                  )}
                </div>

                {/* Institution Name - Enhanced display */}
                <div className="text-center w-full">
                  <span className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight group-hover:text-[#0158B7] transition-colors duration-200">
                    {inst.name}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="flex items-center justify-center gap-6 mt-5 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Globe className="w-3.5 h-3.5 text-[#0158B7]" />
          <span>Global Network</span>
        </div>
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Users className="w-3.5 h-3.5 text-[#0158B7]" />
          <span>{institutions.length}+ Partners</span>
        </div>
        <div className="w-1 h-1 bg-gray-300 rounded-full" />
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <TrendingUp className="w-3.5 h-3.5 text-[#0158B7]" />
          <span>Growing Daily</span>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== MAIN DASHBOARD PAGE ====================
export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const { user: authUser, isAuthenticated } = useAppSelector((state) => state.auth)
  const { profile: userProfile, isLoading: profileLoading } = useAppSelector((state) => state.profile)
  const { summary, isLoading: summaryLoading } = useAppSelector((state) => state.dashboard)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // ==================== FETCH ALL DASHBOARD DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !authUser) {
        return
      }

      try {
        await Promise.all([
          dispatch(fetchUserProfile()),
          dispatch(fetchDashboardSummary()),
          dispatch(fetchMyProjects()),
          dispatch(fetchMyCommunities()),
          dispatch(fetchInstitutionWorkTogether())
        ])

        setDataLoaded(true)
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error)
      }
    }

    fetchData()
  }, [authUser, isAuthenticated, dispatch])

  // ==================== HANDLE ONBOARDING ====================
  useEffect(() => {
    if (!dataLoaded || !userProfile) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('onboarding') === 'true') {
      const profileStatus = checkProfileCompletion(userProfile)
      if (profileStatus.completed) {
        setShowOnboarding(true)
      }
    }
  }, [dataLoaded, userProfile])

  // ==================== GET CURRENT USER ====================
  const user = userProfile || authUser

  // ==================== LOADING STATE ====================
  if (!user || profileLoading || summaryLoading || !dataLoaded) {
    return (
      <div className="space-y-3 pb-3">
        <div className="animate-pulse">
          <div className="bg-gray-300 rounded-xl p-3 h-16 mb-3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl p-3 h-20"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-gray-200 rounded-xl p-3 h-40"></div>
            <div className="bg-gray-200 rounded-xl p-3 h-40"></div>
          </div>
        </div>
      </div>
    )
  }

  const profileStatus = checkProfileCompletion(user)

  // ==================== RENDER DASHBOARD ====================
  return (
    <div className="space-y-3 max-w-[1400px] mx-auto pb-3 px-8">
      {/* Profile Completion Banner */}
      {!profileStatus.completed && (
        <ProfileCompletionBanner
          percentage={profileStatus.percentage}
          missing={profileStatus.missing}
        />
      )}

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-gradient-to-r from-[#0158B7] to-[#5E96D2] border border-[#0158B7] rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-500"
      >
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_white_2px,transparent_2px)] bg-[length:30px_30px]" />
        </div>

        {/* Floating particles - simplified for height efficiency */}
        <motion.div
          animate={{
            y: [0, -20, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="absolute top-5 left-1/4 w-1 h-1 bg-white/40 rounded-full blur-[1px]"
        />
        <motion.div
          animate={{
            y: [0, -25, 0],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            delay: 1,
          }}
          className="absolute top-10 right-1/3 w-1.5 h-1.5 bg-white/50 rounded-full blur-[1px]"
        />

        {/* Glowing orb effect - simplified */}
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
          }}
          className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl"
        />

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <div className="relative flex items-center justify-between gap-4 z-10 min-h-[80px]">
          {/* Left Side - 1 & 2 Combined - Horizontal layout */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* 1. Rwanda's unique research platform - Fixed */}
            <div className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl font-bold text-white whitespace-nowrap">
                Rwanda's unique research platform
              </h1>
              <div className="h-0.5 w-16 bg-yellow-400 rounded-full mt-1"></div>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-white/30"></div>

            {/* 2. All in One, Become a Star - Moving */}
            <motion.div
              animate={{
                x: [0, 10, -10, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="flex-shrink-0"
            >
              <h2 className="text-lg md:text-xl font-black bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg whitespace-nowrap">
                All in One, Become a Star
              </h2>
            </motion.div>
          </div>

          {/* Right Side - User Info Card - Compact horizontal layout */}
          <motion.div
            className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20 flex-shrink-0"
            whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.15)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {user.profile_picture_url ? (
                <img
                  src={user.profile_picture_url}
                  alt={user.first_name}
                  className="w-8 h-8 rounded-full border-2 border-white relative z-10"
                />
              ) : (
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-white text-[#0158B7] flex items-center justify-center font-bold text-sm relative z-10">
                    {user.first_name?.[0]}
                  </div>
                </div>
              )}
              {/* Online indicator */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"
              />
            </div>

            {/* User Info - Compact */}
            <div className="flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold whitespace-nowrap">
                  Welcome back, {user.first_name}!
                </span>
                <span className="text-[10px] bg-yellow-400 text-[#0158B7] px-1.5 py-0.5 rounded-full font-semibold">
                  {user.account_type}
                </span>
              </div>
              <p className="text-xs text-blue-100 truncate max-w-[150px]">
                {user.profile?.institution_name || 'Oncg global ltd'}
              </p>
            </div>

            {/* Stats - Horizontal compact */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/20">
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">
                  <AnimatedCounter end={summary?.projects.total || 0} suffix="" duration={2000} />
                </span>
                <span className="text-[12px] font-semibold text-blue-200">Projects</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-bold">
                  <AnimatedCounter end={summary?.communities.total || 0} suffix="" duration={2000} />
                </span>
                <span className="text-[12px] font-semibold text-blue-200">Communities</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements - Simplified */}
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-5 -left-5 w-20 h-20 border border-white/10 rounded-full"
        />
        <motion.div
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -top-5 -right-5 w-20 h-20 border border-white/10 rounded-full"
        />
      </motion.div>

      {/* Smart Search Section */}
      <SmartSearchSection />
      {/* Trusted Institutions Section */}
      <TrustedInstitutionsSection />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-white via-white to-gray-50 rounded-xl border border-gray-200 py-6 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <DashboardStats accountType={user.account_type} summary={summary ?? undefined} />
      </motion.div>



      {/* Quick Actions */}
      <QuickActions accountType={user.account_type} />

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ActivityFeed recentActivity={summary?.recentActivity} compact={true} />
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal
          onClose={() => setShowOnboarding(false)}
          accountType={user.account_type}
        />
      )}

      <style jsx>{`
        @keyframes slide-smooth {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(20px); }
          75% { transform: translateX(-20px); }
        }
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes scroll-infinite {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-50%));
          }
        }
        .animate-slide-smooth { 
          animation: slide-smooth 4s ease-in-out infinite; 
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar { 
          display: none; 
        }
        
        /* Hardware acceleration for smoother animation */
        .group {
          -webkit-transform: translateZ(0);
          -moz-transform: translateZ(0);
          -ms-transform: translateZ(0);
          -o-transform: translateZ(0);
          transform: translateZ(0);
        }
      `}</style>
    </div>
  )
}