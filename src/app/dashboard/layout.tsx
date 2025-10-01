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
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
      return
    }

    if (isAuthenticated && user) {
      const currentPath = window.location.pathname

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

  // Reset redirecting state after a short delay
  useEffect(() => {
    if (isRedirecting) {
      const timer = setTimeout(() => {
        setIsRedirecting(false)
      }, 2000) // Reset after 2 seconds to prevent stuck loading
      return () => clearTimeout(timer)
    }
  }, [isRedirecting])




  return <>{children}</>
}