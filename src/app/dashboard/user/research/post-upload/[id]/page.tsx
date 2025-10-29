// @ts-nocheck
"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'
import { 
  updateProjectStatus, 
  fetchProjectForUpload 
} from '@/lib/features/auth/projectSlice'
import { 
  fetchSuggestedCommunities, 
  createCommunityPosts 
} from '@/lib/features/auth/communitiesSlice'
import {
  FileText, Eye, Send, Users, MessageSquare, Check, ArrowRight,
  BookOpen, Tag, Globe, Calendar, Paperclip, X, Loader2,
  CheckCircle, AlertCircle, Sparkles, Share2, Edit2, Home
} from 'lucide-react'

export default function ProjectPostUploadFlow() {
  const router = useRouter()
  const params = useParams()
  const dispatch = useAppDispatch()
  const projectId = params?.id as string 
  const [isLoading, setIsLoading] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const { currentProject, isLoading: projectLoading } = useAppSelector(state => state.projects)
  const { 
    communities, 
    isLoading: communitiesLoading, 
    isSubmitting: postsSubmitting 
  } = useAppSelector(state => state.communities)

  const [step, setStep] = useState(1)
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([])
  const [postContent, setPostContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectForUpload(projectId))
        .unwrap()
        .then((project) => {
          setPostContent(`🎉 Excited to share my latest research!\n\nCheck out "${project.title}"\n\n${project.abstract.substring(0, 150)}...`)
          setIsLoading(false)
        })
        .catch((err) => {
          setError('Failed to load project')
          setIsLoading(false)
        })
    }
  }, [dispatch, projectId])

  useEffect(() => {
    if (step === 4 && projectId) {
      dispatch(fetchSuggestedCommunities(projectId))
    }
  }, [step, projectId, dispatch])

  const handlePublish = async () => {
    if (!projectId) return
    
    setIsPublishing(true)
    try {
      await dispatch(updateProjectStatus({ 
        id: projectId, 
        status: 'Published' 
      })).unwrap()
      
      setTimeout(() => {
        setStep(4)
        setIsPublishing(false)
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Failed to publish project')
      setIsPublishing(false)
    }
  }

  const toggleCommunity = (communityId: string) => {
    setSelectedCommunityIds(prev =>
      prev.includes(communityId)
        ? prev.filter(id => id !== communityId)
        : [...prev, communityId]
    )
  }

  const handleCreatePosts = async () => {
    if (!projectId) return
    
    setIsPosting(true)
    try {
      await dispatch(createCommunityPosts({
        community_ids: selectedCommunityIds,
        content: postContent,
        linked_project_id: projectId,
        post_type: 'LinkedProject'
      })).unwrap()
      
      setStep(6)
      setIsPosting(false)
    } catch (err: any) {
      setError(err.message || 'Failed to create posts')
      setIsPosting(false)
    }
  }

  // Show loading state
  if (isLoading || projectLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }
  
  // Show project not found state
  if (!currentProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Project not found</p>
          <button 
            onClick={() => router.push('/dashboard/user')} 
            className="text-blue-600 hover:underline"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  // Step 1: Draft Saved
  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Draft Saved Successfully!</h2>
            <p className="text-sm text-gray-600">Your research project has been saved as a draft</p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-6 border border-blue-100">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">{currentProject.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">{currentProject.abstract}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                    Draft
                  </span>
                  <span className="text-xs text-gray-500">{currentProject.research_type}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span>Files uploaded successfully</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-emerald-600" />
              </div>
              <span>Metadata saved</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Eye className="w-3 h-3 text-blue-600" />
              </div>
              <span>Ready for review</span>
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm flex items-center justify-center gap-2"
          >
            <span>Review Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Step 2: Preview
  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-purple-50/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview Your Project
                </h2>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  Step 2 of 5
                </span>
              </div>
              <p className="text-blue-100 text-sm">Review your project before publishing</p>
            </div>

            <div className="p-6 space-y-6">
              {currentProject.cover_image_url && (
                <div className="rounded-xl overflow-hidden">
                  <img src={currentProject.cover_image_url} alt="Cover" className="w-full h-48 object-cover" />
                </div>
              )}

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentProject.title}</h1>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                    {currentProject.research_type}
                  </span>
                  {currentProject.field_of_study && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {currentProject.field_of_study}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                    {currentProject.visibility}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Abstract
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">{currentProject.abstract}</p>
              </div>

              {currentProject.tags && currentProject.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {currentProject.tags.map((tag: any, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                        #{tag.name || tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-emerald-600" />
                  Attached Files
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900 flex-1">Main Project File</span>
                    <span className="text-xs text-gray-500">PDF</span>
                  </div>
                  {currentProject.files && currentProject.files.length > 0 && (
                    <div className="text-xs text-gray-600 px-3">
                      + {currentProject.files.length} additional file(s)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {error && (
              <div className="px-6 pb-4">
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              </div>
            )}

            <div className="p-6 bg-gray-50 border-t flex items-center justify-between gap-3">
              <button
                onClick={() => router.push(`/dashboard/user/research/upload?edit=${projectId}`)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-white transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {isPublishing ? 'Publishing...' : 'Publish Project'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Publishing
  if (isPublishing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50/20 to-teal-50/20 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full animate-ping opacity-20"></div>
            <div className="relative w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Publishing Your Project...</h2>
          <p className="text-sm text-gray-600">This will only take a moment</p>
        </div>
      </div>
    )
  }

  // Step 4: Community Suggestions
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/20 to-pink-50/20 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Share with Communities
                </h2>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  Step 4 of 5
                </span>
              </div>
              <p className="text-purple-100 text-sm">Select communities to share your research</p>
            </div>

            <div className="p-6">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-emerald-900 text-sm mb-1">
                      Project Published Successfully!
                    </h3>
                    <p className="text-xs text-emerald-700">
                      "{currentProject.title}" is now live and visible to the community
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Recommended Communities
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    Based on your research tags and field
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {communities.map((community) => {
                    const isSelected = selectedCommunityIds.includes(community.id)
                    return (
                      <button
                        key={community.id}
                        onClick={() => toggleCommunity(community.id)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500'
                            : 'border-gray-300 bg-white'
                        }`}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>

                        <div className="pr-8">
                          <h4 className="font-semibold text-gray-900 text-sm mb-1">{community.name}</h4>
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{community.description}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                              {community.member_count} members
                            </span>
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                              {community.category}
                            </span>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {selectedCommunityIds.length > 0 && (
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                    <Check className="w-4 h-4" />
                    {selectedCommunityIds.length} {selectedCommunityIds.length === 1 ? 'community' : 'communities'} selected
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t flex items-center justify-between gap-3">
              <button
                onClick={() => setStep(6)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Skip for now
              </button>
              <button
                onClick={() => selectedCommunityIds.length > 0 ? setStep(5) : null}
                disabled={selectedCommunityIds.length === 0}
                className={`px-6 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                  selectedCommunityIds.length > 0
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 5: Create Post
  if (step === 5) {
    const selectedCommunities = communities.filter(c => selectedCommunityIds.includes(c.id))

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-cyan-50/20 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Create Announcement Post
                </h2>
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                  Step 5 of 5
                </span>
              </div>
              <p className="text-blue-100 text-sm">Share your project with the communities</p>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Posting to {selectedCommunities.length} {selectedCommunities.length === 1 ? 'community' : 'communities'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCommunities.map((community) => (
                    <span key={community.id} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                      {community.name}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your Announcement
                </label>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  placeholder="Write something about your research..."
                />
                <p className="text-xs text-gray-500 mt-2">
                  {postContent.length} characters
                </p>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Linked Project:</p>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{currentProject.title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{currentProject.research_type} • {currentProject.field_of_study || 'Research'}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-2">Tips for a great post</h4>
                    <ul className="text-xs text-blue-700 space-y-1">
                      <li>• Highlight key findings or contributions</li>
                      <li>• Mention potential applications</li>
                      <li>• Invite feedback and collaboration</li>
                    </ul>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 border-t flex items-center justify-between gap-3">
              <button
                onClick={() => setStep(6)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Skip posting
              </button>
              <button
                onClick={handleCreatePosts}
                disabled={isPosting || !postContent.trim()}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center gap-2 disabled:opacity-50"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Post to Communities</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 6: Completion
  if (step === 6) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-3">All Done! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Your research project has been published and shared with the community
          </p>

          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 mb-8 border border-emerald-200">
            <h3 className="font-semibold text-emerald-900 text-sm mb-3">What's Next?</h3>
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-3 text-sm text-emerald-800">
                <div className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-700" />
                </div>
                <span>Your project is now visible to all researchers</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-800">
                <div className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-700" />
                </div>
                <span>Community members can comment and collaborate</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-emerald-800">
                <div className="w-5 h-5 bg-emerald-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-emerald-700" />
                </div>
                <span>You'll receive notifications on engagement</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push(`/dashboard/user/research/${projectId}`)}
              className="flex-1 py-3 border-2 border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4" />
              View Project
            </button>
            <button
              onClick={() => router.push('/dashboard/user')}
              className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold text-sm flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}