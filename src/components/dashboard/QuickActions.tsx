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
        color: "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] hover:from-[#034EA2] hover:to-[#4A87C5]"
      },
      {
        label: "Write Blog In Community",
        icon: FileText,
        href: "/dashboard/user/communities",
        roles: ["Student", "Researcher", "Diaspora", "Institution"],
        color: "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] hover:from-[#034EA2] hover:to-[#4A87C5]"
      },
      {
        label: "Ask Question",
        icon: MessageSquare,
        href: "/dashboard/user/qa/ask",
        roles: ["Student", "Researcher", "Diaspora"],
        color: "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] hover:from-[#034EA2] hover:to-[#4A87C5]"
      },
      {
        label: "Browse Events",
        icon: Calendar,
        href: "/dashboard/user/events",
        roles: ["Student", "Researcher", "Institution", "Diaspora"],
        color: "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] hover:from-[#034EA2] hover:to-[#4A87C5]"
      }
    ]

    if (accountType === "Institution") {
      baseActions[0] = {
        label: "Create Event",
        icon: CalendarPlus,
        href: "/dashboard/user/events/create",
        roles: ["Institution"],
        color: "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] hover:from-[#034EA2] hover:to-[#4A87C5]"
      }
      baseActions[4] = {
        label: "Join Community",
        icon: Users,
        href: "/dashboard/user/communities",
        roles: ["Institution"],
        color: "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] hover:from-[#034EA2] hover:to-[#4A87C5]"
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
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <h2 className="text-sm font-semibold text-gray-900 mb-2">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {actions.map((action, index) => {
          const Icon = action.icon

          return (
            <button
              key={index}
              onClick={() => handleActionClick(action.href)}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all duration-200 ${action.color} text-white hover:scale-105 hover:shadow-md`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}