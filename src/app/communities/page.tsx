// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchCommunities } from "@/lib/features/auth/communitiesSlice"
import {
  Users, Search, Filter, Loader2, ChevronLeft, ChevronRight,
  Globe, Lock, Building, Eye, MessageSquare, Calendar, CheckCircle
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

function CardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-md rounded-xl p-4 border border-gray-200">
      <SkeletonLoader className="h-40 mb-3" />
      <SkeletonLoader className="h-5 mb-2 w-3/4" />
      <SkeletonLoader className="h-3 mb-2 w-full" />
      <SkeletonLoader className="h-3 w-2/3" />
    </div>
  )
}

export default function CommunitiesPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { communities, isLoading, pagination } = useSelector((state: RootState) => state.communities)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchCommunities({
      page: currentPage,
      limit: 12,
      search: searchQuery || undefined,
      category: selectedCategory || undefined
    }))
  }, [dispatch, currentPage, searchQuery, selectedCategory])

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

  const categories = [
    "Health & Medicine",
    "Technology & Innovation",
    "Agriculture & Environment",
    "Education",
    "Social Sciences",
    "Engineering",
    "Business & Economics",
    "Arts & Humanities"
  ]

  const getCommunityTypeIcon = (type: string) => {
    switch (type) {
      case "Public":
        return Globe
      case "Private":
        return Lock
      case "Institution-Specific":
        return Building
      default:
        return Users
    }
  }

  const getCommunityTypeColor = (type: string) => {
    const colors = {
      Public: 'bg-green-100 text-green-700',
      Private: 'bg-orange-100 text-orange-700',
      'Institution-Specific': 'bg-blue-100 text-blue-700'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      <SharedNavigation />
      
      <div className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Communities
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Connect with research communities across Rwanda
                {pagination?.total > 0 && (
                  <span className="ml-2 font-semibold text-[#0158B7]">
                    ({pagination.total} communities)
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search communities by name or description..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  showFilters || selectedCategory
                    ? "bg-[#A8C8E8]/30 text-[#0158B7] border border-[#8DB6E1]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {selectedCategory && (
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

            {/* Filters Panel */}
            {showFilters && (
              <div className="pt-4 border-t border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Category
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        !selectedCategory
                          ? "bg-[#0158B7] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          selectedCategory === category
                            ? "bg-[#0158B7] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedCategory("")
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

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory) && (
            <div className="flex items-center justify-between p-3 bg-[#A8C8E8]/20 border border-[#8DB6E1] rounded-lg mt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#0158B7]">
                  {pagination?.total || 0} communities found
                </span>
                {selectedCategory && (
                  <span className="px-3 py-1 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                    {selectedCategory}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Communities Grid */}
        {isLoading && communities.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No communities found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedCategory
                ? "Try adjusting your search or filters"
                : "Be the first to create a research community"}
            </p>
            {!isAuthenticated && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Sign in to create and join communities
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {communities.map((community) => {
                const TypeIcon = getCommunityTypeIcon(community.community_type)
                
                return (
                  <div
                    key={community.id}
                    onClick={() => router.push(`/communities/${community.id}`)}
                    className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:scale-[1.02] duration-300"
                  >
                    {/* Top Image Section */}
                    <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-[#0158B7] to-[#0362C3]">
                      {community.cover_image_url ? (
                        <img
                          src={community.cover_image_url}
                          alt={community.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users className="w-16 h-16 text-white opacity-30" />
                        </div>
                      )}
                      
                      {/* Member Count Badge */}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {community.member_count || 0}
                      </div>

                      {/* Community Type Badge */}
                      <div className="absolute bottom-3 left-3">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${getCommunityTypeColor(community.community_type)} bg-white/90 backdrop-blur-sm`}>
                          <TypeIcon className="w-3 h-3" />
                          {community.community_type}
                        </span>
                      </div>

                      {/* Active Status */}
                      {community.is_active && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2 py-1 bg-green-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Content Section */}
                    <div className="p-5">
                      <h3 className="text-base font-bold text-[#1A1F3A] mb-2 line-clamp-2 min-h-[3rem]">
                        {community.name}
                      </h3>

                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {community.description || 'Join this community to connect with researchers'}
                      </p>

                      {/* Category Badge */}
                      {community.category && (
                        <div className="mb-3">
                          <span className="inline-block px-3 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-medium">
                            {community.category}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Created {formatDate(community.created_at)}</span>
                        </div>
                        <div className="flex items-center">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          <span>{community.post_count || 0} posts</span>
                        </div>
                      </div>

                      {/* Creator Info */}
                      {community.creator && (
                        <div className="pt-3 border-t border-gray-200 flex items-center gap-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {community.creator.first_name?.[0]}{community.creator.last_name?.[0]}
                          </div>
                          <span className="text-xs text-gray-600 truncate">
                            by {community.creator.first_name} {community.creator.last_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} communities
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
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
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
    </div>
  )
}