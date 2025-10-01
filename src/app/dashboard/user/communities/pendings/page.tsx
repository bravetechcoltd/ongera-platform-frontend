"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchMyPendingRequests } from "@/lib/features/auth/communitiesSlice"
import { Clock, Loader2, ArrowLeft, AlertCircle } from "lucide-react"
import Link from "next/link"

export default function MyPendingRequestsPage() {
  const dispatch = useAppDispatch()
  const { myPendingRequests, isLoading } = useAppSelector(state => state.communities)

  useEffect(() => {
    dispatch(fetchMyPendingRequests())
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <Link
        href="/dashboard/user/communities"
        className="inline-flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Communities
      </Link>

      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Pending Requests</h1>
            <p className="text-gray-600 mt-1">
              Track your community join requests awaiting approval
            </p>
          </div>
          <div className="flex items-center space-x-2 px-4 py-2 bg-amber-50 border-2 border-amber-200 rounded-xl">
            <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
            <span className="text-sm font-semibold text-amber-700">
              {myPendingRequests.length} Pending
            </span>
          </div>
        </div>

        {myPendingRequests.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No pending requests</h3>
            <p className="text-gray-600 mb-6">You haven't requested to join any communities yet</p>
            <Link
              href="/dashboard/user/communities"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
            >
              <span>Browse Communities</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg mb-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900 mb-1">
                    Waiting for Approval
                  </h4>
                  <p className="text-sm text-blue-800">
                    Community creators will review your request. You'll receive an email notification once your request is approved.
                  </p>
                </div>
              </div>
            </div>

            {myPendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-2xl p-6 hover:border-amber-300 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {request.community.cover_image_url ? (
                      <img
                        src={request.community.cover_image_url}
                        alt={request.community.name}
                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-2xl font-bold">
                        {request.community.name[0]}
                      </div>
                    )}

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {request.community.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {request.community.description}
                      </p>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span>
                            Requested {new Date(request.requested_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="text-gray-400">•</div>
                        <div className="text-gray-600">
                          Creator: {request.community.creator.first_name} {request.community.creator.last_name}
                        </div>
                      </div>

                      {request.message && (
                        <div className="mt-3 bg-blue-50 border-l-4 border-blue-400 p-3 rounded-lg">
                          <p className="text-sm text-blue-900">
                            <span className="font-semibold">Your message:</span> "{request.message}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 border-2 border-amber-300 rounded-xl">
                    <Clock className="w-5 h-5 text-amber-600 animate-pulse" />
                    <span className="text-sm font-semibold text-amber-700">
                      Pending
                    </span>
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