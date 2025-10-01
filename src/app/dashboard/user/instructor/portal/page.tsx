// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  getPendingProjects,
  getInstructorStudents,
  approveProject,
  rejectProject,
  returnProject,
  clearError,
  clearPendingProjects
} from "@/lib/features/auth/institution-portal-slice"
import {
  Clock,
  Filter,
  Search,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  FileText,
  Users,
  GraduationCap,
  Mail,
  MessageSquare,
  Calendar,
  Tag,
  BarChart3,
  RefreshCw,
  X,
  User
} from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"



const formatDistanceToNow = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`
  const years = Math.floor(days / 365)
  return `${years} year${years > 1 ? 's' : ''} ago`
}
const PROJECT_STATUSES = [
  { value: 'all', label: 'All Projects', color: 'text-gray-600' },
  { value: 'Draft', label: 'Draft (Not Submitted)', color: 'text-gray-600' },        // NEW
  { value: 'Pending Review', label: 'Pending Review', color: 'text-yellow-600' },
  { value: 'Returned', label: 'Returned', color: 'text-orange-600' },
  { value: 'Approved', label: 'Approved', color: 'text-green-600' },
  { value: 'Rejected', label: 'Rejected', color: 'text-red-600' }
]
export default function InstructorPortalPage() {
  const dispatch = useAppDispatch()
  const { pendingProjects, students, isLoading, isSubmitting, projectsPagination, error } = useAppSelector(
    state => state.institutionPortal
  )

  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return' | null>(null)
  const [feedback, setFeedback] = useState('')

  useEffect(() => {
    dispatch(getInstructorStudents({ page: 1, limit: 100 }))
    dispatch(getPendingProjects({
      page: 1,
      limit: 10,
      status: selectedStatus === 'all' ? undefined : selectedStatus
    }))

    return () => {
      dispatch(clearPendingProjects())
    }
  }, [dispatch, selectedStatus])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await dispatch(getPendingProjects({
      page: 1,
      limit: 10,
      status: selectedStatus === 'all' ? undefined : selectedStatus
    }))
    await dispatch(getInstructorStudents({ page: 1, limit: 100 }))
    setIsRefreshing(false)
  }

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status)
  }

  const openActionModal = (project: any, action: 'approve' | 'reject' | 'return') => {
    setSelectedProject(project)
    setActionType(action)
    setFeedback('')
    setShowActionModal(true)
  }

  const closeActionModal = () => {
    setShowActionModal(false)
    setSelectedProject(null)
    setActionType(null)
    setFeedback('')
  }

  const handleSubmitAction = async () => {
    if (!selectedProject || !actionType) return

    if ((actionType === 'reject' || actionType === 'return') && feedback.trim().length < 20) {
      toast.error('Feedback must be at least 20 characters')
      return
    }

    try {
      if (actionType === 'approve') {
        await dispatch(approveProject({
          projectId: selectedProject.id,
          feedback: feedback || 'Project approved'
        })).unwrap()
        toast.success('Project approved successfully!')
      } else if (actionType === 'reject') {
        await dispatch(rejectProject({
          projectId: selectedProject.id,
          feedback
        })).unwrap()
        toast.success('Project rejected')
      } else if (actionType === 'return') {
        await dispatch(returnProject({
          projectId: selectedProject.id,
          feedback
        })).unwrap()
        toast.success('Project returned for revision')
      }
      closeActionModal()
    } catch (err: any) {
      toast.error(err || 'Action failed')
    }
  }

  const filteredProjects = pendingProjects.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.author?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.author?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

const getStatusBadge = (status: string) => {
  const colors = {
    'Draft': 'bg-gray-100 text-gray-700 border-gray-200',                    // NEW
    'Pending Review': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Approved': 'bg-green-100 text-green-700 border-green-200',
    'Rejected': 'bg-red-100 text-red-700 border-red-200',
    'Returned': 'bg-orange-100 text-orange-700 border-orange-200'
  }
  return colors[status] || colors['Draft']
}

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp))
    } catch {
      return 'Recently'
    }
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/user" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-[#0158B7]" />
                Instructor Portal
              </h1>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT SIDEBAR */}
            <div className="hidden lg:block lg:col-span-3 h-full overflow-hidden">
              <div className="h-full overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin' }}>
                {/* Search Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400" />
                    Search Projects
                  </h3>
                  <input
                    type="text"
                    placeholder="Search by title or author..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent text-sm"
                  />
                </div>

                {/* Filter Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    Filter by Status
                  </h3>
                  <div className="space-y-1">
                    {PROJECT_STATUSES.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => handleStatusChange(status.value)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          selectedStatus === status.value
                            ? 'bg-[#0158B7]/10 text-[#0158B7] border border-[#0158B7]/20 shadow-sm'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-2 h-2 rounded-full ${status.color.replace('text-', 'bg-')}`} />
                        {status.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Students List Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200 p-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      My Students
                      <span className="ml-auto text-sm bg-green-600 text-white px-2 py-0.5 rounded-full">
                        {students.length}
                      </span>
                    </h3>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                    {isLoading && students.length === 0 ? (
                      <div className="p-4 space-y-3">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : students.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No students assigned</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {students.map((student) => (
                          <div key={student.id} className="p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-sm">
                                  {getInitials(student.first_name, student.last_name)}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-medium text-gray-900 text-sm truncate">
                                    {student.first_name} {student.last_name}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                                  <Mail className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{student.email}</span>
                                </div>
                                {student.profile?.department && (
                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <GraduationCap className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{student.profile.department}</span>
                                  </div>
                                )}
                                {student.profile?.field_of_study && (
                                  <div className="mt-1">
                                    <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                                      {student.profile.field_of_study}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="lg:col-span-6 h-full overflow-hidden flex flex-col">
              {/* Header */}
              <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Projects for Review
                    {selectedStatus !== 'all' && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        • {PROJECT_STATUSES.find(s => s.value === selectedStatus)?.label}
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Latest first</span>
                  </div>
                </div>
              </div>

              {/* Projects List */}
              <div className="flex-1 min-h-0 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {isLoading && pendingProjects.length === 0 ? (
                      <div className="p-8 space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="animate-pulse space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="flex gap-2">
                              <div className="h-8 bg-gray-200 rounded w-20"></div>
                              <div className="h-8 bg-gray-200 rounded w-20"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredProjects.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <FileText className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
                        <p className="text-gray-500">
                          {searchQuery ? 'No projects match your search' : 'No projects need review'}
                        </p>
                      </div>
                    ) : (
                      <>
                        {filteredProjects.map((project) => (
                          <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
                                <div className="flex items-center gap-3 mb-2">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(project.approval_status)}`}>
                                    {project.approval_status}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    by {project.author?.first_name} {project.author?.last_name}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{project.abstract}</p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {formatTimestamp(project.created_at)}
                                </span>
                                {project.research_type && (
                                  <span className="flex items-center gap-1">
                                    <Tag className="w-3 h-3" />
                                    {project.research_type}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => openActionModal(project, 'approve')}
                                  disabled={isSubmitting}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  Approve
                                </button>
                                <button
                                  onClick={() => openActionModal(project, 'return')}
                                  disabled={isSubmitting}
                                  className="px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  Return
                                </button>
                                <button
                                  onClick={() => openActionModal(project, 'reject')}
                                  disabled={isSubmitting}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-1 disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="hidden lg:block lg:col-span-3 h-full overflow-hidden">
              <div className="h-full overflow-y-auto pr-2 space-y-4" style={{ scrollbarWidth: 'thin' }}>

                <div className="bg-gradient-to-br from-[#0158B7]/5 to-[#5E96D2]/5 border border-[#0158B7]/20 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#0158B7]" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                      ✅ <strong>Approve</strong> to publish project
                    </div>
                    <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                      ↩️ <strong>Return</strong> for revisions
                    </div>
                    <div className="bg-white rounded-lg p-3 text-sm text-gray-700">
                      ❌ <strong>Reject</strong> to decline
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && selectedProject && actionType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
            <div className={`px-6 py-4 border-b ${
              actionType === 'approve' ? 'bg-green-50 border-green-200' :
              actionType === 'reject' ? 'bg-red-50 border-red-200' :
              'bg-orange-50 border-orange-200'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {actionType === 'approve' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {actionType === 'reject' && <XCircle className="w-5 h-5 text-red-600" />}
                  {actionType === 'return' && <RotateCcw className="w-5 h-5 text-orange-600" />}
                  {actionType === 'approve' ? 'Approve Project' : actionType === 'reject' ? 'Reject Project' : 'Return for Revision'}
                </h3>
                <button onClick={closeActionModal} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-1">{selectedProject.title}</h4>
                <p className="text-sm text-gray-600">by {selectedProject.author?.first_name} {selectedProject.author?.last_name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback {(actionType === 'reject' || actionType === 'return') && <span className="text-red-500">*</span>}
                  {(actionType === 'reject' || actionType === 'return') && (
                    <span className="text-xs text-gray-500 ml-2">(Min. 20 characters)</span>
                  )}
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent text-sm"
                  placeholder={
                    actionType === 'approve' ? 'Optional: Add congratulations message...' :
                    actionType === 'reject' ? 'Required: Explain why the project is being rejected...' :
                    'Required: Provide specific feedback for improvements...'
                  }
                />
                {feedback.length > 0 && feedback.length < 20 && (actionType === 'reject' || actionType === 'return') && (
                  <p className="text-xs text-red-500 mt-1">Need {20 - feedback.length} more characters</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={closeActionModal}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitAction}
                disabled={isSubmitting || ((actionType === 'reject' || actionType === 'return') && feedback.trim().length < 20)}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50 ${
                  actionType === 'approve' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  actionType === 'reject' ? 'bg-red-600 hover:bg-red-700 text-white' :
                  'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {actionType === 'approve' ? 'Approve Project' : actionType === 'reject' ? 'Reject Project' : 'Return Project'}
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