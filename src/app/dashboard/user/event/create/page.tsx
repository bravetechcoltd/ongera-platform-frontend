"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createEvent } from "@/lib/features/auth/eventsSlice"
import {
  Calendar, Upload, X, Loader2, Save,
  MapPin, Video, DollarSign, Users, Clock, Globe, ArrowLeft,
  CheckCircle, Eye, Share2, ArrowRight, Image
} from "lucide-react"

const EVENT_TYPES = ["Webinar", "Conference", "Workshop", "Seminar", "Meetup"]
const EVENT_MODES = ["Online", "Physical", "Hybrid"]

interface EventSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
}

function EventSuccessModal({ isOpen, onClose, eventId }: EventSuccessModalProps) {
  const router = useRouter()
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const nextActions = [
    {
      id: 'preview',
      icon: Eye,
      title: 'View Event',
      description: 'See event details',
      action: () => router.push(`/dashboard/user/event/${eventId}`)
    },
    {
      id: 'share',
      icon: Share2,
      title: 'Share Event',
      description: 'Promote in communities',
      action: () => router.push(`/dashboard/user/communities`)
    },
    {
      id: 'manage',
      icon: Calendar,
      title: 'Manage',
      description: 'Add agenda & attendees',
      action: () => router.push(`/dashboard/user/event/manage/${eventId}`)
    }
  ]

  if (!isOpen) return null

  const handleContinue = () => {
    const action = nextActions.find(a => a.id === selectedAction)
    if (action) {
      action.action()
    } else {
      onClose()
      router.push('/dashboard/user/event')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* Compact Header */}
        <div className="relative bg-gradient-to-r from-[#0158B7] to-[#5E96D2] px-4 py-4 text-white">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Event Created!</h2>
              <p className="text-[#5E96D2] text-xs mt-0.5">Ready for registrations</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Compact Next Actions */}
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">What's Next?</h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {nextActions.map((action) => {
                const Icon = action.icon
                const isSelected = selectedAction === action.id

                return (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={`relative p-2 rounded-lg border transition-all duration-200 text-left group ${isSelected
                        ? 'border-[#0158B7] bg-[#0158B7]/10'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                  >
                    <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#0158B7] to-[#5E96D2] mb-1">
                      <Icon className="w-4 h-4 text-white" />
                    </div>

                    <h4 className="font-semibold text-gray-900 text-xs mb-0.5">{action.title}</h4>
                    <p className="text-[10px] text-gray-600 leading-tight">{action.description}</p>

                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#0158B7] flex items-center justify-center">
                        <CheckCircle className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Compact Footer */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => {
                onClose()
                router.push('/dashboard/user/event')
              }}
              className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              My Events
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedAction}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${selectedAction
                  ? 'bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white hover:shadow'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CreateEventPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isSubmitting } = useAppSelector(state => state.events)
  const coverImageRef = useRef<HTMLInputElement>(null)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdEventId, setCreatedEventId] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'Webinar',
    event_mode: 'Online',
    start_datetime: '',
    end_datetime: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    location_address: '',
    online_meeting_url: '',
    meeting_id: '',
    meeting_password: '',
    max_attendees: '',
    registration_deadline: '',
    is_free: true,
    price_amount: '',
    requires_approval: false,
    community_id: '',
    linked_project_ids: [] as string[]
  })

  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB")
        return
      }
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setCoverPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.start_datetime || !formData.end_datetime) {
      alert("Please fill in all required fields")
      return
    }

    if (new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
      alert("End date must be after start date")
      return
    }

    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        if (Array.isArray(value)) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value.toString())
        }
      }
    })

    if (coverImage) {
      submitData.append('cover_image', coverImage)
    }

    try {
      const result = await dispatch(createEvent(submitData)).unwrap()
      setCreatedEventId(result.id)
      setShowSuccessModal(true)
    } catch (err: any) {
      alert(err || "Failed to create event")
    }
  }

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
        <div className="max-w-4xl mx-auto">

          <div className="mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-xs text-gray-600 hover:text-[#0158B7] transition-colors font-medium mb-3 group"
            >
              <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
              Back to Events
            </button>

            <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Create New Event
            </h1>
            <p className="text-xs text-gray-500">Organize a research event for the community</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 space-y-4">

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Basic Information</h2>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>
                      <Calendar className="w-3 h-3" />
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="e.g., AI in Healthcare Research Symposium"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className={inputClass}
                      placeholder="Describe what attendees can expect from this event..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>
                        Event Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="event_type"
                        value={formData.event_type}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        {EVENT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Event Mode <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="event_mode"
                        value={formData.event_mode}
                        onChange={handleInputChange}
                        className={inputClass}
                      >
                        {EVENT_MODES.map(mode => (
                          <option key={mode} value={mode}>{mode}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Date & Time</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      <Clock className="w-3 h-3" />
                      Start Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="start_datetime"
                      value={formData.start_datetime}
                      onChange={handleInputChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Clock className="w-3 h-3" />
                      End Date & Time <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="end_datetime"
                      value={formData.end_datetime}
                      onChange={handleInputChange}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Globe className="w-3 h-3" />
                      Timezone
                    </label>
                    <input
                      type="text"
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleInputChange}
                      className={inputClass}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Registration Deadline
                    </label>
                    <input
                      type="datetime-local"
                      name="registration_deadline"
                      value={formData.registration_deadline}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Location Details</h2>

                {(formData.event_mode === 'Online' || formData.event_mode === 'Hybrid') && (
                  <div className="space-y-3 mb-3">
                    <div>
                      <label className={labelClass}>
                        <Video className="w-3 h-3" />
                        Meeting URL {formData.event_mode === 'Online' && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="url"
                        name="online_meeting_url"
                        value={formData.online_meeting_url}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="https://zoom.us/j/..."
                        required={formData.event_mode === 'Online'}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className={labelClass}>
                          Meeting ID
                        </label>
                        <input
                          type="text"
                          name="meeting_id"
                          value={formData.meeting_id}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="123 456 7890"
                        />
                      </div>

                      <div>
                        <label className={labelClass}>
                          Meeting Password
                        </label>
                        <input
                          type="text"
                          name="meeting_password"
                          value={formData.meeting_password}
                          onChange={handleInputChange}
                          className={inputClass}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {(formData.event_mode === 'Physical' || formData.event_mode === 'Hybrid') && (
                  <div>
                    <label className={labelClass}>
                      <MapPin className="w-3 h-3" />
                      Location Address {formData.event_mode === 'Physical' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="text"
                      name="location_address"
                      value={formData.location_address}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Full address with city and country"
                      required={formData.event_mode === 'Physical'}
                    />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Registration Settings</h2>

                <div className="space-y-3">
                  <div>
                    <label className={labelClass}>
                      <Users className="w-3 h-3" />
                      Maximum Attendees
                    </label>
                    <input
                      type="number"
                      name="max_attendees"
                      value={formData.max_attendees}
                      onChange={handleInputChange}
                      className={inputClass}
                      placeholder="Leave empty for unlimited"
                      min="1"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="is_free"
                        checked={formData.is_free}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#0158B7] focus:ring-[#0158B7]"
                      />
                      <span className="text-sm font-medium text-gray-700">Free Event</span>
                    </label>
                  </div>

                  {!formData.is_free && (
                    <div>
                      <label className={labelClass}>
                        <DollarSign className="w-3 h-3" />
                        Price Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="price_amount"
                        value={formData.price_amount}
                        onChange={handleInputChange}
                        className={inputClass}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required={!formData.is_free}
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="requires_approval"
                        checked={formData.requires_approval}
                        onChange={handleInputChange}
                        className="w-4 h-4 rounded border-gray-300 text-[#0158B7] focus:ring-[#0158B7]"
                      />
                      <span className="text-sm font-medium text-gray-700">Require Approval for Registration</span>
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-gray-900 mb-3">Cover Image (Optional)</h2>

                <div
                  onClick={() => coverImageRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-[#0158B7] hover:bg-[#0158B7]/5 transition-all"
                >
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Cover"
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setCoverImage(null)
                          setCoverPreview('')
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Image className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs font-medium text-gray-700 mb-0.5">
                        Click to upload cover image
                      </p>
                      <p className="text-[10px] text-gray-500">JPG, PNG (Max 5MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={coverImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow transition-all text-xs font-semibold disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3" />
                    Create Event
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <EventSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        eventId={createdEventId}
      />
    </>
  )
}