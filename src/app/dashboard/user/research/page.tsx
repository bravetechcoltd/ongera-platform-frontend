// @ts-nocheck
"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchMyProjects,
  deleteProject,
  updateProjectStatus,
  updateProject,
  clearError,
  rejectCollaborationRequest,
  fetchProjectCollaborationRequests,
  addContribution,
  fetchProjectsUserCanContributeTo,
  approveCollaborationRequest
} from "@/lib/features/auth/projectSlice"
import {
  FileText, Eye, Edit, Trash2, Archive, Send,
  Search, Plus, Loader2, X, Check,
  Calendar, Download, Tag, Globe, Users, AlertCircle,
  BookOpen, CheckCircle, Clock, FileX, Upload, Image as ImageIcon,
  Paperclip, Save, ZoomIn,
  UserPlus,
  Building,
  Mail
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"
import Pagination from "@/components/Pagination"
import RichTextEditor from "@/components/ui/richTextEditor"

type StatusFilter = 'all' | 'Draft' | 'Published' | 'Archived'

const RESEARCH_TYPES = ["Thesis", "Paper", "Project", "Dataset", "Case Study"]
const VISIBILITY_OPTIONS = ["Public", "Community-Only", "Private"]
const COLLABORATION_OPTIONS = ["Solo", "Seeking Collaborators"]
const FIELD_OF_STUDY = [
  "Health Sciences", "Technology & Engineering", "Agriculture",
  "Social Sciences", "Natural Sciences", "Business & Economics",
  "Environmental Studies", "Education", "Arts & Humanities", "Other"
]

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

function CollaborationRequestsModal({ project, onClose }) {
  const dispatch = useAppDispatch()
  const { projectCollaborationRequests, isSubmitting } = useAppSelector(state => state.projects)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    if (project?.id) {
      dispatch(fetchProjectCollaborationRequests({ projectId: project.id, status: 'Pending' }))
    }
  }, [dispatch, project?.id])

  const handleApprove = async (requestId) => {
    try {
      await dispatch(approveCollaborationRequest(requestId)).unwrap()
      toast.success("Collaboration request approved!")
      dispatch(fetchProjectCollaborationRequests({ projectId: project.id, status: 'Pending' }))
    } catch (error) {
      toast.error(error || "Failed to approve request")
    }
  }

  const handleReject = async () => {
    if (!selectedRequest) return

    try {
      await dispatch(rejectCollaborationRequest({
        requestId: selectedRequest.id,
        rejection_reason: rejectionReason
      })).unwrap()
      toast.success("Collaboration request rejected")
      setShowRejectModal(false)
      setSelectedRequest(null)
      setRejectionReason('')
      dispatch(fetchProjectCollaborationRequests({ projectId: project.id, status: 'Pending' }))
    } catch (error) {
      toast.error(error || "Failed to reject request")
    }
  }

  const pendingRequests = projectCollaborationRequests || []

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20">
        <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Collaboration Requests</h2>
                <p className="text-xs text-white/80">{project.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-8">
                <UserPlus className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No pending requests</p>
                <p className="text-xs text-gray-500 mt-1">
                  Collaboration requests will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all">
                    {/* Requester Info */}
                    <div className="flex items-start gap-3 mb-3">
                      <img
                        src={request.requester.profile_picture_url}
                        alt={request.requester.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {request.requester.first_name} {request.requester.last_name}
                        </h3>
                        <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                          <Building className="w-3 h-3" />
                          {request.requester.profile?.institution_name || 'No institution'}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" />
                          {request.requester.email}
                        </p>
                      </div>
                    </div>

                    {/* Request Details */}
                    <div className="mb-3 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">Reason:</p>
                        <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{request.reason}</p>
                      </div>
                      {request.expertise && (
                        <div>
                          <p className="text-xs font-semibold text-gray-700 mb-1">Expertise:</p>
                          <p className="text-sm text-gray-800 bg-gray-50 p-2 rounded">{request.expertise}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Requested {new Date(request.requested_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request.id)}
                        disabled={isSubmitting}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request)
                          setShowRejectModal(true)
                        }}
                        disabled={isSubmitting}
                        className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl p-4 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Reject Request
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              Provide a reason for rejection (optional):
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm resize-none"
              rows={3}
              placeholder="Let them know why..."
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedRequest(null)
                  setRejectionReason('')
                }}
                className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isSubmitting ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ✅ ENHANCED: Compact AddContributionModal with all backend-expected fields
function AddContributionModal({ project, onClose }) {
  const dispatch = useAppDispatch()
  const { isSubmitting } = useAppSelector(state => state.projects)
  const [contributionData, setContributionData] = useState({
    contribution_title: '',
    contribution_content: '',
    contribution_section: ''
  })
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || [])
    if (files.length + newFiles.length > 5) {
      toast.error("Maximum 5 files allowed")
      return
    }
    setFiles([...files, ...newFiles])
  }

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!contributionData.contribution_title || !contributionData.contribution_content) {
      toast.error("Title and content are required")
      return
    }

    const formData = new FormData()
    formData.append('contribution_title', contributionData.contribution_title)
    formData.append('contribution_content', contributionData.contribution_content)
    if (contributionData.contribution_section) {
      formData.append('contribution_section', contributionData.contribution_section)
    }
    files.forEach(file => {
      formData.append('contribution_files', file)
    })

    try {
      await dispatch(addContribution({ projectId: project.id, formData })).unwrap()
      toast.success("Contribution added successfully!")
      onClose()
    } catch (error) {
      toast.error(error || "Failed to add contribution")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-20">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[85vh] overflow-hidden">
        {/* Header with Gradient - Compact */}
        <div className="bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Add Contribution</h2>
              <p className="text-xs text-white/80">{project.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Compact */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-140px)] space-y-4">
          {/* Project Info Banner */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-3">
              {project.cover_image_url && (
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-sm"
                />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {project.title}
                </h3>
                <p className="text-xs text-gray-600 truncate">
                  by {project.author?.first_name} {project.author?.last_name}
                </p>
              </div>
            </div>
          </div>

          {/* Title Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Contribution Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={contributionData.contribution_title}
              onChange={(e) => setContributionData({ ...contributionData, contribution_title: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Brief title for your contribution"
              maxLength={200}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Be specific and descriptive</p>
              <p className="text-xs text-gray-400">{contributionData.contribution_title.length}/200</p>
            </div>
          </div>

          {/* Content Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-600" />
              Contribution Content <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={contributionData.contribution_content}
              onChange={(value) => setContributionData({ ...contributionData, contribution_content: value })}
              placeholder="Describe your contribution in detail. Include methodology, findings, or any relevant information..."
              className="min-h-[150px] text-sm"
              compact={true}
            />
          </div>

          {/* Section Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-green-600" />
              Section (Optional)
            </label>
            <input
              type="text"
              value={contributionData.contribution_section}
              onChange={(e) => setContributionData({ ...contributionData, contribution_section: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              placeholder="e.g., Methodology, Results, Discussion, Literature Review"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">Which part of the project does this contribute to?</p>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-orange-600" />
              Attach Files (Optional) 
              <span className="text-xs text-gray-500 font-normal">Max 5 files • 10MB each</span>
            </label>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.zip,.rar,.jpg,.jpeg,.png,.xlsx,.xls,.pptx,.ppt"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={files.length >= 5}
              className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-all text-sm font-medium text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-4 h-4" />
              {files.length === 0 ? 'Add Files' : `Add More Files (${files.length}/5)`}
            </button>
            
            {/* File List */}
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Paperclip className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                      <span className="text-gray-400 text-xs flex-shrink-0">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 hover:bg-red-100 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Notice */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-600 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 mb-1">About Contributions</p>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Contributions will be reviewed by the project creator</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>You can track approval status in the contributions tab</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-blue-600 flex-shrink-0">•</span>
                    <span>Accepted contributions become part of the project</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="bg-gray-50 border-t border-gray-200 p-3 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !contributionData.contribution_title.trim() || !contributionData.contribution_content.trim()}
            className="px-5 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Contribution
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function MyProjectsManagePage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { myProjects, isLoading, isSubmitting, error, stats, collaborativeProjects } = useAppSelector(state => state.projects)
  const { user } = useAppSelector(state => state.auth)

  // Existing state
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)

  // ✅ ENHANCED: Project type state with auto-fetch on mount
  const [projectType, setProjectType] = useState<'owned' | 'collaborative'>('owned')
  const [showCollaborationRequestsModal, setShowCollaborationRequestsModal] = useState(false)
  const [showAddContributionModal, setShowAddContributionModal] = useState(false)

  // Existing form state
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
  const projectFileRef = useRef(null)
  const coverImageRef = useRef(null)
  const additionalFilesRef = useRef(null)

  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // ✅ ENHANCED: Auto-fetch both owned and collaborative projects on mount
  useEffect(() => {
    console.log("🔄 Component: Fetching all project data...")
    
    const loadAllProjectData = async () => {
      try {
        // Fetch owned projects
        console.log("📥 Fetching owned projects...")
        await dispatch(fetchMyProjects()).unwrap()
        
        // ✅ NEW: Auto-fetch collaborative projects on mount for consistency
        console.log("📥 Auto-fetching collaborative projects...")
        await dispatch(fetchProjectsUserCanContributeTo()).unwrap()
        
        console.log("✅ Component: Successfully loaded all project data")
      } catch (err) {
        console.error("❌ Component: Failed to fetch projects:", err)
        toast.error("Failed to load your projects")
      }
    }

    loadAllProjectData()
  }, [dispatch])

  // ✅ ENHANCED: Use collaborativeProjects directly from Redux state (already fetched on mount)
  const displayProjects = projectType === 'owned' ? myProjects : collaborativeProjects

  console.log("📊 Component: Displaying", displayProjects.length, "projects of type", projectType)

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const filteredProjects = displayProjects.filter(project => {
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    const matchesSearch = !searchQuery ||
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.abstract.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, searchQuery, projectType])

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Check if user is creator of a project
  const isCreator = (project) => {
    return project.author?.id === user?.userId
  }

  // ==================== ALL EXISTING HANDLERS (100% PRESERVED) ====================

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProject(id)).unwrap()
      toast.success("Project deleted successfully!")
      setShowDeleteModal(false)
      setProjectToDelete(null)
    } catch (err) {
      toast.error(err || "Failed to delete project")
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateProjectStatus({ id, status })).unwrap()
      toast.success(`Project ${status.toLowerCase()} successfully!`)
    } catch (err) {
      toast.error(err || "Failed to update status")
    }
  }

  const handleViewProject = (project) => {
    setSelectedProject(project)
    setShowViewModal(true)
  }

  const handleEditProject = (project) => {
    setSelectedProject(project)
    setEditFormData({
      title: project.title,
      abstract: project.abstract,
      full_description: project.full_description || '',
      research_type: project.research_type,
      field_of_study: project.field_of_study || '',
      publication_date: project.publication_date || '',
      doi: project.doi || '',
      visibility: project.visibility,
      collaboration_status: project.collaboration_status,
      tags: project.tags?.map((t) => t.name) || []
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
    if (!selectedProject) return

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
        id: selectedProject.id,
        updates: formData
      })).unwrap()

      toast.success("Project updated successfully!")
      setShowEditModal(false)
      setSelectedProject(null)
      setEditFiles({ project_file: null, cover_image: null, additional_files: [] })
      setFilePreview({ project_file: null, cover_image: null })

      dispatch(fetchMyProjects())
    } catch (err) {
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

  const cleanHtml = (html) => {
    if (!html) return ""
    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    cleaned = cleaned.replace(/<span[^>]*class="[^"]*ql-ui[^"]*"[^>]*>.*?<\/span>/g, "")
    cleaned = cleaned.replace(/ data-list="[^"]*"/g, "")
    cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom: 0.75rem; line-height: 1.5;">')
    cleaned = cleaned.replace(/<ul>/g, '<ul style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: disc;">')
    cleaned = cleaned.replace(/<ol>/g, '<ol style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: decimal;">')
    cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom: 0.25rem; line-height: 1.4;">')
    return cleaned
  }

  const stripHtml = (html = "") => {
    if (!html) return ""
    const tmp = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
    return tmp
  }

  const previewText = (html, max = 200) => {
    const text = stripHtml(html)
    if (!text) return ""
    return text.length > max ? text.slice(0, max).trim() + "…" : text
  }

  const getStatusBadge = (status) => {
    const badges = {
      Draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText },
      Published: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      Archived: { bg: 'bg-orange-100', text: 'text-orange-700', icon: Archive },
      'Under Review': { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock }
    }
    const config = badges[status] || badges.Draft
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

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

      {/* ✅ ENHANCED: Project Type Toggle & Filters with auto-fetched data */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        {/* Project Type Selector */}
        <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
          <button
            onClick={() => setProjectType('owned')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${projectType === 'owned'
                ? 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Created by Me</span>
              <span className="text-xs opacity-75">({stats.total})</span>
            </div>
          </button>
          <button
            onClick={() => setProjectType('collaborative')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm ${projectType === 'collaborative'
                ? 'bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              <span>Collaborating On</span>
              {/* ✅ Use pre-fetched collaborativeProjects count */}
              <span className="text-xs opacity-75">({collaborativeProjects.length})</span>
            </div>
          </button>
        </div>

        {/* Status Filters & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {(['all', 'Draft', 'Published', 'Archived']).map((status) => (
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
                  ({status === 'all' ? displayProjects.length : displayProjects.filter(p => p.status === status).length})
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-115">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-xs"
              />
            </div>
          </div>
        </div>
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
              {searchQuery ? 'No projects found' : projectType === 'collaborative' ? 'No collaborative projects yet' : 'No projects yet'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {searchQuery ? 'Try adjusting your search' : projectType === 'collaborative' ? 'Projects you collaborate on will appear here' : 'Create your first research project to get started'}
            </p>
            {!searchQuery && projectType === 'owned' && (
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
                    <th className="px-4 py-2 text-left"></th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Project</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Stats</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedProjects.map((project, index) => (
                    <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-[#A8C8E8] to-[#8DB6E1] rounded-full flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[#0158B7]">
                            {startIndex + index + 1}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-start space-x-2">
                          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <EnhancedImageDisplay
                              imageUrl={project.cover_image_url}
                              title={project.title}
                              className="w-12 h-12"
                              showZoom={false}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-semibold text-gray-900 truncate">
                              {previewText(project.title, 20)}
                            </h3>
                            <div className="rich-text-content text-gray-700 text-sm" style={{ lineHeight: "1.5" }}>
                              <p className="mb-2">{previewText(project.abstract, 50)}</p>
                            </div>
                            {/* Show collaborator badge for collaborative projects */}
                            {projectType === 'collaborative' && (
                              <span className="inline-flex items-center px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-[10px] font-medium mt-1">
                                <Users className="w-3 h-3 mr-1" />
                                Collaborator
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs text-gray-700">{project.research_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">{getStatusBadge(project.status)}</td>
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
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center space-x-1">

                          <button
                            onClick={() => handleViewProject(project)}
                            className="p-1.5 bg-[#A8C8E8]/40 text-[#0158B7] rounded-lg hover:bg-[#8DB6E1]/50 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditProject(project)}
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
                          {/* ✅ ENHANCED: Conditional actions based on project type */}
                          {projectType === 'owned' && isCreator(project) ? (
                            // Actions for owned projects
                            <>
                              <button
                                onClick={() => handleEditProject(project)}
                                className="p-1.5 bg-[#8DB6E1]/40 text-[#0362C3] rounded-lg hover:bg-[#5E96D2]/50 transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>

                              {/* Show collaboration requests button if seeking collaborators */}
                              {(project.collaboration_status === 'Seeking Collaborators' ||
                                project.collaboration_status === 'Collaborative') && (
                                  <button
                                    onClick={() => {
                                      setSelectedProject(project)
                                      setShowCollaborationRequestsModal(true)
                                    }}
                                    className="p-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors relative"
                                    title="Collaboration Requests"
                                  >
                                    <UserPlus className="w-3.5 h-3.5" />
                                  </button>
                                )}

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
                            </>
                          ) : (
                            // ✅ ENHANCED: Actions for collaborative projects - ONLY Add Contribution button
                            projectType === 'collaborative' && (
                              <button
                                onClick={() => {
                                  setSelectedProject(project)
                                  setShowAddContributionModal(true)
                                }}
                                className="p-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Add Contribution"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      {/* View Project Modal - 100% ORIGINAL */}
      {showViewModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto pt-20">
          <div className="bg-white rounded-xl w-[80%] max-w-[1400px] my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white p-4 flex items-center justify-between rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Project Details</h2>
                  <p className="text-xs text-white/80">Complete information about this research</p>
                </div>
              </div>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Enhanced Cover Image Display */}
              {selectedProject?.cover_image_url && (
                <div className="relative rounded-xl overflow-hidden bg-gray-100">
                  <EnhancedImageDisplay
                    imageUrl={selectedProject.cover_image_url}
                    title={selectedProject.title}
                    className="h-64 md:h-80"
                    showZoom={true}
                  />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{selectedProject.title}</h3>
                    {getStatusBadge(selectedProject.status)}
                  </div>
                </div>
              )}

              {/* Rest of the modal content remains the same */}
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-[#0158B7]/10 to-[#5E96D2]/10 rounded-xl p-4 border border-[#0158B7]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-[#0158B7]" />
                    <span className="text-xs font-semibold text-gray-700">Research Type</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.research_type}</p>
                </div>

                <div className="bg-gradient-to-br from-[#5E96D2]/10 to-[#8DB6E1]/10 rounded-xl p-4 border border-[#5E96D2]/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-[#5E96D2]" />
                    <span className="text-xs font-semibold text-gray-700">Field of Study</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.field_of_study || 'Not specified'}</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-green-600" />
                    <span className="text-xs font-semibold text-gray-700">Visibility</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.visibility}</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-700">Collaboration</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{selectedProject.collaboration_status}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <Eye className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedProject.view_count}</p>
                  <p className="text-xs text-gray-600">Views</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <Download className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedProject.download_count}</p>
                  <p className="text-xs text-gray-600">Downloads</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <Calendar className="w-5 h-5 text-orange-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-900">{new Date(selectedProject.created_at).toLocaleDateString()}</p>
                  <p className="text-xs text-gray-600">Created</p>
                </div>
              </div>

              {/* Abstract */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0158B7]" />
                  Abstract
                </h4>
                <div
                  className="prose prose-sm max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: cleanHtml(selectedProject?.abstract || '') }}
                />
              </div>

              {/* Full Description */}
              {selectedProject?.full_description && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#0158B7]" />
                    Full Description
                  </h4>
                  <div
                    className="prose prose-sm max-w-none text-gray-700"
                    dangerouslySetInnerHTML={{ __html: cleanHtml(selectedProject.full_description) }}
                  />
                </div>
              )}

              {/* Tags */}
              {selectedProject?.tags && selectedProject.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#0158B7]" />
                    Research Tags
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-gradient-to-r from-[#0158B7]/10 to-[#5E96D2]/10 text-[#0158B7] rounded-lg text-xs font-medium border border-[#0158B7]/20"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedProject?.publication_date && (
                  <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">Publication Date</p>
                      <p className="text-sm text-gray-900">{new Date(selectedProject.publication_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {selectedProject?.doi && (
                  <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-gray-700">DOI</p>
                      <p className="text-sm text-gray-900 font-mono">{selectedProject.doi}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Files */}
              {selectedProject?.project_file_url && (
                <div className="bg-gradient-to-br from-[#0158B7]/5 to-[#5E96D2]/5 rounded-xl p-4 border border-[#0158B7]/20">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-[#0158B7]" />
                    Project Files
                  </h4>
                  <a
                    href={selectedProject?.project_file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all border border-gray-200"
                  >
                    <div className="p-2 bg-[#0158B7]/10 rounded-lg">
                      <FileText className="w-5 h-5 text-[#0158B7]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Main Project File</p>
                      <p className="text-xs text-gray-500">Click to view or download</p>
                    </div>
                    <Download className="w-4 h-4 text-gray-400" />
                  </a>
                </div>
              )}

              {/* Additional Files Section */}
              {selectedProject?.files && selectedProject.files.length > 0 && (
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-purple-600" />
                    Additional Files ({selectedProject.files.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedProject.files.map((file) => (
                      <a
                        key={file.id}
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all border border-purple-200 hover:border-purple-400"
                      >
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Paperclip className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.file_name}</p>
                          <p className="text-xs text-gray-500">
                            {(parseInt(file.file_size) / 1024).toFixed(2)} KB • {new Date(file.uploaded_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Download className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-end gap-2 rounded-b-xl">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false)
                  handleEditProject(selectedProject)
                }}
                className="px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal with Enhanced File Upload */}
      {showEditModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto pt-20">
          <div className="bg-white rounded-xl w-[80%] max-w-[1400px] my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white p-4 flex items-center justify-between rounded-t-xl z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold">Edit Research Project</h2>
                  <p className="text-xs text-white/80">Update your research information and files</p>
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
              {/* File Management Section - ENHANCED */}
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
                    {selectedProject?.cover_image_url && !filePreview.cover_image && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2">Current Image:</p>
                        <EnhancedImageDisplay
                          imageUrl={selectedProject.cover_image_url}
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
                    {selectedProject?.project_file_url && !filePreview.project_file && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-600 mb-2">Current File:</p>
                        <a
                          href={selectedProject.project_file_url}
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
                {selectedProject?.files && selectedProject.files.length > 0 && (
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex items-center gap-2 mb-3">
                      <Paperclip className="w-4 h-4 text-purple-600" />
                      <span className="text-xs font-semibold text-gray-700">Additional Files ({selectedProject.files.length})</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {selectedProject.files.map((file) => (
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

              {/* Tags Section - ENHANCED */}
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

      {/* Collaboration Requests Modal */}
      {showCollaborationRequestsModal && selectedProject && (
        <CollaborationRequestsModal
          project={selectedProject}
          onClose={() => {
            setShowCollaborationRequestsModal(false)
            setSelectedProject(null)
          }}
        />
      )}

      {/* ✅ ENHANCED: Add Contribution Modal - Compact & Complete */}
      {showAddContributionModal && selectedProject && (
        <AddContributionModal
          project={selectedProject}
          onClose={() => {
            setShowAddContributionModal(false)
            setSelectedProject(null)
          }}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  )
}