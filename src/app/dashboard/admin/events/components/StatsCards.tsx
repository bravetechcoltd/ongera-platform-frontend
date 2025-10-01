import { Calendar, Users, Clock, CheckCircle, XCircle, User } from "lucide-react"

interface StatsCardsProps {
  stats: {
    total: number
    upcoming: number
    ongoing: number
    completed: number
    cancelled: number
    totalAttendees: number
  }
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Events",
      value: stats.total,
      icon: Calendar,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700"
    },
    {
      label: "Upcoming",
      value: stats.upcoming,
      icon: Clock,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-700"
    },
    {
      label: "Ongoing",
      value: stats.ongoing,
      icon: Users,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700"
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: CheckCircle,
      color: "bg-gray-500",
      bgColor: "bg-gray-50",
      textColor: "text-gray-700"
    },
    {
      label: "Cancelled",
      value: stats.cancelled,
      icon: XCircle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-700"
    },
    {
      label: "Total Attendees",
      value: stats.totalAttendees,
      icon: User,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-700"
    }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon
        return (
          <div key={index} className={`${item.bgColor} rounded-xl border border-gray-200 p-4`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className={`text-sm font-medium ${item.textColor}`}>{item.label}</p>
              </div>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`w-5 h-5 ${item.textColor}`} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}