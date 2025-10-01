// @ts-nocheck

"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter, usePathname } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '@/lib/features/auth/auth-slice'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  Menu, X, Bell, MessageCircle, User, LogOut, ChevronRight,
  LayoutDashboard, Users, BookOpen, Calendar, MessageSquare, Settings,
  FileText, Shield, Mail, Flag, BarChart3, UserPlus, Database, Lock, Globe,
  PenTool, FileEdit
} from 'lucide-react'

// Admin sidebar navigation structure
const adminSidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard/admin",
    icon: LayoutDashboard,
  },
  {
    title: "User Management",
    icon: Users,
    subItems: [
      { title: "Manage Users", href: "/dashboard/admin/users" }
    ]
  },
  {
    title: "Research Projects",
    icon: BookOpen,
    subItems: [
      { title: "Manage Projects", href: "/dashboard/admin/research" }
    ]
  },
  {
    title: "Communities",
    icon: Users,
    subItems: [
      { title: "Manage Communities", href: "/dashboard/admin/communities" },
      { title: "Pending Approvals", href: "/dashboard/admin/communities/pending" }
    ]
  },
  {
    title: "Events",
    icon: Calendar,
    subItems: [
      { title: "Manage Events", href: "/dashboard/admin/events" }
    ]
  },
  {
    title: "Q&A Forum",
    icon: MessageSquare,
    subItems: [
      { title: "Manage Questions", href: "/dashboard/admin/qa" }
    ]
  },
  {
    title: "Blogs",
    icon: PenTool,
    subItems: [
      { title: "Blog Posts", href: "/dashboard/admin/blogs" }
    ]
  },
]

export default function OngeraAdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch<AppDispatch>()
  const router = useRouter()
  const pathname = usePathname()
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false)
      }
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  useEffect(() => {
    if (!isAuthenticated || user?.account_type !== "admin") {
      router.push("/login")
    }
  }, [isAuthenticated, user, router])

  // Auto-expand menu items based on current path
  useEffect(() => {
    const currentItem = adminSidebarItems.find(item => 
      item.subItems?.some(sub => pathname?.startsWith(sub.href))
    )
    if (currentItem) {
      setExpandedItem(currentItem.title)
    }
  }, [pathname])

  const handleLogout = () => {
    dispatch(logout())
    window.location.href = '/'
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const toggleExpanded = (title: string) => {
    setExpandedItem(expandedItem === title ? null : title)
  }

  const closeSidebar = () => {
    if (isMobile) {
      setIsSidebarOpen(false)
    }
  }

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    router.push(href)
    closeSidebar()
  }

  const isActivePath = (href: string) => {
    return pathname === href
  }

  const isActiveSection = (item: any) => {
    if (item.href) return pathname === item.href
    if (item.subItems) {
      return item.subItems.some((sub: any) => pathname?.startsWith(sub.href))
    }
    return false
  }

  if (!isAuthenticated || user?.account_type !== "admin") {
    return null
  }

  if (!isMounted) {
    return (
      <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#0158B7] to-[#5E96D2] bg-clip-text text-transparent">
                  Ongera Admin
                </h2>
                <p className="text-xs text-gray-600">Research Platform</p>
              </div>
            </div>
          </div>
        </header>
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5">
      {/* Header - Fixed */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-[#0158B7] to-[#5E96D2] bg-clip-text text-transparent">
                  Ongera Admin
                </h2>
                <p className="text-xs text-gray-600">Research Platform</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#0158B7] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">3</span>
              </div>
            </button>

            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <MessageCircle className="h-4 w-4" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5E96D2] rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">5</span>
              </div>
            </button>

            {/* Profile Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
                <span className="hidden sm:inline text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </span>
              </button>
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-gray-200">
                <div className="py-1">
                  <a 
                    href="/dashboard/admin/profile"
                    onClick={(e) => handleNavigation(e, "/dashboard/admin/profile")}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </a>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Fixed */}
        <aside
          className={`fixed top-[3.25rem] left-0 z-40 h-[calc(100vh-3.25rem)] w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-4 border-b border-white/20 bg-white/50 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg flex items-center justify-center shadow-lg">
                  <Shield className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#0158B7] rounded-full border-2 border-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-[#0158B7] to-[#5E96D2] bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-600">Full Control</p>
              </div>
            </div>
            {isMobile && (
              <button
                onClick={closeSidebar}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <nav className="h-[calc(100%-4rem)] overflow-y-auto custom-scrollbar pb-10">
            <div className="p-2 space-y-1">
              {adminSidebarItems.map((item) => (
                <div key={item.title} className="space-y-1">
                  {item.href ? (
                    <a 
                      href={item.href} 
                      onClick={(e) => handleNavigation(e, item.href)}
                      className={`block ${isActivePath(item.href) ? 'bg-gradient-to-r from-[#0158B7]/10 to-[#5E96D2]/10' : ''}`}
                    >
                      <div className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-[#0158B7]/10 hover:to-[#5E96D2]/10 transition-all duration-200 cursor-pointer">
                        <div className="p-1.5 rounded-md bg-gradient-to-br from-[#0158B7]/10 to-[#5E96D2]/10 group-hover:from-[#0158B7]/20 group-hover:to-[#5E96D2]/20 transition-all duration-200">
                          <item.icon className={`h-4 w-4 ${isActivePath(item.href) ? 'text-[#0158B7]' : 'text-[#0158B7]'}`} />
                        </div>
                        <span className={`text-sm ${isActivePath(item.href) ? 'text-[#0158B7] font-semibold' : 'text-gray-700'} group-hover:text-gray-900 transition-colors`}>
                          {item.title}
                        </span>
                      </div>
                    </a>
                  ) : (
                    <>
                      <button
                        onClick={() => toggleExpanded(item.title)}
                        className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-[#0158B7]/10 hover:to-[#5E96D2]/10 transition-all duration-200 ${
                          isActiveSection(item) ? 'bg-gradient-to-r from-[#0158B7]/10 to-[#5E96D2]/10' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-gradient-to-br from-[#0158B7]/10 to-[#5E96D2]/10 group-hover:from-[#0158B7]/20 group-hover:to-[#5E96D2]/20 transition-all duration-200">
                            <item.icon className={`h-4 w-4 ${isActiveSection(item) ? 'text-[#0158B7]' : 'text-[#0158B7]'}`} />
                          </div>
                          <span className={`text-sm ${isActiveSection(item) ? 'text-[#0158B7] font-semibold' : 'text-gray-700'} group-hover:text-gray-900 transition-colors`}>
                            {item.title}
                          </span>
                        </div>
                        <div className={`transition-transform duration-200 ${expandedItem === item.title ? 'rotate-90' : ''}`}>
                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-[#0158B7]" />
                        </div>
                      </button>
                      <AnimatePresence>
                        {expandedItem === item.title && item.subItems && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="ml-8 space-y-1"
                          >
                            {item.subItems.map((subItem) => (
                              <a 
                                key={subItem.href} 
                                href={subItem.href} 
                                onClick={(e) => handleNavigation(e, subItem.href)}
                                className="block"
                              >
                                <div className={`group flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-[#0158B7]/5 transition-all duration-200 cursor-pointer ${
                                  isActivePath(subItem.href) ? 'bg-[#0158B7]/5' : ''
                                }`}>
                                  <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#0158B7] to-[#5E96D2] group-hover:scale-125 transition-transform ${
                                    isActivePath(subItem.href) ? 'scale-125' : ''
                                  }`} />
                                  <span className={`text-sm font-medium ${
                                    isActivePath(subItem.href) ? 'text-[#0158B7] font-semibold' : 'text-gray-600'
                                  } group-hover:text-[#0158B7] transition-colors`}>
                                    {subItem.title}
                                  </span>
                                </div>
                              </a>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </aside>

        {/* Main Content - Only this section refreshes */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50/50 via-[#0158B7]/5 to-[#5E96D2]/5">
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(1, 88, 183, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(1, 88, 183, 0.5);
        }
      `}</style>
    </div>
  )
}