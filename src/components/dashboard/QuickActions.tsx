"use client"

import { useRouter } from "next/navigation"
import { 
  Upload, 
  MessageSquare, 
  Calendar, 
  Users, 
  Plus,
  FileText,
  BarChart3,
  Briefcase,
  CalendarPlus,
  Library,
  Sparkles,
  Zap,
  ArrowRight
} from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

interface QuickActionsProps {
  accountType: string
}

export default function QuickActions({ accountType }: QuickActionsProps) {
  const router = useRouter()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const getRoleSpecificActions = () => {
    const baseActions = [
      {
        label: "Upload Project",
        icon: Upload,
        href: "/dashboard/user/research/upload",
        roles: ["Student", "Researcher", "Diaspora"],
        color: "from-[#0158B7] to-[#5E96D2]",
        gradient: "bg-gradient-to-br from-[#0158B7] to-[#5E96D2]"
      },
      {
        label: "Write Blog",
        icon: FileText,
        href: "/dashboard/user/communities",
        roles: ["Student", "Researcher", "Diaspora", "Institution"],
        color: "from-[#0158B7] to-[#5E96D2]",
        gradient: "bg-gradient-to-br from-[#0158B7] to-[#5E96D2]"
      },
      {
        label: "Ask Question",
        icon: MessageSquare,
        href: "/dashboard/user/qa/ask",
        roles: ["Student", "Researcher", "Diaspora"],
        color: "from-[#0158B7] to-[#5E96D2]",
        gradient: "bg-gradient-to-br from-[#0158B7] to-[#5E96D2]"
      },
      {
        label: "Browse Events",
        icon: Calendar,
        href: "/dashboard/user/event",
        roles: ["Student", "Researcher", "Institution", "Diaspora"],
        color: "from-[#0158B7] to-[#5E96D2]",
        gradient: "bg-gradient-to-br from-[#0158B7] to-[#5E96D2]"
      }
    ]

    if (accountType === "Institution") {
      baseActions[0] = {
        label: "Create Event",
        icon: CalendarPlus,
        href: "/dashboard/user/event/create",
        roles: ["Institution"],
        color: "from-[#0158B7] to-[#5E96D2]",
        gradient: "bg-gradient-to-br from-[#0158B7] to-[#5E96D2]"
      }
      baseActions[4] = {
        label: "Join Community",
        icon: Users,
        href: "/dashboard/user/communities",
        roles: ["Institution"],
        color: "from-[#0158B7] to-[#5E96D2]",
        gradient: "bg-gradient-to-br from-[#0158B7] to-[#5E96D2]"
      }
    }

    return baseActions.filter(action => 
      action.roles.includes(accountType)
    )
  }

  const actions = getRoleSpecificActions()

  const handleActionClick = (href: string) => {
    router.push(href)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200/50 p-3 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#0158B7]" />
          Quick Actions
        </h2>
        <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {actions.length} available
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon

          return (
            <motion.button
              key={index}
              onClick={() => handleActionClick(action.href)}
              onHoverStart={() => setHoveredIndex(index)}
              onHoverEnd={() => setHoveredIndex(null)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.05, duration: 0.3 }}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative overflow-hidden rounded-lg p-3 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#0158B7]/50 focus:ring-offset-2"
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-90 group-hover:opacity-100 transition-opacity duration-300`} />
              
              {/* Animated background pattern - always playing */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_white_1px,transparent_1px)] bg-[length:20px_20px] animate-pulse" />
              </div>

              {/* Shine effect - always playing */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ["-100%", "200%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                  repeatDelay: 1
                }}
              />

              {/* Floating particles - always playing */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  x: [0, -10, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: index * 0.2,
                  ease: "easeInOut"
                }}
                className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full"
              />
              <motion.div
                animate={{
                  y: [0, -25, 0],
                  x: [0, 15, 0],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1.2, 0.5]
                }}
                transition={{
                  duration: 3.5,
                  repeat: Infinity,
                  delay: index * 0.3,
                  ease: "easeInOut"
                }}
                className="absolute top-1/3 right-1/4 w-1.5 h-1.5 bg-white/70 rounded-full"
              />
              <motion.div
                animate={{
                  y: [0, -15, 0],
                  x: [0, 8, 0],
                  opacity: [0, 0.5, 0],
                  scale: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  delay: index * 0.4,
                  ease: "easeInOut"
                }}
                className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white/60 rounded-full"
              />
              <motion.div
                animate={{
                  y: [0, -18, 0],
                  x: [0, -12, 0],
                  opacity: [0, 0.7, 0],
                  scale: [0.5, 1.1, 0.5]
                }}
                transition={{
                  duration: 3.2,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
                className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-white/80 rounded-full"
              />

              {/* Glowing orb effect */}
              <motion.div
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.1, 0.3, 0.1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.3
                }}
                className="absolute inset-0 bg-white rounded-full blur-xl"
              />

              {/* Content */}
              <div className="relative flex flex-col items-center justify-center text-center z-10">
                <div className="relative mb-2">
                  <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform duration-300" />
                  
                  {/* Pulsing glow behind icon */}
                  <motion.div
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2
                    }}
                    className="absolute inset-0 bg-white rounded-full blur-md -z-10"
                  />
                </div>
                
                <span className="text-xs font-semibold text-white leading-tight drop-shadow-md">
                  {action.label}
                </span>

                {/* Animated arrow indicator - always visible but subtle */}
                <motion.div
                  animate={{
                    x: [0, 5, 0],
                    opacity: [0.3, 1, 0.3]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.3
                  }}
                  className="absolute -right-1 top-1/2 -translate-y-1/2"
                >
                  <ArrowRight className="w-3 h-3 text-white/70" />
                </motion.div>
              </div>

              {/* Border glow - always pulsing */}
              <motion.div
                animate={{
                  opacity: [0.2, 0.5, 0.2],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.1
                }}
                className="absolute inset-0 rounded-lg ring-2 ring-white opacity-50 pointer-events-none"
              />
            </motion.button>
          )
        })}
      </div>

      {/* Animated quick tip footer - FIXED: Replaced div with span inside p */}
      <motion.div 
        className="mt-2 pt-2 border-t border-gray-100/50 px-1"
        animate={{
          borderColor: ["rgba(0,0,0,0.05)", "rgba(1,88,183,0.2)", "rgba(0,0,0,0.05)"]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <p className="text-[10px] text-gray-500 flex items-center gap-1">
          <motion.span
            animate={{
              rotate: [0, 15, -15, 0],
              scale: [1, 1.2, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            <Sparkles className="w-3 h-3 text-[#0158B7]" />
          </motion.span>
          <motion.span
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-block"
          >
            Click any action to get started quickly
          </motion.span>
        </p>
      </motion.div>
    </motion.div>
  )
}