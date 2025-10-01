"use client"

import { useState, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createThread } from "@/lib/features/auth/qaSlice"
import { Community, fetchMyCommunities } from "@/lib/features/auth/communitiesSlice"
import { 
  HelpCircle, 
  Loader2, 
  Send,
  Tag,
  FolderOpen,
  Users,
  Lightbulb,
  AlertCircle,
  X
} from "lucide-react"

const CATEGORIES = [
  "Health Sciences",
  "Technology & Engineering",
  "Agriculture",
  "Natural Sciences",
  "Social Sciences",
  "Business & Economics",
  "Education",
  "Arts & Humanities"
]

interface AskQuestionModalProps {
  isOpen: boolean
  onClose: () => void
  communityId?: string
  currentCommunity?: Community
  onSuccess?: (threadId: string) => void
}

export default function AskQuestionModal({ 
  isOpen, 
  onClose, 
  communityId,
  currentCommunity, // Add this prop
  onSuccess 
}: AskQuestionModalProps) {
  const dispatch = useAppDispatch()
  const { isSubmitting, error } = useAppSelector(state => state.qa)
  const { myCommunities, isLoading: communitiesLoading } = useAppSelector(state => state.communities)
  const shouldShowCommunitySelector = !communityId && myCommunities.length > 0
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    community_id: communityId || "",
    tags: [] as string[]
  })
  const [tagInput, setTagInput] = useState("")
  const [showTips, setShowTips] = useState(true)

  // Only fetch communities if we don't have the current community and no communityId is provided
  useEffect(() => {
    if (isOpen && myCommunities.length === 0 && !communityId) {
      dispatch(fetchMyCommunities())
    }
  }, [isOpen, dispatch, myCommunities.length, communityId])


 useEffect(() => {
    if (isOpen && communityId) {
      setFormData(prev => ({ 
        ...prev, 
        community_id: communityId 
      }))
    }
  }, [isOpen, communityId])

useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: "",
        content: "",
        category: "",
        community_id: communityId || "",
        tags: []
      })
      setTagInput("")
      setShowTips(true)
    }
  }, [isOpen, communityId])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))
      setTagInput("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.title.trim().length < 10) {
      alert("Title must be at least 10 characters")
      return
    }

    if (formData.content.trim().length < 20) {
      alert("Content must be at least 20 characters")
      return
    }

    try {
      const result = await dispatch(createThread({
        title: formData.title,
        content: formData.content,
        category: formData.category || undefined,
        community_id: formData.community_id || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined
      })).unwrap()

      // Success - close modal and callback
      onClose()
      if (onSuccess) {
        onSuccess(result.id)
      }
    } catch (err: any) {
      console.error("Failed to create question:", err)
    }
  }

  const isFormValid = formData.title.trim().length >= 10 && formData.content.trim().length >= 20

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-hidden pt-20">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex-shrink-0 bg-[#0158B7] px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Ask a Question</h3>
              <p className="text-sm text-purple-100">Get help from the research community</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Modal Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="grid lg:grid-cols-3 gap-6 p-6">
            
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                )}

                {/* Title */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Question Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., How do I analyze RNA-seq data?"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.title.length}/200 characters (minimum 10)
                  </p>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Question Details <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={8}
                    placeholder="Provide detailed information about your question. Include what you've tried, what you expect, and any relevant context..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    {formData.content.length} characters (minimum 20)
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    Category (Optional)
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
                  >
                    <option value="">Select a category...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Tags (Optional, max 5)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder="Add a tag..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={formData.tags.length >= 5}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || formData.tags.length >= 5}
                      className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:text-purple-900"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

{shouldShowCommunitySelector && (
    <div>
      <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Post in Community (Optional)
      </label>
      
      {communitiesLoading ? (
        <div className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span className="text-sm text-gray-600">Loading communities...</span>
        </div>
      ) : myCommunities.length > 0 ? (
        <>
          <select
            name="community_id"
            value={formData.community_id}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
          >
            <option value="">General Q&A (visible to everyone)</option>
            {myCommunities.map((community) => (
              <option key={community.id} value={community.id}>
                {community.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-600 mt-1">
            Posting in a community limits visibility to community members
          </p>
        </>
      ) : (
        <div className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50">
          <p className="text-sm text-gray-600">
            You haven't joined any communities yet. Your question will be posted to General Q&A.
          </p>
        </div>
      )}
    </div>
  )}

  {/* If we have a currentCommunity, show it as read-only */}
  {communityId && currentCommunity && (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
      <div className="flex items-center gap-3">
        <Users className="w-5 h-5 text-purple-600" />
        <div>
          <p className="text-sm font-semibold text-purple-900">Posting in Community</p>
          <p className="text-sm text-purple-700">{currentCommunity.name}</p>
        </div>
      </div>
    </div>
  )}
              </form>
            </div>

            {/* Tips Sidebar */}
            <div className="lg:col-span-1">
              {showTips && (
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6 sticky top-0">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Lightbulb className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Writing Tips</h3>
                    </div>
                    <button
                      onClick={() => setShowTips(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">📝 Title Guidelines</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Be specific and clear</li>
                        <li>• Include key terms</li>
                        <li>• Ask one question at a time</li>
                        <li>• Use proper grammar</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">💡 Content Guidelines</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Provide context and background</li>
                        <li>• Explain what you've tried</li>
                        <li>• Include relevant details</li>
                        <li>• Format code if applicable</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">🏷️ Tag Guidelines</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>• Use relevant keywords</li>
                        <li>• Maximum 5 tags</li>
                        <li>• Use lowercase</li>
                        <li>• Helps others find your question</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-blue-200">
                      <p className="text-xs text-gray-600 italic">
                        💬 Good questions get better answers! Take time to write clearly.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-colors font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Post Question
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}