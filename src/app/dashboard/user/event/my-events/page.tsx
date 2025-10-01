// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchMyEvents, unregisterFromEvent } from "@/lib/features/auth/eventsSlice"
import {
  Calendar, MapPin, Video, Clock, Loader2, X, Eye,
  CheckCircle, AlertCircle, XCircle, Users
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function MyEventsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { myEvents, isLoading, isSubmitting } = useAppSelector(state => state.events)
  
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [eventToCancel, setEventToCancel] = useState<string | null>(null)

  useEffect(() => {
    dispatch(fetchMyEvents())
  }, [dispatch])

  const handleUnregister = async () => {
    if (!eventToCancel) return
    
    try {
      await dispatch(unregisterFromEvent(eventToCancel)).unwrap()
      toast.success("Registration cancelled successfully!")
      setShowCancelModal(false)
      setEventToCancel(null)
    } catch (err: any) {
      toast.error(err || "Failed to cancel registration")
    }
  }

  const filteredEvents = myEvents.filter(event => {
    const eventDate = new Date(event.start_datetime)
    const now = new Date()
    
    if (filter === 'upcoming') return eventDate > now
    if (filter === 'past') return eventDate < now
    return true
  })

  const getStatusBadge = (status: string) => {
    const badges = {
      Upcoming: { bg: 'bg-[#A8C8E8]', text: 'text-[#0158B7]', icon: Clock },
      Ongoing: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      Completed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
      Cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle }
    }
    const config = badges[status as keyof typeof badges] || badges.Upcoming
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-0.5" />
        {status}
      </span>
    )
  }

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
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
              My Registered Events
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Events you're attending: <span className="font-semibold text-[#0158B7]">{myEvents.length}</span>
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-1.5">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              <span className="ml-1.5 text-[10px] opacity-75">
                ({f === 'all' ? myEvents.length : filteredEvents.length})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {filter === 'all' ? 'No registered events' : `No ${filter} events`}
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {filter === 'all' 
              ? 'Start exploring and register for events'
              : `You have no ${filter} events at the moment`}
          </p>
          <Link
            href="/dashboard/user/event"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
          >
            <Calendar className="w-4 h-4" />
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEvents.map((event) => {
            const { time, date } = formatEventTime(event.start_datetime)
            
            return (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all overflow-hidden group">
                {/* Card Header with Gradient */}
                <div className="bg-[#0158B7] from-[#0158B7] to-[#5E96D2] p-3 text-white relative">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-tight line-clamp-2 group-hover:text-white/90 transition-colors">
                        {event.title}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 ml-2 text-right">
                      <div className="text-xs font-semibold opacity-90">{date}</div>
                      <div className="text-[10px] opacity-75">{time}</div>
                    </div>
                  </div>
                  
                  {/* Status & Type Badges */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {getStatusBadge(event.status)}
                    <span className="px-1.5 py-0.5 bg-white text-[#0158B7] rounded text-[10px] font-medium backdrop-blur-sm">
                      {event.event_type}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3 space-y-2">
                  {/* Event Details */}
                  <div className="space-y-1.5">
                    {/* Location/Online */}
                    {event.event_mode === 'Online' ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Video className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">Online Event</span>
                      </div>
                    ) : event.location_address ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{event.location_address}</span>
                      </div>
                    ) : null}

                    {/* Attendees */}
                    <div className="flex items-center gap-1.5 text-xs text-gray-600">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{event.attendees?.length || 0} attending</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Link
                      href={`/dashboard/user/event/${event.id}`}
                      className="flex-1 px-2.5 py-1.5 bg-[#A8C8E8]/30 text-[#0158B7] rounded-lg hover:bg-[#8DB6E1]/50 transition-colors text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                    
                    {event.status === 'Upcoming' && (
                      <button
                        onClick={() => {
                          setEventToCancel(event.id)
                          setShowCancelModal(true)
                        }}
                        disabled={isSubmitting}
                        className="flex-1 px-2.5 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && eventToCancel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-xl p-4 max-w-sm w-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Cancel Registration</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel your registration for this event? You can register again later if needed.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setShowCancelModal(false)
                  setEventToCancel(null)
                }}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                Keep Registration
              </button>
              <button
                onClick={handleUnregister}
                disabled={isSubmitting}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-3.5 h-3.5" />
                    Cancel
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}