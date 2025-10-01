"use client"

import { useRouter } from "next/navigation"
import { FileText, Eye, Heart, MessageCircle, PenTool, MoreVertical, Clock } from "lucide-react"

interface BlogStats {
  total: number
  published: number
  draft: number
}

interface BlogsWidgetProps {
  blogs: BlogStats
}

export default function BlogsWidget({ blogs }: BlogsWidgetProps) {
  const router = useRouter()


  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Research: "bg-emerald-100 text-emerald-700",
      Academic: "bg-blue-100 text-blue-700",
      Technology: "bg-purple-100 text-purple-700",
      Science: "bg-orange-100 text-orange-700"
    }
    return colors[category] || "bg-gray-100 text-gray-700"
  }

  const getStatusColor = (status: string) => {
    if (status === "Published") return "bg-green-500"
    if (status === "Draft") return "bg-yellow-500"
    return "bg-blue-500"
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <PenTool className="w-5 h-5 text-rose-600" />
          My Blog Posts
        </h2>
        <button
          onClick={() => router.push("/dashboard/user/blogs/create")}
          className="flex items-center gap-1 px-3 py-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors text-sm font-semibold"
        >
          <PenTool className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Blog Stats Summary */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2 text-center">
          <p className="text-xl font-bold text-rose-700">{blogs.total}</p>
          <p className="text-[10px] text-rose-600 font-medium">Total</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
          <p className="text-xl font-bold text-green-700">{blogs.published}</p>
          <p className="text-[10px] text-green-600 font-medium">Published</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-center">
          <p className="text-xl font-bold text-yellow-700">{blogs.draft}</p>
          <p className="text-[10px] text-yellow-600 font-medium">Drafts</p>
        </div>
      </div>
    </div>
  )
}