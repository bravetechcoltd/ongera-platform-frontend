"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  getAllEventsForAdmin,
  extendEventDate,
  closeEvent,
  postponeEvent,
  transferEventOwnership,
  bulkAttendeeAction,
  fetchEventStatistics,
  duplicateEvent,
  setSelectedEventForManagement,
  clearEventStatistics,
  activateDeactivateEvent,
  cancelEventPermanently,
  clearEventsError
} from "@/lib/features/auth/eventsSlice"
import {
  Calendar, Users, Clock, Search, RefreshCw, Plus,
  Download, Filter, MoreVertical, Edit, Eye, BarChart3,
  CalendarRange, Clock4, UserCog, Copy, Trash2, Loader2,
  CheckCircle, XCircle, X, AlertTriangle, MapPin, Globe,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

import EventFilters from "./components/EventFilters"
import StatsCards from "./components/StatsCards"
import Pagination from "./Pagination"
// Import modals
import ManageAttendeesModal from "./components/modals/ManageAttendeesModal"
import ExtendDateModal from "./components/modals/ExtendDateModal"
import CloseEventModal from "./components/modals/CloseEventModal"
import PostponeEventModal from "./components/modals/PostponeEventModal"
import TransferOwnershipModal from "./components/modals/TransferOwnershipModal"
import DuplicateEventModal from "./components/modals/DuplicateEventModal"
import StatisticsModal from "./components/modals/StatisticsModal"

// Action Dropdown Component - MOVED INSIDE (NOT EXPORTED)
interface ActionDropdownProps {
  event: any
  onAction: (event: any, action: string) => void
  isOpen: boolean
  onToggle: () => void
}



interface ActionModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  onAction: (action: string) => void
}

function ActionModal({ isOpen, onClose, event, onAction }: ActionModalProps) {
  const actionGroups = [
    {
      name: "Management",
      actions: [
        { id: 'manage_attendees', label: 'Manage Attendees', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'statistics', label: 'View Statistics', icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' }
      ]
    },
    {
      name: "Date & Time",
      actions: [
        { id: 'extend_date', label: 'Extend Date', icon: CalendarRange, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { id: 'postpone', label: 'Postpone Event', icon: Clock4, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { id: 'close_event', label: 'Close Event', icon: Clock4, color: 'text-red-600', bg: 'bg-red-50' }
      ]
    },
    {
      name: "Administration",
      actions: [
        { id: 'transfer_ownership', label: 'Transfer Ownership', icon: UserCog, color: 'text-pink-600', bg: 'bg-pink-50' },
        { id: 'duplicate', label: 'Duplicate Event', icon: Copy, color: 'text-teal-600', bg: 'bg-teal-50' }
      ]
    },
    {
      name: "Status Management",
      actions: [
        { id: 'activate_event', label: 'Activate Event', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        { id: 'cancel_event', label: 'Cancel Event', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { id: 'cancel_permanently', label: 'Cancel Permanently', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50' }
      ]
    }
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">Event Actions</h2>
                <p className="text-blue-100 mt-1">{event?.title}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {actionGroups.map((group) => (
                <div key={group.name} className="space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                    {group.name}
                  </h3>
                  <div className="space-y-2">
                    {group.actions.map((action) => {
                      const Icon = action.icon
                      return (
                        <motion.button
                          key={action.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            onAction(action.id)
                            onClose()
                          }}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl border border-gray-200 transition-all hover:shadow-md ${action.bg}`}
                        >
                          <Icon className={`w-5 h-5 ${action.color}`} />
                          <span className="font-medium text-gray-900">{action.label}</span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

interface EnhancedEventsTableProps {
  events: any[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  startIndex: number
  onPageChange: (page: number) => void
  onAction: (event: any, action: string) => void
  onStatusChange: (event: any, action: 'Upcoming' | 'Cancelled') => void
  onPermanentCancel: (event: any) => void
}

function EnhancedEventsTable({
  events,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onAction,
  onStatusChange,
  onPermanentCancel
}: EnhancedEventsTableProps) {
  const itemsPerPage = 10
  const startIndex = (currentPage - 1) * itemsPerPage
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [actionModalEvent, setActionModalEvent] = useState<any>(null)

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Upcoming': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'Ongoing': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      'Completed': { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Upcoming']
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Event</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Organizer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date & Time</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type/Mode</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Attendees</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {events.map((event, index) => {
              const globalIndex = startIndex + index + 1

              return (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors group">
                  {/* Number */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-blue-700">{globalIndex}</span>
                    </div>
                  </td>

                  {/* Event Info */}
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3 min-w-0 max-w-xs">
                      {event.cover_image_url && (
                        <img
                          src={event.cover_image_url}
                          alt={event.title}
                          className="w-12 h-12 rounded-lg object-cover shadow-sm flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-1">
                          {event.description?.substring(0, 50)}...
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {event.event_type}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            {event.event_mode}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Organizer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
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
                          {event.organizer?.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="text-xs space-y-0.5 min-w-[120px]">
                      <div className="flex items-center text-gray-900 font-semibold">
                        <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">{formatDate(event.start_datetime)}</span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                        <span className="truncate">
                          {formatTime(event.start_datetime)} - {formatTime(event.end_datetime)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Type/Mode */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 font-medium">
                        {event.event_type}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 font-medium">
                        {event.event_mode}
                      </span>
                    </div>
                  </td>

                  {/* Attendees */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        <Users className="w-3 h-3" />
                        <span className="text-xs font-semibold">{event.attendees?.length || 0}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {getStatusBadge(event.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onStatusChange(event, event.status === 'Cancelled' ? 'Upcoming' : 'Cancelled')}
                        className={`p-2 rounded-lg transition-all transform hover:scale-110 ${event.status === 'Cancelled'
                            ? 'bg-green-100 text-green-600 hover:bg-green-200 shadow-sm'
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200 shadow-sm'
                          }`}
                        title={event.status === 'Cancelled' ? 'Activate Event' : 'Cancel Event'}
                      >
                        {event.status === 'Cancelled' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => onPermanentCancel(event)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all transform hover:scale-110 shadow-sm"
                        title="Cancel Permanently"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setActionModalEvent(event)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all transform hover:scale-110 shadow-sm"
                        title="More Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={events.length}
        itemsPerPage={10}
      />

      <ActionModal
        isOpen={!!actionModalEvent}
        onClose={() => setActionModalEvent(null)}
        event={actionModalEvent}
        onAction={(action) => {
          if (actionModalEvent) {
            onAction(actionModalEvent, action)
          }
        }}
      />
    </>
  )
}

// Rest of your interfaces and main component...
interface EventFilters {
  search: string
  status: string
  event_type: string
  event_mode: string
  date_range: { start: Date | null; end: Date | null }
}

interface ExtendDateForm {
  start_datetime: Date
  end_datetime: Date
  reason: string
}

interface PostponeForm {
  new_start_datetime: Date
  new_end_datetime: Date
  reason: string
}

interface CloseForm {
  reason: string
  send_certificates: boolean
}

interface TransferForm {
  new_organizer_id: string
  new_organizer: any | null
  reason: string
}

interface DuplicateForm {
  new_title: string
  new_start_datetime: Date
  new_end_datetime: Date
}

export default function AdminEventsManagementPage() {
  // ... rest of your component code remains the same
  const dispatch = useAppDispatch()

  const {
    adminEvents,
    isLoading,
    isSubmitting,
    currentEventStatistics,
    selectedEventForManagement,
    bulkActionProgress,
    error
  } = useAppSelector(state => state.events)

  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    status: 'all',
    event_type: '',
    event_mode: '',
    date_range: { start: null, end: null }
  })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [showManageAttendeesModal, setShowManageAttendeesModal] = useState(false)
  const [showExtendDateModal, setShowExtendDateModal] = useState(false)
  const [showCloseEventModal, setShowCloseEventModal] = useState(false)
  const [showPostponeModal, setShowPostponeModal] = useState(false)
  const [showTransferModal, setShowTransferModal] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [showStatisticsModal, setShowStatisticsModal] = useState(false)

  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'Upcoming' | 'Cancelled' | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [eventToCancel, setEventToCancel] = useState<any>(null)

  const [extendDateForm, setExtendDateForm] = useState<ExtendDateForm>({
    start_datetime: new Date(),
    end_datetime: new Date(),
    reason: ''
  })
  const [postponeForm, setPostponeForm] = useState<PostponeForm>({
    new_start_datetime: new Date(),
    new_end_datetime: new Date(),
    reason: ''
  })
  const [closeForm, setCloseForm] = useState<CloseForm>({
    reason: '',
    send_certificates: false
  })
  const [transferForm, setTransferForm] = useState<TransferForm>({
    new_organizer_id: '',
    new_organizer: null,
    reason: ''
  })
  const [duplicateForm, setDuplicateForm] = useState<DuplicateForm>({
    new_title: '',
    new_start_datetime: new Date(),
    new_end_datetime: new Date()
  })

  const [selectedAttendees, setSelectedAttendees] = useState<string[]>([])

  useEffect(() => {
    loadEvents()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearEventsError())
    }
  }, [error, dispatch])

  const loadEvents = () => {
    dispatch(getAllEventsForAdmin({
      page: 1,
      limit: 1000,
    }))
  }

  const handleRefreshEvents = () => {
    loadEvents()
    setCurrentPage(1)
    toast.success("Events refreshed successfully!")
  }

  const filteredEvents = adminEvents.filter(event => {
    if (filters.search && !event.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !event.description?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !event.organizer?.first_name?.toLowerCase().includes(filters.search.toLowerCase()) &&
      !event.organizer?.last_name?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    if (filters.status !== 'all' && event.status !== filters.status) {
      return false
    }

    if (filters.event_type && event.event_type !== filters.event_type) {
      return false
    }

    if (filters.event_mode && event.event_mode !== filters.event_mode) {
      return false
    }

    if (filters.date_range.start) {
      const eventDate = new Date(event.start_datetime)
      if (eventDate < filters.date_range.start) return false
    }
    if (filters.date_range.end) {
      const eventDate = new Date(event.start_datetime)
      if (eventDate > filters.date_range.end) return false
    }

    return true
  })

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage)

  const handleExtendDate = async (event: any) => {
    try {
      await dispatch(extendEventDate({
        id: event.id,
        start_datetime: extendDateForm.start_datetime,
        end_datetime: extendDateForm.end_datetime,
        reason: extendDateForm.reason
      })).unwrap()

      toast.success("Event date extended successfully!")
      setShowExtendDateModal(false)
      setExtendDateForm({ start_datetime: new Date(), end_datetime: new Date(), reason: '' })
    } catch (error: any) {
      toast.error(error || "Failed to extend event date")
    }
  }

  const handleCloseEvent = async (event: any) => {
    try {
      await dispatch(closeEvent({
        id: event.id,
        reason: closeForm.reason,
        send_certificates: closeForm.send_certificates
      })).unwrap()

      toast.success("Event closed successfully!")
      setShowCloseEventModal(false)
      setCloseForm({ reason: '', send_certificates: false })
    } catch (error: any) {
      toast.error(error || "Failed to close event")
    }
  }

  const handlePostponeEvent = async (event: any) => {
    try {
      await dispatch(postponeEvent({
        id: event.id,
        new_start_datetime: postponeForm.new_start_datetime,
        new_end_datetime: postponeForm.new_end_datetime,
        reason: postponeForm.reason
      })).unwrap()

      toast.success("Event postponed successfully!")
      setShowPostponeModal(false)
      setPostponeForm({ new_start_datetime: new Date(), new_end_datetime: new Date(), reason: '' })
    } catch (error: any) {
      toast.error(error || "Failed to postpone event")
    }
  }

  const handleTransferOwnership = async (event: any) => {
    try {
      await dispatch(transferEventOwnership({
        id: event.id,
        new_organizer_id: transferForm.new_organizer_id,
        reason: transferForm.reason
      })).unwrap()

      toast.success("Event ownership transferred successfully!")
      setShowTransferModal(false)
      setTransferForm({ new_organizer_id: '', new_organizer: null, reason: '' })
    } catch (error: any) {
      toast.error(error || "Failed to transfer ownership")
    }
  }

  const handleBulkAttendeeAction = async (eventId: string, action: 'approve' | 'reject', reason?: string) => {
    if (selectedAttendees.length === 0) {
      toast.error("Please select attendees to perform this action")
      return
    }

    try {
      await dispatch(bulkAttendeeAction({
        eventId,
        user_ids: selectedAttendees,
        action,
        reason
      })).unwrap()

      toast.success(`Successfully ${action}ed ${selectedAttendees.length} attendees`)
      setSelectedAttendees([])
    } catch (error: any) {
      toast.error(error || "Failed to process bulk action")
    }
  }

  const handleDuplicateEvent = async (event: any) => {
    try {
      const result = await dispatch(duplicateEvent({
        id: event.id,
        new_title: duplicateForm.new_title,
        new_start_datetime: duplicateForm.new_start_datetime,
        new_end_datetime: duplicateForm.new_end_datetime
      })).unwrap()

      toast.success("Event duplicated successfully!")
      setShowDuplicateModal(false)
      setDuplicateForm({ new_title: '', new_start_datetime: new Date(), new_end_datetime: new Date() })
    } catch (error: any) {
      toast.error(error || "Failed to duplicate event")
    }
  }

  const handleExportAttendees = async (eventId: string) => {
    try {
      toast.success("Attendees exported successfully!")
    } catch (error: any) {
      toast.error("Failed to export attendees")
    }
  }

  const openStatusModal = (event: any, action: 'Upcoming' | 'Cancelled') => {
    setSelectedEvent(event)
    setStatusAction(action)
    setStatusReason('')
    setShowStatusModal(true)
  }

  const handleStatusChange = async () => {
    if (!selectedEvent || !statusAction) return

    if (statusAction === 'Cancelled' && !statusReason.trim()) {
      toast.error("Please provide a reason for cancellation")
      return
    }

    if (statusAction === 'Cancelled' && statusReason.length < 20) {
      toast.error("Please provide a more detailed reason (at least 20 characters)")
      return
    }

    try {
      await dispatch(activateDeactivateEvent({
        id: selectedEvent.id,
        status: statusAction,
        reason: statusAction === 'Cancelled' ? statusReason : undefined
      })).unwrap()

      toast.success(`Event ${statusAction === 'Upcoming' ? 'activated' : 'cancelled'} successfully!`)
      setShowStatusModal(false)
      setSelectedEvent(null)
      setStatusAction(null)
      setStatusReason('')
      loadEvents()
    } catch (err: any) {
      toast.error(err || `Failed to ${statusAction} event`)
    }
  }

  const openCancelModal = (event: any) => {
    setEventToCancel(event)
    setCancelReason('')
    setShowCancelModal(true)
  }

  const handleCancelEvent = async () => {
    if (!eventToCancel) return

    if (!cancelReason.trim() || cancelReason.length < 20) {
      toast.error("Please provide a detailed reason (at least 20 characters)")
      return
    }

    try {
      await dispatch(cancelEventPermanently({
        id: eventToCancel.id,
        reason: cancelReason
      })).unwrap()

      toast.success("Event cancelled permanently!")
      setShowCancelModal(false)
      setEventToCancel(null)
      setCancelReason('')
      loadEvents()
    } catch (err: any) {
      toast.error(err || "Failed to cancel event")
    }
  }

  const stats = {
    total: filteredEvents.length,
    upcoming: filteredEvents.filter(e => e.status === 'Upcoming').length,
    ongoing: filteredEvents.filter(e => e.status === 'Ongoing').length,
    completed: filteredEvents.filter(e => e.status === 'Completed').length,
    cancelled: filteredEvents.filter(e => e.status === 'Cancelled').length,
    totalAttendees: filteredEvents.reduce((sum, event) => sum + (event.attendees?.length || 0), 0)
  }

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Event Management Hub</h1>
              <p className="text-gray-600 mt-1">Manage all platform events</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefreshEvents}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => {/* Navigate to create event */ }}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>Create Event</span>
              </button>
              <button
                onClick={() => {/* Implement export all */ }}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold"
              >
                <Download className="w-4 h-4" />
                <span>Export All</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <StatsCards stats={stats} />
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <EventFilters
            filters={filters}
            onFiltersChange={setFilters}
            events={adminEvents}
          />
        </div>

        {/* Events Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <EnhancedEventsTable
            events={paginatedEvents}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
            onAction={(event, action) => {
              dispatch(setSelectedEventForManagement(event))
              switch (action) {
                case 'manage_attendees':
                  setShowManageAttendeesModal(true)
                  break
                case 'extend_date':
                  setShowExtendDateModal(true)
                  break
                case 'close_event':
                  setShowCloseEventModal(true)
                  break
                case 'postpone':
                  setShowPostponeModal(true)
                  break
                case 'transfer_ownership':
                  setShowTransferModal(true)
                  break
                case 'duplicate':
                  setDuplicateForm({
                    new_title: `Copy of ${event.title}`,
                    new_start_datetime: new Date(event.start_datetime),
                    new_end_datetime: new Date(event.end_datetime)
                  })
                  setShowDuplicateModal(true)
                  break
                case 'statistics':
                  dispatch(fetchEventStatistics({ id: event.id }))
                  setShowStatisticsModal(true)
                  break
                case 'activate_event':
                  openStatusModal(event, 'Upcoming')
                  break
                case 'cancel_event':
                  openStatusModal(event, 'Cancelled')
                  break
              }
            }}
            onStatusChange={openStatusModal}
            onPermanentCancel={openCancelModal}
          />
        </div>

        {/* Original Modals */}
        {showManageAttendeesModal && (
          <ManageAttendeesModal
            isOpen={showManageAttendeesModal}
            onClose={() => setShowManageAttendeesModal(false)}
            event={selectedEventForManagement}
            selectedAttendees={selectedAttendees}
            onSelectedAttendeesChange={setSelectedAttendees}
            onBulkAction={handleBulkAttendeeAction}
            onExportAttendees={handleExportAttendees}
          />
        )}

        {showExtendDateModal && (
          <ExtendDateModal
            isOpen={showExtendDateModal}
            onClose={() => setShowExtendDateModal(false)}
            event={selectedEventForManagement}
            form={extendDateForm}
            onFormChange={setExtendDateForm}
            onSubmit={handleExtendDate}
            isSubmitting={isSubmitting}
          />
        )}

        {showCloseEventModal && (
          <CloseEventModal
            isOpen={showCloseEventModal}
            onClose={() => setShowCloseEventModal(false)}
            event={selectedEventForManagement}
            form={closeForm}
            onFormChange={setCloseForm}
            onSubmit={handleCloseEvent}
            isSubmitting={isSubmitting}
          />
        )}

        {showPostponeModal && (
          <PostponeEventModal
            isOpen={showPostponeModal}
            onClose={() => setShowPostponeModal(false)}
            event={selectedEventForManagement}
            form={postponeForm}
            onFormChange={setPostponeForm}
            onSubmit={handlePostponeEvent}
            isSubmitting={isSubmitting}
          />
        )}

        {showTransferModal && (
          <TransferOwnershipModal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            event={selectedEventForManagement}
            form={transferForm}
            onFormChange={setTransferForm}
            onSubmit={handleTransferOwnership}
            isSubmitting={isSubmitting}
          />
        )}

        {showDuplicateModal && (
          <DuplicateEventModal
            isOpen={showDuplicateModal}
            onClose={() => setShowDuplicateModal(false)}
            event={selectedEventForManagement}
            form={duplicateForm}
            onFormChange={setDuplicateForm}
            onSubmit={handleDuplicateEvent}
            isSubmitting={isSubmitting}
          />
        )}

        {showStatisticsModal && (
          <StatisticsModal
            isOpen={showStatisticsModal}
            onClose={() => {
              setShowStatisticsModal(false)
              dispatch(clearEventStatistics())
            }}
            event={selectedEventForManagement}
            statistics={currentEventStatistics}
          />
        )}

        {/* Status Change Modal */}
        {showStatusModal && selectedEvent && statusAction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-10 animate-in fade-in duration-200 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
              {/* Modal Header */}
              <div className={`relative px-8 py-6 ${statusAction === 'Upcoming'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                  : 'bg-gradient-to-r from-orange-500 to-red-500'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm`}>
                      {statusAction === 'Upcoming' ? (
                        <CheckCircle className="w-8 h-8 text-white" />
                      ) : (
                        <XCircle className="w-8 h-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {statusAction === 'Upcoming' ? 'Activate Event' : 'Cancel Event'}
                      </h3>
                      <p className="text-white/90 text-sm mt-1">
                        {statusAction === 'Upcoming'
                          ? 'Make this event publicly visible'
                          : 'Hide this event from public view'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedEvent(null)
                      setStatusAction(null)
                      setStatusReason('')
                    }}
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">

                {/* Event Info Card */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{selectedEvent.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{selectedEvent.description?.substring(0, 150)}...</p>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {selectedEvent.event_type}
                      </span>
                      <span className="flex items-center">
                        <Globe className="w-3 h-3 mr-1" />
                        {selectedEvent.event_mode}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {selectedEvent.attendees?.length || 0} attendees
                      </span>
                    </div>
                    <div className="pt-3 border-t border-gray-300">
                      <p className="text-xs text-gray-600">
                        <strong>Organizer:</strong> {selectedEvent.organizer?.first_name} {selectedEvent.organizer?.last_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Email:</strong> {selectedEvent.organizer?.email}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Date:</strong> {formatDate(selectedEvent.start_datetime)} at {formatTime(selectedEvent.start_datetime)}
                      </p>
                    </div>
                  </div>
                </div>

                {statusAction === 'Cancelled' ? (
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-lg font-bold text-orange-900 mb-2">Important: Cancellation Impact</h5>
                        <ul className="space-y-2 text-sm text-orange-800">
                          <li className="flex items-start space-x-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>Event will be hidden from public view</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>Organizer will receive email notification</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-orange-500 mt-0.5">•</span>
                            <span>Event can be re-activated later</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h5 className="text-lg font-bold text-green-900 mb-2">Activation Benefits</h5>
                        <ul className="space-y-2 text-sm text-green-800">
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>Event will be publicly visible and searchable</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>Organizer will receive email notification</span>
                          </li>
                          <li className="flex items-start space-x-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>Users can register and view event details</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason Input */}
                {statusAction === 'Cancelled' && (
                  <div className="space-y-3">
                    <label className="block">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Cancellation Reason <span className="text-red-500">*</span>
                        </span>
                        <span className="text-xs text-gray-500">{statusReason.length}/500 characters</span>
                      </div>
                      <textarea
                        value={statusReason}
                        onChange={(e) => setStatusReason(e.target.value.slice(0, 500))}
                        placeholder="Please provide a detailed reason for cancelling this event..."
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all text-sm"
                        rows={5}
                        maxLength={500}
                      />
                    </label>
                    {statusReason.length < 20 && statusReason.length > 0 && (
                      <p className="text-xs text-orange-600 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Please provide a more detailed reason (at least 20 characters)</span>
                      </p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-gray-200">
                  <button
                    onClick={() => {
                      setShowStatusModal(false)
                      setSelectedEvent(null)
                      setStatusAction(null)
                      setStatusReason('')
                    }}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusChange}
                    disabled={isSubmitting || (statusAction === 'Cancelled' && (!statusReason.trim() || statusReason.length < 20))}
                    className={`px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 ${statusAction === 'Upcoming'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg'
                        : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
                      }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        {statusAction === 'Upcoming' ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Activate Event</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            <span>Cancel Event</span>
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Permanent Cancel Modal */}
        {showCancelModal && eventToCancel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 my-auto">
              {/* Compact Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Cancel Permanently</h3>
                      <p className="text-red-100 text-xs">Notify all attendees</p>
                    </div>
                  </div>
                  {!isSubmitting && (
                    <button
                      onClick={() => {
                        setShowCancelModal(false)
                        setEventToCancel(null)
                        setCancelReason('')
                      }}
                      className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Compact Body */}
              <div className="p-6 space-y-4">
                {/* Event Info - Compact */}
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900 mb-1">{eventToCancel.title}</p>
                  <p className="text-xs text-gray-500">
                    by {eventToCancel.organizer?.first_name} {eventToCancel.organizer?.last_name}
                  </p>
                </div>

                {/* Warning Box - Compact */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <h4 className="text-xs font-bold text-red-900 mb-2 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                    Permanent Cancellation Impact
                  </h4>
                  <ul className="space-y-1 text-xs text-red-800">
                    <li className="flex items-start">
                      <span className="mr-1.5">•</span>
                      <span>Event status set to Cancelled</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5">•</span>
                      <span>Organizer & attendees notified</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-1.5">•</span>
                      <span>Can be re-activated later</span>
                    </li>
                  </ul>
                </div>

                {/* Reason Input - Compact */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-900">
                      Reason <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-500">{cancelReason.length}/500</span>
                  </div>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value.slice(0, 500))}
                    placeholder="Provide detailed reason (min 20 characters)..."
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                    rows={3}
                    maxLength={500}
                  />
                  {cancelReason.length > 0 && cancelReason.length < 20 && (
                    <p className="text-xs text-red-600 flex items-center mt-1">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      At least 20 characters required
                    </p>
                  )}
                </div>
              </div>

              {/* Compact Footer */}
              <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowCancelModal(false)
                    setEventToCancel(null)
                    setCancelReason('')
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCancelEvent}
                  disabled={isSubmitting || !cancelReason.trim() || cancelReason.length < 20}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-bold disabled:opacity-50 flex items-center space-x-1.5 shadow-lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4" />
                      <span>Cancel Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}