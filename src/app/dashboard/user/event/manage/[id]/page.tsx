"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import api from "@/lib/api"
import {
  Calendar, Users, Clock, Edit3, Trash2, CheckCircle, 
  XCircle, AlertCircle, Loader2, Plus, ArrowLeft, Save,
  Video, MapPin, DollarSign, Settings
} from "lucide-react"
import { toast } from "react-hot-toast"

export default function EventManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAppSelector(state => state.auth)
  
  const [activeTab, setActiveTab] = useState('details')
  const [event, setEvent] = useState<any>(null)
  const [attendees, setAttendees] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [attendeeFilter, setAttendeeFilter] = useState('all')

  useEffect(() => {
    loadEventData()
  }, [params.id])

  useEffect(() => {
    if (activeTab === 'attendees') {
      loadAttendees()
    }
  }, [activeTab, attendeeFilter])

  const loadEventData = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/events/${params.id}`)
      const eventData = response.data.data.event
      
      if (eventData.organizer.id !== user?.id) {
        toast.error("You don't have permission to manage this event")
        router.push(`/dashboard/user/event/${params.id}`)
        return
      }
      
      setEvent(eventData)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load event")
      router.push('/dashboard/user/event')
    } finally {
      setIsLoading(false)
    }
  }

  const loadAttendees = async () => {
    try {
      const statusParam = attendeeFilter !== 'all' ? `?status=${attendeeFilter}` : ''
      const response = await api.get(`/events/${params.id}/attendees${statusParam}`)
      setAttendees(response.data.data.attendees)
    } catch (error: any) {
      toast.error("Failed to load attendees")
    }
  }

  const handleUpdateAttendeeStatus = async (userId: string, status: string) => {
    try {
      setIsSubmitting(true)
      await api.put(`/events/${params.id}/attendees/${userId}`, { status })
      toast.success(`Attendee ${status}`)
      loadAttendees()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update status")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveAttendee = async (userId: string) => {
    if (!confirm("Remove this attendee?")) return
    
    try {
      setIsSubmitting(true)
      await api.delete(`/events/${params.id}/attendees/${userId}`)
      toast.success("Attendee removed")
      loadAttendees()
    } catch (error: any) {
      toast.error("Failed to remove attendee")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteEvent = async () => {
    if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return
    
    try {
      setIsSubmitting(true)
      await api.delete(`/events/${params.id}`)
      toast.success("Event deleted successfully")
      router.push('/dashboard/user/event')
    } catch (error: any) {
      toast.error("Failed to delete event")
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const config: any = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      approved: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', icon: XCircle }
    }
    
    const { bg, text, icon: Icon } = config[status.toLowerCase()] || config.pending
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${bg} ${text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors font-medium mb-4 group"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Event
        </button>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.start_datetime).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.attendees?.length || 0} attendees
                  </span>
                </div>
              </div>
              <button
                onClick={handleDeleteEvent}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Event
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6">
            {[
              { id: 'details', label: 'Event Details', icon: Settings },
              { id: 'attendees', label: 'Attendees', icon: Users },
              { id: 'agenda', label: 'Agenda', icon: Clock }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'attendees' && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {event.attendees?.length || 0}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Event Type</h3>
                    <p className="text-gray-900">{event.event_type}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Event Mode</h3>
                    <p className="text-gray-900">{event.event_mode}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                    <p className="text-gray-900">{event.status}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Pricing</h3>
                    <p className="text-gray-900">
                      {event.is_free ? 'Free' : `$${event.price_amount}`}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Description</h3>
                  <p className="text-blue-800 whitespace-pre-wrap">{event.description}</p>
                </div>

                <button
                  onClick={() => router.push(`/dashboard/user/event/${event.id}`)}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Event Details
                </button>
              </div>
            )}

            {/* Attendees Tab */}
            {activeTab === 'attendees' && (
              <div className="space-y-4">
                
                {/* Filters */}
                <div className="flex gap-2">
                  {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setAttendeeFilter(filter)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        attendeeFilter === filter
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>

                {/* Attendees List */}
                {attendees.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No attendees yet</h3>
                    <p className="text-gray-600">
                      {attendeeFilter === 'all' 
                        ? 'No one has registered for this event yet'
                        : `No ${attendeeFilter} attendees`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white font-semibold">
                            {attendee.user.first_name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {attendee.user.first_name} {attendee.user.last_name}
                            </h4>
                            <p className="text-xs text-gray-600">
                              Registered: {new Date(attendee.registered_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          {getStatusBadge(attendee.registration_status)}
                          
                          {attendee.registration_status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateAttendeeStatus(attendee.user.id, 'approved')}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateAttendeeStatus(attendee.user.id, 'rejected')}
                                disabled={isSubmitting}
                                className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                          
                          <button
                            onClick={() => handleRemoveAttendee(attendee.user.id)}
                            disabled={isSubmitting}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-xs font-medium disabled:opacity-50"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Agenda Tab */}
            {activeTab === 'agenda' && (
              <div className="space-y-4">
                <button
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Agenda Item
                </button>

                {event.agenda_items && event.agenda_items.length > 0 ? (
                  <div className="space-y-3">
                    {event.agenda_items.map((item: any) => (
                      <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{item.session_title}</h4>
                          <div className="flex gap-2">
                            <button className="p-1 text-blue-600 hover:bg-blue-100 rounded">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-red-600 hover:bg-red-100 rounded">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{item.start_time} - {item.end_time}</span>
                          {item.speaker_name && <span>Speaker: {item.speaker_name}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No agenda items yet</h3>
                    <p className="text-gray-600">Add sessions and schedule for your event</p>
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