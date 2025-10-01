// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchEventById, registerForEvent, unregisterFromEvent } from "@/lib/features/auth/eventsSlice"
import {
  ArrowLeft, Calendar, MapPin, Users, Video, Clock, Globe,
  DollarSign, User, Share2, CheckCircle, X, Loader2,
  FileText, Mail, Phone, ExternalLink, BookOpen, MessageSquare
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

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { currentEvent, isLoading, isSubmitting } = useSelector((state: RootState) => state.events)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    if (params.id) {
      dispatch(fetchEventById(params.id))
    }
  }, [dispatch, params.id])

  useEffect(() => {
    if (currentEvent && user) {
      const registered = currentEvent.attendees?.some(
        (attendee: any) => attendee.user_id === user.id
      )
      setIsRegistered(!!registered)
    }
  }, [currentEvent, user])

  const handleRegister = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (currentEvent?.id && user) {
      await dispatch(registerForEvent({
        eventId: currentEvent.id,
        attendeeData: {
          event_id: currentEvent.id,
          user_id: user.id,
          user_email: user.email,
          user_name: `${user.first_name} ${user.last_name}`,
          additional_notes: null,
          dietary_requirements: null,
          special_accommodations: null
        }
      }))
      setIsRegistered(true)
    }
  }

  const handleUnregister = async () => {
    if (!currentEvent?.id) return
    if (confirm("Are you sure you want to cancel your registration?")) {
      await dispatch(unregisterFromEvent(currentEvent.id))
      setIsRegistered(false)
    }
  }

  const formatDate = (dateString: any) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: any) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (isLoading && !currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
        <SharedNavigation />
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-8 space-y-6">
          <SkeletonLoader className="h-12 w-48" />
          <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
            <SkeletonLoader className="h-80" />
            <SkeletonLoader className="h-8 w-3/4" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
        <SharedNavigation />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h3>
            <Link
              href="/events"
              className="text-[#0158B7] hover:text-[#0362C3] font-medium"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const event = currentEvent

  const getStatusBadge = () => {
    const statusConfig = {
      Upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      Ongoing: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      Completed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
      Cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: X }
    }
    const config = statusConfig[event.status as keyof typeof statusConfig] || statusConfig.Upcoming
    const Icon = config.icon
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {event.status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      <SharedNavigation />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-[#0158B7] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Events</span>
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          {/* Cover Image */}
          <div className="relative h-80 bg-gradient-to-br from-[#0158B7] to-[#0362C3]">
            {event.cover_image_url ? (
              <img
                src={event.cover_image_url}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="w-24 h-24 text-white opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-sm font-bold text-[#0158B7]">
                {event.event_type}
              </span>
              {getStatusBadge()}
            </div>

            {event.is_featured && (
              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-full text-sm font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Featured Event
                </span>
              </div>
            )}
          </div>

          {/* Event Info */}
          <div className="p-8">
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">{formatDate(event.start_datetime)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">
                    {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">{event.attendees?.length || 0}</span>
                  {event.max_attendees && <span className="ml-1">/ {event.max_attendees} attendees</span>}
                </div>
              </div>
            </div>

            {/* Organizer Info */}
            <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {event.organizer?.first_name?.[0]}{event.organizer?.last_name?.[0]}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {event.organizer?.first_name} {event.organizer?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{event.organizer?.account_type}</p>
                </div>
              </div>

              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center gap-2 justify-end mb-1">
                  <Globe className="w-4 h-4" />
                  <span>{event.timezone}</span>
                </div>
                <p className="text-[#0158B7] font-semibold">{event.event_mode}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {event.description}
              </p>
            </div>

            {/* Location/Meeting Info */}
            {event.event_mode === 'Online' && event.online_meeting_url && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Online Meeting Details
                </h3>
                {isRegistered ? (
                  <div className="space-y-2">
                    <a
                      href={event.online_meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                    >
                      Join Meeting <ExternalLink className="w-4 h-4" />
                    </a>
                    {event.meeting_id && (
                      <p className="text-sm text-blue-700">
                        Meeting ID: <span className="font-mono font-bold">{event.meeting_id}</span>
                      </p>
                    )}
                    {event.meeting_password && (
                      <p className="text-sm text-blue-700">
                        Password: <span className="font-mono font-bold">{event.meeting_password}</span>
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-blue-700">
                    Meeting details will be available after registration
                  </p>
                )}
              </div>
            )}

            {event.event_mode === 'Physical' && event.location_address && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Event Location
                </h3>
                <p className="text-green-700">{event.location_address}</p>
              </div>
            )}

            {event.event_mode === 'Hybrid' && (
              <div className="mb-6 space-y-3">
                {event.location_address && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Physical Location
                    </h3>
                    <p className="text-green-700">{event.location_address}</p>
                  </div>
                )}
                {event.online_meeting_url && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <Video className="w-5 h-5" />
                      Online Option
                    </h3>
                    {isRegistered ? (
                      <a
                        href={event.online_meeting_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-700 hover:text-blue-900 font-medium flex items-center gap-1"
                      >
                        Join Virtual Room <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <p className="text-sm text-blue-700">
                        Virtual meeting details available after registration
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Agenda Items */}
            {event.agenda_items && event.agenda_items.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Event Agenda</h2>
                <div className="space-y-3">
                  {event.agenda_items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="text-sm font-bold text-gray-600 min-w-[100px]">
                        {item.start_time} - {item.end_time}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{item.session_title}</h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        {item.speaker_name && (
                          <p className="text-sm text-gray-500">Speaker: {item.speaker_name}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Projects */}
            {event.linked_projects && event.linked_projects.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#0158B7]" />
                  Related Research Projects
                </h2>
                <div className="space-y-2">
                  {event.linked_projects.map((project: any) => (
                    <Link
                      key={project.id}
                      href={`/research-projects/${project.id}`}
                      className="block p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                    >
                      <h3 className="font-bold text-gray-900 hover:text-[#0158B7]">
                        {project.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Registration Info */}
            {!event.is_free && (
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-green-900">Registration Fee</h3>
                </div>
                <p className="text-2xl font-bold text-green-700">${event.price_amount}</p>
              </div>
            )}

            {event.is_free && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <p className="font-bold text-blue-900">Free Event - No Registration Fee</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              
                <div className="w-full bg-gradient-to-r from-[#A8C8E8]/20 to-[#8DB6E1]/20 border border-[#8DB6E1] rounded-xl p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Sign in to Join this event
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Join our community and never miss important research events
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Sign In to Join
                  </Link>
                </div>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}