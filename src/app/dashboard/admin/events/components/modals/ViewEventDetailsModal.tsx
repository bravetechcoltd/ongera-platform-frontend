import { useState } from "react"
import { X, Calendar, Clock, MapPin, Users, Globe, Hash, Mail, User, Image, ZoomIn } from "lucide-react"

interface ViewEventDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
}

export default function ViewEventDetailsModal({
  isOpen,
  onClose,
  event
}: ViewEventDetailsModalProps) {
  const [showImagePreview, setShowImagePreview] = useState(false)

  if (!isOpen || !event) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Upcoming': { bg: 'bg-blue-100', text: 'text-blue-800' },
      'Ongoing': { bg: 'bg-green-100', text: 'text-green-800' },
      'Completed': { bg: 'bg-gray-100', text: 'text-gray-800' },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Upcoming']

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    )
  }

  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'Webinar': return "bg-purple-100 text-purple-700"
      case 'Conference': return "bg-blue-100 text-blue-700"
      case 'Workshop': return "bg-green-100 text-green-700"
      case 'Seminar': return "bg-orange-100 text-orange-700"
      case 'Meetup': return "bg-pink-100 text-pink-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getModeBadgeColor = (mode: string) => {
    switch(mode) {
      case 'Online': return "bg-cyan-100 text-cyan-700"
      case 'Physical': return "bg-emerald-100 text-emerald-700"
      case 'Hybrid': return "bg-amber-100 text-amber-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const approvedAttendees = event.attendees?.filter((a: any) => a.registration_status === 'Approved') || []
  const pendingAttendees = event.attendees?.filter((a: any) => a.registration_status === 'Pending') || []

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
        <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
          
          {/* Modal Header */}
          <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600 flex-shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Event Details</h3>
                  <p className="text-blue-100 text-xs">Complete information about the event</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            
            {/* Large Event Image with Preview */}
            <div className="relative group">
              {event.cover_image_url ? (
                <div 
                  className="w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer relative"
                  onClick={() => setShowImagePreview(true)}
                >
                  <img
                    src={event.cover_image_url}
                    alt={event.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-full p-3">
                      <ZoomIn className="w-6 h-6 text-gray-800" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center border-2 border-gray-200">
                  <Image className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Event Title & Description */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
              <div className="flex items-center space-x-2 mt-3">
                {getStatusBadge(event.status)}
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(event.event_type)}`}>
                  <Hash className="w-3 h-3 mr-1" />
                  {event.event_type}
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getModeBadgeColor(event.event_mode)}`}>
                  <Globe className="w-3 h-3 mr-1" />
                  {event.event_mode}
                </span>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Left Column */}
              <div className="space-y-3">
                
                {/* Date & Time */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-[#0158B7]" />
                    Date & Time
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Start:</span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(event.start_datetime)} at {formatTime(event.start_datetime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">End:</span>
                      <span className="font-semibold text-gray-900">
                        {formatDate(event.end_datetime)} at {formatTime(event.end_datetime)}
                      </span>
                    </div>
                    {event.registration_deadline && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Registration Deadline:</span>
                        <span className="font-semibold text-gray-900">
                          {formatDate(event.registration_deadline)} at {formatTime(event.registration_deadline)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Location Details */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-[#0158B7]" />
                    Location Details
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    {(event.event_mode === 'Online' || event.event_mode === 'Hybrid') && (
                      <div>
                        <p className="text-gray-600 mb-1">Online Meeting</p>
                        {event.online_meeting_url && (
                          <a 
                            href={event.online_meeting_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#0158B7] hover:underline font-semibold break-all"
                          >
                            {event.online_meeting_url}
                          </a>
                        )}
                        {event.meeting_id && (
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-600">Meeting ID:</span>
                            <span className="font-semibold text-gray-900">{event.meeting_id}</span>
                          </div>
                        )}
                        {event.meeting_password && (
                          <div className="flex justify-between mt-1">
                            <span className="text-gray-600">Password:</span>
                            <span className="font-semibold text-gray-900">{event.meeting_password}</span>
                          </div>
                        )}
                      </div>
                    )}
                    {event.location_address && (
                      <div>
                        <p className="text-gray-600 mb-1">Physical Address</p>
                        <p className="font-semibold text-gray-900">{event.location_address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-3">
                
                {/* Organizer Info */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-[#0158B7]" />
                    Organizer
                  </h4>
                  <div className="flex items-center space-x-3">
                    {event.organizer?.profile_picture_url ? (
                      <img
                        src={event.organizer.profile_picture_url}
                        alt={`${event.organizer.first_name} ${event.organizer.last_name}`}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#0158B7] flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {event.organizer?.first_name?.[0]}{event.organizer?.last_name?.[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {event.organizer?.first_name} {event.organizer?.last_name}
                      </p>
                      <p className="text-xs text-gray-600 capitalize">
                        {event.organizer?.account_type?.toLowerCase()}
                      </p>
                      {event.organizer?.email && (
                        <div className="flex items-center space-x-1 mt-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-600">{event.organizer.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Attendance & Capacity */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-[#0158B7]" />
                    Attendance
                  </h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Attendees:</span>
                      <span className="font-semibold text-gray-900">{event.attendees?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Approved:</span>
                      <span className="font-semibold text-green-600">{approvedAttendees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Approval:</span>
                      <span className="font-semibold text-yellow-600">{pendingAttendees.length}</span>
                    </div>
                    {event.max_attendees && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Capacity:</span>
                        <span className="font-semibold text-gray-900">{event.max_attendees}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Event Settings */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Event Settings</h4>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Registration Type:</span>
                      <span className="font-semibold text-gray-900">
                        {event.requires_approval ? 'Approval Required' : 'Automatic'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pricing:</span>
                      <span className="font-semibold text-gray-900">
                        {event.is_free ? 'Free' : `$${event.price_amount}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timezone:</span>
                      <span className="font-semibold text-gray-900">{event.timezone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {(event.additional_notes || event.special_requirements) && (
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-gray-900 mb-2">Additional Information</h4>
                <div className="space-y-1.5 text-xs">
                  {event.additional_notes && (
                    <div>
                      <p className="text-gray-600 mb-1">Notes:</p>
                      <p className="font-semibold text-gray-900">{event.additional_notes}</p>
                    </div>
                  )}
                  {event.special_requirements && (
                    <div>
                      <p className="text-gray-600 mb-1">Special Requirements:</p>
                      <p className="font-semibold text-gray-900">{event.special_requirements}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold"
            >
              Close Details
            </button>
          </div>
        </div>
      </div>

      {/* Full Screen Image Preview Modal */}
      {showImagePreview && event.cover_image_url && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}