// @ts-nocheck

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchCommunityById, joinCommunity, leaveCommunity } from "@/lib/features/auth/communitiesSlice"
import {
  ArrowLeft, Users, MessageSquare, Globe, Lock, Building,
  Share2, CheckCircle, X, Loader2, Calendar, AlertCircle, ZoomIn
} from "lucide-react"
import Link from "next/link"
import SharedNavigation from "@/components/layout/Navigation"
import { RootState } from "@/lib/store"

function SkeletonLoader({ className = "" }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200/60 rounded-xl ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.7) 50%, transparent 100%)",
          animation: "shimmer 1.6s infinite",
          backgroundSize: "200% 100%",
        }}
      />
      <style>{`@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
    </div>
  )
}

function ImagePreviewModal({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", handleKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", handleKey)
      document.body.style.overflow = ""
    }
  }, [onClose])
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <button onClick={onClose} className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
        <X className="w-5 h-5" />
      </button>
      <img
        src={src} alt={alt}
        className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
        style={{ animation: "zoomIn 0.2s ease" }}
        onClick={(e) => e.stopPropagation()}
      />
      <style>{`@keyframes zoomIn{from{opacity:0;transform:scale(0.92)}to{opacity:1;transform:scale(1)}}`}</style>
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
  const [showImagePreview, setShowImagePreview] = useState(false)

  useEffect(() => {
    if (params.id) dispatch(fetchCommunityById(params.id))
  }, [dispatch, params.id])

  useEffect(() => {
    if (currentCommunity && user) {
      setIsMember(!!currentCommunity.members?.some((m: any) => m.user_id === user.id))
    }
  }, [currentCommunity, user])

  const handleJoin = async () => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (currentCommunity?.id) {
      if (currentCommunity.join_approval_required) {
        setShowJoinModal(true)
      } else {
        await dispatch(joinCommunity({ id: currentCommunity.id }))
        setIsMember(true)
      }
    }
  }

  const handleJoinWithMessage = async () => {
    if (currentCommunity?.id) {
      await dispatch(joinCommunity({ id: currentCommunity.id, message: joinMessage || undefined }))
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
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  const getTypeConfig = (type: string) => {
    const configs: Record<string, { icon: any; color: string; bg: string }> = {
      Public: { icon: Globe, color: "text-emerald-700", bg: "bg-emerald-100" },
      Private: { icon: Lock, color: "text-orange-700", bg: "bg-orange-100" },
      "Institution-Specific": { icon: Building, color: "text-blue-700", bg: "bg-blue-100" },
    }
    return configs[type] || { icon: Users, color: "text-gray-700", bg: "bg-gray-100" }
  }

  if (isLoading && !currentCommunity) {
    return (
      <div className="min-h-screen bg-[#F4F6FA]">
        <SharedNavigation />
        <div className="max-w-5xl mx-auto px-4 pt-24 pb-12 space-y-6">
          <SkeletonLoader className="h-10 w-44" />
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 p-8 space-y-6">
            <SkeletonLoader className="h-96 rounded-xl" />
            <SkeletonLoader className="h-9 w-3/4" />
            <SkeletonLoader className="h-4 w-full" />
            <SkeletonLoader className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!currentCommunity) {
    return (
      <div className="min-h-screen bg-[#F4F6FA]">
        <SharedNavigation />
        <div className="flex items-center justify-center min-h-screen pt-16">
          <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community not found</h3>
            <p className="text-gray-500 text-sm mb-5">This community may have been removed or made private.</p>
            <Link href="/communities" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0158B7] text-white rounded-lg font-medium text-sm hover:bg-[#0149a0] transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Communities
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const community = currentCommunity
  const typeConfig = getTypeConfig(community.community_type)
  const TypeIcon = typeConfig.icon

  return (
    <div className="min-h-screen bg-[#F4F6FA]">
      <SharedNavigation />

      {showImagePreview && community.cover_image_url && (
        <ImagePreviewModal src={community.cover_image_url} alt={community.name} onClose={() => setShowImagePreview(false)} />
      )}

      <div className="max-w-5xl mx-auto px-4 pt-24 pb-12">
        {/* Back */}
        <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-gray-500 hover:text-[#0158B7] mb-6 transition-colors text-sm font-medium group">
          <span className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm group-hover:border-[#0158B7]/30 group-hover:bg-[#0158B7]/5 transition-all">
            <ArrowLeft className="w-4 h-4" />
          </span>
          Back to Communities
        </button>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          {/* Hero Image */}
          <div className="relative h-[420px] bg-gradient-to-br from-[#0158B7] to-[#1e3a8a] group">
            {community.cover_image_url ? (
              <>
                <img
                  src={community.cover_image_url}
                  alt={community.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <button
                  onClick={() => setShowImagePreview(true)}
                  className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg text-sm font-medium transition-all opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0"
                  style={{ transition: "all 0.2s ease" }}
                >
                  <ZoomIn className="w-4 h-4" />
                  Preview Image
                </button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <Users className="w-28 h-28 text-white/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Type badge */}
            <div className="absolute top-4 right-4 flex gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm shadow-sm ${typeConfig.color}`}>
                <TypeIcon className="w-3.5 h-3.5" />
                {community.community_type}
              </span>
            </div>

            {/* Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
              <div>
                {community.is_active && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-full text-xs font-bold mb-3 shadow-lg">
                    <CheckCircle className="w-3.5 h-3.5" /> Active Community
                  </span>
                )}
                <h1 className="text-white text-2xl md:text-3xl font-bold max-w-2xl leading-snug" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>
                  {community.name}
                </h1>
              </div>
              <div className="bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-xl flex items-center gap-2 flex-shrink-0">
                <Users className="w-4 h-4" />
                <span className="font-bold text-sm">{community.member_count || 0}</span>
                <span className="text-white/70 text-sm">members</span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-1 px-6 py-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            {[
              { icon: Users, label: "members", value: community.member_count || 0 },
              { icon: MessageSquare, label: "posts", value: community.post_count || 0 },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-white transition-colors cursor-default flex-shrink-0">
                <Icon className="w-4 h-4 text-[#0158B7]" />
                <span className="font-bold text-gray-900 text-sm">{value.toLocaleString()}</span>
                <span className="text-gray-500 text-sm">{label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-default flex-shrink-0">
              <Calendar className="w-4 h-4 text-[#0158B7]" />
              <span className="text-gray-500 text-sm">Created {formatDate(community.created_at)}</span>
            </div>
          </div>

          <div className="p-8">
            {/* Creator Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gradient-to-r from-[#0158B7]/5 to-blue-50/50 rounded-xl border border-[#0158B7]/10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-[#0158B7] to-[#1e40af] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                  {community.creator?.first_name?.[0]}{community.creator?.last_name?.[0]}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-base">{community.creator?.first_name} {community.creator?.last_name}</p>
                  <p className="text-sm text-[#0158B7] font-medium">Community Creator</p>
                  {community.creator?.account_type && (
                    <p className="text-xs text-gray-500 mt-0.5">{community.creator.account_type}</p>
                  )}
                </div>
              </div>
              {community.category && (
                <span className="inline-block px-4 py-2 bg-[#0158B7]/10 text-[#0158B7] rounded-xl text-sm font-semibold">
                  {community.category}
                </span>
              )}
            </div>

            {/* About */}
            <section className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                <h2 className="text-lg font-bold text-gray-900">About This Community</h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap bg-gray-50/60 rounded-xl p-5 border border-gray-100 text-sm">
                {community.description}
              </p>
            </section>

            {/* Rules */}
            {community.rules && (
              <div className="mb-8 p-5 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4" /> Community Rules
                </h3>
                <p className="text-sm text-blue-700 leading-relaxed whitespace-pre-wrap">{community.rules}</p>
              </div>
            )}

            {/* Join Approval Notice */}
            {community.join_approval_required && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Approval required to join</p>
                  <p className="text-sm text-amber-700 mt-0.5">Your request will be reviewed by the community administrators.</p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-100">
              {!isAuthenticated ? (
                <div className="bg-gradient-to-r from-[#0158B7]/5 to-blue-50 border border-[#0158B7]/15 rounded-2xl p-7 text-center">
                  <div className="w-14 h-14 bg-[#0158B7]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-7 h-7 text-[#0158B7]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1.5">Sign in to join</h3>
                  <p className="text-gray-500 mb-5 text-sm max-w-sm mx-auto">Connect with researchers and collaborate on exciting projects.</p>
                  <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                    Sign In to Join
                  </Link>
                </div>
              ) : (
                <div className="flex gap-3">
                  {!isMember && community.is_active && (
                    <button
                      onClick={handleJoin}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-xl font-semibold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Join Community</>}
                    </button>
                  )}
                  {isMember && (
                    <button
                      onClick={handleLeave}
                      disabled={isSubmitting}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-semibold text-sm hover:bg-red-100 transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" /> Leave Community
                    </button>
                  )}
                  {!community.is_active && (
                    <div className="flex-1 p-3 bg-gray-100 rounded-xl text-center">
                      <p className="text-gray-500 text-sm font-medium">Community is currently inactive</p>
                    </div>
                  )}
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Members Preview */}
            {community.members && community.members.length > 0 && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-[#0158B7] rounded-full" />
                    <h2 className="text-lg font-bold text-gray-900">Members</h2>
                  </div>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{community.member_count} total</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {community.members.slice(0, 6).map((member: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-[#0158B7]/20 hover:bg-blue-50/30 transition-all">
                      <div className="w-9 h-9 bg-gradient-to-br from-[#0158B7] to-[#1e40af] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {member.user?.first_name?.[0]}{member.user?.last_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{member.user?.first_name} {member.user?.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.role || 'Member'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {community.member_count > 6 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" style={{ backdropFilter: "blur(4px)" }}>
          <div className="bg-white rounded-2xl max-w-md w-full p-7 shadow-2xl">
            <h3 className="text-xl font-bold text-gray-900 mb-1">Join {community.name}</h3>
            <p className="text-sm text-gray-500 mb-5">This community requires approval. Add a message to your request:</p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Tell the community why you'd like to join (optional)..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0158B7]/30 focus:border-[#0158B7] resize-none mb-5 text-sm bg-gray-50"
              rows={4}
            />
            <div className="flex gap-3">
              <button onClick={() => setShowJoinModal(false)} className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button
                onClick={handleJoinWithMessage}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#0158B7] to-[#1e40af] text-white rounded-xl font-semibold text-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}