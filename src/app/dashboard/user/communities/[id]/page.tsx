// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchCommunityById, joinCommunity, leaveCommunity } from "@/lib/features/auth/communitiesSlice"
import {
  Users, Globe, Lock, Building2, Calendar, MessageSquare,
  Settings, UserPlus, UserMinus, Loader2, ArrowLeft, Share2
} from "lucide-react"
import Link from "next/link"

export default function CommunityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { currentCommunity, isLoading, isSubmitting } = useAppSelector(state => state.communities)
  const { user } = useAppSelector(state => state.auth)

  const [activeTab, setActiveTab] = useState<"feed" | "about" | "members">("feed")
  const [isMember, setIsMember] = useState(false)

  useEffect(() => {
    if (params.id) {
      dispatch(fetchCommunityById(params.id as string))
    }
  }, [dispatch, params.id])

  useEffect(() => {
    if (currentCommunity && user) {
      const memberCheck = currentCommunity.members?.some(m => m.id === user.id)
      setIsMember(memberCheck || false)
    }
  }, [currentCommunity, user])

  const handleJoinLeave = async () => {
    if (!user || !currentCommunity) return

    try {
      if (isMember) {
        await dispatch(leaveCommunity(currentCommunity.id)).unwrap()
        setIsMember(false)
      } else {
        await dispatch(joinCommunity(currentCommunity.id)).unwrap()
        if (!currentCommunity.join_approval_required) {
          setIsMember(true)
        } else {
          router.push("/dashboard/user/communities/pending")
        }
      }
    } catch (error) {
      console.error("Action failed:", error)
    }
  }

  if (isLoading && !currentCommunity) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    )
  }

  if (!currentCommunity) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Community not found</p>
        <Link href="/dashboard/user/communities" className="text-emerald-600 hover:underline mt-4 inline-block">
          Back to Communities
        </Link>
      </div>
    )
  }

  const TypeIcon = currentCommunity.community_type === "Public" ? Globe :
    currentCommunity.community_type === "Private" ? Lock : Building2

  const isCreator = user?.id === currentCommunity.creator.id

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/user/communities"
        className="inline-flex items-center text-gray-600 hover:text-emerald-600"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Communities
      </Link>

      {/* Header Section */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* Cover Image */}
        <div className="relative h-56 bg-gradient-to-br from-emerald-500 to-teal-500">
          {currentCommunity.cover_image_url && (
            <img
              src={currentCommunity.cover_image_url}
              alt={currentCommunity.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Type Badge */}
          <div className="absolute top-4 right-4">
            <div className="px-4 py-2 bg-white/95 backdrop-blur-sm rounded-full shadow-lg flex items-center space-x-2">
              <TypeIcon className="w-4 h-4 text-gray-700" />
              <span className="text-sm font-semibold text-gray-900">
                {currentCommunity.community_type}
              </span>
            </div>
          </div>
        </div>

        {/* Community Info */}
        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h1 className="text-3xl font-bold text-gray-900">{currentCommunity.name}</h1>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                  {currentCommunity.category}
                </span>
              </div>
              <p className="text-gray-600 mb-4">{currentCommunity.description}</p>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-900">{currentCommunity.member_count}</span>
                  <span className="text-gray-600">members</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold text-gray-900">{currentCommunity.post_count}</span>
                  <span className="text-gray-600">posts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-600">
                    Created {new Date(currentCommunity.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {isCreator ? (
                <Link
                  href={`/dashboard/user/communities/${currentCommunity.id}/settings`}
                  className="flex items-center space-x-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  <Settings className="w-5 h-5" />
                  <span>Manage</span>
                </Link>
              ) : (
                <button
                  onClick={handleJoinLeave}
                  disabled={isSubmitting}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isMember
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg"
                    }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : isMember ? (
                    <>
                      <UserMinus className="w-5 h-5" />
                      <span>Leave Community</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Join Community</span>
                    </>
                  )}
                </button>
              )}
              <button className="p-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3 pt-6 border-t border-gray-200">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
              {currentCommunity.creator.first_name?.[0] || 'U'}
              {currentCommunity.creator.last_name?.[0] || ''}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {currentCommunity.creator.first_name && currentCommunity.creator.last_name
                  ? `${currentCommunity.creator.first_name} ${currentCommunity.creator.last_name}`
                  : 'Unknown User'
                }
              </p>
              <p className="text-xs text-gray-600">Community Creator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-8">
            {[
              { id: "feed", label: "Feed", icon: MessageSquare },
              { id: "about", label: "About", icon: Building2 },
              { id: "members", label: "Members", icon: Users }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 transition-colors font-medium ${activeTab === tab.id
                      ? "border-emerald-600 text-emerald-600"
                      : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === "feed" && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">Be the first to start a discussion in this community</p>
              {isMember && (
                <button className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold">
                  Create Post
                </button>
              )}
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About this community</h3>
                <p className="text-gray-700 leading-relaxed">{currentCommunity.description}</p>
              </div>

              {currentCommunity.rules && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Community Rules</h3>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <p className="text-gray-700 whitespace-pre-line">{currentCommunity.rules}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Category</p>
                  <p className="font-semibold text-gray-900">{currentCommunity.category}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Type</p>
                  <p className="font-semibold text-gray-900">{currentCommunity.community_type}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Join Approval</p>
                  <p className="font-semibold text-gray-900">
                    {currentCommunity.join_approval_required ? "Required" : "Not Required"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Created</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(currentCommunity.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "members" && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Members ({currentCommunity.member_count})
              </h3>
              <div className="text-center py-12 text-gray-600">
                Member list coming soon
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
