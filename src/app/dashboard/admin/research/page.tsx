// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  getAllProjectsForAdmin,
  activateDeactivateProject,
  deleteProjectByAdmin,
  clearError
} from "@/lib/features/auth/projectSlice"
import {
  CheckCircle, XCircle, Trash2, Search, Filter, FolderOpen,
  Loader2, AlertCircle, RefreshCw, X, AlertTriangle,
  Calendar, Eye, ThumbsUp, MessageCircle, BookOpen, FileText,
  Users, Download, ExternalLink, Tag, Clock, BarChart3,
  SlidersHorizontal, CheckCircle2, Shield, ChevronLeft, ChevronRight
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

type StatusFilter = 'all' | 'Published' | 'Draft' | 'Archived'

export default function ManageResearchProjectsPage() {
  const dispatch = useAppDispatch()
  const { adminProjects, isLoading, isSubmitting, error } = useAppSelector(state => state.projects)
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [researchTypeFilter, setResearchTypeFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'Published' | 'Archived' | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)

  // New: View Project Details Modal
  const [showViewModal, setShowViewModal] = useState(false)
  const [projectToView, setProjectToView] = useState<any>(null)

  // Fetch all projects once on component mount
  useEffect(() => {
    loadAllProjects()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const loadAllProjects = () => {
    dispatch(getAllProjectsForAdmin({
      page: 1,
      limit: 1000,
    }))
  }

  const handleRefreshProjects = () => {
    loadAllProjects()
    setCurrentPage(1)
    toast.success("Projects refreshed successfully!")
  }

  // Filter projects locally
  const filteredProjects = adminProjects
    .filter(project => {
      if (statusFilter !== 'all' && project.status !== statusFilter) return false
      return true
    })
    .filter(project => {
      if (researchTypeFilter && project.research_type !== researchTypeFilter) return false
      return true
    })
    .filter(project => {
      if (visibilityFilter && project.visibility !== visibilityFilter) return false
      return true
    })
    .filter(project => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        project.title?.toLowerCase().includes(query) ||
        project.abstract?.toLowerCase().includes(query) ||
        project.author?.first_name?.toLowerCase().includes(query) ||
        project.author?.last_name?.toLowerCase().includes(query) ||
        project.research_type?.toLowerCase().includes(query)
      )
    })

  // Pagination
  const totalItems = filteredProjects.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageProjects = filteredProjects.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery, researchTypeFilter, visibilityFilter])

  const openStatusModal = (project: any, action: 'Published' | 'Archived') => {
    setSelectedProject(project)
    setStatusAction(action)
    setStatusReason('')
    setShowStatusModal(true)
  }

  const handleStatusChange = async () => {
    if (!selectedProject || !statusAction) return
    
    if (statusAction === 'Archived' && !statusReason.trim()) {
      toast.error("Please provide a reason for archiving")
      return
    }
    
    if (statusAction === 'Archived' && statusReason.length < 20) {
      toast.error("Please provide a more detailed reason (at least 20 characters)")
      return
    }
    
    try {
      await dispatch(activateDeactivateProject({
        id: selectedProject.id,
        status: statusAction,
        reason: statusAction === 'Archived' ? statusReason : undefined
      })).unwrap()
      
      toast.success(`Project ${statusAction === 'Published' ? 'published' : 'archived'} successfully!`)
      setShowStatusModal(false)
      setSelectedProject(null)
      setStatusAction(null)
      setStatusReason('')
      loadAllProjects()
      setCurrentPage(1)
    } catch (err: any) {
      toast.error(err || `Failed to ${statusAction} project`)
    }
  }

  const openDeleteModal = (project: any) => {
    setProjectToDelete(project)
    setShowDeleteModal(true)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return
    
    try {
      await dispatch(deleteProjectByAdmin(projectToDelete.id)).unwrap()
      toast.success("Project deleted successfully!")
      setShowDeleteModal(false)
      setProjectToDelete(null)
      loadAllProjects()
      setCurrentPage(1)
    } catch (err: any) {
      toast.error(err || "Failed to delete project")
    }
  }

  // New: View project details
  const openViewModal = (project: any) => {
    setProjectToView(project)
    setShowViewModal(true)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Published': { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
      'Archived': { bg: 'bg-orange-100', text: 'text-orange-700', icon: XCircle },
      'Under Review': { bg: 'bg-blue-100', text: 'text-blue-700', icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft']
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
    }
    
    const style = config[visibility as keyof typeof config] || config.Public
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${style.bg} ${style.text}`}>
        {visibility}
      </span>
    )
  }

  // Get unique values for filters
  const researchTypes = Array.from(new Set(
    adminProjects.map(p => p.research_type).filter(Boolean)
  ))
  
  const visibilityTypes = Array.from(new Set(
    adminProjects.map(p => p.visibility).filter(Boolean)
  ))

  // Calculate stats
  const stats = {
    total: filteredProjects.length,
    published: filteredProjects.filter(p => p.status === 'Published').length,
    draft: filteredProjects.filter(p => p.status === 'Draft').length,
    archived: filteredProjects.filter(p => p.status === 'Archived').length
  }

  // Helper to strip HTML tags for display
  const stripHtml = (html: string) => {
    if (!html) return ''
    return html.replace(/<[^>]*>/g, '')
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
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0158B7] rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Research Project Management
                </h1>
                <p className="text-xs text-gray-500">{filteredProjects.length} filtered projects • {adminProjects.length} total projects</p>
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
                onClick={handleRefreshProjects}
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
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, abstract, author, type..."
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
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                  <option value="Archived">Archived</option>
                </select>

                <select
                  value={researchTypeFilter}
                  onChange={(e) => setResearchTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] text-sm"
                >
                  <option value="">All Research Types</option>
                  {researchTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>

                <select
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] text-sm"
                >
                  <option value="">All Visibility</option>
                  {visibilityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
            <button
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Projects Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          </div>
        ) : currentPageProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center"
          >
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Projects {searchQuery ? "Found" : ""}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No projects found in the system"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
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
                        <div className="min-w-0 max-w-xs">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {project.title}
                          </p>

                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-2">
          
                          <div className="min-w-0">
                  
                            <p className="text-xs text-gray-500 truncate">
                              {project.author?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
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

                      {/* Actions */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => openViewModal(project)}
                            className="p-1.5 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors group-hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          
                          {project.status === 'Published' ? (
                            <button
                              onClick={() => openStatusModal(project, 'Archived')}
                              disabled={isSubmitting}
                              className="p-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                              title="Archive Project"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openStatusModal(project, 'Published')}
                              disabled={isSubmitting}
                              className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                              title="Publish Project"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => openDeleteModal(project)}
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
            </div>

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
                      onClick={() => setCurrentPage(currentPage - 1)}
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
                            onClick={() => setCurrentPage(pageNum)}
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
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
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
          </motion.div>
        )}
      </div>

      {/* Enhanced Status Change Modal */}
      {showStatusModal && selectedProject && statusAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0158B7] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {statusAction === 'Published' ? (
                      <CheckCircle className="w-5 h-5 text-white" />
                    ) : (
                      <XCircle className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {statusAction === 'Published' ? 'Publish Project' : 'Archive Project'}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {statusAction === 'Published' 
                        ? 'Make this project publicly visible'
                        : 'Hide this project from public view'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedProject(null)
                    setStatusAction(null)
                    setStatusReason('')
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Project Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-900">
                    {selectedProject.title}
                  </h4>
                  <p className="text-xs text-gray-600">
                    by {selectedProject.author?.first_name} {selectedProject.author?.last_name}
                  </p>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {selectedProject.research_type}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {selectedProject.view_count} views
                    </span>
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              {statusAction === 'Archived' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Archiving Reason <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      {statusReason.length}/500
                    </span>
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value.slice(0, 500))}
                    placeholder="Please provide a detailed reason for archiving this project (minimum 20 characters)..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] resize-none"
                    rows={3}
                  />
                  {statusReason.length < 20 && statusReason.length > 0 && (
                    <p className="text-xs text-orange-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Minimum 20 characters required</span>
                    </p>
                  )}
                </div>
              )}

              {statusAction === 'Published' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Congratulations Message <span className="text-gray-400">(Optional)</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      {statusReason.length}/300
                    </span>
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value.slice(0, 300))}
                    placeholder="Add a congratulations message for the author..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] resize-none"
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedProject(null)
                  setStatusAction(null)
                  setStatusReason('')
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={
                  isSubmitting || 
                  (statusAction === 'Archived' && (!statusReason.trim() || statusReason.length < 20))
                }
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
                  statusAction === 'Published'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-[#0158B7] hover:bg-blue-700 text-white'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {statusAction === 'Published' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Publish</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        <span>Archive</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-red-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Delete Project
                    </h3>
                    <p className="text-red-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setProjectToDelete(null)
                    }}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500">
                  {projectToDelete.cover_image_url ? (
                    <img
                      src={projectToDelete.cover_image_url}
                      alt={projectToDelete.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      <FolderOpen className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Are you sure you want to permanently delete
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {projectToDelete.title}?
                </p>
                <p className="text-xs text-gray-500">
                  by {projectToDelete.author?.first_name} {projectToDelete.author?.last_name}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Warning: Permanent Deletion
                </h4>
                <ul className="space-y-1 text-xs text-red-800">
                  <li className="flex items-start space-x-2">
                    <span>•</span>
                    <span>All project data will be permanently removed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span>•</span>
                    <span>Project files, likes, and comments will be deleted</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span>•</span>
                    <span>This action cannot be reversed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProjectToDelete(null)
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New: View Project Details Modal */}
      {showViewModal && projectToView && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-6 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
            {/* Modal Header */}
            <div className="bg-[#0158B7] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="max-w-2xl">
                    <h3 className="text-lg font-bold text-white">
                      Project Details
                    </h3>
                    <p className="text-white/90 text-sm truncate">
                      {projectToView.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewModal(false)
                    setProjectToView(null)
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Project Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {projectToView.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    {getStatusBadge(projectToView.status)}
                    {getVisibilityBadge(projectToView.visibility)}
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {projectToView.research_type}
                    </span>
                    {projectToView.doi && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        DOI: {projectToView.doi}
                      </span>
                    )}
                  </div>
                </div>
                {projectToView.cover_image_url && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden ml-4 flex-shrink-0">
                    <img
                      src={projectToView.cover_image_url}
                      alt={projectToView.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <Eye className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-blue-600">{projectToView.view_count || 0}</p>
                  <p className="text-xs text-blue-800">Views</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <ThumbsUp className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-green-600">{projectToView.like_count || 0}</p>
                  <p className="text-xs text-green-800">Likes</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                  <MessageCircle className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-purple-600">{projectToView.comment_count || 0}</p>
                  <p className="text-xs text-purple-800">Comments</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                  <Download className="w-6 h-6 text-orange-600 mx-auto mb-1" />
                  <p className="text-lg font-bold text-orange-600">{projectToView.download_count || 0}</p>
                  <p className="text-xs text-orange-800">Downloads</p>
                </div>
              </div>

              {/* Author Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Author Information
                </h4>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                    {projectToView.author?.profile_picture_url ? (
                      <img
                        src={projectToView.author.profile_picture_url}
                        alt={projectToView.author.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {projectToView.author?.first_name?.charAt(0)}{projectToView.author?.last_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      {projectToView.author?.first_name} {projectToView.author?.last_name}
                    </p>
                    <p className="text-xs text-gray-600">{projectToView.author?.email}</p>
                    <p className="text-xs text-gray-500">{projectToView.author?.account_type}</p>
                    {projectToView.author?.profile?.institution_name && (
                      <p className="text-xs text-gray-500 mt-1">
                        {projectToView.author.profile.institution_name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Abstract */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3">Abstract</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {stripHtml(projectToView.abstract) || "No abstract provided."}
                  </p>
                </div>
              </div>

              {/* Project Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Project Timeline
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="font-medium">
                        {new Date(projectToView.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="font-medium">
                        {new Date(projectToView.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                    {projectToView.publication_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Published:</span>
                        <span className="font-medium">
                          {new Date(projectToView.publication_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Additional Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Collaboration:</span>
                      <span className="font-medium">{projectToView.collaboration_status}</span>
                    </div>
                    {projectToView.field_of_study && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Field of Study:</span>
                        <span className="font-medium">{projectToView.field_of_study}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Featured:</span>
                      <span className="font-medium">
                        {projectToView.is_featured ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {projectToView.tags && projectToView.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {projectToView.tags.map((tag: any) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Files */}
              {projectToView.files && projectToView.files.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-3">Project Files</h4>
                  <div className="space-y-2">
                    {projectToView.files.map((file: any) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                            <p className="text-xs text-gray-500">
                              {file.file_type} • {file.file_size} bytes
                            </p>
                          </div>
                        </div>
                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#0158B7] text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Main Project File */}
              {projectToView.project_file_url && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-2">Main Project File</h4>
                  <a
                    href={projectToView.project_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Project File
                  </a>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-xs text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Last updated: {new Date(projectToView.updated_at).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      setShowViewModal(false)
                      setProjectToView(null)
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
                  >
                    Close
                  </button>
                  {projectToView.project_file_url && (
                    <a
                      href={projectToView.project_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium flex items-center space-x-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}