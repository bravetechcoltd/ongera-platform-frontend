// @ts-nocheck

"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { joinCommunity } from "@/lib/features/auth/communitiesSlice"
import { Community } from "@/lib/features/auth/communitiesSlice"
import {
  Users, Globe, Lock, Building2, CheckCircle,
  Clock, ArrowRight, Loader2, DoorOpen, AlertTriangle, ZoomIn, X
} from "lucide-react"
import Link from "next/link"
import { toast } from "react-hot-toast"

interface CommunityCardProps {
  community: Community
}

// Image Preview Modal Component
function ImagePreviewModal({ imageUrl, title, onClose }) {
  if (!imageUrl) return null

  return (
    <div 
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <div className="relative max-w-6xl w-full">
        <img
          src={imageUrl}
          alt={title}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl mx-auto"
          onClick={(e) => e.stopPropagation()}
        />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium max-w-[90%] truncate">
          {title}
        </div>
      </div>
    </div>
  )
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
  const [previewImage, setPreviewImage] = useState(null)

  const TypeIcon = community.community_type === "Public" ? Globe :
                   community.community_type === "Private" ? Lock : Building2

  const categoryGradient = CATEGORY_COLORS[community.category] || "from-gray-500 to-gray-600"

  // Check if authenticated user has a pending join request
  const isUserInPendingRequests = useMemo(() => {
    if (!authUser || !community.pending_join_requests) return false
    return community.pending_join_requests.some(
      request => request.user.id === authUser.id && request.status === "Pending"
    )
  }, [authUser, community.pending_join_requests])

  const isUserMember = authUser && (
    community.creator.id === authUser.id || 
    (community.members && community.members.some(member => member.id === authUser.id)) ||
    myCommunities.some(myCommunity => myCommunity.id === community.id) ||
    joined
  )

  // Determine if card should be navigable
  const isCardNavigable = community.is_active && 
                         !isUserInPendingRequests && 
                         (isUserMember || joined)

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

    // Prevent joining if user already has pending request
    if (isUserInPendingRequests) {
      toast.error("You already have a pending request for this community")
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
    // Only allow navigation if user is member or has joined
    if (!isCardNavigable) {
      e.preventDefault()
      return
    }
  }

  const handleImageClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (community.cover_image_url) {
      setPreviewImage({ url: community.cover_image_url, title: community.name })
    }
  }

  return (
    <>
      <Link 
        href={isCardNavigable ? `/dashboard/user/communities/dashboard/${community.id}` : '#'}
        onClick={handleCardClick}
        className="block h-full"
      >
        <div className={`group bg-white rounded-xl border overflow-hidden transition-all duration-300 h-full flex flex-col ${
          isCardNavigable
            ? 'border-gray-200 hover:border-[#5E96D2] hover:shadow-md cursor-pointer' 
            : 'border-gray-200 cursor-default'
        } ${!community.is_active ? 'border-orange-300 bg-orange-50/30 cursor-not-allowed opacity-90' : ''}`}>
          
          {!community.is_active && (
            <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-orange-500/90 to-orange-600/90 px-3 py-1.5">
              <div className="flex items-center justify-center space-x-1 text-white">
                <AlertTriangle className="w-3 h-3" />
                <span className="text-xs font-bold">Community Deactivated</span>
              </div>
            </div>
          )}

          {/* Header Section - Enhanced with Full Display */}
          <div className={`relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 ${
            !community.is_active ? 'mt-8' : ''
          }`}>
            {community.cover_image_url ? (
              <>
                <img
                  src={community.cover_image_url}
                  alt={community.name}
                  className={`w-full h-full object-cover transition-transform duration-500 ${
                    isCardNavigable ? 'group-hover:scale-110' : ''
                  } ${!community.is_active ? 'grayscale' : ''}`}
                />
                {/* Zoom Icon Overlay - Only show if community is active and has image */}
                {community.is_active && (
                  <div 
                    className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center cursor-pointer"
                    onClick={handleImageClick}
                  >
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm rounded-full p-3 transform group-hover:scale-110">
                      <ZoomIn className="w-6 h-6 text-[#0158B7]" />
                    </div>
                  </div>
                )}
              </>
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

          {/* Content Section - Flexible but Consistent */}
          <div className="flex-1 flex flex-col p-3">
            {/* Title and Description Section */}
            <div className="flex-1">
              <h3 className={`text-sm font-bold mb-1 transition-colors line-clamp-1 ${
                isCardNavigable
                  ? 'text-gray-900 group-hover:text-[#0158B7]' 
                  : 'text-gray-600'
              }`}>
                {community.name}
              </h3>

              <p className={`text-xs mb-3 line-clamp-2 leading-relaxed min-h-[2.5rem] ${
                community.is_active ? 'text-gray-600' : 'text-gray-500'
              }`}>
                {community.description}
              </p>
            </div>

            {/* Stats Section */}
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 flex-shrink-0">
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
            </div>

            {/* Footer Section - Fixed Height */}
            <div className="flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <div className="w-6 h-6 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {community.creator.first_name[0]}{community.creator.last_name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-900 truncate">
                    {community.creator.first_name} {community.creator.last_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">Creator</p>
                </div>
              </div>

              <div className="flex-shrink-0 ml-2">
                {!community.is_active ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold whitespace-nowrap">
                    <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                    <span>Deactivated</span>
                  </div>
                ) : isUserInPendingRequests ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold whitespace-nowrap">
                    <Clock className="w-3 h-3 animate-pulse flex-shrink-0" />
                    <span>Await Approval</span>
                  </div>
                ) : isUserMember || joined ? (
                  <button
                    onClick={handleVisitCommunity}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0158B7] text-white rounded-lg font-semibold text-xs hover:bg-[#0362C3] hover:shadow-md transition-all whitespace-nowrap"
                  >
                    <DoorOpen className="w-3 h-3 flex-shrink-0" />
                    <span>Visit</span>
                  </button>
                ) : pendingApproval ? (
                  <div className="flex items-center space-x-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold whitespace-nowrap">
                    <Clock className="w-3 h-3 animate-pulse flex-shrink-0" />
                    <span>Pending</span>
                  </div>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={isJoining}
                    className="flex items-center space-x-1 px-2 py-1 bg-[#0158B7] text-white rounded-lg font-semibold text-xs hover:bg-[#0362C3] hover:shadow-md transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isJoining ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" />
                        <span>Joining...</span>
                      </>
                    ) : (
                      <>
                        <span>Request To Join</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Image Preview Modal */}
      {previewImage && (
        <ImagePreviewModal
          imageUrl={previewImage.url}
          title={previewImage.title}
          onClose={() => setPreviewImage(null)}
        />
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </>
  )
}