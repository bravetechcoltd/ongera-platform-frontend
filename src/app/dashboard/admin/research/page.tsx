// @ts-nocheck
"use client"

import { useEffect, useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  getAllProjectsForAdmin,
  activateDeactivateProject,
  deleteProjectByAdmin,
  updateProject,
  clearError
} from "@/lib/features/auth/projectSlice"
import {
  CheckCircle, XCircle, Trash2, Search, Filter, FolderOpen,
  Loader2, AlertCircle, RefreshCw, X, AlertTriangle,
  Calendar, Eye, ThumbsUp, MessageCircle, BookOpen, FileText,
  Users, Download, ExternalLink, Tag, Clock, BarChart3,
  SlidersHorizontal, CheckCircle2, Shield, ChevronLeft, ChevronRight,
  Edit, Save, Upload, Image as ImageIcon, Paperclip, Plus,
  ZoomIn,
  Globe,
  Check
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import RichTextEditor from "@/components/ui/richTextEditor"

type StatusFilter = 'all' | 'Published' | 'Draft' | 'Archived'

// HTML Cleaning Function for Rich Text
const cleanHtml = (html:any) => {
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

// Enhanced Image Display Component
function EnhancedImageDisplay({ imageUrl, title, className = "", showZoom = true }) {
  const [previewImage, setPreviewImage] = useState(null)

  return (
    <>
      <div className={`relative overflow-hidden rounded-lg bg-gray-100 group ${className}`}>
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            />
            {showZoom && (
              <>
                <div
                  className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center cursor-pointer"
                  onClick={() => setPreviewImage({ url: imageUrl, title })}
                >
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 transform group-hover:scale-110">
                    <ZoomIn className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
                <button
                  onClick={() => setPreviewImage({ url: imageUrl, title })}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-all md:hidden"
                >
                  <ZoomIn className="w-4 h-4 text-white" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}
      </div>

      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  )
}

// Image Preview Modal
function ImagePreviewModal({ imageUrl, title, onClose }) {
  if (!imageUrl) return null

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] animate-fadeIn pt-20"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-15 right-15 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="relative max-w-6xl w-full">
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium max-w-[90%] truncate">
          {title}
        </div>
      </div>
    </div>
  )
}

const RESEARCH_TYPES = ["Thesis", "Paper", "Project", "Dataset", "Case Study"]
const VISIBILITY_OPTIONS = ["Public", "Community-Only", "Private"]
const COLLABORATION_OPTIONS = ["Solo", "Seeking Collaborators"]
const FIELD_OF_STUDY = [
  "Health Sciences", "Technology & Engineering", "Agriculture",
  "Social Sciences", "Natural Sciences", "Business & Economics",
  "Environmental Studies", "Education", "Arts & Humanities", "Other"
]

export default function ManageResearchProjectsPage() {
  const dispatch = useAppDispatch()
  const { adminProjects, isLoading, isSubmitting, error } = useAppSelector(state => state.projects)

  // Filter states
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [researchTypeFilter, setResearchTypeFilter] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal states
  const [deleteReason, setDeleteReason] = useState('')
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'Published' | 'Archived' | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [selectedProject, setSelectedProject] = useState<any>(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)

  // View Project Details Modal
  const [showViewModal, setShowViewModal] = useState(false)
  const [projectToView, setProjectToView] = useState<any>(null)

  // NEW: Edit Project Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState<any>(null)

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: '',
    abstract: '',
    full_description: '',
    research_type: 'Paper',
    field_of_study: '',
    publication_date: '',
    doi: '',
    visibility: 'Public',
    collaboration_status: 'Solo',
    tags: []
  })

  const [editFiles, setEditFiles] = useState({
    project_file: null,
    cover_image: null,
    additional_files: []
  })

  const [filePreview, setFilePreview] = useState({
    project_file: null,
    cover_image: null
  })

  const [newTag, setNewTag] = useState('')
  const projectFileRef = useRef<HTMLInputElement>(null)
  const coverImageRef = useRef<HTMLInputElement>(null)
  const additionalFilesRef = useRef<HTMLInputElement>(null)

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
        reason: statusReason
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
    setDeleteReason('')
    setDeleteConfirmationText('')
    setShowDeleteModal(true)
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    // Require reason
    if (!deleteReason.trim() || deleteReason.length < 20) {
      toast.error("Please provide a detailed reason (at least 20 characters)")
      return
    }

    // Optional: Add confirmation text for extra safety
    if (deleteConfirmationText !== 'PERMANENTLY DELETE') {
      toast.error("Please type 'PERMANENTLY DELETE' to confirm")
      return
    }

    try {
      await dispatch(deleteProjectByAdmin({ 
        id: projectToDelete.id, 
        reason: deleteReason 
      })).unwrap()
      
      toast.success("Project permanently deleted successfully!")
      setShowDeleteModal(false)
      setProjectToDelete(null)
      setDeleteReason('')
      setDeleteConfirmationText('')
      loadAllProjects()
      setCurrentPage(1)
    } catch (err: any) {
      toast.error(err || "Failed to delete project")
    }
  }

  // View project details
  const openViewModal = (project: any) => {
    setProjectToView(project)
    setShowViewModal(true)
  }

  // NEW: Handle Edit
  const openEditModal = (project: any) => {
    setProjectToEdit(project)
    setEditFormData({
      title: project.title || '',
      abstract: project.abstract || '',
      full_description: project.full_description || '',
      research_type: project.research_type || 'Paper',
      field_of_study: project.field_of_study || '',
      publication_date: project.publication_date || '',
      doi: project.doi || '',
      visibility: project.visibility || 'Public',
      collaboration_status: project.collaboration_status || 'Solo',
      tags: project.tags?.map((t: any) => t.name) || []
    })
    setEditFiles({
      project_file: null,
      cover_image: null,
      additional_files: []
    })
    setFilePreview({
      project_file: null,
      cover_image: null
    })
    setShowEditModal(true)
  }

  // File handlers
  const handleFileSelect = (type, event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setEditFiles(prev => ({
      ...prev,
      [type]: file
    }))

    if (type === 'cover_image' && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(prev => ({
          ...prev,
          [type]: reader.result
        }))
      }
      reader.readAsDataURL(file)
    } else if (type === 'project_file') {
      setFilePreview(prev => ({
        ...prev,
        project_file: file.name
      }))
    }
  }

  const handleRemoveFile = (type) => {
    setEditFiles(prev => ({
      ...prev,
      [type]: null
    }))
    setFilePreview(prev => ({
      ...prev,
      [type]: null
    }))

    if (type === 'project_file' && projectFileRef.current) {
      projectFileRef.current.value = ''
    } else if (type === 'cover_image' && coverImageRef.current) {
      coverImageRef.current.value = ''
    }
  }

  const handleUpdateProject = async () => {
    if (!projectToEdit) return

    try {
      const formData = new FormData()

      formData.append('title', editFormData.title)
      formData.append('abstract', editFormData.abstract)
      formData.append('full_description', editFormData.full_description)
      formData.append('research_type', editFormData.research_type)
      formData.append('field_of_study', editFormData.field_of_study)
      formData.append('visibility', editFormData.visibility)
      formData.append('collaboration_status', editFormData.collaboration_status)
      formData.append('tags', JSON.stringify(editFormData.tags))

      if (editFormData.publication_date) {
        formData.append('publication_date', editFormData.publication_date)
      }
      if (editFormData.doi) {
        formData.append('doi', editFormData.doi)
      }

      if (editFiles.project_file && editFiles.project_file instanceof File) {
        formData.append('project_file', editFiles.project_file)
      }
      if (editFiles.cover_image && editFiles.cover_image instanceof File) {
        formData.append('cover_image', editFiles.cover_image)
      }
      if (editFiles.additional_files.length > 0) {
        editFiles.additional_files.forEach(file => {
          if (file instanceof File) {
            formData.append('additional_files', file)
          }
        })
      }

      await dispatch(updateProject({
        id: projectToEdit.id,
        updates: formData
      })).unwrap()

      toast.success("Project updated successfully!")
      setShowEditModal(false)
      setProjectToEdit(null)
      setEditFiles({ project_file: null, cover_image: null, additional_files: [] })
      setFilePreview({ project_file: null, cover_image: null })

      loadAllProjects()
    } catch (err: any) {
      toast.error(err || "Failed to update project")
    }
  }

  const addTag = () => {
    if (newTag.trim() && !editFormData.tags.includes(newTag.trim())) {
      setEditFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
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

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

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
                className={`flex items-center px-3 py-2 rounded-lg transition-all text-sm ${showFilters
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
                          {project.cover_image_url && (
                            <div className="flex items-center space-x-1 mt-1">
                              <ImageIcon className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-500">Has cover image</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Author */}
                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                            {project.author?.profile_picture_url ? (
                              <img
                                src={project.author.profile_picture_url}
                                alt={project.author.first_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                {project.author?.first_name?.charAt(0)}{project.author?.last_name?.charAt(0)}
                              </div>
                            )}
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

                          {/* NEW: Edit Button */}
                          <button
                            onClick={() => openEditModal(project)}
                            className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors group-hover:scale-110"
                            title="Edit Project"
                          >
                            <Edit className="w-3.5 h-3.5" />
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
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${currentPage === pageNum
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] resize-none"
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
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg text-black bg-white focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] resize-none"
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
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${statusAction === 'Published'
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

      {/* Enhanced Delete Modal with Reason and Confirmation */}
      {showDeleteModal && projectToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Permanently Delete Project
                    </h3>
                    <p className="text-red-100 text-sm">
                      This action CANNOT be undone
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setProjectToDelete(null)
                      setDeleteReason('')
                      setDeleteConfirmationText('')
                    }}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Project Info */}
              <div className="text-center">
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
                <p className="text-sm font-bold text-gray-900 mb-1">
                  {projectToDelete.title}
                </p>
                <p className="text-xs text-gray-500">
                  by {projectToDelete.author?.first_name} {projectToDelete.author?.last_name}
                </p>
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-900">
                    Deletion Reason <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">{deleteReason.length}/500</span>
                </div>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value.slice(0, 500))}
                  placeholder="Provide a detailed reason for deleting this project (min 20 characters)..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={3}
                />
                {deleteReason.length > 0 && deleteReason.length < 20 && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Minimum 20 characters required
                  </p>
                )}
              </div>

              {/* Confirmation Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-900">
                  Type <span className="text-red-600 font-bold">PERMANENTLY DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type PERMANENTLY DELETE here"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setProjectToDelete(null)
                  setDeleteReason('')
                  setDeleteConfirmationText('')
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProject}
                disabled={
                  isSubmitting || 
                  !deleteReason.trim() || 
                  deleteReason.length < 20 || 
                  deleteConfirmationText !== 'PERMANENTLY DELETE'
                }
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-sm font-bold disabled:opacity-50 flex items-center space-x-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Edit Project Modal */}
      {showEditModal && projectToEdit && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto pt-20">
          <div className="bg-white rounded-xl w-[80%] max-w-[1400px] my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white p-4 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Edit Research Project</h2>
                  <p className="text-xs text-white/80">Update research information and files</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* File Management Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Upload className="w-4 h-4 text-[#0158B7]" />
                  <h3 className="text-sm font-semibold text-gray-900">File Management</h3>
                  <span className="text-xs text-green-600 ml-auto">✓ Files can be updated</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Cover Image Upload */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                    <label className={labelClass}>
                      <ImageIcon className="w-3 h-3" />
                      Cover Image
                    </label>

                    {/* Current Cover Image */}
                    {projectToEdit?.cover_image_url && !filePreview.cover_image && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2">Current Image:</p>
                        <EnhancedImageDisplay
                          imageUrl={projectToEdit.cover_image_url}
                          title="Current Cover"
                          className="h-32"
                          showZoom={true}
                        />
                      </div>
                    )}

                    {/* New Image Preview */}
                    {filePreview.cover_image && (
                      <div className="mb-3">
                        <p className="text-xs text-green-600 mb-2 font-semibold">New Image Preview:</p>
                        <div className="relative h-32 rounded-lg overflow-hidden">
                          <img
                            src={filePreview.cover_image}
                            alt="New cover preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleRemoveFile('cover_image')}
                            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <input
                      ref={coverImageRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('cover_image', e)}
                      className="hidden"
                    />
                    <button
                      onClick={() => coverImageRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-all text-xs font-medium text-blue-700"
                    >
                      <Upload className="w-4 h-4" />
                      {filePreview.cover_image ? 'Change Image' : 'Upload New Image'}
                    </button>
                  </div>

                  {/* Project File Upload */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <label className={labelClass}>
                      <FileText className="w-3 h-3" />
                      Main Project File
                    </label>

                    {/* Current File Info */}
                    {projectToEdit?.project_file_url && !filePreview.project_file && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2">Current File:</p>
                        <a
                          href={projectToEdit.project_file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-white rounded hover:shadow-md transition-all text-xs"
                        >
                          <Paperclip className="w-4 h-4 text-green-600" />
                          <span className="flex-1 text-gray-700">View Current File</span>
                          <Download className="w-3 h-3 text-gray-400" />
                        </a>
                      </div>
                    )}

                    {/* New File Info */}
                    {filePreview.project_file && (
                      <div className="mb-3">
                        <p className="text-xs text-green-600 mb-2 font-semibold">New File Selected:</p>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border border-green-300">
                          <FileText className="w-4 h-4 text-green-600" />
                          <span className="flex-1 text-xs text-gray-700 truncate">{filePreview.project_file}</span>
                          <button
                            onClick={() => handleRemoveFile('project_file')}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <input
                      ref={projectFileRef}
                      type="file"
                      onChange={(e) => handleFileSelect('project_file', e)}
                      className="hidden"
                    />
                    <button
                      onClick={() => projectFileRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-green-300 rounded-lg hover:bg-green-50 transition-all text-xs font-medium text-green-700"
                    >
                      <Upload className="w-4 h-4" />
                      {filePreview.project_file ? 'Change File' : 'Upload New File'}
                    </button>
                  </div>
                </div>

                {/* Additional Files Display */}
                {projectToEdit?.files && projectToEdit.files.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-gray-700">Additional Files ({projectToEdit.files.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {projectToEdit.files.map((file) => (
                        <a
                          key={file.id}
                          href={file.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 p-2 bg-white rounded hover:shadow-md transition-all text-xs"
                        >
                          <Paperclip className="w-3 h-3 text-purple-600 flex-shrink-0" />
                          <span className="flex-1 truncate text-gray-700">{file.file_name}</span>
                          <Download className="w-3 h-3 text-gray-400 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <BookOpen className="w-4 h-4 text-[#0158B7]" />
                  <h3 className="text-sm font-semibold text-gray-900">Basic Information</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
                    <label className={labelClass}>
                      <FileText className="w-3 h-3" />
                      Project Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editFormData.title}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                      className={inputClass}
                      placeholder="Enter your research project title"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <FileText className="w-3 h-3" />
                      Research Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.research_type}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, research_type: e.target.value }))}
                      className={inputClass}
                    >
                      {RESEARCH_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <BookOpen className="w-3 h-3" />
                      Field of Study <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={editFormData.field_of_study}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, field_of_study: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select field</option>
                      {FIELD_OF_STUDY.map(field => (
                        <option key={field} value={field}>{field}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3" />
                    Abstract <span className="text-red-500">*</span>
                  </label>
                  <RichTextEditor
                    value={editFormData.abstract}
                    onChange={(value) => setEditFormData(prev => ({ ...prev, abstract: value }))}
                    placeholder="Provide a concise abstract of your research"
                    className="min-h-[200px]"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3" />
                    Full Description (Optional)
                  </label>
                  <RichTextEditor
                    value={editFormData.full_description}
                    onChange={(value) => setEditFormData(prev => ({ ...prev, full_description: value }))}
                    placeholder="Detailed information about methodology, findings, and conclusions"
                    className="min-h-[200px]"
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Tag className="w-4 h-4 text-[#0158B7]" />
                  <h3 className="text-sm font-semibold text-gray-900">Research Tags</h3>
                  <span className="text-xs text-green-600 ml-auto">✓ Tags will be saved to database</span>
                </div>

                <div>
                  <label className={labelClass}>
                    <Tag className="w-3 h-3" />
                    Add/Remove Tags <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-1.5 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className={inputClass + " flex-1"}
                      placeholder="Enter tags (e.g., Machine Learning, Healthcare)"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow transition-all flex items-center gap-1 text-xs font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>

                  {/* Tags Display */}
                  {editFormData.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      {editFormData.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 bg-gradient-to-r from-[#0158B7]/10 to-[#5E96D2]/10 text-[#0158B7] rounded text-xs font-medium flex items-center gap-1 border border-[#0158B7]/20"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-[#0158B7]/80"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-center">
                      <p className="text-xs text-gray-500">No tags added yet. Add tags to help others find your research.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      <Calendar className="w-3 h-3" />
                      Publication Date
                    </label>
                    <input
                      type="date"
                      value={editFormData.publication_date}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, publication_date: e.target.value }))}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <FileText className="w-3 h-3" />
                      DOI
                    </label>
                    <input
                      type="text"
                      value={editFormData.doi}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, doi: e.target.value }))}
                      className={inputClass}
                      placeholder="10.1234/example.doi"
                    />
                  </div>
                </div>
              </div>

              {/* Sharing & Visibility */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Globe className="w-4 h-4 text-[#0158B7]" />
                  <h3 className="text-sm font-semibold text-gray-900">Sharing & Visibility</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      <Globe className="w-3 h-3" />
                      Visibility <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {VISIBILITY_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className={`relative p-3 border rounded-lg cursor-pointer transition-all block ${editFormData.visibility === option
                              ? 'border-[#0158B7] bg-[#0158B7]/10'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <input
                            type="radio"
                            value={option}
                            checked={editFormData.visibility === option}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, visibility: e.target.value }))}
                            className="absolute opacity-0"
                          />
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${editFormData.visibility === option
                                ? 'border-[#0158B7] bg-[#0158B7]'
                                : 'border-gray-300'
                              }`}>
                              {editFormData.visibility === option && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{option}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Users className="w-3 h-3" />
                      Collaboration Status <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {COLLABORATION_OPTIONS.map((option) => (
                        <label
                          key={option}
                          className={`relative p-3 border rounded-lg cursor-pointer transition-all block ${editFormData.collaboration_status === option
                              ? 'border-[#5E96D2] bg-[#5E96D2]/10'
                              : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                          <input
                            type="radio"
                            value={option}
                            checked={editFormData.collaboration_status === option}
                            onChange={(e) => setEditFormData(prev => ({ ...prev, collaboration_status: e.target.value }))}
                            className="absolute opacity-0"
                          />
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${editFormData.collaboration_status === option
                                ? 'border-[#5E96D2] bg-[#5E96D2]'
                                : 'border-gray-300'
                              }`}>
                              {editFormData.collaboration_status === option && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{option}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end gap-2 rounded-b-xl">
              {error && (
                <div className="flex-1 flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
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