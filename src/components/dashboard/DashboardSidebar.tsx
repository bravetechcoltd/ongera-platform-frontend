
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { logout } from "@/lib/features/auth/auth-slice"
import {
  LayoutDashboard, User, BookOpen, Users, Calendar,
  MessageSquare, TrendingUp, Settings, LogOut, Menu, ChevronDown, X
} from "lucide-react"

const getSidebarItems = (accountType: string) => {
  return [
    {
      title: "Overview",
      href: "/dashboard/user",
      icon: LayoutDashboard,
      roles: ["Student", "Researcher", "Institution", "Diaspora"]
    },
    {
      title: "My Profile",
      href: "/dashboard/user/profile",
      icon: User,
      roles: ["Student", "Researcher", "Institution", "Diaspora"]
    },
    {
      title: "Research",
      icon: BookOpen,
      roles: ["Student", "Researcher", "Diaspora"],
      subItems: [
        { title: "My Projects", href: "/dashboard/user/research" },
        { title: "Upload Project", href: "/dashboard/user/research/upload" }
      ]
    },
    {
      title: "Communities",
      icon: Users,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
      subItems: [
        { title: "OverView", href: "/dashboard/user/communities/dashboard" },

        { title: "Browse All", href: "/dashboard/user/communities" },
        { title: "My Communities", href: "/dashboard/user/communities/my-communities" },
        { title: "Create Community", href: "/dashboard/user/communities/create" }
      ]
    },
    {
      title: "Events",
      icon: Calendar,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
      subItems: [
        { title: "Create Events", href: "/dashboard/user/event/create" },

        { title: "Browse Events", href: "/dashboard/user/event" },
        { title: "My Events", href: "/dashboard/user/event/my-events" },
        { 
          title: "Create Event",
          href: "/dashboard/user/event/create",
          roles: ["Researcher", "Institution"]
        },
        { title: "Manage Events", href: "/dashboard/user/event/manage" },

      ].filter(item => !item.roles || item.roles.includes(accountType))
    },
    {
      title: "Knowledge Hub",
      icon: MessageSquare,
      roles: ["Student", "Researcher", "Diaspora"],
      subItems: [
        { title: "Q&A Forum", href: "/dashboard/user/qa" },
        { title: "Blog Posts", href: "/dashboard/user/blog" }
      ]
    },
    {
      title: "Activity",
      icon: TrendingUp,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
      subItems: [
        { title: "Bookmarks", href: "/dashboard/user/bookmarks" },
        { title: "Notifications", href: "/dashboard/user/notifications" }
      ]
    },
    {
      title: "Settings",
      href: "/dashboard/user/settings",
      icon: Settings,
      roles: ["Student", "Researcher", "Institution", "Diaspora"]
    }
  ].filter(item => !item.roles || item.roles.includes(accountType))
}

export default function DashboardSidebar() {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const [collapsed, setCollapsed] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!user) return null

  const sidebarItems = getSidebarItems(user.account_type)

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const isActiveLink = (href: string) => {
    return pathname === href
  }

  const isActiveSubItem = (subItems: any[]) => {
    return subItems.some(item => pathname === item.href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">O</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-bold text-gray-900">Ongera</h1>
              <p className="text-xs text-gray-500">Research Platform</p>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isExpanded = expandedItems.includes(item.title)
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isActive = item.href ? isActiveLink(item.href) : isActiveSubItem(item.subItems || [])

          return (
            <div key={item.title}>
              {hasSubItems ? (
                <div>
                  <button
                    onClick={() => toggleExpand(item.title)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                      isActive ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="w-5 h-5" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </div>
                    {!collapsed && (
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                  
                  {!collapsed && isExpanded && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isActiveLink(subItem.href)
                              ? 'bg-emerald-100 text-emerald-700 font-medium'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {subItem.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              )}
            </div>
          )
        })}
      </nav>

      {/* User Section & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className={`flex items-center space-x-3 p-3 rounded-lg bg-gray-50 mb-2 ${
          collapsed ? 'justify-center' : ''
        }`}>
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user.first_name?.[0]}{user.last_name?.[0]}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user.account_type.toLowerCase()}</p>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className={`w-full flex items-center space-x-3 p-3 text-gray-700 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        transform transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${collapsed ? 'w-20' : 'w-64'}
        bg-white border-r border-gray-200 flex flex-col h-full
      `}>
        <SidebarContent />
      </div>

      {/* Close mobile sidebar button */}
      {mobileOpen && (
        <button
          className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg shadow-lg"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </>
  )
}