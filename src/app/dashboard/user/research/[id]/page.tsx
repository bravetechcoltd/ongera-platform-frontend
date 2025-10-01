// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchProjectById,
  likeProject,
  commentOnProject,
  requestCollaboration,
  fetchProjectCollaborators,
  fetchProjectContributions,
  fetchProjectCollaborationRequests,
  approveCollaborationRequest,
  rejectCollaborationRequest,
  approveContribution,
  addContribution // ✅ ADD THIS IMPORT
} from '@/lib/features/auth/projectSlice';
import {
  Eye, Download, Calendar, User, Tag, FileText, Globe, Users,
  Share2, BookOpen, ArrowLeft, Building, MapPin, Link2,
  ExternalLink, Clock, BarChart3, Heart, MessageCircle,
  Bookmark, Send, ChevronDown, ChevronUp, ZoomIn, X,
  UserPlus, CheckCircle, AlertCircle, Loader2, Mail,
  Plus, Paperclip, Upload // ✅ ADD THESE IMPORTS
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';
import RichTextEditor from '@/components/ui/richTextEditor'; // ✅ ADD THIS IMPORT

// ==================== IMAGE PREVIEW MODAL (100% PRESERVED) ====================

function ImagePreviewModal({ imageUrl, title, onClose }) {
  if (!imageUrl) return null

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
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

// ==================== CONTRIBUTION CARD COMPONENT ====================

function ContributionCard({ contribution, isProjectOwner, onApproveContribution }) {
  const [showApproveModal, setShowApproveModal] = useState(false)

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy • hh:mm a')
    } catch {
      return dateString
    }
  }

  const cleanHtml = (html: string) => {
    if (!html) return ""
    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    cleaned = cleaned.replace(/<span[^>]*class="[^"]*ql-ui[^"]*"[^>]*>.*?<\/span>/g, "")
    cleaned = cleaned.replace(/ data-list="[^"]*"/g, "")
    return cleaned
  }

  const handleApprove = async (contributionId: string) => {
    await onApproveContribution(contributionId)
    setShowApproveModal(false)
  }

  return (
    <>
      <div
        className={`border rounded-lg p-4 transition-all ${contribution.is_approved
            ? 'border-green-200 bg-green-50 hover:border-green-300'
            : 'border-yellow-200 bg-yellow-50 hover:border-yellow-300'
          }`}
      >
        <div className="flex items-start gap-3 mb-3">
          <img
            src={contribution.contributor.profile_picture_url}
            alt={contribution.contributor.first_name}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h4 className="font-semibold text-gray-900 text-sm">
                {contribution.contribution_title}
              </h4>

              {/* Approval Status Badge */}
              {contribution.is_approved ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                  <Clock className="w-3 h-3" />
                  Pending Review
                </span>
              )}

              {/* Project Owner Approve Button */}
              {isProjectOwner && !contribution.is_approved && (
                <button
                  onClick={() => setShowApproveModal(true)}
                  className="ml-auto px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                >
                  <CheckCircle className="w-3 h-3" />
                  Approve
                </button>
              )}
            </div>

            <p className="text-xs text-gray-600">
              By {contribution.contributor.first_name} {contribution.contributor.last_name}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3 h-3" />
              {formatDate(contribution.created_at)}
              {contribution.approved_at && (
                <>
                  <span className="mx-1">•</span>
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Approved {formatDate(contribution.approved_at)}
                </>
              )}
            </p>
          </div>
        </div>

        {contribution.contribution_section && (
          <p className="text-xs text-blue-600 font-medium mb-2">
            Section: {contribution.contribution_section}
          </p>
        )}

        <div
          className="rich-text-content text-gray-700 text-sm mb-3"
          dangerouslySetInnerHTML={{ __html: cleanHtml(contribution.contribution_content) }}
          style={{ lineHeight: "1.5" }}
        />

        {contribution.contribution_files && contribution.contribution_files.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">Attached Files:</p>
            <div className="flex flex-wrap gap-2">
              {contribution.contribution_files.map((file, idx) => (
                <a
                  key={idx}
                  href={file.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  {file.file_name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Approve Contribution Modal */}
      {showApproveModal && (
        <ApproveContributionModal
          contribution={contribution}
          onClose={() => setShowApproveModal(false)}
          onApprove={handleApprove}
        />
      )}
    </>
  )
}

// ==================== APPROVE CONTRIBUTION MODAL ====================

function ApproveContributionModal({ contribution, onClose, onApprove }) {
  const dispatch = useAppDispatch()
  const { isSubmitting } = useAppSelector(state => state.projects)

  const handleApprove = async () => {
    try {
      await onApprove(contribution.id)
      onClose()
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Approve Contribution</h2>
              <p className="text-sm text-white/90 mt-1">
                Make this contribution public
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Contribution Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">
              {contribution.contribution_title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <User className="w-3 h-3" />
              <span>by {contribution.contributor.first_name} {contribution.contributor.last_name}</span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
              {contribution.contribution_content.replace(/<[^>]*>/g, '').substring(0, 100)}...
            </p>
          </div>

          {/* Info Notice */}
          <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-900 mb-1">
                  What happens when you approve?
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Contribution becomes visible to all project viewers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Contributor receives notification email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span>•</span>
                    <span>Appears in project contributions list</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleApprove}
            disabled={isSubmitting}
            className="px-5 py-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Approving...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Approve Contribution
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== ADD CONTRIBUTION MODAL ====================

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

// ==================== COLLABORATION REQUESTS MODAL ====================

function CollaborationRequestsModal({ project, onClose }) {
  const dispatch = useAppDispatch();
  const { projectCollaborationRequests, isSubmitting } = useAppSelector(state => state.projects);
  const [processingRequest, setProcessingRequest] = useState(null);

  useEffect(() => {
    if (project?.id) {
      dispatch(fetchProjectCollaborationRequests({
        projectId: project.id,
        status: 'Pending'
      }));
    }
  }, [dispatch, project?.id]);

  const handleApprove = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      await dispatch(approveCollaborationRequest(requestId)).unwrap();
      toast.success("🎉 Request approved! User is now a collaborator.");
      // Refresh the requests list
      dispatch(fetchProjectCollaborationRequests({
        projectId: project.id,
        status: 'Pending'
      }));
    } catch (error) {
      toast.error(error || "Failed to approve request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleReject = async (requestId) => {
    setProcessingRequest(requestId);
    try {
      await dispatch(rejectCollaborationRequest({
        requestId,
        rejection_reason: "Declined by project owner"
      })).unwrap();
      toast.success("Request rejected successfully");
      // Refresh the requests list
      dispatch(fetchProjectCollaborationRequests({
        projectId: project.id,
        status: 'Pending'
      }));
    } catch (error) {
      toast.error(error || "Failed to reject request");
    } finally {
      setProcessingRequest(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(parseISO(dateString), 'MMM dd, yyyy • hh:mm a');
    } catch {
      return dateString;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white p-6 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Collaboration Requests</h2>
                <p className="text-sm text-white/90">
                  Manage requests to join your project
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Info Banner */}
        <div className="px-6 py-4 bg-gradient-to-b from-blue-50 to-white border-b border-blue-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {project.cover_image_url && (
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-12 h-12 rounded-lg object-cover border-2 border-white shadow-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">
                {project.title}
              </h3>
              <p className="text-xs text-gray-600">
                Review and manage collaboration requests
              </p>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              {projectCollaborationRequests?.length || 0} Pending
            </div>
          </div>
        </div>

        {/* Requests List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {!projectCollaborationRequests || projectCollaborationRequests.length === 0 ? (
            <div className="text-center py-12">
              <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Pending Requests
              </h3>
              <p className="text-gray-500 text-sm max-w-sm mx-auto">
                You don't have any pending collaboration requests at the moment.
                Users who request to contribute will appear here.
              </p>
            </div>
          ) : (
            projectCollaborationRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-all bg-white shadow-sm"
              >
                {/* Requester Info */}
                <div className="flex items-start gap-4 mb-4">
                  <img
                    src={request.requester.profile_picture_url || '/default-avatar.png'}
                    alt={request.requester.first_name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-bold text-gray-900 text-base">
                        {request.requester.first_name} {request.requester.last_name}
                      </h4>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                        {request.requester.account_type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {request.requester.email}
                    </p>
                    {request.requester.profile?.institution_name && (
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        {request.requester.profile.institution_name}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Requested {formatDate(request.requested_at)}
                    </p>
                  </div>
                </div>

                {/* Request Details */}
                <div className="space-y-3">
                  {/* Reason */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                      <MessageCircle className="w-3.5 h-3.5 text-blue-600" />
                      Why they want to contribute:
                    </label>
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {request.reason}
                      </p>
                    </div>
                  </div>

                  {/* Expertise */}
                  {request.expertise && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-green-600" />
                        Their expertise:
                      </label>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {request.expertise}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Research Interests */}
                  {request.requester.profile?.research_interests?.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        Research Interests:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {request.requester.profile.research_interests.slice(0, 6).map((interest, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium"
                          >
                            {interest}
                          </span>
                        ))}
                        {request.requester.profile.research_interests.length > 6 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{request.requester.profile.research_interests.length - 6} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleReject(request.id)}
                    disabled={isSubmitting && processingRequest === request.id}
                    className="px-4 py-2 bg-white border-2 border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && processingRequest === request.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <X className="w-4 h-4" />
                    )}
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={isSubmitting && processingRequest === request.id}
                    className="px-5 py-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting && processingRequest === request.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve Request
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl flex-shrink-0">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {projectCollaborationRequests?.length || 0} pending request(s)
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== REQUEST COLLABORATION MODAL ====================

function RequestCollaborationModal({ project, onClose }) {
  const dispatch = useAppDispatch()
  const { isSubmitting } = useAppSelector(state => state.projects)
  const { user } = useAppSelector((state) => state.auth)

  const [formData, setFormData] = useState({
    reason: '',
    expertise: ''
  })

  const handleSubmit = async () => {
    if (!formData.reason.trim()) {
      toast.error("Please provide a reason for collaboration")
      return
    }

    try {
      await dispatch(requestCollaboration({
        projectId: project.id,
        reason: formData.reason,
        expertise: formData.expertise
      })).unwrap()

      toast.success("🎉 Collaboration request submitted successfully!")
      onClose()

      // Refresh project details to update UI
      dispatch(fetchProjectById(project.id))
    } catch (error) {
      toast.error(error || "Failed to submit request")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-5xl my-8 shadow-2xl transform transition-all max-h-[90vh] flex flex-col">
        {/* Header with Gradient - Compact */}
        <div className="bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white p-4 rounded-t-2xl flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Request to Contribute</h2>
                <p className="text-xs text-white/90">Join this research collaboration</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Info Banner - Compact */}
        <div className="px-4 py-3 bg-gradient-to-b from-purple-50 to-white border-b border-purple-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            {project.cover_image_url && (
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-10 h-10 rounded-lg object-cover border-2 border-white shadow-md flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-sm truncate">
                {project.title}
              </h3>
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <User className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">by {project.author.first_name} {project.author.last_name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Form Content */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          {/* Your Profile Preview - Compact */}
          {user && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
              <div className="flex items-center gap-2">
                <img
                  src={user.profile_picture_url || '/default-avatar.png'}
                  alt={user.first_name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-gray-600 truncate">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reason Field - Compact */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
              Why do you want to contribute?
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
              rows={3}
              placeholder="Explain your interest and how you can contribute..."
              maxLength={500}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">Be specific</p>
              <p className="text-xs text-gray-400">{formData.reason.length}/500</p>
            </div>
          </div>

          {/* Expertise Field - Compact */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-1.5 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-pink-600 flex-shrink-0" />
              Your Expertise & Skills
              <span className="text-xs font-normal text-gray-500">(Optional)</span>
            </label>
            <textarea
              value={formData.expertise}
              onChange={(e) => setFormData({ ...formData, expertise: e.target.value })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none transition-all"
              rows={2}
              placeholder="Highlight relevant skills..."
              maxLength={300}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{formData.expertise.length}/300</p>
          </div>

          {/* Info Notice - Compact */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-600 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-900 mb-1">What happens next?</p>
                <ul className="text-xs text-gray-700 space-y-0.5">
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-600 flex-shrink-0">•</span>
                    <span>Creator reviews your request</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-600 flex-shrink-0">•</span>
                    <span>Email notification with decision</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-purple-600 flex-shrink-0">•</span>
                    <span>Start contributing if approved</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions - Sticky */}
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3 flex justify-end gap-2 rounded-b-2xl flex-shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.reason.trim()}
            className="px-5 py-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// ==================== MAIN PROJECT DETAILS PAGE COMPONENT ====================

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const projectId = params.id as string;

  const { currentProject, isLoading, error, isSubmitting } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'collaborators' | 'contributions' | 'author'>('overview');
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({
    interests: true,
    tags: false
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [showAddContributionModal, setShowAddContributionModal] = useState(false); // ✅ ADD THIS STATE

  // State to store pre-fetched data
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [contributions, setContributions] = useState<any[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Collaboration modal state
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [showCollaborationRequestsModal, setShowCollaborationRequestsModal] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  const fromCommunity = searchParams.get('from') === 'community';
  const communityId = searchParams.get('from') === 'community' ? searchParams.get('communityId') : null;
  const communityName = searchParams.get('communityName');

  // Project variable
  const project = currentProject?.project;

  // Determine if current user is the project creator
  const isProjectCreator = user?.id === project?.author?.id;

  // ✅ ENHANCED: Determine if user is already a contributor/collaborator
  const isUserContributor = useMemo(() => {
    if (!user || !project) return false;
    
    // Check multiple sources for contributor status
    
    // 1. Check approved_collaborators array (from project response)
    if (project.approved_collaborators && Array.isArray(project.approved_collaborators)) {
      const isInApproved = project.approved_collaborators.some(
        (collab: any) => collab.user_id === user.id
      );
      if (isInApproved) return true;
    }
    
    // 2. Check collaboration_info array (from project response)
    if (project.collaboration_info && Array.isArray(project.collaboration_info)) {
      const userCollabEntry = project.collaboration_info.find(
        (info: any) => info.user_id === user.id && info.status === 'Approved'
      );
      if (userCollabEntry) return true;
    }
    
    // 3. Check fetched collaborators list
    if (collaborators.length > 0) {
      const isInCollaborators = collaborators.some(
        (collab: any) => collab.id === user.id
      );
      if (isInCollaborators) return true;
    }
    
    return false;
  }, [user, project, collaborators]);

  // ✅ ENHANCED: Check user's collaboration request status
  const userCollaborationStatus = useMemo(() => {
    if (!user || !project?.collaboration_info || !Array.isArray(project.collaboration_info)) {
      return null;
    }

    // Find user's entry in collaboration_info array
    const userCollabEntry = project.collaboration_info.find(
      (info: any) => info.user_id === user.id
    );

    console.log("🔍 User collaboration status check:", {
      userId: user.id,
      foundEntry: userCollabEntry,
      allEntries: project.collaboration_info
    });

    return userCollabEntry || null;
  }, [user, project?.collaboration_info]);

  // ✅ ENHANCED: Determine collaboration button state with new conditions
  const collaborationButtonState = useMemo(() => {
    console.log("🎯 Calculating button state:", {
      hasUser: !!user,
      isProjectCreator,
      isUserContributor,
      collaborationStatus: project?.collaboration_status,
      userCollabStatus: userCollaborationStatus?.status
    });

    // Condition 1: No user logged in
    if (!user) {
      return { show: false, disabled: false, text: '', icon: null, className: '' };
    }

    // Condition 2: User is project creator - don't show button
    if (isProjectCreator) {
      return { show: false, disabled: false, text: '', icon: null, className: '' };
    }

    // ✅ Condition 3: User is already a contributor/collaborator - don't show request button
    if (isUserContributor) {
      return { show: false, disabled: false, text: '', icon: null, className: '' };
    }

    // Condition 4: Project is not seeking collaborators
    if (project?.collaboration_status !== 'Seeking Collaborators' &&
      project?.collaboration_status !== 'Collaborative') {
      return { show: false, disabled: false, text: '', icon: null, className: '' };
    }

    // ✅ NEW CONDITIONS: Check collaboration_info for user's status
    if (userCollaborationStatus) {
      const status = userCollaborationStatus.status;

      // Condition 5: Request is Pending
      if (status === 'Pending') {
        console.log("✅ Showing PENDING button");
        return {
          show: true,
          disabled: true,
          text: 'Pending Request',
          icon: Clock,
          className: 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300 cursor-not-allowed opacity-75'
        };
      }

      // Condition 6: Request was Approved (shouldn't happen as isUserContributor would be true)
      if (status === 'Approved') {
        console.log("✅ User is approved - hiding button");
        return { show: false, disabled: false, text: '', icon: null, className: '' };
      }

      // Condition 7: Request was Rejected - don't show button
      if (status === 'Rejected') {
        console.log("✅ User was rejected - hiding button");
        return { show: false, disabled: false, text: '', icon: null, className: '' };
      }
    }

    // Default: Show active "Request to Contribute" button
    console.log("✅ Showing ACTIVE request button");
    return {
      show: true,
      disabled: false,
      text: 'Request to Contribute',
      icon: UserPlus,
      className: 'bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white hover:shadow-lg hover:scale-105'
    };
  }, [user, isProjectCreator, isUserContributor, project?.collaboration_status, userCollaborationStatus]);

  // ✅ NEW: Fetch collaboration requests count for project creator
  useEffect(() => {
    const loadCollaborationRequests = async () => {
      if (isProjectCreator && projectId) {
        try {
          const requests = await dispatch(fetchProjectCollaborationRequests({
            projectId,
            status: 'Pending'
          })).unwrap();
          setPendingRequestsCount(requests.length || 0);
        } catch (error) {
          console.error("Failed to fetch collaboration requests:", error);
        }
      }
    };

    loadCollaborationRequests();
  }, [dispatch, projectId, isProjectCreator]);

  // Handle approve contribution
  const handleApproveContribution = async (contributionId: string) => {
    try {
      await dispatch(approveContribution(contributionId)).unwrap()

      // Update local state to reflect approval
      setContributions(prev => prev.map(contrib =>
        contrib.id === contributionId
          ? {
            ...contrib,
            is_approved: true,
            approved_at: new Date().toISOString()
          }
          : contrib
      ))

      toast.success("🎉 Contribution approved! It's now visible to everyone.")
    } catch (error: any) {
      toast.error(error || "Failed to approve contribution")
    }
  }

  // ✅ ENHANCED: Fetch project details AND preload collaborators and contributions on mount
  useEffect(() => {
    const loadAllProjectData = async () => {
      if (!projectId) return;

      try {
        // 1. Fetch main project details first
        await dispatch(fetchProjectById(projectId)).unwrap();

        // 2. Immediately fetch collaborators and contributions in parallel
        const [collaboratorsData, contributionsData] = await Promise.allSettled([
          dispatch(fetchProjectCollaborators(projectId)).unwrap(),
          dispatch(fetchProjectContributions({
            projectId,
            include_pending: true // Will be filtered by backend based on permissions
          })).unwrap()
        ]);

        // 3. Store the fetched data
        if (collaboratorsData.status === 'fulfilled') {
          setCollaborators([
            collaboratorsData.value.author,
            ...(collaboratorsData.value.collaborators || [])
          ]);
        }

        if (contributionsData.status === 'fulfilled') {
          setContributions(contributionsData.value.contributions || []);
        }

        // Mark initial load as complete
        setInitialLoadComplete(true);

      } catch (error) {
        console.error("Error loading project data:", error);
      }
    };

    loadAllProjectData();
  }, [dispatch, projectId]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const cleanHtml = (html: string) => {
    if (!html) return ""
    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    cleaned = cleaned.replace(/<span[^>]*class="[^"]*ql-ui[^"]*"[^>]*>.*?<\/span>/g, "")
    cleaned = cleaned.replace(/ data-list="[^"]*"/g, "")
    cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom: 0.75rem; line-height: 1.5;">')
    cleaned = cleaned.replace(/<ul>/g, '<ul style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: disc;">')
    cleaned = cleaned.replace(/<ol>/g, '<ol style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: decimal;">')
    cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom: 0.25rem; line-height: 1.4;">')
    cleaned = cleaned.replace(/<h1>/g, '<h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<h2>/g, '<h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<h3>/g, '<h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<strong>/g, '<strong style="font-weight: bold;">')
    return cleaned
  }

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like this project');
      return;
    }
    await dispatch(likeProject(projectId));
  };

  const handleComment = async () => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }
    await dispatch(commentOnProject({ projectId, content: newComment }));
    setNewComment('');
  };

  const toggleSection = (section: 'interests' | 'tags') => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleBackNavigation = () => {
    if (fromCommunity && communityId) {
      router.push(`/dashboard/user/communities/dashboard/${communityId}`);
    } else {
      router.push('/dashboard/user/research');
    }
  };

  if (isLoading && !initialLoadComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !currentProject || !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The project you're looking for doesn't exist or may have been removed."}
          </p>
          <button
            onClick={handleBackNavigation}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            {fromCommunity ? `Back to ${communityName || 'Community'}` : 'Back to Projects'}
          </button>
        </div>
      </div>
    );
  }

  // Project data from Redux
  const { hasLiked, comments } = currentProject;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <button
              onClick={handleBackNavigation}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {fromCommunity && communityName
                  ? `Back to ${communityName}`
                  : fromCommunity
                    ? 'Back to Community'
                    : 'Back to Research Projects'}
              </span>
            </button>

            <div className="flex items-center gap-2">
              {/* ✅ NEW: Collaboration Requests Badge (Only for Project Creator) */}
              {isProjectCreator && pendingRequestsCount > 0 && (
                <button
                  onClick={() => setShowCollaborationRequestsModal(true)}
                  className="relative flex items-center gap-2 px-3 py-1.5 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline text-xs">Collaboration Requests</span>
                  <span className="absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {pendingRequestsCount}
                  </span>
                </button>
              )}

              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          {project.cover_image_url && (
            <div className="relative h-64 md:h-80 overflow-hidden group">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewImage({ url: project.cover_image_url, title: project.title })
                }}
              />
              <div
                className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  setPreviewImage({ url: project.cover_image_url, title: project.title })
                }}
              >
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 transform group-hover:scale-110">
                  <ZoomIn className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          )}

          <div className="p-4 md:p-6">
            {/* Author Mini-Card */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <img
                src={project.author.profile_picture_url}
                alt={project.author.first_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {project.author.first_name} {project.author.last_name}
                </h3>
                <p className="text-xs text-gray-500 truncate">{project.author.profile.institution_name}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BarChart3 className="w-3 h-3" />
                <span>{project.author.profile.total_projects_count}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${project.status === 'Published'
                ? 'bg-green-100 text-green-800'
                : project.status === 'Draft'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
                }`}>
                {project.status}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {project.research_type}
              </span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                {project.field_of_study}
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                {project.visibility}
              </span>

              {project.collaboration_status !== 'Solo' && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${project.collaboration_status === 'Seeking Collaborators'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-green-100 text-green-700'
                  }`}>
                  <Users className="w-3 h-3" />
                  {project.collaboration_status}
                </span>
              )}
            </div>

            {/* Title and Abstract */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
              {project.title}
            </h1>

            <div
              className="rich-text-content text-gray-700 text-sm mb-4"
              dangerouslySetInnerHTML={{ __html: cleanHtml(project.abstract) }}
              style={{ lineHeight: "1.5" }}
            />

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{project.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{project.download_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className={`w-3 h-3 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{project.like_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{project.comment_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{formatDate(project.publication_date)}</span>
              </div>
            </div>

            {/* Collaboration Info */}
            {project.collaboration_info && (
              <div className="mb-4">
                {isUserContributor && !isProjectCreator && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 border border-green-200 rounded-lg text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">You're a collaborator on this project</span>
                  </div>
                )}

                {userCollaborationStatus?.status === 'Pending' && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-100 border border-yellow-200 rounded-lg text-sm">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-yellow-700 font-medium">Collaboration request pending</span>
                  </div>
                )}

                {project.collaborator_count > 0 && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs ml-2">
                    <Users className="w-3 h-3 text-blue-600" />
                    <span className="text-blue-700 font-medium">
                      {project.collaborator_count} {project.collaborator_count === 1 ? 'collaborator' : 'collaborators'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* ✅ ENHANCED: Action Buttons with Add Contribution for Contributors */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownload(project.project_file_url, 'main-project-file.pdf')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              <button
                onClick={handleLike}
                disabled={isSubmitting}
                className={`p-2 border rounded-lg transition-colors ${hasLiked
                  ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>

              {/* ✅ ENHANCED: Add Contribution Button for Contributors */}
              {isUserContributor && !isProjectCreator && (
                <button
                  onClick={() => setShowAddContributionModal(true)}
                  className="px-4 py-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all text-sm font-medium flex items-center gap-2"
                  title="Add your contribution to this project"
                >
                  <Plus className="w-4 h-4" />
                  Add Contribution
                </button>
              )}

              {/* ✅ ENHANCED: Collaboration Request Button with new conditions */}
              {collaborationButtonState.show && (
                <>
                  {collaborationButtonState.disabled ? (
                    // PENDING STATE: User has already requested - show disabled button
                    <button
                      disabled
                      className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${collaborationButtonState.className}`}
                      title={`Your collaboration request is ${userCollaborationStatus?.status?.toLowerCase()} - Requested on ${userCollaborationStatus?.requested_at ? new Date(userCollaborationStatus.requested_at).toLocaleDateString() : 'N/A'}`}
                    >
                      {collaborationButtonState.icon &&
                        <collaborationButtonState.icon className="w-4 h-4 animate-pulse" />
                      }
                      <span>{collaborationButtonState.text}</span>
                      <span className="ml-1 text-xs opacity-75">
                        ({new Date(userCollaborationStatus?.requested_at).toLocaleDateString()})
                      </span>
                    </button>
                  ) : (
                    // ACTIVE STATE: User can request to contribute
                    <button
                      onClick={() => setShowCollaborationModal(true)}
                      className={`px-4 py-2 rounded-lg transition-all text-sm font-medium flex items-center gap-2 ${collaborationButtonState.className}`}
                      title="Click to request to contribute to this project"
                    >
                      {collaborationButtonState.icon &&
                        <collaborationButtonState.icon className="w-4 h-4" />
                      }
                      <span>{collaborationButtonState.text}</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-16 self-start">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Details
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-gray-500 block mb-1">DOI:</span>
                  <a href={`https://doi.org/${project.doi}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    <span className="truncate">{project.doi}</span>
                  </a>
                </div>

                <div>
                  <span className="font-medium text-gray-500 block mb-1">Status:</span>
                  <p className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block ${project.collaboration_status === 'Seeking Collaborators'
                    ? 'bg-orange-100 text-orange-800'
                    : project.collaboration_status === 'Collaborative'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                    }`}>
                    {project.collaboration_status}
                  </p>
                </div>

                {project.collaborator_count > 0 && (
                  <div>
                    <span className="font-medium text-gray-500 block mb-1">Collaborators:</span>
                    <p className="flex items-center gap-1 text-gray-700">
                      <Users className="w-3 h-3" />
                      {project.collaborator_count}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-medium text-gray-500 block mb-1">Created:</span>
                  <p className="flex items-center gap-1 text-gray-700">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.created_at)}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-500 block mb-1">Updated:</span>
                  <p className="flex items-center gap-1 text-gray-700">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tags Card */}
            {project.tags && project.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <button
                  onClick={() => toggleSection('tags')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    Tags
                  </span>
                  {collapsedSections.tags ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                {!collapsedSections.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 5).map((tag, index) => (
                      <span
                        key={tag.id || index}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        #{tag.name}
                      </span>
                    ))}
                    {project.tags.length > 5 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                        +{project.tags.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {[
                    { id: 'overview', label: 'Overview', icon: FileText },
                    { id: 'files', label: 'Files', icon: Download },
                    { id: 'collaborators', label: 'Collaborators', icon: Users, count: collaborators.length },
                    { id: 'contributions', label: 'Contributions', icon: BookOpen, count: contributions.length },
                    { id: 'author', label: 'Author', icon: User },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="ml-1 px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold">
                            {tab.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="prose max-w-none">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Project Description</h3>
                    <div
                      className="rich-text-content text-gray-700 text-sm"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(project.full_description) }}
                      style={{ lineHeight: "1.5" }}
                    />
                  </div>
                )}

                {/* Files Tab */}
                {activeTab === 'files' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Project Files</h3>

                    <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all hover:scale-[1.01]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Main Research Document</h4>
                            <p className="text-xs text-gray-500">PDF Document • {project.project_file_url ? 'Available' : 'Not available'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(project.project_file_url, 'research-document.pdf')}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                          disabled={!project.project_file_url}
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>

                    {project.files && project.files.length > 0 && (
                      <>
                        <h4 className="font-semibold text-gray-900 mt-4 mb-2 text-sm">Additional Files</h4>
                        <div className="space-y-2">
                          {project.files.map((file) => (
                            <div
                              key={file.id}
                              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all hover:scale-[1.01]"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <h5 className="font-medium text-gray-900 text-sm">{file.file_name}</h5>
                                    <p className="text-xs text-gray-500">
                                      {file.file_type} • {Math.round(parseInt(file.file_size) / 1024)} KB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDownload(file.file_url, file.file_name)}
                                  className="px-2 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Get
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Collaborators Tab - Instant display with pre-fetched data */}
                {activeTab === 'collaborators' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Project Collaborators</h3>

                    {collaborators.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No collaborators yet</p>
                        <p className="text-xs text-gray-500 mt-1">This is a solo project</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {collaborators.map((collaborator) => (
                          <div
                            key={collaborator.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={collaborator.profile_picture_url}
                                alt={collaborator.first_name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-gray-900 text-sm">
                                    {collaborator.first_name} {collaborator.last_name}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${collaborator.role === 'Creator'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-green-100 text-green-700'
                                    }`}>
                                    {collaborator.role}
                                  </span>
                                </div>
                                {collaborator.institution && (
                                  <p className="text-xs text-gray-600 flex items-center gap-1 mb-1">
                                    <Building className="w-3 h-3" />
                                    {collaborator.institution}
                                  </p>
                                )}
                                <p className="text-xs text-gray-500 flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {collaborator.email}
                                </p>
                                {collaborator.approved_at && (
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                    <CheckCircle className="w-3 h-3" />
                                    Joined {formatDate(collaborator.approved_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Contributions Tab - Instant display with pre-fetched data */}
                {activeTab === 'contributions' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold text-gray-900">Project Contributions</h3>
                      {/* ✅ ENHANCED: Show "Add Contribution" button only if user is a contributor */}
                      {isUserContributor && (
                        <button
                          onClick={() => setShowAddContributionModal(true)}
                          className="px-3 py-1.5 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-xs font-medium flex items-center gap-2"
                          title="Add your contribution to this project"
                        >
                          <Plus className="w-3 h-3" />
                          Add Contribution
                        </button>
                      )}
                    </div>

                    {contributions.length === 0 ? (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No contributions yet</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {isUserContributor
                            ? 'Be the first to contribute to this project'
                            : 'Contributions from collaborators will appear here'}
                        </p>
                        {isUserContributor && (
                          <button
                            onClick={() => setShowAddContributionModal(true)}
                            className="mt-3 px-4 py-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" />
                            Add First Contribution
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {contributions.map((contribution) => (
                          <ContributionCard
                            key={contribution.id}
                            contribution={contribution}
                            isProjectOwner={isProjectCreator}
                            onApproveContribution={handleApproveContribution}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Author Tab */}
                {activeTab === 'author' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={project.author.profile_picture_url}
                        alt={project.author.first_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {project.author.first_name} {project.author.last_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 leading-normal">{project.author.bio}</p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Building className="w-3 h-3 text-gray-400" />
                              <span>{project.author.profile.institution_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{project.author.city}, {project.author.country}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-gray-400" />
                              <span>{project.author.account_type}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <BarChart3 className="w-3 h-3 text-gray-400" />
                              <span>{project.author.profile.total_projects_count} projects</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>Joined {formatDate(project.author.date_joined)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Connect with Researcher</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.author.profile.google_scholar_url && (
                          <a
                            href={project.author.profile.google_scholar_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Google Scholar
                          </a>
                        )}
                        {project.author.profile.linkedin_url && (
                          <a
                            href={project.author.profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                        {project.author.profile.website_url && (
                          <a
                            href={project.author.profile.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Personal Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {!showComments && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <button
                  onClick={() => setShowComments(true)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    Comments ({project.comment_count})
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {showComments && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    Comments ({project.comment_count})
                  </h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleComment}
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-start gap-2">
                          <img
                            src={comment.author.profile_picture_url}
                            alt={comment.author.first_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold text-gray-900">
                                {comment.author.first_name} {comment.author.last_name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-normal">{comment.comment_text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 text-sm">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddContributionModal && (
        <AddContributionModal
          project={project}
          onClose={() => setShowAddContributionModal(false)}
        />
      )}

      {showCollaborationModal && (
        <RequestCollaborationModal
          project={project}
          onClose={() => setShowCollaborationModal(false)}
        />
      )}

      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}

      {showCollaborationRequestsModal && (
        <CollaborationRequestsModal
          project={project}
          onClose={() => setShowCollaborationRequestsModal(false)}
        />
      )}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </div>
  );
}