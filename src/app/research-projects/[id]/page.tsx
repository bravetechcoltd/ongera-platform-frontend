// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchProjectById, likeProject, commentOnProject } from "@/lib/features/auth/projectSlice"
import {
  ArrowLeft, Eye, ThumbsUp, MessageSquare, Download, Share2, Calendar,
  User, MapPin, FileText, Send, Loader2, BookOpen, ExternalLink,
  Globe, Lock, Users, CheckCircle
} from "lucide-react"
import Link from "next/link"
import SharedNavigation from "@/components/layout/Navigation"
import { RootState } from "@/lib/store"

// Skeleton Loaders
function SkeletonLoader({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200/50 rounded ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

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

export default function ResearchProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { currentProject, isLoading, isSubmitting } = useSelector((state:RootState) => state.projects)
  const { isAuthenticated, user } = useSelector((state:RootState) => state.auth)

  const [commentText, setCommentText] = useState("")
  const [showComments, setShowComments] = useState(false)

  useEffect(() => {
    if (params.id) {
      dispatch(fetchProjectById(params.id))
    }
  }, [dispatch, params.id])

  const handleLike = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (currentProject?.project?.id) {
      await dispatch(likeProject(currentProject.project.id))
    }
  }

  const handleComment = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (commentText.trim() && currentProject?.project?.id) {
      await dispatch(commentOnProject({
        projectId: currentProject.project.id,
        content: commentText.trim()
      }))
      setCommentText("")
    }
  }

  const formatDate = (dateString:any) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (isLoading && !currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
        <SharedNavigation />
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-8 space-y-6">
          <SkeletonLoader className="h-12 w-48" />
          <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
            <SkeletonLoader className="h-64" />
            <SkeletonLoader className="h-8 w-3/4" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentProject?.project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
        <SharedNavigation />
        <div className="flex items-center justify-center min-h-screen pt-16">
        <div className="text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Project not found</h3>
          <Link
            href="/research"
            className="text-[#0158B7] hover:text-[#0362C3] font-medium"
          >
            Back to Research Projects
          </Link>
        </div>
      </div>
        </div>
    )
  }

  const project = currentProject.project
  const hasLiked = currentProject.hasLiked || false
  const comments = currentProject.comments || []

  const VisibilityIcon = project.visibility === "Public" ? Globe :
    project.visibility === "Private" ? Lock : Users

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      <SharedNavigation />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-[#0158B7] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Projects</span>
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          {/* Cover Image */}
          <div className="relative h-80 bg-gradient-to-br from-[#0158B7] to-[#0362C3]">
            {project.cover_image_url ? (
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <BookOpen className="w-24 h-24 text-white opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-[#0158B7]">
                {project.research_type}
              </span>
              <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-2">
                <VisibilityIcon className="w-4 h-4 text-gray-700" />
                <span className="text-sm font-semibold text-gray-900">
                  {project.visibility}
                </span>
              </div>
            </div>

            {project.is_featured && (
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full text-sm font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Featured
                </span>
              </div>
            )}
          </div>

          {/* Project Info */}
          <div className="p-8">
            {/* Title & Stats */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center text-gray-600">
                  <Eye className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">{project.view_count || 0}</span>
                  <span className="ml-1">views</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <ThumbsUp className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">{project.like_count || 0}</span>
                  <span className="ml-1">likes</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MessageSquare className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">{project.comment_count || 0}</span>
                  <span className="ml-1">comments</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Download className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">{project.download_count || 0}</span>
                  <span className="ml-1">downloads</span>
                </div>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {project.author?.first_name?.[0]}{project.author?.last_name?.[0]}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {project.author?.first_name} {project.author?.last_name}
                  </p>
                  {project.author?.profile?.institution_name && (
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {project.author.profile.institution_name}
                    </p>
                  )}
                  {project.author?.profile?.current_position && (
                    <p className="text-sm text-gray-600">
                      {project.author.profile.current_position}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Published {formatDate(project.publication_date || project.created_at)}</span>
                </div>
                {project.field_of_study && (
                  <p className="text-[#0158B7] font-semibold">{project.field_of_study}</p>
                )}
              </div>
            </div>

            {/* Abstract */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Abstract</h2>
              <div
                className="rich-text-content text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: cleanHtml(project.abstract),
                }}
                style={{
                  lineHeight: "1.6",
                }}
              />
            </div>

            {/* Full Description */}
            {project.full_description && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Full Description</h2>
                <div
                  className="rich-text-content text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: cleanHtml(project.full_description),
                  }}
                  style={{
                    lineHeight: "1.6",
                  }}
                />
              </div>
            )}

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-sm font-medium hover:bg-[#0158B7]/20 transition-colors cursor-pointer"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Files */}
            {project.files && project.files.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Attachments</h2>
                <div className="space-y-2">
                  {project.files.map((file) => (
                    <a
                      key={file.id}
                      href={file.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-[#0158B7]" />
                        <div>
                          <p className="font-medium text-gray-900">{file.file_name}</p>
                          <p className="text-xs text-gray-500">{file.file_type} • {file.file_size}</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-gray-400" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* DOI */}
            {project.doi && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm font-semibold text-blue-900 mb-1">Digital Object Identifier (DOI)</p>
                <p className="text-blue-700 font-mono">{project.doi}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              {!isAuthenticated ? (
                <div className="w-full bg-gradient-to-r from-[#A8C8E8]/20 to-[#8DB6E1]/20 border border-[#8DB6E1] rounded-xl p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Sign in to interact with this research
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Like, comment, and download research papers by joining our community
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Sign In to Continue
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleLike}
                    disabled={isSubmitting}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                      hasLiked
                        ? "bg-[#0158B7] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <ThumbsUp className="w-5 h-5" />
                    <span>{hasLiked ? "Liked" : "Like"}</span>
                  </button>
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all"
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Comment</span>
                  </button>
                  <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Comments Section */}
            {isAuthenticated && showComments && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Comments ({comments.length})
                </h2>

                {/* Comment Input */}
                <div className="mb-6">
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts on this research..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] resize-none"
                    rows={3}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || isSubmitting}
                      className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span>Post Comment</span>
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No comments yet. Be the first to share your thoughts!
                    </p>
                  ) : (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                          {comment.author?.first_name?.[0]}{comment.author?.last_name?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {comment.author?.first_name} {comment.author?.last_name}
                            </p>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 leading-relaxed">
                            {comment.comment_text}
                          </p>
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
