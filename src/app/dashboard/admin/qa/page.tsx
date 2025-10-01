"use client"

import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchQAThreads,
  fetchThreadById,
  deleteThread,
  clearCurrentThread,
  clearQAError
} from "@/lib/features/auth/qaSlice"
import {
  MessageSquare, Search, RefreshCw, Eye, Trash2, CheckCircle,
  XCircle, Loader2, ChevronLeft, ChevronRight, User, Calendar,
  MessageCircle, TrendingUp, Hash, X, AlertTriangle, ThumbsUp
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

// View Details Modal
interface ViewQADetailsModalProps {
  isOpen: boolean
  onClose: () => void
  thread: any
}

function ViewQADetailsModal({ isOpen, onClose, thread }: ViewQADetailsModalProps) {
  if (!isOpen || !thread) return null

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Question Details</h3>
                <p className="text-blue-100 text-xs">Complete Q&A information</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          
          {/* Title & Status */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{thread.title}</h2>
            <div className="flex items-center space-x-2 mb-3">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                thread.is_answered 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {thread.is_answered ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Answered
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Unanswered
                  </>
                )}
              </span>
              {thread.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  <Hash className="w-3 h-3 mr-1" />
                  {thread.category}
                </span>
              )}
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-2">Question</h4>
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
              {thread.content}
            </div>
          </div>

          {/* Tags */}
          {thread.tags && thread.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {thread.tags.map((tag: string, idx: number) => (
                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* Asker Info */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                <User className="w-4 h-4 mr-2 text-[#0158B7]" />
                Asked By
              </h4>
              <div className="flex items-center space-x-3">
                {thread.asker?.profile_picture_url ? (
                  <img src={thread.asker.profile_picture_url} alt={thread.asker.first_name} className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0158B7] flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {thread.asker?.first_name?.[0]}{thread.asker?.last_name?.[0]}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {thread.asker?.first_name} {thread.asker?.last_name}
                  </p>
                  <p className="text-xs text-gray-600 capitalize">{thread.asker?.account_type?.toLowerCase()}</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-[#0158B7]" />
                Statistics
              </h4>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-semibold text-gray-900">{thread.view_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Answers:</span>
                  <span className="font-semibold text-gray-900">{thread.answer_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Asked:</span>
                  <span className="font-semibold text-gray-900">
                    {formatDate(thread.created_at)} at {formatTime(thread.created_at)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Best Answer */}
          {thread.best_answer && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-bold text-green-900">Best Answer</h4>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-3">
                {thread.best_answer.content}
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {thread.best_answer.answerer?.first_name?.[0]}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {thread.best_answer.answerer?.first_name} {thread.best_answer.answerer?.last_name}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-gray-600">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    {thread.best_answer.upvotes_count}
                  </span>
                  <span className="text-gray-500">{formatDate(thread.best_answer.created_at)}</span>
                </div>
              </div>
            </div>
          )}

          {/* All Answers */}
          {thread.answers && thread.answers.length > 0 && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <MessageCircle className="w-4 h-4 mr-2 text-[#0158B7]" />
                All Answers ({thread.answers.length})
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {thread.answers.map((answer: any, idx: number) => (
                  <div key={idx} className={`bg-white border rounded-lg p-3 ${
                    answer.is_accepted ? 'border-green-300' : 'border-gray-200'
                  }`}>
                    <div className="text-sm text-gray-700 leading-relaxed mb-2">
                      {answer.content}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {answer.answerer?.first_name?.[0]}
                          </span>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {answer.answerer?.first_name} {answer.answerer?.last_name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center text-gray-600">
                          <ThumbsUp className="w-3 h-3 mr-1" />
                          {answer.upvotes_count}
                        </span>
                        {answer.is_accepted && (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Accepted
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Community */}
          {thread.community && (
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-3">
              <h4 className="text-sm font-bold text-gray-900 mb-2">Community</h4>
              <p className="text-sm font-semibold text-gray-900">{thread.community.name}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200 flex-shrink-0">
          <button onClick={onClose} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// Enhanced Table
interface EnhancedQATableProps {
  threads: any[]
  isLoading: boolean
  currentPage: number
  totalPages: number
  startIndex: number
  onPageChange: (page: number) => void
  onViewDetails: (thread: any) => void
  onDelete: (thread: any) => void
}

function EnhancedQATable({
  threads, isLoading, currentPage, totalPages, startIndex,
  onPageChange, onViewDetails, onDelete
}: EnhancedQATableProps) {
  
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (isAnswered: boolean) => {
    if (isAnswered) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3" />
          Answered
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
        <AlertTriangle className="w-3 h-3" />
        Unanswered
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#0158B7]" />
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#0158B7] text-white">
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">#</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Question</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Asker</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Category</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Stats</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Asked</th>
              <th className="px-2 py-2 text-left text-xs font-bold uppercase">Status</th>
              <th className="px-2 py-2 text-center text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {threads.map((thread, index) => {
              const globalIndex = startIndex + index + 1
              return (
                <motion.tr
                  key={thread.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-blue-50 transition-colors group"
                >
                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="w-5 h-5 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                      <span className="text-[10px] font-bold text-white">{globalIndex}</span>
                    </div>
                  </td>
                  
                  <td className="px-2 py-2">
                    <div className="min-w-0 max-w-xs">
                      <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#0158B7] transition-colors">
                        {thread.title.split(' ').slice(0, 8).join(' ')}
                        {thread.title.split(' ').length > 8 && '...'}
                      </p>
                      {thread.tags && thread.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {thread.tags.slice(0, 3).map((tag: string, idx: number) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-2 py-2">
                    <div className="flex items-center space-x-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">
                          {thread.asker?.first_name} {thread.asker?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate capitalize">{thread.asker?.account_type?.toLowerCase()}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    {thread.category ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        <Hash className="w-3 h-3 mr-1" />
                        {thread.category}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-2 py-2">
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <Eye className="w-3 h-3 mr-1" />
                        <span>{thread.view_count} views</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <MessageCircle className="w-3 h-3 mr-1" />
                        <span>{thread.answer_count || 0} answers</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="text-xs text-gray-900 font-semibold">
                      {formatDate(thread.created_at)}
                    </div>
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    {getStatusBadge(thread.is_answered)}
                  </td>

                  <td className="px-2 py-2 whitespace-nowrap">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onViewDetails(thread)}
                        className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all transform hover:scale-110 shadow-sm"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(thread)}
                        className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all transform hover:scale-110 shadow-sm"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-600">
              Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(startIndex + threads.length, threads.length)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum = i + 1
                if (totalPages > 5) {
                  if (currentPage <= 3) pageNum = i + 1
                  else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
                  else pageNum = currentPage - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                      currentPage === pageNum
                        ? "bg-[#0158B7] text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Stats Cards
function StatsCards({ stats }: { stats: any }) {
  const statItems = [
    { label: "Total Questions", value: stats.total, icon: MessageSquare, color: "bg-[#0158B7]", bgColor: "bg-blue-50", textColor: "text-blue-700" },
    { label: "Answered", value: stats.answered, icon: CheckCircle, color: "bg-green-500", bgColor: "bg-green-50", textColor: "text-green-700" },
    { label: "Unanswered", value: stats.unanswered, icon: AlertTriangle, color: "bg-yellow-500", bgColor: "bg-yellow-50", textColor: "text-yellow-700" },
    { label: "Total Answers", value: stats.totalAnswers, icon: MessageCircle, color: "bg-purple-500", bgColor: "bg-purple-50", textColor: "text-purple-700" },
    { label: "Total Views", value: stats.totalViews, icon: Eye, color: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700" },
    { label: "Active Users", value: stats.activeUsers, icon: User, color: "bg-pink-500", bgColor: "bg-pink-50", textColor: "text-pink-700" }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={index} className={`${item.bgColor} rounded-lg border p-3 hover:shadow-sm transition-all`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
                <p className={`text-xs font-medium ${item.textColor}`}>{item.label}</p>
              </div>
              <div className={`p-1.5 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-4 h-4 ${item.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Filters
function QAFilters({ filters, onFiltersChange, threads }: any) {
  const categories: string[] = Array.from(new Set(threads.map((t: any) => t.category).filter(Boolean))) as string[]
  const statuses = ['all', 'answered', 'unanswered']

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
          <input
            type="text"
            placeholder="Search questions..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="w-full pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7]"
          />
        </div>
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7]"
        >
          {statuses.map(s => <option key={s} value={s}>{s === 'all' ? 'All Status' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select
          value={filters.category}
          onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0158B7]"
        >
          <option value="">All Categories</option>
          {categories.map((c: string) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
    </div>
  )
}

// Delete Confirmation Modal
interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  thread: any
  isDeleting: boolean
}

function DeleteModal({ isOpen, onClose, onConfirm, thread, isDeleting }: DeleteModalProps) {
  if (!isOpen || !thread) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
        <div className="bg-red-500 px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Delete Question</h3>
              <p className="text-red-100 text-xs">This action cannot be undone</p>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-700 mb-2">Are you sure you want to delete this question?</p>
          <p className="text-sm font-semibold text-gray-900 bg-gray-50 p-2 rounded">{thread.title}</p>
        </div>

        <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-bold flex items-center space-x-1 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3 h-3" />
                <span>Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Component
export default function AdminQAManagementPage() {
  const dispatch = useAppDispatch()
  const { threads, isLoading, isSubmitting, error } = useAppSelector(state => state.qa)

  const [filters, setFilters] = useState({ search: '', status: 'all', category: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedThread, setSelectedThread] = useState<any>(null)
  const itemsPerPage = 10

  useEffect(() => {
    loadThreads()
  }, [])

  useEffect(() => {
    if (error) {
      toast.error(error)
      dispatch(clearQAError())
    }
  }, [error, dispatch])

  const loadThreads = () => {
    dispatch(fetchQAThreads({ page: 1, limit: 1000 }))
  }

  const filteredThreads = threads.filter(thread => {
    if (filters.search && !thread.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !thread.content?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.status === 'answered' && !thread.is_answered) return false
    if (filters.status === 'unanswered' && thread.is_answered) return false
    if (filters.category && thread.category !== filters.category) return false
    return true
  })

  const totalPages = Math.ceil(filteredThreads.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedThreads = filteredThreads.slice(startIndex, startIndex + itemsPerPage)

  const stats = {
    total: filteredThreads.length,
    answered: filteredThreads.filter(t => t.is_answered).length,
    unanswered: filteredThreads.filter(t => !t.is_answered).length,
    totalAnswers: filteredThreads.reduce((sum, t) => sum + (t.answer_count || 0), 0),
    totalViews: filteredThreads.reduce((sum, t) => sum + (t.view_count || 0), 0),
    activeUsers: new Set(filteredThreads.map(t => t.asker?.id)).size
  }

  const handleViewDetails = async (thread: any) => {
    try {
      const result = await dispatch(fetchThreadById(thread.id)).unwrap()
      setSelectedThread(result)
      setShowViewDetailsModal(true)
    } catch (err: any) {
      toast.error(err || "Failed to load question details")
    }
  }

  const handleDeleteClick = (thread: any) => {
    setSelectedThread(thread)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedThread) return

    try {
      await dispatch(deleteThread(selectedThread.id)).unwrap()
      toast.success("Question deleted successfully!")
      setShowDeleteModal(false)
      setSelectedThread(null)
      loadThreads()
    } catch (err: any) {
      toast.error(err || "Failed to delete question")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#0158B7] rounded-lg flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Q&A Management</h1>
                <p className="text-xs text-gray-500">{filteredThreads.length} filtered • {threads.length} total</p>
              </div>
            </div>
            <button onClick={loadThreads} disabled={isLoading} className="flex items-center px-2 py-1.5 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors text-xs">
              <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
          <StatsCards stats={stats} />
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center">
            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
            <button onClick={() => dispatch(clearQAError())} className="ml-auto text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4">
          <QAFilters filters={filters} onFiltersChange={setFilters} threads={threads} />
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <EnhancedQATable
            threads={paginatedThreads}
            isLoading={isLoading}
            currentPage={currentPage}
            totalPages={totalPages}
            startIndex={startIndex}
            onPageChange={setCurrentPage}
            onViewDetails={handleViewDetails}
            onDelete={handleDeleteClick}
          />
        </motion.div>

        {/* View Details Modal */}
        {showViewDetailsModal && selectedThread && (
          <ViewQADetailsModal
            isOpen={showViewDetailsModal}
            onClose={() => {
              setShowViewDetailsModal(false)
              setSelectedThread(null)
            }}
            thread={selectedThread}
          />
        )}

        {/* Delete Modal */}
        {showDeleteModal && selectedThread && (
          <DeleteModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false)
              setSelectedThread(null)
            }}
            onConfirm={handleDeleteConfirm}
            thread={selectedThread}
            isDeleting={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}