// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchProjects } from "@/lib/features/auth/projectSlice"
import { Search, Filter, Eye, ThumbsUp, MessageSquare, User, MapPin, Calendar, FileText, Loader2, ChevronLeft, ChevronRight, AlertTriangle, BookOpen, CheckCircle } from "lucide-react"
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
          animation: "shimmer 1.6s infinite linear",
          backgroundSize: "200% 100%",
        }}
      />
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  )
}

function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col">
      <SkeletonLoader className="h-44 rounded-none" />
      <div className="p-5 flex flex-col flex-1 gap-3">
        <SkeletonLoader className="h-5 w-3/4" />
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-5/6" />
        <div className="mt-auto pt-3 border-t border-gray-100 flex gap-2">
          <SkeletonLoader className="h-3 w-12" />
          <SkeletonLoader className="h-3 w-12" />
          <SkeletonLoader className="h-3 w-12" />
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
  cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom:0.75rem;line-height:1.5;">')
  cleaned = cleaned.replace(/<ul>/g, '<ul style="margin-bottom:0.75rem;padding-left:1.5rem;list-style-type:disc;">')
  cleaned = cleaned.replace(/<ol>/g, '<ol style="margin-bottom:0.75rem;padding-left:1.5rem;list-style-type:decimal;">')
  cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom:0.25rem;line-height:1.4;">')
  cleaned = cleaned.replace(/<h1>/g, '<h1 style="font-size:1.5rem;font-weight:bold;margin-bottom:0.75rem;">')
  cleaned = cleaned.replace(/<h2>/g, '<h2 style="font-size:1.25rem;font-weight:bold;margin-bottom:0.75rem;">')
  cleaned = cleaned.replace(/<h3>/g, '<h3 style="font-size:1.125rem;font-weight:bold;margin-bottom:0.75rem;">')
  cleaned = cleaned.replace(/<strong>/g, '<strong style="font-weight:bold;">')
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

  const handleSearch = () => { setCurrentPage(1) }

  const handlePageChange = (newPage: any) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const formatDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const researchTypes = ["Thesis", "Paper", "Project", "Dataset", "Case Study"]
  const visibilityOptions = ["Public", "Community-Only"]

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <SharedNavigation />

      <div className="max-w-7xl mx-auto px-4 pt-24 pb-10">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-5">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-1.5">
              <div className="p-2 bg-gradient-to-br from-[#0158B7] to-[#1e40af] rounded-xl shadow-sm">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              Research Projects
            </h1>
            <p className="text-sm text-gray-500 ml-1">
              Discover cutting-edge research from Rwanda's academic community
              {pagination?.total > 0 && (
                <span className="ml-2 font-semibold text-[#0158B7]">({pagination.total} projects)</span>
              )}
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by title, author, or keywords..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7]/30 focus:border-[#0158B7] text-sm transition-all"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  showFilters || selectedType || selectedVisibility
                    ? "bg-[#0158B7]/10 text-[#0158B7] border border-[#0158B7]/30"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {(selectedType || selectedVisibility) && (
                  <span className="w-2 h-2 bg-[#0158B7] rounded-full" />
                )}
              </button>
              <button
                onClick={handleSearch}
                className="px-5 py-2.5 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-lg text-sm font-semibold hover:shadow-md hover:shadow-blue-500/20 transition-all"
              >
                Search
              </button>
            </div>

            {showFilters && (
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Research Type</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedType("")}
                      className={`px-3.5 py-1.5 rounded-lg font-medium text-sm transition-all ${!selectedType ? "bg-[#0158B7] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      All Types
                    </button>
                    {researchTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-3.5 py-1.5 rounded-lg font-medium text-sm transition-all ${selectedType === type ? "bg-[#0158B7] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Visibility</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedVisibility("")}
                      className={`px-3.5 py-1.5 rounded-lg font-medium text-sm transition-all ${!selectedVisibility ? "bg-[#0158B7] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      All Projects
                    </button>
                    {visibilityOptions.map((vis) => (
                      <button
                        key={vis}
                        onClick={() => setSelectedVisibility(vis)}
                        className={`px-3.5 py-1.5 rounded-lg font-medium text-sm transition-all ${selectedVisibility === vis ? "bg-[#0158B7] text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {vis}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => { setSelectedType(""); setSelectedVisibility(""); setSearchQuery(""); setCurrentPage(1) }}
                    className="text-sm font-medium text-[#0158B7] hover:text-[#0149a0] transition-colors"
                  >
                    Clear all filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedType || selectedVisibility) && (
            <div className="flex items-center gap-3 p-3 bg-[#0158B7]/8 border border-[#0158B7]/20 rounded-xl mt-3">
              <span className="text-sm font-semibold text-[#0158B7]">{pagination?.total || 0} projects found</span>
              {selectedType && (
                <span className="px-3 py-1 bg-white border border-[#0158B7]/20 rounded-full text-xs font-medium text-[#0158B7]">{selectedType}</span>
              )}
              {selectedVisibility && (
                <span className="px-3 py-1 bg-white border border-[#0158B7]/20 rounded-full text-xs font-medium text-[#0158B7]">{selectedVisibility}</span>
              )}
            </div>
          )}
        </div>

        {/* Projects Grid */}
        {isLoading && projects.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No research projects found</h3>
            <p className="text-gray-500 text-sm mb-6">
              {searchQuery || selectedType || selectedVisibility
                ? "Try adjusting your search or filters"
                : "Be the first to share your research"}
            </p>
            {!isAuthenticated && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">Sign in to share your research and connect with the community</p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all">
                  Sign In to Continue
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/research-projects/${project.id}`)}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group hover:shadow-md hover:border-[#0158B7]/20 transition-all duration-300 flex flex-col"
                >
                  {/* ── IMAGE ── fixed height */}
                  <div className="relative h-44 w-full flex-shrink-0 overflow-hidden bg-gradient-to-br from-[#0158B7] to-[#1e40af]">
                    {project.cover_image_url ? (
                      <img
                        src={project.cover_image_url}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-14 h-14 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

                    {/* Research Type */}
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-white/95 backdrop-blur-sm rounded-full text-[11px] font-bold text-[#0158B7] shadow-sm">
                        {project.research_type}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="absolute top-3 left-3 bg-black/55 backdrop-blur-sm text-white text-[11px] font-medium px-2.5 py-1 rounded-lg">
                      {formatDate(project.publication_date || project.created_at)}
                    </div>

                    {/* Featured */}
                    {project.is_featured && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full text-[11px] font-bold flex items-center gap-1 shadow-sm">
                          <CheckCircle className="w-3 h-3" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* ── CARD BODY ── flex-col fills remaining height */}
                  <div className="p-5 flex flex-col flex-1">

                    {/* ZONE 1 — Title: fixed 2-line height */}
                    <h3 className="text-sm font-bold text-gray-900 mb-2.5 line-clamp-2" style={{ minHeight: "2.75rem" }}>
                      {project.title}
                    </h3>

                    {/* ZONE 2 — Abstract: fixed 2-line height */}
                    <div
                      className="text-gray-500 text-xs mb-3 line-clamp-2"
                      style={{ minHeight: "2.5rem", lineHeight: "1.5" }}
                      dangerouslySetInnerHTML={{
                        __html: cleanHtml(
                          project.abstract
                            ? (project.abstract.length > 150
                              ? project.abstract.slice(0, 150) + "..."
                              : project.abstract)
                            : ""
                        ),
                      }}
                    />

                    {/* ZONE 3 — Author info: fixed 2-row height */}
                    <div className="space-y-1.5 mb-3" style={{ minHeight: "2.75rem" }}>
                      <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                        <User className="w-3.5 h-3.5 text-[#0158B7] flex-shrink-0" />
                        <span className="truncate">
                          {project.author?.first_name} {project.author?.last_name}
                        </span>
                      </div>
                      {project.author?.profile?.institution_name && (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-[#0158B7] flex-shrink-0" />
                          <span className="truncate">{project.author.profile.institution_name}</span>
                        </div>
                      )}
                    </div>

                    {/* ZONE 4 — Tags: fixed 1-row height, push to bottom via mt-auto */}
                    <div className="flex flex-wrap gap-1.5 mb-3" style={{ minHeight: "1.75rem" }}>
                      {project.tags?.slice(0, 3).map((tag: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 bg-[#0158B7]/8 text-[#0158B7] text-[11px] rounded-full font-medium border border-[#0158B7]/12">
                          {tag.name}
                        </span>
                      ))}
                      {project.tags?.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[11px] rounded-full font-medium">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>

                    {/* ZONE 5 — Stats: always pinned to bottom */}
                    <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
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
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="text-sm text-gray-500">
                  Showing {((currentPage - 1) * 12) + 1}–{Math.min(currentPage * 12, pagination.total)} of{" "}
                  <span className="font-semibold text-gray-900">{pagination.total}</span> projects
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                      let pageNum
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all ${
                            pageNum === currentPage
                              ? "bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white shadow-sm"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}