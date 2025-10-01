// @ts-nocheck

"use client"

import { useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchMyCommunities } from "@/lib/features/auth/communitiesSlice"
import { Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PendingCommunitiesPage() {
  const dispatch = useAppDispatch()
  const { myCommunities, isLoading } = useAppSelector(state => state.communities)

  useEffect(() => {
    dispatch(fetchMyCommunities())
  }, [dispatch])

  const pendingCommunities = myCommunities.filter(c => !c.is_active)
  const approvedCommunities = myCommunities.filter(c => c.is_active)

  return (
    <div className="p-6 space-y-6">
      <Link
        href="/dashboard/user/communities"
        className="inline-flex items-center text-gray-600 hover:text-emerald-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Communities
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Community Requests</h1>
        <p className="text-gray-600 mt-1">Track your community creation and membership requests</p>
      </div>

      {/* Pending Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pending Approval</h2>
            <p className="text-sm text-gray-600">{pendingCommunities.length} communities awaiting review</p>
          </div>
        </div>

        {pendingCommunities.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingCommunities.map((community) => (
              <div
                key={community.id}
                className="p-5 border-2 border-amber-200 bg-amber-50 rounded-xl"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 mb-1">{community.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{community.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span className="px-2 py-1 bg-white rounded-md font-medium">{community.category}</span>
                      <span>Created {new Date(community.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-amber-700">
                    <Clock className="w-5 h-5" />
                    <span className="text-sm font-semibold">Pending</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Approved Communities</h2>
            <p className="text-sm text-gray-600">{approvedCommunities.length} active communities</p>
          </div>
        </div>

        {approvedCommunities.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No approved communities yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvedCommunities.map((community) => (
              <Link
                key={community.id}
                href={`/dashboard/user/communities/dashboard/${community.id}`}
                className="p-5 border-2 border-emerald-200 bg-emerald-50 rounded-xl hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{community.name}</h3>
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{community.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-1 bg-white rounded-md font-medium text-gray-700">
                    {community.member_count} members
                  </span>
                  <span className="text-emerald-600 font-semibold">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}