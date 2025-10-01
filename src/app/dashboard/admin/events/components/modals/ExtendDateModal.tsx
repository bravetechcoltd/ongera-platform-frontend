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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-10 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
        
        {/* Modal Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <CalendarRange className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Extend Event Date</h3>
                <p className="text-white/90 text-sm mt-1">
                  Update event dates and notify participants
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

          {/* Event Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">{event.title}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                New Start Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.start_datetime ? new Date(form.start_datetime).toISOString().slice(0, 16) : ''}
                onChange={(e) => onFormChange({ ...form, start_datetime: new Date(e.target.value) })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.start_datetime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.start_datetime && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.start_datetime}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                New End Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={form.end_datetime ? new Date(form.end_datetime).toISOString().slice(0, 16) : ''}
                onChange={(e) => onFormChange({ ...form, end_datetime: new Date(e.target.value) })}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.end_datetime ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.end_datetime && (
                <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errors.end_datetime}</span>
                </p>
              )}
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason for Extension <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">
                {form.reason.length}/500 characters
              </span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => onFormChange({ ...form, reason: e.target.value.slice(0, 500) })}
              placeholder="Please provide a detailed reason for extending the event dates..."
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none transition-all ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.reason && (
              <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.reason}</span>
              </p>
            )}
          </div>

          {/* Impact Warning */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-blue-900 mb-2">
                  Notification Impact
                </h5>
                <ul className="space-y-2 text-sm text-blue-800">
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-gray-200">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-bold flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Extending...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-5 h-5" />
                  <span>Extend Event Date</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}