"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { JoinRequest } from "@/lib/features/auth/communitiesSlice"

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

  // Reset state when modal closes or request changes
  useEffect(() => {
    if (!isOpen) {
      setReason("")
      setIsProcessing(false)
    }
  }, [isOpen])

  if (!isOpen || !request) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // For reject action, ensure reason is provided
    if (action === "reject" && !reason.trim()) {
      return
    }

    // Prevent double submission
    if (isProcessing || isSubmitting) {
      return
    }
    
    setIsProcessing(true)
    
    try {
      await onConfirm(request.id, action === "reject" ? reason : undefined)
      // Success - parent component will handle toast and modal close
      // Reset will happen via useEffect when modal closes
    } catch (error) {
      // Error is handled in parent component with toast
      console.error("Error in modal:", error)
      setIsProcessing(false) // Re-enable button on error
    }
  }

  const isApprove = action === "approve"
  const isButtonDisabled = isProcessing || isSubmitting || (!isApprove && !reason.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[98vh] overflow-hidden">
        {/* Header */}
        <div className={`p-6 text-white ${
          isApprove 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
            : 'bg-gradient-to-r from-red-500 to-red-600'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {isApprove ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <XCircle className="w-6 h-6" />
                )}
                <h2 className="text-2xl font-bold">
                  {isApprove ? 'Approve' : 'Reject'} Join Request
                </h2>
              </div>
              <p className={isApprove ? 'text-emerald-100' : 'text-red-100'}>
                {isApprove 
                  ? 'Welcome this member to your community' 
                  : 'Provide a reason for rejecting this request'}
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing || isSubmitting}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Wrap everything in a form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* User Info */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200">
              <div className="flex items-start space-x-4">
                {request.user.profile_picture_url ? (
                  <img
                    src={request.user.profile_picture_url}
                    alt={request.user.first_name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-blue-100">
                    {request.user.first_name[0]}{request.user.last_name[0]}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg">
                      {request.user.first_name} {request.user.last_name}
                    </h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                      {request.user.account_type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{request.user.email}</p>
                  {request.user.profile?.institution_name && (
                    <p className="text-sm text-gray-500">
                      <strong>Institution:</strong> {request.user.profile.institution_name}
                    </p>
                  )}
                  {request.user.profile?.field_of_study && (
                    <p className="text-sm text-gray-500">
                      <strong>Field:</strong> {request.user.profile.field_of_study}
                    </p>
                  )}
                </div>
              </div>

              {request.message && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">User's Message</p>
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg">
                    <p className="text-sm text-blue-900 italic">"{request.message}"</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Specific Content */}
            {isApprove ? (
              <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-900 mb-1">Approve this request?</h4>
                    <p className="text-sm text-emerald-800">
                      {request.user.first_name} will be added to your community immediately and will receive 
                      a welcome email with instructions on how to get started.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-1">Reject this request?</h4>
                      <p className="text-sm text-red-800">
                        {request.user.first_name} will receive an email notification with your reason for rejection.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="reason" className="block text-sm font-semibold text-gray-700 mb-2">
                    Reason for Rejection <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="reason"
                    rows={4}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please provide a clear reason for rejecting this request..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all resize-none"
                    disabled={isProcessing || isSubmitting}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This reason will be included in the rejection email to the user
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing || isSubmitting}
                className="px-6 py-2.5 text-gray-700 font-semibold hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`flex items-center space-x-2 px-6 py-2.5 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
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
                    <span>{isApprove ? 'Approve Request' : 'Reject Request'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}