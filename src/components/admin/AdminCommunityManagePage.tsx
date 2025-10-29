"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchAllCommunitiesForAdmin,
  approveCommunity,
  rejectCommunity,
  deleteCommunity,
  activateDeactivateCommunity,
  clearCommunitiesError
} from "@/lib/features/auth/communitiesSlice"
import {
  CheckCircle, XCircle, Trash2, Search, Filter,
  Users, MessageSquare, Calendar, Globe, Lock,
  Building2, Loader2, AlertCircle, ChevronLeft,
  ChevronRight, Eye, MoreVertical, Power, PowerOff,
  X, AlertTriangle
} from "lucide-react"
import { toast } from "react-hot-toast"

type StatusFilter = 'all' | 'pending' | 'approved'

export default function AdminCommunityManagePage() {
  const dispatch = useAppDispatch()
  const { adminCommunities, isLoading, isSubmitting, error, pagination } = useAppSelector(state => state.communities)
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  
  // ✅ NEW: State for Activate/Deactivate Modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [selectedCommunityData, setSelectedCommunityData] = useState<any>(null)

  useEffect(() => {
    loadCommunities()
  }, [statusFilter, pagination.page])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearCommunitiesError())
    }
  }, [error, dispatch])

  const loadCommunities = () => {
    dispatch(fetchAllCommunitiesForAdmin({
      page: pagination.page,
      limit: 20,
      status: statusFilter,
      search: searchQuery || undefined,
      category: categoryFilter || undefined
    }))
  }

  const handleSearch = () => {
    loadCommunities()
  }

  const handleApprove = async (id: string) => {
    try {
      await dispatch(approveCommunity(id)).unwrap()
      toast.success("Community approved successfully!")
      loadCommunities()
    } catch (err: any) {
      toast.error(err || "Failed to approve community")
    }
  }

  const handleReject = async () => {
    if (!selectedCommunity) return
    
    try {
      await dispatch(rejectCommunity({ 
        id: selectedCommunity, 
        reason: rejectReason 
      })).unwrap()
      toast.success("Community rejected successfully!")
      setShowRejectModal(false)
      setSelectedCommunity(null)
      setRejectReason('')
      loadCommunities()
    } catch (err: any) {
      toast.error(err || "Failed to reject community")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this community?')) return
    
    try {
      await dispatch(deleteCommunity(id)).unwrap()
      toast.success("Community deleted successfully!")
      loadCommunities()
    } catch (err: any) {
      toast.error(err || "Failed to delete community")
    }
  }

  // ✅ NEW: Handle Status Change
  const openStatusModal = (community: any, action: 'activate' | 'deactivate') => {
    setSelectedCommunityData(community)
    setStatusAction(action)
    setStatusReason('')
    setShowStatusModal(true)
  }

  const handleStatusChange = async () => {
    if (!selectedCommunityData || !statusAction) return
    
    // Require reason for deactivation
    if (statusAction === 'deactivate' && !statusReason.trim()) {
      toast.error("Please provide a reason for deactivation")
      return
    }
    
    try {
      const is_active = statusAction === 'activate'
      
      await dispatch(activateDeactivateCommunity({
        id: selectedCommunityData.id,
        is_active,
        reason: statusAction === 'deactivate' ? statusReason : undefined
      })).unwrap()
      
      toast.success(`Community ${statusAction === 'activate' ? 'activated' : 'deactivated'} successfully!`)
      setShowStatusModal(false)
      setSelectedCommunityData(null)
      setStatusAction(null)
      setStatusReason('')
      loadCommunities()
    } catch (err: any) {
      toast.error(err || `Failed to ${statusAction} community`)
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Public': return <Globe className="w-4 h-4" />
      case 'Private': return <Lock className="w-4 h-4" />
      case 'Institution-Specific': return <Building2 className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Community Management</h1>
            <p className="text-gray-600 mt-1">Review and manage all communities on the platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center px-6 py-3 bg-blue-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{pagination.total}</p>
              <p className="text-xs text-gray-600">Total Communities</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Status Filter */}
          <div className="flex space-x-2">
            {(['all', 'pending', 'approved'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Communities Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
          </div>
        ) : adminCommunities.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Community
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Creator
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Stats
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adminCommunities.map((community) => (
                    <tr key={community.id} className="hover:bg-gray-50 transition-colors">
                      {/* Community Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500">
                            {community.cover_image_url ? (
                              <img
                                src={community.cover_image_url}
                                alt={community.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold">
                                {community.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {community.name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {community.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {community.creator.first_name?.[0]}{community.creator.last_name?.[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {community.creator.first_name} {community.creator.last_name}
                            </p>
                            <p className="text-xs text-gray-600">{community.creator.account_type}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(community.community_type)}
                          <span className="text-sm text-gray-700">{community.community_type}</span>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-medium">{community.member_count}</span>
                            <span>members</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="font-medium">{community.post_count}</span>
                            <span>posts</span>
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(community.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(community.is_active)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {!community.is_active ? (
                            <>
                              <button
                                onClick={() => handleApprove(community.id)}
                                disabled={isSubmitting}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCommunity(community.id)
                                  setShowRejectModal(true)
                                }}
                                disabled={isSubmitting}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* ✅ NEW: Deactivate Button */}
                              <button
                                onClick={() => openStatusModal(community, 'deactivate')}
                                disabled={isSubmitting}
                                className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                                title="Deactivate Community"
                              >
                                <PowerOff className="w-4 h-4" />
                              </button>
            
                            </>
                          )}
                          
                          {/* ✅ NEW: Activate Button for Inactive Communities */}
                          {!community.is_active && (
                            <button
                              onClick={() => openStatusModal(community, 'activate')}
                              disabled={isSubmitting}
                              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50"
                              title="Activate Community"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                  <span className="font-semibold">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{' '}
                  of <span className="font-semibold">{pagination.total}</span> communities
                </p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => dispatch(fetchAllCommunitiesForAdmin({ 
                      page: pagination.page - 1,
                      status: statusFilter
                    }))}
                    disabled={pagination.page === 1}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-medium text-gray-700">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => dispatch(fetchAllCommunitiesForAdmin({ 
                      page: pagination.page + 1,
                      status: statusFilter
                    }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Community</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this community. This will be sent to the creator.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              rows={4}
            />
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedCommunity(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting || !rejectReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Reject Community'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ NEW: Activate/Deactivate Status Modal */}
      {showStatusModal && selectedCommunityData && statusAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-10 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
            {/* Modal Header */}
            <div className={`relative px-8 py-6 ${
              statusAction === 'activate' 
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                    statusAction === 'activate' ? 'bg-white/20' : 'bg-white/20'
                  } backdrop-blur-sm`}>
                    {statusAction === 'activate' ? (
                      <Power className="w-8 h-8 text-white" />
                    ) : (
                      <PowerOff className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {statusAction === 'activate' ? 'Activate Community' : 'Deactivate Community'}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
                      {statusAction === 'activate' 
                        ? 'Make this community accessible to all members'
                        : 'Temporarily disable this community'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedCommunityData(null)
                    setStatusAction(null)
                    setStatusReason('')
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">

              {statusAction === 'deactivate' ? (
                <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                        <AlertTriangle className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-orange-900 mb-2">
                        Important: Deactivation Impact
                      </h5>
                      <ul className="space-y-2 text-sm text-orange-800">
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Posts and discussions will be hidden</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Members will receive email notifications</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Community can be reactivated later</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-emerald-900 mb-2">
                        Community Activation Benefits
                      </h5>
                      <ul className="space-y-2 text-sm text-emerald-800">
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>All {selectedCommunityData.member_count} members will regain access</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>Posts and discussions will be visible</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>Members will receive welcome notifications</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-500 mt-0.5">•</span>
                          <span>Community will appear in public listings</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason Input (Required for Deactivation) */}
              {statusAction === 'deactivate' && (
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Deactivation Reason <span className="text-red-500">*</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {statusReason.length}/500 characters
                      </span>
                    </div>
                    <textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value.slice(0, 500))}
                      placeholder="Please provide a detailed reason for deactivating this community. This will be sent to all members and the creator..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all text-sm"
                      rows={5}
                      maxLength={500}
                    />
                  </label>
                  {statusReason.length < 20 && statusReason.length > 0 && (
                    <p className="text-xs text-orange-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Please provide a more detailed reason (at least 20 characters)</span>
                    </p>
                  )}
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <strong className="text-gray-900">Note:</strong> The reason you provide will be included in the email notification sent to all community members and the creator. Please be professional and clear.
                    </p>
                  </div>
                </div>
              )}

              {/* Optional Message for Activation */}
              {statusAction === 'activate' && (
                <div className="space-y-3">
                  <label className="block">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900">
                        Welcome Message <span className="text-gray-400">(Optional)</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        {statusReason.length}/300 characters
                      </span>
                    </div>
                    <textarea
                      value={statusReason}
                      onChange={(e) => setStatusReason(e.target.value.slice(0, 300))}
                      placeholder="Add a welcome message for members (optional)..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none transition-all text-sm"
                      rows={3}
                      maxLength={300}
                    />
                  </label>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedCommunityData(null)
                    setStatusAction(null)
                    setStatusReason('')
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={
                    isSubmitting || 
                    (statusAction === 'deactivate' && (!statusReason.trim() || statusReason.length < 20))
                  }
                  className={`px-8 py-3 rounded-xl font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2 ${
                    statusAction === 'activate'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {statusAction === 'activate' ? (
                        <>
                          <Power className="w-5 h-5" />
                          <span>Activate Community</span>
                        </>
                      ) : (
                        <>
                          <PowerOff className="w-5 h-5" />
                          <span>Deactivate Community</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className={`px-8 py-4 ${
              statusAction === 'activate' ? 'bg-emerald-50' : 'bg-orange-50'
            } border-t-2 border-gray-200`}>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {statusAction === 'activate' 
                    ? 'All members will be notified via email about the community activation.'
                    : 'All members will be notified via email about the community deactivation and the reason provided.'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
                        