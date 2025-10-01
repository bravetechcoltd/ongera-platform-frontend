import { useState, useEffect } from "react"
import { X, Copy, Calendar, Users, AlertCircle } from "lucide-react"

interface DuplicateEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  form: any
  onFormChange: (form: any) => void
  onSubmit: (event: any) => void
  isSubmitting: boolean
}

export default function DuplicateEventModal({
  isOpen,
  onClose,
  event,
  form,
  onFormChange,
  onSubmit,
  isSubmitting
}: DuplicateEventModalProps) {
  const [errors, setErrors] = useState({ new_title: '', new_start_datetime: '', new_end_datetime: '' })
  const [copySettings, setCopySettings] = useState({
    agenda: true,
    event_settings: true,
    linked_projects: true
  })

  useEffect(() => {
    if (event && isOpen) {
      const newStart = new Date(event.start_datetime)
      newStart.setDate(newStart.getDate() + 7)
      const newEnd = new Date(event.end_datetime)
      newEnd.setDate(newEnd.getDate() + 7)

      onFormChange({
        new_title: `Copy of ${event.title}`,
        new_start_datetime: newStart,
        new_end_datetime: newEnd
      })
    }
  }, [event, isOpen])

  const validateForm = () => {
    const newErrors = { new_title: '', new_start_datetime: '', new_end_datetime: '' }
    let isValid = true

    if (!form.new_title.trim()) {
      newErrors.new_title = 'Event title is required'
      isValid = false
    }

    if (!form.new_start_datetime) {
      newErrors.new_start_datetime = 'Start date is required'
      isValid = false
    }

    if (!form.new_end_datetime) {
      newErrors.new_end_datetime = 'End date is required'
      isValid = false
    } else if (new Date(form.new_end_datetime) <= new Date(form.new_start_datetime)) {
      newErrors.new_end_datetime = 'End date must be after start date'
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(event)
    }
  }

  if (!isOpen || !event) return null

  const originalStart = new Date(event.start_datetime)
  const originalEnd = new Date(event.end_datetime)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Copy className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Duplicate Event</h3>
                <p className="text-blue-100 text-xs">
                  Create a copy of this event
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

          {/* Original Event Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Original Event</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Title</p>
                <p className="font-semibold text-gray-900">{event.title}</p>
              </div>
              <div>
                <p className="text-gray-600">Type</p>
                <p className="font-semibold text-gray-900">{event.event_type}</p>
              </div>
              <div>
                <p className="text-gray-600">Original Start</p>
                <p className="font-semibold text-gray-900">
                  {originalStart.toLocaleDateString()} at {originalStart.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Original End</p>
                <p className="font-semibold text-gray-900">
                  {originalEnd.toLocaleDateString()} at {originalEnd.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* New Event Title */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              New Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.new_title}
              onChange={(e) => onFormChange({ ...form, new_title: e.target.value })}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0158B7] transition-all ${
                errors.new_title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter a title for the new event..."
            />
            {errors.new_title && (
              <p className="text-red-600 text-xs mt-1">{errors.new_title}</p>
            )}
          </div>

          {/* New Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                New Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.new_start_datetime ? new Date(form.new_start_datetime).toISOString().slice(0, 16) : ''}
                onChange={(e) => onFormChange({ ...form, new_start_datetime: new Date(e.target.value) })}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0158B7] transition-all ${
                  errors.new_start_datetime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.new_start_datetime && (
                <p className="text-red-600 text-xs mt-1">{errors.new_start_datetime}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                New End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.new_end_datetime ? new Date(form.new_end_datetime).toISOString().slice(0, 16) : ''}
                onChange={(e) => onFormChange({ ...form, new_end_datetime: new Date(e.target.value) })}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0158B7] transition-all ${
                  errors.new_end_datetime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.new_end_datetime && (
                <p className="text-red-600 text-xs mt-1">{errors.new_end_datetime}</p>
              )}
            </div>
          </div>

          {/* Copy Settings */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="text-sm font-bold text-blue-900 mb-3">Copy Settings</h5>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copySettings.agenda}
                  onChange={(e) => setCopySettings({ ...copySettings, agenda: e.target.checked })}
                  className="w-4 h-4 text-[#0158B7] rounded focus:ring-[#0158B7]"
                />
                <div>
                  <p className="font-semibold text-blue-900 text-xs">Copy Agenda Items</p>
                  <p className="text-xs text-blue-800">
                    Include all sessions, speakers, and schedule from the original event
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copySettings.event_settings}
                  onChange={(e) => setCopySettings({ ...copySettings, event_settings: e.target.checked })}
                  className="w-4 h-4 text-[#0158B7] rounded focus:ring-[#0158B7]"
                />
                <div>
                  <p className="font-semibold text-blue-900 text-xs">Copy Event Settings</p>
                  <p className="text-xs text-blue-800">
                    Include registration settings, pricing, and event configuration
                  </p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={copySettings.linked_projects}
                  onChange={(e) => setCopySettings({ ...copySettings, linked_projects: e.target.checked })}
                  className="w-4 h-4 text-[#0158B7] rounded focus:ring-[#0158B7]"
                />
                <div>
                  <p className="font-semibold text-blue-900 text-xs">Copy Linked Projects</p>
                  <p className="text-xs text-blue-800">
                    Include all research projects linked to the original event
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-amber-900 mb-2">
                  Important Information
                </h5>
                <ul className="space-y-1 text-xs text-amber-800">
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span><strong>Attendees will NOT be copied</strong> - the new event will start with 0 attendees</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span><strong>You will be the organizer</strong> of the new event</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span>The new event will be created in "Upcoming" status</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-all font-bold flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Create Duplicate</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}