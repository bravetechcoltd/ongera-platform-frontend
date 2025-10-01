"use client"

import { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { QAAnswer } from "@/lib/features/auth/qaSlice"
import { 
  acceptAnswer, 
  updateAnswer, 
  deleteAnswer 
} from "@/lib/features/auth/qaSlice"
import VoteButtons from "./VoteButtons"
import { 
  CheckCircle, 
  Edit2, 
  Trash2, 
  X, 
  Save,
  Loader2,
  Award
} from "lucide-react"
import RichTextEditor from "@/components/ui/richTextEditor" // Import the RichTextEditor

interface QAAnswerCardProps {
  answer: QAAnswer
  threadId: string
  isAsker: boolean
}

export default function QAAnswerCard({ answer, threadId, isAsker }: QAAnswerCardProps) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { isSubmitting } = useAppSelector(state => state.qa)

  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(answer.content)
  const [wordCount, setWordCount] = useState(0)

  const isAnswerer = user?.id === answer.answerer.id

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

  // Clean HTML to preserve rich text formatting for answers
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

  const handleRichTextChange = (value: string) => {
    setEditContent(value)
    const text = value.replace(/<[^>]*>/g, '').trim()
    setWordCount(text.split(/\s+/).filter(Boolean).length)
  }

  const handleAccept = async () => {
    if (!answer.is_accepted) {
      await dispatch(acceptAnswer(answer.id))
    }
  }

  const handleSaveEdit = async () => {
    const textContent = editContent.replace(/<[^>]*>/g, '').trim()
    if (textContent.length < 20) {
      alert("Answer must be at least 20 characters")
      return
    }
    
    await dispatch(updateAnswer({ id: answer.id, content: editContent }))
    setIsEditing(false)
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this answer?")) {
      await dispatch(deleteAnswer(answer.id))
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditContent(answer.content)
    // Reset word count based on original content
    const text = answer.content.replace(/<[^>]*>/g, '').trim()
    setWordCount(text.split(/\s+/).filter(Boolean).length)
  }

  return (
    <div className={`bg-white rounded-xl border-2 p-6 transition-all ${
      answer.is_accepted 
        ? "border-green-500 bg-green-50/50" 
        : "border-gray-200 hover:border-gray-300"
    }`}>
      
      {/* Accepted Badge */}
      {answer.is_accepted && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-green-200">
          <div className="p-2 bg-green-500 rounded-lg">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-green-900">Accepted Answer</p>
            <p className="text-xs text-green-700">This answer was marked as correct by the question asker</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Vote Buttons */}
        <VoteButtons
          answerId={answer.id}
          upvotesCount={answer.upvotes_count}
          userVote={answer.user_vote}
          disabled={isAnswerer}
        />

        {/* Author Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                {answer.answerer.first_name?.[0] || 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">
                    {answer.answerer.first_name} {answer.answerer.last_name}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {answer.answerer.account_type}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  answered {formatDate(answer.created_at)}
                  {answer.updated_at !== answer.created_at && " (edited)"}
                </p>
              </div>
            </div>

            {/* Actions */}
            {!isEditing && (
              <div className="flex items-center gap-2">
                {isAsker && !answer.is_accepted && (
                  <button
                    onClick={handleAccept}
                    disabled={isSubmitting}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Accept</span>
                      </>
                    )}
                  </button>
                )}
                
                {isAnswerer && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
       
                  </>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          {isEditing ? (
            <div className="space-y-3">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <RichTextEditor
                  value={editContent}
                  onChange={handleRichTextChange}
                  placeholder="Edit your answer... (minimum 20 characters)"
                  className="min-h-[200px]"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  {wordCount} words • Minimum 20 characters required
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSubmitting || editContent.replace(/<[^>]*>/g, '').trim().length < 20}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors font-medium"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="prose max-w-none">
              {/* Apply cleanHtml to answer content */}
              <div 
                className="rich-text-content text-gray-800 text-sm"
                dangerouslySetInnerHTML={{ __html: cleanHtml(answer.content) }}
                style={{
                  lineHeight: "1.5",
                  color: "#1f2937",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}