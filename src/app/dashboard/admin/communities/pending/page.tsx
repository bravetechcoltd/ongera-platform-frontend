"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchPendingCommunities,
  approveCommunity,
  rejectCommunity,
  clearCommunitiesError
} from "@/lib/features/auth/communitiesSlice"
import {
  CheckCircle, XCircle, Search, RefreshCw, Users,
  Globe, Lock, Building2, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Eye, X, AlertTriangle,
  Mail, Calendar, Hash, BookOpen, User, MapPin,
  FileText
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

export default function PendingCommunityManagement() {
  const dispatch = useAppDispatch()
  const { pendingCommunities, isLoading, isSubmitting, error, pagination } = useAppSelector(state => state.communities)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  
  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadPendingCommunities()
  }, [currentPage])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearCommunitiesError())
    }
  }, [error, dispatch])

  const loadPendingCommunities = () => {
    dispatch(fetchPendingCommunities({
      page: currentPage,
      limit: 20
    }))
  }

  const handleRefresh = () => {
    setCurrentPage(1)
    loadPendingCommunities()
    toast.success("Refreshed successfully!")
  }

  const handleApprove = async (community: any) => {
    try {
      await dispatch(approveCommunity(community.id)).unwrap()
      toast.success(`"${community.name}" approved successfully!`)
      loadPendingCommunities()
    } catch (err: any) {
      toast.error(err || "Failed to approve community")
    }
  }

  const handleReject = async () => {
    if (!selectedCommunity) return
    
    if (!rejectReason.trim() || rejectReason.length < 20) {
      toast.error("Please provide a detailed reason (at least 20 characters)")
      return
    }
    
    try {
      await dispatch(rejectCommunity({ 
        id: selectedCommunity.id, 
        reason: rejectReason 
      })).unwrap()
      toast.success(`"${selectedCommunity.name}" rejected successfully!`)
      setShowRejectModal(false)
      setSelectedCommunity(null)
      setRejectReason('')
      loadPendingCommunities()
    } catch (err: any) {
      toast.error(err || "Failed to reject community")
    }
  }

  const openDetailsModal = (community: any) => {
    setSelectedCommunity(community)
    setShowDetailsModal(true)
  }

  const openRejectModal = (community: any) => {
    setSelectedCommunity(community)
    setRejectReason('')
    setShowRejectModal(true)
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Public': return <Globe className="w-4 h-4 text-green-600" />
      case 'Private': return <Lock className="w-4 h-4 text-orange-600" />
      case 'Institution-Specific': return <Building2 className="w-4 h-4 text-purple-600" />
      default: return <Globe className="w-4 h-4 text-gray-600" />
    }
  }

  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'Public': return "bg-green-100 text-green-700"
      case 'Private': return "bg-orange-100 text-orange-700"
      case 'Institution-Specific': return "bg-purple-100 text-purple-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const categories = Array.from(new Set(
    pendingCommunities.map(community => community.category).filter(Boolean)
  ))

  const filteredCommunities = pendingCommunities.filter(community => {
    const matchesSearch = !searchQuery || 
      community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.creator?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      community.creator?.last_name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = !categoryFilter || community.category === categoryFilter
    
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Pending Community Approvals
                </h1>
                <p className="text-xs text-gray-500">
                  {filteredCommunities.length} pending • {pagination.total} total
                </p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-3 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, description, or creator..."
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7]"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] text-sm"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
            <button
              onClick={() => dispatch(clearCommunitiesError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Communities Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          </div>
        ) : filteredCommunities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Pending Communities
            </h3>
            <p className="text-gray-500">
              {searchQuery || categoryFilter
                ? "Try adjusting your filters"
                : "All communities have been reviewed"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0158B7] text-white">
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">#</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Community</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Creator</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Members</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Created</th>
                    <th className="px-3 py-3 text-center text-xs font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredCommunities.map((community, index) => (
                    <motion.tr
                      key={community.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-blue-50 transition-colors group"
                    >
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-white">
                            {((currentPage - 1) * 20) + index + 1}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500">
                            {community.cover_image_url ? (
                              <img
                                src={community.cover_image_url}
                                alt={community.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                {community.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {community.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {community.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                            {community.creator.first_name?.[0]}{community.creator.last_name?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {community.creator.first_name} {community.creator.last_name}
                            </p>
                            <p className="text-xs text-gray-500">{community.creator.account_type}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(community.community_type)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(community.community_type)}`}>
                            {community.community_type}
                          </span>
                        </div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-1 text-gray-600 bg-gray-100 px-2 py-1 rounded-lg w-fit">
                          <Users className="w-3 h-3" />
                          <span className="text-xs font-semibold">{community.member_count || 0}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          <span>{new Date(community.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          <button
                            onClick={() => openDetailsModal(community)}
                            className="p-1.5 bg-blue-100 text-[#0158B7] rounded hover:bg-blue-200 transition-colors group-hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleApprove(community)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openRejectModal(community)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Showing <span className="font-semibold">{((currentPage - 1) * 20) + 1}</span> to{' '}
                    <span className="font-semibold">
                      {Math.min(currentPage * 20, pagination.total)}
                    </span>{' '}
                    of <span className="font-semibold">{pagination.total}</span> communities
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              currentPage === pageNum
                                ? "bg-[#0158B7] text-white shadow-sm"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === pagination.totalPages}
                      className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-8 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
            <div className="bg-[#0158B7] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Community Details</h3>
                    <p className="text-white/90 text-sm">Review and approve or reject</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedCommunity(null)
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500">
                  {selectedCommunity.cover_image_url ? (
                    <img
                      src={selectedCommunity.cover_image_url}
                      alt={selectedCommunity.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedCommunity.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{selectedCommunity.name}</h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedCommunity.community_type)}`}>
                      {getTypeIcon(selectedCommunity.community_type)}
                      <span className="ml-1">{selectedCommunity.community_type}</span>
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      <Hash className="w-4 h-4 mr-1" />
                      {selectedCommunity.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 text-[#0158B7] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedCommunity.member_count}</p>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(selectedCommunity.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Created</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                  <Lock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900 capitalize">
                    {selectedCommunity.join_approval_required ? 'Approval Required' : 'Open Join'}
                  </p>
                  <p className="text-sm text-gray-600">Join Policy</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-[#0158B7]" />
                      Description
                    </h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedCommunity.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {selectedCommunity.rules && (
                    <div>
                      <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                        <BookOpen className="w-5 h-5 mr-2 text-[#0158B7]" />
                        Community Rules
                      </h5>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {selectedCommunity.rules}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-[#0158B7]" />
                      Creator Information
                    </h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {selectedCommunity.creator.first_name?.[0]}{selectedCommunity.creator.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {selectedCommunity.creator.first_name} {selectedCommunity.creator.last_name}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">{selectedCommunity.creator.account_type}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedCommunity.creator.email}
                        </div>
                        {selectedCommunity.creator.profile?.institution_name && (
                          <div className="flex items-center text-gray-600">
                            <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                            {selectedCommunity.creator.profile.institution_name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedCommunity(null)
                }}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  openRejectModal(selectedCommunity)
                }}
                disabled={isSubmitting}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => {
                  handleApprove(selectedCommunity)
                  setShowDetailsModal(false)
                }}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Approve</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedCommunity && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            <div className="bg-red-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Reject Community</h3>
                    <p className="text-red-100 text-sm">This reason will be sent to the creator</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedCommunity(null)
                    setRejectReason('')
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <p className="text-sm font-bold text-gray-900 mb-1">{selectedCommunity.name}</p>
                <p className="text-xs text-gray-500">
                  by {selectedCommunity.creator?.first_name} {selectedCommunity.creator?.last_name}
                </p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  Important Information
                </h4>
                <ul className="space-y-1 text-xs text-red-800">
                  <li className="flex items-start">
                    <span className="mr-1.5">•</span>
                    <span>Community will be permanently deleted</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5">•</span>
                    <span>Creator will be notified via email</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5">•</span>
                    <span>This action cannot be undone</span>
                  </li>
                </ul>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-900">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">{rejectReason.length}/500</span>
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value.slice(0, 500))}
                  placeholder="Provide detailed reason (min 20 characters)..."
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                  rows={4}
                  maxLength={500}
                />
                {rejectReason.length > 0 && rejectReason.length < 20 && (
                  <p className="text-xs text-red-600 flex items-center mt-1">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    At least 20 characters required
                  </p>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end space-x-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedCommunity(null)
                  setRejectReason('')
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting || !rejectReason.trim() || rejectReason.length < 20}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-sm font-bold disabled:opacity-50 flex items-center space-x-1.5 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rejecting...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Reject Community</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}