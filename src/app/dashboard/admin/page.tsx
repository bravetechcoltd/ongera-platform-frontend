"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchAdminDashboardSummary,
  fetchDetailedAnalytics,
  SystemAlert,
} from "@/lib/features/auth/adminDashboardSlice";
import {
  Users, FileText, Calendar, TrendingUp, TrendingDown,
  AlertCircle, Eye, Download, Heart, MessageSquare,
  RefreshCw, BarChart3, Activity, UserCheck, UserX, CheckCircle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const dispatch = useAppDispatch();
  const { summary, analytics, isLoadingSummary, error, lastFetched } = 
    useAppSelector((state) => state.adminDashboard);

  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    metric: "" as "" | "users" | "projects" | "communities" | "events",
  });

  useEffect(() => {
    dispatch(fetchAdminDashboardSummary());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAdminDashboardSummary());
  };

   const getAlertColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const handleFetchAnalytics = () => {
    if (analyticsRange.startDate && analyticsRange.endDate) {
      dispatch(fetchDetailedAnalytics({
        startDate: analyticsRange.startDate,
        endDate: analyticsRange.endDate,
        ...(analyticsRange.metric && { metric: analyticsRange.metric }),
      }));
    }
  };

  if (isLoadingSummary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-[#0158B7] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-3">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-red-200 max-w-md">
          <AlertCircle className="w-10 h-10 text-red-600 mx-auto mb-3" />
          <p className="text-sm text-center text-gray-800 font-medium mb-3">{error}</p>
          <button
            onClick={handleRefresh}
            className="w-full px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#014a9d] transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
 <div className="min-h-screen bg-gray-50 p-3">
      <div className="max-w-[1600px] mx-auto space-y-3">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0158B7] to-[#0158B7]/80 rounded-xl p-4 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-blue-100 mt-1">
                Platform Health: {summary.overview?.platformHealth?.toUpperCase() || 'UNKNOWN'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {lastFetched && (
                <span className="text-xs text-blue-100">
                  Updated: {new Date(lastFetched).toLocaleTimeString()}
                </span>
              )}
              <button
                onClick={handleRefresh}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-[#0158B7]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Total Users</p>
                <p className="text-lg font-bold text-gray-900">{summary.overview?.totalUsers || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs">
              {(summary.users?.growthRate || 0) >= 0 ? (
                <TrendingUp className="w-3 h-3 text-green-600" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-600" />
              )}
              <span className={(summary.users?.growthRate || 0) >= 0 ? "text-green-600" : "text-red-600"}>
                {summary.users?.growthRate || 0}% this month
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Projects</p>
                <p className="text-lg font-bold text-gray-900">{summary.overview?.totalProjects || 0}</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {summary.projects?.publishRate || 0}% published
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Communities</p>
                <p className="text-lg font-bold text-gray-900">{summary.overview?.totalCommunities || 0}</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {summary.communities?.engagement?.totalMembers || 0} members
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">Events</p>
                <p className="text-lg font-bold text-gray-900">{summary.overview?.totalEvents || 0}</p>
              </div>
            </div>
            <div className="text-xs text-gray-600">
              {summary.events?.upcoming || 0} upcoming
            </div>
          </div>
        </div>

        {/* System Health Alerts */}
        {summary.systemHealth?.alerts && summary.systemHealth.alerts.length > 0 && (
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <h3 className="text-sm font-semibold text-gray-900">System Alerts</h3>
              <span className="ml-auto text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                {summary.systemHealth.alertCount?.total || 0} alerts
              </span>
            </div>
            <div className="space-y-2">
              {summary.systemHealth.alerts.map((alert: SystemAlert, idx: number) => (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border text-xs ${getAlertColor(alert.type)}`}
                >
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3 h-3 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium">{alert.message}</p>
                      <p className="text-xs opacity-75 mt-0.5">Category: {alert.category}</p>
                    </div>
                    <span className="text-xs font-semibold">{alert.priority.toUpperCase()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {/* User Details */}
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0158B7]" />
              User Statistics
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Verified Users
                </span>
                <span className="font-semibold text-gray-900">
                  {summary.users?.verified || 0} ({summary.users?.verificationRate || 0}%)
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  Active Users
                </span>
                <span className="font-semibold text-green-600">{summary.users?.active || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600 flex items-center gap-1">
                  <UserX className="w-3 h-3" />
                  Inactive Users
                </span>
                <span className="font-semibold text-red-600">{summary.users?.inactive || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">New This Week</span>
                <span className="font-semibold text-blue-600">{summary.users?.newThisWeek || 0}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-600">New This Month</span>
                <span className="font-semibold text-blue-600">{summary.users?.newThisMonth || 0}</span>
              </div>
            </div>
            {summary.users?.byAccountType && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-700 mb-2">By Account Type:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(summary.users.byAccountType).map(([type, count]) => (
                    <div key={type} className="bg-gray-50 rounded-lg p-2 text-xs">
                      <p className="text-gray-600">{type}</p>
                      <p className="font-semibold text-gray-900">{count as number}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Engagement */}
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              Project Engagement
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-blue-50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Eye className="w-3 h-3 text-blue-600" />
                  <span className="text-xs text-blue-600">Views</span>
                </div>
                <p className="text-base font-bold text-blue-700">
                  {(summary.projects?.engagement?.totalViews || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Download className="w-3 h-3 text-purple-600" />
                  <span className="text-xs text-purple-600">Downloads</span>
                </div>
                <p className="text-base font-bold text-purple-700">
                  {(summary.projects?.engagement?.totalDownloads || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-pink-50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <Heart className="w-3 h-3 text-pink-600" />
                  <span className="text-xs text-pink-600">Likes</span>
                </div>
                <p className="text-base font-bold text-pink-700">
                  {(summary.projects?.engagement?.totalLikes || 0).toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600">Comments</span>
                </div>
                <p className="text-base font-bold text-green-700">
                  {(summary.projects?.engagement?.totalComments || 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Published</span>
                <span className="font-semibold text-green-600">{summary.projects?.published || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Draft</span>
                <span className="font-semibold text-yellow-600">{summary.projects?.draft || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Views/Project</span>
                <span className="font-semibold text-gray-900">
                  {summary.projects?.engagement?.avgViewsPerProject || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Projects */}
        {summary.projects?.topProjects && summary.projects.topProjects.length > 0 && (
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Top Projects</h3>
            <div className="space-y-2">
              {summary.projects.topProjects.map((project: any, idx: number) => (
                <div
                  key={project.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-xs"
                >
                  <span className="w-6 h-6 bg-[#0158B7] text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{project.title}</p>
                    <p className="text-gray-600 text-xs">by {project.author}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="text-blue-600">{project.views} views</span>
                    <span className="text-purple-600">{project.downloads} downloads</span>
                    <span className="text-pink-600">{project.likes} likes</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Activity Timeline */}
        {summary.activityTimeline && summary.activityTimeline.length > 0 && (
          <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0158B7]" />
              Activity Timeline (Last 7 Days)
            </h3>
            <div className="space-y-2">
              {summary.activityTimeline.map((day: any) => (
                <div key={day.date} className="flex items-center gap-2 text-xs">
                  <span className="w-20 text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-blue-600" />
                      <span>{day.newUsers}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3 text-purple-600" />
                      <span>{day.newProjects}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-green-600" />
                      <span>{day.newCommunities}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-orange-600" />
                      <span>{day.newEvents}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-gray-900">
                    Total: {day.totalActivity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <div className="bg-white rounded-xl p-3 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0158B7]" />
              Detailed Analytics
            </h3>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="text-xs text-[#0158B7] hover:underline font-medium"
            >
              {showAnalytics ? "Hide" : "Show"} Analytics
            </button>
          </div>

          {showAnalytics && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={analyticsRange.startDate}
                    onChange={(e) =>
                      setAnalyticsRange({ ...analyticsRange, startDate: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0158B7]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={analyticsRange.endDate}
                    onChange={(e) =>
                      setAnalyticsRange({ ...analyticsRange, endDate: e.target.value })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0158B7]"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Metric (Optional)</label>
                  <select
                    value={analyticsRange.metric}
                    onChange={(e) =>
                      setAnalyticsRange({
                        ...analyticsRange,
                        metric: e.target.value as any,
                      })
                    }
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0158B7]"
                  >
                    <option value="">All Metrics</option>
                    <option value="users">Users</option>
                    <option value="projects">Projects</option>
                    <option value="communities">Communities</option>
                    <option value="events">Events</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleFetchAnalytics}
                className="w-full px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#014a9d] transition-colors text-sm font-medium"
              >
                Fetch Analytics
              </button>

              {analytics && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-xs font-semibold text-blue-900 mb-2">Analytics Results</h4>
                  <div className="text-xs text-blue-800">
                    <p className="mb-1">
                      Period: {new Date(analytics.period.startDate).toLocaleDateString()} -{" "}
                      {new Date(analytics.period.endDate).toLocaleDateString()}
                    </p>
                    {analytics.analytics.users && (
                      <p>New Users: {analytics.analytics.users.newUsers}</p>
                    )}
                    {analytics.analytics.projects && (
                      <p>New Projects: {analytics.analytics.projects.newProjects}</p>
                    )}
                    {analytics.analytics.communities && (
                      <p>New Communities: {analytics.analytics.communities.newCommunities}</p>
                    )}
                    {analytics.analytics.events && (
                      <p>New Events: {analytics.analytics.events.newEvents}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}