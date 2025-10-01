"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { fetchUserProfile } from "@/lib/features/auth/profileSlice"
import { useSessionMonitor } from '@/lib/hooks/useSessionMonitor'
import CompactNavbar from "@/components/dashboard/CompactNavbar"
import { AlertCircle, Loader2 } from "lucide-react"


export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading: authLoading, user: authUser } = useAppSelector((state) => state.auth)
  const { profile: userProfile, isLoading: profileLoading } = useAppSelector((state) => state.profile)

  // ✅ CRITICAL: Session monitoring ONLY here, not in root layout
  const { isMonitoring } = useSessionMonitor()

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      console.log('❌ [USER LAYOUT] Not authenticated - redirecting to login')
      router.push("/login")
      return
    }

    if (isAuthenticated && authUser && !userProfile && !profileLoading) {
      console.log('📥 [USER LAYOUT] Fetching user profile...')
      dispatch(fetchUserProfile())
    }
  }, [isAuthenticated, authLoading, authUser, userProfile, profileLoading, dispatch, router])

  useEffect(() => {
    if (isMonitoring) {
      console.log('✅ [USER LAYOUT] Session monitoring active')
      console.log('📍 [USER LAYOUT] Current path:', window.location.pathname)
    }
  }, [isMonitoring])

  if (!isAuthenticated) {
    return null
  }

  const user = userProfile || authUser

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">Unable to load user data. Please try again.</p>
          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload()
              }
            }}
            className="mt-3 bg-[#0158B7] text-white px-3 py-1.5 rounded-lg hover:bg-[#034EA2] text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <CompactNavbar />
      <main className="flex-1 overflow-y-auto p-3">
        {children}
      </main>
    </div>
  )
}