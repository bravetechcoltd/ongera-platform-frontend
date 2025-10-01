// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchCommunityById, joinCommunity, leaveCommunity } from "@/lib/features/auth/communitiesSlice"
import {
  ArrowLeft, Users, MessageSquare, Globe, Lock, Building,
  User, Share2, CheckCircle, X, Loader2, Calendar, Eye, AlertCircle
} from "lucide-react"
import Link from "next/link"
import SharedNavigation from "@/components/layout/Navigation"
import { RootState } from "@/lib/store"

// Skeleton Loaders
function SkeletonLoader({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200/50 rounded ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer" />
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}

export default function CommunityDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useDispatch()
  const { currentCommunity, isLoading, isSubmitting } = useSelector((state: RootState) => state.communities)
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth)

  const [isMember, setIsMember] = useState(false)
  const [joinMessage, setJoinMessage] = useState("")
  const [showJoinModal, setShowJoinModal] = useState(false)

  useEffect(() => {
    if (params.id) {
      dispatch(fetchCommunityById(params.id))
    }
  }, [dispatch, params.id])

  useEffect(() => {
    if (currentCommunity && user) {
      const member = currentCommunity.members?.some(
        (member: any) => member.user_id === user.id
      )
      setIsMember(!!member)
    }
  }, [currentCommunity, user])

  const handleJoin = async () => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    if (currentCommunity?.id) {
      if (currentCommunity.join_approval_required) {
        setShowJoinModal(true)
      } else {
        await dispatch(joinCommunity({
          id: currentCommunity.id
        }))
        setIsMember(true)
      }
    }
  }

  const handleJoinWithMessage = async () => {
    if (currentCommunity?.id) {
      await dispatch(joinCommunity({
        id: currentCommunity.id,
        message: joinMessage || undefined
      }))
      setShowJoinModal(false)
      setJoinMessage("")
    }
  }

  const handleLeave = async () => {
    if (!currentCommunity?.id) return
    if (confirm("Are you sure you want to leave this community?")) {
      await dispatch(leaveCommunity(currentCommunity.id))
      setIsMember(false)
    }
  }

  const formatDate = (dateString: any) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCommunityTypeIcon = (type: string) => {
    switch (type) {
      case "Public":
        return Globe
      case "Private":
        return Lock
      case "Institution-Specific":
        return Building
      default:
        return Users
    }
  }

  const getCommunityTypeColor = (type: string) => {
    const colors = {
      Public: 'bg-green-100 text-green-700',
      Private: 'bg-orange-100 text-orange-700',
      'Institution-Specific': 'bg-blue-100 text-blue-700'
    }
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  if (isLoading && !currentCommunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
        <SharedNavigation />
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-8 space-y-6">
          <SkeletonLoader className="h-12 w-48" />
          <div className="bg-white rounded-xl border border-gray-200 p-8 space-y-6">
            <SkeletonLoader className="h-80" />
            <SkeletonLoader className="h-8 w-3/4" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentCommunity) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
        <SharedNavigation />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center">
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community not found</h3>
            <Link
              href="/communities"
              className="text-[#0158B7] hover:text-[#0362C3] font-medium"
            >
              Back to Communities
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const community = currentCommunity
  const TypeIcon = getCommunityTypeIcon(community.community_type)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] to-white">
      <SharedNavigation />
      <div className="max-w-5xl mx-auto px-4 pt-24 pb-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-[#0158B7] mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span className="font-medium">Back to Communities</span>
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
          {/* Cover Image - Enhanced */}
          <div className="relative h-80 w-full bg-gradient-to-br from-[#0158B7] to-[#0362C3]">
            {community.cover_image_url ? (
              <img
                src={community.cover_image_url}
                alt={community.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Users className="w-24 h-24 text-white opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            
            {/* Type Badge */}
            <div className="absolute top-4 right-4">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getCommunityTypeColor(community.community_type)} bg-white/90 backdrop-blur-sm`}>
                <TypeIcon className="w-4 h-4" />
                {community.community_type}
              </span>
            </div>

            {/* Member Count Badge */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-semibold">{community.member_count || 0} members</span>
            </div>

            {/* Active Status */}
            {community.is_active && (
              <div className="absolute bottom-4 left-4">
                <span className="px-4 py-2 bg-green-500 text-white rounded-full text-sm font-bold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Active
                </span>
              </div>
            )}
          </div>

          {/* Community Info */}
          <div className="p-8">
            {/* Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{community.name}</h1>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center text-gray-600">
                  <Users className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">{community.member_count || 0}</span>
                  <span className="ml-1">members</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MessageSquare className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">{community.post_count || 0}</span>
                  <span className="ml-1">posts</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2 text-[#0158B7]" />
                  <span className="font-semibold">Created {formatDate(community.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Creator Info */}
            <div className="flex items-center justify-between py-6 border-y border-gray-200 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {community.creator?.first_name?.[0]}{community.creator?.last_name?.[0]}
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {community.creator?.first_name} {community.creator?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">Community Creator</p>
                  {community.creator?.account_type && (
                    <p className="text-xs text-gray-500">{community.creator.account_type}</p>
                  )}
                </div>
              </div>

              {community.category && (
                <div className="text-right">
                  <span className="inline-block px-4 py-2 bg-[#0158B7]/10 text-[#0158B7] rounded-lg text-sm font-semibold">
                    {community.category}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Community</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {community.description}
              </p>
            </div>

            {/* Rules */}
            {community.rules && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Community Rules
                </h3>
                <p className="text-sm text-blue-700 leading-relaxed whitespace-pre-wrap">
                  {community.rules}
                </p>
              </div>
            )}

            {/* Join Approval Notice */}
            {community.join_approval_required && (
              <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <p className="text-sm font-medium text-orange-800">
                    This community requires approval to join
                  </p>
                </div>
                <p className="text-sm text-orange-700 mt-1">
                  Your join request will be reviewed by the community administrators
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t border-gray-200">
              {!isAuthenticated ? (
                <div className="w-full bg-gradient-to-r from-[#A8C8E8]/20 to-[#8DB6E1]/20 border border-[#8DB6E1] rounded-xl p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Sign in to join this community
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    Connect with researchers and collaborate on exciting projects
                  </p>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    Sign In to Join
                  </Link>
                </div>
              ) : (
                <>
                  {!isMember && community.is_active && (
                    <button
                      onClick={handleJoin}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Join Community
                        </>
                      )}
                    </button>
                  )}

                  {isMember && (
                    <button
                      onClick={handleLeave}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold transition-all disabled:opacity-50"
                    >
                      <X className="w-5 h-5" />
                      Leave Community
                    </button>
                  )}

                  {!community.is_active && (
                    <div className="flex-1 p-4 bg-gray-100 rounded-lg text-center">
                      <p className="text-gray-600 font-medium">
                        This community is currently inactive
                      </p>
                    </div>
                  )}

                  <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold transition-all">
                    <Share2 className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Members Preview */}
            {community.members && community.members.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Members ({community.member_count})
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {community.members.slice(0, 6).map((member: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#0158B7] to-[#0362C3] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {member.user?.first_name?.[0]}{member.user?.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {member.user?.first_name} {member.user?.last_name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {member.role || 'Member'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {community.member_count > 6 && (
                  <p className="text-center text-sm text-gray-600 mt-4">
                    +{community.member_count - 6} more members
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Join {community.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This community requires approval. You can add a message to your request:
            </p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Tell the community why you'd like to join (optional)..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] resize-none mb-4"
              rows={4}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinWithMessage}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                ) : (
                  'Send Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}