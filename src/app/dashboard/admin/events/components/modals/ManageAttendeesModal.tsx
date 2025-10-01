import { useState, useEffect } from "react"
import { 
  X, Users, Search, Filter, Download, Check, 
  UserCheck, UserX, Mail, MoreVertical, CheckCircle,
  Clock, XCircle, User
} from "lucide-react"

interface ManageAttendeesModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  selectedAttendees: string[]
  onSelectedAttendeesChange: (attendees: string[]) => void
  onBulkAction: (eventId: string, action: 'approve' | 'reject', reason?: string) => void
  onExportAttendees: (eventId: string) => void
}

type AttendeeFilter = 'all' | 'pending' | 'approved' | 'rejected' | 'waitlisted'

export default function ManageAttendeesModal({
  isOpen,
  onClose,
  event,
  selectedAttendees,
  onSelectedAttendeesChange,
  onBulkAction,
  onExportAttendees
}: ManageAttendeesModalProps) {
  const [currentFilter, setCurrentFilter] = useState<AttendeeFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [attendees, setAttendees] = useState<any[]>([])
  const [bulkActionReason, setBulkActionReason] = useState('')

  // Mock data - in real app, this would come from API
  useEffect(() => {
    if (event && isOpen) {
      // Simulate API call to fetch attendees
      const mockAttendees = [
        {
          id: '1',
          user: {
            id: 'user1',
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@example.com',
            profile_picture_url: null
          },
          registration_status: 'approved',
          registered_at: new Date('2024-01-15'),
          approval_note: 'Regular attendee'
        },
        {
          id: '2',
          user: {
            id: 'user2',
            first_name: 'Sarah',
            last_name: 'Smith',
            email: 'sarah.smith@example.com',
            profile_picture_url: null
          },
          registration_status: 'pending',
          registered_at: new Date('2024-01-16'),
          approval_note: 'Waiting for review'
        },
        {
          id: '3',
          user: {
            id: 'user3',
            first_name: 'Mike',
            last_name: 'Johnson',
            email: 'mike.johnson@example.com',
            profile_picture_url: null
          },
          registration_status: 'rejected',
          registered_at: new Date('2024-01-14'),
          approval_note: 'Not eligible'
        }
      ]
      setAttendees(mockAttendees)
    }
  }, [event, isOpen])

  const filteredAttendees = attendees.filter(attendee => {
    // Filter by status
    if (currentFilter !== 'all' && attendee.registration_status !== currentFilter) {
      return false
    }

    // Filter by search
    if (searchQuery && !`${attendee.user.first_name} ${attendee.user.last_name} ${attendee.user.email}`
      .toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    return true
  })

  const toggleSelectAttendee = (attendeeId: string) => {
    if (selectedAttendees.includes(attendeeId)) {
      onSelectedAttendeesChange(selectedAttendees.filter(id => id !== attendeeId))
    } else {
      onSelectedAttendeesChange([...selectedAttendees, attendeeId])
    }
  }

  const toggleSelectAll = () => {
    if (selectedAttendees.length === filteredAttendees.length) {
      onSelectedAttendeesChange([])
    } else {
      onSelectedAttendeesChange(filteredAttendees.map(a => a.id))
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock },
      'approved': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
      'waitlisted': { bg: 'bg-blue-100', text: 'text-blue-800', icon: User }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  const handleBulkAction = (action: 'approve' | 'reject') => {
    if (selectedAttendees.length === 0) return
    onBulkAction(event.id, action, bulkActionReason)
    setBulkActionReason('')
  }

  if (!isOpen || !event) return null

  const statusCounts = {
    all: attendees.length,
    pending: attendees.filter(a => a.registration_status === 'pending').length,
    approved: attendees.filter(a => a.registration_status === 'approved').length,
    rejected: attendees.filter(a => a.registration_status === 'rejected').length,
    waitlisted: attendees.filter(a => a.registration_status === 'waitlisted').length
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Manage Attendees</h3>
                <p className="text-blue-100 text-xs">
                  {event.title} • {attendees.length} total attendees
                </p>
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

          {/* Bulk Actions Bar */}
          {selectedAttendees.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">
                      {selectedAttendees.length} attendees selected
                    </h4>
                    <p className="text-xs text-blue-800">
                      Choose an action to perform on selected attendees
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={bulkActionReason}
                    onChange={(e) => setBulkActionReason(e.target.value)}
                    placeholder="Reason for action (optional)"
                    className="px-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7] focus:border-transparent"
                  />
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
                  >
                    <Check className="w-3 h-3" />
                    <span>Approve Selected</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                  >
                    <UserX className="w-3 h-3" />
                    <span>Reject Selected</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex items-center justify-between">
            {/* Status Tabs */}
            <div className="flex space-x-1">
              {(['all', 'pending', 'approved', 'rejected', 'waitlisted'] as AttendeeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCurrentFilter(filter)}
                  className={`px-3 py-1 rounded-lg font-medium transition-all text-xs ${
                    currentFilter === filter
                      ? 'bg-[#0158B7] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="ml-1 text-xs opacity-80">({statusCounts[filter]})</span>
                </button>
              ))}
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7] focus:border-transparent"
                />
              </div>
              <button
                onClick={() => onExportAttendees(event.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedAttendees.length > 0 && selectedAttendees.length === filteredAttendees.length}
                        onChange={toggleSelectAll}
                        className="w-3 h-3 text-[#0158B7] rounded focus:ring-[#0158B7]"
                      />
                      <span>Attendee</span>
                    </div>
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center">
                      <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-600 text-xs">No attendees found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedAttendees.includes(attendee.id)}
                            onChange={() => toggleSelectAttendee(attendee.id)}
                            className="w-3 h-3 text-[#0158B7] rounded focus:ring-[#0158B7]"
                          />
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0158B7] to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                              {attendee.user.first_name.charAt(0)}{attendee.user.last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-xs">
                                {attendee.user.first_name} {attendee.user.last_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-gray-900 text-xs">{attendee.user.email}</p>
                      </td>
                      <td className="px-3 py-2">
                        <p className="text-gray-900 text-xs">
                          {new Date(attendee.registered_at).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 text-xs">
                          {new Date(attendee.registered_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-3 py-2">
                        {getStatusBadge(attendee.registration_status)}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center space-x-1">
                          {attendee.registration_status === 'pending' && (
                            <>
                              <button
                                onClick={() => {/* Individual approve */}}
                                className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {/* Individual reject */}}
                                className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                title="Reject"
                              >
                                <UserX className="w-3 h-3" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {/* Send message */}}
                            className="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="Send Message"
                          >
                            <Mail className="w-3 h-3" />
                          </button>
                          <button className="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                            <MoreVertical className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Attendee Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs font-medium text-gray-600 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}