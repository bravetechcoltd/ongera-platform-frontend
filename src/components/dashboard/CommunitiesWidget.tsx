"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Users, UserPlus, ArrowRight } from "lucide-react"
import { CommunityStats } from "@/lib/features/auth/dashboardSlices"

interface Community {
  id: number
  name: string
  description: string
  member_count: number
  is_member: boolean
  icon_url?: string
  status: 'active' | 'inactive'
}

interface CommunitiesWidgetProps {
  communities: CommunityStats | undefined
}

export default function CommunitiesWidget({ communities }: CommunitiesWidgetProps) {
  const router = useRouter()
  const [communityList, setCommunityList] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch actual communities from API
    const fetchCommunities = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/communities?limit=4&user_communities=true')
        const data = await response.json()
        
        if (data.success && data.data) {
          setCommunityList(data.data.communities || [])
        }
      } catch (error) {
        console.error('Failed to fetch communities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (communities && communities.total > 0) {
      fetchCommunities()
    } else {
      setIsLoading(false)
    }
  }, [communities])

  const handleViewCommunity = (communityId: number) => {
    router.push(`/dashboard/user/communities/${communityId}`)
  }

  const handleViewAll = () => {
    router.push('/dashboard/user/communities')
  }

  const handleJoinCommunity = () => {
    router.push('/dashboard/user/communities/explore')
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-500" />
          My Communities
        </h2>
        {communities && communities.total > 0 && (
          <button
            onClick={handleViewAll}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            View All
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-center justify-between p-2 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                <div className="space-y-1">
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-2 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !communities || communities.total === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">No communities yet</p>
          <p className="text-xs text-gray-400 mb-3">Join communities to connect with others</p>
          <button
            onClick={handleJoinCommunity}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-all flex items-center gap-1 mx-auto"
          >
            <UserPlus className="w-4 h-4" />
            Explore Communities
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {communityList.slice(0, 4).map((community) => (
              <div
                key={community.id}
                onClick={() => handleViewCommunity(community.id)}
                className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {/* Community Icon */}
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    {community.icon_url ? (
                      <img 
                        src={community.icon_url} 
                        alt={community.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <Users className="w-3 h-3 text-white" />
                    )}
                  </div>

                  {/* Community Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {community.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {community.member_count} members
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  community.status === 'active' ? 'bg-green-400' : 'bg-gray-300'
                }`}></div>
              </div>
            ))}
          </div>

          {/* View All Button */}
          {communities.total > 4 && (
            <div className="mt-4 pt-3 border-t border-gray-100">
              <button
                onClick={handleViewAll}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 transition-colors w-full"
              >
                View All {communities.total} Communities
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Join More Communities */}
          <div className="mt-3">
            <button
              onClick={handleJoinCommunity}
              className="w-full px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1"
            >
              <UserPlus className="w-3 h-3" />
              Explore More Communities
            </button>
          </div>
        </>
      )}
    </div>
  )
}