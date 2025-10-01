"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchCommunityProjects, clearCommunityProjects, setCurrentCommunityId } from "@/lib/features/auth/projectSlice"
import { Search, Filter, Briefcase, Eye, Users, Calendar, ChevronLeft, ChevronRight, Loader2, BookOpen, X } from "lucide-react"

const RESEARCH_TYPES = ["All", "Thesis", "Paper", "Project", "Dataset", "Case Study"]
const ITEMS_PER_PAGE = 12

export default function CommunityResearchProjects() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const communityId = params.id as string

  const { communityProjects, isLoading, communityProjectsPagination, currentCommunityId } = useAppSelector(state => state.projects)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (communityId) {
      // Set current community ID in Redux
      dispatch(setCurrentCommunityId(communityId))
      
      dispatch(fetchCommunityProjects({
        communityId,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        research_type: selectedType !== "All" ? selectedType : undefined
      }))
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(clearCommunityProjects())
    }
  }, [communityId, currentPage, selectedType, dispatch])

  const filteredProjects = communityProjects.filter(project =>
    searchQuery === "" ||
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.field_of_study?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("All")
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-600 hover:text-emerald-600 transition-colors font-medium mb-3 group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to Community
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Briefcase className="w-7 h-7 text-emerald-600" />
                Research Projects
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} available
              </p>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects by title, abstract, or field..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border-2 transition-all font-medium flex items-center gap-2 ${
                showFilters || selectedType !== "All"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {selectedType !== "All" && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">Research Type</h3>
                {selectedType !== "All" && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {RESEARCH_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setSelectedType(type)
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedType === type
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedType !== "All") && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-600 font-medium">Active filters:</span>
            {searchQuery && (
              <span className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-medium flex items-center gap-1">
                Search: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
              </span>
            )}
            {selectedType !== "All" && (
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-medium flex items-center gap-1">
                Type: {selectedType}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType("All")} />
              </span>
            )}
          </div>
        )}

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading projects...</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedType !== "All"
                ? "Try adjusting your search or filters"
                : "No research projects in this community yet"}
            </p>
            {(searchQuery || selectedType !== "All") && (
              <button
                onClick={clearFilters}
                className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredProjects.map(project => (
                <div
                  key={project.id}
                  onClick={() => router.push(`/dashboard/user/research/${project.id}`)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Cover Image */}
                  <div className="h-40 bg-gradient-to-br from-emerald-100 to-teal-100 relative overflow-hidden">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-12 h-12 text-emerald-600/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-emerald-500 text-white rounded-full text-xs font-semibold shadow-sm">
                      {project.research_type}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.abstract}
                    </p>

                    {/* Field */}
                    {project.field_of_study && (
                      <div className="mb-3">
                        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                          {project.field_of_study}
                        </span>
                      </div>
                    )}

                    {/* Tags */}
                    {project.tags && project.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {project.tags.slice(0, 3).map((tag, idx) => {
                          const label = typeof tag === "string" ? tag : (tag && "name" in tag ? tag.name : String(tag));
                          return (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              #{label}
                            </span>
                          );
                        })}
                        {project.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-semibold">
                            +{project.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                          {project.author?.first_name?.[0] || 'U'}
                        </div>
                        <span className="text-xs text-gray-600 truncate max-w-[120px]">
                          {project.author?.first_name} {project.author?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {project.view_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {communityProjectsPagination && communityProjectsPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: communityProjectsPagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      page === currentPage
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === communityProjectsPagination.totalPages}
                  className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}