"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { 
  fetchCommunityJoinRequests, 
  approveJoinRequest, 
  rejectJoinRequest,
  fetchCommunityById
} from "@/lib/features/auth/communitiesSlice"

import { Users, CheckCircle, XCircle, Clock, Loader2, Mail, Building2, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

export default function JoinRequestsPage() {
  const params = useParams()
  const communityId = params.community_id as string
  const dispatch = useAppDispatch()
  const { joinRequests, isLoading, isSubmitting, currentCommunity } = useAppSelector(state => state.communities)

  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityById(communityId))
      dispatch(fetchCommunityJoinRequests(communityId))
    }
  }, [dispatch, communityId])

  const handleApprove = async (requestId: string) => {
    try {
      await dispatch(approveJoinRequest(requestId)).unwrap()
      toast.success("Join request approved! User has been notified.")
    } catch (error: any) {
      toast.error(error || "Failed to approve request")
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      await dispatch(rejectJoinRequest({ requestId })).unwrap()
      toast.success("Join request rejected")
    } catch (error: any) {
      toast.error(error || "Failed to reject request")
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <Link
        href={`/dashboard/user/communities/dashboard/${communityId}`}
        className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Community
      </Link>

      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Join Requests</h1>
            <p className="text-gray-600 mt-1">
              {currentCommunity?.name} • {joinRequests.length} pending {joinRequests.length === 1 ? 'request' : 'requests'}
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">
              {joinRequests.length} Pending
            </span>
          </div>
        </div>

        {joinRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600">All join requests have been processed</p>
          </div>
        ) : (
          <div className="space-y-4">
            {joinRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {request.user.profile_picture_url ? (
                      <img
                        src={request.user.profile_picture_url}
                        alt={request.user.first_name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-emerald-100"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-4 border-emerald-100">
                        {request.user.first_name[0]}{request.user.last_name[0]}
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {request.user.first_name} {request.user.last_name}
                        </h3>
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          {request.user.account_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{request.user.email}</span>
                        </div>
                        {request.user.profile?.institution_name && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            <span>{request.user.profile.institution_name}</span>
                          </div>
                        )}
                        {request.user.profile?.field_of_study && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span>{request.user.profile.field_of_study}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>
                            Requested {new Date(request.requested_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg">
                          <p className="text-sm text-blue-900 italic">
                            "{request.message}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={isSubmitting}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}