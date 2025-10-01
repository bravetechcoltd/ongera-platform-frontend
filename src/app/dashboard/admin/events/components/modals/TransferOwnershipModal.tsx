import { useState, useEffect } from "react"
import { X, UserCog, Search, AlertTriangle, Mail, User } from "lucide-react"

interface TransferOwnershipModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  form: any
  onFormChange: (form: any) => void
  onSubmit: (event: any) => void
  isSubmitting: boolean
}

export default function TransferOwnershipModal({
  isOpen,
  onClose,
  event,
  form,
  onFormChange,
  onSubmit,
  isSubmitting
}: TransferOwnershipModalProps) {
  const [errors, setErrors] = useState({ new_organizer_id: '', reason: '' })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Mock user search function - in real app, this would call an API
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    // Simulate API call
    setTimeout(() => {
      const mockResults = [
        {
          id: 'user-1',
          first_name: 'John',
          last_name: 'Researcher',
          email: 'john.researcher@example.com',
          account_type: 'Researcher'
        },
        {
          id: 'user-2',
          first_name: 'Sarah',
          last_name: 'Academic',
          email: 'sarah.academic@example.com',
          account_type: 'Student'
        }
      ].filter(user => 
        user.first_name.toLowerCase().includes(query.toLowerCase()) ||
        user.last_name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
      )
      
      setSearchResults(mockResults)
    }, 300)
  }

  useEffect(() => {
    if (event && isOpen) {
      onFormChange({
        new_organizer_id: '',
        new_organizer: null,
        reason: ''
      })
      setSearchQuery('')
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [event, isOpen])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchUsers(searchQuery)
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const validateForm = () => {
    const newErrors = { new_organizer_id: '', reason: '' }
    let isValid = true

    if (!form.new_organizer_id) {
      newErrors.new_organizer_id = 'Please select a new organizer'
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

  const selectUser = (user: any) => {
    onFormChange({
      ...form,
      new_organizer_id: user.id,
      new_organizer: user
    })
    setSearchQuery(`${user.first_name} ${user.last_name} (${user.email})`)
    setShowSearchResults(false)
  }

  if (!isOpen || !event) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <UserCog className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Transfer Event Ownership</h3>
                <p className="text-blue-100 text-xs">
                  Transfer event to another organizer
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

          {/* Current Organizer */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Current Organizer</h4>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0158B7] to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                {event.organizer?.first_name?.charAt(0)}{event.organizer?.last_name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-xs">
                  {event.organizer?.first_name} {event.organizer?.last_name}
                </p>
                <p className="text-gray-600 text-xs">{event.organizer?.email}</p>
                <p className="text-gray-500 text-xs">{event.organizer?.account_type}</p>
              </div>
            </div>
          </div>

          {/* New Organizer Search */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Search for New Organizer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchResults(true)
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search by name or email..."
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0158B7] transition-all"
              />
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className="w-full flex items-center space-x-2 p-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0158B7] to-blue-600 flex items-center justify-center text-white font-bold text-xs">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900 text-xs">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-gray-600 text-xs">{user.email}</p>
                      <p className="text-gray-500 text-xs">{user.account_type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.new_organizer_id && (
              <p className="text-red-600 text-xs mt-1 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>{errors.new_organizer_id}</span>
              </p>
            )}
          </div>

          {/* Selected Organizer Preview */}
          {form.new_organizer && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h5 className="text-sm font-bold text-green-900 mb-2 flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>New Organizer Selected</span>
              </h5>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-xs">
                  {form.new_organizer.first_name.charAt(0)}{form.new_organizer.last_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-xs">
                    {form.new_organizer.first_name} {form.new_organizer.last_name}
                  </p>
                  <p className="text-gray-600 text-xs">{form.new_organizer.email}</p>
                  <p className="text-gray-500 text-xs">{form.new_organizer.account_type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-900 mb-2">
              Reason for Transfer <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">
                {form.reason.length}/500 characters
              </span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => onFormChange({ ...form, reason: e.target.value.slice(0, 500) })}
              placeholder="Please provide a detailed reason for transferring event ownership..."
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
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-sm font-bold text-blue-900 mb-2">
                  Transfer Impact
                </h5>
                <ul className="space-y-1 text-xs text-blue-800">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>Both current and new organizer will be notified</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>New organizer will have full control over the event</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-500 mt-0.5">•</span>
                    <span>This action cannot be undone</span>
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
            disabled={isSubmitting || !form.new_organizer_id}
            className="px-4 py-2 text-xs bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-all font-bold flex items-center space-x-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Transferring...</span>
              </>
            ) : (
              <>
                <UserCog className="w-4 h-4" />
                <span>Transfer Ownership</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}