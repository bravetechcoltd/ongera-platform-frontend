
"use client"

import { useState } from "react"
import { useAppSelector } from "@/lib/hooks"
import { Bell, Search, User, Settings } from "lucide-react"

export default function DashboardHeader() {
  const { user } = useAppSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects, communities, researchers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4 ml-6">
          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-emerald-600 transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {user?.account_type?.toLowerCase()}
              </p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}