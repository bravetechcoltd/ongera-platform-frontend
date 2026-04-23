"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  LayoutDashboard, User, BookOpen, Users, Calendar,
  MessageSquare, LogOut, Menu, ChevronDown, Bell, X, Star,
  Building2, ChevronLeft, ChevronRight,
} from "lucide-react"
import { logout, generateSSOToken } from "@/lib/features/auth/auth-slice"
import { ExternalLink, CheckCircle } from "lucide-react"

// ─── Constants ──────────────────────────────────────────────────────────────
const SIDEBAR_EXPANDED  = 256  // px — w-64
const SIDEBAR_COLLAPSED = 60   // px — icon-only rail
const HEADER_HEIGHT     = 52   // px
// Below MOBILE_BP → overlay drawer; above → persistent rail/sidebar
const MOBILE_BP         = 768
// Between MOBILE_BP and AUTO_COLLAPSE_BP → auto-collapse to icon rail
const AUTO_COLLAPSE_BP  = 1280

// ─── Institution portal sub-items (original, unchanged) ─────────────────────
const getInstitutionPortalSubItems = (role?: string | null) => {
  switch (role) {
    case "STUDENT":
      return [
        { title: "Portal Home",    href: "/dashboard/user/institution-portal" },
        { title: "My Projects",    href: "/dashboard/user/institution-portal/projects" },
        { title: "Create Project", href: "/dashboard/user/institution-portal/projects/create" },
        { title: "My Feedback",    href: "/dashboard/user/institution-portal/feedback" },
      ]
    case "INDUSTRIAL_SUPERVISOR":
      return [
        { title: "Portal Home",             href: "/dashboard/user/institution-portal" },
        { title: "Review Queue (Stage 2)",   href: "/dashboard/user/institution-portal/projects?status=SUBMITTED" },
        { title: "Assigned Students",        href: "/dashboard/user/institution-portal/students" },
      ]
    case "INSTRUCTOR":
      return [
        { title: "Portal Home",             href: "/dashboard/user/institution-portal" },
        { title: "Review Queue (Stage 3)",   href: "/dashboard/user/institution-portal/projects?status=UNDER_INSTRUCTOR_REVIEW" },
        { title: "My Students' Projects",   href: "/dashboard/user/institution-portal/projects" },
        { title: "Institution Dashboard",    href: "/dashboard/user/institution-portal" },
      ]
    case "INSTITUTION_ADMIN":
      return [
        { title: "Dashboard",           href: "/dashboard/user/institution-portal" },
        { title: "All Projects",        href: "/dashboard/user/institution-portal/projects" },
        { title: "Supervisors",         href: "/dashboard/user/institution-portal/supervisors" },
        { title: "Students",            href: "/dashboard/user/institution-portal/students" },
        { title: "Awaiting Publication",href: "/dashboard/user/institution-portal/projects?status=APPROVED" },
      ]
    default:
      return [{ title: "Portal Home", href: "/dashboard/user/institution-portal" }]
  }
}

// ─── Sidebar items (original logic, unchanged) ───────────────────────────────
const getSidebarItems = (
  accountType: string,
  isInstructor: boolean = false,
  institutionPortalRole?: string | null,
  isIndustrialSupervisor: boolean = false,
  isInstitutionMember: boolean = false
) => {
  return [
    {
      title: "Overview",
      href: "/dashboard/user",
      icon: LayoutDashboard,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
    },
    {
      title: "Research",
      icon: BookOpen,
      roles: ["Student", "Researcher", "Diaspora", "Institution"],
      subItems: [
        { title: "Browse Projects", href: "/dashboard/user/research/browse" },
        { title: "My Projects",     href: "/dashboard/user/research" },
        { title: "Upload Project",  href: "/dashboard/user/research/upload" },
      ],
    },
    {
      title: "Communities",
      icon: Users,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
      subItems: [
        { title: "Browse All",       href: "/dashboard/user/communities" },
        { title: "My Communities",   href: "/dashboard/user/communities/my-communities" },
        { title: "Create Community", href: "/dashboard/user/communities/create" },
      ],
    },
    {
      title: "Events",
      icon: Calendar,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
      subItems: [
        { title: "Browse Events", href: "/dashboard/user/event" },
        { title: "My Events",     href: "/dashboard/user/event/my-events" },
        {
          title: "Create Event",
          href: "/dashboard/user/event/create",
          roles: ["Researcher", "Institution", "Student"],
        },
      ].filter(item => !item.roles || item.roles.includes(accountType)),
    },
    {
      title: "Knowledge",
      icon: MessageSquare,
      roles: ["Student", "Researcher", "Diaspora"],
      subItems: [
        { title: "Q&A Forum",   href: "/dashboard/user/qa" },
        { title: "Ask Question",href: "/dashboard/user/qa/ask" },
        { title: "Blog Posts",  href: "/dashboard/user/blog" },
      ],
    },
    {
      title: "Monthly Star",
      icon: Star,
      href: "/dashboard/user/monthly-star",
      roles: ["Student", "Researcher", "Diaspora", "Institution"],
    },
    {
      title: "Profile",
      href: "/dashboard/user/profile",
      icon: User,
      roles: ["Student", "Researcher", "Institution", "Diaspora"],
    },
    {
      title: "Institution Research Portal",
      icon: Building2,
      roles: ["Institution"],
      subItems: [
        { title: "Dashboard",    href: "/dashboard/user/institution-portal" },
        { title: "Our Students", href: "/dashboard/user/institution-portal/students" },
        { title: "Our Instructors", href: "/dashboard/user/institution-portal/instructors" },
        { title: "Add Member",   href: "/dashboard/user/institution-portal/members/add" },
        { title: "Bulk Upload",  href: "/dashboard/user/bulkusers" },
      ],
    },
    {
      title: "Institution Portal",
      icon: Building2,
      roles: ["Student", "Researcher"],
      requiresInstitutionMember: true,
      subItems: [
        { title: "Portal Home", href: "/dashboard/user/institution-portal" },
        { title: "My Projects", href: "/dashboard/user/institution-portal/projects" },
      ],
    },
  ].filter(item => {
    if (item.roles && !item.roles.includes(accountType)) return false
    if (item.requiresInstitutionMember === true && !isInstitutionMember) return false
    return true
  })
}

// ─── Types ───────────────────────────────────────────────────────────────────
interface SubItem {
  title: string
  href: string
}

interface NavItem {
  title: string
  href?: string
  icon: React.ComponentType<{ className?: string }>
  subItems?: SubItem[]
}

interface CompactNavbarProps {
  children?: React.ReactNode
}

// ─── Sidebar NavItem renderer ─────────────────────────────────────────────────
function SideNavItem({
  item,
  isCollapsed,
  expanded,
  onToggle,
  onClose,
  pathname,
}: {
  item: NavItem
  isCollapsed: boolean
  expanded: boolean
  onToggle: () => void
  onClose: () => void
  pathname: string
}) {
  const Icon = item.icon
  const hasSubItems = !!(item.subItems && item.subItems.length > 0)

  const isLinkActive  = item.href ? pathname === item.href : false
  const hasActiveChild = hasSubItems
    ? item.subItems!.some(s => pathname === s.href || pathname.startsWith(s.href))
    : false
  const groupActive   = isLinkActive || hasActiveChild

  // Simple link
  if (!hasSubItems && item.href) {
    return (
      <Link
        href={item.href}
        onClick={onClose}
        title={isCollapsed ? item.title : undefined}
        className={[
          "relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 group",
          "border-l-[3px]",
          isCollapsed ? "justify-center px-3" : "",
          isLinkActive
            ? "border-l-[#0158B7] bg-[#EFF6FF] text-[#0158B7]"
            : "border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        ].join(" ")}
      >
        <Icon className={[
          "w-[18px] h-[18px] flex-shrink-0 transition-colors",
          isLinkActive ? "text-[#0158B7]" : "text-gray-400 group-hover:text-gray-600",
        ].join(" ")} />
        {!isCollapsed && <span className="truncate">{item.title}</span>}
      </Link>
    )
  }

  // Expandable group
  return (
    <div>
      <button
        onClick={onToggle}
        title={isCollapsed ? item.title : undefined}
        className={[
          "w-full relative flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-150 group",
          "border-l-[3px]",
          isCollapsed ? "justify-center px-3" : "",
          groupActive
            ? "border-l-[#0158B7] bg-[#EFF6FF] text-[#0158B7]"
            : "border-l-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
        ].join(" ")}
      >
        <Icon className={[
          "w-[18px] h-[18px] flex-shrink-0 transition-colors",
          groupActive ? "text-[#0158B7]" : "text-gray-400 group-hover:text-gray-600",
        ].join(" ")} />
        {!isCollapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.title}</span>
            <ChevronDown className={[
              "w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200",
              expanded ? "rotate-180" : "",
              groupActive ? "text-[#0158B7]" : "text-gray-400",
            ].join(" ")} />
          </>
        )}
      </button>

      {/* Sub-items */}
      {expanded && !isCollapsed && item.subItems && (
        <div className="pl-10 pr-2 py-1 space-y-0.5">
          {item.subItems.map(sub => {
            const isSubActive = pathname === sub.href || pathname.startsWith(sub.href)
            return (
              <Link
                key={sub.href}
                href={sub.href}
                onClick={onClose}
                className={[
                  "block px-3 py-2 rounded-md text-xs font-medium transition-all duration-150",
                  isSubActive
                    ? "bg-[#0158B7] text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-800",
                ].join(" ")}
              >
                {sub.title}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CompactNavbar({ children }: CompactNavbarProps) {
  const pathname  = usePathname()
  const dispatch  = useAppDispatch()

  // ── State ──
  const [isMobile,       setIsMobile]       = useState(false)
  const [isCollapsed,    setIsCollapsed]     = useState(false)
  const [drawerOpen,     setDrawerOpen]      = useState(false)   // mobile overlay
  const [expandedItems,  setExpandedItems]   = useState<string[]>([])
  const [showSystemMenu, setShowSystemMenu]  = useState(false)
  const [switchingSystem,setSwitchingSystem] = useState(false)

  const systemMenuRef = useRef<HTMLDivElement>(null)

  // ── Redux ──
  const { user, hasMultiSystemSession, activeSystems } =
    useAppSelector((state) => state.auth)

  // ── Responsive handling ──────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth
      if (w < MOBILE_BP) {
        setIsMobile(true)
        setIsCollapsed(true)
        setDrawerOpen(false)
      } else if (w < AUTO_COLLAPSE_BP) {
        setIsMobile(false)
        setIsCollapsed(true)
      } else {
        setIsMobile(false)
        setIsCollapsed(false)
      }
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  // Close system menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (systemMenuRef.current && !systemMenuRef.current.contains(e.target as Node)) {
        setShowSystemMenu(false)
      }
    }
    if (showSystemMenu) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [showSystemMenu])

  if (!user) return null

  const sidebarItems = getSidebarItems(
    user.account_type || "Student",
    user.is_instructor || false,
    (user as any).institution_portal_role || null,
    (user as any).is_industrial_supervisor || false,
    (user as any).is_institution_member || false
  )

  // ── Handlers ──────────────────────────────────────────────────────────────
  const toggleExpand = (title: string) =>
    setExpandedItems(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    )

  const closeSidebar = () => {
    if (isMobile) setDrawerOpen(false)
  }

  const handleSwitchToBwengePlus = async () => {
    try {
      setSwitchingSystem(true)
      const result = await dispatch(generateSSOToken("BWENGE_PLUS")).unwrap()
      window.open(result.redirect_url, "_blank")
    } catch (_) {
    } finally {
      setSwitchingSystem(false)
      setShowSystemMenu(false)
    }
  }

  const handleLogout = () => dispatch(logout())

  // ── Layout measurements ────────────────────────────────────────────────────
  const sidebarWidth = isMobile
    ? 0
    : isCollapsed
    ? SIDEBAR_COLLAPSED
    : SIDEBAR_EXPANDED

  const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ═══ Mobile overlay backdrop ═══════════════════════════════════════ */}
      {isMobile && drawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 backdrop-blur-[2px]"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ═══ FIXED SIDEBAR ═════════════════════════════════════════════════ */}
      <aside
        style={{ width: isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_EXPANDED }}
        className={[
          "fixed top-0 left-0 h-full flex flex-col bg-white border-r border-gray-200 z-40",
          "transition-all duration-300 ease-in-out",
          isMobile && !drawerOpen ? "-translate-x-full" : "translate-x-0",
          isMobile && drawerOpen  ? "shadow-2xl w-64!" : "",
        ].join(" ")}
      >
        {/* ── Sidebar header ──────────────────────────────────────────────── */}
        <div
          className="flex items-center justify-between px-3 border-b border-gray-100 flex-shrink-0"
          style={{ height: HEADER_HEIGHT }}
        >
          {/* Logo */}
          <Link
            href="/dashboard/user"
            onClick={closeSidebar}
            className={[
              "flex items-center gap-2.5 min-w-0 flex-1",
              isCollapsed && !isMobile ? "justify-center flex-none" : "",
            ].join(" ")}
          >
            <div className="w-7 h-7 bg-[#0158B7] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs tracking-tight">B</span>
            </div>
            {(!isCollapsed || isMobile) && (
              <div className="min-w-0">
                <p className="font-bold text-gray-900 text-sm leading-tight truncate">Bwenge</p>
                <p className="text-[10px] text-gray-400 leading-tight truncate">Research Platform</p>
              </div>
            )}
          </Link>

          {/* Collapse toggle — desktop only */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(c => !c)}
              className="ml-1 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors flex-shrink-0"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed
                ? <ChevronRight className="w-3.5 h-3.5" />
                : <ChevronLeft  className="w-3.5 h-3.5" />}
            </button>
          )}

          {/* Close drawer — mobile only */}
          {isMobile && drawerOpen && (
            <button
              onClick={() => setDrawerOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-200">
          {/* Section label */}
          {!isCollapsed && (
            <p className="px-4 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Navigation
            </p>
          )}

          {sidebarItems.map(item => (
            <SideNavItem
              key={item.title}
              item={item as NavItem}
              isCollapsed={isCollapsed && !isMobile}
              expanded={expandedItems.includes(item.title)}
              onToggle={() => toggleExpand(item.title)}
              onClose={closeSidebar}
              pathname={pathname}
            />
          ))}
        </nav>

        {/* ── Sidebar footer — user card ───────────────────────────────────── */}
        <div className="border-t border-gray-100 p-3 flex-shrink-0">
          {isCollapsed && !isMobile ? (
            /* Collapsed: just avatar + logout */
            <div className="flex flex-col items-center gap-2">
              <Link
                href="/dashboard/user/profile"
                className="w-8 h-8 bg-[#0158B7] rounded-full flex items-center justify-center text-white text-xs font-semibold hover:bg-[#034EA2] transition-colors"
                title={`${user.first_name} ${user.last_name}`}
              >
                {initials}
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Expanded: full user card */
            <div className="flex items-center gap-2.5">
              <Link href="/dashboard/user/profile" className="flex-shrink-0">
                <div className="w-8 h-8 bg-[#0158B7] rounded-full flex items-center justify-center text-white text-xs font-semibold hover:bg-[#034EA2] transition-colors">
                  {initials}
                </div>
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 truncate leading-tight">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[10px] text-gray-400 capitalize truncate leading-tight">
                  {user.account_type?.toLowerCase() || "user"}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="flex-shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ═══ FIXED HEADER ══════════════════════════════════════════════════ */}
      <header
        className="fixed top-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm transition-all duration-300"
        style={{ left: sidebarWidth, height: HEADER_HEIGHT }}
      >
        <div className="h-full px-3 sm:px-4 flex items-center justify-between gap-3">

          {/* Left ── mobile hamburger + page context */}
          <div className="flex items-center gap-2.5 min-w-0">
            {isMobile && (
              <button
                onClick={() => setDrawerOpen(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0"
              >
                <Menu className="w-4 h-4" />
              </button>
            )}

            {/* On mobile show logo; on desktop show page title */}
            <div className="hidden sm:block min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight truncate">
                Research Platform
              </p>
              <p className="text-[10px] text-gray-400 leading-tight truncate">
                Welcome back, {user.first_name}
              </p>
            </div>

            {/* Mobile logo substitute */}
            {isMobile && (
              <Link href="/dashboard/user" className="flex items-center gap-1.5 sm:hidden">
                <div className="w-6 h-6 bg-[#0158B7] rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-[10px]">B</span>
                </div>
                <span className="font-bold text-gray-900 text-sm">Bwenge</span>
              </Link>
            )}
          </div>

          {/* Right ── actions */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* ── System Switcher (original functionality) ────────────────── */}
            {hasMultiSystemSession && (
              <div className="relative" ref={systemMenuRef}>
                <button
                  onClick={() => setShowSystemMenu(s => !s)}
                  className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                  <span className="hidden sm:inline">Systems</span>
                  <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                </button>

                {showSystemMenu && (
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-70 overflow-hidden">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-xs font-semibold text-gray-700">Connected Systems</p>
                    </div>
                    <div className="py-1">
                      {/* Current — Bwenge */}
                      <div className="px-3 py-2 flex items-center gap-2 bg-[#EFF6FF]">
                        <span className="w-2 h-2 bg-[#0158B7] rounded-full" />
                        <span className="text-xs font-medium text-[#0158B7]">Bwenge (Current)</span>
                      </div>
                      {/* BwengePlus */}
                      <button
                        onClick={handleSwitchToBwengePlus}
                        disabled={switchingSystem}
                        className="w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <div className="flex items-center gap-2">
                          <span className={[
                            "w-2 h-2 rounded-full",
                            activeSystems.includes("BWENGE_PLUS") ? "bg-green-500" : "bg-gray-300",
                          ].join(" ")} />
                          <span className="text-xs text-gray-700">
                            {switchingSystem ? "Switching…" : "BwengePlus"}
                          </span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                    <div className="px-3 py-2 border-t border-gray-100">
                      <p className="text-[10px] text-gray-400">✓ Single sign-on enabled</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Notifications ────────────────────────────────────────────── */}
            <Link
              href="/dashboard/user/notifications"
              className="relative p-1.5 text-gray-500 hover:text-[#0158B7] hover:bg-[#EFF6FF] rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </Link>

            {/* ── User identity — desktop ──────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-gray-200">
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-900 leading-tight">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-[10px] text-gray-400 capitalize leading-tight">
                  {user.account_type?.toLowerCase() || "user"}
                </p>
              </div>
              <Link href="/dashboard/user/profile">
                <div className="w-8 h-8 bg-[#0158B7] rounded-full flex items-center justify-center text-white text-xs font-semibold hover:bg-[#034EA2] transition-colors shadow-sm">
                  {initials}
                </div>
              </Link>
            </div>

            {/* ── Logout — desktop ─────────────────────────────────────────── */}
            <button
              onClick={handleLogout}
              className="hidden lg:flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-0.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ══════════════════════════════════════════════════ */}
      <main
        className="transition-all duration-300 overflow-y-auto overflow-x-hidden bg-gray-50"
        style={{
          marginLeft: sidebarWidth,
          paddingTop: HEADER_HEIGHT,
          minHeight: "100vh",
        }}
      >
        <div className="p-3 md:p-4 lg:p-5">
          {children}
        </div>
      </main>
    </div>
  )
}