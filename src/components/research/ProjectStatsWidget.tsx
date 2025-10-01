// @ts-nocheck
"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface ProjectStatsWidgetProps {
  stats: {
    total: number
    draft: number
    published: number
    archived: number
  }
  previousStats?: {
    total: number
    draft: number
    published: number
    archived: number
  }
}

export default function ProjectStatsWidget({ stats, previousStats }: ProjectStatsWidgetProps) {
  const calculateTrend = (current: number, previous?: number) => {
    if (!previous || previous === 0) return { percentage: 0, direction: 'neutral' as const }
    
    const change = ((current - previous) / previous) * 100
    const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    
    return { percentage: Math.abs(Math.round(change)), direction }
  }

  const metrics = [
    {
      label: 'Total Projects',
      value: stats.total,
      previous: previousStats?.total,
      color: 'blue'
    },
    {
      label: 'Published',
      value: stats.published,
      previous: previousStats?.published,
      color: 'green'
    },
    {
      label: 'Drafts',
      value: stats.draft,
      previous: previousStats?.draft,
      color: 'gray'
    },
    {
      label: 'Archived',
      value: stats.archived,
      previous: previousStats?.archived,
      color: 'orange'
    }
  ]

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') return <TrendingUp className="w-3 h-3" />
    if (direction === 'down') return <TrendingDown className="w-3 h-3" />
    return <Minus className="w-3 h-3" />
  }

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    if (direction === 'up') return 'text-green-600'
    if (direction === 'down') return 'text-red-600'
    return 'text-gray-500'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {metrics.map((metric, idx) => {
        const trend = calculateTrend(metric.value, metric.previous)
        
        return (
          <div
            key={idx}
            className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-600">{metric.label}</span>
              {previousStats && trend.percentage > 0 && (
                <div className={`flex items-center gap-1 ${getTrendColor(trend.direction)}`}>
                  {getTrendIcon(trend.direction)}
                  <span className="text-xs font-semibold">{trend.percentage}%</span>
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
          </div>
        )
      })}
    </div>
  )
}