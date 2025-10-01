"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  LayoutDashboard, User, BookOpen, Users, Calendar, Zap,
  MessageSquare, TrendingUp, Settings, LogOut, Menu, ChevronDown, Bell, X, Star,
  Building2
} from "lucide-react"

import { logout, generateSSOToken } from "@/lib/features/auth/auth-slice"
import { ExternalLink, CheckCircle } from "lucide-react"

const getSidebarItems = (accountType: string, isInstructor: boolean = false) => {
  return [
    // 1. Overview
    {
      title: "Overview",
      href: "/dashboard/user",
      icon: LayoutDashboard,
      roles: ["Student", "Researcher", "Institution", "Diaspora"]
    },
    
    // 2. Research
    {
      title: "Research",
      icon: BookOpen,
      roles: ["Student", "Researcher", "Diaspora", "Institution"],
      subItems: [
        { title: "Browse Projects", href: "/dashboard/user/research/browse" },
        { title: "My Projects", href: "/dashboard/user/research" },
        { title: "Upload Project", href: "/dashboard/user/research/upload" }
      ]
    },
    
    // 3. Communities
    {
      title: "Communities",
      icon: Users,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
      subItems: [
        { title: "Browse All", href: "/dashboard/user/communities" },
        { title: "My Communities", href: "/dashboard/user/communities/my-communities" },
        { title: "Create Community", href: "/dashboard/user/communities/create" }
      ]
    },
    
    // 4. Events
    {
      title: "Events",
      icon: Calendar,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
      subItems: [
        { title: "Browse Events", href: "/dashboard/user/event" },
        { title: "My Events", href: "/dashboard/user/event/my-events" },
        {
          title: "Create Event",
          href: "/dashboard/user/event/create",
          roles: ["Researcher", "Institution", "Student"]
        },
      ].filter(item => !item.roles || item.roles.includes(accountType))
    },
    
    // 5. Knowledge
    {
      title: "Knowledge",
      icon: MessageSquare,
      roles: ["Student", "Researcher", "Diaspora"],
      subItems: [
        { title: "Q&A Forum", href: "/dashboard/user/qa" },
        { title: "Ask Question", href: "/dashboard/user/qa/ask" },
        { title: "Blog Posts", href: "/dashboard/user/blog" }
      ]
    },
    
    // 6. Monthly Star
    {
      title: "Monthly Star",
      icon: Star,
      href: "/dashboard/user/monthly-star",
      roles: ["Student", "Researcher", "Diaspora", "Institution"],
    },
    
    // 7. Activities
    {
      title: "Activities",
      href: "/dashboard/user/activity",
      icon: Zap,
      roles: ["Student", "Researcher", "Institution", "Diaspora"]
    },
    
    // 8. Profile
    {
      title: "Profile",
      href: "/dashboard/user/profile",
      icon: User,
      roles: ["Student", "Researcher", "Institution", "Diaspora"]
    },
    
    // Institution Portal (Special - only for Institution users)
    {
      title: "Institution",
      icon: Building2,
      roles: ["Institution"],
      subItems: [
        { title: "Bulk Instructors & Students", href: "/dashboard/user/bulkusers" }
      ]
    },
    
    // Instructor Portal (Special - only for Researchers who are instructors)
    {
      title: "Instructor Portal",
      icon: BookOpen,
      roles: ["Researcher"],
      requiresInstructor: true,
      subItems: [
        { title: "Portal Dashboard", href: "/dashboard/user/instructor/portal" }
      ]
    }
  ].filter(item => {
    // Filter by account type role
    if (item.roles && !item.roles.includes(accountType)) {
      return false
    }

    // Filter by instructor status
    if (item.requiresInstructor === true && !isInstructor) {
      return false
    }

    return true
  })
}

export default function CompactNavbar() {
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mobileOpen, setMobileOpen] = useState(false)

  const { user, hasMultiSystemSession, activeSystems } = useAppSelector((state) => state.auth)
  const [showSystemMenu, setShowSystemMenu] = useState(false)
  const [switchingSystem, setSwitchingSystem] = useState(false)

  if (!user) return null

  // ✅ CRITICAL: Pass is_instructor flag from user data
  const sidebarItems = getSidebarItems(
    user.account_type || "Student", // Provide a default value if account_type is undefined
    user.is_instructor || false
  )

  console.log("👤 User Info:", {
    account_type: user.account_type,
    is_instructor: user.is_instructor,
    student_count: user.student_count
  })

  const toggleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )
  }

  const handleSwitchToBwengePlus = async () => {
    try {
      setSwitchingSystem(true)

      const result = await dispatch(generateSSOToken("BWENGE_PLUS")).unwrap()

      window.open(result.redirect_url, '_blank')
    } catch (error) {
      console.error('Failed to switch system:', error)
    } finally {
      setSwitchingSystem(false)
      setShowSystemMenu(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  const isActiveLink = (href: string) => {
    return pathname === href
  }

  const isActiveSubItem = (subItems?: any[]) => {
    return (subItems?.some(item => pathname === item.href)) ?? false
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-60">
        <div className="px-3 lg:px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left Section - Logo & Mobile Menu */}
            <div className="flex items-center space-x-3">
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
              >
                <Menu className="w-4 h-4 text-gray-700" />
              </button>

              {/* Logo */}
              <Link href="/dashboard/user" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">O</span>
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-bold text-gray-900 text-base leading-tight">Bwenge</h1>
                  <p className="text-[10px] text-gray-500 -mt-0.5">Research Platform</p>
                </div>
              </Link>
            </div>

            {/* Center Section - Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const hasSubItems = item.subItems && item.subItems.length > 0
                const isExpanded = expandedItems.includes(item.title)
                const itemActive = item.href ? isActiveLink(item.href) : isActiveSubItem(item.subItems)

                return (
                  <div key={item.title} className="relative">
                    {hasSubItems ? (
                      <div className="relative">
                        <button
                          onClick={() => toggleExpand(item.title)}
                          className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg transition-all min-w-[65px] ${itemActive
                              ? 'text-[#0158B7]'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                          <Icon className="w-4 h-4 mb-0.5" />
                          <span className="text-[13px] font-medium">{item.title}</span>
                          {itemActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0158B7]"></div>}
                        </button>

                        {/* Dropdown Menu */}
                        {isExpanded && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-70">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setExpandedItems([])}
                                className={`block px-3 py-2 text-xs transition-colors ${isActiveLink(subItem.href)
                                    ? 'bg-blue-50 text-[#0158B7] font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
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
                        className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-lg transition-all min-w-[65px] relative ${itemActive
                            ? 'text-[#0158B7]'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className="w-4 h-4 mb-0.5" />
                        <span className="text-[13px] font-medium">{item.title}</span>
                        {itemActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0158B7]"></div>}
                      </Link>
                    )}
                  </div>
                )
              })}
            </div>
            {/* Right Section - User Actions */}
            <div className="flex items-center space-x-1.5">

              {/* ✅ NEW: System Switcher */}
              {hasMultiSystemSession && (
                <div className="relative">
                  <button
                    onClick={() => setShowSystemMenu(!showSystemMenu)}
                    className="flex items-center space-x-1.5 px-2 py-1.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-xs font-medium">Systems</span>
                    </div>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                  </button>

                  {/* System Dropdown */}
                  {showSystemMenu && (
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-70">
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-700">Connected Systems</p>
                      </div>

                      <div className="py-1">
                        {/* Current System - Bwenge */}
                        <div className="px-3 py-2 flex items-center space-x-2 bg-blue-50">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs font-medium text-gray-900">Bwenge (Current)</span>
                        </div>

                        {/* BwengePlus Option */}
                        <button
                          onClick={handleSwitchToBwengePlus}
                          disabled={switchingSystem}
                          className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${activeSystems.includes('BWENGE_PLUS') ? 'bg-green-500' : 'bg-gray-300'
                              }`}></div>
                            <span className="text-xs text-gray-700">BwengePlus</span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-400" />
                        </button>
                      </div>

                      <div className="px-3 py-2 border-t border-gray-100">
                        <p className="text-[10px] text-gray-500">
                          ✓ Single sign-on enabled
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notifications */}
              <Link
                href="/dashboard/user/notifications"
                className="relative p-1.5 text-gray-600 hover:text-[#0158B7] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              </Link>

              {/* User Profile */}
              <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
                <div className="text-right hidden md:block">
                  <p className="text-xs font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize">
                    {user.account_type?.toLowerCase() || "user"} {/* FIXED: Added optional chaining and default value */}
                  </p>
                </div>
                <Link href="/dashboard/user/profile">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white font-semibold text-xs cursor-pointer hover:shadow-md transition-all">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                </Link>
              </div>

              {/* Logout Button - Desktop */}
              <button
                onClick={handleLogout}
                className="hidden lg:flex items-center space-x-1.5 px-2 py-1.5 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Slide-out Menu */}
      {mobileOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-60 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />

          {/* Slide Menu */}
          <div className="fixed top-0 left-0 bottom-0 w-72 bg-white shadow-2xl z-70 lg:hidden overflow-y-auto">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">O</span>
                </div>
                <div>
                  <h1 className="font-bold text-gray-900 text-md">Bwenge</h1>
                  <p className="text-[10px] text-gray-500">Research Platform</p>
                </div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="p-3 space-y-0.5">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                const hasSubItems = item.subItems && item.subItems.length > 0
                const isExpanded = expandedItems.includes(item.title)
                const itemActive = item.href ? isActiveLink(item.href) : isActiveSubItem(item.subItems)

                return (
                  <div key={item.title}>
                    {hasSubItems ? (
                      <div>
                        <button
                          onClick={() => toggleExpand(item.title)}
                          className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors ${itemActive
                              ? 'bg-blue-50 text-[#0158B7]'
                              : 'text-gray-700 hover:bg-gray-50'
                            }`}
                        >
                          <div className="flex items-center space-x-2">
                            <Icon className="w-4 h-4" />
                            <span className="font-medium text-md">{item.title}</span>
                          </div>
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-180' : ''
                              }`}
                          />
                        </button>

                        {isExpanded && (
                          <div className="ml-6 mt-0.5 space-y-0.5">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-2.5 py-2 rounded-lg text-xs transition-colors ${isActiveLink(subItem.href)
                                    ? 'bg-blue-100 text-[#0158B7] font-medium'
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
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center space-x-2 p-2.5 rounded-lg transition-colors ${itemActive
                            ? 'bg-blue-50 text-[#0158B7] font-medium'
                            : 'text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-md">{item.title}</span>
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Mobile User Section & Logout */}
            <div className="p-3 border-t border-gray-200 space-y-2">
              <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-gray-50">
                <div className="w-9 h-9 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-[10px] text-gray-500 capitalize">
                    {user.account_type?.toLowerCase() || "user"} {/* FIXED: Added optional chaining and default value */}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 p-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium text-md">Logout</span>
              </button>
            </div>
          </div>
        </>
      )}
    </>
  )
}