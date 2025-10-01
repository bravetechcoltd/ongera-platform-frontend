"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { 
  fetchThreadById, 
  postAnswer, 
  deleteThread,
  clearCurrentThread 
} from "@/lib/features/auth/qaSlice"
import QAAnswerCard from "@/components/qa/QAAnswerCard"
import { 
  ArrowLeft, 
  Eye, 
  MessageCircle, 
  Tag,
  Clock,
  Edit2,
  Trash2,
  Loader2,
  Send,
  CheckCircle,
  AlertCircle,
  Users,
  FileText
} from "lucide-react"
import Link from "next/link"
import RichTextEditor from "@/components/ui/richTextEditor"

export default function QuestionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { currentThread, isLoading, isSubmitting } = useAppSelector(state => state.qa)
  const { user } = useAppSelector(state => state.auth)

  const [answerContent, setAnswerContent] = useState("")
  const [showAnswerForm, setShowAnswerForm] = useState(false)
  const [wordCount, setWordCount] = useState(0)

  const questionId = params.id as string

  useEffect(() => {
    if (questionId) {
      dispatch(fetchThreadById(questionId))
    }

    return () => {
      dispatch(clearCurrentThread())
    }
  }, [questionId, dispatch])

  const handleRichTextChange = (value: string) => {
    setAnswerContent(value)
    const text = value.replace(/<[^>]*>/g, '').trim()
    setWordCount(text.split(/\s+/).filter(Boolean).length)
  }

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

  const handlePostAnswer = async () => {
    if (answerContent.trim().length < 20) {
      alert("Answer must be at least 20 characters")
      return
    }

    try {
      await dispatch(postAnswer({ 
        threadId: questionId, 
        content: answerContent 
      })).unwrap()
      
      setAnswerContent("")
      setShowAnswerForm(false)
      setWordCount(0)
      
      // Refresh thread
      dispatch(fetchThreadById(questionId))
    } catch (error: any) {
      alert(error || "Failed to post answer")
    }
  }

  const handleDeleteThread = async () => {
    if (confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
      try {
        await dispatch(deleteThread(questionId)).unwrap()
        router.push("/dashboard/user/qa")
      } catch (error: any) {
        alert(error || "Failed to delete question")
      }
    }
  }

  // Clean HTML to preserve rich text formatting
  const cleanHtml = (html: string) => {
    if (!html) return ""
    // Remove Quill cursor artifacts
    let cleaned = html.replace(/<span class="ql-cursor">.*?<\/span>/g, "")
    
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
    
    return cleaned
  }

  if (isLoading && !currentThread) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading question...</p>
        </div>
      </div>
    )
  }

  if (!currentThread) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">Question not found</h3>
          <p className="text-sm text-gray-600 mb-4">This question may have been deleted or doesn't exist</p>
          <Link
            href="/dashboard/user/qa"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/80 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Q&A
          </Link>
        </div>
      </div>
    )
  }

  const isAsker = user?.id === currentThread.asker.id
  const acceptedAnswer = currentThread.answers?.find(a => a.is_accepted)
  const otherAnswers = currentThread.answers?.filter(a => !a.is_accepted) || []

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
      <div className="max-w-4xl mx-auto">
        
        {/* Back Button */}
        <Link
          href="/dashboard/user/qa"
          className="inline-flex items-center text-xs text-gray-600 hover:text-[#0158B7] transition-colors font-medium mb-4 group"
        >
          <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
          Back to Q&A
        </Link>

        {/* Question Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          
          {/* Status & Actions */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {currentThread.is_answered ? (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Answered</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Unanswered</span>
                </div>
              )}
              
              {currentThread.category && (
                <span className="px-2.5 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-lg text-xs font-bold">
                  {currentThread.category}
                </span>
              )}
            </div>

          </div>

          {/* Question Title */}
          <h1 className="text-xl font-bold text-gray-900 mb-3">
            {currentThread.title}
          </h1>

          {/* Question Meta */}
          <div className="flex items-center gap-3 mb-4 text-xs text-gray-600 flex-wrap">
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{currentThread.view_count} views</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{currentThread.answer_count || 0} answers</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Asked {formatDate(currentThread.created_at)}</span>
            </div>
          </div>

          {/* Community Badge */}
          {currentThread.community && (
            <Link
              href={`/dashboard/communities/${currentThread.community.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#0158B7]/10 border border-[#0158B7]/20 text-[#0158B7] rounded-lg hover:bg-[#0158B7]/20 transition-colors mb-4 text-xs font-semibold"
            >
              <Users className="w-3.5 h-3.5" />
              {currentThread.community.name}
            </Link>
          )}

          {/* Question Content - Rich Text Display with Full Formatting */}
          <div className="mb-4">
            <div 
              className="rich-text-content text-gray-800 text-sm"
              dangerouslySetInnerHTML={{ __html: cleanHtml(currentThread.content) }}
              style={{
                lineHeight: "1.5",
                color: "#1f2937",
                fontSize: "0.9rem",
              }}
            />
          </div>

          {/* Tags */}
          {currentThread.tags && currentThread.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-gray-200">
              {currentThread.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Asker Info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-bold text-sm">
              {currentThread.asker.first_name?.[0] || 'U'}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">
                {currentThread.asker.first_name} {currentThread.asker.last_name}
              </p>
              <p className="text-xs text-gray-600">{currentThread.asker.account_type}</p>
            </div>
          </div>
        </div>

        {/* Answers Section */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-1.5">
            <MessageCircle className="w-5 h-5 text-[#0158B7]" />
            {currentThread.answer_count || 0} {(currentThread.answer_count || 0) === 1 ? 'Answer' : 'Answers'}
          </h2>

          {/* Accepted Answer */}
          {acceptedAnswer && (
            <div className="mb-4">
              <QAAnswerCard
                answer={acceptedAnswer}
                threadId={questionId}
                isAsker={isAsker}
              />
            </div>
          )}

          {/* Other Answers */}
          <div className="space-y-3">
            {otherAnswers.map((answer) => (
              <QAAnswerCard
                key={answer.id}
                answer={answer}
                threadId={questionId}
                isAsker={isAsker}
              />
            ))}
          </div>

          {/* No Answers Message */}
          {(!currentThread.answers || currentThread.answers.length === 0) && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">No answers yet. Be the first to help!</p>
            </div>
          )}
        </div>

        {/* Answer Form */}
        {user ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#0158B7]" />
              Your Answer
            </h3>
            
            {showAnswerForm || answerContent ? (
              <div className="space-y-3">
                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3" />
                    Answer Details <span className="text-red-500">*</span>
                    <span className="ml-auto text-xs text-gray-500">{wordCount} words</span>
                  </label>
                  <RichTextEditor
                    value={answerContent}
                    onChange={handleRichTextChange}
                    placeholder="Write your answer here... (minimum 20 characters)"
                    className="min-h-[200px]"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-600">
                    Minimum 20 characters required
                  </p>
                  <div className="flex items-center gap-2">
                    {showAnswerForm && (
                      <button
                        onClick={() => {
                          setShowAnswerForm(false)
                          setAnswerContent("")
                          setWordCount(0)
                        }}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors text-xs font-medium"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={handlePostAnswer}
                      disabled={isSubmitting || answerContent.trim().length < 20}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow transition-all text-xs font-semibold disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Posting...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          Post Answer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAnswerForm(true)}
                className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#0158B7] hover:text-[#0158B7] hover:bg-[#0158B7]/5 transition-all text-sm font-medium"
              >
                Click to write your answer...
              </button>
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#0158B7]/5 to-[#5E96D2]/5 border-2 border-[#0158B7]/20 rounded-lg p-6 text-center">
            <MessageCircle className="w-12 h-12 text-[#0158B7] mx-auto mb-3" />
            <h3 className="text-sm font-bold text-gray-900 mb-1.5">Login to Answer</h3>
            <p className="text-xs text-gray-600 mb-4">You need to be logged in to post an answer</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/80 transition-colors text-xs font-semibold"
            >
              Login Now
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}