import { Calendar, Users, MapPin, Globe, Clock, MoreVertical } from "lucide-react"
import { useState } from "react"
import ActionDropdown from "./ActionDropdown"

interface EventsTableProps {
  events: any[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  onAction: (event: any, action: string) => void
}

export default function EventsTable({
  events,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onAction
}: EventsTableProps) {
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null)

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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Upcoming': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'Ongoing': { bg: 'bg-green-100', text: 'text-green-800', icon: Users },
      'Completed': { bg: 'bg-gray-100', text: 'text-gray-800', icon: Calendar },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: Clock }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Upcoming
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const getEventModeIcon = (mode: string) => {
    switch (mode) {
      case 'Online': return <Globe className="w-4 h-4 text-blue-500" />
      case 'Physical': return <MapPin className="w-4 h-4 text-green-500" />
      case 'Hybrid': return <div className="flex space-x-1"><Globe className="w-3 h-3 text-blue-500" /><MapPin className="w-3 h-3 text-green-500" /></div>
      default: return <Globe className="w-4 h-4 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
        <p className="text-gray-600">Try adjusting your filters or create a new event</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Event Details</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Organizer</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attendees</th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {events.map((event, index) => (
            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
              {/* Number */}
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blue-700">{(currentPage - 1) * 10 + index + 1}</span>
                </div>
              </td>

              {/* Event Details */}
              <td className="px-6 py-4">
                <div className="min-w-0 max-w-xs">
                  <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {event.event_type}
                    </span>
                    <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {getEventModeIcon(event.event_mode)}
                      <span>{event.event_mode}</span>
                    </span>
                    {event.community && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {event.community.name}
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Organizer */}
              <td className="px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                    {event.organizer?.profile_picture_url ? (
                      <img
                        src={event.organizer.profile_picture_url}
                        alt={event.organizer.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                        {event.organizer?.first_name?.charAt(0)}{event.organizer?.last_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">
                      {event.organizer?.first_name} {event.organizer?.last_name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {event.organizer?.account_type}
                    </p>
                  </div>
                </div>
              </td>

              {/* Date & Time */}
              <td className="px-6 py-4">
                <div className="text-xs">
                  <p className="font-semibold text-gray-900">{formatDate(event.start_datetime)}</p>
                  <p className="text-gray-500">{formatTime(event.start_datetime)}</p>
                </div>
              </td>

              {/* Status */}
              <td className="px-6 py-4">
                {getStatusBadge(event.status)}
              </td>

              {/* Attendees */}
              <td className="px-6 py-4">
                <div className="flex items-center space-x-1 text-sm text-gray-900">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span>{event.attendees?.length || 0}</span>
                  {event.max_attendees && (
                    <span className="text-gray-500">/ {event.max_attendees}</span>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <ActionDropdown
                  event={event}
                  onAction={onAction}
                  isOpen={actionMenuOpen === event.id}
                  onToggle={() => setActionMenuOpen(actionMenuOpen === event.id ? null : event.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, events.length)} of {events.length} events
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}