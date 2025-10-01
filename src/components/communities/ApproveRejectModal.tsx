"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, XCircle, Loader2, AlertTriangle, Mail, Building2, BookOpen } from "lucide-react"

interface JoinRequest {
  id: string
  status: string
  message?: string
  requested_at: string
  user: {
    id: string
    first_name: string
    last_name: string
    email: string
    profile_picture_url?: string
    account_type: string
    profile?: {
      institution_name?: string
      field_of_study?: string
    }
  }
  community: {
    id: string
    name: string
  }
}

interface ApproveRejectModalProps {
  isOpen: boolean
  onClose: () => void
  request: JoinRequest | null
  action: "approve" | "reject"
  onConfirm: (requestId: string, reason?: string) => Promise<void>
  isSubmitting: boolean
}

export default function ApproveRejectModal({
  isOpen,
  onClose,
  request,
  action,
  onConfirm,
  isSubmitting
}: ApproveRejectModalProps) {
  const [reason, setReason] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) {
      setReason("")
      setIsProcessing(false)
      setError(null)
    }
  }, [isOpen])

  if (!isOpen || !request) return null

  const handleSubmit = async () => {
    if (action === "reject" && !reason.trim()) {
      setError("Please provide a reason for rejection")
      return
    }

    if (isProcessing || isSubmitting) {
      return
    }
    
    setIsProcessing(true)
    setError(null)
    
    try {
      await onConfirm(request.id, action === "reject" ? reason : undefined)
      // Success - modal will be closed by parent component
    } catch (error: any) {
      console.error("Error in modal:", error)
      setError(error?.message || "An error occurred. Please try again.")
      setIsProcessing(false)
    }
  }

  const isApprove = action === "approve"
  const isButtonDisabled = isProcessing || isSubmitting || (!isApprove && !reason.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[95vh] overflow-hidden animate-slideUp">
        {/* Compact Header */}
        <div className={`p-4 text-white ${
          isApprove 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isApprove ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <h2 className="text-lg font-bold">
                {isApprove ? 'Approve' : 'Reject'} Request
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing || isSubmitting}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Body */}
        <div className="p-4 space-y-3 max-h-[calc(95vh-180px)] overflow-y-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-2 border-red-400 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Compact User Info */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-start space-x-3">
              {request.user.profile_picture_url ? (
                <img
                  src={request.user.profile_picture_url}
                  alt={request.user.first_name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-blue-100 flex-shrink-0">
                  {request.user.first_name[0]}{request.user.last_name[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-bold text-gray-900 text-sm truncate">
                    {request.user.first_name} {request.user.last_name}
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold flex-shrink-0">
                    {request.user.account_type}
                  </span>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                    <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{request.user.email}</span>
                  </div>
                  {request.user.profile?.institution_name && (
                    <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                      <Building2 className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{request.user.profile.institution_name}</span>
                    </div>
                  )}
                  {request.user.profile?.field_of_study && (
                    <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                      <BookOpen className="w-3 h-3 text-gray-400 flex-shrink-0" />
                      <span className="truncate">{request.user.profile.field_of_study}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {request.message && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Message</p>
                <div className="bg-blue-50 border-l-2 border-blue-400 p-2 rounded">
                  <p className="text-xs text-blue-900 italic">"{request.message}"</p>
                </div>
              </div>
            )}
          </div>

          {/* Action Content */}
          {isApprove ? (
            <div className="bg-emerald-50 border-l-2 border-emerald-400 p-3 rounded-lg">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-emerald-900 text-sm mb-0.5">Approve this request?</h4>
                  <p className="text-xs text-emerald-800">
                    {request.user.first_name} will be added to your community and receive a welcome email.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-50 border-l-2 border-red-400 p-3 rounded-lg">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 text-sm mb-0.5">Reject this request?</h4>
                    <p className="text-xs text-red-800">
                      {request.user.first_name} will receive an email with your reason.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="reason" className="block text-xs font-semibold text-gray-700 mb-1">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value)
                    setError(null)
                  }}
                  placeholder="Please provide a clear reason..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500/20 transition-all resize-none text-sm"
                  disabled={isProcessing || isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This will be sent to the user
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Compact Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            disabled={isProcessing || isSubmitting}
            className="px-4 py-2 text-sm text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isButtonDisabled}
            className={`flex items-center space-x-1.5 px-4 py-2 text-sm text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isApprove
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
            }`}
          >
            {(isProcessing || isSubmitting) ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {isApprove ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>{isApprove ? 'Approve' : 'Reject'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}