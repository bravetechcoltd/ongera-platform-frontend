"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchBlogs } from "@/lib/features/auth/blogSlices"
import { 
  Search, Filter, FileText, Eye, Clock, Calendar, ChevronLeft, 
  ChevronRight, Loader2, BookOpen, X, Tag, TrendingUp, Sparkles,
  User, Grid, List, Plus, ZoomIn
} from "lucide-react"

// Image Preview Modal Component
function ImagePreviewModal({ imageUrl, title, onClose }: { imageUrl: string; title: string; onClose: () => void }) {
  if (!imageUrl) return null

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300 z-10"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center">
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium max-w-[90%] truncate">
          {title}
        </div>
      </div>
    </div>
  )
}

const BLOG_CATEGORIES = [
  "All",
  "Technology",
  "Research",
  "Health",
  "Education",
  "Agriculture",
  "Environment",
  "Business",
  "Social Impact",
  "Innovation"
]

const ITEMS_PER_PAGE = 12

export default function AllBlogsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const { blogs, isLoading, pagination } = useAppSelector(state => state.blog)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [previewImage, setPreviewImage] = useState<{url: string; title: string} | null>(null)

  useEffect(() => {
    dispatch(fetchBlogs({
      page: currentPage,
      limit: ITEMS_PER_PAGE,
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      search: searchQuery || undefined
    }))
  }, [currentPage, selectedCategory, dispatch])

  const handleSearch = () => {
    setCurrentPage(1)
    dispatch(fetchBlogs({
      page: 1,
      limit: ITEMS_PER_PAGE,
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      search: searchQuery || undefined
    }))
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All")
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getReadingTime = (minutes: number) => {
    if (!minutes || minutes === 0) return "5 min read"
    return `${minutes} min read`
  }

  // Stats calculation
  const stats = {
    total: pagination.total || 0,
    technology: blogs.filter(b => b.category === 'Technology').length,
    research: blogs.filter(b => b.category === 'Research').length,
    trending: blogs.filter(b => (b.view_count || 0) > 100).length
  }

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
              Research Blog
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">Discover insights and research findings from our community</p>
          </div>
          
          <button
            onClick={() => router.push('/dashboard/user/communities')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Write Article</span>
          </button>
        </div>

        {/* Compact Stats Bar */}
        <div className="flex items-center divide-x divide-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 p-2">
          {[
            { label: 'Total', value: stats.total, icon: BookOpen, color: 'from-[#0158B7] to-[#0362C3]' },
            { label: 'Technology', value: stats.technology, icon: FileText, color: 'from-[#5E96D2] to-[#8DB6E1]' },
            { label: 'Research', value: stats.research, icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
            { label: 'Trending', value: stats.trending, icon: Sparkles, color: 'from-orange-500 to-amber-500' }
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

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex flex-col lg:flex-row gap-2 mb-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search articles..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${
              showFilters || selectedCategory !== "All"
                ? "bg-[#A8C8E8]/30 text-[#0158B7] border border-[#8DB6E1]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {selectedCategory !== "All" && (
              <span className="w-1.5 h-1.5 bg-[#0158B7] rounded-full" />
            )}
          </button>

          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "grid"
                  ? "bg-white text-[#0158B7] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === "list"
                  ? "bg-white text-[#0158B7] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search Button */}
          <button
            onClick={handleSearch}
            className="px-4 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
          >
            Search
          </button>
        </div>

        {/* Active Filters Display */}
        {(searchQuery || selectedCategory !== "All") && (
          <div className="flex items-center justify-between p-2 bg-[#A8C8E8]/20 border border-[#8DB6E1] rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#0158B7]">
                Found {pagination.total} articles
              </span>
              {searchQuery && (
                <span className="px-2 py-0.5 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7] flex items-center gap-1">
                  Search: "{searchQuery}"
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-[#0362C3]" 
                    onClick={() => {
                      setSearchQuery("")
                      handleSearch()
                    }} 
                  />
                </span>
              )}
              {selectedCategory !== "All" && (
                <span className="px-2 py-0.5 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7] flex items-center gap-1">
                  Category: {selectedCategory}
                  <X 
                    className="w-3 h-3 cursor-pointer hover:text-[#0362C3]" 
                    onClick={() => {
                      setSelectedCategory("All")
                      setCurrentPage(1)
                    }} 
                  />
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-[#0158B7] hover:text-[#0362C3]"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Category Filters */}
        {showFilters && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
              {selectedCategory !== "All" && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#0158B7] hover:text-[#0362C3] font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {BLOG_CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category)
                    setCurrentPage(1)
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white shadow-lg"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Blog Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading articles...</p>
          </div>
        </div>
      ) : blogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {searchQuery || selectedCategory !== "All" ? "No articles found" : "No articles yet"}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {searchQuery || selectedCategory !== "All"
              ? "Try adjusting your search terms or filters"
              : "Be the first to share your insights with the community"
            }
          </p>
          {(searchQuery || selectedCategory !== "All") ? (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
            >
              Clear all filters
            </button>
          ) : (
            <button
              onClick={() => router.push('/dashboard/user/communities')}
              className="px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
            >
              Start Writing
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Grid View - UPDATED FOR CONSISTENCY */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {blogs.map(blog => (
                <article
                  key={blog.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
                >
                  {/* Cover Image - Fixed Height */}
                  <div className="relative h-40 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] overflow-hidden flex-shrink-0">
                    {blog.cover_image_url ? (
                      <>
                        <img 
                          src={blog.cover_image_url} 
                          alt={blog.title} 
                          className="w-full h-full object-contain bg-white cursor-pointer"
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
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-2 transform group-hover:scale-110">
                            <ZoomIn className="w-5 h-5 text-[#0158B7]" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <FileText className="w-8 h-8 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#A8C8E8]/90 text-[#0158B7] rounded text-[10px] font-bold">
                      {blog.category}
                    </div>
                  </div>

                  {/* Content - Flexible container */}
                  <div 
                    className="p-3 flex flex-col flex-grow cursor-pointer"
                    onClick={() => router.push(`/dashboard/user/blog/${blog.id}`)}
                  >
                    {/* Title - Fixed height */}
                    <h3 className="font-bold text-sm text-gray-900 mb-1.5 line-clamp-2 min-h-[2.5rem] group-hover:text-[#0158B7] transition-colors">
                      {blog.title}
                    </h3>

                    {/* Excerpt - Flexible space with consistent height */}
                    <div className="flex-grow mb-3 min-h-[7rem]">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed h-full">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Meta Info - Fixed height */}
                    <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-3 pb-3 border-b border-gray-200">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {formatDate(blog.published_at || blog.created_at)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-3 h-3" />
                        {getReadingTime(blog.reading_time_minutes)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {blog.view_count || 0}
                      </span>
                    </div>

                    {/* Author - Fixed at bottom */}
                    <div className="flex items-center gap-2 mt-auto">
                      {blog.author?.profile_picture_url ? (
                        <img
                          src={blog.author.profile_picture_url}
                          alt={blog.author.first_name}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {blog.author?.first_name?.[0]}{blog.author?.last_name?.[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {blog.author?.first_name} {blog.author?.last_name}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {blog.author?.account_type}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* List View - UPDATED FOR CONSISTENCY */}
          {viewMode === "list" && (
            <div className="space-y-2 mb-4">
              {blogs.map(blog => (
                <article
                  key={blog.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row h-full sm:h-40"
                >
                  {/* Cover Image - Fixed width */}
                  <div className="relative w-full sm:w-48 h-32 sm:h-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex-shrink-0 overflow-hidden">
                    {blog.cover_image_url ? (
                      <>
                        <img 
                          src={blog.cover_image_url} 
                          alt={blog.title} 
                          className="w-full h-full object-contain bg-white cursor-pointer"
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
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-1.5 transform group-hover:scale-110">
                            <ZoomIn className="w-4 h-4 text-[#0158B7]" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <FileText className="w-6 h-6 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#A8C8E8]/90 text-[#0158B7] rounded text-[10px] font-bold">
                      {blog.category}
                    </div>
                  </div>

                  {/* Content - Flexible container */}
                  <div 
                    className="flex-1 p-3 flex flex-col cursor-pointer"
                    onClick={() => router.push(`/dashboard/user/blog/${blog.id}`)}
                  >
                    {/* Title - Fixed height */}
                    <h3 className="font-bold text-sm text-gray-900 mb-1.5 line-clamp-2 min-h-[2.5rem] group-hover:text-[#0158B7] transition-colors">
                      {blog.title}
                    </h3>

                    {/* Excerpt - Flexible space */}
                    <div className="flex-grow mb-2">
                      <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    {/* Meta Info - Fixed height */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(blog.published_at || blog.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {getReadingTime(blog.reading_time_minutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {blog.view_count || 0} views
                      </span>
                    </div>

                    {/* Author - Fixed at bottom */}
                    <div className="flex items-center gap-2 mt-auto">
                      {blog.author?.profile_picture_url ? (
                        <img
                          src={blog.author.profile_picture_url}
                          alt={blog.author.first_name}
                          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {blog.author?.first_name?.[0]}{blog.author?.last_name?.[0]}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {blog.author?.first_name} {blog.author?.last_name}
                        </p>
                        <p className="text-[10px] text-gray-500 truncate">
                          {blog.author?.account_type}
                        </p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              {/* Pagination Info */}
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)} of {pagination.total} articles
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          pageNum === currentPage
                            ? "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white shadow-sm"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

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