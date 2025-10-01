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
  Library
} from "lucide-react"

interface QuickActionsProps {
  accountType: string
}

export default function QuickActions({ accountType }: QuickActionsProps) {
  const router = useRouter()

  const getRoleSpecificActions = () => {
    const baseActions = [
      {
        label: "Upload Project",
        icon: Upload,
        href: "/dashboard/user/research/upload",
        roles: ["Student", "Researcher", "Diaspora"],
        color: "from-[#0158B7] to-[#5E96D2]"
      },
      {
        label: "Write Blog",
        icon: FileText,
        href: "/dashboard/user/communities",
        roles: ["Student", "Researcher", "Diaspora", "Institution"],
        color: "from-[#0158B7] to-[#5E96D2]"
      },
      {
        label: "Ask Question",
        icon: MessageSquare,
        href: "/dashboard/user/qa/ask",
        roles: ["Student", "Researcher", "Diaspora"],
        color: "from-[#0158B7] to-[#5E96D2]"
      },
      {
        label: "Browse Events",
        icon: Calendar,
        href: "/dashboard/user/events",
        roles: ["Student", "Researcher", "Institution", "Diaspora"],
        color: "from-[#0158B7] to-[#5E96D2]"
      }
    ]

    if (accountType === "Institution") {
      baseActions[0] = {
        label: "Create Event",
        icon: CalendarPlus,
        href: "/dashboard/user/events/create",
        roles: ["Institution"],
        color: "from-[#0158B7] to-[#5E96D2]"
      }
      baseActions[4] = {
        label: "Join Community",
        icon: Users,
        href: "/dashboard/user/communities",
        roles: ["Institution"],
        color: "from-[#0158B7] to-[#5E96D2]"
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
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm">
      <h2 className="text-sm font-semibold text-gray-900 mb-2.5">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon

          return (
            <button
              key={index}
              onClick={() => handleActionClick(action.href)}
              className={`group relative overflow-hidden bg-gradient-to-r ${action.color} text-white rounded-lg p-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0`}
            >
              {/* Subtle hover effect overlay */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
              
              {/* Content */}
              <div className="relative flex flex-col items-center justify-center text-center">
                <Icon className="w-5 h-5 mb-1.5 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-xs font-medium leading-tight">{action.label}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}