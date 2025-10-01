// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  getAllProjectsForAdmin,
  activateDeactivateProject,
  deleteProjectByAdmin,
} from "@/lib/features/auth/projectSlice"
import { useParams } from "next/navigation"

import {
  getAllEventsForAdmin,
  activateDeactivateEvent,
  cancelEventPermanently,
} from "@/lib/features/auth/eventsSlice"
import {
  fetchBlogs,
  updateBlogStatus,
  deleteBlog,
} from "@/lib/features/auth/blogSlices"
import {
  fetchQAThreads,
  deleteThread,
  updateThread,
} from "@/lib/features/auth/qaSlice"
import {
  FolderOpen,
  Calendar,
  FileText,
  MessageSquare,
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  ThumbsUp,
  MessageCircle,
  BarChart3,
  Loader2,
  AlertCircle,
  Shield,
  BookOpen,
  Tag,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  CheckCircle2,
  RefreshCw,
  X,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import Link from "next/link"

interface Tab {
  id: string
  label: string
  icon: any
  count: number
}

type StatusFilter = 'all' | 'Published' | 'Draft' | 'Archived' | 'Upcoming' | 'Completed' | 'Cancelled' | 'Answered' | 'Unanswered'

// Action Modal Component
interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
  type: 'project' | 'event' | 'blog' | 'qa'
  action: 'view' | 'edit' | 'delete' | 'publish' | 'archive' | 'activate' | 'deactivate'
  onConfirm?: () => void
  isSubmitting?: boolean
}

function ActionModal({ isOpen, onClose, item, type, action, onConfirm, isSubmitting }: ActionModalProps) {
  if (!isOpen || !item) return null

  const getActionConfig = () => {
    const config = {
      view: {
        title: "View Details",
        description: `View complete information about this ${type}`,
        icon: Eye,
        color: "bg-blue-500",
        confirmText: "Close",
        showCancel: false
      },
      delete: {
        title: `Delete ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        description: `Are you sure you want to delete this ${type}? This action cannot be undone.`,
        icon: Trash2,
        color: "bg-red-500",
        confirmText: "Delete",
        showCancel: true
      },
      publish: {
        title: "Publish",
        description: `Publish this ${type} to make it publicly visible?`,
        icon: CheckCircle,
        color: "bg-green-500",
        confirmText: "Publish",
        showCancel: true
      },
      archive: {
        title: "Archive",
        description: `Archive this ${type}? It will be hidden from public view.`,
        icon: XCircle,
        color: "bg-orange-500",
        confirmText: "Archive",
        showCancel: true
      },
      activate: {
        title: "Activate",
        description: `Activate this ${type}?`,
        icon: CheckCircle,
        color: "bg-green-500",
        confirmText: "Activate",
        showCancel: true
      },
      deactivate: {
        title: "Deactivate",
        description: `Deactivate this ${type}?`,
        icon: XCircle,
        color: "bg-orange-500",
        confirmText: "Deactivate",
        showCancel: true
      }
    }
    return config[action] || config.view
  }

  const config = getActionConfig()
  const Icon = config.icon

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        {/* Header */}

        <div className={`${config.color} px-6 py-4 rounded-t-xl`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{config.title}</h3>
              <p className="text-white/90 text-sm">{config.description}</p>
            </div>
          </div>
        </div>

        {/* Body - Show details for view action */}
        {action === 'view' && (
          <div className="p-6 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {/* Item-specific details */}
              {type === 'project' && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.abstract}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{item.research_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">{item.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Visibility:</span>
                      <p className="font-medium">{item.visibility}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <p className="font-medium">{item.view_count || 0}</p>
                    </div>
                  </div>
                </>
              )}

              {type === 'event' && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Type:</span>
                      <p className="font-medium">{item.event_type}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Mode:</span>
                      <p className="font-medium">{item.event_mode}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">{item.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Attendees:</span>
                      <p className="font-medium">{item.attendees?.length || 0}</p>
                    </div>
                  </div>
                </>
              )}

              {type === 'blog' && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600">{item.excerpt}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{item.category}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">{item.status}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Reading Time:</span>
                      <p className="font-medium">{item.reading_time_minutes} min</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <p className="font-medium">{item.view_count || 0}</p>
                    </div>
                  </div>
                </>
              )}

              {type === 'qa' && (
                <>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.content?.replace(/<[^>]*>/g, '')}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Status:</span>
                      <p className="font-medium">{item.is_answered ? 'Answered' : 'Unanswered'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Answers:</span>
                      <p className="font-medium">{item.answer_count || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Views:</span>
                      <p className="font-medium">{item.view_count || 0}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{item.category || 'General'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          {config.showCancel && (
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center space-x-2 ${
              action === 'delete' 
                ? 'bg-red-600 hover:bg-red-700' 
                : action === 'view'
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-green-600 hover:bg-green-700'
            } disabled:opacity-50`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{config.confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ManageResourcesPage() {
  const [activeTab, setActiveTab] = useState("projects")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [typeFilter, setTypeFilter] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const params = useParams()
  const communityId = params.id as string
  
  // Modal states
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    item: any
    type: 'project' | 'event' | 'blog' | 'qa'
    action: 'view' | 'edit' | 'delete' | 'publish' | 'archive' | 'activate' | 'deactivate'
  }>({
    isOpen: false,
    item: null,
    type: 'project',
    action: 'view'
  })

  const dispatch = useAppDispatch()
  
  // Get data from Redux store
  const { adminProjects, isLoading: projectsLoading, isSubmitting: projectsSubmitting } = useAppSelector((state) => state.projects)
  const { adminEvents, isLoading: eventsLoading, isSubmitting: eventsSubmitting } = useAppSelector((state) => state.events)
  const { blogs, isLoading: blogsLoading, isSubmitting: blogsSubmitting } = useAppSelector((state) => state.blog)
  const { threads, isLoading: qaLoading, isSubmitting: qaSubmitting } = useAppSelector((state) => state.qa)

  const isLoading = projectsLoading || eventsLoading || blogsLoading || qaLoading
  const isSubmitting = projectsSubmitting || eventsSubmitting || blogsSubmitting || qaSubmitting

  // Enhanced useEffect to fetch all data at once
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await dispatch(getAllProjectsForAdmin({ page: 1, limit: 1000 }))
        await dispatch(getAllEventsForAdmin({ page: 1, limit: 1000 }))
        await dispatch(fetchBlogs({ page: 1, limit: 1000 }))
        await dispatch(fetchQAThreads({ page: 1, limit: 1000 }))
        toast.success("All resources loaded successfully!")
      } catch (error) {
        toast.error("Failed to load some resources")
      }
    }

    fetchAllData()
  }, [dispatch])

const tabs: Tab[] = [
  { 
    id: "projects", 
    label: "Projects", 
    icon: FolderOpen, 
    count: adminProjects.filter(project => !project.author?.instructor).length 
  },
  { 
    id: "events", 
    label: "Events", 
    icon: Calendar, 
    count: adminEvents.length 
  },
  { 
    id: "blogs", 
    label: "Blogs", 
    icon: FileText, 
    count: blogs.length 
  },
  { 
    id: "qa", 
    label: "Q&A", 
    icon: MessageSquare, 
    count: threads.length 
  },
]

  const handleRefresh = () => {
    const fetchData = async () => {
      try {
        switch (activeTab) {
          case "projects":
            await dispatch(getAllProjectsForAdmin({ page: 1, limit: 1000 }))
            break
          case "events":
            await dispatch(getAllEventsForAdmin({ page: 1, limit: 1000 }))
            break
          case "blogs":
            await dispatch(fetchBlogs({ page: 1, limit: 1000 }))
            break
          case "qa":
            await dispatch(fetchQAThreads({ page: 1, limit: 1000 }))
            break
        }
        toast.success(`${tabs.find(t => t.id === activeTab)?.label} refreshed successfully!`)
      } catch (error) {
        toast.error("Failed to refresh data")
      }
    }

    fetchData()
    setCurrentPage(1)
  }

  const getCurrentData = () => {
    switch (activeTab) {
      case "projects": return adminProjects
      case "events": return adminEvents
      case "blogs": return blogs
      case "qa": return threads
      default: return []
    }
  }

const getStats = () => {
  const data = getCurrentData()
  switch (activeTab) {
    case "projects":
      // Filter out projects with instructors for accurate stats
      const filteredProjects = data.filter((project: any) => !project.author?.instructor)
      return {
        total: filteredProjects.length,
        published: filteredProjects.filter((p: any) => p.status === 'Published').length,
        draft: filteredProjects.filter((p: any) => p.status === 'Draft').length,
        archived: filteredProjects.filter((p: any) => p.status === 'Archived').length
      }
    case "events":
      return {
        total: data.length,
        upcoming: data.filter((e: any) => e.status === 'Upcoming').length,
        ongoing: data.filter((e: any) => e.status === 'Ongoing').length,
        completed: data.filter((e: any) => e.status === 'Completed').length
      }
    case "blogs":
      return {
        total: data.length,
        published: data.filter((b: any) => b.status === 'Published').length,
        draft: data.filter((b: any) => b.status === 'Draft').length,
        archived: data.filter((b: any) => b.status === 'Archived').length
      }
    case "qa":
      return {
        total: data.length,
        answered: data.filter((t: any) => t.is_answered).length,
        unanswered: data.filter((t: any) => !t.is_answered).length
      }
    default:
      return { total: 0 }
  }
}

  const stats = getStats()

  // Modal handlers
  const openModal = (item: any, type: 'project' | 'event' | 'blog' | 'qa', action: 'view' | 'edit' | 'delete' | 'publish' | 'archive' | 'activate' | 'deactivate') => {
    setModalState({
      isOpen: true,
      item,
      type,
      action
    })
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      item: null,
      type: 'project',
      action: 'view'
    })
  }

  // Action handlers
  const handleProjectStatusChange = async (projectId: string, newStatus: 'Published' | 'Archived') => {
    try {
      await dispatch(activateDeactivateProject({
        id: projectId,
        status: newStatus,
        reason: `Status changed to ${newStatus}`
      })).unwrap()
      toast.success(`Project ${newStatus === 'Published' ? 'published' : 'archived'} successfully!`)
      closeModal()
    } catch (error: any) {
      toast.error(error || "Failed to update project status")
    }
  }

  const handleProjectDelete = async (projectId: string) => {
    try {
      await dispatch(deleteProjectByAdmin(projectId)).unwrap()
      toast.success("Project deleted successfully!")
      closeModal()
    } catch (error: any) {
      toast.error(error || "Failed to delete project")
    }
  }

  const handleEventStatusChange = async (eventId: string, newStatus: 'Upcoming' | 'Cancelled') => {
    try {
      await dispatch(activateDeactivateEvent({
        id: eventId,
        status: newStatus,
        reason: `Status changed to ${newStatus}`
      })).unwrap()
      toast.success(`Event ${newStatus === 'Upcoming' ? 'activated' : 'cancelled'} successfully!`)
      closeModal()
    } catch (error: any) {
      toast.error(error || "Failed to update event status")
    }
  }

  const handleEventDelete = async (eventId: string) => {
    try {
      await dispatch(cancelEventPermanently({
        id: eventId,
        reason: "Event cancelled by admin"
      })).unwrap()
      toast.success("Event cancelled successfully!")
      closeModal()
    } catch (error: any) {
      toast.error(error || "Failed to cancel event")
    }
  }

  const handleBlogStatusChange = async (blogId: string, newStatus: 'Published' | 'Draft' | 'Archived' | 'Under Review') => {
    try {
      await dispatch(updateBlogStatus({ id: blogId, status: newStatus })).unwrap()
      toast.success(`Blog status updated to ${newStatus}!`)
      closeModal()
    } catch (error: any) {
      toast.error(error || "Failed to update blog status")
    }
  }

  const handleBlogDelete = async (blogId: string) => {
    try {
      await dispatch(deleteBlog(blogId)).unwrap()
      toast.success("Blog deleted successfully!")
      closeModal()
    } catch (error: any) {
      toast.error(error || "Failed to delete blog")
    }
  }

  const handleQAStatusChange = async (threadId: string, isAnswered: boolean) => {
    try {
      await dispatch(updateThread({
        id: threadId,
        data: { is_answered: !isAnswered }
      })).unwrap()
      toast.success(`Question marked as ${!isAnswered ? 'answered' : 'unanswered'}!`)
      closeModal()
    } catch (error: any) {
      toast.error(error || "Failed to update question status")
    }
  }

  const handleQADelete = async (threadId: string) => {
    try {
      await dispatch(deleteThread(threadId)).unwrap()
      toast.success("Question deleted successfully!")
      closeModal()
    } catch (error: any) {
      toast.error(error || "Failed to delete question")
    }
  }

  const handleModalConfirm = () => {
    const { item, type, action } = modalState

    switch (type) {
      case 'project':
        if (action === 'delete') {
          handleProjectDelete(item.id)
        } else if (action === 'publish') {
          handleProjectStatusChange(item.id, 'Published')
        } else if (action === 'archive') {
          handleProjectStatusChange(item.id, 'Archived')
        } else {
          closeModal()
        }
        break

      case 'event':
        if (action === 'delete') {
          handleEventDelete(item.id)
        } else if (action === 'activate') {
          handleEventStatusChange(item.id, 'Upcoming')
        } else if (action === 'deactivate') {
          handleEventStatusChange(item.id, 'Cancelled')
        } else {
          closeModal()
        }
        break

      case 'blog':
        if (action === 'delete') {
          handleBlogDelete(item.id)
        } else if (action === 'publish') {
          handleBlogStatusChange(item.id, 'Published')
        } else if (action === 'archive') {
          handleBlogStatusChange(item.id, 'Archived')
        } else {
          closeModal()
        }
        break

      case 'qa':
        if (action === 'delete') {
          handleQADelete(item.id)
        } else if (action === 'activate') {
          handleQAStatusChange(item.id, false)
        } else if (action === 'deactivate') {
          handleQAStatusChange(item.id, true)
        } else {
          closeModal()
        }
        break

      default:
        closeModal()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
                      <Link
    href={`/dashboard/user/communities/dashboard/${communityId}`} // You'll need to get communityId from props or context
    className="flex items-center gap-2 text-sm font-semibold text-[#0158B7] hover:text-[#0158B7]/80 transition-colors px-4 py-2 border border-[#0158B7] rounded-lg hover:bg-[#0158B7]/5"
  >
    <ArrowLeft className="w-4 h-4" />
    <span>Back to Community</span>
  </Link>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0158B7] rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Manage Community Resources
                </h1>
                <p className="text-xs text-gray-500">
                  Manage and moderate all community content in one place
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all text-sm ${
                  showFilters
                    ? "bg-[#0158B7] text-white border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filters
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-3 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            {activeTab === "projects" && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3">
                  <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total Projects</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-3">
                  <p className="text-xl font-bold text-green-600">{stats.published}</p>
                  <p className="text-xs text-gray-600">Published</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-3">
                  <p className="text-xl font-bold text-gray-600">{stats.draft}</p>
                  <p className="text-xs text-gray-600">Drafts</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-3">
                  <p className="text-xl font-bold text-orange-600">{stats.archived}</p>
                  <p className="text-xs text-gray-600">Archived</p>
                </div>
              </>
            )}
            {activeTab === "events" && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3">
                  <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total Events</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-3">
                  <p className="text-xl font-bold text-green-600">{stats.upcoming}</p>
                  <p className="text-xs text-gray-600">Upcoming</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-3">
                  <p className="text-xl font-bold text-purple-600">{stats.ongoing}</p>
                  <p className="text-xs text-gray-600">Ongoing</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-3">
                  <p className="text-xl font-bold text-gray-600">{stats.completed}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
              </>
            )}
            {activeTab === "blogs" && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3">
                  <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total Blogs</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-3">
                  <p className="text-xl font-bold text-green-600">{stats.published}</p>
                  <p className="text-xs text-gray-600">Published</p>
                </div>
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-3">
                  <p className="text-xl font-bold text-gray-600">{stats.draft}</p>
                  <p className="text-xs text-gray-600">Drafts</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-3">
                  <p className="text-xl font-bold text-orange-600">{stats.archived}</p>
                  <p className="text-xs text-gray-600">Archived</p>
                </div>
              </>
            )}
            {activeTab === "qa" && (
              <>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-3">
                  <p className="text-xl font-bold text-blue-600">{stats.total}</p>
                  <p className="text-xs text-gray-600">Total Questions</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-3">
                  <p className="text-xl font-bold text-green-600">{stats.answered}</p>
                  <p className="text-xs text-gray-600">Answered</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-3">
                  <p className="text-xl font-bold text-orange-600">{stats.unanswered}</p>
                  <p className="text-xs text-gray-600">Unanswered</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-3">
                  <p className="text-xl font-bold text-purple-600">
                    {threads.reduce((acc: number, thread: any) => acc + (thread.answer_count || 0), 0)}
                  </p>
                  <p className="text-xs text-gray-600">Total Answers</p>
                </div>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7]"
            />
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3"
              >
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] text-sm"
                >
                  <option value="all">All Status</option>
                  {activeTab === "projects" && (
                    <>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </>
                  )}
                  {activeTab === "events" && (
                    <>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Ongoing">Ongoing</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </>
                  )}
                  {activeTab === "blogs" && (
                    <>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                      <option value="Archived">Archived</option>
                    </>
                  )}
                  {activeTab === "qa" && (
                    <>
                      <option value="Answered">Answered</option>
                      <option value="Unanswered">Unanswered</option>
                    </>
                  )}
                </select>

                {activeTab === "projects" && (
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="Thesis">Thesis</option>
                    <option value="Paper">Paper</option>
                    <option value="Project">Project</option>
                    <option value="Dataset">Dataset</option>
                    <option value="Case Study">Case Study</option>
                  </select>
                )}

                {activeTab === "events" && (
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] text-sm"
                  >
                    <option value="">All Event Types</option>
                    <option value="Webinar">Webinar</option>
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Meetup">Meetup</option>
                  </select>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-2 mb-4">
          <div className="flex space-x-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
                    activeTab === tab.id
                      ? "bg-[#0158B7] text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className="px-2 py-0.5 bg-white/20 text-white rounded-full text-xs font-semibold min-w-6">
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          {activeTab === "projects" && (
            <ProjectsTable 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              onAction={(item, action) => openModal(item, 'project', action)}
              isSubmitting={isSubmitting}
            />
          )}
          {activeTab === "events" && (
            <EventsTable 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              onAction={(item, action) => openModal(item, 'event', action)}
              isSubmitting={isSubmitting}
            />
          )}
          {activeTab === "blogs" && (
            <BlogsTable 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              onAction={(item, action) => openModal(item, 'blog', action)}
              isSubmitting={isSubmitting}
            />
          )}
          {activeTab === "qa" && (
            <QATable 
              searchQuery={searchQuery}
              statusFilter={statusFilter}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
              onAction={(item, action) => openModal(item, 'qa', action)}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </div>

      {/* Action Modal */}
      <ActionModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        item={modalState.item}
        type={modalState.type}
        action={modalState.action}
        onConfirm={handleModalConfirm}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

// Enhanced Projects Table Component with Dynamic Actions
function ProjectsTable({ 
  searchQuery, 
  statusFilter, 
  typeFilter,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onAction,
  isSubmitting
}: { 
  searchQuery: string
  statusFilter: string
  typeFilter: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onAction: (item: any, action: string) => void
  isSubmitting: boolean
}) {
  const dispatch = useAppDispatch()
  const { adminProjects, isLoading } = useAppSelector((state) => state.projects)

  // Filter projects - EXCLUDE projects with instructor
  const filteredProjects = adminProjects.filter(project => {
    // Exclude projects that have an instructor (managed on instructor side)
    if (project.author?.instructor) return false
    
    if (statusFilter !== 'all' && project.status !== statusFilter) return false
    if (typeFilter && project.research_type !== typeFilter) return false
    if (searchQuery && !project.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !project.abstract.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Pagination
  const totalItems = filteredProjects.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageProjects = filteredProjects.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    const config = {
      'Published': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
      'Archived': { bg: 'bg-orange-100', text: 'text-orange-700', icon: XCircle },
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText }
    
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const getVisibilityBadge = (visibility: string) => {
    const config = {
      'Public': { bg: 'bg-blue-100', text: 'text-blue-700' },
      'Community-Only': { bg: 'bg-purple-100', text: 'text-purple-700' },
      'Private': { bg: 'bg-gray-100', text: 'text-gray-700' }
    }[visibility] || { bg: 'bg-gray-100', text: 'text-gray-700' }
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {visibility}
      </span>
    )
  }

  // Add a function to check if project has instructor
  const hasInstructor = (project: any) => {
    return project.author?.instructor !== null && project.author?.instructor !== undefined
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0158B7] text-white">
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">#</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Project</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Author</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Type</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Visibility</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Status</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Instructor</th>
            <th className="px-3 py-3 text-center text-xs font-bold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentPageProjects.map((project, index) => (
            <motion.tr
              key={project.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-blue-50 transition-colors group"
            >
              {/* Number */}
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="w-7 h-7 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {startIndex + index + 1}
                  </span>
                </div>
              </td>

              {/* Project Info */}
              <td className="px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                      {project.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {project.view_count || 0} views
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {project.like_count || 0} likes
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Author */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">
                    {project.author?.first_name?.[0]}{project.author?.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.author?.first_name} {project.author?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {project.author?.email}
                    </p>
                  </div>
                </div>
              </td>
              
              {/* Type */}
              <td className="px-3 py-3 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <BookOpen className="w-3 h-3 mr-1" />
                  {project.research_type}
                </span>
              </td>
              
              {/* Visibility */}
              <td className="px-3 py-3 whitespace-nowrap">
                {getVisibilityBadge(project.visibility)}
              </td>
              
              {/* Status */}
              <td className="px-3 py-3 whitespace-nowrap">
                {getStatusBadge(project.status)}
              </td>
              
              {/* Instructor Status */}
              <td className="px-3 py-3 whitespace-nowrap">
                {hasInstructor(project) ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                    <Shield className="w-3 h-3" />
                    Has Instructor
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <Users className="w-3 h-3" />
                    No Instructor
                  </span>
                )}
              </td>
              
              {/* Actions */}
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="flex items-center justify-center space-x-1">
                  {project.status === 'Published' ? (
                    <button
                      onClick={() => onAction(project, 'archive')}
                      disabled={isSubmitting}
                      className="p-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                      title="Archive Project"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onAction(project, 'publish')}
                      disabled={isSubmitting}
                      className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                      title="Publish Project"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onAction(project, 'delete')}
                    disabled={isSubmitting}
                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(endIndex, totalItems)}
              </span>{" "}
              of <span className="font-semibold">{totalItems}</span>
              <span className="ml-2 text-gray-500">
                (Excluding {adminProjects.length - totalItems} projects with instructors)
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#0158B7] text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  onItemsPerPageChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:ring-1 focus:ring-[#0158B7]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// Enhanced Events Table Component with Dynamic Actions
function EventsTable({ 
  searchQuery, 
  statusFilter, 
  typeFilter,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onAction,
  isSubmitting
}: { 
  searchQuery: string
  statusFilter: string
  typeFilter: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onAction: (item: any, action: string) => void
  isSubmitting: boolean
}) {
  const dispatch = useAppDispatch()
  const { adminEvents, isLoading } = useAppSelector((state) => state.events)

  // Filter events
  const filteredEvents = adminEvents.filter(event => {
    if (statusFilter !== 'all' && event.status !== statusFilter) return false
    if (typeFilter && event.event_type !== typeFilter) return false
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !event.description.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Pagination
  const totalItems = filteredEvents.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageEvents = filteredEvents.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    const config = {
      'Upcoming': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      'Ongoing': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      'Completed': { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle2 },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: Clock }
    
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0158B7] text-white">
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">#</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Event</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Date & Time</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Mode</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Status</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Attendees</th>
            <th className="px-3 py-3 text-center text-xs font-bold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentPageEvents.map((event, index) => (
            <motion.tr
              key={event.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-blue-50 transition-colors group"
            >
              {/* Number */}
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="w-7 h-7 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {startIndex + index + 1}
                  </span>
                </div>
              </td>

              {/* Event Info */}
              <td className="px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${
                        event.is_free 
                          ? 'bg-green-100 text-green-700'
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {event.is_free ? 'Free' : `$${event.price_amount}`}
                      </span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700">
                        {event.event_type}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Date & Time */}
              <td className="px-3 py-3">
                <div className="text-sm text-gray-900">
                  {formatDate(event.start_datetime)}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(event.start_datetime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </td>
              
              {/* Mode */}
              <td className="px-3 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.event_mode === 'Online' 
                    ? 'bg-blue-100 text-blue-700'
                    : event.event_mode === 'Physical'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-purple-100 text-purple-700'
                }`}>
                  {event.event_mode}
                </span>
              </td>
              
              {/* Status */}
              <td className="px-3 py-3 whitespace-nowrap">
                {getStatusBadge(event.status)}
              </td>
              
              {/* Attendees */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{event.attendees?.length || 0} registered</span>
                </div>
              </td>
              
              {/* Actions */}
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="flex items-center justify-center space-x-1">
            
                  
                  {event.status === 'Upcoming' ? (
                    <button
                      onClick={() => onAction(event, 'deactivate')}
                      disabled={isSubmitting}
                      className="p-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                      title="Cancel Event"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onAction(event, 'activate')}
                      disabled={isSubmitting}
                      className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                      title="Reactivate Event"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onAction(event, 'delete')}
                    disabled={isSubmitting}
                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                    title="Delete Event"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(endIndex, totalItems)}
              </span>{" "}
              of <span className="font-semibold">{totalItems}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#0158B7] text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  onItemsPerPageChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:ring-1 focus:ring-[#0158B7]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Blogs Table Component with Dynamic Actions
function BlogsTable({ 
  searchQuery, 
  statusFilter,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onAction,
  isSubmitting
}: { 
  searchQuery: string
  statusFilter: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onAction: (item: any, action: string) => void
  isSubmitting: boolean
}) {
  const dispatch = useAppDispatch()
  const { blogs, isLoading } = useAppSelector((state) => state.blog)

  // Filter blogs
  const filteredBlogs = blogs.filter(blog => {
    if (statusFilter !== 'all' && blog.status !== statusFilter) return false
    if (searchQuery && !blog.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Pagination
  const totalItems = filteredBlogs.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageBlogs = filteredBlogs.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    const config = {
      'Published': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
      'Archived': { bg: 'bg-orange-100', text: 'text-orange-700', icon: XCircle },
      'Under Review': { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle },
    }[status] || { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText }
    
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0158B7] text-white">
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">#</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Blog Post</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Author</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Category</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Status</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Stats</th>
            <th className="px-3 py-3 text-center text-xs font-bold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentPageBlogs.map((blog, index) => (
            <motion.tr
              key={blog.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-blue-50 transition-colors group"
            >
              {/* Number */}
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="w-7 h-7 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {startIndex + index + 1}
                  </span>
                </div>
              </td>

              {/* Blog Info */}
              <td className="px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                      {blog.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {blog.reading_time_minutes} min read
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {new Date(blog.published_at || blog.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Author */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                    {blog.author?.first_name?.[0]}{blog.author?.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {blog.author?.first_name} {blog.author?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {blog.author?.email}
                    </p>
                  </div>
                </div>
              </td>
              
              {/* Category */}
              <td className="px-3 py-3">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  {blog.category}
                </span>
              </td>
              
              {/* Status */}
              <td className="px-3 py-3 whitespace-nowrap">
                {getStatusBadge(blog.status)}
              </td>
              
              {/* Stats */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {blog.view_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {blog.reading_time_minutes}m
                  </span>
                </div>
              </td>
              
              {/* Actions */}
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="flex items-center justify-center space-x-1">
          
                  
                  <button
                    onClick={() => onAction(blog, 'publish')}
                    disabled={isSubmitting}
                    className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                    title="Publish Blog"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={() => onAction(blog, 'archive')}
                    disabled={isSubmitting}
                    className="p-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                    title="Archive Blog"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={() => onAction(blog, 'delete')}
                    disabled={isSubmitting}
                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                    title="Delete Blog"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(endIndex, totalItems)}
              </span>{" "}
              of <span className="font-semibold">{totalItems}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#0158B7] text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  onItemsPerPageChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:ring-1 focus:ring-[#0158B7]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Enhanced Q&A Table Component with Dynamic Actions
function QATable({ 
  searchQuery, 
  statusFilter,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  onAction,
  isSubmitting
}: { 
  searchQuery: string
  statusFilter: string
  currentPage: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (items: number) => void
  onAction: (item: any, action: string) => void
  isSubmitting: boolean
}) {
  const dispatch = useAppDispatch()
  const { threads, isLoading } = useAppSelector((state) => state.qa)

  // Filter threads
  const filteredThreads = threads.filter(thread => {
    if (statusFilter === 'Answered' && !thread.is_answered) return false
    if (statusFilter === 'Unanswered' && thread.is_answered) return false
    if (searchQuery && !thread.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !thread.content.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Pagination
  const totalItems = filteredThreads.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageThreads = filteredThreads.slice(startIndex, endIndex)

  const getAnsweredBadge = (isAnswered: boolean) => {
    return isAnswered ? (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        <CheckCircle2 className="w-3 h-3" />
        Answered
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
        <Clock className="w-3 h-3" />
        Unanswered
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0158B7] text-white">
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">#</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Question</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Asked By</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Status</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Stats</th>
            <th className="px-3 py-3 text-left text-xs font-bold uppercase">Tags</th>
            <th className="px-3 py-3 text-center text-xs font-bold uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {currentPageThreads.map((thread, index) => (
            <motion.tr
              key={thread.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.03 }}
              className="hover:bg-blue-50 transition-colors group"
            >
              {/* Number */}
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="w-7 h-7 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {startIndex + index + 1}
                  </span>
                </div>
              </td>

              {/* Question Info */}
              <td className="px-3 py-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-6 h-6 text-teal-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-1">
                      {thread.title}
                    </h4>
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {thread.content?.replace(/<[^>]*>/g, '')}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(thread.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              
              {/* Asked By */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold">
                    {thread.asker?.first_name?.[0]}{thread.asker?.last_name?.[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {thread.asker?.first_name} {thread.asker?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {thread.asker?.account_type}
                    </p>
                  </div>
                </div>
              </td>
              
              {/* Status */}
              <td className="px-3 py-3 whitespace-nowrap">
                {getAnsweredBadge(thread.is_answered)}
              </td>
              
              {/* Stats */}
              <td className="px-3 py-3">
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {thread.view_count || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {thread.answer_count || 0}
                  </span>
                </div>
              </td>
              
              {/* Tags */}
              <td className="px-3 py-3">
                <div className="flex flex-wrap gap-1">
                  {thread.tags?.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                    >
                      #{tag}
                    </span>
                  ))}
                  {thread.tags && thread.tags.length > 2 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                      +{thread.tags.length - 2}
                    </span>
                  )}
                </div>
              </td>
              
              {/* Actions */}
              <td className="px-3 py-3 whitespace-nowrap">
                <div className="flex items-center justify-center space-x-1">
             
                  <button
                    onClick={() => onAction(thread, thread.is_answered ? 'deactivate' : 'activate')}
                    disabled={isSubmitting}
                    className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                    title={thread.is_answered ? "Mark Unanswered" : "Mark Answered"}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                  
                  <button
                    onClick={() => onAction(thread, 'delete')}
                    disabled={isSubmitting}
                    className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
              to{" "}
              <span className="font-semibold">
                {Math.min(endIndex, totalItems)}
              </span>{" "}
              of <span className="font-semibold">{totalItems}</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-[#0158B7] text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <select
                value={itemsPerPage}
                onChange={(e) => {
                  onItemsPerPageChange(Number(e.target.value));
                  onPageChange(1);
                }}
                className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:ring-1 focus:ring-[#0158B7]"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}