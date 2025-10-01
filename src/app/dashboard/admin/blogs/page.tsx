"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchBlogs,
  fetchBlogById,
  clearCurrentBlog,
  clearError
} from "@/lib/features/auth/blogSlices"
import {
  BookOpen, Search, RefreshCw, Filter, Eye, Edit, Trash2,
  MoreVertical, X, AlertTriangle, ChevronLeft, ChevronRight,
  User, Calendar, TrendingUp, FileText, Hash, CheckCircle,
  XCircle, Loader2, Image as ImageIcon, ZoomIn
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

// View Details Modal
interface ViewBlogDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  blog: any
}

function ViewBlogDetailsModal({ isOpen, onClose, blog }: ViewBlogDetailsModalProps) {
  const [showImagePreview, setShowImagePreview] = useState(false)

  if (!isOpen || !blog) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      'Published': { bg: 'bg-green-100', text: 'text-green-800' },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-800' },
      'Archived': { bg: 'bg-red-100', text: 'text-red-800' }
    }
    const c = config[status as keyof typeof config] || config['Draft']
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
        {status}
      </span>
    )
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Blog Details</h3>
                  <p className="text-blue-100 text-xs">Complete blog information</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            
            {/* Cover Image */}
            <div className="relative group">
              {blog.cover_image_url ? (
                <div 
                  className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer relative"
                  onClick={() => setShowImagePreview(true)}
                >
                  <img src={blog.cover_image_url} alt={blog.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                      <ZoomIn className="w-6 h-6 text-gray-800" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-gray-200">
                  <ImageIcon className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Title & Meta */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{blog.title}</h2>
              <div className="flex items-center space-x-2 mb-3">
                {getStatusBadge(blog.status)}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <Hash className="w-3 h-3 mr-1" />
                  {blog.category}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{blog.excerpt}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Author Info */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <User className="w-4 h-4 mr-2 text-[#0158B7]" />
                  Author
                </h4>
                <div className="flex items-center space-x-3">
                  {blog.author?.profile_picture_url ? (
                    <img src={blog.author.profile_picture_url} alt={blog.author.username} className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#0158B7] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        {blog.author?.first_name?.[0]}{blog.author?.last_name?.[0]}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {blog.author?.first_name} {blog.author?.last_name}
                    </p>
                    <p className="text-xs text-gray-600">@{blog.author?.username}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-[#0158B7]" />
                  Statistics
                </h4>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Views:</span>
                    <span className="font-semibold text-gray-900">{blog.view_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reading Time:</span>
                    <span className="font-semibold text-gray-900">{blog.reading_time_minutes} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Published:</span>
                    <span className="font-semibold text-gray-900">{formatDate(blog.published_at || blog.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Full Content */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-[#0158B7]" />
                Full Content
              </h4>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {blog.content}
              </div>
            </div>

            {/* Community */}
            {blog.community && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Community</h4>
                <p className="text-sm font-semibold text-gray-900">{blog.community.name}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 flex-shrink-0">
            <button onClick={onClose} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold">
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Image Preview Modal */}
      {showImagePreview && blog.cover_image_url && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setShowImagePreview(false)}>
          <button onClick={() => setShowImagePreview(false)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
          <img src={blog.cover_image_url} alt={blog.title} className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}

// Enhanced Table
interface EnhancedBlogsTableProps {
  blogs: any[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  startIndex: number
  onPageChange: (page: number) => void
  onViewDetails: (blog: any) => void
  onStatusChange: (blog: any, newStatus: string) => void
}

function EnhancedBlogsTable({
  blogs, isLoading, currentPage, totalPages, startIndex,
  onPageChange, onViewDetails, onStatusChange
}: EnhancedBlogsTableProps) {
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const config = {
      'Published': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Draft': { bg: 'bg-gray-100', text: 'text-gray-800', icon: FileText },
      'Under Review': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: AlertTriangle },
      'Archived': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
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
              return (
                <motion.tr
                  key={blog.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-blue-50 transition-colors group"
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
                      <button
                        onClick={() => onViewDetails(blog)}
                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all transform hover:scale-110 shadow-sm"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onStatusChange(blog, blog.status === 'Published' ? 'Archived' : 'Published')}
                        className={`p-1.5 rounded-lg transition-all transform hover:scale-110 shadow-sm ${
                          blog.status === 'Published'
                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={blog.status === 'Published' ? 'Archive' : 'Publish'}
                      >
                        {blog.status === 'Published' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
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
                disabled={currentPage === 1}
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
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#0158B7] text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
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

// Main Component
export default function AdminBlogsManagementPage() {
  const dispatch = useAppDispatch()
  const { blogs, isLoading, error } = useAppSelector(state => state.blog)

  const [filters, setFilters] = useState({ search: '', status: 'all', category: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false)
  const [selectedBlog, setSelectedBlog] = useState<any>(null)
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

  const handleStatusChange = (blog: any, newStatus: string) => {
    toast.success(`Blog ${newStatus === 'Published' ? 'published' : 'archived'} successfully!`)
  }

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
            <button onClick={loadBlogs} disabled={isLoading} className="flex items-center px-2 py-1.5 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
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
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
            onViewDetails={handleViewDetails}
            onStatusChange={handleStatusChange}
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
      </div>
    </div>
  )
}