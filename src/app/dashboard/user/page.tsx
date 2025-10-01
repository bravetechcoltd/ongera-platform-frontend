"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { fetchDashboardSummary } from "@/lib/features/auth/dashboardSlices"
import { fetchUserProfile } from "@/lib/features/auth/profileSlice"
import DashboardStats from "@/components/dashboard/DashboardStats"
import QuickActions from "@/components/dashboard/QuickActions"
import ActivityFeed from "@/components/dashboard/ActivityFeed"
import ProfileCompletionBanner from "@/components/dashboard/ProfileCompletionBanner"
import OnboardingModal from "@/components/dashboard/OnboardingModal"
import { checkProfileCompletion } from "@/lib/utils/profileUtils"

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user: authUser } = useAppSelector((state) => state.auth)
  const { profile: userProfile, isLoading: profileLoading } = useAppSelector((state) => state.profile)
  const { summary, isLoading: summaryLoading } = useAppSelector((state) => state.dashboard)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (authUser) {
      dispatch(fetchUserProfile())
      dispatch(fetchDashboardSummary())
    }
  }, [authUser, dispatch])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('onboarding') === 'true' && userProfile) {
      const profileStatus = checkProfileCompletion(userProfile)
      if (profileStatus.completed) {
        setShowOnboarding(true)
      }
    }
  }, [userProfile])

  const user = userProfile || authUser

  if (!user || profileLoading || summaryLoading) {
    return (
      <div className="space-y-3">
        <div className="animate-pulse">
          <div className="bg-gray-300 rounded-xl p-3 h-16 mb-3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mb-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl p-3 h-20"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <div className="bg-gray-200 rounded-xl p-3 h-40"></div>
            <div className="bg-gray-200 rounded-xl p-3 h-40"></div>
          </div>
        </div>
      </div>
    )
  }

  const profileStatus = checkProfileCompletion(user)

  return (
    <div className="space-y-3 max-w-[1400px] mx-auto">
      {/* Profile Completion Banner - Compact */}
      {!profileStatus.completed && (
        <ProfileCompletionBanner 
          percentage={profileStatus.percentage}
          missing={profileStatus.missing}
        />
      )}

      {/* Welcome Section - Compact with gradient */}
      <div className="bg-gradient-to-r from-[#0158B7] to-[#5E96D2] border border-[#0158B7] rounded-xl p-3 text-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {user.profile_picture_url ? (
              <img src={user.profile_picture_url} alt={user.first_name} className="w-8 h-8 rounded-full border border-white" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white text-[#0158B7] flex items-center justify-center font-bold text-sm">
                {user.first_name?.[0]}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold">Welcome back, {user.first_name}!</h1>
              <p className="text-xs text-blue-100">{user.account_type} • {user.profile?.institution_name || 'Complete your profile'}</p>
            </div>
          </div>
   
          <div className="flex items-center gap-2 overflow-hidden relative w-full max-w-md">     
            <div className="animate-slide-smooth">
              <h1 className="text-[20px] font-bold whitespace-nowrap bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-shimmer">
                The best way to learn is to teach others
              </h1>
            </div>
          </div>

          <div className="hidden md:flex gap-1.5">
            <div className="bg-[#034EA2] px-2.5 py-1 rounded-lg text-center">
              <p className="text-base font-bold">{summary?.projects.total || 0}</p>
              <p className="text-[10px] text-blue-200">Projects</p>
            </div>
            <div className="bg-[#034EA2] px-2.5 py-1 rounded-lg text-center">
              <p className="text-base font-bold">{summary?.communities.total || 0}</p>
              <p className="text-[10px] text-blue-200">Communities</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Stats - Compact */}
      <DashboardStats accountType={user.account_type} summary={summary} />

      {/* Quick Actions - Compact */}
      <QuickActions accountType={user.account_type} />

      {/* Activity Feed - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ActivityFeed recentActivity={summary?.recentActivity} compact={true} />
        {/* You can add another component in the second column if needed */}
      </div>

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal 
          onClose={() => setShowOnboarding(false)}
          accountType={user.account_type}
        />
      )}

                <style jsx>{`
            @keyframes slide-smooth {
              0%, 100% {
                transform: translateX(0);
              }
              25% {
                transform: translateX(20px);
              }
              75% {
                transform: translateX(-20px);
              }
            }
            @keyframes shimmer {
              0%, 100% {
                background-position: 0% 50%;
              }
              50% {
                background-position: 100% 50%;
              }
            }
            .animate-slide-smooth {
              animation: slide-smooth 4s ease-in-out infinite;
            }
            .animate-shimmer {
              background-size: 200% auto;
              animation: shimmer 3s ease-in-out infinite;
            }
          `}</style>
    </div>
  )
}