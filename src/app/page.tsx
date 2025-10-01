
// @ts-nocheck
"use client"
import api from "@/lib/api"
import React, { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Upload, Users, Calendar, TrendingUp, Award,
  BookOpen, MessageSquare, ChevronDown, ChevronRight, Star,
  CheckCircle, Globe, ArrowRight, Eye, ThumbsUp,
  MapPin, Clock, User, FileText, Send, Mail, Loader2, Video,
  Shield
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/lib/features/auth/auth-slice'
import { fetchHomePageSummary, fetchHomePageContent, fetchLatestUpcomingEvents } from '@/lib/features/auth/homePageSlice'
import { useDispatch, useSelector } from "react-redux"
import type { AppDispatch, RootState } from "@/lib/store"
import Image from 'next/image'

// Skeleton Loader Components
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
    <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-white/20">
      <SkeletonLoader className="h-32 mb-3" />
      <SkeletonLoader className="h-5 mb-2 w-3/4" />
      <SkeletonLoader className="h-3 mb-2 w-full" />
      <SkeletonLoader className="h-3 w-2/3" />
    </div>
  )
}

// Floating Particles Background
function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5
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
            height: particle.size
          }}
          animate={{
            y: [-20, -100],
            opacity: [0, 1, 1, 0],
            scale: [1, 1.5, 1]
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

  ]

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-500`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      style={{
        background: isScrolled
          ? '#ffffff'
          : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        borderBottom: isScrolled ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
        boxShadow: isScrolled ? '0 10px 40px rgba(0, 0, 0, 0.1)' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center group mt-3">
            <motion.div
              className="w-[160px] h-16 rounded-xl flex items-center justify-center overflow-hidden border-2 border-white/30 bg-white/5 backdrop-blur-sm mb-3"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.6)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/ongeraLogo.png"
                alt="Ongera logo"
                width={160}
                height={62}
                priority
                className="object-contain"
              />
            </motion.div>
          </Link>

          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                className={`text-md font-medium transition-colors relative ${isScrolled ? 'text-gray-700' : 'text-white'
                  }`}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {link.label}
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${isScrolled ? 'bg-[#0158B7]' : 'bg-white'
                    }`}
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.a>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-md font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#0158B7]' : 'text-white hover:text-gray-200'
                    }`}
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className={`text-sm font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#0158B7]' : 'text-white hover:text-gray-200'
                    }`}
                >
                  Logout
                </button>
                <motion.div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isScrolled
                    ? 'bg-gradient-to-br from-[#0158B7] to-[#0362C3] text-white'
                    : 'bg-white/20 text-white backdrop-blur-sm'
                    }`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </motion.div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-md font-medium transition-colors ${isScrolled ? 'text-gray-700 hover:text-[#0158B7]' : 'text-white hover:text-gray-200'
                    }`}
                >
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/register"
                    className={`px-4 py-2 rounded-full text-md font-medium transition-all shadow-lg ${isScrolled
                      ? 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white hover:shadow-xl'
                      : 'bg-white text-[#0158B7] hover:bg-gray-100'
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
            className={`md:hidden p-2 rounded-lg transition-colors ${isScrolled ? 'hover:bg-gray-100 text-gray-700' : 'hover:bg-white/10 text-white'
              }`}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`md:hidden border-t ${isScrolled ? 'border-gray-200 bg-white' : 'border-white/20 bg-black/20 backdrop-blur-md'
                }`}
            >
              <nav className="py-3 space-y-1">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={`block px-3 py-2 text-sm font-medium transition-colors rounded-lg ${isScrolled ? 'text-gray-700 hover:bg-gray-50' : 'text-white hover:bg-white/10'
                      }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
                <div className="px-3 pt-3 space-y-1 border-t border-gray-200/50">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        className={`block w-full text-sm font-medium py-2 text-left ${isScrolled ? 'text-gray-700' : 'text-white'
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
                        className={`block w-full text-sm font-medium py-2 text-left ${isScrolled ? 'text-gray-700' : 'text-white'
                          }`}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        className={`block w-full text-sm font-medium py-2 text-left ${isScrolled ? 'text-gray-700' : 'text-white'
                          }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        className={`block w-full px-3 py-2 rounded-lg text-sm font-medium text-center ${isScrolled
                          ? 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white'
                          : 'bg-white text-[#0158B7]'
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

    </motion.header>
  )
}
// Animated Counter
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
    const nextSection = document.getElementById('trust-bar')
    nextSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const scrollToBottom = () => {
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
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

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden pt-16">
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

      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center text-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Animated Headline with Text Cycling */}
          <div className="text-3xl md:text-5xl font-bold mb-4 leading-tight min-h-[6rem] md:min-h-[7rem] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentTextIndex}
                initial={{ opacity: 0, y: 50, rotateX: -90 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -50, rotateX: 90 }}
                transition={{
                  duration: 0.6,
                  ease: "easeInOut"
                }}
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
            className="text-lg md:text-xl mb-6 text-gray-100 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Connect • Collaborate • Contribute to knowledge that shapes Rwanda's future
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
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

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {[...Array(4)].map((_, i) => (
                <SkeletonLoader key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.05 }}
                  className="bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20"
                >
                  <div className="text-xl md:text-2xl font-bold">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-xs text-gray-100">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Center: Animated scroll-down chevron */}
        <motion.button
          onClick={scrollToNextSection}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer group"
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <ChevronDown className="w-6 h-6 text-white group-hover:text-white/80 transition-colors" />
          </motion.div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Scroll to explore
          </div>
        </motion.button>

        {/* NEW: Right Bottom Animated Scroll-Down Chevron - 20px under section */}
        <motion.button
          onClick={scrollToBottom}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7 }}
          className="absolute -bottom-5 right-8 cursor-pointer group bg-white/10 backdrop-blur-sm border border-white/30 rounded-full p-3 hover:bg-white/20 transition-all"

          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            className="relative"
            animate={{
              y: [0, 8, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }}
          >
            <ChevronDown className="w-6 h-6 text-white group-hover:text-white/80 transition-colors" />
          </motion.div>
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-white/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Scroll down
          </div>
        </motion.button>

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
// Trust Bar
function TrustBar() {
  const indicators = [
    { icon: CheckCircle, text: 'University Partnerships' },
    { icon: CheckCircle, text: 'Secure & Private' },
    { icon: CheckCircle, text: 'Government Supported' },
    { icon: CheckCircle, text: 'Free for Researchers' }
  ]

  return (
    <section className="bg-[#F8F9FA] py-2 border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-gray-600">
          {indicators.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center space-x-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <item.icon className="w-3 h-3 text-[#0362C3]" />
              <span>{item.text}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Features Grid with 3D Cards
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
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1F3A] mb-2">
            Complete Research Platform
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-sm">
            Everything you need to share knowledge, collaborate, and advance research in Rwanda
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <TiltCard key={i} delay={i * 0.15}>
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-3`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[#1A1F3A] mb-2">{feature.title}</h3>
              <p className="text-gray-600 mb-3 text-xs">{feature.desc}</p>
              <Link
                href={feature.link}
                className="text-[#0158B7] font-semibold hover:text-[#0362C3] transition-colors flex items-center group text-xs"
              >
                {feature.linkText}
                <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </TiltCard>
          ))}
        </div>
      </div>
    </section>
  )
}

// 3D Tilt Card Component
function TiltCard({ children, delay = 0 }) {
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
    setRotateY(((x - centerX) / centerX) * 10)
    setRotateX(((centerY - y) / centerY) * 10)
  }

  const handleMouseLeave = () => {
    setRotateX(0)
    setRotateY(0)
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      viewport={{ once: true }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transition: 'transform 0.1s ease-out'
      }}
      className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg hover:shadow-xl border border-gray-100 cursor-pointer"
    >
      {children}
    </motion.div>
  )
}

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

  const filteredProjects = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.field_of_study === activeFilter)

  return (
    <section id="research" className="py-12 bg-gradient-to-br from-[#F8F9FA] to-white relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1F3A] mb-2">
            Latest Research from Our Community
          </h2>
          <p className="text-gray-600 text-sm">
            Discover cutting-edge research shaping Rwanda's future
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {filters.map((filter) => (
            <motion.button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-full font-medium transition-all text-xs ${activeFilter === filter
                ? 'bg-[#0158B7] text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
            >
              {filter}
            </motion.button>
          ))}
        </div>

        {isLoadingContent ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-3 text-sm">No research projects available yet</p>
            {isAuthenticated && (
              <Link
                href="/dashboard/user/research"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                <Upload className="w-4 h-4" />
                Share Your Research
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredProjects.slice(0, 3).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                onClick={() => router.push(`/research-projects/${item.id}`)}
                className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100"
              >
                <div className="h-28 bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center">
                  {item.cover_image_url ? (
                    <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <FileText className="w-12 h-12 text-white opacity-50" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-bold text-[#1A1F3A] mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="text-xs text-gray-600 mb-2 space-y-1">
                    <div className="flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {item.author?.first_name} {item.author?.last_name}
                    </div>
                    {item.author?.profile?.institution_name && (
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {item.author.profile.institution_name}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {item.tags?.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-[#0158B7]/10 text-[#0158B7] text-xs rounded-full font-medium"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Eye className="w-3 h-3 mr-0.5" />
                        {item.view_count || 0}
                      </span>
                      <span className="flex items-center">
                        <ThumbsUp className="w-3 h-3 mr-0.5" />
                        {item.like_count || 0}
                      </span>
                    </div>
                    <button className="text-[#0158B7] font-semibold hover:text-[#0362C3] transition-colors text-xs">
                      Read More →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Updated View More Button - Always shows when there are projects */}
        {filteredProjects.length > 0 && (
          <div className="text-center mt-6">
            <Link
              href="/research-projects"
              className="inline-flex items-center gap-1 px-4 py-2 bg-[#0158B7] text-white rounded-lg font-semibold hover:bg-[#0362C3] transition-all text-sm"
            >
              Explore More Research Projects
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Wave Divider */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 Q360,100 720,50 T1440,50 L1440,60 L0,60 Z"
          fill="white"
        />
      </svg>
    </section>
  )
}

function CommunityHighlights({ communities, isLoadingContent }) {
  const router = useRouter()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <section id="communities" className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1F3A] mb-2">
            Active Communities
          </h2>
          <p className="text-gray-600 text-sm">
            Join vibrant groups of researchers sharing your interests
          </p>
        </div>

        {isLoadingContent ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-3 text-sm">No communities available yet</p>
            {isAuthenticated && (
              <Link
                href="/dashboard/user/communities"
                className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                <Users className="w-4 h-4" />
                Create Community
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {communities.slice(0, 3).map((community, i) => (
                <motion.div
                  key={community.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  viewport={{ once: true }}
                  animate={{
                    y: [0, -8, 0],
                  }}
                  transition={{
                    y: {
                      duration: 3 + i * 0.3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }
                  }}
                  whileHover={{ scale: 1.03, zIndex: 10 }}
                  onClick={() => router.push(`/communities/${community.id}`)}
                  className="bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-lg hover:shadow-xl transition-all cursor-pointer border border-gray-100"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center mb-3 mx-auto">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-sm font-bold text-[#1A1F3A] mb-2 text-center line-clamp-2">
                    {community.name}
                  </h3>
                  <div className="text-center mb-2">
                    <div className="text-xl font-bold text-[#0158B7] mb-1">
                      {community.member_count}
                    </div>
                    <div className="text-xs text-gray-600">Members</div>
                  </div>
                  <div className="text-xs text-gray-500 mb-3 text-center">
                    {community.post_count} posts
                  </div>
                  <button className="w-full bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all text-sm">
                    View Community Details
                  </button>
                </motion.div>
              ))}
            </div>

            {/* Added View More Button for Communities */}
            <div className="text-center mt-6">
              <Link
                href="/communities"
                className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                Explore More Communities
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
// Enhanced Events Preview with Three Grid Compact Layout
function EventsPreview() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { latestUpcomingEvents, isLoadingUpcomingEvents } = useSelector(
    (state: RootState) => state.homepage
  )

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

  // Get first 3 events for display
  const displayEvents = latestUpcomingEvents.slice(0, 3)

  return (
    <section id="events" className="py-12 bg-gradient-to-br from-[#F8F9FA] to-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-[#1A1F3A] mb-2">
            Upcoming Events
          </h2>
          <p className="text-gray-600 text-sm">
            Connect with researchers through conferences and workshops
          </p>
        </motion.div>

        {isLoadingUpcomingEvents ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : latestUpcomingEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-3 text-sm">No upcoming events</p>
            {isAuthenticated && (
              <Link
                href="/dashboard/user/events"
                className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
              >
                <Calendar className="w-4 h-4" />
                Create Event
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-all border border-gray-100"
                >
                  {/* Event Cover Image */}
                  <div className="h-32 bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center relative">
                    {event.cover_image_url ? (
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Calendar className="w-12 h-12 text-white opacity-30" />
                    )}
                    {index === 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white text-xs font-bold rounded-full shadow-lg">
                        FEATURED
                      </span>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-4">
                    <h3 className="text-sm font-bold text-[#1A1F3A] mb-2 line-clamp-2 min-h-[2.5rem]">
                      {event.title}
                    </h3>

                    <div className="space-y-1.5 mb-3 text-xs">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-3 h-3 mr-1 text-[#0158B7] flex-shrink-0" />
                        <span className="truncate">{formatEventDate(event.start_datetime)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-3 h-3 mr-1 text-[#0158B7] flex-shrink-0" />
                        <span className="truncate">
                          {formatEventTime(event.start_datetime)} - {formatEventTime(event.end_datetime)}
                        </span>
                      </div>
                      {event.organizer && (
                        <div className="flex items-center text-gray-600">
                          <User className="w-3 h-3 mr-1 text-[#0158B7] flex-shrink-0" />
                          <span className="truncate">
                            {event.organizer.first_name} {event.organizer.last_name}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Event Mode & Type Badges */}
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 text-xs font-semibold rounded-full ${event.event_mode === 'Online'
                        ? 'bg-[#8DB6E1]/30 text-[#0158B7]'
                        : event.event_mode === 'Physical'
                          ? 'bg-[#5E96D2]/30 text-[#0158B7]'
                          : 'bg-[#0362C3]/30 text-[#0158B7]'
                        }`}>
                        {event.event_mode === 'Online' && <Video className="w-2.5 h-2.5" />}
                        {event.event_mode === 'Physical' && <MapPin className="w-2.5 h-2.5" />}
                        {event.event_mode === 'Hybrid' && <Globe className="w-2.5 h-2.5" />}
                        {event.event_mode}
                      </span>
                      <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">
                        {event.event_type}
                      </span>
                    </div>

                    {/* Location Info (if physical) */}
                    {event.event_mode === 'Physical' && event.location_address && (
                      <div className="flex items-start text-xs text-gray-500 mb-3">
                        <MapPin className="w-2.5 h-2.5 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location_address}</span>
                      </div>
                    )}

                    {/* Register Button */}
                    <button className="w-full bg-gradient-to-r from-[#0362C3] to-[#5E96D2] text-white py-2 rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-1 text-sm">
                      View Event Details
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View All Events CTA - Updated */}
            {latestUpcomingEvents.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center mt-6"
              >
                <div className="bg-gradient-to-br from-[#F8F9FA] to-white rounded-xl p-4 shadow-lg inline-block border border-gray-100">
                  <p className="text-gray-600 mb-3 font-medium text-sm">
                    {latestUpcomingEvents.length > 3
                      ? `Discover ${latestUpcomingEvents.length - 3} more events happening in the community`
                      : 'Discover more events happening in the community'
                    }
                  </p>
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-xl transition-all text-sm"
                  >
                    Explore More Events
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Wave Divider */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 Q360,100 720,50 T1440,50 L1440,60 L0,60 Z"
          fill="#ffffff"
        />
      </svg>
    </section>
  )
}
// Enhanced Impact Stats with Crescent Backgrounds
function ImpactStats({ summary, isLoading }) {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 100])
  const y2 = useTransform(scrollY, [0, 500], [0, 150])

  const stats = [
    { icon: FileText, value: summary?.projectsCount || 0, label: 'Research Projects', suffix: '+' },
    { icon: Users, value: summary?.researchersCount || 0, label: 'Active Researchers', suffix: '+' },
    { icon: Users, value: summary?.communitiesCount || 0, label: 'Communities Created', suffix: '+' },
    { icon: Calendar, value: summary?.eventsCount || 0, label: 'Events Hosted', suffix: '+' }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-[#0158B7] to-[#0362C3] text-white relative overflow-hidden">
      {/* Crescent Layers */}
      <motion.div
        className="absolute right-[-15%] top-[10%] w-[50%] h-[70%] opacity-30"
        style={{
          y: y1,
          clipPath: 'ellipse(45% 55% at 100% 50%)',
          background: '#5E96D2',
          transform: 'rotate(-20deg)'
        }}
      />
      <motion.div
        className="absolute left-[-10%] bottom-[-5%] w-[45%] h-[65%] opacity-25"
        style={{
          y: y2,
          clipPath: 'circle(50% at 0% 100%)',
          background: '#8DB6E1',
          transform: 'rotate(30deg)'
        }}
      />

      <FloatingParticles />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Platform Impact
          </h2>
          <p className="text-white/90 max-w-2xl mx-auto text-sm">
            Growing Rwanda's research ecosystem together
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <SkeletonLoader key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.05 }}
                className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 shadow-xl hover:shadow-2xl transition-all"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-10 h-10 mx-auto mb-3 opacity-90" />
                </motion.div>
                <div className="text-2xl md:text-3xl font-bold mb-1">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs text-white/90 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 Q360,100 720,50 T1440,50 L1440,100 L0,100 Z"
          fill="#ffffff"
        />
      </svg>
    </section>
  )
}

// Enhanced How It Works
function HowItWorks() {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 80])

  const steps = [
    { icon: User, title: 'Create Profile', desc: 'Set up your researcher profile', color: 'from-[#0158B7] to-[#0362C3]' },
    { icon: Upload, title: 'Share Research', desc: 'Upload your projects and papers', color: 'from-[#0362C3] to-[#5E96D2]' },
    { icon: Users, title: 'Join Communities', desc: 'Connect with peers', color: 'from-[#5E96D2] to-[#8DB6E1]' },
    { icon: TrendingUp, title: 'Collaborate & Grow', desc: 'Advance knowledge together', color: 'from-[#8DB6E1] to-[#0158B7]' }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-[#F8F9FA] to-white relative overflow-hidden">
      {/* Subtle Crescent Background */}
      <motion.div
        className="absolute right-[-20%] top-[20%] w-[60%] h-[60%] opacity-10"
        style={{
          y: y1,
          clipPath: 'ellipse(40% 50% at 100% 50%)',
          background: 'linear-gradient(135deg, #0158B7 0%, #0362C3 100%)',
          transform: 'rotate(-25deg)'
        }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F3A] mb-3">
            How It Works
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            Get started in four simple steps
          </p>
        </motion.div>

        <div className="relative">
          {/* Animated connecting line */}
          <motion.div
            className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-[#0158B7] via-[#0362C3] to-[#5E96D2] transform -translate-y-1/2"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            viewport={{ once: true }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  className="relative inline-block mb-4"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <motion.div
                    className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-full flex items-center justify-center shadow-2xl`}
                    animate={{
                      boxShadow: [
                        "0 10px 40px rgba(1, 88, 183, 0.3)",
                        "0 10px 60px rgba(1, 88, 183, 0.5)",
                        "0 10px 40px rgba(1, 88, 183, 0.3)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </motion.div>
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-[#0158B7] rounded-full flex items-center justify-center text-white font-bold shadow-lg text-xs"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: i * 0.2 + 0.3, type: "spring" }}
                    viewport={{ once: true }}
                  >
                    {i + 1}
                  </motion.div>
                </motion.div>
                <motion.h3
                  className="text-lg font-bold text-[#1A1F3A] mb-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 + 0.4 }}
                  viewport={{ once: true }}
                >
                  {step.title}
                </motion.h3>
                <motion.p
                  className="text-gray-600 text-xs"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: i * 0.2 + 0.5 }}
                  viewport={{ once: true }}
                >
                  {step.desc}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href={isAuthenticated ? "/dashboard" : "/register"}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white px-8 py-3 rounded-full font-bold hover:shadow-2xl transition-all text-sm"
            >
              {isAuthenticated ? "Go to Dashboard" : "Get Started Now"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Wave Divider */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 Q360,0 720,50 T1440,50 L1440,60 L0,60 Z"
          fill="#ffffff"
        />
      </svg>
    </section>
  )
}

// Enhanced Testimonials
function Testimonials() {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 70])

  const testimonials = [
    {
      quote: "Ongera has transformed how I collaborate with fellow researchers. The platform makes sharing knowledge seamless.",
      name: "Dr. Alice Mukamana",
      title: "Health Researcher",
      institution: "University of Rwanda",
      rating: 5,
      color: "from-[#0158B7] to-[#0362C3]"
    },
    {
      quote: "Finally, a platform built for African researchers. The community support has been invaluable for my work.",
      name: "Prof. Jean Nsengimana",
      title: "Computer Science",
      institution: "Carnegie Mellon - Africa",
      rating: 5,
      color: "from-[#0362C3] to-[#5E96D2]"
    },
    {
      quote: "The diaspora network helped me connect with researchers back home. Ongera bridges the gap beautifully.",
      name: "Dr. Emmanuel Kayitare",
      title: "Environmental Scientist",
      institution: "Diaspora Scholar",
      rating: 5,
      color: "from-[#5E96D2] to-[#8DB6E1]"
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA] relative overflow-hidden">
      {/* Subtle Crescent Background */}
      <motion.div
        className="absolute left-[-15%] top-[15%] w-[50%] h-[70%] opacity-10"
        style={{
          y: y1,
          clipPath: 'ellipse(45% 55% at 0% 50%)',
          background: 'linear-gradient(135deg, #0362C3 0%, #5E96D2 100%)',
          transform: 'rotate(15deg)'
        }}
      />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1F3A] mb-3">
            What Researchers Say
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            Join thousands of satisfied researchers
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              className="bg-white backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all border border-gray-100 relative overflow-hidden"
            >
              {/* Decorative corner gradient */}
              <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${testimonial.color} opacity-10 rounded-bl-full`} />

              <motion.div
                className="flex mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: i * 0.15 + 0.3 }}
                viewport={{ once: true }}
              >
                {[...Array(testimonial.rating)].map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ scale: 0, rotate: -180 }}
                    whileInView={{ scale: 1, rotate: 0 }}
                    transition={{ delay: i * 0.15 + 0.4 + j * 0.1, type: "spring" }}
                    viewport={{ once: true }}
                  >
                    <Star className="w-4 h-4 text-[#0362C3] fill-current" />
                  </motion.div>
                ))}
              </motion.div>

              <p className="text-gray-700 mb-4 italic leading-relaxed text-sm">
                "{testimonial.quote}"
              </p>

              <div className="flex items-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${testimonial.color} rounded-full flex items-center justify-center text-white font-bold text-lg mr-3 shadow-lg`}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-[#1A1F3A] text-sm">{testimonial.name}</div>
                  <div className="text-xs text-gray-600">{testimonial.title}</div>
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

// Enhanced Newsletter CTA with Backend Integration
function NewsletterCTA() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 500], [0, 100])
  const y2 = useTransform(scrollY, [0, 500], [0, 150])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setSubscriptionStatus('error')
      setMessage('Please enter your email address')
      return
    }

    // Basic email validation
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
      const credentials = { email }
      const response = await api.post('/subscribe', credentials)

      if (response.data && response.data.success) {
        setSubscriptionStatus('success')
        setMessage(
          'Thank you for subscribing! You will receive updates on new research projects, events, and communities.'
        )
        setEmail('')
      } else {
        setSubscriptionStatus('error')
        setMessage(
          response.data?.message || 'Subscription failed. Please try again.'
        )
      }
    } catch (error: any) {
      console.error('Subscription error:', error)
      setSubscriptionStatus('error')
      setMessage(
        error.response?.data?.message ||
        'Network error. Please check your connection and try again.'
      )
    } finally {
      setIsSubmitting(false)

      // Clear message after 5 seconds
      setTimeout(() => {
        setMessage('')
        setSubscriptionStatus('idle')
      }, 5000)
    }
  }


  return (
    <section className="py-16 bg-gradient-to-br from-[#0158B7] via-[#0362C3] to-[#5E96D2] relative overflow-hidden">
      {/* Crescent Layers */}
      <motion.div
        className="absolute right-[-10%] top-[15%] w-[55%] h-[70%] opacity-20"
        style={{
          y: y1,
          clipPath: 'ellipse(45% 55% at 100% 50%)',
          background: '#8DB6E1',
          transform: 'rotate(-20deg)'
        }}
      />
      <motion.div
        className="absolute left-[-10%] bottom-[10%] w-[45%] h-[60%] opacity-20"
        style={{
          y: y2,
          clipPath: 'circle(50% at 0% 100%)',
          background: '#0158B7',
          transform: 'rotate(25deg)'
        }}
      />

      <FloatingParticles />

      <div className="max-w-4xl mx-auto px-4 text-center text-white relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <Mail className="w-8 h-8" />
            </div>
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated on Rwanda's Research
          </h2>
          <p className="text-white/90 mb-6 max-w-2xl mx-auto text-sm">
            Get notified about new research projects, events, and communities in Rwanda's research ecosystem
          </p>

          {/* Success Message */}
          <AnimatePresence>
            {subscriptionStatus === 'success' && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="mb-6 p-4 bg-green-500/20 backdrop-blur-md rounded-xl border border-green-400/30 max-w-md mx-auto"
              >
                <div className="flex items-center justify-center gap-2 text-green-100">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {subscriptionStatus === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.9 }}
                className="mb-6 p-4 bg-red-500/20 backdrop-blur-md rounded-xl border border-red-400/30 max-w-md mx-auto"
              >
                <div className="flex items-center justify-center gap-2 text-red-100">
                  <X className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto mb-4"
          >
            <motion.input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={isSubmitting}
              whileFocus={{ scale: 1.02 }}
              className="flex-1 px-5 py-3 border outline-none rounded-full text-white ring-white/50 shadow-xl focus:outline-none focus:ring-4 focus:ring-white/50 shadow-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: isSubmitting ? 1 : 1.05 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.95 }}
              className="bg-white text-[#0158B7] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-all shadow-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed text-sm min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Subscribing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Subscribe
                </>
              )}
            </motion.button>
          </motion.form>

          <motion.div
            className="text-xs text-white/80 space-y-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            viewport={{ once: true }}
          >
            <p>We respect your privacy. Unsubscribe at any time.</p>
            <p className="text-white/60">
              You'll receive updates on new research projects, events, and communities
            </p>
          </motion.div>

          {/* Subscription Benefits */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto"
          >
            {[
              { icon: FileText, text: 'New Research Projects' },
              { icon: Calendar, text: 'Upcoming Events' },
              { icon: Users, text: 'Community Updates' }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center justify-center gap-2 text-white/80 text-xs"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,50 Q360,100 720,50 T1440,50 L1440,100 L0,100 Z"
          fill="#ffffffff"
        />
      </svg>
    </section>
  )
}

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="bg-gradient-to-br from-[#0158B7] to-[#0362C3] text-white py-8 relative overflow-hidden">
      {/* Subtle background effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-[#0362C3] opacity-10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#5E96D2] opacity-10 rounded-full blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          
          {/* Left: Ongera Logo & Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <Link href="/" className="group inline-block">
              <motion.div
                className="w-[160px] h-16 rounded-xl flex items-center justify-center overflow-hidden border-2 border-white/30 bg-white/10 backdrop-blur-md mb-3"
                whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.6)' }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Image
                  src="/ongeraLogo.png"
                  alt="Ongera logo"
                  width={160}
                  height={64}
                  priority
                  className="object-contain"
                />
              </motion.div>
            </Link>
            <p className="text-white/90 text-sm font-semibold mb-1">
              Ongera Research Platform
            </p>
            <p className="text-white/70 text-xs leading-relaxed">
              Empowering Rwanda's Research Community
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <h3 className="text-white font-semibold text-sm mb-3">Quick Links</h3>
            <nav className="space-y-2">
              <Link href="/research-projects" className="block text-white/80 hover:text-white text-xs transition-colors">
                Research Library
              </Link>
              <Link href="/communities" className="block text-white/80 hover:text-white text-xs transition-colors">
                Communities
              </Link>
              <Link href="/events" className="block text-white/80 hover:text-white text-xs transition-colors">
                Events
              </Link>

            </nav>
          </motion.div>

          {/* Legal & Policies */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Legal & Policies
            </h3>
            <nav className="space-y-2">
              <Link 
                href="/policy#privacy-policy" 
                className="flex items-center gap-2 text-white/80 hover:text-white text-xs transition-colors group"
              >
                <Shield className="w-3 h-3 group-hover:scale-110 transition-transform" />
                Privacy Policy
              </Link>
              <Link 
                href="/policy#terms-service" 
                className="flex items-center gap-2 text-white/80 hover:text-white text-xs transition-colors group"
              >
                <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" />
                Terms of Service
              </Link>
              <Link 
                href="/policy#community-standards" 
                className="flex items-center gap-2 text-white/80 hover:text-white text-xs transition-colors group"
              >
                <Users className="w-3 h-3 group-hover:scale-110 transition-transform" />
                Community Standards
              </Link>
              <Link 
                href="/policy" 
                className="flex items-center gap-2 text-white/80 hover:text-white text-xs transition-colors group font-semibold"
              >
                <FileText className="w-3 h-3 group-hover:scale-110 transition-transform" />
                View All Policies
              </Link>
            </nav>
          </motion.div>

          {/* Contact & Social */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="md:col-span-1"
          >
            <h3 className="text-white font-semibold text-sm mb-3">Get in Touch</h3>
            <div className="space-y-3">
              <a 
                href="mailto:bwengeorg@gmail.com" 
                className="flex items-center gap-2 text-white/80 hover:text-white text-xs transition-colors"
              >
                <Mail className="w-3 h-3" />
                bwengeorg@gmail.com
              </a>
              <div className="flex items-center gap-2">
                <motion.a
                  href="mailto:bwengeorg@gmail.com"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
                  title="Email Us"
                >
                  <Mail className="w-4 h-4" />
                </motion.a>
                <motion.a
                  href="https://ongera.rw"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-8 h-8 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
                  title="Visit Website"
                >
                  <Globe className="w-4 h-4" />
                </motion.a>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-white/90 text-xs font-medium mb-0.5">
                © 2025 Ongera • All rights reserved
              </p>
              <p className="text-white/70 text-xs flex items-center justify-center md:justify-start gap-1">
                Made with <span className="text-red-400 animate-pulse">❤️</span> for Rwanda
              </p>
            </div>

            {/* Policy Agreement Notice */}
            <div className="text-center md:text-right">
              <p className="text-white/70 text-xs mb-1">
                By using Ongera, you agree to our policies
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 text-xs">
                <Link href="/policy#privacy-policy" className="text-white/80 hover:text-white hover:underline transition-colors">
                  Privacy
                </Link>
                <span className="text-white/40">•</span>
                <Link href="/policy#terms-service" className="text-white/80 hover:text-white hover:underline transition-colors">
                  Terms
                </Link>
                <span className="text-white/40">•</span>
                <Link href="/policy#community-standards" className="text-white/80 hover:text-white hover:underline transition-colors">
                  Standards
                </Link>
              </div>
            </div>

            {/* Back to Top Button */}
            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.1, y: -3 }}
              whileTap={{ scale: 0.95 }}
              className="group relative w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-all shadow-lg"
              title="Back to Top"
            >
              <motion.div
                animate={{ y: [-2, 2, -2] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ChevronDown className="w-6 h-6 rotate-180" />
              </motion.div>
              <span className="absolute right-12 bg-white text-[#0158B7] px-3 py-1.5 rounded-lg text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                Back to Top
              </span>
            </motion.button>
          </div>
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