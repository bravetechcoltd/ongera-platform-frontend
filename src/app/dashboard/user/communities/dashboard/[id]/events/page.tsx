"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchCommunityEvents } from "@/lib/features/auth/eventsSlice"
import { Search, Filter, Calendar, Clock, MapPin, Video, Users, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react"

const EVENT_TYPES = ["All", "Webinar", "Conference", "Workshop", "Seminar", "Meetup"]
const EVENT_STATUSES = ["All", "Upcoming", "Ongoing", "Completed"]
const ITEMS_PER_PAGE = 12

export default function CommunityEventsPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const communityId = params.id as string

  const { communityEvents, isLoading, communityEventsPagination } = useAppSelector(state => state.events)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("All")
  const [selectedStatus, setSelectedStatus] = useState("All")
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityEvents({
        communityId,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        event_type: selectedType !== "All" ? selectedType : undefined,
        status: selectedStatus !== "All" ? selectedStatus : undefined
      }))
    }
  }, [communityId, currentPage, selectedType, selectedStatus, dispatch])

  const filteredEvents = communityEvents.filter(event =>
    searchQuery === "" ||
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("All")
    setSelectedStatus("All")
    setCurrentPage(1)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      Upcoming: "bg-blue-100 text-blue-700 border-blue-200",
      Ongoing: "bg-green-100 text-green-700 border-green-200",
      Completed: "bg-gray-100 text-gray-700 border-gray-200",
      Cancelled: "bg-red-100 text-red-700 border-red-200"
    }
    return colors[status as keyof typeof colors] || colors.Upcoming
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
                <Calendar className="w-7 h-7 text-emerald-600" />
                Community Events
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'} available
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
                placeholder="Search events by title or description..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg border-2 transition-all font-medium flex items-center gap-2 ${
                showFilters || selectedType !== "All" || selectedStatus !== "All"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {(selectedType !== "All" || selectedStatus !== "All") && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full" />
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
              {/* Event Type */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Event Type</h3>
                  {(selectedType !== "All" || selectedStatus !== "All") && (
                    <button
                      onClick={clearFilters}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {EVENT_TYPES.map(type => (
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

              {/* Event Status */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Status</h3>
                <div className="flex flex-wrap gap-2">
                  {EVENT_STATUSES.map(status => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status)
                        setCurrentPage(1)
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedStatus === status
                          ? "bg-blue-500 text-white shadow-sm"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active Filters */}
        {(searchQuery || selectedType !== "All" || selectedStatus !== "All") && (
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
            {selectedStatus !== "All" && (
              <span className="px-3 py-1 bg-purple-50 border border-purple-200 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                Status: {selectedStatus}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedStatus("All")} />
              </span>
            )}
          </div>
        )}

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading events...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedType !== "All" || selectedStatus !== "All"
                ? "Try adjusting your search or filters"
                : "No events in this community yet"}
            </p>
            {(searchQuery || selectedType !== "All" || selectedStatus !== "All") && (
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
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => router.push(`/dashboard/user/event/${event.id}`)}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                >
                  {/* Cover Image */}
                  <div className="h-40 bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                    {event.cover_image_url ? (
                      <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-blue-600/30" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <span className="px-2.5 py-1 bg-white rounded-full text-xs font-semibold text-gray-900 shadow-sm">
                        {event.event_type}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm border ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Details */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate">{formatDate(event.start_datetime)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                        <span>{formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}</span>
                      </div>
                      
                      {/* Location */}
                      {event.event_mode === 'Online' && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Video className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span>Online Event</span>
                        </div>
                      )}
                      {event.event_mode === 'Physical' && event.location_address && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span className="truncate">{event.location_address}</span>
                        </div>
                      )}
                      {event.event_mode === 'Hybrid' && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Video className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <MapPin className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <span>Hybrid Event</span>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees?.length || 0} attending</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        event.is_free 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {event.is_free ? 'Free' : `${event.price_amount}`}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {communityEventsPagination && communityEventsPagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: communityEventsPagination.totalPages }, (_, i) => i + 1).map(page => (
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
                  disabled={currentPage === communityEventsPagination.totalPages}
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