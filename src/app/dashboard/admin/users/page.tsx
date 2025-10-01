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
  CheckCircle, XCircle, Calendar, Mail, Phone, MapPin, Building2, RefreshCw
} from "lucide-react"
import { toast } from "react-hot-toast"

type StatusFilter = 'all' | 'active' | 'inactive'

export default function ManageUsersPage() {
  const dispatch = useAppDispatch()
  const { users, isLoadingUsers, isSubmitting, error, usersPagination } = useAppSelector(state => state.auth)
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState('')
  
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
      limit: 1000, // Fetch all users at once
    }))
  }

  const handleRefreshUsers = () => {
    loadAllUsers()
    toast.success("Users refreshed successfully!")
  }

  // Filter users locally based on filters
  const filteredUsers = users
    .filter(user => user.account_type !== 'admin') // Exclude admin users
    .filter(user => {
      // Status filter
      if (statusFilter === 'active') return user.is_active
      if (statusFilter === 'inactive') return !user.is_active
      return true
    })
    .filter(user => {
      // Account type filter
      if (accountTypeFilter && user.account_type !== accountTypeFilter) return false
      return true
    })
    .filter(user => {
      // Search filter
      if (!searchQuery) return true
      const query = searchQuery.toLowerCase()
      return (
        user.first_name?.toLowerCase().includes(query) ||
        user.last_name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.account_type?.toLowerCase().includes(query)
      )
    })

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
      // Refresh users to see changes
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
      // Refresh users to see changes
      loadAllUsers()
    } catch (err: any) {
      toast.error(err || "Failed to delete user")
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
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    )
  }

  // Get unique account types for dropdown (excluding admin)
  const accountTypes = Array.from(new Set(
    users
      .filter(user => user.account_type !== 'admin')
      .map(user => user.account_type)
      .filter(Boolean)
  ))

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all registered users on the platform</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefreshUsers}
              disabled={isLoadingUsers}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} />
              <span>Refresh Users</span>
            </button>
            <div className="text-center px-6 py-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <p className="text-2xl font-bold text-blue-600">{filteredUsers.length}</p>
              <p className="text-xs text-gray-600">Filtered Users</p>
            </div>
            <div className="text-center px-6 py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <p className="text-2xl font-bold text-green-600">{users.length}</p>
              <p className="text-xs text-gray-600">Total Users</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Status Filter */}
          <div className="flex space-x-2">
            {(['all', 'active', 'inactive'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          {/* Account Type Filter */}
          <div className="flex space-x-2">
            <select
              value={accountTypeFilter}
              onChange={(e) => setAccountTypeFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="">All Account Types</option>
              {accountTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div className="flex-1 flex space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, account type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {(searchQuery || accountTypeFilter) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setAccountTypeFilter('')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading users...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-600">Try adjusting your filters or refresh the users list</p>
            <button
              onClick={handleRefreshUsers}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Refresh Users
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">#</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Account Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      {/* Number */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-blue-700">
                            {index + 1}
                          </span>
                        </div>
                      </td>

                      {/* User Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                            {user.profile_picture_url ? (
                              <img
                                src={user.profile_picture_url}
                                alt={user.first_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900">
                              {user.first_name} {user.last_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            <span className="truncate max-w-[180px]">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Account Type */}
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <Building2 className="w-3 h-3 mr-1" />
                          {user.account_type}
                        </span>
                      </td>

                      {/* Joined Date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(user.date_joined).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        {getStatusBadge(user.is_active)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {user.is_active ? (
                            <button
                              onClick={() => openStatusModal(user, 'deactivate')}
                              disabled={isSubmitting}
                              className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors disabled:opacity-50"
                              title="Deactivate User"
                            >
                              <PowerOff className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => openStatusModal(user, 'activate')}
                              disabled={isSubmitting}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                              title="Activate User"
                            >
                              <Power className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => openDeleteModal(user)}
                            disabled={isSubmitting}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results Info */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{filteredUsers.length}</span> of{' '}
                <span className="font-semibold">{users.length}</span> users
                {searchQuery && (
                  <span> for "<span className="font-semibold">{searchQuery}</span>"</span>
                )}
                {accountTypeFilter && (
                  <span> in <span className="font-semibold">{accountTypeFilter}</span></span>
                )}
                {statusFilter !== 'all' && (
                  <span> ({statusFilter})</span>
                )}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Status Change Modal */}
      {showStatusModal && selectedUser && statusAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-10 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
            {/* Modal Header */}
            <div className={`relative px-8 py-6 ${
              statusAction === 'activate' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                : 'bg-gradient-to-r from-orange-500 to-red-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm`}>
                    {statusAction === 'activate' ? (
                      <Power className="w-8 h-8 text-white" />
                    ) : (
                      <PowerOff className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {statusAction === 'activate' ? 'Activate User Account' : 'Deactivate User Account'}
                    </h3>
                    <p className="text-white/90 text-sm mt-1">
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
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">

              {/* User Info Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500">
                    {selectedUser.profile_picture_url ? (
                      <img
                        src={selectedUser.profile_picture_url}
                        alt={selectedUser.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                        {selectedUser.first_name?.charAt(0)}{selectedUser.last_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900">
                      {selectedUser.first_name} {selectedUser.last_name}
                    </h4>
                    <p className="text-sm text-gray-600">{selectedUser.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{selectedUser.account_type}</p>
                  </div>
                </div>
              </div>

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
                          <span>User will not be able to login to their account</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Email notification will be sent to the user</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          <span>Account can be reactivated later</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h5 className="text-lg font-bold text-green-900 mb-2">
                        Account Activation Benefits
                      </h5>
                      <ul className="space-y-2 text-sm text-green-800">
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>User will regain full access to their account</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>Email notification will be sent to the user</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <span>All platform features will be accessible</span>
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
                      placeholder="Please provide a detailed reason for deactivating this user account. This will be sent to the user via email..."
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
                      <strong className="text-gray-900">Note:</strong> The reason you provide will be included in the email notification sent to the user. Please be professional and clear.
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
                      placeholder="Add a welcome message for the user (optional)..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none transition-all text-sm"
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
                    setSelectedUser(null)
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
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/30'
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
                          <span>Activate User</span>
                        </>
                      ) : (
                        <>
                          <PowerOff className="w-5 h-5" />
                          <span>Deactivate User</span>
                        </>
                      )}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className={`px-8 py-4 ${
              statusAction === 'activate' ? 'bg-green-50' : 'bg-orange-50'
            } border-t-2 border-gray-200`}>
              <div className="flex items-center space-x-2 text-xs text-gray-600">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {statusAction === 'activate' 
                    ? 'The user will be notified via email about the account activation.'
                    : 'The user will be notified via email about the account deactivation and the reason provided.'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Delete User Account
                    </h3>
                    <p className="text-red-100 text-sm mt-1">
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
                    className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500">
                  {userToDelete.profile_picture_url ? (
                    <img
                      src={userToDelete.profile_picture_url}
                      alt={userToDelete.first_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                      {userToDelete.first_name?.charAt(0)}{userToDelete.last_name?.charAt(0)}
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-2">
                  Are you sure you want to permanently delete the account for
                </p>
                <p className="text-lg font-bold text-gray-900 mb-1">
                  {userToDelete.first_name} {userToDelete.last_name}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {userToDelete.email}
                </p>
              </div>

              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
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
                    <span>Projects, posts, and contributions will be deleted</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span>•</span>
                    <span>This action cannot be reversed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span>•</span>
                    <span>User will receive a deletion notification email</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3 border-t-2 border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setUserToDelete(null)
                }}
                disabled={isSubmitting}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all font-semibold disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-bold disabled:opacity-50 flex items-center space-x-2 shadow-lg shadow-red-500/30"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-5 h-5" />
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