import { useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createCommunityEvent, fetchCommunityEvents } from "@/lib/features/auth/eventsSlice"
import { X, Calendar, Clock, MapPin, Video, Users, DollarSign, Upload, Image as ImageIcon, Loader2 } from "lucide-react"
import { toast } from "react-hot-toast"

const EVENT_TYPES = ["Webinar", "Conference", "Workshop", "Seminar", "Meetup"]
const EVENT_MODES = ["Online", "Physical", "Hybrid"]

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  communityId: string
  communityName: string
}

export default function CreateEventModal({ isOpen, onClose, communityId, communityName }: CreateEventModalProps) {
  const dispatch = useAppDispatch()
  const { isSubmitting } = useAppSelector(state => state.events)
  const coverImageRef = useRef<HTMLInputElement>(null)

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
    requires_approval: false
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
        toast.error("Image must be less than 5MB")
        return
      }
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => setCoverPreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
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
      requires_approval: false
    })
    setCoverImage(null)
    setCoverPreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.start_datetime || !formData.end_datetime) {
      toast.error("Please fill in all required fields")
      return
    }

    if (new Date(formData.end_datetime) <= new Date(formData.start_datetime)) {
      toast.error("End date must be after start date")
      return
    }

    if (formData.event_mode === 'Online' && !formData.online_meeting_url) {
      toast.error("Meeting URL is required for online events")
      return
    }

    if (formData.event_mode === 'Physical' && !formData.location_address) {
      toast.error("Location address is required for physical events")
      return
    }

    const submitData = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        submitData.append(key, value.toString())
      }
    })

    if (coverImage) {
      submitData.append('cover_image', coverImage)
    }

    try {
      await dispatch(createCommunityEvent({ communityId, eventData: submitData })).unwrap()
      toast.success("Event created successfully!")
      
      // Refresh community events
      dispatch(fetchCommunityEvents({ communityId }))
      
      resetForm()
      onClose()
    } catch (err: any) {
      toast.error(err || "Failed to create event")
    }
  }

  if (!isOpen) return null

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto pt-20">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-white">Create Community Event</h2>
            <p className="text-emerald-100 text-sm mt-0.5">For {communityName}</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-6 space-y-4">
          
          {/* Basic Info */}
          <div className="space-y-3">
            <div>
              <label className={labelClass}>
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={inputClass}
                placeholder="e.g., Research Collaboration Workshop"
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
                placeholder="Describe what attendees can expect..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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

          {/* Date & Time */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Date & Time</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  <Clock className="w-3 h-3 inline mr-1" />
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
                  <Clock className="w-3 h-3 inline mr-1" />
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
            </div>
          </div>

          {/* Location Details */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Location Details</h3>
            
            {(formData.event_mode === 'Online' || formData.event_mode === 'Hybrid') && (
              <div className="space-y-3 mb-3">
                <div>
                  <label className={labelClass}>
                    <Video className="w-3 h-3 inline mr-1" />
                    Meeting URL <span className="text-red-500">*</span>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Meeting ID</label>
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
                    <label className={labelClass}>Meeting Password</label>
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
                  <MapPin className="w-3 h-3 inline mr-1" />
                  Location Address <span className="text-red-500">*</span>
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

          {/* Registration Settings */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Registration Settings</h3>
            
            <div className="space-y-3">
              <div>
                <label className={labelClass}>
                  <Users className="w-3 h-3 inline mr-1" />
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

              <div>
                <label className={labelClass}>Registration Deadline</label>
                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="is_free"
                    checked={formData.is_free}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Free Event</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="requires_approval"
                    checked={formData.requires_approval}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Require Approval</span>
                </label>
              </div>

              {!formData.is_free && (
                <div>
                  <label className={labelClass}>
                    <DollarSign className="w-3 h-3 inline mr-1" />
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
            </div>
          </div>

          {/* Cover Image */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">Cover Image (Optional)</h3>
            
            <div
              onClick={() => coverImageRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all"
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
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-700">Click to upload cover image</p>
                  <p className="text-xs text-gray-500">JPG, PNG (Max 5MB)</p>
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
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3 rounded-b-2xl">
          <button
            type="button"
            onClick={() => {
              resetForm()
              onClose()
            }}
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Create Event
              </>
            )}
          </button>
        </div>
      </div>
    </div>
    )
}