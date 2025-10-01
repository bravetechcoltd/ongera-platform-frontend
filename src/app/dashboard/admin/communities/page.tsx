// @ts-nocheck
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import AdminCommunityManagePage from "@/components/admin/AdminCommunityManagePage"
import { Loader2 } from "lucide-react"

export default function AdminCommunitiesPage() {
  const router = useRouter()
  const { user, isLoading } = useAppSelector(state => state.auth)

  useEffect(() => {
    // Check if user is admin
    if (!isLoading && (!user || user.account_type !== 'admin')) {
      router.push('/dashboard')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      </div>
    )
  }

  if (!user || user.account_type !== 'admin') {
    return null
  }

  return <AdminCommunityManagePage />
}