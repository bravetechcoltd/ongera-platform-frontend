// @ts-nocheck
"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchEventById, registerForEvent, unregisterFromEvent } from "@/lib/features/auth/eventsSlice"
import {
  Calendar, MapPin, Users, Video, Clock, Loader2, ArrowLeft,
  CheckCircle, Globe, DollarSign, User, Share2, BookOpen, X,
  Copy, MessageCircle, Twitter, Linkedin, Facebook, Mail,
  ChevronDown, ChevronUp, FileText
} from "lucide-react"
import { toast } from "react-hot-toast"
import Link from "next/link"

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { currentEvent, isLoading, isSubmitting } = useAppSelector(state => state.events)
  const { user: authUser } = useAppSelector(state => state.auth)
  
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [collapsedSections, setCollapsedSections] = useState({
    agenda: true,
    projects: true
  })

  useEffect(() => {
    if (params.id) {
      dispatch(fetchEventById(params.id as string))
    }
  }, [params.id, dispatch])

  // ✅ Check if user is already registered using useMemo for performance
  const isUserRegistered = useMemo(() => {
    if (!currentEvent || !authUser || !currentEvent.attendees) return false
    
    return currentEvent.attendees.some(
      (attendee: any) => attendee.user && attendee.user.id === authUser.id
    )
  }, [currentEvent, authUser])

  const handleRegister = async () => {
    if (!currentEvent || !authUser) { 
      toast.error("You must be logged in to register for events")
      router.push("/login")
      return
    }

    // ✅ Check if already registered before making API call
    if (isUserRegistered) {
      toast.error("You are already registered for this event")
      return
    }

    const attendeeData = {
      event_id: currentEvent.id,
      user_id: authUser.id,
      user_email: authUser.email,
      user_name: `${authUser.first_name} ${authUser.last_name}`,
      additional_notes: null,
      dietary_requirements: null,
      special_accommodations: null,
    }

    if (!attendeeData.event_id) {
      toast.error("Event ID is required")
      return
    }

    if (!attendeeData.user_id) {
      toast.error("User ID is required")
      return
    }

    try {
      const result = await dispatch(
        registerForEvent({ 
          eventId: currentEvent.id, 
          attendeeData 
        })
      ).unwrap()
      
      toast.success(
        currentEvent.requires_approval 
          ? "Registration submitted! Awaiting organizer approval." 
          : "Successfully registered for event!"
      )
      
      // Refresh event data to update attendees list
      dispatch(fetchEventById(currentEvent.id))
      
    } catch (err: any) {
      toast.error(err.message || err || "Failed to register for event")
    }
  }

  const handleUnregister = async () => {
    if (!currentEvent) return
    
    if (!confirm("Are you sure you want to cancel your registration?")) return
    
    try {
      await dispatch(unregisterFromEvent(currentEvent.id)).unwrap()
      toast.success("Registration cancelled")
      dispatch(fetchEventById(currentEvent.id))
    } catch (err: any) {
      toast.error(err || "Failed to unregister")
    }
  }

  // Share functionality
  const getShareData = () => {
    if (!currentEvent) return null
    
    const eventUrl = typeof window !== 'undefined' ? window.location.href : ''
    const eventDate = formatDate(currentEvent.start_datetime)
    const eventTime = formatTime(currentEvent.start_datetime)
    
    return {
      title: currentEvent.title,
      description: currentEvent.description.slice(0, 100) + (currentEvent.description.length > 100 ? '...' : ''),
      url: eventUrl,
      text: `${currentEvent.title} - ${eventDate} at ${eventTime}`,
      fullText: `Join me at ${currentEvent.title}!\n\n📅 ${eventDate}\n⏰ ${eventTime}\n\n${eventUrl}`
    }
  }

  const handleShare = async () => {
    const shareData = getShareData()
    if (!shareData) return

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url
        })
        toast.success("Shared successfully!")
        setShowShareMenu(false)
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setShowShareMenu(true)
        }
      }
    } else {
      setShowShareMenu(true)
    }
  }

  const copyToClipboard = async () => {
    const shareData = getShareData()
    if (!shareData) return

    try {
      await navigator.clipboard.writeText(shareData.url)
      toast.success("Link copied to clipboard!")
      setShowShareMenu(false)
    } catch (err) {
      toast.error("Failed to copy link")
    }
  }

  const shareToWhatsApp = () => {
    const shareData = getShareData()
    if (!shareData) return
    
    const url = `https://wa.me/?text=${encodeURIComponent(shareData.fullText)}`
    window.open(url, '_blank')
    toast.success("Opening WhatsApp...")
    setShowShareMenu(false)
  }

  const shareToTwitter = () => {
    const shareData = getShareData()
    if (!shareData) return
    
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`
    window.open(url, '_blank')
    toast.success("Opening Twitter...")
    setShowShareMenu(false)
  }

  const shareToLinkedIn = () => {
    const shareData = getShareData()
    if (!shareData) return
    
    const url = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareData.url)}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.description)}`
    window.open(url, '_blank')
    toast.success("Opening LinkedIn...")
    setShowShareMenu(false)
  }

  const shareToFacebook = () => {
    const shareData = getShareData()
    if (!shareData) return
    
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`
    window.open(url, '_blank')
    toast.success("Opening Facebook...")
    setShowShareMenu(false)
  }

  const shareViaEmail = () => {
    const shareData = getShareData()
    if (!shareData) return
    
    const subject = encodeURIComponent(`Event Invitation: ${shareData.title}`)
    const body = encodeURIComponent(`I'd like to invite you to this event:\n\n${shareData.fullText}`)
    const url = `mailto:?subject=${subject}&body=${body}`
    window.location.href = url
    toast.success("Opening email client...")
    setShowShareMenu(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      Upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock },
      Ongoing: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      Completed: { bg: 'bg-gray-100', text: 'text-gray-700', icon: CheckCircle },
      Cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: X }
    }
    const config = badges[status as keyof typeof badges] || badges.Upcoming
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const toggleSection = (section: 'agenda' | 'projects') => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin mx-auto mb-3" />
          <p className="text-[#0158B7] text-sm">Loading event...</p>
        </div>
      </div>
    )
  }

  if (!currentEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Event Not Found</h2>
          <p className="text-gray-600 text-sm mb-6">The event you're looking for doesn't exist.</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0158B7] text-white rounded-lg font-medium hover:bg-[#0158B7]/90 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const event = currentEvent

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            {event.community ? (
              <Link
                href={`/dashboard/user/communities/dashboard/${event.community.id}`}
                className="flex items-center gap-2 text-xs font-semibold text-[#0158B7] hover:text-[#0158B7]/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Community</span>
              </Link>
            ) : (
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-semibold text-[#0158B7] hover:text-[#0158B7]/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
            
            <div className="flex items-center gap-1">
              <button 
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          
          {/* Sticky Compact Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-16 self-start">
            
            {/* Organizer Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[#0158B7]" />
                Organizer
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-semibold text-sm">
                  {event.organizer?.first_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 text-sm truncate">
                    {event.organizer.first_name} {event.organizer.last_name}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">{event.organizer.account_type}</p>
                </div>
              </div>
            </div>

            {/* Event Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#0158B7]" />
                Event Details
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Timezone:</span>
                  <span className="text-gray-700 font-medium">{event.timezone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Type:</span>
                  <span className="text-gray-700 font-medium">{event.event_type}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Mode:</span>
                  <span className="text-gray-700 font-medium">{event.event_mode}</span>
                </div>
                {event.is_free && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="text-green-600 font-semibold">Free</span>
                  </div>
                )}
                {!event.is_free && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Price:</span>
                    <span className="text-gray-700 font-semibold">${event.price_amount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Community Card */}
            {event.community && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <Link
                  href={`/dashboard/user/communities/dashboard/${event.community.id}`}
                  className="flex items-center gap-2 text-xs font-semibold text-[#0158B7] hover:text-[#0158B7]/80 transition-colors"
                >
                  <Users className="w-4 h-4" />
                  {event.community.name}
                </Link>
              </div>
            )}

            {/* Attendees Preview */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0158B7]" />
                  Attendees ({event.attendees.length})
                </h3>
                <div className="flex -space-x-2">
                  {event.attendees.slice(0, 8).map((attendee: any, idx: number) => (
                    <div
                      key={idx}
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                      title={`${attendee.user?.first_name} ${attendee.user?.last_name}`}
                    >
                      {attendee.user?.first_name?.charAt(0) || '?'}
                    </div>
                  ))}
                  {event.attendees.length > 8 && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-gray-700 text-xs font-semibold">
                      +{event.attendees.length - 8}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4">
            
            {/* Compressed Header Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
              
              {/* Cover Image */}
              <div className="relative h-48 md:h-56 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] overflow-hidden">
                {event.cover_image_url ? (
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white">
                    <Calendar className="w-16 h-16 opacity-50" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                
                {/* Event Type and Status Badges */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-900">
                    {event.event_type}
                  </span>
                  {getStatusBadge(event.status)}
                  {/* ✅ Show "Registered" badge if user is registered */}
                  {isUserRegistered && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Registered
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-4 md:p-6">
                {/* Title */}
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
                  {event.title}
                </h1>

                {/* Quick Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-[#0158B7]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Date</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(event.start_datetime)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Time</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Users className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 font-medium">Attendees</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {event.attendees?.length || 0}
                        {event.max_attendees && ` / ${event.max_attendees}`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Location/Mode Info */}
                <div className="space-y-2 mb-4">
                  {(event.event_mode === 'Online' || event.event_mode === 'Hybrid') && event.online_meeting_url && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <Video className="w-4 h-4 text-[#0158B7] mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 mb-1">Online Meeting</p>
                        {isUserRegistered ? (
                          <div className="space-y-1">
                            <a
                              href={event.online_meeting_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-[#0158B7] hover:text-[#0158B7]/80 font-medium underline"
                            >
                              Join Meeting
                            </a>
                            {event.meeting_id && (
                              <p className="text-xs text-gray-600">
                                Meeting ID: <span className="font-mono font-semibold">{event.meeting_id}</span>
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-600">Meeting details available after registration</p>
                        )}
                      </div>
                    </div>
                  )}

                  {(event.event_mode === 'Physical' || event.event_mode === 'Hybrid') && event.location_address && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-100">
                      <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900 mb-1">Location</p>
                        <p className="text-sm text-gray-700">{event.location_address}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {/* ✅ Updated Register/Cancel Button Logic */}
                  {!isUserRegistered && event.status === 'Upcoming' && (
                    <button
                      onClick={handleRegister}
                      disabled={isSubmitting}
                      className="flex-1 md:flex-none px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/90 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Register
                        </>
                      )}
                    </button>
                  )}

                  {isUserRegistered && event.status === 'Upcoming' && (
                    <button
                      onClick={handleUnregister}
                      disabled={isSubmitting}
                      className="flex-1 md:flex-none px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      <X className="w-4 h-4" />
                      Cancel Registration
                    </button>
                  )}

                  {/* Share Button with Dropdown */}
                  <div className="relative">
                    <button
                      onClick={handleShare}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold flex items-center gap-2 text-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>

                    {showShareMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-40"
                          onClick={() => setShowShareMenu(false)}
                        />
                        
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                          <div className="p-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900">Share this event</h3>
                          </div>
                          <div className="p-2">
                            <button
                              onClick={copyToClipboard}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                              <span>Copy Link</span>
                            </button>

                            <button
                              onClick={shareToWhatsApp}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <MessageCircle className="w-4 h-4 text-green-600" />
                              <span>WhatsApp</span>
                            </button>

                            <button
                              onClick={shareToTwitter}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <Twitter className="w-4 h-4 text-blue-600" />
                              <span>Twitter</span>
                            </button>

                            <button
                              onClick={shareToLinkedIn}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <Linkedin className="w-4 h-4 text-blue-700" />
                              <span>LinkedIn</span>
                            </button>

                            <button
                              onClick={shareViaEmail}
                              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left text-sm"
                            >
                              <Mail className="w-4 h-4 text-gray-600" />
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-3">About This Event</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Agenda Items */}
            {event.agenda_items && event.agenda_items.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-4">
                <button
                  onClick={() => toggleSection('agenda')}
                  className="w-full flex items-center justify-between text-lg font-bold text-gray-900 mb-3"
                >
                  <span>Event Agenda</span>
                  {collapsedSections.agenda ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
                {!collapsedSections.agenda && (
                  <div className="space-y-2">
                    {event.agenda_items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="text-sm font-semibold text-gray-600 min-w-[80px] text-xs">
                          {item.start_time} - {item.end_time}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">{item.session_title}</h3>
                          {item.description && (
                            <p className="text-xs text-gray-600 mt-1">{item.description}</p>
                          )}
                          {item.speaker_name && (
                            <p className="text-xs text-gray-500 mt-1">Speaker: {item.speaker_name}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Linked Projects */}
            {event.linked_projects && event.linked_projects.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
                <button
                  onClick={() => toggleSection('projects')}
                  className="w-full flex items-center justify-between text-lg font-bold text-gray-900 mb-3"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#0158B7]" />
                    Related Research Projects
                  </span>
                  {collapsedSections.projects ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                </button>
                {!collapsedSections.projects && (
                  <div className="space-y-2">
                    {event.linked_projects.map((project: any) => (
                      <Link
                        key={project.id}
                        href={`/dashboard/user/research/${project.id}`}
                        className="block p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
                      >
                        <h3 className="font-semibold text-gray-900 hover:text-[#0158B7] text-sm">
                          {project.title}
                        </h3>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}