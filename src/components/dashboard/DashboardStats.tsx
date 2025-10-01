"use client"

import { BookOpen, Users, Calendar, Eye, Heart, MessageCircle, TrendingUp, FileText } from "lucide-react"
import { DashboardSummary } from "@/lib/features/auth/dashboardSlices"

interface DashboardStatsProps {
  accountType: string
  summary: DashboardSummary | null
}

export default function DashboardStats({ accountType, summary }: DashboardStatsProps) {
  if (!summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-xl p-3 h-20 animate-pulse"></div>
        ))}
      </div>
    )
  }

  const getStatsConfig = (type: string) => {
    const baseStats = [
      {
        label: "Research Projects",
        value: summary.projects.total,
        subtitle: `${summary.projects.published} published`,
        icon: BookOpen,
        color: "blue",
        trend: summary.projects.totalViews > 0 ? `↑ ${summary.projects.totalViews} views` : undefined
      },
      {
        label: "Communities",
        value: summary.communities.total,
        subtitle: `${summary.communities.created} created`,
        icon: Users,
        color: "blue",
        trend: undefined
      },
      {
        label: "Events",
        value: summary.events.total,
        subtitle: `${summary.events.upcoming} upcoming`,
        icon: Calendar,
        color: "blue",
        trend: undefined
      },
      {
        label: "Blog Posts",
        value: summary.blogs.total,
        subtitle: `${summary.blogs.published} published`,
        icon: FileText,
        color: "blue",
        trend: summary.blogs.draft > 0 ? `${summary.blogs.draft} drafts` : undefined
      },
      {
        label: "Engagement",
        value: summary.projects.totalLikes,
        subtitle: `${summary.projects.totalDownloads} downloads`,
        icon: Heart,
        color: "blue",
        trend: undefined
      }
    ]

    if (type === "Institution") {
      return [
        {
          label: "Projects Hosted",
          value: summary.projects.total,
          subtitle: `${summary.projects.published} active`,
          icon: BookOpen,
          color: "blue",
          trend: `${summary.projects.totalViews} total views`
        },
        {
          label: "Community Members",
          value: summary.communities.total,
          subtitle: `${summary.communities.created} communities`,
          icon: Users,
          color: "blue",
          trend: undefined
        },
        {
          label: "Events Organized",
          value: summary.events.organizing,
          subtitle: `${summary.events.upcoming} upcoming`,
          icon: Calendar,
          color: "blue",
          trend: undefined
        },
        {
          label: "Blog Posts",
          value: summary.blogs.total,
          subtitle: `${summary.blogs.published} published`,
          icon: FileText,
          color: "blue",
          trend: summary.blogs.draft > 0 ? `${summary.blogs.draft} drafts` : undefined
        },
        {
          label: "Total Reach",
          value: summary.projects.totalViews + summary.projects.totalDownloads,
          subtitle: `${summary.projects.totalLikes} likes`,
          icon: Eye,
          color: "blue",
          trend: undefined
        }
      ]
    }

    if (type === "Student" || type === "Researcher") {
      return [
        ...baseStats.slice(0, 3),
        {
          label: "Blog Posts",
          value: summary.blogs.total,
          subtitle: `${summary.blogs.published} published`,
          icon: FileText,
          color: "blue",
          trend: summary.blogs.draft > 0 ? `${summary.blogs.draft} drafts` : undefined
        },
        {
          label: "Questions Asked",
          value: summary.qa.totalQuestions,
          subtitle: `${summary.qa.answeredQuestions} answered`,
          icon: MessageCircle,
          color: "blue",
          trend: undefined
        }
      ]
    }

    return baseStats
  }

  const statsConfig = getStatsConfig(accountType)

  const colorClasses = {
    blue: {
      iconBg: "bg-gradient-to-br from-[#0158B7] to-[#5E96D2]",
      text: "text-[#0158B7]"
    }
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
      {statsConfig.map((stat, index) => {
        const Icon = stat.icon
        const colors = colorClasses[stat.color as keyof typeof colorClasses]

        return (
          <div 
            key={index} 
            className="bg-white rounded-xl p-3 border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className={`p-1 rounded-lg ${colors.iconBg}`}>
                <Icon className="w-3.5 h-3.5 text-white" />
              </div>
              {stat.trend && (
                <span className="text-[9px] font-medium text-gray-500 bg-gray-100 px-1 py-0.5 rounded-full">
                  {stat.trend}
                </span>
              )}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 mb-0.5 leading-none">{stat.value}</p>
              <p className="text-xs font-semibold text-gray-900 leading-tight">{stat.label}</p>
              <p className="text-[10px] text-gray-600 mt-0.5">{stat.subtitle}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}