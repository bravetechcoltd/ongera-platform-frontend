// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Search, Upload, Users, Calendar, TrendingUp, Award,
  BookOpen, MessageSquare, ChevronDown, ChevronRight, Star,
  CheckCircle, Globe, ArrowRight, Play, Eye, ThumbsUp,
  MapPin, Clock, User, FileText, Send, Mail, Loader2, Video
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/features/auth/auth-slice'
import { fetchHomePageSummary, fetchHomePageContent, fetchLatestUpcomingEvents } from '@/lib/features/auth/homePageSlice'
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import Image from 'next/image'


function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    window.location.href = '/'
  }

  const navLinks = [
    { label: 'Research', href: '#research' },
    { label: 'Communities', href: '#communities' },
    { label: 'Events', href: '#events' },
    { label: 'Q&A Forum', href: '#qa' },
    { label: 'About', href: '#about' }
  ]

  // Text color logic - always ensure good contrast
  const textColor = isScrolled ? 'text-gray-700' : 'text-white'
  const hoverColor = isScrolled ? 'hover:text-[#0158B7]' : 'hover:text-gray-200'

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
<div className="flex items-center space-x-3">
  <Link href="/" className="flex items-center space-x-3 group">
    <div className="w-[120px] h-13 rounded-xl flex items-center justify-center overflow-hidden bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 transition-all duration-300">
      <Image
        src="/ongeraLogo.png"
        alt="Ongera logo"
        width={64}
        height={64}
        priority
        className="object-contain  w-[120px]"
      />
    </div>

  </Link>
</div>


          {/* Desktop Navigation - Enhanced Text Colors */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth Section - Enhanced Text Colors */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  href="/dashboard" 
                  className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}
                >
                  Dashboard
                </Link>
                <button 
                  onClick={handleLogout}
                  className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}
                >
                  Logout
                </button>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isScrolled 
                    ? 'bg-gradient-to-br from-[#0158B7] to-[#0362C3] text-white' 
                    : 'bg-white/20 text-white backdrop-blur-sm'
                }`}>
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}
                >
                  Sign In
                </Link>
                <Link 
                  href="/register"
                  className={`px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all ${
                    isScrolled
                      ? 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white'
                      : 'bg-white text-[#0158B7] hover:bg-gray-100'
                  }`}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'hover:bg-gray-100' : 'hover:bg-white/10'
            } ${textColor}`}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu - Enhanced with consistent styling */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-t ${
                isScrolled ? 'border-gray-200 bg-white' : 'border-white/20 bg-black/20 backdrop-blur-md'
              }`}
            >
              <nav className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                      isScrolled 
                        ? 'text-gray-700 hover:bg-gray-50' 
                        : 'text-white hover:bg-white/10'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="px-4 pt-4 space-y-2 border-t border-gray-200/50">
                  {isAuthenticated ? (
                    <>
                      <Link 
                        href="/dashboard" 
                        className={`block w-full text-sm font-medium py-2 text-left transition-colors ${
                          isScrolled ? 'text-gray-700' : 'text-white'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button 
                        onClick={() => {
                          handleLogout()
                          setIsMobileMenuOpen(false)
                        }}
                        className={`block w-full text-sm font-medium py-2 text-left transition-colors ${
                          isScrolled ? 'text-gray-700' : 'text-white'
                        }`}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className={`block w-full text-sm font-medium py-2 text-left transition-colors ${
                          isScrolled ? 'text-gray-700' : 'text-white'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/register"
                        className={`block w-full px-4 py-2 rounded-lg text-sm font-medium text-center transition-all ${
                          isScrolled
                            ? 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white'
                            : 'bg-white text-[#0158B7] hover:bg-gray-100'
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

function AnimatedCounter({ end, suffix = "" }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 2000
    const increment = end / (duration / 16)
    
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)

    return () => clearInterval(timer)
  }, [end])

  return <span>{count.toLocaleString()}{suffix}</span>
}

function HeroSection({ summary, isLoading }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  const stats = [
    { value: summary?.projectsCount || 0, label: 'Projects', suffix: '+' },
    { value: summary?.researchersCount || 0, label: 'Researchers', suffix: '+' },
    { value: summary?.communitiesCount || 0, label: 'Communities', suffix: '+' },
    { value: summary?.eventsCount || 0, label: 'Events', suffix: '+' }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0158B7] to-[#0362C3]" />
      
      <div className="absolute inset-0 opacity-10">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.3, 1, 0.3]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Empowering Rwanda's<br />Research Community
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
            Connect • Collaborate • Contribute to knowledge that shapes Rwanda's future
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href={isAuthenticated ? "/dashboard" : "/register"} className="bg-white text-[#0158B7] font-bold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              {isAuthenticated ? "Go to Dashboard" : "Start Sharing Research"}
            </Link>
            <Link href={isAuthenticated ? "/dashboard/user/communities" : "#communities"} className="border-2 border-white text-white font-bold py-4 px-8 rounded-full hover:bg-white hover:text-[#0158B7] transition-all duration-300">
              Explore Communities
            </Link>
          </div>

          {isLoading ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
                  className="bg-[#5E96D2] rounded-lg p-4"
                >
                  <div className="text-2xl md:text-3xl font-bold">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-sm text-gray-100">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <ChevronDown className="w-8 h-8 animate-bounce" />
        </motion.div>
      </div>
    </section>
  )
}

// Trust Indicators
function TrustBar() {
  const indicators = [
    { icon: CheckCircle, text: 'University Partnerships' },
    { icon: CheckCircle, text: 'Secure & Private' },
    { icon: CheckCircle, text: 'Government Supported' },
    { icon: CheckCircle, text: 'Free for Researchers' }
  ]

  return (
    <section className="bg-[#F8F9FA] py-4 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          {indicators.map((item, i) => (
            <div key={i} className="flex items-center space-x-2">
              <item.icon className="w-4 h-4 text-[#0362C3]" />
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Grid
function FeaturesGrid() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  const features = [
    {
      icon: Upload,
      title: 'Share Research',
      desc: 'Publish projects, papers, datasets with DOI integration',
      link: isAuthenticated ? '/dashboard/user/research' : '/login',
      linkText: isAuthenticated ? 'Upload Now' : 'Sign In to Upload',
      color: 'from-[#0158B7] to-[#0362C3]'
    },
    {
      icon: Users,
      title: 'Join Communities',
      desc: '50+ interest-based groups from Health to AI',
      link: isAuthenticated ? '/dashboard/user/communities' : '/login',
      linkText: isAuthenticated ? 'Browse Communities' : 'Sign In to Join',
      color: 'from-[#0362C3] to-[#5E96D2]'
    },
    {
      icon: Calendar,
      title: 'Attend Events',
      desc: 'Webinars, conferences, workshops - online & in-person',
      link: isAuthenticated ? '/dashboard/user/events' : '/login',
      linkText: isAuthenticated ? 'View Events' : 'Sign In to View',
      color: 'from-[#5E96D2] to-[#8DB6E1]'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F3A] mb-4">
            Complete Research Platform
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to share knowledge, collaborate, and advance research in Rwanda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="bg-gradient-to-br from-[#F8F9FA] to-white rounded-xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-full flex items-center justify-center mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#1A1F3A] mb-3">{feature.title}</h3>
              <p className="text-gray-600 mb-6">{feature.desc}</p>
              <Link href={feature.link} className="text-[#0158B7] font-semibold hover:text-[#0362C3] transition-colors flex items-center group">
                {feature.linkText}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Featured Research
function ResearchShowcase({ projects, isLoadingContent }) {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const [activeFilter, setActiveFilter] = useState('All')
  
  // Extract unique categories from projects
  const uniqueCategories = ['All', ...new Set(projects.map(p => p.field_of_study).filter(Boolean))]
  const filters = uniqueCategories.slice(0, 5) // Show only first 5 categories

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Filter projects based on selected category
  const filteredProjects = activeFilter === 'All' 
    ? projects 
    : projects.filter(p => p.field_of_study === activeFilter)

  return (
    <section id="research" className="py-20 bg-gradient-to-br from-[#F8F9FA] to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F3A] mb-4">
            Latest Research from Our Community
          </h2>
          <p className="text-lg text-gray-600">
            Discover cutting-edge research shaping Rwanda's future
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                activeFilter === filter
                  ? 'bg-[#0158B7] text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {isLoadingContent ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No research projects available yet</p>
            {isAuthenticated && (
              <Link href="/dashboard/user/research" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                <Upload className="w-5 h-5" />
                Share Your Research
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredProjects.slice(0, 3).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                onClick={() => router.push(isAuthenticated ? `/dashboard/user/research/${item.id}` : '/login')}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="h-40 bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center text-6xl">
                  {item.cover_image_url ? (
                    <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-16 h-16 text-white" />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-[#1A1F3A] mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="text-sm text-gray-600 mb-4">
                    <div className="flex items-center mb-1">
                      <User className="w-4 h-4 mr-2" />
                      {item.author?.first_name} {item.author?.last_name}
                    </div>
                    {item.author?.profile?.institution_name && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        {item.author.profile.institution_name}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags?.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-[#0158B7] text-white text-xs rounded-full"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {item.view_count || 0}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {item.like_count || 0}
                      </span>
                    </div>
                    <button className="text-[#0158B7] font-semibold hover:text-[#0362C3] transition-colors">
                      Read More →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View More Link */}
        {filteredProjects.length > 3 && (
          <div className="text-center mt-8">
            <Link 
              href={isAuthenticated ? "/dashboard/user/research" : "/login"} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:bg-[#0362C3] transition-all"
            >
              {isAuthenticated ? `View All ${filteredProjects.length} Projects` : 'Sign In to View More'}
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

// Community Highlights
function CommunityHighlights({ communities, isLoadingContent }) {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <section id="communities" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F3A] mb-4">
            Active Communities
          </h2>
          <p className="text-lg text-gray-600">
            Join vibrant groups of researchers sharing your interests
          </p>
        </div>

        {isLoadingContent ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No communities available yet</p>
            {isAuthenticated && (
              <Link href="/dashboard/user/communities" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                <Users className="w-5 h-5" />
                Create Community
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.slice(0, 3).map((community, i) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                onClick={() => router.push(isAuthenticated ? `/dashboard/user/communities/${community.id}` : '/login')}
                className="bg-gradient-to-br from-[#F8F9FA] to-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1F3A] mb-2 text-center line-clamp-2">
                  {community.name}
                </h3>
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-[#0158B7] mb-1">
                    {community.member_count}
                  </div>
                  <div className="text-sm text-gray-600">Members</div>
                </div>
                <div className="text-xs text-gray-500 mb-4 text-center">
                  {community.post_count} posts
                </div>
                <button className="w-full bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                  {isAuthenticated ? 'View Community' : 'Sign In to Join'}
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function EventsPreview() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { latestUpcomingEvents, isLoadingUpcomingEvents } = useSelector(
    (state: RootState) => state.homepage
  )

  // Fetch latest upcoming events on component mount
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

  const featuredEvent = latestUpcomingEvents[0]
  const upcomingEvents = latestUpcomingEvents.slice(1, 3)

  return (
    <section id="events" className="py-20 bg-gradient-to-br from-[#F8F9FA] to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F3A] mb-4">
            Upcoming Events
          </h2>
          <p className="text-lg text-gray-600">
            Connect with researchers through conferences and workshops
          </p>
        </div>

        {isLoadingUpcomingEvents ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          </div>
        ) : latestUpcomingEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">No upcoming events</p>
            {isAuthenticated && (
              <Link href="/dashboard/user/events" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                <Calendar className="w-5 h-5" />
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Featured Event Card */}
            {featuredEvent && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                onClick={() => router.push(isAuthenticated ? `/dashboard/user/event/${featuredEvent.id}` : '/login')}
                className="bg-white rounded-xl shadow-xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all"
              >
                <div className="h-48 bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center">
                  {featuredEvent.cover_image_url ? (
                    <img src={featuredEvent.cover_image_url} alt={featuredEvent.title} className="w-full h-full object-cover" />
                  ) : (
                    <Calendar className="w-24 h-24 text-white opacity-20" />
                  )}
                </div>
                <div className="p-8">
                  <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white text-xs font-bold rounded-full mb-4">
                    FEATURED EVENT
                  </span>
                  <h3 className="text-2xl font-bold text-[#1A1F3A] mb-4 line-clamp-2">
                    {featuredEvent.title}
                  </h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-gray-600">
                      <Calendar className="w-5 h-5 mr-3 text-[#0158B7]" />
                      {formatEventDate(featuredEvent.start_datetime)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="w-5 h-5 mr-3 text-[#0158B7]" />
                      {formatEventTime(featuredEvent.start_datetime)} - {formatEventTime(featuredEvent.end_datetime)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <User className="w-5 h-5 mr-3 text-[#0158B7]" />
                      {featuredEvent.organizer?.first_name} {featuredEvent.organizer?.last_name}
                    </div>
                    {featuredEvent.event_mode === 'Physical' && featuredEvent.location_address && (
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-5 h-5 mr-3 text-[#0158B7]" />
                        {featuredEvent.location_address}
                      </div>
                    )}
                    {featuredEvent.event_mode === 'Online' && (
                      <div className="flex items-center text-gray-600">
                        <Video className="w-5 h-5 mr-3 text-[#0158B7]" />
                        Online Event
                      </div>
                    )}
                    {featuredEvent.event_mode === 'Hybrid' && (
                      <div className="flex items-center text-gray-600">
                        <Globe className="w-5 h-5 mr-3 text-[#0158B7]" />
                        Hybrid Event
                      </div>
                    )}
                  </div>
                  <button className="w-full bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all">
                    {isAuthenticated ? 'Register Now' : 'Sign In to Register'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Upcoming Events List */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => router.push(isAuthenticated ? `/dashboard/user/event/${event.id}` : '/login')}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-[#1A1F3A] mb-2 line-clamp-2">
                          {event.title}
                        </h4>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatEventDate(event.start_datetime)}
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                            event.event_mode === 'Online'
                              ? 'bg-[#8DB6E1] text-[#0158B7]'
                              : event.event_mode === 'Physical'
                              ? 'bg-[#5E96D2] text-white'
                              : 'bg-[#0362C3] text-white'
                          }`}>
                            {event.event_mode}
                          </span>
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-gray-100 text-gray-700">
                            {event.event_type}
                          </span>
                        </div>
                        {event.organizer && (
                          <div className="flex items-center text-xs text-gray-500">
                            <User className="w-3 h-3 mr-1" />
                            {event.organizer.first_name} {event.organizer.last_name}
                          </div>
                        )}
                      </div>
                      <button className="text-[#0158B7] hover:text-[#0362C3] transition-colors">
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                ))
              ) : featuredEvent && (
                <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                  <p className="text-gray-600 mb-4">Only one upcoming event available</p>
                  <Link 
                    href={isAuthenticated ? "/dashboard/user/events" : "/login"} 
                    className="inline-flex items-center gap-2 text-[#0158B7] hover:text-[#0362C3] font-semibold"
                  >
                    View All Events
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
              
              {/* View More Button */}
              {latestUpcomingEvents.length > 0 && (
                <div className="bg-gradient-to-br from-[#F8F9FA] to-white rounded-xl p-6 shadow-lg text-center border border-gray-100">
                  <p className="text-gray-600 mb-4 font-medium">
                    Discover more events happening in the community
                  </p>
                  <Link 
                    href={isAuthenticated ? "/dashboard/user/events" : "/login"} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    {isAuthenticated ? 'View All Events' : 'Sign In to View All'}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </section>
  )
}

// Impact Statistics
function ImpactStats({ summary, isLoading }) {
  const stats = [
    { icon: FileText, value: summary?.projectsCount || 0, label: 'Research Projects', suffix: '+' },
    { icon: Users, value: summary?.researchersCount || 0, label: 'Active Researchers', suffix: '+' },
    { icon: Users, value: summary?.communitiesCount || 0, label: 'Communities Created', suffix: '+' },
    { icon: Calendar, value: summary?.eventsCount || 0, label: 'Events Hosted', suffix: '+' }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-[#0158B7] to-[#0362C3] text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Platform Impact
          </h2>
          <p className="text-xl text-gray-100">
            Growing Rwanda's research ecosystem together
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <stat.icon className="w-12 h-12 mx-auto mb-4 opacity-80" />
                <div className="text-4xl md:text-5xl font-bold mb-2">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-lg text-gray-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// How It Works
function HowItWorks() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  
  const steps = [
    { icon: User, title: 'Create Profile', desc: 'Set up your researcher profile' },
    { icon: Upload, title: 'Share Research', desc: 'Upload your projects and papers' },
    { icon: Users, title: 'Join Communities', desc: 'Connect with peers' },
    { icon: TrendingUp, title: 'Collaborate & Grow', desc: 'Advance knowledge together' }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F3A] mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-600">
            Get started in four simple steps
          </p>
        </div>

        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#0158B7] to-[#0362C3] transform -translate-y-1/2" />
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-full flex items-center justify-center shadow-lg">
                    <step.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#0158B7] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#1A1F3A] mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Link href={isAuthenticated ? "/dashboard" : "/register"} className="bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white px-8 py-4 rounded-full font-bold hover:shadow-xl transition-all transform hover:scale-105">
            {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
          </Link>
        </div>
      </div>
    </section>
  )
}

// Testimonials
function Testimonials() {
  const testimonials = [
    {
      quote: "Ongera has transformed how I collaborate with fellow researchers. The platform makes sharing knowledge seamless.",
      name: "Dr. Alice Mukamana",
      title: "Health Researcher",
      institution: "University of Rwanda",
      rating: 5
    },
    {
      quote: "Finally, a platform built for African researchers. The community support has been invaluable for my work.",
      name: "Prof. Jean Nsengimana",
      title: "Computer Science",
      institution: "Carnegie Mellon - Africa",
      rating: 5
    },
    {
      quote: "The diaspora network helped me connect with researchers back home. Ongera bridges the gap beautifully.",
      name: "Dr. Emmanuel Kayitare",
      title: "Environmental Scientist",
      institution: "Diaspora Scholar",
      rating: 5
    }
  ]

  return (
    <section className="py-20 bg-gradient-to-br from-[#F8F9FA] to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F3A] mb-4">
            What Researchers Say
          </h2>
          <p className="text-lg text-gray-600">
            Join thousands of satisfied researchers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex mb-4">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 text-[#0362C3] fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-full flex items-center justify-center text-white font-bold text-lg mr-4">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#1A1F3A]">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                  <div className="text-xs text-gray-500">{testimonial.institution}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Newsletter CTA
function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Handle newsletter subscription
    setTimeout(() => {
      alert('Thank you for subscribing!')
      setEmail('')
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <section className="py-20 bg-gradient-to-r from-[#0158B7] to-[#0362C3]">
      <div className="max-w-4xl mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated on Rwanda's Research
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Weekly digest of new projects, events, and opportunities
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-6 py-4 rounded-full text-gray-900 focus:outline-none focus:ring-4 focus:ring-white/50"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#1A1F3A] text-white px-8 py-4 rounded-full font-bold hover:bg-[#0158B7] transition-all transform hover:scale-105 flex items-center justify-center disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Subscribe
                </>
              )}
            </button>
          </form>

          <p className="text-sm text-white/80">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </motion.div>
      </div>
    </section>
  )
}

// Footer
function Footer() {
  const footerSections = [
    {
      title: 'Platform',
      links: ['Research', 'Communities', 'Events', 'Q&A Forum']
    },
    {
      title: 'Resources',
      links: ['How It Works', 'FAQs', 'Guidelines', 'Contact Support']
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Community Standards']
    }
  ]

  return (
    <footer className="bg-[#1A1F3A] text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Ongera</h1>
                <p className="text-xs text-gray-400">Research Community</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Empowering Rwanda's research community through collaboration and knowledge sharing.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Globe className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {footerSections.map((section, i) => (
            <div key={i}>
              <h4 className="font-bold mb-4 text-lg">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 Ongera Platform. All rights reserved. Built with passion for Rwanda's research community.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default function OngeraHomePage() {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    summary, 
    featuredProjects, 
    featuredCommunities, 
    isLoading, 
    isLoadingContent,
  } = useSelector((state: RootState) => state.homepage)

  useEffect(() => {
    // Fetch all data on mount
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