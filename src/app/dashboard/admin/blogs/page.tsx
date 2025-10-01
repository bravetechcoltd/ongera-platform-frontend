// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchBlogs,
  fetchBlogById,
  clearCurrentBlog,
  clearError,
  updateBlogStatus,
  deleteBlog,
  archiveBlog
} from "@/lib/features/auth/blogSlices"
import {
  BookOpen, Search, RefreshCw, Filter, Eye, Edit, Trash2,
  MoreVertical, X, AlertTriangle, ChevronLeft, ChevronRight,
  User, Calendar, TrendingUp, FileText, Hash, CheckCircle,
  XCircle, Loader2, Image as ImageIcon, ZoomIn, Archive,
  AlertCircle
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"


// Smart ViewBlogDetailsModal Component
interface ViewBlogDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  blog: any
}

function ViewBlogDetailsModal({ isOpen, onClose, blog }: ViewBlogDetailsModalProps) {
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [isImageLoading, setIsImageLoading] = useState(true)

  if (!isOpen || !blog) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      'Published': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText },
      'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      'Archived': { bg: 'bg-red-100', text: 'text-red-800', icon: Archive }
    }
    const c = config[status] || config['Draft']
    const Icon = c.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-4 h-4" />
        {status}
      </span>
    )
  }

  const getReadingTime = (minutes?: number) => {
    if (!minutes || minutes === 0) {
      const wordCount = blog.content?.split(/\s+/).length || 0
      return Math.ceil(wordCount / 200)
    }
    return minutes
  }

  const calculateReadingTime = (content: string) => {
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / 200)
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-purple-100 text-purple-800',
      'bg-blue-100 text-blue-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
      'bg-teal-100 text-teal-800',
      'bg-orange-100 text-orange-800'
    ]
    const index = Math.abs(category.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0)) % colors.length
    return colors[index]
  }

  const renderContentSections = () => {
    if (!blog.content) return null
    
    const sections = blog.content.split(/\n\s*\n/).filter((section: string) => section.trim())
    
    return sections.map((section: string, index: number) => {
      const isHeading = section.trim().match(/^#+\s+/)
      const isList = section.trim().startsWith('- ') || section.trim().startsWith('* ')
      
      if (isHeading) {
        const level = section.match(/^#+/)?.[0].length || 1
        const text = section.replace(/^#+\s+/, '')
        
        const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements
        
        return (
          <HeadingTag 
            key={index} 
            className={`font-bold text-gray-900 mb-2 ${level === 1 ? 'text-xl' : level === 2 ? 'text-lg' : 'text-base'}`}
          >
            {text}
          </HeadingTag>
        )
      }
      
      if (isList) {
        const items = section.split('\n').filter(item => item.trim())
        return (
          <ul key={index} className="list-disc pl-5 mb-4 space-y-1">
            {items.map((item, idx) => (
              <li key={idx} className="text-gray-700">
                {item.replace(/^[-\*]\s+/, '')}
              </li>
            ))}
          </ul>
        )
      }
      
      return (
        <p key={index} className="text-gray-700 mb-4 leading-relaxed">
          {section}
        </p>
      )
    })
  }

  return (
    <>
      {/* Main Modal */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0158B7] to-blue-600 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Blog Details</h3>
                <p className="text-blue-100 text-sm">Complete information and analytics</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Body with Scroll */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {/* Top Info Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(blog.status)}
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(blog.category)}`}>
                      <Hash className="w-4 h-4 mr-1.5" />
                      {blog.category}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {blog.published_at ? `Published: ${formatDate(blog.published_at)}` : `Created: ${formatDate(blog.created_at)}`}
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-1.5" />
                    {blog.view_count || 0} views
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1.5" />
                    {getReadingTime(blog.reading_time_minutes)} min read
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Cover Image & Stats */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Cover Image */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <ImageIcon className="w-4 h-4 mr-2 text-[#0158B7]" />
                      Cover Image
                    </h4>
                    <div className="relative group">
                      {blog.cover_image_url ? (
                        <>
                          {isImageLoading && (
                            <div className="w-full h-64 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                            </div>
                          )}
                          <img
                            src={blog.cover_image_url}
                            alt={blog.title}
                            className={`w-full h-64 object-cover rounded-xl cursor-pointer transition-all duration-300 ${isImageLoading ? 'hidden' : 'block'}`}
                            onClick={() => setShowImagePreview(true)}
                            onLoad={() => setIsImageLoading(false)}
                            onError={() => setIsImageLoading(false)}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 rounded-full p-3 shadow-lg transform scale-0 group-hover:scale-100 transition-transform">
                              <ZoomIn className="w-5 h-5 text-gray-800" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-64 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex flex-col items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-white mb-3" />
                          <span className="text-white font-medium">No cover image</span>
                        </div>
                      )}
                    </div>
                    {blog.cover_image_url && (
                      <button
                        onClick={() => setShowImagePreview(true)}
                        className="w-full mt-3 py-2 text-sm bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                      >
                        View Full Image
                      </button>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-[#0158B7]" />
                      Quick Stats
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Views Today</span>
                        <span className="text-lg font-bold text-gray-900">{(blog.view_count || 0) > 100 ? '100+' : blog.view_count || 0}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Reading Time</span>
                        <span className="text-lg font-bold text-gray-900">{getReadingTime(blog.reading_time_minutes)} min</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                        <span className="text-sm text-gray-600">Word Count</span>
                        <span className="text-lg font-bold text-gray-900">{blog.content?.split(/\s+/).length || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Author Info */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2 text-[#0158B7]" />
                      Author Information
                    </h4>
                    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      {blog.author?.profile_picture_url ? (
                        <img
                          src={blog.author.profile_picture_url}
                          alt={blog.author.username}
                          className="w-12 h-12 rounded-full border-2 border-[#0158B7]"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0158B7] to-blue-600 flex items-center justify-center border-2 border-[#0158B7]">
                          <span className="text-white font-bold text-sm">
                            {blog.author?.first_name?.[0]}{blog.author?.last_name?.[0]}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {blog.author?.first_name} {blog.author?.last_name}
                        </p>
                        <p className="text-xs text-gray-600">@{blog.author?.username || 'username'}</p>
                        <p className="text-xs text-gray-500 mt-1">{blog.author?.account_type || 'User'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Content & Details */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Title & Excerpt */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-5">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{blog.title}</h2>
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-white p-4 rounded-lg border border-gray-200">
                      {blog.excerpt || "No excerpt provided"}
                    </div>
                  </div>

                  {/* Full Content */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-[#0158B7]" />
                        Full Content
                      </h4>
                      <span className="text-xs text-gray-500">
                        {calculateReadingTime(blog.content)} min read
                      </span>
                    </div>
                    <div className="prose prose-blue max-w-none bg-white p-5 rounded-xl border border-gray-200 max-h-[400px] overflow-y-auto">
                      {renderContentSections() || (
                        <div className="text-center py-10 text-gray-500">
                          <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                          <p>No content available</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Community Info */}
                    {blog.community && (
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-[#0158B7]" />
                          Community
                        </h4>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{blog.community.name}</p>
                          <p className="text-xs text-gray-600 mt-1">Associated Community</p>
                        </div>
                      </div>
                    )}

                    {/* Linked Project */}
                    {blog.linked_project && (
                      <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                          <BookOpen className="w-4 h-4 mr-2 text-[#0158B7]" />
                          Linked Project
                        </h4>
                        <div className="p-3 bg-white rounded-lg border border-gray-200">
                          <p className="text-sm font-semibold text-gray-900">{blog.linked_project.title}</p>
                          <p className="text-xs text-gray-600 mt-1">Connected Research Project</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Timestamps */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-3">Timestamps</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Created</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(blog.created_at)}</p>
                      </div>
                      <div className="p-3 bg-white rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600">Last Updated</p>
                        <p className="text-sm font-semibold text-gray-900">{formatDate(blog.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.open(`${window.location.origin}/blogs/${blog.slug || blog.id}`, '_blank')
                }}
                className="px-4 py-2 text-sm bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
              >
                View Live Page
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && blog.cover_image_url && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={blog.cover_image_url}
              alt={blog.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
              {blog.title}
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'delete' | 'archive' | 'publish'
  isProcessing?: boolean 
}


function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'delete',
  isProcessing = false  // ✅ NEW: Accept loading state
}: ConfirmationModalProps) {
  if (!isOpen) return null

  const getConfig = () => {
    switch (type) {
      case 'delete':
        return {
          icon: AlertCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        }
      case 'archive':
        return {
          icon: Archive,
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-100',
          buttonColor: 'bg-orange-600 hover:bg-orange-700'
        }
      default:
        return {
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          buttonColor: 'bg-green-600 hover:bg-green-700'
        }
    }
  }

  const config = getConfig()
  const Icon = config.icon

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-3">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="p-5">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-full ${config.bgColor}`}>
              <Icon className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600 mt-1">{message}</p>
            </div>
          </div>
          
          <div className="mt-5 flex items-center justify-end space-x-2">
            <button
              onClick={onClose}
              disabled={isProcessing}  // ✅ Disable cancel while processing
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isProcessing}  // ✅ Disable confirm while processing
              className={`px-4 py-2 text-sm text-white rounded-lg transition-all font-semibold ${config.buttonColor} disabled:opacity-70 disabled:cursor-not-allowed flex items-center space-x-2 min-w-[100px] justify-center`}
            >
              {/* ✅ Show spinner when processing */}
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
// Enhanced Table with Delete and Archive Actions
interface EnhancedBlogsTableProps {
  blogs: any[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  startIndex: number
  onPageChange: (page: number) => void
  onViewDetails: (blog: any) => void
  onArchive: (blog: any) => void
  onDelete: (blog: any) => void
  onPublish: (blog: any) => void
}

interface EnhancedBlogsTableProps {
  blogs: any[]
  isLoading: boolean
  isSubmitting: boolean
  currentPage: number
  totalPages: number
  startIndex: number
  onPageChange: (page: number) => void
  onViewDetails: (blog: any) => void
  onArchive: (blog: any) => void
  onDelete: (blog: any) => void
  onPublish: (blog: any) => void
  processingAction?: {
    blogId: string
    action: 'archive' | 'delete' | 'publish'
  } | null
}

function EnhancedBlogsTable({
  blogs, isLoading, isSubmitting, currentPage, totalPages, startIndex,
  onPageChange, onViewDetails, onArchive, onDelete, onPublish,
  processingAction
}: EnhancedBlogsTableProps) {
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      'Published': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText },
      'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      'Archived': { bg: 'bg-red-100', text: 'text-red-800', icon: Archive }
    }
    const c = config[status as keyof typeof config] || config['Draft']
    const Icon = c.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        <Icon className="w-3 h-3" />
        {status}
      </span>
    )
  }

  const isProcessing = (blogId: string, action: string) => {
    return processingAction?.blogId === blogId && processingAction?.action === action
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0158B7]" />
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0158B7] text-white">
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">#</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Blog</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Author</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Category</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Stats</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Published</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Status</th>
              <th className="px-2 py-2 text-center text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {blogs.map((blog, index) => {
              const globalIndex = startIndex + index + 1
              const isArchiving = isProcessing(blog.id, 'archive')
              const isDeleting = isProcessing(blog.id, 'delete')
              const isPublishing = isProcessing(blog.id, 'publish')
              
              return (
                <motion.tr
                  key={blog.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className={`hover:bg-blue-50 transition-colors group ${
                    isArchiving || isDeleting || isPublishing ? 'opacity-50' : ''
                  }`}
                >
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="w-5 h-5 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-white">{globalIndex}</span>
                    </div>
                  </td>
                  
                  <td className="px-2 py-2">
                    <div className="flex items-start space-x-2 min-w-0 max-w-xs">
                      {blog.cover_image_url && (
                        <img src={blog.cover_image_url} alt={blog.title} className="w-10 h-10 rounded object-cover flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#0158B7] transition-colors">
                          {blog.title.split(' ').slice(0, 5).join(' ')}
                          {blog.title.split(' ').length > 5 && '...'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{blog.excerpt?.slice(0, 50)}...</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {blog.author?.first_name} {blog.author?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">@{blog.author?.username}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                      <Hash className="w-3 h-3 mr-1" />
                      {blog.category}
                    </span>
                  </td>

                  <td className="px-2 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{blog.view_count} views</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{blog.reading_time_minutes} min</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-900 font-semibold">
                      {formatDate(blog.published_at || blog.created_at)}
                    </div>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    {getStatusBadge(blog.status)}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      {/* View Details Button */}
                      <button
                        onClick={() => onViewDetails(blog)}
                        disabled={isArchiving || isDeleting || isPublishing}
                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all transform hover:scale-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      
                      {/* Publish/Archive Button */}
                      {blog.status === 'Published' ? (
                        <button
                          onClick={() => onArchive(blog)}
                          disabled={isArchiving || isDeleting || isPublishing}
                          className="p-1.5 bg-orange-100 text-orange-600 rounded-lg hover:bg-orange-200 transition-all transform hover:scale-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Archive Blog"
                        >
                          {isArchiving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : blog.status === 'Archived' ? (
                        <button
                          onClick={() => onPublish(blog)}
                          disabled={isArchiving || isDeleting || isPublishing}
                          className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all transform hover:scale-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Publish Blog"
                        >
                          {isPublishing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => onPublish(blog)}
                          disabled={isArchiving || isDeleting || isPublishing}
                          className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all transform hover:scale-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Publish Blog"
                        >
                          {isPublishing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => onDelete(blog)}
                        disabled={isArchiving || isDeleting || isPublishing}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all transform hover:scale-110 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete Blog"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(startIndex + blogs.length, blogs.length)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || isSubmitting}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    disabled={isSubmitting}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#0158B7] text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isSubmitting}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Stats Cards
function StatsCards({ stats }: { stats: any }) {
  const statItems = [
    { label: "Total Blogs", value: stats.total, icon: BookOpen, color: "bg-[#0158B7]", bgColor: "bg-blue-50", textColor: "text-blue-700" },
    { label: "Published", value: stats.published, icon: CheckCircle, color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700" },
    { label: "Draft", value: stats.draft, icon: FileText, color: "bg-gray-500", bgColor: "bg-gray-50", textColor: "text-gray-700" },
    { label: "Under Review", value: stats.underReview, icon: AlertTriangle, color: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
    { label: "Archived", value: stats.archived, icon: XCircle, color: "bg-red-500", bgColor: "bg-red-50", textColor: "text-red-700" },
    { label: "Total Views", value: stats.totalViews, icon: Eye, color: "bg-purple-500", bgColor: "bg-purple-50", textColor: "text-purple-700" }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={index} className={`${item.bgColor} rounded-lg border border-gray-200 border-${item.textColor.replace('text-', '')} p-3 hover:shadow-sm transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className={`text-xs font-medium ${item.textColor}`}>{item.label}</p>
              </div>
              <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-4 h-4 ${item.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Filters
function BlogFilters({ filters, onFiltersChange, blogs }: any) {
  const categories = Array.from(new Set(blogs.map((b: any) => b.category).filter(Boolean))) as string[]
  const statuses = ['all', 'Published', 'Draft', 'Under Review', 'Archived']

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Search blogs..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7]"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7]"
        >
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s}</option>)}
        </select>
        <select
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7]"
        >
          <option value="">All Categories</option>
          {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  )
}
export default function AdminBlogsManagementPage() {
  const dispatch = useAppDispatch()
  const { blogs, isLoading, error, isSubmitting } = useAppSelector(state => state.blog)

  const [filters, setFilters] = useState({ search: '', status: 'all', category: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<any>(null)
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    type: 'delete' | 'archive' | 'publish'
    blog: any | null
  }>({
    isOpen: false,
    type: 'delete',
    blog: null
  })
  const [processingAction, setProcessingAction] = useState<{
    blogId: string
    action: 'archive' | 'delete' | 'publish'
  } | null>(null)
  
  // ✅ NEW: Track if modal action is processing
  const [isModalProcessing, setIsModalProcessing] = useState(false)
  
  const itemsPerPage = 10

  useEffect(() => {
    loadBlogs()
  }, [])

  const loadBlogs = () => {
    dispatch(fetchBlogs({ page: 1, limit: 1000 }))
  }

  const filteredBlogs = blogs.filter(blog => {
    if (filters.search && !blog.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !blog.excerpt?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.status !== 'all' && blog.status !== filters.status) return false
    if (filters.category && blog.category !== filters.category) return false
    return true
  })

  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + itemsPerPage)

  const stats = {
    total: filteredBlogs.length,
    published: filteredBlogs.filter((b: any) => b.status === 'Published').length,
    draft: filteredBlogs.filter((b: any) => b.status === 'Draft').length,
    underReview: filteredBlogs.filter((b: any) => b.status === 'Under Review').length,
    archived: filteredBlogs.filter((b: any) => b.status === 'Archived').length,
    totalViews: filteredBlogs.reduce((sum: number, b: any) => sum + (b.view_count || 0), 0)
  }

  const handleViewDetails = async (blog: any) => {
    try {
      const result = await dispatch(fetchBlogById(blog.id)).unwrap()
      setSelectedBlog(result)
      setShowViewDetailsModal(true)
    } catch (err: any) {
      toast.error(err || "Failed to load blog details")
    }
  }

  const handleArchive = (blog: any) => {
    setConfirmationModal({
      isOpen: true,
      type: 'archive',
      blog
    })
  }

  const handleDelete = (blog: any) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      blog
    })
  }

  const handlePublish = (blog: any) => {
    setConfirmationModal({
      isOpen: true,
      type: 'publish',
      blog
    })
  }

  const confirmAction = async () => {
    if (!confirmationModal.blog) return

    const { blog, type } = confirmationModal
    
    // ✅ Set both states for loading indication
    setProcessingAction({ blogId: blog.id, action: type })
    setIsModalProcessing(true)

    try {
      switch (type) {
        case 'archive':
          await dispatch(archiveBlog(blog.id)).unwrap()
          toast.success("✅ Blog archived successfully! It has been moved to the archives and hidden from public view.")
          break
        
        case 'publish':
          await dispatch(updateBlogStatus({
            id: blog.id,
            status: 'Published'
          })).unwrap()
          toast.success("🎉 Blog published successfully! It is now visible to all users.")
          break
        
        case 'delete':
          await dispatch(deleteBlog({ id: blog.id, confirm: true })).unwrap()
          toast.success("🗑️ Blog deleted successfully! The blog has been permanently removed from the system.")
          break
      }
      
      // ✅ Close modal after successful action
      setConfirmationModal({ isOpen: false, type: 'delete', blog: null })
      
      // ✅ Refresh the blog list
      setTimeout(() => {
        loadBlogs()
      }, 500)
      
    } catch (err: any) {
      toast.error(`❌ ${err || `Failed to ${type} blog. Please try again.`}`)
    } finally {
      // ✅ Always clear loading states
      setProcessingAction(null)
      setIsModalProcessing(false)
    }
  }

  const getConfirmationConfig = () => {
    const { blog, type } = confirmationModal
    if (!blog) return { title: '', message: '', confirmText: '', type: 'delete' as const }

    switch (type) {
      case 'archive':
        return {
          title: "Archive Blog",
          message: `Are you sure you want to archive "${blog.title}"? Archived blogs will be hidden from public view but can be restored later.`,
          confirmText: "Archive Blog",  // ✅ More descriptive
          type: 'archive' as const
        }
      
      case 'publish':
        return {
          title: "Publish Blog",
          message: `Are you sure you want to publish "${blog.title}"? The blog will be visible to all users.`,
          confirmText: "Publish Now",  // ✅ More descriptive
          type: 'publish' as const
        }
      
      case 'delete':
        return {
          title: "Delete Blog",
          message: `Are you sure you want to delete "${blog.title}"? This action cannot be undone and all blog data will be permanently removed.`,
          confirmText: "Delete Permanently",  // ✅ More descriptive
          type: 'delete' as const
        }
      
      default:
        return { title: '', message: '', confirmText: '', type: 'delete' as const }
    }
  }

  const config = getConfirmationConfig()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0158B7] rounded-lg flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Blog Management</h1>
                <p className="text-xs text-gray-500">{filteredBlogs.length} filtered • {blogs.length} total</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={loadBlogs}
                disabled={isLoading}
                className="flex items-center px-2 py-1.5 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors text-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>
          <StatsCards stats={stats} />
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4">
          <BlogFilters filters={filters} onFiltersChange={setFilters} blogs={blogs} />
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <EnhancedBlogsTable
            blogs={paginatedBlogs}
            isLoading={isLoading}
            isSubmitting={isSubmitting}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
            onViewDetails={handleViewDetails}
            onArchive={handleArchive}
            onDelete={handleDelete}
            onPublish={handlePublish}
            processingAction={processingAction}
          />
        </motion.div>

        {/* View Details Modal */}
        {showViewDetailsModal && selectedBlog && (
          <ViewBlogDetailsModal
            isOpen={showViewDetailsModal}
            onClose={() => {
              setShowViewDetailsModal(false)
              setSelectedBlog(null)
            }}
            blog={selectedBlog}
          />
        )}

        {/* Confirmation Modal - ✅ NOW WITH LOADING STATE */}
        {confirmationModal.isOpen && (
          <ConfirmationModal
            isOpen={confirmationModal.isOpen}
            onClose={() => setConfirmationModal({ isOpen: false, type: 'delete', blog: null })}
            onConfirm={confirmAction}
            title={config.title}
            message={config.message}
            confirmText={config.confirmText}
            type={config.type}
            isProcessing={isModalProcessing}  // ✅ Pass loading state
          />
        )}
      </div>
    </div>
  )
}