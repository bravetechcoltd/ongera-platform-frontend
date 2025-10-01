"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchCommunities } from "@/lib/features/auth/communitiesSlice"
import CommunityGrid from "@/components/communities/CommunityGrid"
import CommunityFilters from "@/components/communities/CommunityFilters"
import { Search, Plus, Loader2, Filter, AlertTriangle, Eye, EyeOff, ChevronLeft, ChevronRight, Users } from "lucide-react"
import Link from "next/link"

export default function CommunitiesPage() {
  const dispatch = useAppDispatch()
  const { communities, isLoading, pagination } = useAppSelector(state => state.communities)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [showInactive, setShowInactive] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchCommunities({
      page: currentPage,
      limit: 12,
      search: searchQuery || undefined,
      category: selectedCategory || undefined
    }))
  }, [dispatch, searchQuery, selectedCategory, currentPage])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    dispatch(fetchCommunities({
      page: 1,
      limit: 12,
      search: searchQuery || undefined,
      category: selectedCategory || undefined
    }))
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Separate active and inactive communities
  const activeCommunities = communities.filter(c => c.is_active)
  const inactiveCommunities = communities.filter(c => !c.is_active)
  
  // Filter communities based on showInactive toggle
  const displayedCommunities = showInactive ? communities : activeCommunities

  return (
    <div className="p-3 space-y-3">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            Research Communities
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Connect with {pagination.total} communities across various research fields
            {inactiveCommunities.length > 0 && (
              <span className="ml-1 text-orange-600 font-medium">
                ({inactiveCommunities.length} deactivated)
              </span>
            )}
          </p>
        </div>
        <Link
          href="/dashboard/user/communities/create"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Create Community</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search communities by name or description..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${
              showFilters || selectedCategory
                ? "bg-[#A8C8E8]/30 text-[#0158B7] border border-[#8DB6E1]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {selectedCategory && (
              <span className="w-1.5 h-1.5 bg-[#0158B7] rounded-full" />
            )}
          </button>
          <button
            type="submit"
            className="px-4 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
          >
            Search
          </button>
        </form>

        {/* Toggle for showing/hiding inactive communities */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg font-medium transition-all text-sm ${
                showInactive
                  ? "bg-[#A8C8E8]/30 text-[#0158B7] border border-[#8DB6E1]"
                  : "bg-gray-100 text-gray-600 border border-gray-300"
              }`}
            >
              {showInactive ? (
                <>
                  <Eye className="w-4 h-4" />
                  <span>Showing All</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  <span>Active Only</span>
                </>
              )}
            </button>
            
            {inactiveCommunities.length > 0 && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertTriangle className="w-3 h-3 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">
                  {inactiveCommunities.length} deactivated
                </span>
              </div>
            )}
          </div>
          
          <p className="text-xs text-gray-500">
            {showInactive 
              ? `Showing ${displayedCommunities.length} of ${pagination.total}` 
              : `Showing ${activeCommunities.length} active`
            }
          </p>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <CommunityFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onClear={() => {
              setSelectedCategory("")
              setSearchQuery("")
              setCurrentPage(1)
            }}
          />
        )}
      </div>

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory) && (
        <div className="flex items-center justify-between p-2 bg-[#A8C8E8]/20 border border-[#8DB6E1] rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0158B7]">
              Found {pagination.total} communities
            </span>
            {selectedCategory && (
              <span className="px-2 py-0.5 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                {selectedCategory}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              setSelectedCategory("")
              setSearchQuery("")
              setCurrentPage(1)
            }}
            className="text-xs font-medium text-[#0158B7] hover:text-[#0362C3]"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Communities Grid */}
      {isLoading && communities.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading communities...</p>
          </div>
        </div>
      ) : displayedCommunities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">
            {showInactive ? 'No communities found' : 'No active communities found'}
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {showInactive 
              ? 'Try adjusting your search or filters' 
              : 'Try enabling "Show All Communities" to see deactivated ones'
            }
          </p>
          <Link
            href="/dashboard/user/communities/create"
            className="inline-flex items-center space-x-1 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0362C3] transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Create the First One</span>
          </Link>
        </div>
      ) : (
        <>
          {/* Show communities in sections if showing all and there are inactive ones */}
          {showInactive && inactiveCommunities.length > 0 ? (
            <div className="space-y-4">
              {/* Active Communities Section */}
              {activeCommunities.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-gray-900">
                      Active Communities ({activeCommunities.length})
                    </h2>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 border border-green-200 rounded-lg">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs font-medium text-green-700">Available</span>
                    </div>
                  </div>
                  <CommunityGrid communities={activeCommunities} />
                </div>
              )}

              {/* Inactive Communities Section */}
              {inactiveCommunities.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-base font-bold text-gray-900">
                      Deactivated Communities ({inactiveCommunities.length})
                    </h2>
                    <div className="flex items-center space-x-1 px-2 py-1 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="w-3 h-3 text-orange-600" />
                      <span className="text-xs font-medium text-orange-700">Inactive</span>
                    </div>
                  </div>
                  <CommunityGrid communities={inactiveCommunities} />
                </div>
              )}
            </div>
          ) : (
            // Show single grid if filtering to active only or no inactive communities
            <CommunityGrid communities={displayedCommunities} />
          )}
          
          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} communities
              </div>

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
    </div>
  )
}