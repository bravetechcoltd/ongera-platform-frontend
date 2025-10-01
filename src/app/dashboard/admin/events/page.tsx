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
  clearEventsError,
  deleteEvent
} from "@/lib/features/auth/eventsSlice"
import {
  Calendar, Users, Clock, Search, RefreshCw, Plus,
  Download, Filter, MoreVertical, Edit, Eye, BarChart3,
  CalendarRange, Clock4, UserCog, Copy, Trash2, Loader2,
  CheckCircle, XCircle, X, AlertTriangle, MapPin, Globe,
  ChevronLeft, ChevronRight, Mail, Phone, Shield,
  CheckCircle2, User, SlidersHorizontal, Hash
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import ViewEventDetailsModal from "./components/modals/ViewEventDetailsModal"
// Import modals
import ManageAttendeesModal from "./components/modals/ManageAttendeesModal"
import ExtendDateModal from "./components/modals/ExtendDateModal"
import CloseEventModal from "./components/modals/CloseEventModal"
import PostponeEventModal from "./components/modals/PostponeEventModal"
import TransferOwnershipModal from "./components/modals/TransferOwnershipModal"
import DuplicateEventModal from "./components/modals/DuplicateEventModal"
import StatisticsModal from "./components/modals/StatisticsModal"

// Action Modal Component
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
      { id: 'close_event', label: 'Close Event', icon: Clock4, color: 'text-red-600', bg: 'bg-red-50' },
      { id: 'statistics', label: 'View Statistics', icon: BarChart3, color: 'text-orange-600', bg: 'bg-orange-50' },
      { id: 'delete', label: 'Delete Event', icon: Trash2, color: 'text-red-600', bg: 'bg-red-50' } // Add this line
    ]
  },
  {
    name: "Date & Time",
    actions: [
      { id: 'extend_date', label: 'Extend Date', icon: CalendarRange, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { id: 'postpone', label: 'Postpone Event', icon: Clock4, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    ]
  },
]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-[#0158B7] px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <MoreVertical className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Event Actions</h2>
                  <p className="text-white/90 text-sm">{event?.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
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
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border border-gray-200 transition-all hover:shadow-md ${action.bg}`}
                        >
                          <Icon className={`w-4 h-4 ${action.color}`} />
                          <span className="font-medium text-gray-900 text-sm">{action.label}</span>
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
  onViewDetails: (event: any) => void
  onDelete: (event: any) => void 
}

function EnhancedEventsTable({
  events,
  isLoading,
  currentPage,
  totalPages,
  startIndex,
  onPageChange,
  onAction,
  onStatusChange,
  onPermanentCancel,
  onDelete,
  onViewDetails
}: EnhancedEventsTableProps) {
  const [actionModalEvent, setActionModalEvent] = useState<any>(null)
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Upcoming': { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      'Ongoing': { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle2 },
      'Completed': { bg: 'bg-gray-100', text: 'text-gray-800', icon: CheckCircle2 },
      'Cancelled': { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Upcoming']
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-3 h-3" />
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

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Webinar': return "bg-purple-100 text-purple-700"
      case 'Conference': return "bg-blue-100 text-blue-700"
      case 'Workshop': return "bg-green-100 text-green-700"
      case 'Seminar': return "bg-orange-100 text-orange-700"
      case 'Meetup': return "bg-pink-100 text-pink-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getModeBadgeColor = (mode: string) => {
    switch (mode) {
      case 'Online': return "bg-cyan-100 text-cyan-700"
      case 'Physical': return "bg-emerald-100 text-emerald-700"
      case 'Hybrid': return "bg-amber-100 text-amber-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0158B7]" />
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0158B7] text-white">
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">#</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Event</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Organizer</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Date & Time</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Type/Mode</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Attendees</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Status</th>
              <th className="px-2 py-2 text-center text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {events.map((event, index) => {
              const globalIndex = startIndex + index + 1

              return (
                <motion.tr
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-blue-50 transition-colors group"
                >
                  {/* Number */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="w-5 h-5 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-white">{globalIndex}</span>
                    </div>
                  </td>
{/* Event Info */}
<td className="px-2 py-2">
  <div className="flex items-start space-x-2 min-w-0 max-w-xs">
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#0158B7] transition-colors">
        {event.title.split(' ').slice(0, 2).join(' ')}
        {event.title.split(' ').length > 2 && '...'}
      </p>
    </div>
  </div>
</td>

                  {/* Organizer */}
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2">

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {event.organizer?.first_name} {event.organizer?.last_name}
                        </p>

                      </div>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="px-2 py-2 whitespace-nowrap">
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
                  <td className="px-2 py-2">
                    <div className="space-y-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(event.event_type)}`}>
                        <Hash className="w-3 h-3 mr-1" />
                        {event.event_type}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getModeBadgeColor(event.event_mode)}`}>
                        <Globe className="w-3 h-3 mr-1" />
                        {event.event_mode}
                      </span>
                    </div>
                  </td>

                  {/* Attendees */}
                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                        <Users className="w-3 h-3" />
                        <span className="text-xs font-semibold">{event.attendees?.length || 0}</span>
                      </div>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    {getStatusBadge(event.status)}
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onViewDetails(event)}
                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all transform hover:scale-110 shadow-sm"
                        title="View Event Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onStatusChange(event, event.status === 'Cancelled' ? 'Upcoming' : 'Cancelled')}
                        className={`p-1.5 rounded-lg transition-all transform hover:scale-110 ${event.status === 'Cancelled'
                            ? 'bg-green-100 text-green-600 hover:bg-green-200 shadow-sm'
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200 shadow-sm'
                          }`}
                        title={event.status === 'Cancelled' ? 'Activate Event' : 'Cancel Event'}
                      >
                        {event.status === 'Cancelled' ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      </button>
<button
  onClick={() => onDelete(event)}
  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all transform hover:scale-110 shadow-sm"
  title="Delete Event (Soft Delete)"
>
  <Trash2 className="w-3.5 h-3.5" />
</button>
        

                      <button
                        onClick={() => setActionModalEvent(event)}
                        className="p-1.5 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-110 shadow-sm"
                        title="More Actions"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(startIndex + events.length, events.length)}</span> of{' '}
              <span className="font-semibold">{events.length}</span> events
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => onPageChange(pageNum)}
                      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${currentPage === pageNum
                          ? "bg-[#0158B7] text-white shadow-sm"
                          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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

// Stats Cards Component
interface StatsCardsProps {
  stats: {
    total: number
    upcoming: number
    ongoing: number
    completed: number
    cancelled: number
    totalAttendees: number
  }
}

function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Events",
      value: stats.total,
      icon: Calendar,
      color: "bg-[#0158B7]",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      borderColor: "border-blue-200"
    },
    {
      label: "Upcoming",
      value: stats.upcoming,
      icon: Clock,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200"
    },
    {
      label: "Ongoing",
      value: stats.ongoing,
      icon: Users,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      borderColor: "border-purple-200"
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle2,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700",
      borderColor: "border-gray-200"
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700",
      borderColor: "border-red-200"
    },
    {
      label: "Total Attendees",
      value: stats.totalAttendees,
      icon: User,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      borderColor: "border-orange-200"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={index} className={`${item.bgColor} rounded-lg border ${item.borderColor} p-3 hover:shadow-sm transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className={`text-xs font-medium ${item.textColor}`}>{item.label}</p>
              </div>
              <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-4 h-4 ${item.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
// Event Filters Component
interface EventFiltersProps {
  filters: any
  onFiltersChange: (filters: any) => void
  events: any[]
}

function EventFilters({ filters, onFiltersChange, events }: EventFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const eventTypes = Array.from(new Set(events.map(e => e.event_type).filter(Boolean)))
  const eventModes = Array.from(new Set(events.map(e => e.event_mode).filter(Boolean)))
  const statuses = ['all', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled']

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      event_type: '',
      event_mode: '',
      date_range: { start: null, end: null }
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || filters.event_type || filters.event_mode || filters.date_range.start || filters.date_range.end

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:text-gray-800 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-all text-xs ${
              showAdvanced
                ? "bg-[#0158B7] text-white border border-blue-300"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3 mr-1" />
            Advanced
          </button>
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Search events..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7] focus:border-[#0158B7]"
          />
        </div>

        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7] focus:border-[#0158B7]"
        >
          {statuses.map(status => (
            <option key={status} value={status}>
              {status === 'all' ? 'All Status' : status}
            </option>
          ))}
        </select>

        {/* Event Type */}
        <select
          value={filters.event_type}
          onChange={(e) => updateFilter('event_type', e.target.value)}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7] focus:border-[#0158B7]"
        >
          <option value="">All Event Types</option>
          {eventTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        {/* Event Mode */}
        <select
          value={filters.event_mode}
          onChange={(e) => updateFilter('event_mode', e.target.value)}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7] focus:border-[#0158B7]"
        >
          <option value="">All Modes</option>
          {eventModes.map(mode => (
            <option key={mode} value={mode}>{mode}</option>
          ))}
        </select>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="pt-3 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Date Range */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Date Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.date_range.start ? filters.date_range.start.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFilter('date_range', {
                      ...filters.date_range,
                      start: e.target.value ? new Date(e.target.value) : null
                    })}
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7] focus:border-[#0158B7]"
                  />
                  <input
                    type="date"
                    value={filters.date_range.end ? filters.date_range.end.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFilter('date_range', {
                      ...filters.date_range,
                      end: e.target.value ? new Date(e.target.value) : null
                    })}
                    className="px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7] focus:border-[#0158B7]"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Main Component
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
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false)
  const [selectedEventForView, setSelectedEventForView] = useState<any>(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'Upcoming' | 'Cancelled' | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
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
const [showDeleteModal, setShowDeleteModal] = useState(false)
const [eventToDelete, setEventToDelete] = useState<any>(null)

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

const handleDeleteEvent = async () => {
  if (!eventToDelete) return

  // Extra safety check
  if (deleteConfirmationText !== 'DELETE') {
    toast.error("Please type DELETE to confirm permanent deletion")
    return
  }

  try {
    await dispatch(deleteEvent(eventToDelete.id)).unwrap()
    toast.success("Event permanently deleted successfully!")
    setShowDeleteModal(false)
    setEventToDelete(null)
    setDeleteConfirmationText('')
    loadEvents() 
  } catch (err: any) {
    toast.error(err || "Failed to permanently delete event")
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
<motion.div
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4"
>
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 bg-[#0158B7] rounded-lg flex items-center justify-center">
        <Calendar className="w-4 h-4 text-white" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-gray-900">
          Event Management
        </h1>
        <p className="text-xs text-gray-500">{filteredEvents.length} filtered events • {adminEvents.length} total events</p>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <button
        onClick={handleRefreshEvents}
        disabled={isLoading}
        className="flex items-center px-2 py-1.5 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs"
      >
        <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
        Refresh
      </button>
      <button
        onClick={() => {/* Navigate to create event */ }}
        className="flex items-center px-2 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs"
      >
        <Plus className="w-3 h-3 mr-1" />
        Create
      </button>
      <button
        onClick={() => {/* Implement export all */ }}
        className="flex items-center px-2 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
      >
        <Download className="w-3 h-3 mr-1" />
        Export
      </button>
    </div>
  </div>

  {/* Stats Cards */}
  <StatsCards stats={stats} />
</motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
            <button
              onClick={() => dispatch(clearEventsError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4"
        >
          <EventFilters
            filters={filters}
            onFiltersChange={setFilters}
            events={adminEvents}
          />
        </motion.div>

        {/* Events Table Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
        >
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
  onViewDetails={(event) => {
    setSelectedEventForView(event)
    setShowViewDetailsModal(true)
  }}
  onDelete={(event) => {
    setEventToDelete(event)
    setShowDeleteModal(true)
  }}
/>
        </motion.div>

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

{/* Delete Confirmation Modal - PERMANENT DELETE */}
{showDeleteModal && eventToDelete && (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
      {/* Modal Header */}
      <div className="bg-red-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Permanently Delete Event</h3>
              <p className="text-red-100 text-sm">This action CANNOT be undone</p>
            </div>
          </div>
          {!isSubmitting && (
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setEventToDelete(null)
              }}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Modal Body */}
      <div className="p-6 space-y-4">
        {/* Event Info */}
        <div className="text-center">
          <p className="text-sm font-bold text-gray-900 mb-1">{eventToDelete.title}</p>
          <p className="text-xs text-gray-500">
            by {eventToDelete.organizer?.first_name} {eventToDelete.organizer?.last_name}
          </p>
        </div>

        {/* Warning Box - Changed to red for permanent delete */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <h4 className="text-xs font-bold text-red-900 mb-2 flex items-center">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            ⚠️ Permanent Deletion Warning
          </h4>
          <ul className="space-y-1 text-xs text-red-800">
            <li className="flex items-start">
              <span className="mr-1.5">•</span>
              <span>Event will be COMPLETELY REMOVED from the database</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5">•</span>
              <span>All attendee records will be permanently deleted</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5">•</span>
              <span>All agenda items will be permanently deleted</span>
            </li>
            <li className="flex items-start">
              <span className="mr-1.5">•</span>
              <span>This action CANNOT be reversed or restored</span>
            </li>
          </ul>
        </div>

        {/* Additional Warning */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs text-orange-800 flex items-start">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 flex-shrink-0 mt-0.5" />
            <span>
              <span className="font-bold">This is permanent.</span> The event and all associated data 
              (attendees, registrations, agenda items) will be completely erased from the system. 
              No one will be able to access this event again.
            </span>
          </p>
        </div>

        {/* Confirmation Input - Optional: Add for extra safety */}
        <div className="pt-2">
          <label className="block text-xs text-gray-600 mb-1">
            Type <span className="font-bold text-red-600">DELETE</span> to confirm:
          </label>
          <input
            type="text"
            value={deleteConfirmationText}
            onChange={(e) => setDeleteConfirmationText(e.target.value)}
            placeholder="Type DELETE here"
            className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
          />
        </div>
      </div>

      {/* Modal Footer */}
      <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2 border-t border-gray-200">
        <button
          onClick={() => {
            setShowDeleteModal(false)
            setEventToDelete(null)
            setDeleteConfirmationText('') // Reset confirmation
          }}
          disabled={isSubmitting}
          className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteEvent}
          disabled={isSubmitting || deleteConfirmationText !== 'DELETE'} // Require confirmation
          className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-sm font-bold disabled:opacity-50 flex items-center space-x-1.5 shadow-lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Permanently Deleting...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Permanently Delete</span>
            </>
          )}
        </button>
      </div>
    </div>
  </div>
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
        {showViewDetailsModal && (
          <ViewEventDetailsModal
            isOpen={showViewDetailsModal}
            onClose={() => {
              setShowViewDetailsModal(false)
              setSelectedEventForView(null)
            }}
            event={selectedEventForView}
          />
        )}

        {/* Enhanced Status Change Modal */}
        {showStatusModal && selectedEvent && statusAction && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className={`px-6 py-4 ${statusAction === 'Upcoming' ? 'bg-[#0158B7]' : 'bg-orange-500'
                }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      {statusAction === 'Upcoming' ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <XCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">
                        {statusAction === 'Upcoming' ? 'Activate Event' : 'Cancel Event'}
                      </h3>
                      <p className="text-white/90 text-sm">
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
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Event Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-500">
                      {selectedEvent.cover_image_url ? (
                        <img
                          src={selectedEvent.cover_image_url}
                          alt={selectedEvent.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                          {selectedEvent.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">
                        {selectedEvent.title}
                      </h4>
                      <p className="text-xs text-gray-600">{selectedEvent.event_type} • {selectedEvent.event_mode}</p>
                    </div>
                  </div>
                </div>

                {/* Reason Input */}
                {statusAction === 'Cancelled' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Cancellation Reason <span className="text-red-500">*</span>
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        {statusReason.length}/500
                      </span>
                    </label>
                    <textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value.slice(0, 500))}
                      placeholder="Please provide a detailed reason for cancellation (minimum 20 characters)..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                      rows={3}
                    />
                    {statusReason.length < 20 && statusReason.length > 0 && (
                      <p className="text-xs text-orange-600 flex items-center space-x-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Minimum 20 characters required</span>
                      </p>
                    )}
                  </div>
                )}

                {statusAction === 'Upcoming' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-900">
                      Welcome Message <span className="text-gray-400">(Optional)</span>
                      <span className="text-xs text-gray-500 font-normal ml-2">
                        {statusReason.length}/300
                      </span>
                    </label>
                    <textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value.slice(0, 300))}
                      placeholder="Add a welcome message for attendees..."
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] resize-none"
                      rows={2}
                    />
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedEvent(null)
                    setStatusAction(null)
                    setStatusReason('')
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={
                    isSubmitting ||
                    (statusAction === 'Cancelled' && (!statusReason.trim() || statusReason.length < 20))
                  }
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${statusAction === 'Upcoming'
                      ? 'bg-[#0158B7] hover:bg-blue-700 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                    } disabled:opacity-50`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {statusAction === 'Upcoming' ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Activate</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>Cancel</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Permanent Cancel Modal */}
        {showCancelModal && eventToCancel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-red-500 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Cancel Permanently</h3>
                      <p className="text-red-100 text-sm">Notify all attendees</p>
                    </div>
                  </div>
                  {!isSubmitting && (
                    <button
                      onClick={() => {
                        setShowCancelModal(false)
                        setEventToCancel(null)
                        setCancelReason('')
                      }}
                      className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4">
                {/* Event Info */}
                <div className="text-center">
                  <p className="text-sm font-bold text-gray-900 mb-1">{eventToCancel.title}</p>
                  <p className="text-xs text-gray-500">
                    by {eventToCancel.organizer?.first_name} {eventToCancel.organizer?.last_name}
                  </p>
                </div>

                {/* Warning Box */}
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

                {/* Reason Input */}
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

              {/* Modal Footer */}
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