"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchMyProjects,
  deleteProject,
  updateProjectStatus,
  archiveProject,
  duplicateProject,
  bulkDeleteProjects,
  bulkUpdateStatus,
  clearError
} from "@/lib/features/auth/projectSlice"
import {
  FileText, Eye, Edit, Trash2, Copy, Archive, Send, FileCheck,
  Search, Filter, Plus, Loader2, MoreVertical, X, Check,
  Calendar, Download, Tag, Globe, Users, AlertCircle, Sparkles,
  TrendingUp, BookOpen, CheckCircle, Clock, FileX
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import Pagination from "@/components/Pagination"

type StatusFilter = 'all' | 'Draft' | 'Published' | 'Archived'

export default function MyProjectsManagePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { myProjects, isLoading, isSubmitting, error, stats } = useAppSelector(state => state.projects)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    dispatch(fetchMyProjects())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const filteredProjects = myProjects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesSearch = !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Pagination calculations
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProjects(paginatedProjects.map(p => p.id))
    } else {
      setSelectedProjects([])
    }
  }

  const handleSelectProject = (id: string) => {
    setSelectedProjects(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    )
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteProject(id)).unwrap()
      toast.success("Project deleted successfully!")
      setShowDeleteModal(false)
      setProjectToDelete(null)
    } catch (err: any) {
      toast.error(err || "Failed to delete project")
    }
  }

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedProjects.length} selected project(s)?`)) return

    try {
      await dispatch(bulkDeleteProjects(selectedProjects)).unwrap()
      toast.success(`${selectedProjects.length} project(s) deleted successfully!`)
      setSelectedProjects([])
    } catch (err: any) {
      toast.error(err || "Failed to delete projects")
    }
  }

  const handleStatusChange = async (id: string, status: 'Draft' | 'Published') => {
    try {
      await dispatch(updateProjectStatus({ id, status })).unwrap()
      toast.success(`Project ${status.toLowerCase()} successfully!`)
    } catch (err: any) {
      toast.error(err || "Failed to update status")
    }
  }

  const handleArchive = async (id: string) => {
    try {
      await dispatch(archiveProject(id)).unwrap()
      toast.success("Project archived successfully!")
    } catch (err: any) {
      toast.error(err || "Failed to archive project")
    }
  }

  const handleDuplicate = async (id: string) => {
    try {
      await dispatch(duplicateProject(id)).unwrap()
      toast.success("Project duplicated successfully!")
    } catch (err: any) {
      toast.error(err || "Failed to duplicate project")
    }
  }

  const handleBulkStatusUpdate = async (status: 'Draft' | 'Published' | 'Archived') => {
    try {
      await dispatch(bulkUpdateStatus({ ids: selectedProjects, status })).unwrap()
      toast.success(`${selectedProjects.length} project(s) updated to ${status}`)
      setSelectedProjects([])
      setShowBulkActions(false)
    } catch (err: any) {
      toast.error(err || "Failed to update projects")
    }
  }

  // Clean HTML function for rich text content
  const cleanHtml = (html: string) => {
    if (!html) return ""
    // Remove Quill cursor artifacts and other Quill-specific spans
    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    cleaned = cleaned.replace(/<span[^>]*class="[^"]*ql-ui[^"]*"[^>]*>.*?<\/span>/g, "")
    cleaned = cleaned.replace(/ data-list="[^"]*"/g, "")

    // Add proper spacing for paragraphs
    cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom: 0.75rem; line-height: 1.5;">')

    // Add proper spacing and list styles for unordered lists
    cleaned = cleaned.replace(
      /<ul>/g,
      '<ul style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: disc;">'
    )

    // Add proper spacing and list styles for ordered lists
    cleaned = cleaned.replace(
      /<ol>/g,
      '<ol style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: decimal;">'
    )

    // Add spacing for list items
    cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom: 0.25rem; line-height: 1.4;">')

    // Ensure proper heading styles
    cleaned = cleaned.replace(/<h1>/g, '<h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<h2>/g, '<h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<h3>/g, '<h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<strong>/g, '<strong style="font-weight: bold;">')

    return cleaned
  }


  const stripHtml = (html = "") => {
    if (!html) return ""
    // remove tags and decode common entities minimally
    const tmp = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    return tmp
  }

  const previewText = (html: string, max = 200) => {
    const text = stripHtml(html)
    if (!text) return ""
    return text.length > max ? text.slice(0, max).trim() + "…" : text
  }
  const getStatusBadge = (status: string) => {
    const badges = {
      Draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
      Published: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      Archived: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Archive },
      'Under Review': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock }
    }
    const config = badges[status as keyof typeof badges] || badges.Draft
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  return (
    <div className="p-3 space-y-3">
      {/* Header with Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-lg">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              My Research Projects
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">Manage and track your research publications</p>
          </div>
          <Link
            href="/dashboard/user/research/upload"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Link>
        </div>

        {/* Compact Stats Bar */}
        <div className="flex items-center divide-x divide-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 p-2">
          {[
            { label: 'Total', value: stats.total, icon: BookOpen, color: 'from-[#0158B7] to-[#0362C3]' },
            { label: 'Published', value: stats.published, icon: CheckCircle, color: 'from-[#5E96D2] to-[#8DB6E1]' },
            { label: 'Drafts', value: stats.draft, icon: FileText, color: 'from-gray-500 to-slate-500' },
            { label: 'Archived', value: stats.archived, icon: Archive, color: 'from-orange-500 to-amber-500' }
          ].map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div key={idx} className="flex items-center gap-2 px-3 first:pl-2 last:pr-2">
                <div className={`p-1.5 bg-gradient-to-br ${stat.color} rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                  <p className="text-[10px] text-gray-600">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'Draft', 'Published', 'Archived'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${statusFilter === status
                  ? 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {status === 'all' ? 'All Projects' : status}
                <span className="ml-1.5 text-[10px] opacity-75">
                  ({status === 'all' ? stats.total : stats[status.toLowerCase() as keyof typeof stats] || 0})
                </span>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-xs"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedProjects.length > 0 && (
          <div className="mt-2 p-2 bg-[#A8C8E8]/20 border border-[#8DB6E1] rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#0158B7]" />
              <span className="text-xs font-semibold text-[#0158B7]">
                {selectedProjects.length} project(s) selected
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="px-3 py-1 bg-white border border-[#8DB6E1] text-[#0158B7] rounded-lg hover:bg-[#A8C8E8]/10 transition-colors text-xs font-medium"
              >
                Bulk Actions
              </button>
              <button
                onClick={() => setSelectedProjects([])}
                className="p-1 hover:bg-[#A8C8E8]/20 rounded-lg transition-colors"
              >
                <X className="w-3.5 h-3.5 text-[#0158B7]" />
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions Menu */}
        {showBulkActions && selectedProjects.length > 0 && (
          <div className="mt-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
              <button
                onClick={() => handleBulkStatusUpdate('Published')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#8DB6E1]/30 text-[#0158B7] rounded-lg hover:bg-[#8DB6E1]/50 transition-colors text-xs font-medium disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                Publish All
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('Draft')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium disabled:opacity-50"
              >
                <FileText className="w-3.5 h-3.5" />
                Set to Draft
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('Archived')}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-xs font-medium disabled:opacity-50"
              >
                <Archive className="w-3.5 h-3.5" />
                Archive All
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isSubmitting}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FileX className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {searchQuery ? 'No projects found' : 'No projects yet'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search' : 'Create your first research project to get started'}
            </p>
            {!searchQuery && (
              <Link
                href="/dashboard/user/research/upload"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create Project</span>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left">
                      <input
                        type="checkbox"
                        checked={selectedProjects.length === paginatedProjects.length && paginatedProjects.length > 0}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProjects.map((project, index) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      {/* Checkbox */}
                      <td className="px-4 py-2">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleSelectProject(project.id)}
                          className="w-3.5 h-3.5 rounded border-gray-300 text-[#0158B7] focus:ring-[#0158B7]"
                        />
                      </td>

                      {/* Index Number */}
                      <td className="px-4 py-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#A8C8E8] to-[#8DB6E1] rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#0158B7]">
                            {startIndex + index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Project Info */}
                      <td className="px-4 py-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0158B7] to-[#0362C3]">
                            {project.cover_image_url ? (
                              <img
                                src={project.cover_image_url}
                                alt={project.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                {project.title.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-semibold text-gray-900 truncate">
                              {previewText(project.title, 20)} 
                            </h3>

                            <div className="rich-text-content text-gray-700 text-sm" style={{ lineHeight: "1.5" }}>
                              <p className="mb-2">
                                {previewText(project.abstract, 50)}
                              </p>
                            
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs text-gray-700">{project.research_type}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-2">
                        {getStatusBadge(project.status)}
                      </td>

                      {/* Stats */}
                      <td className="px-4 py-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5 text-[10px] text-gray-600">
                            <Eye className="w-3 h-3" />
                            <span className="font-medium">{project.view_count}</span>
                            <span>views</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-[10px] text-gray-600">
                            <Download className="w-3 h-3" />
                            <span className="font-medium">{project.download_count}</span>
                            <span>downloads</span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => router.push(`/dashboard/user/research/${project.id}`)}
                            className="p-1.5 bg-[#A8C8E8]/40 text-[#0158B7] rounded-lg hover:bg-[#8DB6E1]/50 transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            className="p-1.5 bg-[#8DB6E1]/40 text-[#0362C3] rounded-lg hover:bg-[#5E96D2]/50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {project.status === 'Draft' && (
                            <button
                              onClick={() => handleStatusChange(project.id, 'Published')}
                              disabled={isSubmitting}
                              className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                              title="Publish"
                            >
                              <Send className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {project.status === 'Published' && (
                            <button
                              onClick={() => handleStatusChange(project.id, 'Draft')}
                              disabled={isSubmitting}
                              className="p-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                              title="Unpublish"
                            >
                              <FileText className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDuplicate(project.id)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-[#5E96D2]/40 text-[#0158B7] rounded-lg hover:bg-[#5E96D2]/60 transition-colors disabled:opacity-50"
                            title="Duplicate"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleArchive(project.id)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              setProjectToDelete(project.id)
                              setShowDeleteModal(true)
                            }}
                            disabled={isSubmitting}
                            className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-4 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Delete Project</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProjectToDelete(null)
                }}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(projectToDelete)}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
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