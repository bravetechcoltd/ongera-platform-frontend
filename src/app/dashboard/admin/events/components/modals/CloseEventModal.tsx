import { useState, useEffect } from "react"
import { X, CheckCircle, AlertTriangle, Users, Mail } from "lucide-react"

interface CloseEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  form: any
  onFormChange: (form: any) => void
  onSubmit: (event: any) => void
  isSubmitting: boolean
}

export default function CloseEventModal({
  isOpen,
  onClose,
  event,
  form,
  onFormChange,
  onSubmit,
  isSubmitting
}: CloseEventModalProps) {
  const [errors, setErrors] = useState({ reason: '' })

  useEffect(() => {
    if (event && isOpen) {
      onFormChange({
        reason: '',
        send_certificates: false
      })
    }
  }, [event, isOpen])

  const validateForm = () => {
    const newErrors = { reason: '' }
    let isValid = true

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

  const approvedAttendees = event.attendees?.filter((a: any) => a.registration_status === 'Approved') || []
  const scheduledEnd = new Date(event.end_datetime)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Close Event Early</h3>
                <p className="text-blue-100 text-xs">
                  Mark event as completed before scheduled end
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
                <p className="text-gray-600">Scheduled End</p>
                <p className="font-semibold text-gray-900">
                  {scheduledEnd.toLocaleDateString()} at {scheduledEnd.toLocaleTimeString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Approved Attendees</p>
                <p className="font-semibold text-gray-900">{approvedAttendees.length}</p>
              </div>
            </div>
          </div>

          {/* Impact Warning */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-yellow-900 mb-2">
                  Closing Event Impact
                </h5>
                <ul className="space-y-1 text-xs text-yellow-800">
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>Event status will change to "Completed"</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>Organizer will be notified via email</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-yellow-500 mt-0.5">•</span>
                    <span>Event will no longer accept new registrations</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Reason for Closing Early <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">
                {form.reason.length}/500 characters
              </span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => onFormChange({ ...form, reason: e.target.value.slice(0, 500) })}
              placeholder="Please provide a detailed reason for closing this event early..."
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

          {/* Certificate Option */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.send_certificates}
                    onChange={(e) => onFormChange({ ...form, send_certificates: e.target.checked })}
                    className="mt-0.5 w-4 h-4 text-[#0158B7] rounded focus:ring-[#0158B7]"
                  />
                  <div>
                    <h5 className="text-sm font-bold text-blue-900 mb-1">
                      Send Certificates to Attendees
                    </h5>
                    <p className="text-xs text-blue-800">
                      Mark all approved attendees as "Attended" and issue participation certificates.
                      This will notify {approvedAttendees.length} attendees.
                    </p>
                  </div>
                </label>
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
                <span>Closing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Close Event</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}