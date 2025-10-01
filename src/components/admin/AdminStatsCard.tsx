"use client"

import { Users, Globe, Clock, CheckCircle } from "lucide-react"

interface StatsCardProps {
  total: number
  pending: number
  approved: number
  rejected: number
}

export default function AdminStatsCard({ total, pending, approved, rejected }: StatsCardProps) {
  const stats = [
    {
      label: "Total Communities",
      value: total,
      icon: Globe,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    {
      label: "Pending Approval",
      value: pending,
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600"
    },
    {
      label: "Approved",
      value: approved,
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    {
      label: "Active Members",
      value: rejected,
      icon: Users,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>
            <div>
              <p className={`text-3xl font-bold ${stat.textColor} mb-1`}>
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}