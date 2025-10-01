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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-10">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-purple-500 to-pink-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
                <UserCog className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Transfer Event Ownership</h3>
                <p className="text-white/90 text-sm mt-1">
                  Transfer event to another organizer
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

          {/* Current Organizer */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-3">Current Organizer</h4>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {event.organizer?.first_name?.charAt(0)}{event.organizer?.last_name?.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {event.organizer?.first_name} {event.organizer?.last_name}
                </p>
                <p className="text-sm text-gray-600">{event.organizer?.email}</p>
                <p className="text-xs text-gray-500">{event.organizer?.account_type}</p>
              </div>
            </div>
          </div>

          {/* New Organizer Search */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Search for New Organizer <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchResults(true)
                }}
                onFocus={() => setShowSearchResults(true)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
              />
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.account_type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {errors.new_organizer_id && (
              <p className="text-red-600 text-sm mt-1 flex items-center space-x-1">
                <AlertTriangle className="w-4 h-4" />
                <span>{errors.new_organizer_id}</span>
              </p>
            )}
          </div>

          {/* Selected Organizer Preview */}
          {form.new_organizer && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
              <h5 className="text-lg font-bold text-green-900 mb-3 flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>New Organizer Selected</span>
              </h5>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold">
                  {form.new_organizer.first_name.charAt(0)}{form.new_organizer.last_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {form.new_organizer.first_name} {form.new_organizer.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{form.new_organizer.email}</p>
                  <p className="text-xs text-gray-500">{form.new_organizer.account_type}</p>
                </div>
              </div>
            </div>
          )}

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Reason for Transfer <span className="text-red-500">*</span>
              <span className="text-xs text-gray-500 font-normal ml-2">
                {form.reason.length}/500 characters
              </span>
            </label>
            <textarea
              value={form.reason}
              onChange={(e) => onFormChange({ ...form, reason: e.target.value.slice(0, 500) })}
              placeholder="Please provide a detailed reason for transferring event ownership..."
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none transition-all ${
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
          <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-purple-900 mb-2">
                  Transfer Impact
                </h5>
                <ul className="space-y-2 text-sm text-purple-800">
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>Both current and new organizer will be notified</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>New organizer will have full control over the event</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-purple-500 mt-0.5">•</span>
                    <span>This action cannot be undone</span>
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
              disabled={isSubmitting || !form.new_organizer_id}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-bold flex items-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Transferring...</span>
                </>
              ) : (
                <>
                  <UserCog className="w-5 h-5" />
                  <span>Transfer Ownership</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}