
// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  getAllUsers,
  activateDeactivateUser,
  deleteUser,
  clearError
} from "@/lib/features/auth/auth-slice"
import {
  Power, PowerOff, Trash2, Search, Filter, Users as UsersIcon,
  Loader2, AlertCircle, ChevronLeft, ChevronRight, X, AlertTriangle,
  CheckCircle, XCircle, Calendar, Mail, Phone, MapPin, Building2, RefreshCw,
  Eye, Edit, UserX, SlidersHorizontal, CheckCircle2, Shield, Clock,
  Users
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

type StatusFilter = 'all' | 'active' | 'inactive'

export default function ManageUsersPage() {
  const dispatch = useAppDispatch()
  const { users, isLoadingUsers, isSubmitting, error, usersPagination } = useAppSelector(state => state.auth)

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Modal states
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)

  // Fetch all users once on component mount
  useEffect(() => {
    loadAllUsers()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearError())
    }
  }, [error, dispatch])

  const loadAllUsers = () => {
    dispatch(getAllUsers({
      page: 1,
      limit: 1000,
    }))
  }

  const handleRefreshUsers = () => {
    loadAllUsers()
    toast.success("Users refreshed successfully!")
  }

  // Filter users locally based on filters
  const filteredUsers = users
    .filter(user => user.account_type !== 'admin')
    .filter(user => {
      if (statusFilter === 'active') return user.is_active
      if (statusFilter === 'inactive') return !user.is_active
      return true
    })
    .filter(user => {
      if (accountTypeFilter && user.account_type !== accountTypeFilter) return false
      return true
    })
    .filter(user => {
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.account_type?.toLowerCase().includes(query)
      )
    })

  // Pagination
  const totalItems = filteredUsers.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentPageUsers = filteredUsers.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, accountTypeFilter, statusFilter])

  const openStatusModal = (user: any, action: 'activate' | 'deactivate') => {
    setSelectedUser(user)
    setStatusAction(action)
    setStatusReason('')
    setShowStatusModal(true)
  }

  const handleStatusChange = async () => {
    if (!selectedUser || !statusAction) return

    if (statusAction === 'deactivate' && !statusReason.trim()) {
      toast.error("Please provide a reason for deactivation")
      return
    }

    if (statusAction === 'deactivate' && statusReason.length < 20) {
      toast.error("Please provide a more detailed reason (at least 20 characters)")
      return
    }

    try {
      const is_active = statusAction === 'activate'

      await dispatch(activateDeactivateUser({
        id: selectedUser.id,
        is_active,
        reason: statusAction === 'deactivate' ? statusReason : undefined
      })).unwrap()

      toast.success(`User ${statusAction === 'activate' ? 'activated' : 'deactivated'} successfully!`)
      setShowStatusModal(false)
      setSelectedUser(null)
      setStatusAction(null)
      setStatusReason('')
      loadAllUsers()
    } catch (err: any) {
      toast.error(err || `Failed to ${statusAction} user`)
    }
  }

  const openDeleteModal = (user: any) => {
    setUserToDelete(user)
    setShowDeleteModal(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      await dispatch(deleteUser(userToDelete.id)).unwrap()
      toast.success("User deleted successfully!")
      setShowDeleteModal(false)
      setUserToDelete(null)
      loadAllUsers()
    } catch (err: any) {
      toast.error(err || "Failed to delete user")
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3" />
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700"
      case "user":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getRoleLabel = (role: string) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
  }

  // Get unique account types for dropdown
  const accountTypes = Array.from(new Set(
    users
      .filter(user => user.account_type !== 'admin')
      .map(user => user.account_type)
      .filter(Boolean)
  ))

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
              <div className="w-10 h-10 bg-[#0158B7] rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  User Management
                </h1>
                <p className="text-xs text-gray-500">{filteredUsers.length} filtered users • {users.length} total users</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all text-sm ${showFilters
                    ? "bg-[#0158B7] text-white border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filters
              </button>
              <button
                onClick={handleRefreshUsers}
                disabled={isLoadingUsers}
                className="flex items-center px-3 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoadingUsers ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or account type..."
              className="
      w-full pl-9 pr-4 py-2 text-sm
      border border-gray-300 rounded-lg
      text-black bg-white
      focus:ring-2 focus:ring-[#0158B7]
      focus:border-[#0158B7]
    "
            />
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
              >

                {/* Account Type Filter */}
                <select
                  value={accountTypeFilter}
                  onChange={(e) => setAccountTypeFilter(e.target.value)}
                  className="
          px-4 py-2 border border-gray-300
          rounded-lg text-sm
          text-black bg-white
          focus:ring-2 focus:ring-[#0158B7]
          focus:border-[#0158B7]
        "
                >
                  <option className="text-black" value="">
                    All Account Types
                  </option>

                  {accountTypes.map((type) => (
                    <option key={type} value={type} className="text-black">
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  className="
          px-4 py-2 border border-gray-300
          rounded-lg text-sm
          text-black bg-white
          focus:ring-2 focus:ring-[#0158B7]
          focus:border-[#0158B7]
        "
                >
                  <option className="text-black" value="all">
                    All Status
                  </option>
                  <option className="text-black" value="active">
                    Active
                  </option>
                  <option className="text-black" value="inactive">
                    Inactive
                  </option>
                </select>

              </motion.div>
            )}
          </AnimatePresence>

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
              onClick={() => dispatch(clearError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Users Table */}
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          </div>
        ) : currentPageUsers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Users {searchQuery ? "Found" : ""}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No users found in the system"}
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
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">User</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Contact</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Account Type</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Joined</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentPageUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-blue-50 transition-colors group"
                    >
                      {/* Number */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="w-7 h-7 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-white">
                            {startIndex + index + 1}
                          </span>
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.username || "No username"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-gray-600">
                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                            {user.email}
                          </div>
                          {user.phone_number && (
                            <div className="flex items-center text-xs text-gray-600">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" />
                              {user.phone_number}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Account Type */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.account_type)}`}>
                          <Shield className="w-3 h-3 mr-1" />
                          {getRoleLabel(user.account_type)}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-3 h-3 mr-1 text-gray-400" />
                          {new Date(user.date_joined).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {getStatusBadge(user.is_active)}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          {user.is_active ? (
                            <button
                              onClick={() => openStatusModal(user, 'deactivate')}
                              disabled={isSubmitting}
                              className="p-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                              title="Deactivate User"
                            >
                              <PowerOff className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openStatusModal(user, 'activate')}
                              disabled={isSubmitting}
                              className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                              title="Activate User"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => openDeleteModal(user)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Showing <span className="font-semibold">{startIndex + 1}</span>{" "}
                    to{" "}
                    <span className="font-semibold">
                      {Math.min(endIndex, totalItems)}
                    </span>{" "}
                    of <span className="font-semibold">{totalItems}</span>
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
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${currentPage === pageNum
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
                      disabled={currentPage === totalPages}
                      className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded bg-white hover:border-gray-400 focus:ring-1 focus:ring-[#0158B7]"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Enhanced Status Change Modal */}
      {showStatusModal && selectedUser && statusAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#0158B7] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {statusAction === 'activate' ? (
                      <Power className="w-5 h-5 text-white" />
                    ) : (
                      <PowerOff className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {statusAction === 'activate' ? 'Activate User' : 'Deactivate User'}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {statusAction === 'activate'
                        ? 'Grant access to this user account'
                        : 'Temporarily suspend this user account'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedUser(null)
                    setStatusAction(null)
                    setStatusReason('')
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                    {selectedUser.profile_picture_url ? (
                      <img
                        src={selectedUser.profile_picture_url}
                        alt={selectedUser.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {selectedUser.first_name?.charAt(0)}{selectedUser.last_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h4>
                    <p className="text-xs text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              {statusAction === 'deactivate' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Deactivation Reason <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      {statusReason.length}/500
                    </span>
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value.slice(0, 500))}
                    placeholder="Please provide a detailed reason for deactivation (minimum 20 characters)..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] resize-none"
                    rows={3}
                  />
                  {statusReason.length < 20 && statusReason.length > 0 && (
                    <p className="text-xs text-orange-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Minimum 20 characters required</span>
                    </p>
                  )}
                </div>
              )}

              {statusAction === 'activate' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Welcome Message <span className="text-gray-400">(Optional)</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      {statusReason.length}/300
                    </span>
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value.slice(0, 300))}
                    placeholder="Add a welcome message for the user..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] resize-none"
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedUser(null)
                  setStatusAction(null)
                  setStatusReason('')
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={
                  isSubmitting ||
                  (statusAction === 'deactivate' && (!statusReason.trim() || statusReason.length < 20))
                }
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${statusAction === 'activate'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-[#0158B7] hover:bg-blue-700 text-white'
                  } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {statusAction === 'activate' ? (
                      <>
                        <Power className="w-4 h-4" />
                        <span>Activate</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-4 h-4" />
                        <span>Deactivate</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-red-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Delete User
                    </h3>
                    <p className="text-red-100 text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setUserToDelete(null)
                    }}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3 bg-gradient-to-br from-purple-500 to-pink-500">
                  {userToDelete.profile_picture_url ? (
                    <img
                      src={userToDelete.profile_picture_url}
                      alt={userToDelete.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold">
                      {userToDelete.first_name?.charAt(0)}{userToDelete.last_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  Are you sure you want to permanently delete
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {userToDelete.first_name} {userToDelete.last_name}?
                </p>
                <p className="text-xs text-gray-500">{userToDelete.email}</p>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Warning: Permanent Deletion
                </h4>
                <ul className="space-y-1 text-xs text-red-800">
                  <li className="flex items-start space-x-2">
                    <span>•</span>
                    <span>All user data will be permanently removed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span>•</span>
                    <span>This action cannot be reversed</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setUserToDelete(null)
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
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