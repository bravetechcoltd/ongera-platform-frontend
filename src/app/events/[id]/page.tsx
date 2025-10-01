// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchEventById, registerForEvent, unregisterFromEvent } from "@/lib/features/auth/eventsSlice"
import {
  ArrowLeft, Calendar, MapPin, Users, Video, Clock, Globe,
  DollarSign, Share2, CheckCircle, X, Loader2,
  FileText, ExternalLink, BookOpen, ZoomIn
} from "lucide-react"
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
          animation: "shimmer 1.6s infinite",
          backgroundSize: "200% 100%",
        }}
      />
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  )
}

function ImagePreviewModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose])
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
      <img
        src={src} alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
        style={{ animation: "zoomIn 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      />
      <style>{`@keyframes zoomIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
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
  const [showImagePreview, setShowImagePreview] = useState(false)

  useEffect(() => {
    if (params.id) dispatch(fetchEventById(params.id))
  }, [dispatch, params.id])

  useEffect(() => {
    if (currentEvent && user) {
      setIsRegistered(!!currentEvent.attendees?.some((a: any) => a.user_id === user.id))
    }
  }, [currentEvent, user])

  const handleRegister = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
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
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  const formatTime = (dateString: any) => {
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const formatShortDate = (dateString: any) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  if (isLoading && !currentEvent) {
    return (
      <div className="min-h-screen bg-[#F4F6FA]">
        <SharedNavigation />
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-6">
          <SkeletonLoader className="h-10 w-36" />
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-8 space-y-6">
            <SkeletonLoader className="h-96 rounded-xl" />
            <SkeletonLoader className="h-9 w-3/4" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-[#F4F6FA]">
        <SharedNavigation />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Event not found</h3>
            <p className="text-gray-500 text-sm mb-5">This event may have been cancelled or removed.</p>
            <Link href="/events" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0158B7] text-white rounded-lg font-medium text-sm hover:bg-[#0149a0] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const event = currentEvent

  const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
    Upcoming: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
    Ongoing: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
    Completed: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
    Cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  }
  const sc = statusConfig[event.status] || statusConfig.Upcoming

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <SharedNavigation />

      {showImagePreview && event.cover_image_url && (
        <ImagePreviewModal src={event.cover_image_url} alt={event.title} onClose={() => setShowImagePreview(false)} />
      )}

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Back */}
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0158B7] mb-6 transition-colors text-sm font-medium group">
          <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-[#0158B7]/30 group-hover:bg-[#0158B7]/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </span>
          Back to Events
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Hero Image */}
          <div className="relative h-[420px] bg-gradient-to-br from-[#0158B7] to-[#1e3a8a] group">
            {event.cover_image_url ? (
              <>
                <img
                  src={event.cover_image_url}
                  alt={event.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <button
                  onClick={() => setShowImagePreview(true)}
                  className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                  style={{ transition: "all 0.2s ease" }}
                >
                  <ZoomIn className="w-4 h-4" />
                  Preview Image
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="w-28 h-28 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-4 right-4 flex gap-2">
              {event.event_type && (
                <span className="px-3.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-bold text-[#0158B7] shadow-sm">
                  {event.event_type}
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm shadow-sm ${sc.text}`}>
                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                {event.status}
              </span>
            </div>

            {/* Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
              <div>
                {event.is_featured && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-white rounded-full text-xs font-bold mb-3 shadow-lg">
                    <CheckCircle className="w-3.5 h-3.5" /> Featured Event
                  </span>
                )}
                <h1 className="text-white text-2xl md:text-3xl font-bold max-w-2xl leading-snug" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                  {event.title}
                </h1>
              </div>
              {event.is_free ? (
                <div className="bg-emerald-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 flex-shrink-0 shadow-lg font-bold text-sm">
                  <CheckCircle className="w-4 h-4" /> Free Event
                </div>
              ) : event.price_amount && (
                <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center gap-1.5 flex-shrink-0">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-bold text-sm">{event.price_amount}</span>
                </div>
              )}
            </div>
          </div>

          {/* Key Info Bar */}
          <div className="flex flex-wrap items-center gap-4 px-6 py-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-[#0158B7] flex-shrink-0" />
              <span className="font-medium">{formatDate(event.start_datetime)}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="w-4 h-4 text-[#0158B7] flex-shrink-0" />
              <span className="font-medium">{formatTime(event.start_datetime)} – {formatTime(event.end_datetime)}</span>
            </div>
            <div className="w-px h-4 bg-gray-200" />
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Users className="w-4 h-4 text-[#0158B7] flex-shrink-0" />
              <span className="font-medium">{event.attendees?.length || 0}{event.max_attendees ? ` / ${event.max_attendees}` : ""} attendees</span>
            </div>
            {event.event_mode && (
              <>
                <div className="w-px h-4 bg-gray-200" />
                <span className="px-2.5 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-bold">{event.event_mode}</span>
              </>
            )}
          </div>

          <div className="p-8">
            {/* Organizer Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#0158B7]/5 to-blue-50/50 rounded-xl border border-[#0158B7]/10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0158B7] to-[#1e40af] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {event.organizer?.first_name?.[0]}{event.organizer?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">{event.organizer?.first_name} {event.organizer?.last_name}</p>
                  <p className="text-sm text-[#0158B7] font-medium">Event Organizer</p>
                  {event.organizer?.account_type && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.organizer.account_type}</p>
                  )}
                </div>
              </div>
              {event.timezone && (
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Globe className="w-4 h-4 text-[#0158B7]" />
                  <span>{event.timezone}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                <h2 className="text-lg font-bold text-gray-900">About This Event</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/60 rounded-xl p-5 border border-gray-100 text-sm">
                {event.description}
              </p>
            </section>

            {/* Location / Meeting Details */}
            {event.event_mode === 'Online' && event.online_meeting_url && (
              <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-sm">
                  <Video className="w-4 h-4" /> Online Meeting Details
                </h3>
                {isRegistered ? (
                  <div className="space-y-2">
                    <a href={event.online_meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-700 hover:text-blue-900 font-semibold text-sm">
                      Join Meeting <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {event.meeting_id && <p className="text-sm text-blue-700">Meeting ID: <span className="font-mono font-bold">{event.meeting_id}</span></p>}
                    {event.meeting_password && <p className="text-sm text-blue-700">Password: <span className="font-mono font-bold">{event.meeting_password}</span></p>}
                  </div>
                ) : (
                  <p className="text-sm text-blue-600">Meeting details will be available after registration.</p>
                )}
              </div>
            )}

            {event.event_mode === 'Physical' && event.location_address && (
              <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" /> Event Location
                </h3>
                <p className="text-emerald-700 text-sm">{event.location_address}</p>
              </div>
            )}

            {event.event_mode === 'Hybrid' && (
              <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {event.location_address && (
                  <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <h3 className="font-bold text-emerald-900 mb-2 flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4" /> Physical Location
                    </h3>
                    <p className="text-emerald-700 text-sm">{event.location_address}</p>
                  </div>
                )}
                {event.online_meeting_url && (
                  <div className="p-5 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                      <Video className="w-4 h-4" /> Virtual Option
                    </h3>
                    {isRegistered ? (
                      <a href={event.online_meeting_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-700 font-semibold text-sm">
                        Join Virtual Room <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <p className="text-sm text-blue-600">Available after registration.</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Agenda */}
            {event.agenda_items && event.agenda_items.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                  <h2 className="text-lg font-bold text-gray-900">Event Agenda</h2>
                </div>
                <div className="space-y-2">
                  {event.agenda_items.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#0158B7]/20 transition-all">
                      <div className="text-xs font-bold text-[#0158B7] min-w-[90px] mt-0.5 bg-[#0158B7]/8 px-2 py-1 rounded-lg h-fit text-center">
                        {item.start_time}<br />{item.end_time}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-sm mb-0.5">{item.session_title}</h3>
                        {item.description && <p className="text-xs text-gray-500 mb-1">{item.description}</p>}
                        {item.speaker_name && (
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#0158B7] rounded-full inline-block" />
                            {item.speaker_name}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Related Projects */}
            {event.linked_projects && event.linked_projects.length > 0 && (
              <section className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                  <h2 className="text-lg font-bold text-gray-900">Related Research</h2>
                </div>
                <div className="space-y-2">
                  {event.linked_projects.map((project: any) => (
                    <Link key={project.id} href={`/research-projects/${project.id}`} className="flex items-center gap-3 p-4 bg-blue-50/60 rounded-xl border border-blue-100 hover:border-[#0158B7]/30 hover:bg-blue-50 transition-all group">
                      <div className="w-8 h-8 bg-[#0158B7]/10 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#0158B7]/20 transition-colors">
                        <BookOpen className="w-4 h-4 text-[#0158B7]" />
                      </div>
                      <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#0158B7] transition-colors">{project.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100">
              {!isAuthenticated ? (
                <div className="bg-gradient-to-r from-[#0158B7]/5 to-blue-50 border border-[#0158B7]/15 rounded-2xl p-7 text-center">
                  <div className="w-14 h-14 bg-[#0158B7]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-7 h-7 text-[#0158B7]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5">Sign in to register</h3>
                  <p className="text-gray-500 mb-5 text-sm max-w-sm mx-auto">Join our community and never miss important research events.</p>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                    Sign In to Join
                  </Link>
                </div>
              ) : (
                <div className="flex gap-3">
                  {!isRegistered ? (
                    <button
                      onClick={handleRegister}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Register for Event</>}
                    </button>
                  ) : (
                    <button
                      onClick={handleUnregister}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold text-sm hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Cancel Registration
                    </button>
                  )}
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}