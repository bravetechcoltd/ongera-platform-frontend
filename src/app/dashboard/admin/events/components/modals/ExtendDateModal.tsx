import { useState, useEffect } from "react"
import { X, Calendar, Clock, Users, AlertTriangle, CalendarRange } from "lucide-react"

interface ExtendDateModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  form: any
  onFormChange: (form: any) => void
  onSubmit: (event: any) => void
  isSubmitting: boolean
}

export default function ExtendDateModal({
  isOpen,
  onClose,
  event,
  form,
  onFormChange,
  onSubmit,
  isSubmitting
}: ExtendDateModalProps) {
  const [errors, setErrors] = useState({ start_datetime: '', end_datetime: '', reason: '' })

  useEffect(() => {
    if (event && isOpen) {
      onFormChange({
        start_datetime: new Date(event.start_datetime),
        end_datetime: new Date(event.end_datetime),
        reason: ''
      })
    }
  }, [event, isOpen])

  const validateForm = () => {
    const newErrors = { start_datetime: '', end_datetime: '', reason: '' }
    let isValid = true

    if (!form.start_datetime) {
      newErrors.start_datetime = 'Start date is required'
      isValid = false
    } else if (new Date(form.start_datetime) < new Date(event.start_datetime)) {
      newErrors.start_datetime = 'New start date must be after current start date'
      isValid = false
    }

    if (!form.end_datetime) {
      newErrors.end_datetime = 'End date is required'
      isValid = false
    } else if (new Date(form.end_datetime) <= new Date(form.start_datetime)) {
      newErrors.end_datetime = 'End date must be after start date'
      isValid = false
    } else if (new Date(form.end_datetime) <= new Date(event.end_datetime)) {
      newErrors.end_datetime = 'New end date must be after current end date'
      isValid = false
    }

    if (!form.reason.trim()) {
      newErrors.reason = 'Reason is required'
      isValid = false
    } else if (form.reason.length < 20) {
      newErrors.reason = 'Reason must be at least 20 characters long'
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

  const currentStart = new Date(event.start_datetime)
  const currentEnd = new Date(event.end_datetime)
  const attendeeCount = event.attendees?.length || 0

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CalendarRange className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Extend Event Date</h3>
                <p className="text-blue-100 text-xs">
                  Update event dates and notify participants
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

          {/* Event Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">{event.title}</h4>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Current Start</p>
                <p className="font-semibold text-gray-900">
                  {currentStart.toLocaleDateString()} at {currentStart.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Current End</p>
                <p className="font-semibold text-gray-900">
                  {currentEnd.toLocaleDateString()} at {currentEnd.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>

          {/* Date Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                New Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.start_datetime ? new Date(form.start_datetime).toISOString().slice(0, 16) : ''}
                onChange={(e) => onFormChange({ ...form, start_datetime: new Date(e.target.value) })}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0158B7] transition-all ${
                  errors.start_datetime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.start_datetime && (
                <p className="text-red-600 text-xs mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{errors.start_datetime}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-2">
                New End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.end_datetime ? new Date(form.end_datetime).toISOString().slice(0, 16) : ''}
                onChange={(e) => onFormChange({ ...form, end_datetime: new Date(e.target.value) })}
                className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0158B7] transition-all ${
                  errors.end_datetime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.end_datetime && (
                <p className="text-red-600 text-xs mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{errors.end_datetime}</span>
                </p>
              )}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Reason for Extension <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">
                {form.reason.length}/500 characters
              </span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => onFormChange({ ...form, reason: e.target.value.slice(0, 500) })}
              placeholder="Please provide a detailed reason for extending the event dates..."
              rows={3}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0158B7] resize-none transition-all ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.reason && (
              <p className="text-red-600 text-xs mt-1 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{errors.reason}</span>
              </p>
            )}
          </div>

          {/* Impact Warning */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-blue-900 mb-2">
                  Notification Impact
                </h5>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Organizer will receive email notification</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>{attendeeCount} approved attendees will be notified</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Event calendar entries will be updated</span>
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
                <span>Extending...</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>Extend Event Date</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}