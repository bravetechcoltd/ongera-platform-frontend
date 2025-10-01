// @ts-nocheck
"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { 
  updateProjectStatus, 
  fetchProjectForUpload 
} from '@/lib/features/auth/projectSlice'
import { 
  fetchSuggestedCommunities, 
  createCommunityPosts 
} from '@/lib/features/auth/communitiesSlice'
import {
  FileText, Eye, Send, Users, MessageSquare, Check, ArrowRight,
  BookOpen, Tag, Globe, Calendar, Paperclip, X, Loader2,
  CheckCircle, AlertCircle, Sparkles, Share2, Edit2, Home, ZoomIn
} from 'lucide-react'

// ─── Shared HTML cleaner — preserves rich text structure ───────────────────
const cleanHtml = (html: any) => {
  if (!html) return ""
  let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*ql-ui[^"]*"[^>]*>.*?<\/span>/g, "")
  cleaned = cleaned.replace(/ data-list="[^"]*"/g, "")
  cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom:0.75rem;line-height:1.7;color:#374151;">')
  cleaned = cleaned.replace(/<ul>/g, '<ul style="margin-bottom:0.75rem;padding-left:1.5rem;list-style-type:disc;">')
  cleaned = cleaned.replace(/<ol>/g, '<ol style="margin-bottom:0.75rem;padding-left:1.5rem;list-style-type:decimal;">')
  cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom:0.35rem;line-height:1.6;color:#374151;">')
  cleaned = cleaned.replace(/<h1>/g, '<h1 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:#111827;">')
  cleaned = cleaned.replace(/<h2>/g, '<h2 style="font-size:1.1rem;font-weight:700;margin-bottom:0.65rem;color:#111827;">')
  cleaned = cleaned.replace(/<h3>/g, '<h3 style="font-size:1rem;font-weight:700;margin-bottom:0.5rem;color:#111827;">')
  cleaned = cleaned.replace(/<strong>/g, '<strong style="font-weight:700;color:#111827;">')
  cleaned = cleaned.replace(/<a /g, '<a style="color:#0158B7;text-decoration:underline;" ')
  return cleaned
}

// ─── Plain-text extractor (for post content pre-fill only) ─────────────────
const htmlToPlainText = (html: any) => {
  if (!html) return ""
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim()
}

// ─── Reusable RichTextPreview component ────────────────────────────────────
function RichTextPreview({ html, className = "", maxLines }: { html: any; className?: string; maxLines?: number }) {
  const style: React.CSSProperties = maxLines
    ? {
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }
    : {}

  return (
    <div
      className={`rich-text-preview ${className}`}
      style={{ lineHeight: '1.7', ...style }}
      dangerouslySetInnerHTML={{ __html: cleanHtml(html) }}
    />
  )
}

// ─── Full Image Preview Modal ───────────────────────────────────────────────
function ImageModal({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <img
        src={src}
        alt="Preview"
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
        style={{ animation: 'zoomIn .2s ease' }}
        onClick={(e) => e.stopPropagation()}
      />
      <style>{`@keyframes zoomIn{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

// ─── Project Preview Modal ──────────────────────────────────────────────────
function PreviewModal({ project, onClose, onEdit }: { project: any; onClose: () => void; onEdit: () => void }) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto pt-20">
        <div className="bg-white rounded-2xl w-full max-w-4xl my-8 shadow-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white p-5 rounded-t-2xl flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg"><Eye className="w-5 h-5" /></div>
                <div>
                  <h2 className="text-xl font-bold">Review Your Project</h2>
                  <p className="text-sm text-white/80">Check everything before publishing</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">

            {/* Cover Image */}
            {project.cover_image_url && (
              <div className="relative rounded-xl overflow-hidden group cursor-pointer" onClick={() => setPreviewImage(project.cover_image_url)}>
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur-sm rounded-full p-3">
                    <ZoomIn className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Title & Badges */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{project.title}</h1>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{project.research_type}</span>
                {project.field_of_study && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{project.field_of_study}</span>
                )}
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{project.visibility}</span>
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">{project.collaboration_status}</span>
              </div>
            </div>

            {/* Abstract — rendered as rich text */}
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0158B7]" />
                Abstract
              </h4>
              <RichTextPreview html={project.abstract} className="text-sm" />
            </div>

            {/* Full Description — rendered as rich text */}
            {project.full_description && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#0158B7]" />
                  Full Description
                </h4>
                <RichTextPreview html={project.full_description} className="text-sm" />
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#0158B7]" />
                  Research Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: any, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-gradient-to-r from-[#0158B7]/10 to-[#5E96D2]/10 text-[#0158B7] rounded-lg text-xs font-medium border border-[#0158B7]/20">
                      {tag.name || tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.publication_date && (
                <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Publication Date</p>
                    <p className="text-sm text-gray-900 mt-0.5 font-medium">{new Date(project.publication_date).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
              {project.doi && (
                <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">DOI</p>
                    <p className="text-sm text-gray-900 mt-0.5 font-mono">{project.doi}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Files */}
            <div className="bg-gradient-to-br from-[#0158B7]/5 to-[#5E96D2]/5 rounded-xl p-4 border border-[#0158B7]/20">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-[#0158B7]" />
                Attached Files
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900 flex-1">Main Project File</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">PDF</span>
                </div>
                {project.files && project.files.length > 0 && (
                  <p className="text-xs text-gray-500 px-3">+ {project.files.length} additional file(s)</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 p-4 flex items-center justify-between gap-3 rounded-b-2xl flex-shrink-0">
            <button onClick={onClose} className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors">
              Close
            </button>
            <div className="flex gap-2">
              <button onClick={onEdit} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white text-sm font-medium flex items-center gap-2 transition-colors">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button onClick={onClose} className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg text-sm font-semibold transition-all">
                Continue to Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {previewImage && <ImageModal src={previewImage} onClose={() => setPreviewImage(null)} />}
    </>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────
export default function ProjectPostUploadFlow() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const projectId = params?.id as string
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const { currentProject, isLoading: projectLoading } = useAppSelector(state => state.projects)
  const { communities, isLoading: communitiesLoading, isSubmitting: postsSubmitting } = useAppSelector(state => state.communities)

  const [step, setStep] = useState(1)
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([])
  const [postContent, setPostContent] = useState('')
  const [error, setError] = useState('')
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectForUpload(projectId))
        .unwrap()
        .then((projectData) => {
          const project = projectData.project || projectData
          // Use plain text only for the textarea pre-fill
          const abstractText = htmlToPlainText(project.abstract).substring(0, 150)
          setPostContent(`🎉 Excited to share my latest research!\n\nCheck out "${project.title}"\n\n${abstractText}...`)
          setIsLoading(false)
        })
        .catch(() => { setError('Failed to load project'); setIsLoading(false) })
    }
  }, [dispatch, projectId])

  useEffect(() => {
    if (step === 4 && projectId) dispatch(fetchSuggestedCommunities(projectId))
  }, [step, projectId, dispatch])

  const handlePublish = async () => {
    if (!projectId) return
    setIsPublishing(true)
    try {
      await dispatch(updateProjectStatus({ id: projectId, status: 'Published' })).unwrap()
      setTimeout(() => { setStep(4); setIsPublishing(false) }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to publish project')
      setIsPublishing(false)
    }
  }

  const toggleCommunity = (communityId: string) => {
    setSelectedCommunityIds(prev =>
      prev.includes(communityId) ? prev.filter(id => id !== communityId) : [...prev, communityId]
    )
  }

  const handleCreatePosts = async () => {
    if (!projectId) return
    setIsPosting(true)
    try {
      await dispatch(createCommunityPosts({
        community_ids: selectedCommunityIds,
        content: postContent,
        linked_project_id: projectId,
        post_type: 'LinkedProject'
      })).unwrap()
      setStep(6); setIsPosting(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create posts'); setIsPosting(false)
    }
  }

  if (isLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!currentProject || !currentProject.project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Project not found</p>
          <button onClick={() => router.push('/dashboard/user')} className="text-blue-600 hover:underline">
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const project = currentProject.project

  // ── Step 1: Draft Saved ──────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Draft Saved Successfully!</h2>
            <p className="text-sm text-gray-500">Your research project has been saved as a draft</p>
          </div>

          {/* Project card with rich text abstract preview */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
            <div className="flex items-start gap-3">
              {project.cover_image_url ? (
                <img src={project.cover_image_url} alt={project.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-1.5 truncate">{project.title}</h3>
                {/* ✅ Rich text rendered — not stripped */}
                <RichTextPreview
                  html={project.abstract}
                  className="text-xs text-gray-600"
                  maxLines={3}
                />
                <div className="flex items-center gap-2 mt-2.5">
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-semibold">Draft</span>
                  <span className="text-xs text-gray-400">{project.research_type}</span>
                  {project.field_of_study && (
                    <span className="text-xs text-gray-400">· {project.field_of_study}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 mb-6">
            {[
              { icon: Check, color: 'emerald', label: 'Files uploaded successfully' },
              { icon: Check, color: 'emerald', label: 'Metadata saved' },
              { icon: Eye, color: 'blue', label: 'Ready for review' },
            ].map(({ icon: Icon, color, label }) => (
              <div key={label} className="flex items-center gap-3 text-sm text-gray-600">
                <div className={`w-5 h-5 bg-${color}-100 rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3 h-3 text-${color}-600`} />
                </div>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/20 transition-all font-semibold text-sm flex items-center justify-center gap-2"
          >
            Review Project <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // ── Step 2: Preview ──────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 p-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Eye className="w-5 h-5" /> Preview Your Project
                  </h2>
                  <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Step 2 of 5</span>
                </div>
                <p className="text-blue-100 text-sm">Review your project before publishing</p>
              </div>

              <div className="p-6">
                {/* Cover image */}
                {project.cover_image_url && (
                  <div className="mb-5 rounded-xl overflow-hidden h-52">
                    <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Title + badges */}
                <div className="mb-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 leading-snug">{project.title}</h3>
                    <button
                      onClick={() => setShowPreviewModal(true)}
                      className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-[#0158B7]/10 border border-[#0158B7]/25 text-[#0158B7] rounded-lg hover:bg-[#0158B7]/15 text-xs font-semibold transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Full Preview
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{project.research_type}</span>
                    {project.field_of_study && (
                      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">{project.field_of_study}</span>
                    )}
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">{project.visibility}</span>
                  </div>
                </div>

                {/* ✅ Rich text abstract — properly rendered */}
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0158B7]" /> Abstract
                  </p>
                  <RichTextPreview html={project.abstract} className="text-sm" />
                </div>

                {/* Full description if present */}
                {project.full_description && (
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-[#0158B7]" /> Description
                    </p>
                    <RichTextPreview html={project.full_description} className="text-sm" />
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => router.push(`/dashboard/user/research/upload?edit=${projectId}`)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" /> Edit Project
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Publish Project</>
                    )}
                  </button>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showPreviewModal && (
          <PreviewModal
            project={project}
            onClose={() => setShowPreviewModal(false)}
            onEdit={() => { setShowPreviewModal(false); router.push(`/dashboard/user/research/upload?edit=${projectId}`) }}
          />
        )}
      </>
    )
  }

  // ── Publishing spinner ───────────────────────────────────────────────────
  if (isPublishing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full animate-ping opacity-20" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Publishing Your Project...</h2>
          <p className="text-sm text-gray-500">This will only take a moment</p>
        </div>
      </div>
    )
  }

  // ── Step 4: Community Suggestions ───────────────────────────────────────
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5" /> Share with Communities</h2>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Step 4 of 5</span>
              </div>
              <p className="text-purple-100 text-sm">Select communities to share your research</p>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 text-sm mb-0.5">Project Published Successfully!</h3>
                    <p className="text-xs text-emerald-700">"{project.title}" is now live and visible to the community</p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Recommended Communities
                  <span className="ml-2 text-xs font-normal text-gray-400">Based on your research tags and field</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {communities.map((community: any) => {
                    const isSelected = selectedCommunityIds.includes(community.id)
                    return (
                      <button
                        key={community.id}
                        onClick={() => toggleCommunity(community.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
                      >
                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300 bg-white'}`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="pr-8">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{community.name}</h4>
                          <p className="text-xs text-gray-500 mb-2 line-clamp-2">{community.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{community.member_count} members</span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">{community.category}</span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedCommunityIds.length > 0 && (
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    {selectedCommunityIds.length} {selectedCommunityIds.length === 1 ? 'community' : 'communities'} selected
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t flex items-center justify-between gap-3">
              <button onClick={() => setStep(6)} className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">Skip for now</button>
              <button
                onClick={() => selectedCommunityIds.length > 0 ? setStep(5) : null}
                disabled={selectedCommunityIds.length === 0}
                className={`px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${selectedCommunityIds.length > 0 ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 5: Create Post ──────────────────────────────────────────────────
  if (step === 5) {
    const selectedCommunities = communities.filter((c: any) => selectedCommunityIds.includes(c.id))
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-cyan-50/20 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5" /> Create Announcement Post</h2>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">Step 5 of 5</span>
              </div>
              <p className="text-blue-100 text-sm">Share your project with the communities</p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Posting to {selectedCommunities.length} {selectedCommunities.length === 1 ? 'community' : 'communities'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCommunities.map((community: any) => (
                    <span key={community.id} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                      {community.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Your Announcement</label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Write something about your research..."
                />
                <p className="text-xs text-gray-400 mt-1.5">{postContent.length} characters</p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Linked Project</p>
                <div className="flex items-center gap-3">
                  {project.cover_image_url ? (
                    <img src={project.cover_image_url} alt={project.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{project.title}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{project.research_type}{project.field_of_study ? ` · ${project.field_of_study}` : ''}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1.5">Tips for a great post</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Highlight key findings or contributions</li>
                      <li>• Mention potential applications</li>
                      <li>• Invite feedback and collaboration</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t flex items-center justify-between gap-3">
              <button onClick={() => setStep(6)} className="text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">Skip posting</button>
              <button
                onClick={handleCreatePosts}
                disabled={isPosting || !postContent.trim()}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {isPosting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
                ) : (
                  <><Share2 className="w-4 h-4" /> Post to Communities</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Step 6: Completion ───────────────────────────────────────────────────
  if (step === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">All Done! 🎉</h1>
          <p className="text-gray-500 mb-6 text-sm">Your research project has been published and shared with the community</p>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 mb-8 border border-emerald-100 text-left">
            <h3 className="font-semibold text-emerald-900 text-sm mb-3">What's Next?</h3>
            <div className="space-y-2.5">
              {[
                'Your project is now visible to all researchers',
                'Community members can comment and collaborate',
                "You'll receive notifications on engagement",
              ].map((text) => (
                <div key={text} className="flex items-center gap-3 text-sm text-emerald-800">
                  <div className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-emerald-700" />
                  </div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(`/dashboard/user/research/${projectId}`)}
              className="flex-1 py-3 border-2 border-emerald-600 text-emerald-600 rounded-xl hover:bg-emerald-50 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Eye className="w-4 h-4" /> View Project
            </button>
            <button
              onClick={() => router.push('/dashboard/user')}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Home className="w-4 h-4" /> Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}