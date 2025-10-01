"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { 
  fetchCommunityJoinRequests, 
  approveJoinRequest, 
  rejectJoinRequest,
  fetchCommunityById
} from "@/lib/features/auth/communitiesSlice"
import { JoinRequest } from "@/lib/features/auth/communitiesSlice"
import { Users, CheckCircle, XCircle, Clock, Loader2, Mail, Building2, BookOpen, ArrowLeft, Search } from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"
import ApproveRejectModal from "@/components/communities/ApproveRejectModal"

export default function JoinRequestsPage() {
  const params = useParams()
  const communityId = params.community_id as string 
  const dispatch = useAppDispatch()
  const { joinRequests, isLoading, isSubmitting, currentCommunity } = useAppSelector(state => state.communities)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<JoinRequest | null>(null)
  const [modalAction, setModalAction] = useState<"approve" | "reject">("approve")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityById(communityId))
      dispatch(fetchCommunityJoinRequests(communityId))
    }
  }, [dispatch, communityId])

  const handleApproveClick = (request: JoinRequest) => {
    setSelectedRequest(request)
    setModalAction("approve")
    setIsModalOpen(true)
  }

  const handleRejectClick = (request: JoinRequest) => {
    setSelectedRequest(request)
    setModalAction("reject")
    setIsModalOpen(true)
  }

// Updated handleConfirmAction function for your page component

const handleConfirmAction = async (requestId: string, reason?: string) => {
  try {
    if (modalAction === "approve") {
      await dispatch(approveJoinRequest(requestId)).unwrap()
      toast.success("✅ Join request approved! User has been notified via email.")
    } else {
      await dispatch(rejectJoinRequest({ requestId, reason })).unwrap()
      toast.success("✅ Join request rejected. User has been notified.")
    }
    
    setIsModalOpen(false)
    setSelectedRequest(null)
    
    if (communityId) {
      dispatch(fetchCommunityJoinRequests(communityId))
    }
    
  } catch (error: any) {
    console.error("Error handling join request:", error)
    const errorMessage = error?.message || error || `Failed to ${modalAction} request`
    toast.error(errorMessage)
  }
}

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRequest(null)
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredRequests = joinRequests.filter(request => {
    const matchesSearch = searchQuery === "" || 
      `${request.user.first_name} ${request.user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterType === "all" || request.user.account_type === filterType
    
    return matchesSearch && matchesFilter
  })

  if (isLoading && joinRequests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0158B7] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading join requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-3">
        <Link
          href={`/dashboard/user/communities/dashboard/${communityId}`}
          className="inline-flex items-center text-gray-600 hover:text-[#0158B7] transition-colors group text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Back to Community
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                Join Requests
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {currentCommunity?.name} • {joinRequests.length} pending {joinRequests.length === 1 ? 'request' : 'requests'}
              </p>
            </div>
            <div className="flex items-center space-x-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-700">
                {joinRequests.length} Pending
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0158B7] focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0158B7] bg-white"
            >
              <option value="all">All Types</option>
              <option value="Researcher">Researcher</option>
              <option value="Student">Student</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No pending requests</h3>
            <p className="text-sm text-gray-600">
              {searchQuery || filterType !== "all" 
                ? "No requests match your filters" 
                : "All join requests have been processed"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-[#5E96D2] transition-all hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    {request.user.profile_picture_url ? (
                      <img
                        src={request.user.profile_picture_url}
                        alt={request.user.first_name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-blue-100">
                        {request.user.first_name[0]}{request.user.last_name[0]}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-base font-bold text-gray-900">
                        {request.user.first_name} {request.user.last_name}
                      </h3>
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {request.user.account_type}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(request.requested_at)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{request.user.email}</span>
                      </div>
                      {request.user.profile?.institution_name && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Building2 className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{request.user.profile.institution_name}</span>
                        </div>
                      )}
                      {request.user.profile?.field_of_study && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <BookOpen className="w-3 h-3 text-gray-400" />
                          <span className="truncate">{request.user.profile.field_of_study}</span>
                        </div>
                      )}
                    </div>

                    {request.message && (
                      <div className="bg-blue-50 border-l-2 border-blue-400 p-2 rounded text-xs text-blue-900 italic">
                        "{request.message}"
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApproveClick(request)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg hover:from-emerald-700 hover:to-teal-700 transition-all text-sm font-semibold disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectClick(request)}
                      disabled={isSubmitting}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:shadow-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-semibold disabled:opacity-50"
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

      <ApproveRejectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        request={selectedRequest}
        action={modalAction}
        onConfirm={handleConfirmAction}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}