"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { fetchQAThreads, fetchMyQuestions } from "@/lib/features/auth/qaSlice"
import QAThreadCard from "@/components/qa/QAThreadCard"
import QAFilters from "@/components/qa/QAFilters"
import { 
  Search, 
  Plus, 
  Loader2, 
  Filter,
  HelpCircle,
  MessageSquare,
  CheckCircle,
  Clock,
  BookOpen,
  Users,
  Eye
} from "lucide-react"
import Link from "next/link"

export default function QAPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { threads, myQuestions, isLoading, pagination } = useAppSelector(state => state.qa)
  const { user } = useAppSelector(state => state.auth)

  const [activeTab, setActiveTab] = useState<"all" | "unanswered" | "my-questions">("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortBy, setSortBy] = useState("latest")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadQuestions()
  }, [activeTab, selectedCategory, sortBy])

  const loadQuestions = () => {
    if (activeTab === "my-questions") {
      dispatch(fetchMyQuestions({ page: 1, limit: 20 }))
    } else {
      dispatch(fetchQAThreads({
        page: 1,
        limit: 20,
        category: selectedCategory || undefined,
        is_answered: activeTab === "unanswered" ? false : undefined,
        sort: sortBy
      }))
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(fetchQAThreads({
      page: 1,
      limit: 20,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      is_answered: activeTab === "unanswered" ? false : undefined,
      sort: sortBy
    }))
  }

  const handleLoadMore = () => {
    if (pagination.page < pagination.totalPages) {
      if (activeTab === "my-questions") {
        dispatch(fetchMyQuestions({ 
          page: pagination.page + 1, 
          limit: 20 
        }))
      } else {
        dispatch(fetchQAThreads({
          page: pagination.page + 1,
          limit: 20,
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          is_answered: activeTab === "unanswered" ? false : undefined,
          sort: sortBy
        }))
      }
    }
  }

  const displayThreads = activeTab === "my-questions" ? myQuestions : threads

  // Stats calculation
  const stats = {
    total: threads.length,
    unanswered: threads.filter(t => !t.is_answered).length,
    myQuestions: myQuestions.length,
    answered: threads.filter(t => t.is_answered).length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header with Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-[#0158B7] rounded-lg">
                  <HelpCircle className="w-4 h-4 text-white" />
                </div>
                Q&A Forum
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">Ask questions and share knowledge with researchers</p>
            </div>
            
            <Link
              href="/dashboard/user/qa/ask"
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#0158B7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Ask Question</span>
            </Link>
          </div>

          {/* Compact Stats Bar */}
          <div className="flex items-center divide-x divide-gray-200 bg-gray-50 rounded-lg border border-gray-100 p-2">
            {[
              { label: 'Total', value: stats.total, icon: BookOpen, color: 'bg-[#0158B7]' },
              { label: 'Answered', value: stats.answered, icon: CheckCircle, color: 'bg-[#5E96D2]' },
              { label: 'Unanswered', value: stats.unanswered, icon: Clock, color: 'bg-orange-500' },
              { label: 'My Questions', value: stats.myQuestions, icon: Users, color: 'bg-green-500' }
            ].map((stat, idx) => {
              const Icon = stat.icon
              return (
                <div key={idx} className="flex items-center gap-2 px-3 first:pl-2 last:pr-2">
                  <div className={`p-1.5 ${stat.color} rounded-lg`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                    <p className="text-[10px] text-gray-600">{stat.label}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col lg:flex-row gap-2 mb-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
              />
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
            >
              <option value="latest">Latest</option>
              <option value="popular">Popular</option>
              <option value="unanswered">Unanswered</option>
            </select>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all text-sm ${
                showFilters || selectedCategory
                  ? "bg-[#A8C8E8]/30 text-[#0158B7] border border-[#8DB6E1]"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {selectedCategory && (
                <span className="w-1.5 h-1.5 bg-[#0158B7] rounded-full" />
              )}
            </button>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="px-4 py-1.5 bg-[#0158B7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
            >
              Search
            </button>
          </div>

          {/* Active Filters Display */}
          {(searchQuery || selectedCategory) && (
            <div className="flex items-center justify-between p-2 bg-[#A8C8E8]/20 border border-[#8DB6E1] rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#0158B7]">
                  Found {pagination.total} questions
                </span>
                {selectedCategory && (
                  <span className="px-2 py-0.5 bg-white border border-[#8DB6E1] rounded-full text-xs font-medium text-[#0158B7]">
                    {selectedCategory}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  setSelectedCategory("")
                  setSearchQuery("")
                  loadQuestions()
                }}
                className="text-xs font-medium text-[#0158B7] hover:text-[#0362C3]"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-2 pt-2 border-t border-gray-200">
              <QAFilters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onClear={() => {
                  setSelectedCategory("")
                  setSearchQuery("")
                }}
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              { id: "all", label: "All Questions", icon: MessageSquare, count: stats.total },
              { id: "unanswered", label: "Unanswered", icon: Clock, count: stats.unanswered },
              { id: "my-questions", label: "My Questions", icon: HelpCircle, count: stats.myQuestions }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2 font-semibold transition-all whitespace-nowrap border-b-2 text-sm ${
                    activeTab === tab.id
                      ? "border-[#0158B7] text-[#0158B7] bg-[#A8C8E8]/20"
                      : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab.id 
                      ? "bg-[#0158B7] text-white" 
                      : "bg-gray-200 text-gray-700"
                  }`}>
                    {tab.count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Questions List */}
        {isLoading && displayThreads.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Loading questions...</p>
            </div>
          </div>
        ) : displayThreads.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">
              {activeTab === "my-questions" ? "No questions yet" : "No questions found"}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {activeTab === "my-questions" 
                ? "You haven't asked any questions yet. Start a discussion!"
                : "Try adjusting your search or filters"
              }
            </p>
            <Link
              href="/dashboard/user/qa/ask"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Ask Question
            </Link>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {displayThreads.map((thread) => (
                <div key={thread.id} className="bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all">
                  <QAThreadCard thread={thread} />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination.page < pagination.totalPages && (
              <div className="flex justify-center pt-3">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="px-6 py-2 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Loading...
                    </>
                  ) : (
                    `Load More (${pagination.total - pagination.page * pagination.limit} remaining)`
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}