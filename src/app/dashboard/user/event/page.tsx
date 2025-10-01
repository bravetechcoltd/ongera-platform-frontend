"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchEvents, registerForEvent } from "@/lib/features/auth/eventsSlice"
import {
  Calendar, MapPin, Users, Video, Clock, Search, Filter,
  Loader2, Plus, Globe, DollarSign, CheckCircle, X,
  Eye
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

type EventTypeFilter = 'all' | 'Webinar' | 'Conference' | 'Workshop' | 'Seminar' | 'Meetup'
type EventModeFilter = 'all' | 'Online' | 'Physical' | 'Hybrid'

export default function BrowseEventsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { events, isLoading, isSubmitting, error, pagination } = useAppSelector(state => state.events)
  const { user: authUser } = useAppSelector(state => state.auth)

  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('all')
  const [modeFilter, setModeFilter] = useState<EventModeFilter>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [typeFilter, modeFilter])

  const loadEvents = () => {
    const params: any = { page: 1, limit: 12 }
    if (typeFilter !== 'all') params.event_type = typeFilter
    if (searchQuery) params.search = searchQuery
    dispatch(fetchEvents(params))
  }

  const handleSearch = () => {
    loadEvents()
  }

  // ✅ Check if user is already registered for an event
  const isUserRegisteredForEvent = (event: any) => {
    if (!authUser || !event.attendees) return false
    
    // Check if logged-in user is in the attendees list
    return event.attendees.some((attendee: any) => 
      attendee.user && attendee.user.id === authUser.id
    )
  }

  const handleRegister = async (eventId: string) => {
    try {
      if (!authUser) {
        toast.error("You must be logged in to register for an event")
        router.push("/login")
        return
      }

      // ✅ Find the event to check if already registered
      const event = events.find(e => e.id === eventId)
      if (event && isUserRegisteredForEvent(event)) {
        toast.error("You are already registered for this event")
        return
      }

      const payload = {
        eventId,
        attendeeData: {
          event_id: eventId,
          user_id: authUser.id,
          user_email: authUser.email,
          user_name: `${authUser.first_name} ${authUser.last_name}`,
          additional_notes: null,
          dietary_requirements: null,
          special_accommodations: null
        }
      }

      await dispatch(registerForEvent(payload)).unwrap()
      toast.success("Registered successfully!")
      loadEvents()
    } catch (err: any) {
      toast.error(err || "Failed to register")
    }
  }

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

  const canCreateEvent = () => {
    return authUser && ['Researcher', 'Institution'].includes(authUser.account_type)
  }

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="p-1.5 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Browse Events
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">Discover and join research events</p>
          </div>
          {canCreateEvent() && (
            <Link
              href="/dashboard/user/event/create"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Create Event
            </Link>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col lg:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-1.5"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Filter Tags */}
        {showFilters && (
          <div className="mt-2 p-2 bg-gray-50 rounded-lg space-y-2">
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Event Type</label>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'Webinar', 'Conference', 'Workshop', 'Seminar', 'Meetup'] as EventTypeFilter[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      typeFilter === type
                        ? 'bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#5E96D2]'
                    }`}
                  >
                    {type === 'all' ? 'All Types' : type}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-1 block">Event Mode</label>
              <div className="flex flex-wrap gap-1.5">
                {(['all', 'Online', 'Physical', 'Hybrid'] as EventModeFilter[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setModeFilter(mode)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                      modeFilter === mode
                        ? 'bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white shadow-lg'
                        : 'bg-white border border-gray-200 text-gray-700 hover:border-[#5E96D2]'
                    }`}
                  >
                    {mode === 'all' ? 'All Modes' : mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No events found</h3>
          <p className="text-gray-600 text-sm">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {events.map((event) => {
            const isRegistered = isUserRegisteredForEvent(event)
            
            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group">
                {/* Cover Image */}
                <div className="relative h-32 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] overflow-hidden">
                  {event.cover_image_url ? (
                    <img
                      src={event.cover_image_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <Calendar className="w-12 h-12 opacity-50" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${getEventTypeColor(event.event_type)}`}>
                      {event.event_type}
                    </span>
                    {/* ✅ Show "Registered" badge if user is already registered */}
                    {isRegistered && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 flex items-center gap-0.5">
                        <CheckCircle className="w-3 h-3" />
                        Registered
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-3">
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5 line-clamp-2 hover:text-[#0158B7] cursor-pointer">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{event.description}</p>

                  {/* Event Details */}
                  <div className="space-y-1.5 mb-2">
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(event.start_datetime).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(event.start_datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    {event.event_mode === 'Online' && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Video className="w-3 h-3" />
                        <span>Online Event</span>
                      </div>
                    )}
                    
                    {event.event_mode === 'Physical' && event.location_address && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3 h-3" />
                        <span className="truncate">{event.location_address}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Users className="w-3 h-3" />
                      <span>{event.attendees?.length || 0} attending</span>
                      {event.max_attendees && (
                        <span>/ {event.max_attendees} max</span>
                      )}
                    </div>

                    {!event.is_free && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                        <DollarSign className="w-3 h-3" />
                        <span>${event.price_amount}</span>
                      </div>
                    )}
                  </div>

                  {/* Organizer */}
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-gray-100">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white text-[10px] font-semibold">
                      {event.organizer.first_name.charAt(0)}
                    </div>
                    <span className="text-xs text-gray-700">
                      {event.organizer.first_name} {event.organizer.last_name}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5">
                    <Link
                      href={`/dashboard/user/event/${event.id}`}
                      className="flex-1 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs font-medium text-center flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Details
                    </Link>
                    
                    {/* ✅ Conditional Register Button */}
                    {isRegistered ? (
                      <button
                        disabled
                        className="flex-1 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold cursor-not-allowed flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Already Registered
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(event.id)}
                        disabled={isSubmitting}
                        className="flex-1 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-xs font-semibold disabled:opacity-50"
                      >
                        Register
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => dispatch(fetchEvents({ page: pagination.page - 1 }))}
            disabled={pagination.page === 1}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => dispatch(fetchEvents({ page: pagination.page + 1 }))}
            disabled={pagination.page === pagination.totalPages}
            className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}