"use client"

import { 
  Upload, 
  Calendar,
  Eye,
  MessageSquare,
  Clock,
  ArrowRight,
  Zap,
  Heart,
  Users,
  Award,
  FileText
} from "lucide-react"
import { RecentActivity, ActivityItem } from "@/lib/features/auth/dashboardSlices"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface ActivityFeedProps {
  recentActivity?: RecentActivity
  compact?: boolean
  limit?: number
}

export default function ActivityFeed({ recentActivity, compact = true, limit = 5 }: ActivityFeedProps) {
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
    type: 'project' | 'post' | 'event' | 'comment' | 'like' | 'follow' | 'achievement'
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
   .slice(0, compact ? limit : undefined)

  const getActivityIcon = (type: string) => {
    const iconConfig = {
      project: { icon: Upload, color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
      post: { icon: MessageSquare, color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-600' },
      event: { icon: Calendar, color: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-600' },
      comment: { icon: MessageSquare, color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-600' },
      like: { icon: Heart, color: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-600' },
      follow: { icon: Users, color: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
      achievement: { icon: Award, color: 'bg-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-600' }
    }

    const config = iconConfig[type as keyof typeof iconConfig] || iconConfig.post
    const Icon = config.icon
    
    if (compact) {
      return (
        <div className={`w-8 h-8 rounded-lg ${config.color} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      )
    }
    
    return (
      <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
        <Icon className={`w-5 h-5 ${config.text}`} />
      </div>
    )
  }

  const getActivityContent = (activity: typeof allActivities[0]) => {
    switch (activity.type) {
      case 'project':
        return {
          title: 'Uploaded new research project',
          subtitle: activity.data.title,
          description: `Published a new ${activity.data.research_type} in ${activity.data.field_of_study}`,
          link: `/dashboard/user/research/${activity.data.id}`,
          metadata: {
            views: activity.data.view_count,
            likes: activity.data.like_count,
            downloads: activity.data.download_count
          }
        }
      case 'post':
        return {
          title: 'Posted in community',
          subtitle: `${activity.data.community?.name || 'Community'}`,
          description: activity.data.content?.substring(0, 100) + '...',
          link: `/dashboard/user/communities/${activity.data.community?.id}`,
          metadata: {
            comments: activity.data.comment_count,
            likes: activity.data.like_count
          }
        }
      case 'event':
        return {
          title: 'Created new event',
          subtitle: activity.data.title,
          description: activity.data.description?.substring(0, 100) + '...',
          link: `/dashboard/user/events/${activity.data.id}`,
          metadata: {
            attendees: activity.data.attendee_count,
            date: activity.data.start_date
          }
        }
      case 'comment':
        return {
          title: 'Commented on project',
          subtitle: activity.data.project_title,
          description: activity.data.comment_text,
          link: `/dashboard/user/research/${activity.data.project_id}`,
          metadata: {
            likes: activity.data.like_count
          }
        }
      case 'like':
        return {
          title: 'Liked a project',
          subtitle: activity.data.project_title,
          description: 'Showed appreciation for this research work',
          link: `/dashboard/user/research/${activity.data.project_id}`,
          metadata: {}
        }
      default:
        return {
          title: 'New activity',
          subtitle: 'Recent action',
          description: 'Activity completed',
          link: '/dashboard/user/activity',
          metadata: {}
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

  const ActivityItem = ({ activity, index }: { activity: typeof allActivities[0]; index: number }) => {
    const content = getActivityContent(activity)
    
    return (
      <Link
        key={`${activity.type}-${activity.data.id}-${index}`}
        href={content.link}
        className={`flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-all border border-transparent hover:border-gray-200 group ${
          compact ? 'space-x-2' : 'space-x-3 p-4'
        }`}
      >
        {getActivityIcon(activity.type)}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-gray-900 group-hover:text-emerald-600 transition-colors ${
                compact ? 'text-sm' : 'text-base'
              }`}>
                {content.title}
              </p>
              <p className={`text-gray-600 mt-0.5 ${compact ? 'text-xs truncate' : 'text-sm'}`}>
                {content.subtitle}
              </p>
              {!compact && content.description && (
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {content.description}
                </p>
              )}
              {!compact && content.metadata && Object.keys(content.metadata).length > 0 && (
                <div className="flex items-center gap-3 mt-2">
                  {content.metadata.views && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Eye className="w-3 h-3" />
                      {content.metadata.views}
                    </span>
                  )}
                  {content.metadata.likes && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Heart className="w-3 h-3" />
                      {content.metadata.likes}
                    </span>
                  )}
                  {content.metadata.comments && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <MessageSquare className="w-3 h-3" />
                      {content.metadata.comments}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <p className={`text-gray-400 mt-1 flex items-center gap-1 ${
            compact ? 'text-[10px]' : 'text-xs'
          }`}>
            <Clock className="w-3 h-3" />
            {formatTimestamp(activity.timestamp)}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${
      compact ? 'p-4' : 'p-6'
    }`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`font-semibold text-gray-900 flex items-center gap-2 ${
          compact ? 'text-base' : 'text-lg'
        }`}>
          {compact ? (
            <>
              <Clock className="w-4 h-4 text-gray-400" />
              Today's Activity
            </>
          ) : (
            <>
              <Zap className="w-5 h-5 text-emerald-500" />
              All Activities
            </>
          )}
        </h2>
        <span className={`font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full ${
          compact ? 'text-[10px]' : 'text-xs'
        }`}>
          {allActivities.length} {allActivities.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        {allActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1 text-sm">No activity today</p>
            <p className="text-xs text-gray-400">Your recent actions will appear here</p>
          </div>
        ) : (
          allActivities.map((activity, index) => (
            <ActivityItem key={index} activity={activity} index={index} />
          ))
        )}
      </div>

      {compact && allActivities.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <Link
            href="/dashboard/user/activity"
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center justify-center gap-2 transition-colors group"
          >
            View All Activity
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}
    </div>
  )
}