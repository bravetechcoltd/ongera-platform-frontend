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
  Calendar, Eye, ThumbsUp, MessageCircle, BookOpen, FileText
} from "lucide-react"
import { toast } from "react-hot-toast"
import Pagination from "@/components/Pagination"

type StatusFilter = 'all' | 'Published' | 'Draft' | 'Archived'

export default function ManageResearchProjectsPage() {
  const dispatch = useAppDispatch()
  const { adminProjects, isLoading, isSubmitting, error } = useAppSelector(state => state.projects)
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [researchTypeFilter, setResearchTypeFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'Published' | 'Archived' | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)

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
      limit: 1000, // Fetch all projects at once
    }))
  }

  const handleRefreshProjects = () => {
    loadAllProjects()
    setCurrentPage(1) // Reset to first page on refresh
    toast.success("Projects refreshed successfully!")
  }

  // Filter projects locally
  const filteredProjects = adminProjects
    .filter(project => {
      // Status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) return false
      return true
    })
    .filter(project => {
      // Research type filter
      if (researchTypeFilter && project.research_type !== researchTypeFilter) return false
      return true
    })
    .filter(project => {
      // Visibility filter
      if (visibilityFilter && project.visibility !== visibilityFilter) return false
      return true
    })
    .filter(project => {
      // Search filter
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

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery, researchTypeFilter, visibilityFilter])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      setCurrentPage(1) // Reset to first page after action
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
      setCurrentPage(1) // Reset to first page after deletion
    } catch (err: any) {
      toast.error(err || "Failed to delete project")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Published': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText },
      'Archived': { bg: 'bg-orange-100', text: 'text-orange-800', icon: XCircle },
      'Under Review': { bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Draft']
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
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

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Research Project Management</h1>
            <p className="text-gray-600 mt-1">Manage all research projects on the platform</p>
          </div>
          <button
            onClick={handleRefreshProjects}
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh Projects</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-xs text-gray-600">Total Projects</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200 p-4">
            <p className="text-2xl font-bold text-green-600">{stats.published}</p>
            <p className="text-xs text-gray-600">Published</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            <p className="text-xs text-gray-600">Drafts</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-4">
            <p className="text-2xl font-bold text-orange-600">{stats.archived}</p>
            <p className="text-xs text-gray-600">Archived</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Status Filter */}
          <div className="flex space-x-2">
            {(['all', 'Published', 'Draft', 'Archived'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>

          {/* Research Type Filter */}
          <select
            value={researchTypeFilter}
            onChange={(e) => setResearchTypeFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="">All Research Types</option>
            {researchTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Visibility Filter */}
          <select
            value={visibilityFilter}
            onChange={(e) => setVisibilityFilter(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="">All Visibility</option>
            {visibilityTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="flex-1 flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, abstract, author, type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(searchQuery || researchTypeFilter || visibilityFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setResearchTypeFilter('')
                  setVisibilityFilter('')
                  setCurrentPage(1) // Reset to page 1 when clearing filters
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading projects...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your filters or refresh the projects list</p>
            <button
              onClick={handleRefreshProjects}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Refresh Projects
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProjects.map((project, index) => {
                    // Calculate global index for numbering
                    const globalIndex = startIndex + index + 1
                    
                    return (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      {/* Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-700">
                            {globalIndex}
                          </span>
                        </div>
                      </td>

                      {/* Project Info */}
                      <td className="px-6 py-4">
                        <div className="min-w-0 max-w-xs">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {project.title}
                          </p>
                    
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              {project.visibility}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                            {project.author?.profile_picture_url ? (
                              <img
                                src={project.author.profile_picture_url}
                                alt={project.author.first_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                                {project.author?.first_name?.charAt(0)}{project.author?.last_name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">
                              {project.author?.first_name} {project.author?.last_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {project.author?.account_type}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {project.research_type}
                        </span>
                      </td>



                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(project.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {project.status === 'Published' ? (
                            <button
                              onClick={() => openStatusModal(project, 'Archived')}
                              disabled={isSubmitting}
                              className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                              title="Archive Project"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openStatusModal(project, 'Published')}
                              disabled={isSubmitting}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                              title="Publish Project"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => openDeleteModal(project)}
                            disabled={isSubmitting}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Delete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredProjects.length}
              itemsPerPage={itemsPerPage}
            />

          </>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedProject && statusAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-10 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
            {/* Modal Header */}
            <div className={`relative px-8 py-6 ${
              statusAction === 'Published' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm`}>
                    {statusAction === 'Published' ? (
                      <CheckCircle className="w-8 h-8 text-white" />
                    ) : (
                      <XCircle className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {statusAction === 'Published' ? 'Publish Research Project' : 'Archive Research Project'}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
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
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">

              {/* Project Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">
                      {selectedProject.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedProject.abstract?.substring(0, 150)}...</p>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="flex items-center">
                      <BookOpen className="w-3 h-3 mr-1" />
                      {selectedProject.research_type}
                    </span>
                    <span className="flex items-center">
                      <Eye className="w-3 h-3 mr-1" />
                      {selectedProject.view_count} views
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      {selectedProject.like_count} likes
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      <strong>Author:</strong> {selectedProject.author?.first_name} {selectedProject.author?.last_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      <strong>Email:</strong> {selectedProject.author?.email}
                    </p>
                  </div>
                </div>
              </div>

              {statusAction === 'Archived' ? (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-orange-900 mb-2">
                        Important: Archiving Impact
                      </h5>
                      <ul className="space-y-2 text-sm text-orange-800">
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Project will be hidden from public view</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Author will receive email notification</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Project can be re-published later</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-green-900 mb-2">
                        Publishing Benefits
                      </h5>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>Project will be publicly visible and searchable</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>Author will receive email notification</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>Researchers can view, like, and comment</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason Input (Required for Archiving) */}
              {statusAction === 'Archived' && (
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Archiving Reason <span className="text-red-500">*</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {statusReason.length}/500 characters
                      </span>
                    </div>
                    <textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value.slice(0, 500))}
                      placeholder="Please provide a detailed reason for archiving this project. This will be sent to the author via email..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all text-sm"
                      rows={5}
                      maxLength={500}
                    />
                  </label>
                  {statusReason.length < 20 && statusReason.length > 0 && (
                    <p className="text-xs text-orange-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Please provide a more detailed reason (at least 20 characters)</span>
                    </p>
                  )}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">Note:</strong> The reason you provide will be included in the email notification sent to the author. Please be professional and clear.
                    </p>
                  </div>
                </div>
              )}

              {/* Optional Message for Publishing */}
              {statusAction === 'Published' && (
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Congratulations Message <span className="text-gray-400">(Optional)</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {statusReason.length}/300 characters
                      </span>
                    </div>
                    <textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value.slice(0, 300))}
                      placeholder="Add a congratulations message for the author (optional)..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all text-sm"
                      rows={3}
                      maxLength={300}
                    />
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedProject(null)
                    setStatusAction(null)
                    setStatusReason('')
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={
                    isSubmitting || 
                    (statusAction === 'Archived' && (!statusReason.trim() || statusReason.length < 20))
                  }
                  className={`px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 ${
                    statusAction === 'Published'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {statusAction === 'Published' ? (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>Publish Project</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5" />
                          <span>Archive Project</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className={`px-8 py-4 ${
              statusAction === 'Published' ? 'bg-green-50' : 'bg-orange-50'
            } border-t-2 border-gray-200`}>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {statusAction === 'Published' 
                    ? 'The author will be notified via email about the project publication.'
                    : 'The author will be notified via email about the project archiving and the reason provided.'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Delete Research Project
                    </h3>
                    <p className="text-red-100 text-sm mt-1">
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
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">
                  Are you sure you want to permanently delete this research project?
                </p>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {projectToDelete.title}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  by {projectToDelete.author?.first_name} {projectToDelete.author?.last_name}
                </p>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
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
                  <li className="flex items-start space-x-2">
                    <span>•</span>
                    <span>Author will receive a deletion notification email</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 border-t-2 border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProjectToDelete(null)
                }}
                disabled={isSubmitting}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-bold disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-red-500/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}