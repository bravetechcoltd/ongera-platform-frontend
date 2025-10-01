"use client"

import { 
  Upload, 
  Calendar,
  Eye,
  MessageSquare,
  Clock
} from "lucide-react"
import { RecentActivity } from "@/lib/features/auth/dashboardSlices"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ActivityFeedProps {
  recentActivity?: RecentActivity
}

export default function ActivityFeed({ recentActivity }: ActivityFeedProps) {
  if (!recentActivity) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Recent Activity</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex items-start space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const allActivities: Array<{
    type: 'project' | 'post' | 'event'
    data: any
    timestamp: Date
  }> = [
    ...recentActivity.projects.map(p => ({
      type: 'project' as const,
      data: p,
      timestamp: new Date(p.created_at)
    })),
    ...recentActivity.posts.map(p => ({
      type: 'post' as const,
      data: p,
      timestamp: new Date(p.created_at)
    })),
    ...recentActivity.events.map(e => ({
      type: 'event' as const,
      data: e,
      timestamp: new Date(e.created_at)
    }))
  ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  const getActivityIcon = (type: string) => {
    const iconConfig = {
      project: { icon: Upload, color: 'bg-emerald-500' },
      post: { icon: MessageSquare, color: 'bg-blue-500' },
      event: { icon: Calendar, color: 'bg-purple-500' }
    }

    const config = iconConfig[type as keyof typeof iconConfig]
    const Icon = config.icon
    return (
      <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    )
  }

  const getActivityContent = (activity: typeof allActivities[0]) => {
    switch (activity.type) {
      case 'project':
        return {
          title: 'Uploaded new research project',
          subtitle: activity.data.title,
          link: `/dashboard/user/research/${activity.data.id}`
        }
      case 'post':
        return {
          title: 'Posted in community',
          subtitle: `${activity.data.community.name}`,
          link: `/dashboard/user/communities/${activity.data.community.id}`
        }
      case 'event':
        return {
          title: 'Created new event',
          subtitle: activity.data.title,
          link: `/dashboard/user/events/${activity.data.id}`
        }
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    try {
      return formatDistanceToNow(timestamp, { addSuffix: true })
    } catch {
      return 'Just now'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          Today's Activity
        </h2>
        <span className="text-[10px] font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {allActivities.length} {allActivities.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className="space-y-2">
        {allActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1 text-sm">No activity today</p>
            <p className="text-xs text-gray-400">Your recent actions will appear here</p>
          </div>
        ) : (
          allActivities.map((activity, index) => {
            const content = getActivityContent(activity)
            
            return (
              <Link
                key={`${activity.type}-${activity.data.id}-${index}`}
                href={content.link}
                className="flex items-start space-x-2 p-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group"
              >
                {getActivityIcon(activity.type)}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {content.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {content.subtitle}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </Link>
            )
          })
        )}
      </div>

      {allActivities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            href="/dashboard/user/activity"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-2 transition-colors"
          >
            View All Activity
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}