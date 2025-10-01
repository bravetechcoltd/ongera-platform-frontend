import { Calendar, Users, MapPin, Globe, Clock, MoreVertical, Eye } from "lucide-react"
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
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  const getEventModeIcon = (mode: string) => {
    switch (mode) {
      case 'Online': return <Globe className="w-3 h-3 text-[#0158B7]" />
      case 'Physical': return <MapPin className="w-3 h-3 text-green-500" />
      case 'Hybrid': return <div className="flex space-x-1"><Globe className="w-3 h-3 text-[#0158B7]" /><MapPin className="w-3 h-3 text-green-500" /></div>
      default: return <Globe className="w-3 h-3 text-gray-500" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0158B7]"></div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-sm font-semibold text-gray-900 mb-1">No events found</h3>
        <p className="text-gray-600 text-xs">Try adjusting your filters or create a new event</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">#</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Event Details</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Organizer</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Status</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Attendees</th>
            <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {events.map((event, index) => (
            <tr key={event.id} className="hover:bg-gray-50 transition-colors">
              {/* Number */}
              <td className="px-3 py-2 whitespace-nowrap">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-[#0158B7]">{(currentPage - 1) * 10 + index + 1}</span>
                </div>
              </td>

              {/* Event Details */}
              <td className="px-3 py-2">
                <div className="min-w-0 max-w-xs">
                  <p className="text-xs font-semibold text-gray-900 truncate">{event.title}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                      {event.event_type}
                    </span>
                    <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      {getEventModeIcon(event.event_mode)}
                      <span>{event.event_mode}</span>
                    </span>
                    {event.community && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {event.community.name}
                      </span>
                    )}
                  </div>
                </div>
              </td>

              {/* Organizer */}
              <td className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-[#0158B7] to-blue-600">
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
                    <p className="text-gray-500 text-xs truncate">
                      {event.organizer?.account_type}
                    </p>
                  </div>
                </div>
              </td>

              {/* Date & Time */}
              <td className="px-3 py-2">
                <div className="text-xs">
                  <p className="font-semibold text-gray-900">{formatDate(event.start_datetime)}</p>
                  <p className="text-gray-500">{formatTime(event.start_datetime)}</p>
                </div>
              </td>

              {/* Status */}
              <td className="px-3 py-2">
                {getStatusBadge(event.status)}
              </td>

              {/* Attendees */}
              <td className="px-3 py-2">
                <div className="flex items-center space-x-1 text-gray-900">
                  <Users className="w-3 h-3 text-gray-400" />
                  <span className="text-xs">{event.attendees?.length || 0}</span>
                  {event.max_attendees && (
                    <span className="text-gray-500 text-xs">/ {event.max_attendees}</span>
                  )}
                </div>
              </td>

              {/* Actions */}
              <td className="px-3 py-2">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onAction(event, 'view_details')}
                    className="p-1 text-[#0158B7] hover:bg-blue-50 rounded transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <ActionDropdown
                    event={event}
                    onAction={onAction}
                    isOpen={actionMenuOpen === event.id}
                    onToggle={() => setActionMenuOpen(actionMenuOpen === event.id ? null : event.id)}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-3 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-700">
              Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, events.length)} of {events.length} events
            </p>
            <div className="flex space-x-1">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 py-1 text-xs border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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