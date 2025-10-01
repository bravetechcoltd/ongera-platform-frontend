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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-green-500 to-emerald-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Close Event Early</h3>
                <p className="text-white/90 text-sm mt-1">
                  Mark event as completed before scheduled end
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
        <div className="p-8 space-y-6">

          {/* Event Info */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
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
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-yellow-900 mb-2">
                  Closing Event Impact
                </h5>
                <ul className="space-y-2 text-sm text-yellow-800">
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
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason for Closing Early <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">
                {form.reason.length}/500 characters
              </span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => onFormChange({ ...form, reason: e.target.value.slice(0, 500) })}
              placeholder="Please provide a detailed reason for closing this event early..."
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none transition-all ${
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

          {/* Certificate Option */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.send_certificates}
                    onChange={(e) => onFormChange({ ...form, send_certificates: e.target.checked })}
                    className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <h5 className="text-lg font-bold text-blue-900 mb-1">
                      Send Certificates to Attendees
                    </h5>
                    <p className="text-sm text-blue-800">
                      Mark all approved attendees as "Attended" and issue participation certificates.
                      This will notify {approvedAttendees.length} attendees.
                    </p>
                  </div>
                </label>
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
              className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all font-bold flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Closing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Close Event</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}