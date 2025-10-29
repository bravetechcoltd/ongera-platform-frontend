"use client"

export const dynamic = "force-dynamic"

import { Loader2 } from "lucide-react"

export default function DashboardPage() {

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    </div>
  )
}
