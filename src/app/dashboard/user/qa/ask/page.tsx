"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createThread } from "@/lib/features/auth/qaSlice"
import { fetchMyCommunities } from "@/lib/features/auth/communitiesSlice"
import {
  ArrowLeft,
  HelpCircle,
  Loader2,
  Send,
  Tag,
  FolderOpen,
  Users,
  Lightbulb,
  AlertCircle,
  X,
  FileText
} from "lucide-react"
import Link from "next/link"
import RichTextEditor from "@/components/ui/richTextEditor"

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

export default function AskQuestionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { isSubmitting, error } = useAppSelector(state => state.qa)
  const { myCommunities } = useAppSelector(state => state.communities)

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    community_id: "",
    tags: [] as string[]
  })
  const [tagInput, setTagInput] = useState("")
  const [showTips, setShowTips] = useState(true)
  const [wordCount, setWordCount] = useState(0)

  useEffect(() => {
    dispatch(fetchMyCommunities())

    const communityId = searchParams.get("community")
    if (communityId) {
      setFormData(prev => ({ ...prev, community_id: communityId }))
    }
  }, [dispatch, searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'content') {
      const text = value.replace(/<[^>]*>/g, '').trim()
      setWordCount(text.split(/\s+/).filter(Boolean).length)
    }
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

      router.push(`/dashboard/user/qa/${result.id}`)
    } catch (err: any) {
      console.error("Failed to create question:", err)
    }
  }

  const isFormValid = formData.title.trim().length >= 10 && formData.content.trim().length >= 20

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-4">
          <Link
            href="/dashboard/user/qa"
            className="inline-flex items-center text-xs text-gray-600 hover:text-[#0158B7] transition-colors font-medium mb-3 group"
          >
            <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Q&A
          </Link>

          <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg">
              <HelpCircle className="w-4 h-4 text-white" />
            </div>
            Ask a Question
          </h1>
          <p className="text-xs text-gray-500">Get help from the research community</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">

          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">

              {/* Error Display */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 text-xs">
                  <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Title */}
              <div>
                <label className={labelClass}>
                  <FileText className="w-3 h-3" />
                  Question Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., How do I analyze RNA-seq data?"
                  className={inputClass}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/200 characters (minimum 10)
                </p>
              </div>

              {/* Content */}
              <div>
                <label className={labelClass}>
                  <FileText className="w-3 h-3" />
                  Question Details <span className="text-red-500">*</span>
                  <span className="ml-auto text-xs text-gray-500">{wordCount} words</span>
                </label>
                <RichTextEditor
                  value={formData.content}
                  onChange={(value) => handleRichTextChange('content', value)}
                  placeholder="Provide detailed information about your question..."
                  className="min-h-[200px]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 20 characters required
                </p>
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>
                  <FolderOpen className="w-3 h-3" />
                  Category (Optional)
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={inputClass}
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
                <label className={labelClass}>
                  <Tag className="w-3 h-3" />
                  Tags (Optional, max 5)
                </label>
                <div className="flex gap-1.5 mb-2">
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
                    className={inputClass + " flex-1"}
                    disabled={formData.tags.length >= 5}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    disabled={!tagInput.trim() || formData.tags.length >= 5}
                    className="px-3 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/80 transition-colors text-xs font-medium disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>

                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-lg text-xs font-medium"
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-0.5 hover:text-[#0158B7]/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Community Selection */}
              {myCommunities.length > 0 && (
                <div>
                  <label className={labelClass}>
                    <Users className="w-3 h-3" />
                    Post in Community (Optional)
                  </label>
                  <select
                    name="community_id"
                    value={formData.community_id}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="">General Q&A (visible to everyone)</option>
                    {myCommunities.map((community) => (
                      <option key={community.id} value={community.id}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Posting in a community limits visibility to community members
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <Link
                  href="/dashboard/user/qa"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors text-xs font-medium"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
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
                      Post Question
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-1">
            {showTips && (
              <div className="bg-gradient-to-br from-[#0158B7]/5 to-[#5E96D2]/5 border border-[#0158B7]/20 rounded-xl p-4 sticky top-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1.5 bg-[#0158B7] rounded-lg">
                      <Lightbulb className="w-3.5 h-3.5 text-white" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">Writing Tips</h3>
                  </div>
                  <button
                    onClick={() => setShowTips(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1.5">Title Guidelines</h4>
                    <ul className="space-y-0.5 text-gray-700">
                      <li>• Be specific and clear</li>
                      <li>• Include key terms</li>
                      <li>• Ask one question at a time</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1.5">Content Guidelines</h4>
                    <ul className="space-y-0.5 text-gray-700">
                      <li>• Provide context and background</li>
                      <li>• Explain what you've tried</li>
                      <li>• Include relevant details</li>
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-[#0158B7]/20">
                    <p className="text-xs text-gray-600 italic">
                      Good questions get better answers!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}