"use client"

import { useEffect, useState } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { 
  fetchAllActivities, 
  fetchMoreActivities, 
  clearActivities,
  setActivitiesFilter 
} from "@/lib/features/auth/dashboardSlices"
import { 
  Clock, 
  Filter, 
  Search, 
  Loader2, 
  ArrowLeft,
  Calendar,
  MessageSquare,
  Upload,
  Heart,
  Users,
  Award,
  Zap,
  RefreshCw,
  TrendingUp,
  Eye,
  BarChart3
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

const ACTIVITY_TYPES = [
  { value: 'all', label: 'All Activities', icon: Zap, color: 'text-gray-600' },
  { value: 'project', label: 'Projects', icon: Upload, color: 'text-emerald-600' },
  { value: 'post', label: 'Posts', icon: MessageSquare, color: 'text-blue-600' },
  { value: 'event', label: 'Events', icon: Calendar, color: 'text-purple-600' },
  { value: 'comment', label: 'Comments', icon: MessageSquare, color: 'text-amber-600' },
  { value: 'like', label: 'Likes', icon: Heart, color: 'text-rose-600' },
  { value: 'follow', label: 'Follows', icon: Users, color: 'text-indigo-600' },
  { value: 'achievement', label: 'Achievements', icon: Award, color: 'text-yellow-600' }
]

export default function ActivityPage() {
  const dispatch = useAppDispatch()
  const { activities, isActivitiesLoading, activitiesPagination } = useAppSelector(state => state.dashboard)
  
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    dispatch(fetchAllActivities({ 
      page: 1, 
      limit: 20,
      type: selectedType === 'all' ? undefined : selectedType
    }))

    return () => {
      dispatch(clearActivities())
    }
  }, [dispatch, selectedType])

  const handleLoadMore = () => {
    if (activitiesPagination.hasMore && !isActivitiesLoading) {
      dispatch(fetchMoreActivities({ 
        page: activitiesPagination.page + 1,
        limit: 20,
        type: selectedType === 'all' ? undefined : selectedType
      }))
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await dispatch(fetchAllActivities({ 
      page: 1, 
      limit: 20,
      type: selectedType === 'all' ? undefined : selectedType
    }))
    setIsRefreshing(false)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    dispatch(setActivitiesFilter(type))
  }

  const filteredActivities = activities.filter(activity => 
    activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    activity.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getActivityIcon = (type: string) => {
    const config = ACTIVITY_TYPES.find(t => t.value === type) || ACTIVITY_TYPES[0]
    const Icon = config.icon
    return <Icon className={`w-5 h-5 ${config.color}`} />
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true })
    } catch {
      return 'Just now'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 overflow-hidden">
      {/* Fixed Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard/user"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium">Back</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-6 h-6 text-[#0158B7]" />
                All Activities
              </h1>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT SIDEBAR - Fixed with Internal Scroll */}
            <div className="hidden lg:block lg:col-span-3 h-full overflow-hidden">
              <div
                className="h-full overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >
                <div className="space-y-4">
                  {/* Search Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Search className="w-4 h-4 text-gray-400" />
                      Search Activities
                    </h3>
                    <input
                      type="text"
                      placeholder="Search activities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Filter Card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Filter className="w-4 h-4 text-gray-400" />
                      Filter by Type
                    </h3>
                    <div className="space-y-1">
                      {ACTIVITY_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleTypeChange(type.value)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            selectedType === type.value
                              ? 'bg-[#0158B7]/10 text-[#0158B7] border border-[#0158B7]/20 shadow-sm'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <type.icon className={`w-4 h-4 ${type.color}`} />
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Stats Card */}
                  <div className="bg-gradient-to-br from-[#0158B7]/5 to-[#5E96D2]/5 border border-[#0158B7]/20 rounded-2xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-[#0158B7]" />
                      Activity Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-sm text-gray-600">Total Activities</span>
                        <span className="text-lg font-bold text-[#0158B7]">{activitiesPagination.total}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-sm text-gray-600">Current Filter</span>
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {selectedType === 'all' ? 'All' : selectedType}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                        <span className="text-sm text-gray-600">Showing</span>
                        <span className="text-sm font-medium text-gray-900">
                          {filteredActivities.length} / {activitiesPagination.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MAIN CONTENT - Fixed with Internal Scroll */}
            <div className="lg:col-span-6 h-full overflow-hidden flex flex-col">
              {/* Activity List Header */}
              <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recent Activities
                    {selectedType !== 'all' && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        • {ACTIVITY_TYPES.find(t => t.value === selectedType)?.label}
                      </span>
                    )}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Sorted by latest</span>
                  </div>
                </div>
              </div>

              {/* Scrollable Activity Feed */}
              <div
                className="flex-1 min-h-0 overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="divide-y divide-gray-100">
                    {isActivitiesLoading && activities.length === 0 ? (
                      <div className="p-8 space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="animate-pulse flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredActivities.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Zap className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No activities found</h3>
                        <p className="text-gray-500 mb-4">
                          {searchQuery 
                            ? 'No activities match your search criteria'
                            : `No ${selectedType !== 'all' ? selectedType : ''} activities found`
                          }
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="text-[#0158B7] hover:text-[#0158B7]/80 font-medium"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {filteredActivities.map((activity, index) => (
                          <div
                            key={`${activity.id}-${index}`}
                            className="p-4 hover:bg-gray-50 transition-colors group"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:scale-105 transition-transform">
                                  {getActivityIcon(activity.type)}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-medium text-gray-900 group-hover:text-[#0158B7] transition-colors">
                                      {activity.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-0.5">
                                      {activity.description}
                                    </p>
                                    {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                                      <div className="flex items-center gap-4 mt-2">
                                        {activity.metadata.likesCount !== undefined && (
                                          <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Heart className="w-3 h-3" />
                                            {activity.metadata.likesCount}
                                          </span>
                                        )}
                                        {activity.metadata.commentsCount !== undefined && (
                                          <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <MessageSquare className="w-3 h-3" />
                                            {activity.metadata.commentsCount}
                                          </span>
                                        )}
                                        {activity.metadata.viewsCount !== undefined && (
                                          <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Eye className="w-3 h-3" />
                                            {activity.metadata.viewsCount}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between mt-2">
                                  <div className="flex items-center gap-2">
                                    {activity.user && (
                                      <>
                                        <img
                                          src={activity.user.avatar}
                                          alt={activity.user.name}
                                          className="w-5 h-5 rounded-full"
                                        />
                                        <span className="text-xs text-gray-500">{activity.user.name}</span>
                                        <span className="text-gray-300">•</span>
                                      </>
                                    )}
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {formatTimestamp(activity.timestamp)}
                                    </span>
                                  </div>
                                  
                                  {activity.link && (
                                    <Link
                                      href={activity.link}
                                      className="text-xs font-medium text-[#0158B7] hover:text-[#0158B7]/80 transition-colors"
                                    >
                                      View Details →
                                    </Link>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}

                        {activitiesPagination.hasMore && (
                          <div className="p-4 border-t border-gray-100">
                            <button
                              onClick={handleLoadMore}
                              disabled={isActivitiesLoading}
                              className="w-full py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium text-gray-700"
                            >
                              {isActivitiesLoading ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Loading more...
                                </>
                              ) : (
                                <>
                                  <Zap className="w-4 h-4" />
                                  Load More ({activitiesPagination.total - filteredActivities.length} remaining)
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDEBAR - Fixed with Internal Scroll */}
            <div className="hidden lg:block lg:col-span-3 h-full overflow-hidden">
              <div
                className="h-full overflow-y-auto pr-2 space-y-4"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >
                {/* Quick Stats Cards */}
                {filteredActivities.length > 0 && (
                  <>
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <TrendingUp className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="text-3xl font-bold text-emerald-600 mb-1">
                        {activitiesPagination.total}
                      </div>
                      <div className="text-sm text-gray-600">Total Activities</div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Filter className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {new Set(activities.map(a => a.type)).size}
                      </div>
                      <div className="text-sm text-gray-600">Activity Types</div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="text-3xl font-bold text-purple-600 mb-1">
                        {new Set(activities.filter(a => a.user).map(a => a.user?.id)).size}
                      </div>
                      <div className="text-sm text-gray-600">Active Users</div>
                    </div>
                  </>
                )}

                {/* Activity Breakdown */}
                <div className="bg-gradient-to-br from-[#0158B7]/5 to-[#5E96D2]/5 border border-[#0158B7]/20 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-[#0158B7]" />
                    Activity Breakdown
                  </h3>
                  <div className="space-y-2">
                    {ACTIVITY_TYPES.filter(t => t.value !== 'all').map(type => {
                      const count = activities.filter(a => a.type === type.value).length
                      const percentage = activitiesPagination.total > 0 
                        ? Math.round((count / activitiesPagination.total) * 100) 
                        : 0
                      return (
                        <div key={type.value} className="bg-white rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                              <type.icon className={`w-4 h-4 ${type.color}`} />
                              {type.label}
                            </span>
                            <span className="text-sm font-bold text-gray-900">{count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-[#0158B7] h-1.5 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }

        * {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  )
}