"use client"

import { useState, useEffect, useRef } from "react"
import { BookOpen, Users, Calendar, Eye, Heart, MessageCircle, TrendingUp, FileText, Award, Sparkles } from "lucide-react"
import { DashboardSummary } from "@/lib/features/auth/dashboardSlices"
import { motion, useInView } from "framer-motion"

// ==================== ANIMATED COUNTER COMPONENT ====================
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
      <span className="text-xs ml-0.5 opacity-80">{suffix}</span>
    </span>
  )
}

// ==================== SKELETON LOADER ====================
function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={`bg-white/10 backdrop-blur-md rounded-lg p-3 border border-white/20 animate-pulse ${className}`}>
      <div className="h-5 bg-white/20 rounded w-12 mb-1.5"></div>
      <div className="h-2.5 bg-white/20 rounded w-16"></div>
    </div>
  )
}

// ==================== MAIN STATS COMPONENT ====================
// Define the props type for DashboardStats
interface DashboardStatsProps {
  accountType: string;
  summary?: DashboardSummary;
}

export default function DashboardStats({ accountType, summary }: DashboardStatsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 max-w-7xl mx-auto">
        {[...Array(5)].map((_, i) => (
          <SkeletonLoader key={i} className="h-16" />
        ))}
      </div>
    )
  }

  const getStatsConfig = (type: string) => {
    const baseStats = [
      {
        label: "Research Projects",
        value: summary.projects.total,
        suffix: "+",
        subtitle: `${summary.projects.published} published`,
        icon: BookOpen,
        color: "from-blue-500 to-cyan-500",
        trend: summary.projects.totalViews > 0 ? `↑ ${summary.projects.totalViews}` : undefined
      },
      {
        label: "Communities",
        value: summary.communities.total,
        suffix: "+",
        subtitle: `${summary.communities.created} created`,
        icon: Users,
        color: "from-purple-500 to-pink-500",
        trend: undefined
      },
      {
        label: "Events",
        value: summary.events.total,
        suffix: "+",
        subtitle: `${summary.events.upcoming} upcoming`,
        icon: Calendar,
        color: "from-green-500 to-emerald-500",
        trend: undefined
      },
      {
        label: "Blog Posts",
        value: summary.blogs.total,
        suffix: "+",
        subtitle: `${summary.blogs.published} published`,
        icon: FileText,
        color: "from-orange-500 to-amber-500",
        trend: summary.blogs.draft > 0 ? `${summary.blogs.draft} drafts` : undefined
      },
      {
        label: "Engagement",
        value: summary.projects.totalLikes,
        suffix: "",
        subtitle: `${summary.projects.totalDownloads} downloads`,
        icon: Heart,
        color: "from-red-500 to-rose-500",
        trend: undefined
      }
    ]

    if (type === "Institution") {
      return [
        {
          label: "Projects Hosted",
          value: summary.projects.total,
          suffix: "+",
          subtitle: `${summary.projects.published} active`,
          icon: BookOpen,
          color: "from-blue-500 to-cyan-500",
          trend: `${summary.projects.totalViews} views`
        },
        {
          label: "Community Members",
          value: summary.communities.total,
          suffix: "+",
          subtitle: `${summary.communities.created} communities`,
          icon: Users,
          color: "from-purple-500 to-pink-500",
          trend: undefined
        },
        {
          label: "Events Organized",
          value: summary.events.organizing,
          suffix: "+",
          subtitle: `${summary.events.upcoming} upcoming`,
          icon: Calendar,
          color: "from-green-500 to-emerald-500",
          trend: undefined
        },
        {
          label: "Blog Posts",
          value: summary.blogs.total,
          suffix: "+",
          subtitle: `${summary.blogs.published} published`,
          icon: FileText,
          color: "from-orange-500 to-amber-500",
          trend: summary.blogs.draft > 0 ? `${summary.blogs.draft} drafts` : undefined
        },
        {
          label: "Total Reach",
          value: summary.projects.totalViews + summary.projects.totalDownloads,
          suffix: "",
          subtitle: `${summary.projects.totalLikes} likes`,
          icon: Eye,
          color: "from-indigo-500 to-violet-500",
          trend: undefined
        }
      ]
    }

    if (type === "Student" || type === "Researcher") {
      return [
        ...baseStats.slice(0, 3),
        {
          label: "Blog Posts",
          value: summary.blogs.total,
          suffix: "+",
          subtitle: `${summary.blogs.published} published`,
          icon: FileText,
          color: "from-orange-500 to-amber-500",
          trend: summary.blogs.draft > 0 ? `${summary.blogs.draft} drafts` : undefined
        },
        {
          label: "Questions Asked",
          value: summary.qa.totalQuestions,
          suffix: "",
          subtitle: `${summary.qa.answeredQuestions} answered`,
          icon: MessageCircle,
          color: "from-teal-500 to-cyan-500",
          trend: undefined
        }
      ]
    }

    return baseStats
  }

  const statsConfig = getStatsConfig(accountType)

  return (
    <div className="w-full max-w-8xl mx-auto px-4">
      <motion.div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {statsConfig.map((stat, index) => {
          const Icon = stat.icon

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ y: -3, scale: 1.02 }}
              className="relative overflow-hidden bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 shadow-md hover:shadow-lg transition-all duration-300 group"
            >
              {/* Background gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

              {/* Header with Icon and Label */}
              <div className="flex items-start justify-between mb-2">
                {/* Icon with gradient background */}
                <div className={`relative w-7 h-7 rounded-md bg-gradient-to-br ${stat.color} shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                  {/* Decorative sparkle */}
                  <Sparkles className="absolute -top-1 -right-1 w-2 h-2 text-yellow-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                {/* Trend badge */}
                {stat.trend && (
                  <span className="text-[9px] font-medium text-green-600 bg-green-100 px-1 py-0.5 rounded-full whitespace-nowrap">
                    {stat.trend}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="relative">
                {/* Main value with counter */}
                <div className="flex items-baseline gap-0.5">
                  <span className="text-xl md:text-2xl font-bold text-gray-900">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={1800} />
                  </span>
                </div>
                
                {/* Label */}
                <p className="text-xs font-semibold text-gray-700 mt-0.5 leading-tight">
                  {stat.label}
                </p>
                
                {/* Subtitle */}
                <p className="text-[9px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <span className={`w-1 h-1 rounded-full bg-gradient-to-br ${stat.color}`} />
                  {stat.subtitle}
                </p>
              </div>

              {/* Decorative dot pattern - smaller */}
              <div className="absolute bottom-1 right-1 opacity-5 group-hover:opacity-10 transition-opacity">
                <div className="grid grid-cols-3 gap-0.5">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="w-0.5 h-0.5 rounded-full bg-gray-800" />
                  ))}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}