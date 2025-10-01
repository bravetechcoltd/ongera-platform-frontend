"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { joinCommunity } from "@/lib/features/auth/communitiesSlice"
import { Community } from "@/lib/features/auth/communitiesSlice"
import {
  Users, Globe, Lock, Building2, CheckCircle,
  Clock, ArrowRight, Loader2, DoorOpen, AlertTriangle
} from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

interface CommunityCardProps {
  community: Community
}

const CATEGORY_COLORS: Record<string, string> = {
  "Health Sciences": "from-red-500 to-pink-500",
  "Technology & Engineering": "from-[#0158B7] to-[#5E96D2]",
  "Agriculture": "from-green-500 to-emerald-500",
  "Natural Sciences": "from-purple-500 to-indigo-500",
  "Social Sciences": "from-orange-500 to-amber-500",
  "Business & Economics": "from-teal-500 to-cyan-500",
  "Education": "from-indigo-500 to-purple-500",
  "Arts & Humanities": "from-pink-500 to-rose-500"
}

export default function CommunityCard({ community }: CommunityCardProps) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user: authUser } = useAppSelector(state => state.auth)
  const { isSubmitting, myCommunities } = useAppSelector(state => state.communities)
  
  const [isJoining, setIsJoining] = useState(false)
  const [joined, setJoined] = useState(false)
  const [pendingApproval, setPendingApproval] = useState(false)

  const TypeIcon = community.community_type === "Public" ? Globe :
                   community.community_type === "Private" ? Lock : Building2

  const categoryGradient = CATEGORY_COLORS[community.category] || "from-gray-500 to-gray-600"

  const isUserMember = authUser && (
    community.creator.id === authUser.id || 
    (community.members && community.members.some(member => member.id === authUser.id)) ||
    myCommunities.some(myCommunity => myCommunity.id === community.id) ||
    joined
  )

  const handleJoin = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!authUser) {
      router.push("/login")
      return
    }

    if (!community.is_active) {
      return
    }

    setIsJoining(true)
    try {
      const result = await dispatch(joinCommunity({ 
        id: community.id,
        message: undefined 
      })).unwrap()
      
      if (result.requiresApproval) {
        setPendingApproval(true)
        toast.success("Join request submitted! Waiting for approval.")
      } else {
        setJoined(true)
        toast.success("Joined community successfully!")
        setTimeout(() => {
          router.push(`/dashboard/user/communities/dashboard/${community.id}`)
        }, 1000)
      }
    } catch (error: any) {
      toast.error(error || "Failed to join community")
    } finally {
      setIsJoining(false)
    }
  }

  const handleVisitCommunity = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!community.is_active) {
      return
    }
    
    router.push(`/dashboard/user/communities/dashboard/${community.id}`)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (!community.is_active) {
      e.preventDefault()
      return
    }
  }

  return (
    <Link 
      href={community.is_active ? `/dashboard/user/communities/dashboard/${community.id}` : '#'}
      onClick={handleCardClick}
    >
      <div className={`group bg-white rounded-xl border overflow-hidden transition-all duration-300 ${
        community.is_active 
          ? 'border-gray-200 hover:border-[#5E96D2] hover:shadow-md cursor-pointer' 
          : 'border-orange-300 bg-orange-50/30 cursor-not-allowed opacity-90'
      }`}>
        {!community.is_active && (
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-orange-500/90 to-orange-600/90 px-3 py-1.5">
            <div className="flex items-center justify-center space-x-1 text-white">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-bold">Community Deactivated</span>
            </div>
          </div>
        )}

        <div className={`relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden ${
          !community.is_active ? 'mt-8' : ''
        }`}>
          {community.cover_image_url ? (
            <img
              src={community.cover_image_url}
              alt={community.name}
              className={`w-full h-full object-cover transition-transform duration-500 ${
                community.is_active ? 'group-hover:scale-110' : 'grayscale'
              }`}
            />
          ) : (
            <div className={`w-full h-full bg-gradient-to-br ${categoryGradient} ${
              !community.is_active ? 'opacity-50' : 'opacity-80'
            }`} />
          )}
          
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-white/95 backdrop-blur-sm text-xs font-bold text-gray-900 rounded-lg shadow-sm">
              {community.category}
            </span>
          </div>

          <div className="absolute top-2 right-2">
            <div className="px-2 py-1 bg-white/95 backdrop-blur-sm rounded-lg shadow-sm flex items-center space-x-1">
              <TypeIcon className="w-3 h-3 text-gray-700" />
              <span className="text-xs font-semibold text-gray-900">
                {community.community_type}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3">
          <h3 className={`text-sm font-bold mb-1 transition-colors line-clamp-1 ${
            community.is_active 
              ? 'text-gray-900 group-hover:text-[#0158B7]' 
              : 'text-gray-600'
          }`}>
            {community.name}
          </h3>

          <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${
            community.is_active ? 'text-gray-600' : 'text-gray-500'
          }`}>
            {community.description}
          </p>

          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3 text-gray-500" />
                <span className="text-xs font-semibold text-gray-900">
                  {community.member_count}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                {community.post_count} posts
              </div>
            </div>

            {community.join_approval_required && community.is_active && (
              <div className="flex items-center space-x-1 text-xs text-amber-600">
                <Clock className="w-3 h-3" />
                <span className="font-medium">Approval Required</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white text-xs font-bold">
                {community.creator.first_name[0]}{community.creator.last_name[0]}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-900">
                  {community.creator.first_name} {community.creator.last_name}
                </p>
                <p className="text-xs text-gray-500">Creator</p>
              </div>
            </div>

            {!community.is_active ? (
              <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">
                <AlertTriangle className="w-3 h-3" />
                <span>Deactivated</span>
              </div>
            ) : isUserMember ? (
              <button
                onClick={handleVisitCommunity}
                className="flex items-center space-x-1 px-2 py-1 bg-[#0158B7] text-white rounded-lg font-semibold text-xs hover:bg-[#0362C3] hover:shadow-md transition-all"
              >
                <DoorOpen className="w-3 h-3" />
                <span>Visit</span>
              </button>
            ) : pendingApproval ? (
              <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">
                <Clock className="w-3 h-3 animate-pulse" />
                <span>Pending</span>
              </div>
            ) : (
              <button
                onClick={handleJoin}
                disabled={isJoining || joined}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg font-semibold text-xs transition-all ${
                  joined
                    ? "bg-green-100 text-green-700 cursor-default"
                    : "bg-[#0158B7] text-white hover:bg-[#0362C3] hover:shadow-md"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isJoining ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Joining...</span>
                  </>
                ) : joined ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    <span>Joined</span>
                  </>
                ) : (
                  <>
                    <span>Join</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}