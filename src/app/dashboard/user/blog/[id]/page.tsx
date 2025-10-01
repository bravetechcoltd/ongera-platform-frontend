// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchBlogById, fetchBlogs } from "@/lib/features/auth/blogSlices"
import {
  ArrowLeft, Calendar, Clock, Eye, User, Tag, Share2,
  Bookmark, Heart, MessageCircle, MoreVertical, Loader2,
  FileText, TrendingUp, Briefcase, Download, BookOpen,
  MapPin, Building, Link2, ExternalLink, ChevronDown, ChevronUp, Send, ZoomIn, X
} from "lucide-react"
import Link from "next/link"

// Image Preview Modal Component
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

export default function BlogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { currentBlog, blogs, isLoading } = useAppSelector(state => state.blog)
  const { user } = useAppSelector(state => state.auth)

  const [isSidebarLoading, setIsSidebarLoading] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [collapsedSections, setCollapsedSections] = useState({
    categories: true,
    author: false
  })
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    if (params.id) {
      dispatch(fetchBlogById(params.id as string))
    }
  }, [params.id, dispatch])

  useEffect(() => {
    setIsSidebarLoading(true)
    dispatch(fetchBlogs({ limit: 10 }))
      .unwrap()
      .finally(() => setIsSidebarLoading(false))
  }, [dispatch])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const handleBlogClick = (blogId: string) => {
    router.push(`/dashboard/user/blog/${blogId}`)
  }

  const toggleSection = (section: 'categories' | 'author') => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (isLoading && !currentBlog) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Loading blog...</p>
        </div>
      </div>
    )
  }

  if (!currentBlog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <FileText className="w-12 h-12 text-white mx-auto mb-4 opacity-80" />
          <h2 className="text-xl font-bold text-white mb-2">Blog Not Found</h2>
          <p className="text-white/80 text-sm mb-6">The blog post you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/user/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#0158B7] rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </div>
      </div>
    )
  }

  const blog = currentBlog
  const isAuthor = user?.id === blog.author?.id

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <button
              onClick={() => router.push('/dashboard/user/blog')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blogs</span>
            </button>
            
            <div className="flex items-center gap-1">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              {isAuthor && (
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <MoreVertical className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Sticky Compact Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-16 self-start">
            {/* Author Mini Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center gap-3 mb-3">
                {blog.author?.profile_picture_url ? (
                  <img
                    src={blog.author.profile_picture_url}
                    alt={blog.author.first_name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#0158B7] flex items-center justify-center text-white font-semibold text-sm">
                    {blog.author?.first_name?.[0]}{blog.author?.last_name?.[0]}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    {blog.author?.first_name} {blog.author?.last_name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{blog.author?.account_type}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                {blog.author?.profile?.institution_name && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Building className="w-3 h-3" />
                    <span className="truncate">{blog.author.profile.institution_name}</span>
                  </div>
                )}
                {blog.author?.city && blog.author?.country && (
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{blog.author.city}, {blog.author.country}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Blog Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#0158B7]" />
                Details
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Published:</span>
                  <span className="text-gray-700">{formatDate(blog.published_at || blog.created_at)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Reading Time:</span>
                  <span className="text-gray-700">{blog.reading_time_minutes} min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Views:</span>
                  <span className="text-gray-700">{blog.view_count || 0}</span>
                </div>
              </div>
            </div>

            {/* Categories Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <button
                onClick={() => toggleSection('categories')}
                className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
              >
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#0158B7]" />
                  Categories
                </span>
                {collapsedSections.categories ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
              {!collapsedSections.categories && (
                <div className="flex flex-wrap gap-1.5">
                  {['Technology', 'Research', 'Health', 'Education', 'Agriculture', 'Environment'].map((category) => (
                    <span
                      key={category}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Community Badge */}
            {blog.community && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <Link
                  href={`/dashboard/user/communities/dashboard/${blog.community.id}`}
                  className="flex items-center gap-2 text-xs font-semibold text-[#0158B7] hover:text-[#0158B7]/80 transition-colors"
                >
                  <TrendingUp className="w-4 h-4" />
                  Posted in {blog.community.name}
                </Link>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4">
            {/* Compressed Header Card with Enhanced Image */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
              {blog.cover_image_url && (
                <div className="relative h-64 md:h-80 overflow-hidden group">
                  <img
                    src={blog.cover_image_url}
                    alt={blog.title}
                    className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewImage({ url: blog.cover_image_url, title: blog.title })
                    }}
                  />
                  {/* Zoom Icon Overlay */}
                  <div 
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation()
                      setPreviewImage({ url: blog.cover_image_url, title: blog.title })
                    }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 transform group-hover:scale-110">
                      <ZoomIn className="w-6 h-6 text-[#0158B7]" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4 md:p-6">
                {/* Category and Status Badges */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="px-2 py-0.5 bg-[#0158B7] text-white rounded-full text-xs font-semibold">
                    {blog.category}
                  </span>
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                    Published
                  </span>
                </div>
                
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                  {blog.title}
                </h1>
                
                {/* Compact Excerpt */}
                <div className="text-sm text-gray-600 leading-normal mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-[#0158B7]">
                  {blog.excerpt}
                </div>

                {/* Compressed Stats */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    <span>{blog.view_count || 0} views</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{blog.reading_time_minutes} min read</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(blog.published_at || blog.created_at)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/90 transition-colors text-sm font-medium flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    Save
                  </button>
                  
                  <button className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Heart className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
              <div className="prose max-w-none">
                <div className="text-sm text-gray-700 leading-normal space-y-4">
                  {blog.content?.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Linked Project */}
              {blog.linked_project && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-[#0158B7] font-semibold text-sm mb-2">
                    <Briefcase className="w-4 h-4" />
                    Related Research Project
                  </div>
                  <Link
                    href={`/dashboard/user/research/${blog.linked_project.id}`}
                    className="text-[#0158B7] hover:text-[#0158B7]/80 transition-colors text-sm font-medium"
                  >
                    {blog.linked_project.title}
                  </Link>
                </div>
              )}
            </div>

            {/* Comments Section */}
            {!showComments && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
                <button
                  onClick={() => setShowComments(true)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 hover:text-[#0158B7] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#0158B7]" />
                    Comments (0)
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {showComments && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#0158B7]" />
                    Comments (0)
                  </h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Add Comment */}
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      className="px-3 py-1.5 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/90 transition-colors text-xs font-medium flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      Post Comment
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  <p className="text-center text-gray-500 py-4 text-sm">No comments yet. Be the first to comment!</p>
                </div>
              </div>
            )}

            {/* Recent Blogs Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#0158B7]" />
                More Blog Posts
              </h3>

              {isSidebarLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 text-[#0158B7] animate-spin" />
                </div>
              ) : blogs.length === 0 ? (
                <div className="text-center py-4">
                  <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No other blogs yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {blogs
                    .filter(b => b.id !== blog.id)
                    .slice(0, 3)
                    .map((blogItem) => (
                      <div
                        key={blogItem.id}
                        onClick={() => handleBlogClick(blogItem.id)}
                        className="group cursor-pointer p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-[#5E96D2] rounded-lg transition-all"
                      >
                        <div className="flex gap-3">
                          {blogItem.cover_image_url ? (
                            <img
                              src={blogItem.cover_image_url}
                              alt={blogItem.title}
                              className="w-12 h-12 rounded object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-[#0158B7]/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-[#0158B7]" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 group-hover:text-[#0158B7] transition-colors text-sm line-clamp-2 mb-1">
                              {blogItem.title}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              <span>{blogItem.category}</span>
                              <span>•</span>
                              <span>{blogItem.reading_time_minutes} min</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}

              <Link
                href="/dashboard/user/blog"
                className="mt-4 block w-full py-2 px-4 bg-[#0158B7] hover:bg-[#0158B7]/90 text-white text-center rounded-lg font-medium transition-colors text-sm"
              >
                View All Blogs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
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