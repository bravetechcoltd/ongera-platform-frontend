// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchProjects } from "@/lib/features/auth/projectSlice"
import { Search, Filter, Eye, ThumbsUp, MessageSquare, User, MapPin, Calendar, FileText, Loader2, ChevronLeft, ChevronRight, AlertTriangle, BookOpen, ZoomIn, X, Building2 } from "lucide-react"
import Link from "next/link"
import { RootState } from "@/lib/store"

function SkeletonLoader({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200/50 rounded ${className}`}>
      <div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"
        style={{
          animation: "shimmer 1.5s infinite linear"
        }}
      />
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200">
      <SkeletonLoader className="h-56 mb-3" /> {/* Increased height for skeleton */}
      <SkeletonLoader className="h-5 mb-2 w-3/4" />
      <SkeletonLoader className="h-3 mb-2 w-full" />
      <SkeletonLoader className="h-3 w-2/3" />
    </div>
  )
}

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
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium">
          {title}
        </div>
      </div>
    </div>
  )
}

const cleanHtml = (html: any) => {
  if (!html) return ""
  let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
  cleaned = cleaned.replace(/<span[^>]*class="[^"]*ql-ui[^"]*"[^>]*>.*?<\/span>/g, "")
  cleaned = cleaned.replace(/ data-list="[^"]*"/g, "")
  cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom: 0.75rem; line-height: 1.5;">')
  cleaned = cleaned.replace(
    /<ul>/g,
    '<ul style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: disc;">'
  )
  cleaned = cleaned.replace(
    /<ol>/g,
    '<ol style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: decimal;">'
  )
  cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom: 0.25rem; line-height: 1.4;">')
  cleaned = cleaned.replace(/<h1>/g, '<h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.75rem;">')
  cleaned = cleaned.replace(/<h2>/g, '<h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">')
  cleaned = cleaned.replace(/<h3>/g, '<h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 0.75rem;">')
  cleaned = cleaned.replace(/<strong>/g, '<strong style="font-weight: bold;">')
  return cleaned
}

export default function ResearchProjectsPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { projects, isLoading, pagination } = useSelector((state: RootState) => state.projects)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedVisibility, setSelectedVisibility] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [previewImage, setPreviewImage] = useState(null)

  useEffect(() => {
    dispatch(fetchProjects({
      page: currentPage,
      limit: 12,
      search: searchQuery || undefined,
      research_type: selectedType || undefined,
      visibility: selectedVisibility || undefined,
      status: "Published"
    }))
  }, [dispatch, currentPage, searchQuery, selectedType, selectedVisibility])

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: any) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: any) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const researchTypes = ["Thesis", "Paper", "Project", "Dataset", "Case Study"]
  const visibilityOptions = ["Public", "Community-Only"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      <div className="max-w-8xl mx-auto px-4 pt-4">
        {/* Header Section - 100% Same */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-lg">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                Research Projects
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Discover cutting-edge research from Rwanda's academic community
                {pagination?.total > 0 && (
                  <span className="ml-2 font-semibold text-[#0158B7]">
                    ({pagination.total} projects)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar - 100% Same */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, author, or keywords..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${showFilters || selectedType || selectedVisibility
                    ? "bg-[#A8C8E8]/30 text-[#0158B7] border border-[#8DB6E1]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {(selectedType || selectedVisibility) && (
                  <span className="w-2 h-2 bg-[#0158B7] rounded-full" />
                )}
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all font-semibold"
              >
                Search
              </button>
            </div>

            {/* Filters Panel - 100% Same */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Research Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedType("")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${!selectedType
                          ? "bg-[#0158B7] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      All Types
                    </button>
                    {researchTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedType === type
                            ? "bg-[#0158B7] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Visibility
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedVisibility("")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${!selectedVisibility
                          ? "bg-[#0158B7] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                    >
                      All Projects
                    </button>
                    {visibilityOptions.map((vis) => (
                      <button
                        key={vis}
                        onClick={() => setSelectedVisibility(vis)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${selectedVisibility === vis
                            ? "bg-[#0158B7] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                      >
                        {vis}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedType("")
                      setSelectedVisibility("")
                      setSearchQuery("")
                      setCurrentPage(1)
                    }}
                    className="text-sm font-medium text-[#0158B7] hover:text-[#0362C3]"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters Display - 100% Same */}
          {(searchQuery || selectedType || selectedVisibility) && (
            <div className="flex items-center justify-between p-3 bg-[#A8C8E8]/20 border border-[#8DB6E1] rounded-lg mt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#0158B7]">
                  {pagination?.total || 0} projects found
                </span>
                {selectedType && (
                  <span className="px-3 py-1 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                    {selectedType}
                  </span>
                )}
                {selectedVisibility && (
                  <span className="px-3 py-1 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                    {selectedVisibility}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Projects Grid - UPDATED: 4 cards per row with enhanced styling */}
        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No research projects found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedType || selectedVisibility
                ? "Try adjusting your search or filters"
                : "Be the first to share your research"}
            </p>
            {!isAuthenticated && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Sign in to share your research and connect with the community
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                >
                  Sign In to Continue
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full"
                >
                  {/* ==================== ENHANCED: Taller Image Area with Clean Overlay ==================== */}
                  <div className="relative h-56 bg-gradient-to-br from-[#0158B7]/80 to-[#0362C3]/80 overflow-hidden flex-shrink-0">
                    {project.cover_image_url ? (
                      <>
                        <img
                          src={project.cover_image_url}
                          alt={project.title}
                          className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewImage({ url: project.cover_image_url, title: project.title })
                          }}
                        />
                        <div
                          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewImage({ url: project.cover_image_url, title: project.title })
                          }}
                        >
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 backdrop-blur-sm rounded-full p-2.5 transform group-hover:scale-110 shadow-md">
                            <ZoomIn className="w-5 h-5 text-[#0158B7]" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="w-12 h-12 text-white/50" />
                      </div>
                    )}
                    
                    {/* Institution Badge - Clean & Prominent */}
                    {project.author?.instructor && project.author?.institution?.name && (
                      <div className="absolute top-3 left-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full shadow-sm border border-gray-200/50">
                          <Building2 className="w-3.5 h-3.5 text-[#0158B7]" />
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[140px]">
                            {project.author.institution.name}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {/* Research Type Badge - Clean and Compact */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-[#0158B7] shadow-sm border border-gray-200/50">
                        {project.research_type}
                      </span>
                    </div>
                  </div>

                  {/* Project Content - Clean, Organized, Compact */}
                  <div
                    className="p-4 cursor-pointer flex flex-col flex-grow"
                    onClick={() => router.push(`/dashboard/user/research/${project.id}`)}
                  >
                    <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 min-h-[3rem] group-hover:text-[#0158B7] transition-colors duration-200">
                      {project.title}
                    </h3>

                    <div className="flex-grow mb-3">
                      {project.abstract && (
                        <div
                          className="rich-text-content text-gray-600 text-xs line-clamp-3"
                          dangerouslySetInnerHTML={{
                            __html: cleanHtml(
                              project.abstract.length > 120
                                ? project.abstract.slice(0, 120) + "..."
                                : project.abstract
                            ),
                          }}
                          style={{
                            lineHeight: "1.4",
                          }}
                        />
                      )}
                    </div>

                    <div className="space-y-1.5 mb-3 text-xs">
                      <div className="flex items-center text-gray-500">
                        <User className="w-3.5 h-3.5 mr-1.5 text-[#0158B7] flex-shrink-0" />
                        <span className="truncate text-gray-600">
                          {project.author?.first_name} {project.author?.last_name}
                        </span>
                      </div>
                      {project.author?.institution?.name && (
                        <div className="flex items-center text-gray-500">
                          <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#0158B7] flex-shrink-0" />
                          <span className="truncate text-gray-600">
                            {project.author.institution.name}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-500">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#0158B7] flex-shrink-0" />
                        <span className="text-gray-600">{formatDate(project.publication_date || project.created_at)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mb-3 min-h-[1.75rem]">
                      {project.tags?.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-[#0158B7]/5 text-[#0158B7] text-[11px] rounded-full font-medium border border-[#0158B7]/10"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {project.tags?.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded-full font-medium">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {project.view_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          {project.like_count || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {project.comment_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination - 100% Same */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} projects
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
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
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${pageNum === currentPage
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
                    className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Preview Modal - 100% Same */}
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