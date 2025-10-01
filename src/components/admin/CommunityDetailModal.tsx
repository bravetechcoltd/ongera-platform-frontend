"use client"

import { Community } from "@/lib/features/auth/communitiesSlice"
import { X, Users, MessageSquare, Calendar, Globe, Lock, Building2, CheckCircle, AlertCircle } from "lucide-react"

interface CommunityDetailModalProps {
  community: Community
  onClose: () => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export default function CommunityDetailModal({ 
  community, 
  onClose, 
  onApprove, 
  onReject 
}: CommunityDetailModalProps) {
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Public': return <Globe className="w-5 h-5" />
      case 'Private': return <Lock className="w-5 h-5" />
      case 'Institution-Specific': return <Building2 className="w-5 h-5" />
      default: return <Globe className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-br from-emerald-500 to-teal-500 relative">
            {community.cover_image_url && (
              <img
                src={community.cover_image_url}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Status Badge */}
            <div className="absolute top-4 left-4">
              {community.is_active ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Approved
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  Pending Approval
                </span>
              )}
            </div>
          </div>

          {/* Community Info */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{community.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    {community.category}
                  </span>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(community.community_type)}
                    <span>{community.community_type}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Users className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{community.member_count}</p>
              <p className="text-sm text-gray-600">Members</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{community.post_count}</p>
              <p className="text-sm text-gray-600">Posts</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <Calendar className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-gray-900">
                {new Date(community.created_at).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-600">Created</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">{community.description}</p>
          </div>

          {/* Rules */}
          {community.rules && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Community Rules</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-gray-700 whitespace-pre-line">{community.rules}</p>
              </div>
            </div>
          )}

          {/* Creator Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Creator</h3>
            <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                {community.creator.first_name?.[0]}{community.creator.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {community.creator.first_name} {community.creator.last_name}
                </p>
                <p className="text-sm text-gray-600">{community.creator.account_type}</p>
              </div>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Join Approval</p>
                <p className="font-semibold text-gray-900">
                  {community.join_approval_required ? "Required" : "Not Required"}
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Visibility</p>
                <p className="font-semibold text-gray-900">{community.community_type}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        {!community.is_active && onApprove && onReject && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              onClick={() => onReject(community.id)}
              className="px-6 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-semibold"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(community.id)}
              className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold"
            >
              Approve Community
            </button>
          </div>
        )}
      </div>
    </div>
  )
}