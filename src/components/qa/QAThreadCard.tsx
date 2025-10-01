// ...existing code...
"use client"

import { useRouter } from "next/navigation"
import { QAThread } from "@/lib/features/auth/qaSlice"
import {
  MessageCircle,
  Eye,
  CheckCircle,
  Clock,
  Tag,
  Users
} from "lucide-react"

interface QAThreadCardProps {
  thread: QAThread
}

export default function QAThreadCard({ thread }: QAThreadCardProps) {
  const router = useRouter()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  // Safe access helpers / fallbacks
  const askerFirst = thread.asker?.first_name
  const askerLast = thread.asker?.last_name || ""
  const askerInitial = askerFirst?.charAt(0) || "U"
  const askerAccountType = thread.asker?.account_type || "Member"
  // Clean HTML function for rich text content
  const cleanHtml = (html: string) => {
    if (!html) return ""
    // Remove Quill cursor artifacts and other Quill-specific spans
    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    cleaned = cleaned.replace(/<span[^>]*class="[^"]*ql-ui[^"]*"[^>]*>.*?<\/span>/g, "")
    cleaned = cleaned.replace(/ data-list="[^"]*"/g, "")

    // Add proper spacing for paragraphs
    cleaned = cleaned.replace(/<p>/g, '<p style="margin-bottom: 0.75rem; line-height: 1.5;">')

    // Add proper spacing and list styles for unordered lists
    cleaned = cleaned.replace(
      /<ul>/g,
      '<ul style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: disc;">'
    )

    // Add proper spacing and list styles for ordered lists
    cleaned = cleaned.replace(
      /<ol>/g,
      '<ol style="margin-bottom: 0.75rem; padding-left: 1.5rem; list-style-type: decimal;">'
    )

    // Add spacing for list items
    cleaned = cleaned.replace(/<li>/g, '<li style="margin-bottom: 0.25rem; line-height: 1.4;">')

    // Ensure proper heading styles
    cleaned = cleaned.replace(/<h1>/g, '<h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<h2>/g, '<h2 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<h3>/g, '<h3 style="font-size: 1.125rem; font-weight: bold; margin-bottom: 0.75rem;">')
    cleaned = cleaned.replace(/<strong>/g, '<strong style="font-weight: bold;">')

    return cleaned
  }

  return (
    <div
      onClick={() => router.push(`/dashboard/user/qa/${thread.id}`)}
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg hover:border-emerald-300 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-[#0158B7] flex items-center justify-center text-white font-bold flex-shrink-0">
          {askerInitial}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">
              {askerFirst} {askerLast}
            </span>
            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              {askerAccountType}
            </span>
            <span className="text-gray-500 text-xs">• {formatDate(thread.created_at)}</span>
          </div>

          {thread.community && (
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Users className="w-3 h-3" />
              <span>in {thread.community.name}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        {thread.is_answered && (
          <div className="flex-shrink-0">
            <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full">
              <CheckCircle className="w-3 h-3" />
              <span className="text-xs font-semibold">Answered</span>
            </div>
          </div>
        )}
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">
        {thread.title}
      </h3>



      <div
        className="rich-text-content text-gray-700 text-sm"
        dangerouslySetInnerHTML={{
          __html: cleanHtml(
            thread.content.length > 100
              ? thread.content.slice(0, 100) + "..."
              : thread.content
          ),
        }}
        style={{
          lineHeight: "1.5",
        }}
      />
      {/* Tags */}
      {thread.tags && thread.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {thread.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
          {thread.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
              +{thread.tags.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Footer Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-gray-100 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <MessageCircle className="w-4 h-4" />
          <span className="font-semibold">{thread.answer_count || 0}</span>
          <span className="hidden sm:inline">answers</span>
        </div>

        <div className="flex items-center gap-1">
          <Eye className="w-4 h-4" />
          <span className="font-semibold">{thread.view_count || 0}</span>
          <span className="hidden sm:inline">views</span>
        </div>

        {thread.category && (
          <div className="ml-auto">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-semibold">
              {thread.category}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}