// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchMyCommunities } from "@/lib/features/auth/communitiesSlice"
import CommunityGrid from "@/components/communities/CommunityGrid"
import { Users, Plus, Loader2, ArrowLeft, AlertTriangle, Search, Filter, Eye, EyeOff, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

// Extract categories from communities data
const COMMUNITY_CATEGORIES = [
  "All Categories",
  "Health Sciences",
  "Technology & Engineering", 
  "Agriculture",
  "Natural Sciences",
  "Social Sciences",
  "Business & Economics",
  "Education",
  "Arts & Humanities"
]

export default function MyCommunitiesPage() {
  const dispatch = useAppDispatch()
  const { myCommunities, isLoading } = useAppSelector(state => state.communities)
  const { user: authUser } = useAppSelector((state) => state.auth)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [showFilters, setShowFilters] = useState(false)
  const [showInactive, setShowInactive] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    dispatch(fetchMyCommunities())
  }, [dispatch])

  // Filter communities based on search, category, and active status
  const filteredCommunities = myCommunities.filter(community => {
    const matchesSearch = searchQuery === "" || 
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory === "All Categories" || 
      community.category === selectedCategory
    
    const matchesActiveStatus = showInactive ? true : community.is_active
    
    return matchesSearch && matchesCategory && matchesActiveStatus
  })

  // Separate active and inactive communities from filtered results
  const activeCommunities = filteredCommunities.filter(c => c.is_active)
  const inactiveCommunities = filteredCommunities.filter(c => !c.is_active)

  // Pagination
  const totalItems = showInactive ? filteredCommunities.length : activeCommunities.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  const paginatedActiveCommunities = activeCommunities.slice(startIndex, endIndex)
  const paginatedInactiveCommunities = inactiveCommunities.slice(startIndex, endIndex)

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedCategory("All Categories")
    setCurrentPage(1)
  }

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/dashboard/user/communities"
              className="inline-flex items-center text-gray-600 hover:text-[#0158B7] text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to All Communities
            </Link>
          </div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <div className="p-1.5 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-lg">
              <Users className="w-4 h-4 text-white" />
            </div>
            My Communities
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {myCommunities.length} total: {myCommunities.filter(c => c.is_active).length} active, {myCommunities.filter(c => !c.is_active).length} inactive
          </p>
        </div>
        <Link
          href="/dashboard/user/communities/create"
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          <span>Create New</span>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3">
        <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder="Search my communities..."
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${
              showFilters || selectedCategory !== "All Categories"
                ? "bg-[#A8C8E8]/30 text-[#0158B7] border border-[#8DB6E1]"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {selectedCategory !== "All Categories" && (
              <span className="w-1.5 h-1.5 bg-[#0158B7] rounded-full" />
            )}
          </button>
        </form>

        {/* Toggle for showing/hiding inactive communities */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setShowInactive(!showInactive)
                setCurrentPage(1)
              }}
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
              ? `Showing ${filteredCommunities.length} of ${myCommunities.length}` 
              : `Showing ${activeCommunities.length} active`
            }
          </p>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Categories</h3>
              {selectedCategory !== "All Categories" && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-[#0158B7] hover:text-[#0362C3] font-medium"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMUNITY_CATEGORIES.map(category => (
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

      {/* Active Filters Display */}
      {(searchQuery || selectedCategory !== "All Categories") && (
        <div className="flex items-center justify-between p-2 bg-[#A8C8E8]/20 border border-[#8DB6E1] rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0158B7]">
              Found {filteredCommunities.length} communities
            </span>
            {searchQuery && (
              <span className="px-2 py-0.5 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                Search: "{searchQuery}"
              </span>
            )}
            {selectedCategory !== "All Categories" && (
              <span className="px-2 py-0.5 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                Category: {selectedCategory}
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

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
        </div>
      ) : myCommunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No communities yet</h3>
          <p className="text-sm text-gray-600 mb-4">Join existing communities or create your own</p>
          <div className="flex items-center justify-center space-x-2">
            <Link
              href="/dashboard/user/communities"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors text-sm font-medium"
            >
              Browse Communities
            </Link>
            <Link
              href="/dashboard/user/communities/create"
              className="px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0362C3] transition-colors text-sm font-medium"
            >
              Create Community
            </Link>
          </div>
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No communities found</h3>
          <p className="text-sm text-gray-600 mb-4">Try adjusting your search or filters</p>
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0362C3] transition-colors text-sm font-medium"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Communities Section */}
          {paginatedActiveCommunities.length > 0 && (
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
              <CommunityGrid communities={paginatedActiveCommunities} />
            </div>
          )}

          {/* Inactive Communities Section */}
          {showInactive && paginatedInactiveCommunities.length > 0 && (
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
              <CommunityGrid communities={paginatedInactiveCommunities} />
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-gray-600">
                Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} communities
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
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
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
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}