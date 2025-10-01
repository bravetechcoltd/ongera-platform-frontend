import { X, Users, BarChart3, Calendar, Download, TrendingUp } from "lucide-react"

interface StatisticsModalProps {
  isOpen: boolean
  onClose: () => void
  event: any
  statistics: any
}

export default function StatisticsModal({
  isOpen,
  onClose,
  event,
  statistics
}: StatisticsModalProps) {
  if (!isOpen || !event) return null

  const stats = statistics || {
    totalRegistrations: 0,
    statusCounts: { pending: 0, approved: 0, rejected: 0, attended: 0, waitlisted: 0 },
    approvalRate: 0,
    attendanceRate: 0,
    capacity: null,
    registrationTimeline: [],
    recentActivity: []
  }

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "blue" }: any) => (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-3`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-gray-900">{value}</p>
          <p className={`text-xs font-medium text-${color}-700`}>{title}</p>
          {subtitle && <p className="text-xs text-gray-600 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg bg-${color}-100`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
        
        {/* Modal Header */}
        <div className="bg-[#0158B7] px-4 py-3 border-b border-blue-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Event Statistics</h3>
                <p className="text-blue-100 text-xs">
                  Detailed analytics for {event.title}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {/* Export functionality */}}
                className="flex items-center space-x-1 px-3 py-1 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-colors text-xs"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-auto p-4 space-y-4">

          {/* Key Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              title="Total Registrations"
              value={stats.totalRegistrations}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Approval Rate"
              value={`${stats.approvalRate}%`}
              subtitle="of registrations approved"
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Attendance Rate"
              value={`${stats.attendanceRate}%`}
              subtitle="of approved attendees"
              icon={Calendar}
              color="purple"
            />
            <StatCard
              title="Capacity"
              value={stats.capacity ? `${stats.capacity}%` : 'N/A'}
              subtitle={event.max_attendees ? `of ${event.max_attendees} max` : 'No limit'}
              icon={Users}
              color="orange"
            />
          </div>

          {/* Registration Status Breakdown */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Registration Status</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {Object.entries(stats.statusCounts as Record<string, number>).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-lg font-bold text-gray-900">{count}</p>
                  <p className="text-xs font-medium text-gray-600 capitalize">{status}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Registration Timeline */}
          {stats.registrationTimeline && stats.registrationTimeline.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-900 mb-3">Registration Timeline</h4>
              <div className="space-y-2">
                {stats.registrationTimeline.map((day: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">{day.date}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-1.5">
                        <div
                          className="bg-[#0158B7] h-1.5 rounded-full"
                          style={{
                            width: `${(day.count / Math.max(...stats.registrationTimeline.map((d: any) => d.count))) * 100}%`
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-900 w-6 text-right">
                        {day.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Recent Activity</h4>
            <div className="space-y-2">
              {stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity: any, index: number) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900">
                        {activity.user} {activity.action}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      activity.status === 'approved' ? 'bg-green-100 text-green-800' :
                      activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      activity.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-600 text-xs text-center py-3">No recent activity</p>
              )}
            </div>
          </div>

          {/* Event Information */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Event Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-gray-600">Event Type</p>
                <p className="font-semibold text-gray-900">{event.event_type}</p>
              </div>
              <div>
                <p className="text-gray-600">Event Mode</p>
                <p className="font-semibold text-gray-900">{event.event_mode}</p>
              </div>
              <div>
                <p className="text-gray-600">Start Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(event.start_datetime).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">End Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(event.end_datetime).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Organizer</p>
                <p className="font-semibold text-gray-900">
                  {event.organizer?.first_name} {event.organizer?.last_name}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Requires Approval</p>
                <p className="font-semibold text-gray-900">
                  {event.requires_approval ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}