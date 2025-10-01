"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { Loader2 } from "lucide-react"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated && user) {
      const currentPath = window.location.pathname

      // Only redirect if on root /dashboard
      if (currentPath === "/dashboard") {
        setIsRedirecting(true)
        
        switch (user.account_type) {
          case "admin":
            router.replace("/dashboard/admin")
            break
          case "Student":
          case "Researcher": 
          case "Diaspora":
          case "Institution":
            router.replace("/dashboard/user")
            break
          default:
            router.push("/login")
            break
        }
      }
    }
  }, [isAuthenticated, isLoading, user, router])

  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isRedirecting])

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-50">
  //       <div className="text-center">
  //         <Loader2 className="w-8 h-8 animate-spin text-[#0158B7] mx-auto mb-3" />
  //         <p className="text-sm text-gray-600">Loading...</p>
  //       </div>
  //     </div>
  //   )
  // }

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0158B7] mx-auto mb-3" />
          <p className="text-sm text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}