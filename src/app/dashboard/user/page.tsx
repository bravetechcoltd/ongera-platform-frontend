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
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const { user: authUser, isAuthenticated } = useAppSelector((state) => state.auth)
  const { profile: userProfile, isLoading: profileLoading } = useAppSelector((state) => state.profile)
  const { summary, isLoading: summaryLoading } = useAppSelector((state) => state.dashboard)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // ==================== FETCH DATA ====================
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated || !authUser) {
        return
      }

      try {
        await Promise.all([
          dispatch(fetchUserProfile()),
          dispatch(fetchDashboardSummary())
        ])
        
        setDataLoaded(true)
      } catch (error) {
        console.error('❌ Failed to fetch dashboard data:', error)
      }
    }

    fetchData()
  }, [authUser, isAuthenticated, dispatch])

  // ==================== HANDLE ONBOARDING ====================
  useEffect(() => {
    if (!dataLoaded || !userProfile) {
      return
    }

    const params = new URLSearchParams(window.location.search)
    if (params.get('onboarding') === 'true') {
      const profileStatus = checkProfileCompletion(userProfile)
      if (profileStatus.completed) {
        setShowOnboarding(true)
      }
    }
  }, [dataLoaded, userProfile])

  // ==================== GET CURRENT USER ====================
  const user = userProfile || authUser

  // ==================== LOADING STATE ====================
  if (!user || profileLoading || summaryLoading || !dataLoaded) {
    return (
      <div className="space-y-3 pb-3">
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

  // ==================== RENDER DASHBOARD ====================
  return (
    <div className="space-y-3 max-w-[1400px] mx-auto pb-3">
      {/* Profile Completion Banner */}
      {!profileStatus.completed && (
        <ProfileCompletionBanner 
          percentage={profileStatus.percentage}
          missing={profileStatus.missing}
        />
      )}

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#0158B7] to-[#5E96D2] border border-[#0158B7] rounded-xl p-3 text-white shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          {/* Left: User Info */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {user.profile_picture_url ? (
              <img 
                src={user.profile_picture_url} 
                alt={user.first_name} 
                className="w-8 h-8 rounded-full border border-white" 
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white text-[#0158B7] flex items-center justify-center font-bold text-sm">
                {user.first_name?.[0]}
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold">Welcome back, {user.first_name}!</h1>
              <p className="text-xs text-blue-100">
                {user.account_type} • {user.profile?.institution_name || 'Complete your profile'}
              </p>
            </div>
          </div>
   
          {/* Center: Animated Quote */}
          <div className="flex items-center gap-2 overflow-hidden relative flex-1 min-w-0 max-w-md mx-auto md:mx-0">     
            <div className="animate-slide-smooth w-full">
              <h1 className="text-base md:text-[20px] font-bold whitespace-nowrap bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-shimmer text-center md:text-left">
                The best way to learn is to teach others
              </h1>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="flex gap-1.5 flex-shrink-0">
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

      {/* Dashboard Stats */}
      <DashboardStats accountType={user.account_type} summary={summary} />

      {/* Quick Actions */}
      <QuickActions accountType={user.account_type} />

      {/* Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ActivityFeed recentActivity={summary?.recentActivity} compact={true} />
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