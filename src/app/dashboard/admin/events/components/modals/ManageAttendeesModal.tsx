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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
        
        {/* Modal Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Manage Attendees</h3>
                <p className="text-white/90 text-sm mt-1">
                  {event.title} • {attendees.length} total attendees
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">

          {/* Bulk Actions Bar */}
          {selectedAttendees.length > 0 && (
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-blue-900">
                      {selectedAttendees.length} attendees selected
                    </h4>
                    <p className="text-sm text-blue-800">
                      Choose an action to perform on selected attendees
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={bulkActionReason}
                    onChange={(e) => setBulkActionReason(e.target.value)}
                    placeholder="Reason for action (optional)"
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => handleBulkAction('approve')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                    <span>Approve Selected</span>
                  </button>
                  <button
                    onClick={() => handleBulkAction('reject')}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <UserX className="w-4 h-4" />
                    <span>Reject Selected</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Filters and Search */}
          <div className="flex items-center justify-between">
            {/* Status Tabs */}
            <div className="flex space-x-2">
              {(['all', 'pending', 'approved', 'rejected', 'waitlisted'] as AttendeeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCurrentFilter(filter)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    currentFilter === filter
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="ml-2 text-xs opacity-80">({statusCounts[filter]})</span>
                </button>
              ))}
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search attendees..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => onExportAttendees(event.id)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Attendees Table */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedAttendees.length > 0 && selectedAttendees.length === filteredAttendees.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span>Attendee</span>
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Registration Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAttendees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No attendees found</p>
                    </td>
                  </tr>
                ) : (
                  filteredAttendees.map((attendee) => (
                    <tr key={attendee.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedAttendees.includes(attendee.id)}
                            onChange={() => toggleSelectAttendee(attendee.id)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              {attendee.user.first_name.charAt(0)}{attendee.user.last_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {attendee.user.first_name} {attendee.user.last_name}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{attendee.user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {new Date(attendee.registered_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(attendee.registered_at).toLocaleTimeString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(attendee.registration_status)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {attendee.registration_status === 'pending' && (
                            <>
                              <button
                                onClick={() => {/* Individual approve */}}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {/* Individual reject */}}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                title="Reject"
                              >
                                <UserX className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => {/* Send message */}}
                            className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Send Message"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <MoreVertical className="w-4 h-4" />
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
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">Attendee Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm font-medium text-gray-600 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}