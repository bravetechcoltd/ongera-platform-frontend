// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchEvents } from "@/lib/features/auth/eventsSlice"
import {
  Calendar, MapPin, Users, Video, Clock, Search, Filter,
  Loader2, ChevronLeft, ChevronRight, Globe, DollarSign,
  User, Eye, CheckCircle
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

export default function EventsPage() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { events, isLoading, pagination } = useSelector((state: RootState) => state.events)
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedMode, setSelectedMode] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("Upcoming")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    dispatch(fetchEvents({
      page: currentPage,
      limit: 12,
      search: searchQuery || undefined,
      event_type: selectedType || undefined,
      status: selectedStatus || undefined
    }))
  }, [dispatch, currentPage, searchQuery, selectedType, selectedStatus])

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

  const formatTime = (dateString: any) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const eventTypes = ["Webinar", "Conference", "Workshop", "Seminar", "Meetup"]
  const eventModes = ["Online", "Physical", "Hybrid"]
  const eventStatuses = ["Upcoming", "Ongoing", "Completed"]

  const getEventTypeColor = (type: string) => {
    const colors = {
      Webinar: 'bg-[#A8C8E8]/30 text-[#0158B7]',
      Conference: 'bg-[#5E96D2]/30 text-[#0158B7]',
      Workshop: 'bg-[#8DB6E1]/30 text-[#0158B7]',
      Seminar: 'bg-[#A8C8E8]/40 text-[#0158B7]',
      Meetup: 'bg-[#5E96D2]/40 text-[#0158B7]'
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
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                Events
              </h1>
              <p className="text-sm text-gray-600 mt-2">
                Discover and join research events from Rwanda's academic community
                {pagination?.total > 0 && (
                  <span className="ml-2 font-semibold text-[#0158B7]">
                    ({pagination.total} events)
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
                  placeholder="Search events by title, organizer, or location..."
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                  showFilters || selectedType || selectedMode
                    ? "bg-[#A8C8E8]/30 text-[#0158B7] border border-[#8DB6E1]"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-5 h-5" />
                <span>Filters</span>
                {(selectedType || selectedMode) && (
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
                    Event Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedType("")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        !selectedType
                          ? "bg-[#0158B7] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Types
                    </button>
                    {eventTypes.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          selectedType === type
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
                    Event Mode
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setSelectedMode("")}
                      className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                        !selectedMode
                          ? "bg-[#0158B7] text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      All Modes
                    </button>
                    {eventModes.map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setSelectedMode(mode)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          selectedMode === mode
                            ? "bg-[#0158B7] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {eventStatuses.map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
                          selectedStatus === status
                            ? "bg-[#0158B7] text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedType("")
                      setSelectedMode("")
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
          {(searchQuery || selectedType || selectedMode) && (
            <div className="flex items-center justify-between p-3 bg-[#A8C8E8]/20 border border-[#8DB6E1] rounded-lg mt-4">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#0158B7]">
                  {pagination?.total || 0} events found
                </span>
                {selectedType && (
                  <span className="px-3 py-1 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                    {selectedType}
                  </span>
                )}
                {selectedMode && (
                  <span className="px-3 py-1 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                    {selectedMode}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Events Grid */}
        {isLoading && events.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No events found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || selectedType || selectedMode
                ? "Try adjusting your search or filters"
                : "Check back soon for upcoming events"}
            </p>
            {!isAuthenticated && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Sign in to create and manage events
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
              {events.map((event) => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/events/${event.id}`)}
                  className="bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:scale-[1.02] duration-300"
                >
                  {/* Event Cover */}
                  <div className="h-48 bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center relative overflow-hidden">
                    {event.cover_image_url ? (
                      <img
                        src={event.cover_image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Calendar className="w-16 h-16 text-white opacity-30" />
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getEventTypeColor(event.event_type)}`}>
                        {event.event_type}
                      </span>
                    </div>
                    {event.is_featured && (
                      <div className="absolute top-3 left-3">
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-[#1A1F3A] mb-3 line-clamp-2 min-h-[3rem]">
                      {event.title}
                    </h3>

                    <div className="space-y-2 mb-4 text-xs">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2 text-[#0158B7] flex-shrink-0" />
                        <span>{formatDate(event.start_datetime)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-[#0158B7] flex-shrink-0" />
                        <span>
                          {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                        </span>
                      </div>
                      {event.event_mode === 'Online' && (
                        <div className="flex items-center text-gray-600">
                          <Video className="w-4 h-4 mr-2 text-[#0158B7] flex-shrink-0" />
                          <span>Online Event</span>
                        </div>
                      )}
                      {event.event_mode === 'Physical' && event.location_address && (
                        <div className="flex items-center text-gray-600">
                          <MapPin className="w-4 h-4 mr-2 text-[#0158B7] flex-shrink-0" />
                          <span className="truncate">{event.location_address}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <User className="w-4 h-4 mr-2 text-[#0158B7] flex-shrink-0" />
                        <span className="truncate">
                          {event.organizer?.first_name} {event.organizer?.last_name}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {event.attendees?.length || 0}
                        </span>
                        {!event.is_free && (
                          <span className="flex items-center text-green-600 font-semibold">
                            <DollarSign className="w-4 h-4 mr-0.5" />
                            {event.price_amount}
                          </span>
                        )}
                        {event.is_free && (
                          <span className="text-green-600 font-semibold">Free</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 bg-white rounded-xl border border-gray-200 p-4">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * 12) + 1} to {Math.min(currentPage * 12, pagination.total)} of {pagination.total} events
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