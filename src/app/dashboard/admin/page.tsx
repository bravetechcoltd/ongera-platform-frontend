"use client"

import React from 'react'
import { motion } from 'framer-motion'
import {
  Users, BookOpen, Calendar, Shield, UserPlus, Flag,
  TrendingUp, TrendingDown, ArrowUp, ArrowDown,
  MessageSquare, Eye, Star, Award, Bell, CheckCircle,
  AlertCircle, Clock, BarChart3, Activity, Globe
} from 'lucide-react'

export default function OngeraAdminDashboardHome() {
  // Key Metrics Data
  const keyMetrics = [
    {
      title: "Total Users",
      value: "1,234",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    },
    {
      title: "Research Projects",
      value: "567",
      change: "+8.2%",
      trend: "up",
      icon: BookOpen,
      color: "from-cyan-500 to-teal-600",
      bgColor: "bg-cyan-50",
      textColor: "text-cyan-600"
    },
    {
      title: "Active Communities",
      value: "89",
      change: "+15.3%",
      trend: "up",
      icon: Users,
      color: "from-teal-500 to-emerald-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600"
    },
    {
      title: "Events This Month",
      value: "23",
      change: "+5.1%",
      trend: "up",
      icon: Calendar,
      color: "from-emerald-600 to-cyan-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600"
    }
  ]

  // Platform Stats
  const platformStats = [
    {
      label: "New Users Today",
      value: "48",
      icon: UserPlus,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    },
    {
      label: "Pending Reviews",
      value: "12",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      label: "Flagged Content",
      value: "3",
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      label: "Support Tickets",
      value: "7",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    }
  ]

  // Recent Activities
  const recentActivities = [
    {
      id: 1,
      type: "user",
      title: "New user registered",
      description: "Dr. Marie Uwimana joined as Researcher",
      time: "2 minutes ago",
      icon: UserPlus,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100"
    },
    {
      id: 2,
      type: "project",
      title: "Research project submitted",
      description: "AI in Healthcare awaiting review",
      time: "15 minutes ago",
      icon: BookOpen,
      color: "text-cyan-600",
      bgColor: "bg-cyan-100"
    },
    {
      id: 3,
      type: "event",
      title: "Event created",
      description: "Rwanda Research Summit 2025 scheduled",
      time: "1 hour ago",
      icon: Calendar,
      color: "text-teal-600",
      bgColor: "bg-teal-100"
    },
    {
      id: 4,
      type: "report",
      title: "Content reported",
      description: "Post flagged for review in Tech Community",
      time: "2 hours ago",
      icon: Flag,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      id: 5,
      type: "community",
      title: "Community created",
      description: "Climate Research Hub approved",
      time: "3 hours ago",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ]

  // User Growth Data (for chart)
  const userGrowthData = [
    { month: 'Jan', users: 850 },
    { month: 'Feb', users: 920 },
    { month: 'Mar', users: 980 },
    { month: 'Apr', users: 1050 },
    { month: 'May', users: 1150 },
    { month: 'Jun', users: 1234 }
  ]

  // Top Communities
  const topCommunities = [
    { name: "Health Research Rwanda", members: 450, growth: "+15%" },
    { name: "Tech Innovation Hub", members: 389, growth: "+22%" },
    { name: "Agricultural Solutions", members: 356, growth: "+18%" },
    { name: "Climate Action Network", members: 298, growth: "+12%" }
  ]

  // Pending Actions
  const pendingActions = [
    {
      type: "verification",
      title: "User verifications pending",
      count: 8,
      priority: "high",
      icon: Shield
    },
    {
      type: "review",
      title: "Projects awaiting review",
      count: 12,
      priority: "medium",
      icon: BookOpen
    },
    {
      type: "reports",
      title: "Content reports to review",
      count: 3,
      priority: "high",
      icon: Flag
    },
    {
      type: "community",
      title: "Community approvals",
      count: 5,
      priority: "low",
      icon: Users
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
            <p className="text-emerald-100">
              Manage and monitor the Ongera research platform
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <Shield className="w-8 h-8" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          {platformStats.map((stat, index) => (
            <div key={index} className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-emerald-100">{stat.label}</div>
                  <div className="text-xl font-bold">{stat.value}</div>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${metric.bgColor}`}>
                <metric.icon className={`w-6 h-6 ${metric.textColor}`} />
              </div>
              <div className={`flex items-center space-x-1 ${metric.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                {metric.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                <span className="text-sm font-semibold">{metric.change}</span>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</h3>
              <p className="text-gray-600 text-sm">{metric.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* User Growth Chart & Top Communities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">User Growth</h3>
            <select className="border border-gray-300 rounded-lg px-3 py-1 text-sm">
              <option>Last 6 Months</option>
              <option>Last Year</option>
              <option>All Time</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end space-x-2">
            {userGrowthData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-t-md hover:from-emerald-600 hover:to-emerald-400 transition-colors cursor-pointer"
                  style={{ height: `${(data.users / 1500) * 100}%` }}
                  title={`${data.users} users`}
                >
                </div>
                <div className="text-xs text-gray-600 mt-2">{data.month}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-center">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Total Users</span>
            </div>
          </div>
        </div>

        {/* Top Communities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Communities</h3>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {topCommunities.map((community, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{community.name}</div>
                    <div className="text-sm text-gray-600">{community.members} members</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-600">{community.growth}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Actions & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Pending Actions</h3>
            <span className="text-xs text-gray-500">Requires Attention</span>
          </div>
          
          <div className="space-y-3">
            {pendingActions.map((action, index) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 rounded-lg border ${getPriorityColor(action.priority)} transition-all hover:shadow-md cursor-pointer`}
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{action.title}</div>
                    <div className="text-xs opacity-75 capitalize">{action.priority} priority</div>
                  </div>
                </div>
                <div className="text-xl font-bold">{action.count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Activities</h3>
            <button className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold">
              View All
            </button>
          </div>
          
          <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className={`p-2 rounded-lg ${activity.bgColor}`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{activity.title}</h4>
                  <p className="text-gray-600 text-sm">{activity.description}</p>
                  <p className="text-gray-500 text-xs mt-1 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {activity.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border-2 border-dashed border-emerald-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
            <UserPlus className="w-8 h-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold text-gray-900">Add User</div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-cyan-300 rounded-lg hover:border-cyan-500 hover:bg-cyan-50 transition-all group">
            <BookOpen className="w-8 h-8 text-cyan-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold text-gray-900">Review Projects</div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-teal-300 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all group">
            <Calendar className="w-8 h-8 text-teal-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold text-gray-900">Create Event</div>
          </button>
          
          <button className="p-4 border-2 border-dashed border-emerald-300 rounded-lg hover:border-emerald-500 hover:bg-emerald-50 transition-all group">
            <BarChart3 className="w-8 h-8 text-emerald-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
            <div className="text-sm font-semibold text-gray-900">View Reports</div>
          </button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Activity className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">99.9%</div>
          <div className="text-sm text-gray-600">Uptime</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Globe className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">156</div>
          <div className="text-sm text-gray-600">Active Sessions</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Eye className="w-8 h-8 text-teal-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">2.4K</div>
          <div className="text-sm text-gray-600">Page Views Today</div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">4.8</div>
          <div className="text-sm text-gray-600">Platform Rating</div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  )
}