// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchProjectById, likeProject, commentOnProject } from "@/lib/features/auth/projectSlice"
import {
  ArrowLeft, Eye, ThumbsUp, MessageSquare, Download, Share2, Calendar,
  User, MapPin, FileText, Send, Loader2, BookOpen, ExternalLink,
  Globe, Lock, Users, CheckCircle, ZoomIn, X
} from "lucide-react"
import Link from "next/link"
import SharedNavigation from "@/components/layout/Navigation"
import { RootState } from "@/lib/store"

function SkeletonLoader({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200/60 rounded-xl ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
          animation: "shimmer 1.6s infinite",
          backgroundSize: "200% 100%",
        }}
      />
      <style>{`@keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }`}</style>
    </div>
  )
}

const cleanHtml = (html: any) => {
  if (!html) return ""
  let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*ql-ui[^"]*"[^>]*>.*?<\/span>/g, "")
  cleaned = cleaned.replace(/ data-list="[^"]*"/g, "")
  cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom:0.85rem;line-height:1.75;">')
  cleaned = cleaned.replace(/<ul>/g, '<ul style="margin-bottom:0.85rem;padding-left:1.5rem;list-style-type:disc;">')
  cleaned = cleaned.replace(/<ol>/g, '<ol style="margin-bottom:0.85rem;padding-left:1.5rem;list-style-type:decimal;">')
  cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom:0.35rem;line-height:1.6;">')
  cleaned = cleaned.replace(/<h1>/g, '<h1 style="font-size:1.5rem;font-weight:700;margin-bottom:0.75rem;color:#111827;">')
  cleaned = cleaned.replace(/<h2>/g, '<h2 style="font-size:1.25rem;font-weight:700;margin-bottom:0.75rem;color:#111827;">')
  cleaned = cleaned.replace(/<h3>/g, '<h3 style="font-size:1.125rem;font-weight:700;margin-bottom:0.75rem;color:#111827;">')
  cleaned = cleaned.replace(/<strong>/g, '<strong style="font-weight:700;">')
  return cleaned
}

function ImagePreviewModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-5 h-5" />
      </button>
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
        style={{ animation: "zoomIn 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      />
      <style>{`@keyframes zoomIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

export default function ResearchProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { currentProject, isLoading, isSubmitting } = useSelector((state: RootState) => state.projects)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [commentText, setCommentText] = useState("")
  const [showComments, setShowComments] = useState(false)
  const [showImagePreview, setShowImagePreview] = useState(false)

  useEffect(() => {
    if (params.id) dispatch(fetchProjectById(params.id))
  }, [dispatch, params.id])

  const handleLike = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (currentProject?.project?.id) await dispatch(likeProject(currentProject.project.id))
  }

  const handleComment = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (commentText.trim() && currentProject?.project?.id) {
      await dispatch(commentOnProject({ projectId: currentProject.project.id, content: commentText.trim() }))
      setCommentText("")
    }
  }

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (isLoading && !currentProject) {
    return (
      <div className="min-h-screen bg-[#F4F6FA]">
        <SharedNavigation />
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-6">
          <SkeletonLoader className="h-10 w-36" />
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 space-y-6 p-8">
            <SkeletonLoader className="h-96 rounded-xl" />
            <SkeletonLoader className="h-9 w-3/4" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-5/6" />
            <SkeletonLoader className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentProject?.project) {
    return (
      <div className="min-h-screen bg-[#F4F6FA]">
        <SharedNavigation />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h3>
            <p className="text-gray-500 text-sm mb-5">This project may have been removed or made private.</p>
            <Link href="/research-projects" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0158B7] text-white rounded-lg font-medium text-sm hover:bg-[#0149a0] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const project = currentProject.project
  const hasLiked = currentProject.hasLiked || false
  const comments = currentProject.comments || []
  const VisibilityIcon = project.visibility === "Public" ? Globe : project.visibility === "Private" ? Lock : Users

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <SharedNavigation />

      {showImagePreview && project.cover_image_url && (
        <ImagePreviewModal src={project.cover_image_url} alt={project.title} onClose={() => setShowImagePreview(false)} />
      )}

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0158B7] mb-6 transition-colors text-sm font-medium group"
        >
          <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-[#0158B7]/30 group-hover:bg-[#0158B7]/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </span>
          Back to Projects
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Hero Image — tall, immersive */}
          <div className="relative h-[420px] bg-gradient-to-br from-[#0158B7] to-[#1e3a8a] group">
            {project.cover_image_url ? (
              <>
                <img
                  src={project.cover_image_url}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                {/* Zoom Button */}
                <button
                  onClick={() => setShowImagePreview(true)}
                  className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                  style={{ transition: "all 0.2s ease" }}
                >
                  <ZoomIn className="w-4 h-4" />
                  Preview Image
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="w-28 h-28 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Top-right badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              {project.research_type && (
                <span className="px-3.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-[#0158B7] shadow-sm">
                  {project.research_type}
                </span>
              )}
              <div className="px-3.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full flex items-center gap-1.5 shadow-sm">
                <VisibilityIcon className="w-3.5 h-3.5 text-gray-600" />
                <span className="text-xs font-bold text-gray-800">{project.visibility}</span>
              </div>
            </div>

            {/* Bottom overlays */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
              <div>
                {project.is_featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full text-xs font-bold mb-3 shadow-lg">
                    <CheckCircle className="w-3.5 h-3.5" /> Featured
                  </span>
                )}
                <h1 className="text-white text-2xl md:text-3xl font-bold max-w-2xl leading-snug" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                  {project.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-1 px-6 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            {[
              { icon: Eye, label: "views", value: project.view_count || 0 },
              { icon: ThumbsUp, label: "likes", value: project.like_count || 0 },
              { icon: MessageSquare, label: "comments", value: project.comment_count || 0 },
              { icon: Download, label: "downloads", value: project.download_count || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white transition-colors cursor-default flex-shrink-0">
                <Icon className="w-4 h-4 text-[#0158B7]" />
                <span className="font-bold text-gray-900 text-sm">{value.toLocaleString()}</span>
                <span className="text-gray-500 text-sm">{label}</span>
              </div>
            ))}
          </div>

          <div className="p-8">
            {/* Author Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#0158B7]/5 to-blue-50/50 rounded-xl border border-[#0158B7]/10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0158B7] to-[#1e40af] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {project.author?.first_name?.[0]}{project.author?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">
                    {project.author?.first_name} {project.author?.last_name}
                  </p>
                  {project.author?.profile?.institution_name && (
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0158B7]" />
                      {project.author.profile.institution_name}
                    </p>
                  )}
                  {project.author?.profile?.current_position && (
                    <p className="text-xs text-gray-500 mt-0.5">{project.author.profile.current_position}</p>
                  )}
                </div>
              </div>
              <div className="text-sm text-gray-600 sm:text-right flex flex-col gap-1">
                <div className="flex items-center gap-1.5 sm:justify-end">
                  <Calendar className="w-4 h-4 text-[#0158B7]" />
                  <span>Published {formatDate(project.publication_date || project.created_at)}</span>
                </div>
                {project.field_of_study && (
                  <span className="inline-block px-3 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-semibold sm:self-end">
                    {project.field_of_study}
                  </span>
                )}
              </div>
            </div>

            {/* Abstract */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                <h2 className="text-lg font-bold text-gray-900">Abstract</h2>
              </div>
              <div
                className="text-gray-700 leading-relaxed bg-gray-50/60 rounded-xl p-5 border border-gray-100"
                dangerouslySetInnerHTML={{ __html: cleanHtml(project.abstract) }}
                style={{ lineHeight: "1.75" }}
              />
            </section>

            {/* Full Description */}
            {project.full_description && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                  <h2 className="text-lg font-bold text-gray-900">Full Description</h2>
                </div>
                <div
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: cleanHtml(project.full_description) }}
                  style={{ lineHeight: "1.75" }}
                />
              </section>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                  <h2 className="text-lg font-bold text-gray-900">Tags</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag: any, i: number) => (
                    <span key={i} className="px-3.5 py-1.5 bg-[#0158B7]/8 text-[#0158B7] border border-[#0158B7]/15 rounded-full text-sm font-medium hover:bg-[#0158B7]/15 transition-colors cursor-pointer">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Attachments */}
            {project.files && project.files.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                  <h2 className="text-lg font-bold text-gray-900">Attachments</h2>
                </div>
                <div className="space-y-2">
                  {project.files.map((file: any) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#0158B7]/30 hover:bg-blue-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0158B7]/10 rounded-lg flex items-center justify-center group-hover:bg-[#0158B7]/15 transition-colors">
                          <FileText className="w-5 h-5 text-[#0158B7]" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{file.file_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{file.file_type} · {file.file_size}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#0158B7] transition-colors" />
                    </a>
                  ))}
                </div>
              </section>
            )}

            {/* DOI */}
            {project.doi && (
              <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Digital Object Identifier (DOI)</p>
                <p className="text-blue-800 font-mono text-sm font-semibold">{project.doi}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100">
              {!isAuthenticated ? (
                <div className="bg-gradient-to-r from-[#0158B7]/5 to-blue-50 border border-[#0158B7]/15 rounded-2xl p-7 text-center">
                  <div className="w-14 h-14 bg-[#0158B7]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookOpen className="w-7 h-7 text-[#0158B7]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5">Sign in to interact</h3>
                  <p className="text-gray-500 mb-5 text-sm max-w-sm mx-auto">Like, comment, and download research papers by joining our community.</p>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                    Sign In to Continue
                  </Link>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleLike}
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 ${hasLiked ? "bg-[#0158B7] text-white shadow-md shadow-blue-500/20" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${hasLiked ? "fill-white" : ""}`} />
                    {hasLiked ? "Liked" : "Like"}
                  </button>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${showComments ? "bg-gray-200 text-gray-900" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Comment {comments.length > 0 && `(${comments.length})`}
                  </button>
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Comments Section */}
            {isAuthenticated && showComments && (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Comments ({comments.length})</h2>

                <div className="mb-6 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts on this research..."
                    className="w-full px-4 pt-4 pb-2 bg-transparent focus:outline-none resize-none text-sm text-gray-700 placeholder-gray-400"
                    rows={3}
                  />
                  <div className="flex justify-end px-3 pb-3">
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || isSubmitting}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-lg text-sm font-semibold hover:shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      Post
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 text-sm">
                      <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-30" />
                      No comments yet. Be the first!
                    </div>
                  ) : (
                    comments.map((comment: any) => (
                      <div key={comment.id} className="flex gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-9 h-9 bg-gradient-to-br from-[#0158B7] to-[#1e40af] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                          {comment.author?.first_name?.[0]}{comment.author?.last_name?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{comment.author?.first_name} {comment.author?.last_name}</p>
                            <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                          </div>
                          <p className="text-gray-700 text-sm leading-relaxed">{comment.comment_text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}