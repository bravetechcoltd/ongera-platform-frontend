// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import {
  fetchCommunityById,
  leaveCommunity,
  joinCommunity,
  fetchCommunityPosts,
  createCommunityPost,
  fetchCommunityJoinRequests
} from "@/lib/features/auth/communitiesSlice"
import CommunityChatModal from '@/components/CommunityChat/CommunityChatModal'
import { fetchCommunityEvents } from "@/lib/features/auth/eventsSlice"
import { fetchQAThreads } from "@/lib/features/auth/qaSlice"
import { fetchCommunityProjects } from "@/lib/features/auth/projectSlice"
import { fetchCommunityBlogs } from "@/lib/features/auth/blogSlices"
import QAThreadCard from "@/components/qa/QAThreadCard"
import Link from 'next/link'
import AskQuestionModal from "@/components/qa/AskQuestionModal"
import CreateEventModal from "@/components/event/CreateEventModal"
import CreateProjectModal from "@/components/communities/CreateProjectModal"
import CreateBlogModal from "@/components/blog/CreateBlogModal"
import { fetchBestPerformersCommunity } from "@/lib/features/auth/monthlyStarSlice";
import CommunityMonthlyStars from "@/components/monthly-star/CommunityMonthlyStars";
import MonthlyStarsDetailsModal from "@/components/monthly-star/MonthlyStarsDetailsModal";
import {
  Users, Calendar, Briefcase, TrendingUp, Settings,
  Plus, Share2, UserPlus, Search, MessageSquare,
  Heart, Bookmark, MoreHorizontal, ChevronDown,
  FileText, Clock, MessageCircle, Bell,
  ArrowLeft, Loader2, Globe, Lock, Building2, X, Send,
  HelpCircle, MapPin, Video,
  ImageIcon, Eye, ChevronRight, Shield,
  UserCheck,
  GraduationCap
} from "lucide-react"

interface CommunityMember {
  id: string
  first_name: string
  last_name: string
  account_type: string
  profile_picture_url?: string
}

interface CommunityPost {
  id: string
  title?: string
  content: string
  post_type: string
  author: CommunityMember
  created_at: string
  is_pinned: boolean
  media_urls?: string[]
  linked_project?: any
  view_count: number
}

interface CommunityEvent {
  id: string
  title: string
  description: string
  start_datetime: string
  end_datetime: string
  event_mode: string
  location_address?: string
  online_meeting_url?: string
  cover_image_url?: string
  status: string
  is_free: boolean
  price_amount?: number
  attendees?: any[]
}

interface CommunityProject {
  id: string
  title: string
  abstract: string
  research_type: string
  field_of_study?: string
  cover_image_url?: string
  academic_level?: string
  author: CommunityMember
  view_count: number
  tags?: any[]
}

interface CommunityBlog {
  id: string
  title: string
  excerpt: string
  category: string
  cover_image_url?: string
  author: CommunityMember
  view_count: number
  reading_time_minutes: number
}

interface Community {
  id: string
  name: string
  description: string
  community_type: string
  category: string
  cover_image_url?: string
  creator: CommunityMember
  members: CommunityMember[]
  member_count: number
  post_count: number
  join_approval_required: boolean
}

const POST_TYPES = [
  { value: "all", label: "All", icon: MessageSquare, color: "gray" },
  { value: "Discussion", label: "Discussions", icon: MessageCircle, color: "blue" },
  { value: "Question", label: "Questions", icon: MessageSquare, color: "purple" },
  { value: "LinkedProject", label: "Projects", icon: Briefcase, color: "green" },
  { value: "Announcement", label: "Announcements", icon: Bell, color: "red" },
  { value: "Resource", label: "Resources", icon: FileText, color: "orange" }
]

const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Popular" },
  { value: "trending", label: "Trending" }
]

export default function CommunityDashboard() {
  const params = useParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: any) => state.auth)

  const [activeTab, setActiveTab] = useState("feed")
  const [selectedPostType, setSelectedPostType] = useState("all")
  const [sortBy, setSortBy] = useState("latest")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAbout, setShowAbout] = useState(false)
  const [showNewPost, setShowNewPost] = useState(false)
  const [qaThreads, setQaThreads] = useState<any[]>([])
  const [qaLoading, setQaLoading] = useState(false)
  const [showAskQuestionModal, setShowAskQuestionModal] = useState(false)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [showCreateBlogModal, setShowCreateBlogModal] = useState(false)
  const [communityBlogs, setCommunityBlogs] = useState<CommunityBlog[]>([])
  const [blogsLoading, setBlogsLoading] = useState(false)
  const { currentCommunity, communityPosts, postsLoading, isLoading, isSubmitting, error, joinRequests } = useAppSelector((state: any) => state.communities)
  const [monthlyStarsData, setMonthlyStarsData] = useState<any>(null);
  const [monthlyStarsLoading, setMonthlyStarsLoading] = useState(false);
  const [showMonthlyStarsModal, setShowMonthlyStarsModal] = useState(false);
  const pendingRequestsCount = joinRequests?.length || 0
  const [academicLevelFilter, setAcademicLevelFilter] = useState<string>("all")
  // Project state variables
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false)
  const [communityProjects, setCommunityProjects] = useState<CommunityProject[]>([])
  const [projectsLoading, setProjectsLoading] = useState(false)

  // New Post Form State
  const [newPostType, setNewPostType] = useState("Discussion")
  const [newPostTitle, setNewPostTitle] = useState("")
  const [newPostContent, setNewPostContent] = useState("")
  const [newPostImage, setNewPostImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCreatingPost, setIsCreatingPost] = useState(false)

  // Track if data has been loaded
  const [dataLoaded, setDataLoaded] = useState({
    posts: false,
    events: false,
    qa: false,
    projects: false,
    blogs: false
  })

  // View More states
  const [projectsToShow, setProjectsToShow] = useState(5)
  const [blogsToShow, setBlogsToShow] = useState(5)
  const [eventsToShow, setEventsToShow] = useState(5)
  const [sidebarProjectsToShow, setSidebarProjectsToShow] = useState(3)
  const [sidebarBlogsToShow, setSidebarBlogsToShow] = useState(3)
  const [sidebarEventsToShow, setSidebarEventsToShow] = useState(3)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const { communityEvents, isLoading: eventsLoading } = useAppSelector((state: any) => state.events)
  const communityId = params.id as string

  const ACADEMIC_LEVELS = [
    { value: "all", label: "All Levels" },
    { value: "Undergraduate", label: "Undergraduate" },
    { value: "Masters", label: "Masters" },
    { value: "PhD", label: "PhD" },
    { value: "Researcher", label: "Researcher" },
    { value: "Diaspora", label: "Diaspora" },
    { value: "Institution", label: "Institution" }
  ]
  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityById(communityId))

      // Fetch all data on initial load
      const fetchAllData = async () => {
        try {
          await dispatch(fetchCommunityPosts({ communityId })).unwrap()
          setDataLoaded(prev => ({ ...prev, posts: true }))

          await dispatch(fetchCommunityEvents({ communityId })).unwrap()
          setDataLoaded(prev => ({ ...prev, events: true }))

          setQaLoading(true)
          const qaData = await dispatch(fetchQAThreads({ community_id: communityId, limit: 10 })).unwrap()
          setQaThreads(qaData.threads || [])
          setDataLoaded(prev => ({ ...prev, qa: true }))
          setQaLoading(false)

          setProjectsLoading(true)
          const projectsData = await dispatch(fetchCommunityProjects({ communityId })).unwrap()
          setCommunityProjects(projectsData.projects || [])
          setDataLoaded(prev => ({ ...prev, projects: true }))
          setProjectsLoading(false)

          setBlogsLoading(true)
          const blogsData = await dispatch(fetchCommunityBlogs({ communityId })).unwrap()
          setCommunityBlogs(blogsData.blogs || [])
          setDataLoaded(prev => ({ ...prev, blogs: true }))
          setBlogsLoading(false)
          // Add this inside the fetchAllData function in your useEffect
          setMonthlyStarsLoading(true);
          try {
            const starsData = await dispatch(fetchBestPerformersCommunity(communityId)).unwrap();
            setMonthlyStarsData(starsData);
          } catch (err) {
            console.error("Failed to fetch monthly stars:", err);
          } finally {
            setMonthlyStarsLoading(false);
          }
          // NEW: Fetch join requests if user is creator
          if (user?.id && currentCommunity?.creator?.id === user.id) {
            await dispatch(fetchCommunityJoinRequests(communityId))
          }
        } catch (err) {
          console.error("Failed to fetch community data:", err)
          setQaLoading(false)
          setProjectsLoading(false)
          setBlogsLoading(false)
        }
      }

      fetchAllData()
    }
  }, [communityId, dispatch, user?.id, currentCommunity?.creator?.id])
  useEffect(() => {
    if (communityId && selectedPostType !== "all" && dataLoaded.posts) {
      dispatch(fetchCommunityPosts({
        communityId,
        post_type: selectedPostType
      }))
    } else if (communityId && selectedPostType === "all" && dataLoaded.posts) {
      dispatch(fetchCommunityPosts({ communityId }))
    }
  }, [selectedPostType, communityId, dispatch, dataLoaded.posts])

  // View More handlers
  const handleViewMoreProjects = () => {
    setProjectsToShow(prev => prev + 5)
  }

  const handleViewMoreBlogs = () => {
    setBlogsToShow(prev => prev + 5)
  }

  const handleViewMoreEvents = () => {
    setEventsToShow(prev => prev + 5)
  }

  const handleViewMoreSidebarProjects = () => {
    setSidebarProjectsToShow(prev => prev + 3)
  }

  const handleViewMoreSidebarBlogs = () => {
    setSidebarBlogsToShow(prev => prev + 3)
  }

  const handleViewMoreSidebarEvents = () => {
    setSidebarEventsToShow(prev => prev + 3)
  }

  // Reset view more counts when tab changes
  useEffect(() => {
    setProjectsToShow(5)
    setBlogsToShow(5)
    setEventsToShow(5)
  }, [activeTab])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewPostImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const filteredProjects = academicLevelFilter === "all"
    ? communityProjects
    : communityProjects.filter(project => {
      const projectAcademicLevel = project.academic_level ||
        (project.author?.account_type === 'Student' ? 'Student' : project.author?.account_type);

      if (academicLevelFilter === "Researcher" ||
        academicLevelFilter === "Diaspora" ||
        academicLevelFilter === "Institution") {
        return projectAcademicLevel === academicLevelFilter;
      }

      return projectAcademicLevel === academicLevelFilter;
    })

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert("Please enter post content")
      return
    }

    setIsCreatingPost(true)

    try {
      const formData = new FormData()
      formData.append("content", newPostContent)
      formData.append("post_type", newPostType)
      if (newPostTitle.trim()) {
        formData.append("title", newPostTitle)
      }
      if (newPostImage) {
        formData.append("post_image", newPostImage)
      }

      await dispatch(createCommunityPost({
        communityId,
        postData: formData
      })).unwrap()

      // Reset form and close modal
      setNewPostTitle("")
      setNewPostContent("")
      setNewPostImage(null)
      setImagePreview(null)
      setNewPostType("Discussion")
      setShowNewPost(false)

      // Refresh posts after creation
      dispatch(fetchCommunityPosts({ communityId }))
    } catch (error: any) {
      alert(error || "Failed to create post")
    } finally {
      setIsCreatingPost(false)
    }
  }

  // Refresh functions - only called after creating new content
  const refreshQAThreads = async () => {
    setQaLoading(true)
    try {
      const qaData = await dispatch(fetchQAThreads({ community_id: communityId, limit: 10 })).unwrap()
      setQaThreads(qaData.threads || [])
    } catch (err) {
      console.error("Failed to refresh QA threads:", err)
    } finally {
      setQaLoading(false)
    }
  }

  const refreshProjects = async () => {
    setProjectsLoading(true)
    try {
      const projectsData = await dispatch(fetchCommunityProjects({ communityId })).unwrap()
      setCommunityProjects(projectsData.projects || [])
    } catch (err) {
      console.error("Failed to refresh projects:", err)
    } finally {
      setProjectsLoading(false)
    }
  }

  const refreshBlogs = async () => {
    setBlogsLoading(true)
    try {
      const blogsData = await dispatch(fetchCommunityBlogs({ communityId })).unwrap()
      setCommunityBlogs(blogsData.blogs || [])
    } catch (err) {
      console.error("Failed to refresh blogs:", err)
    } finally {
      setBlogsLoading(false)
    }
  }

  const refreshEvents = async () => {
    try {
      await dispatch(fetchCommunityEvents({ communityId })).unwrap()
    } catch (err) {
      console.error("Failed to refresh events:", err)
    }
  }

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

  if (isLoading || !currentCommunity) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#0158B7] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading community...</p>
        </div>
      </div>
    )
  }

  const community = currentCommunity as Community
  const isMember = community.members?.some(m => m.id === user?.id) || community.creator.id === user?.id
  const isCreator = community.creator.id === user?.id

  const handleJoinLeave = async () => {
    if (isMember) {
      await dispatch(leaveCommunity(communityId))
    } else {
      await dispatch(joinCommunity(communityId))
    }
    dispatch(fetchCommunityById(communityId))
  }

  const getCommunityTypeIcon = () => {
    switch (community.community_type) {
      case "Public": return <Globe className="w-4 h-4" />
      case "Private": return <Lock className="w-4 h-4" />
      case "Institution-Specific": return <Building2 className="w-4 h-4" />
      default: return <Globe className="w-4 h-4" />
    }
  }

  const getPostTypeColor = (type: string) => {
    const postType = POST_TYPES.find(t => t.value === type)
    return postType?.color || "gray"
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

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }

  const mockOnlineMembers = [
    { id: "1", name: "Sarah J." },
    { id: "2", name: "John D." },
    { id: "3", name: "Marie C." },
    { id: "4", name: "David S." },
    { id: "5", name: "Emma K." }
  ]

  const mockTags = ["AI", "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Research", "Data Science", "Rwanda"]

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 overflow-hidden">
      {/* LEFT SIDEBAR */}
      {isCreator && (
        <div
          className=" flex flex-row w-full items-center justify-center gap-2 pt-1 pb-2 text-white rounded-xl font-semibold "

        >
          <Link
            href={`/dashboard/user/communities/dashboard/${communityId}/resources`}
            className="flex flex-row  bg-gradient-to-r from-purple-600 to-indigo-600 items-center justify-center gap-2 px-4 py-2.5 text-white rounded-xl font-semibold "
          >
            <Shield className="w-4 h-4" />
            Manage Resources
          </Link>
        </div>

      )}
      {isCreator && (
        <div className="fixed top-20 right-10 z-50">
          <Link
            href={`/dashboard/user/communities/join-requests/${communityId}`}
            className="relative flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <UserCheck className="w-5 h-5" />
            <span className="hidden sm:inline">Approve Member Requests</span>
            <span className="sm:hidden">Requests</span>
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-2 -right-2 flex items-center justify-center w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
                {pendingRequestsCount}
              </span>
            )}
          </Link>
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
          <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-6">


            <div className="hidden lg:block lg:col-span-3 h-full overflow-hidden">
              <div
                className="h-full overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {community.cover_image_url ? (
                    <div className="h-32 relative">
                      <img
                        src={community.cover_image_url}
                        alt="Cover"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-32 bg-[#0158B7]" />
                  )}

                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{community.name}</h2>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {getCommunityTypeIcon()}
                        {community.community_type}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 line-clamp-1">
                        {community.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {community.member_count}
                      </span>
                      {isCreator && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Creator
                        </span>
                      )}
                      {isMember && !isCreator && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                          Member
                        </span>
                      )}
                    </div>

                    {/* Navigation Tabs */}
                    <div className="space-y-1 mb-4">
                      {[
                        { id: "feed", label: "Feed", icon: MessageSquare, badge: community.post_count },
                        { id: "projects", label: "Projects", icon: Briefcase, badge: communityProjects.length },
                        { id: "blogs", label: "Blogs", icon: FileText, badge: communityBlogs.length },
                        { id: "qa", label: "Q&A", icon: HelpCircle, badge: qaThreads.length },
                        { id: "events", label: "Events", icon: Calendar, badge: (communityEvents as CommunityEvent[])?.length || 0 },
                        { id: "members", label: "Members", icon: Users, badge: community.member_count }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                            ? "bg-[#0158B7]/10 text-[#0158B7] shadow-sm"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          <span className="flex items-center gap-2">
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                          </span>
                          {tab.badge !== null && (
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs font-semibold">
                              {tab.badge}
                            </span>
                          )}
                        </button>
                      ))}
                      {isCreator && (
                        <button
                          onClick={() => setActiveTab("settings")}
                          className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === "settings"
                            ? "bg-[#0158B7]/10 text-[#0158B7] shadow-sm"
                            : "text-gray-600 hover:bg-gray-50"
                            }`}
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                      )}
                    </div>

                    {/* Quick Actions */}
                    <div className="space-y-2">
                      {isMember ? (
                        <>
                          <button
                            onClick={() => setShowNewPost(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                          >
                            <Plus className="w-4 h-4" />
                            Create Post
                          </button>
                          <button
                            onClick={() => setShowCreateProjectModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-all"
                          >
                            <Briefcase className="w-4 h-4" />
                            Share Project
                          </button>
                          <button
                            onClick={() => setShowCreateBlogModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-all"
                          >
                            <FileText className="w-4 h-4" />
                            Write Blog
                          </button>

                          <button
                            onClick={handleJoinLeave}
                            disabled={isSubmitting}
                            className="w-full px-4 py-2 text-sm text-gray-600 hover:text-red-600 transition-colors font-medium disabled:opacity-50"
                          >
                            {isSubmitting ? "Leaving..." : "Leave Community"}
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={handleJoinLeave}
                          disabled={isSubmitting}
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          <UserPlus className="w-5 h-5" />
                          {isSubmitting ? "Joining..." : "Join Community"}
                        </button>
                      )}
                    </div>
                    <div className="mb-4">
                      <CommunityMonthlyStars
                        topPerformers={monthlyStarsData?.topPerformers || []}
                        month={monthlyStarsData?.month || ""}
                        year={monthlyStarsData?.year || new Date().getFullYear()}
                        communityName={community.name}
                        isLoading={monthlyStarsLoading}
                        onViewDetails={() => setShowMonthlyStarsModal(true)}
                      />
                    </div>
                    {/* About Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => setShowAbout(!showAbout)}
                        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-2"
                      >
                        <span>About</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${showAbout ? 'rotate-180' : ''}`} />
                      </button>
                      {showAbout && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {community.description}
                          </p>
                          <div className="text-xs text-gray-500 space-y-1">
                            <p>Created by {community.creator.first_name} {community.creator.last_name}</p>
                            <p>Category: {community.category}</p>
                            {community.join_approval_required && (
                              <p className="text-orange-600">⚠️ Join approval required</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>


                  </div>
                </div>
              </div>
            </div>

            {/* MAIN FEED */}
            <div className="lg:col-span-6 h-full overflow-hidden flex flex-col">
              {/* Feed Header */}
              {activeTab === "feed" && (
                <div className="flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {POST_TYPES.map(type => {
                      const Icon = type.icon
                      return (
                        <button
                          key={type.value}
                          onClick={() => setSelectedPostType(type.value)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedPostType === type.value
                            ? "bg-[#0158B7]/10 text-[#0158B7] border border-[#0158B7]/20 shadow-sm"
                            : "text-gray-600 hover:bg-gray-50 border border-transparent"
                            }`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="hidden sm:inline">{type.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search posts..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0158B7] focus:border-transparent"
                      />
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0158B7] bg-white"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Posts Feed */}
              <div
                className="flex-1 min-h-0 overflow-y-auto pr-2"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >

                {activeTab === "qa" ? (
                  <div>
                    {!isMember ? (
                      <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
                        <Lock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Join to View Q&A</h3>
                        <p className="text-gray-600 mb-4">Become a member to participate in community discussions.</p>
                        <button
                          onClick={handleJoinLeave}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          <UserPlus className="w-5 h-5" />
                          {isSubmitting ? "Joining..." : "Join Community"}
                        </button>
                      </div>
                    ) : qaLoading && !dataLoaded.qa ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                      </div>
                    ) : qaThreads.length === 0 ? (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                        <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No questions yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to ask a question in this community!</p>
                        <button
                          onClick={() => setShowAskQuestionModal(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl hover:bg-[#0158B7]/90 transition-colors font-semibold"
                        >
                          <Plus className="w-5 h-5 text-white" />
                          Ask Question
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900">Recent Questions</h3>
                          <button
                            onClick={() => setShowAskQuestionModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/90 transition-colors font-semibold text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Ask Question
                          </button>
                        </div>
                        {qaThreads.map((thread) => (
                          <QAThreadCard key={thread.id} thread={thread} />
                        ))}
                        <div className="text-center pt-4">
                          <Link
                            href={`/dashboard/user/qa?community_id=${communityId}`}
                            className="text-[#0158B7] hover:text-[#5E96D2] font-semibold text-sm"
                          >
                            View all questions in this community →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeTab === "events" ? (
                  <div>
                    {!isMember ? (
                      <div className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-8 text-center">
                        <Lock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Join to View Events</h3>
                        <p className="text-gray-600 mb-4">Become a member to see community events and register.</p>
                        <button
                          onClick={handleJoinLeave}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          <UserPlus className="w-5 h-5" />
                          {isSubmitting ? "Joining..." : "Join Community"}
                        </button>
                      </div>
                    ) : eventsLoading && !dataLoaded.events ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
                      </div>
                    ) : !communityEvents || (communityEvents as CommunityEvent[]).length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No events yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to create an event for this community!</p>
                        <button
                          onClick={() => setShowCreateEventModal(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          <Plus className="w-5 h-5" />
                          Create Event
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Community Events</h3>
                          <button
                            onClick={() => setShowCreateEventModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/90 transition-colors font-semibold text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Create Event
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {(communityEvents as CommunityEvent[]).slice(0, eventsToShow).map((event) => (
                            <div
                              key={event.id}
                              onClick={() => router.push(`/dashboard/user/event/${event.id}`)}
                              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            >
                              {event.cover_image_url ? (
                                <div className="h-40 relative">
                                  <img src={event.cover_image_url} alt={event.title} className="w-full h-full object-cover" />
                                  <div className="absolute top-2 right-2 px-3 py-1 bg-[#0158B7] text-white rounded-full text-xs font-semibold">
                                    {event.status}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-40 bg-gradient-to-br from-[#0158B7]/10 to-[#5E96D2]/10 flex items-center justify-center">
                                  <Calendar className="w-12 h-12 text-[#0158B7]" />
                                </div>
                              )}
                              <div className="p-4">
                                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{event.title}</h4>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{event.description}</p>

                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar className="w-4 h-4 text-[#0158B7]" />
                                    <span>{formatEventDate(event.start_datetime)}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-gray-700">
                                    <Clock className="w-4 h-4 text-[#0158B7]" />
                                    <span>{formatEventTime(event.start_datetime)} - {formatEventTime(event.end_datetime)}</span>
                                  </div>
                                  {event.event_mode === 'Online' && event.online_meeting_url && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <Video className="w-4 h-4 text-[#0158B7]" />
                                      <span>Online Event</span>
                                    </div>
                                  )}
                                  {event.event_mode === 'Physical' && event.location_address && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <MapPin className="w-4 h-4 text-[#0158B7]" />
                                      <span className="line-clamp-1">{event.location_address}</span>
                                    </div>
                                  )}
                                  {event.event_mode === 'Hybrid' && (
                                    <div className="flex items-center gap-2 text-gray-700">
                                      <Video className="w-4 h-4 text-[#0158B7]" />
                                      <MapPin className="w-4 h-4 text-[#0158B7]" />
                                      <span>Hybrid Event</span>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{event.attendees?.length || 0} attending</span>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${event.is_free ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                    }`}>
                                    {event.is_free ? 'Free' : `${event.price_amount}`}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View More Button for Events */}
                        {(communityEvents as CommunityEvent[]).length > eventsToShow && (
                          <div className="flex justify-center mt-6">
                            <button
                              onClick={handleViewMoreEvents}
                              className="flex items-center gap-2 px-6 py-3 bg-[#0158B7]/10 text-[#0158B7] rounded-xl font-semibold hover:bg-[#0158B7]/20 transition-all"
                            >
                              View More Events
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : activeTab === "projects" ? (
                  <div>
                    {!isMember ? (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-8 text-center">
                        <Lock className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Join to View Projects</h3>
                        <p className="text-gray-600 mb-4">Become a member to see community research projects.</p>
                        <button
                          onClick={handleJoinLeave}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          <UserPlus className="w-5 h-5" />
                          {isSubmitting ? "Joining..." : "Join Community"}
                        </button>
                      </div>
                    ) : projectsLoading && !dataLoaded.projects ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
                      </div>
                    ) : communityProjects.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No projects yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to share research in this community!</p>
                        <button
                          onClick={() => setShowCreateProjectModal(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          <Plus className="w-5 h-5" />
                          Create Project Research
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                          <div className="flex items-center gap-3 flex-1">
                            <h3 className="text-xl font-bold text-gray-900">Community Projects</h3>
                            <span className="px-2.5 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-bold">
                              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Academic Level Filter Dropdown */}
                            <div className="relative">
                              <select
                                value={academicLevelFilter}
                                onChange={(e) => setAcademicLevelFilter(e.target.value)}
                                className="pl-3 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] bg-white hover:border-[#0158B7] transition-all appearance-none cursor-pointer font-medium"
                                style={{ minWidth: '160px' }}
                              >
                                {ACADEMIC_LEVELS.map(level => (
                                  <option key={level.value} value={level.value}>
                                    {level.label}
                                  </option>
                                ))}
                              </select>
                              <GraduationCap className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>

                            <button
                              onClick={() => setShowCreateProjectModal(true)}
                              className="flex items-center gap-2 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/90 transition-colors font-semibold text-sm"
                            >
                              <Plus className="w-4 h-4" />
                              Create Project
                            </button>
                          </div>
                        </div>

                        {/* Show filter active indicator */}
                        {academicLevelFilter !== "all" && (
                          <div className="flex items-center gap-2 px-3 py-2 bg-[#0158B7]/10 border border-[#0158B7]/20 rounded-lg">
                            <GraduationCap className="w-4 h-4 text-[#0158B7]" />
                            <span className="text-sm text-[#0158B7] font-medium">
                              Filtered by: {ACADEMIC_LEVELS.find(l => l.value === academicLevelFilter)?.label}
                            </span>
                            <button
                              onClick={() => setAcademicLevelFilter("all")}
                              className="ml-auto text-[#0158B7] hover:text-[#0158B7]/80"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )}

                        {filteredProjects.length === 0 ? (
                          <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-8 text-center">
                            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-600 mb-2">No projects found for this academic level</p>
                            <button
                              onClick={() => setAcademicLevelFilter("all")}
                              className="text-sm text-[#0158B7] hover:text-[#0158B7]/80 font-medium"
                            >
                              Clear filter
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {filteredProjects.slice(0, projectsToShow).map((project) => (
                              <div
                                key={project.id}
                                // ADD THIS onClick HANDLER
                                onClick={() => router.push(`/dashboard/user/research/${project.id}?from=community&communityId=${communityId}&communityName=${encodeURIComponent(community.name)}`)}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer" // Added cursor-pointer
                              >
                                {project.cover_image_url ? (
                                  <div className="h-40 relative">
                                    <img src={project.cover_image_url} alt={project.title} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 right-2 px-3 py-1 bg-[#0158B7] text-white rounded-full text-xs font-semibold">
                                      {project.research_type}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-40 bg-gradient-to-br from-[#0158B7]/10 to-[#5E96D2]/10 flex items-center justify-center">
                                    <Briefcase className="w-12 h-12 text-[#0158B7]" />
                                  </div>
                                )}
                                <div className="p-4">
                                  <h4 className="font-bold text-gray-900 mb-2 line-clamp-2">{project.title}</h4>
                                  <div
                                    className="rich-text-content text-gray-700 text-sm"
                                    dangerouslySetInnerHTML={{
                                      __html: cleanHtml(
                                        project.abstract.length > 100
                                          ? project.abstract.slice(0, 100) + "..."
                                          : project.abstract
                                      ),
                                    }}
                                    style={{ lineHeight: "1.5" }}
                                  />

                                  {project.field_of_study && (
                                    <div className="mb-3">
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                        {project.field_of_study}
                                      </span>
                                    </div>
                                  )}

                                  {project.tags && project.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-3">
                                      {project.tags.slice(0, 3).map((tag, idx) => (
                                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                          #{typeof tag === 'string' ? tag : tag.name}
                                        </span>
                                      ))}
                                      {project.tags.length > 3 && (
                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                                          +{project.tags.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  {user && project.author?.id !== user.id && (
                                    <div className="mb-3">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          router.push(`/dashboard/user/research/${project.id}?from=community&communityId=${communityId}&communityName=${encodeURIComponent(community.name)}`);
                                        }}
                                        className="w-full py-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-semibold flex items-center justify-center gap-2"
                                      >
                                        <UserPlus className="w-4 h-4" />
                                        Explore & Contribute
                                      </button>
                                    </div>
                                  )}

                                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-[#0158B7] flex items-center justify-center text-white text-xs font-bold">
                                        {project.author?.first_name?.[0] || 'U'}
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-xs text-gray-600">
                                          {project.author?.first_name} {project.author?.last_name}
                                        </span>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-semibold">
                                          <GraduationCap className="w-3 h-3" />
                                          {project.academic_level ||
                                            (project.author?.account_type === 'Student' ? 'Student' :
                                              project.author?.account_type || 'User')}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                      <span className="flex items-center gap-1">
                                        <Eye className="w-3 h-3" />
                                        {project.view_count || 0}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {filteredProjects.length > projectsToShow && (
                          <div className="flex justify-center mt-6">
                            <button
                              onClick={handleViewMoreProjects}
                              className="flex items-center gap-2 px-6 py-3 bg-[#0158B7]/10 text-[#0158B7] rounded-xl font-semibold hover:bg-[#0158B7]/20 transition-all"
                            >
                              View More Projects
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                ) : activeTab === "blogs" ? (
                  <div>
                    {!isMember ? (
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-8 text-center">
                        <Lock className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Join to View Blogs</h3>
                        <p className="text-gray-600 mb-4">Become a member to read community blog posts.</p>
                        <button
                          onClick={handleJoinLeave}
                          disabled={isSubmitting}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                        >
                          <UserPlus className="w-5 h-5" />
                          {isSubmitting ? "Joining..." : "Join Community"}
                        </button>
                      </div>
                    ) : blogsLoading && !dataLoaded.blogs ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                      </div>
                    ) : communityBlogs.length === 0 ? (
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No blogs yet</h3>
                        <p className="text-gray-600 mb-4">Be the first to share your insights in this community!</p>
                        <button
                          onClick={() => setShowCreateBlogModal(true)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                          <Plus className="w-5 h-5" />
                          Write Blog Post
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Community Blogs</h3>
                          <button
                            onClick={() => setShowCreateBlogModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#0158B7]/90 transition-colors font-semibold text-sm"
                          >
                            <Plus className="w-4 h-4" />
                            Write Blog
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                          {communityBlogs.slice(0, blogsToShow).map((blog) => (
                            <div
                              key={blog.id}
                              onClick={() => router.push(`/dashboard/user/blog/${blog.id}`)}
                              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
                            >
                              {blog.cover_image_url ? (
                                <div className="h-40 relative overflow-hidden">
                                  <img
                                    src={blog.cover_image_url}
                                    alt={blog.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  />
                                  <div className="absolute top-2 right-2 px-3 py-1 bg-[#0158B7] text-white rounded-full text-xs font-semibold">
                                    {blog.category}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-40 bg-gradient-to-br from-[#0158B7]/10 to-[#5E96D2]/10 flex items-center justify-center relative">
                                  <FileText className="w-12 h-12 text-[#0158B7]" />
                                  <div className="absolute top-2 right-2 px-3 py-1 bg-[#0158B7] text-white rounded-full text-xs font-semibold">
                                    {blog.category}
                                  </div>
                                </div>
                              )}

                              <div className="p-4">
                                <h4 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#0158B7] transition-colors">
                                  {blog.title}
                                </h4>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{blog.excerpt}</p>

                                <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                                  <div className="flex items-center gap-2">
                                    {blog.author?.profile_picture_url ? (
                                      <img
                                        src={blog.author.profile_picture_url}
                                        alt={blog.author.first_name}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-6 h-6 rounded-full bg-[#0158B7] flex items-center justify-center text-white text-xs font-bold">
                                        {blog.author?.first_name?.[0] || 'U'}
                                      </div>
                                    )}
                                    <span className="text-xs text-gray-600">
                                      {blog.author?.first_name} {blog.author?.last_name}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span className="flex items-center gap-1">
                                      <Eye className="w-3 h-3" />
                                      {blog.view_count || 0}
                                    </span>
                                    {blog.reading_time_minutes > 0 && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {blog.reading_time_minutes} min
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* View More Button for Blogs */}
                        {communityBlogs.length > blogsToShow && (
                          <div className="flex justify-center mt-6">
                            <button
                              onClick={handleViewMoreBlogs}
                              className="flex items-center gap-2 px-6 py-3 bg-[#0158B7]/10 text-[#0158B7] rounded-xl font-semibold hover:bg-[#0158B7]/20 transition-all"
                            >
                              View More Blogs
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : !isMember ? (
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 text-center">
                    <Lock className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Join to View Posts</h3>
                    <p className="text-gray-600 mb-4">Become a member to see all community content and participate in discussions.</p>
                    <button
                      onClick={handleJoinLeave}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <UserPlus className="w-5 h-5" />
                      {isSubmitting ? "Joining..." : "Join Community"}
                    </button>
                  </div>
                ) : postsLoading && !dataLoaded.posts ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
                  </div>
                ) : (communityPosts as CommunityPost[]).length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-600 mb-4">Be the first to start a discussion in this community!</p>
                    <button
                      onClick={() => setShowNewPost(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Create Post
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 pb-4">
                    {(communityPosts as CommunityPost[]).map(post => (
                      <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                        {post.is_pinned && (
                          <div className="mb-3 flex items-center gap-2 text-sm text-orange-600 font-semibold">
                            <Bell className="w-4 h-4" />
                            Pinned Post
                          </div>
                        )}
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-[#0158B7] flex items-center justify-center text-white font-bold flex-shrink-0">
                            {post.author?.first_name?.[0] || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-gray-900 truncate">
                                {post.author?.first_name} {post.author?.last_name}
                              </span>
                              <span className="px-2 py-0.5 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-semibold flex-shrink-0">
                                {post.author?.account_type || 'Member'}
                              </span>
                              <span className="text-gray-500 text-sm flex-shrink-0">• {formatDate(post.created_at)}</span>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-${getPostTypeColor(post.post_type)}-50 text-${getPostTypeColor(post.post_type)}-700`}>
                              {POST_TYPES.find(t => t.value === post.post_type)?.label || post.post_type}
                            </span>
                          </div>
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                            <MoreHorizontal className="w-5 h-5 text-gray-500" />
                          </button>
                        </div>
                        <div className="mb-4">
                          {post.title && (
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                          )}
                          {/* Apply cleanHtml to post content */}
                          <div
                            className="rich-text-content text-gray-700 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: cleanHtml(

                                post.content.length > 100
                                  ? post.content.slice(0, 100) + "..."
                                  : post.content
                              ),
                            }}

                            style={{
                              lineHeight: "1.5",
                            }}
                          />
                          {post.media_urls && post.media_urls.length > 0 && (
                            <div className="mt-3 rounded-xl overflow-hidden">
                              <img
                                src={post.media_urls[0]}
                                alt="Post media"
                                className="w-full h-auto max-h-96 object-cover"
                              />
                            </div>
                          )}
                          {post.linked_project && (
                            <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                              <div className="flex items-center gap-2 text-green-700">
                                <Briefcase className="w-5 h-5" />
                                <span className="font-semibold">Linked Project:</span>
                                <span>{post.linked_project.title}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <button className="flex items-center gap-1 hover:text-[#0158B7] transition-colors">
                              <MessageCircle className="w-4 h-4" />
                              <span>{post.view_count || 0}</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                              <Heart className="w-4 h-4" />
                              <span>0</span>
                            </button>
                            <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                              <Bookmark className="w-4 h-4" />
                            </button>
                          </div>
                          <button className="flex items-center gap-1 text-sm text-gray-600 hover:text-[#0158B7] transition-colors">
                            <Share2 className="w-4 h-4" />
                            Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="hidden lg:block lg:col-span-3 h-full overflow-hidden">
              <div
                className="h-full overflow-y-auto pr-2 space-y-4"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db transparent'
                }}
              >

                {/* Online Members */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => setIsChatOpen(true)}
                      className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-full shadow-2xl hover:shadow-3xl transition-all hover:scale-110"
                      title="Open Community Chat"
                    >
                      <MessageSquare className="w-6 h-6" />
                    </button>
                    <h3 className="font-bold text-gray-900">Online Now</h3>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  </div>
                  <div className="space-y-3">
                    {mockOnlineMembers.slice(0, 5).map(member => (
                      <div key={member.id} className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-[#0158B7] flex items-center justify-center text-white font-bold">
                            {member.name[0]}
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{member.name}</span>
                      </div>
                    ))}
                    <button className="text-sm text-[#0158B7] hover:text-[#5E96D2] font-medium">
                      View all members →
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-[#0158B7]" />
                      Recent Projects
                    </h3>
                    {communityProjects.length > 0 && (
                      <span className="px-2 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-bold">
                        {communityProjects.length}
                      </span>
                    )}
                  </div>

                  {projectsLoading && !dataLoaded.projects ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
                    </div>
                  ) : communityProjects.length === 0 ? (
                    <div className="text-center py-6">
                      <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No projects yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {communityProjects.slice(0, sidebarProjectsToShow).map((project) => (
                        <div
                          key={project.id}
                          onClick={() => router.push(`/dashboard/user/research/${project.id}?from=community&communityId=${communityId}&communityName=${encodeURIComponent(community.name)}`)}
                          className="p-3 bg-gray-50 hover:bg-[#0158B7]/5 border border-gray-200 hover:border-[#0158B7]/30 rounded-xl cursor-pointer transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            {project.cover_image_url ? (
                              <img
                                src={project.cover_image_url}
                                alt={project.title}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#0158B7]/10 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="w-6 h-6 text-[#0158B7]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#0158B7] transition-colors">
                                {project.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{project.research_type}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Eye className="w-3 h-3" />
                                  {project.view_count || 0}
                                </span>
                              </div>

                              {/* ✅ NEW: Explore & Contribute Button for Sidebar - Only show if user is not the author */}
                              {user && project.author?.id !== user.id && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/dashboard/user/research/${project.id}?from=community&communityId=${communityId}&communityName=${encodeURIComponent(community.name)}`);
                                  }}
                                  className="mt-2 w-full py-1.5 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all flex items-center justify-center gap-1"
                                >
                                  <UserPlus className="w-3 h-3" />
                                  Explore & Contribute
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Rest of the sidebar code remains the same */}
                      {communityProjects.length > sidebarProjectsToShow && (
                        <button
                          onClick={handleViewMoreSidebarProjects}
                          className="w-full py-2 px-4 bg-[#0158B7]/10 hover:bg-[#0158B7]/20 text-[#0158B7] rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          View More ({communityProjects.length - sidebarProjectsToShow} more)
                        </button>
                      )}
                      {sidebarProjectsToShow > 3 && (
                        <button
                          onClick={() => setActiveTab("projects")}
                          className="w-full py-2 px-4 bg-[#0158B7] text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 hover:bg-[#0158B7]/90"
                        >
                          View All Projects
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Recent Blogs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#0158B7]" />
                      Recent Blogs
                    </h3>
                    {communityBlogs.length > 0 && (
                      <span className="px-2 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-bold">
                        {communityBlogs.length}
                      </span>
                    )}
                  </div>

                  {blogsLoading && !dataLoaded.blogs ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
                    </div>
                  ) : communityBlogs.length === 0 ? (
                    <div className="text-center py-6">
                      <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No blogs yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {communityBlogs.slice(0, sidebarBlogsToShow).map((blog) => (
                        <div
                          key={blog.id}
                          onClick={() => router.push(`/dashboard/user/blog/${blog.id}`)}
                          className="p-3 bg-gray-50 hover:bg-[#0158B7]/5 border border-gray-200 hover:border-[#0158B7]/30 rounded-xl cursor-pointer transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            {blog.cover_image_url ? (
                              <img
                                src={blog.cover_image_url}
                                alt={blog.title}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#0158B7]/10 flex items-center justify-center flex-shrink-0">
                                <FileText className="w-6 h-6 text-[#0158B7]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#0158B7] transition-colors">
                                {blog.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{blog.category}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Eye className="w-3 h-3" />
                                  {blog.view_count || 0}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {communityBlogs.length > sidebarBlogsToShow && (
                        <button
                          onClick={handleViewMoreSidebarBlogs}
                          className="w-full py-2 px-4 bg-[#0158B7]/10 hover:bg-[#0158B7]/20 text-[#0158B7] rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          View More ({communityBlogs.length - sidebarBlogsToShow} more)
                        </button>
                      )}
                      {sidebarBlogsToShow > 3 && (
                        <button
                          onClick={() => setActiveTab("blogs")}
                          className="w-full py-2 px-4 bg-[#0158B7] text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 hover:bg-[#0158B7]/90"
                        >
                          View All Blogs
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Upcoming Events */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[#0158B7]" />
                      Upcoming Events
                    </h3>
                    {communityEvents && (communityEvents as CommunityEvent[]).length > 0 && (
                      <span className="px-2 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-bold">
                        {(communityEvents as CommunityEvent[]).length}
                      </span>
                    )}
                  </div>

                  {eventsLoading && !dataLoaded.events ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
                    </div>
                  ) : !communityEvents || (communityEvents as CommunityEvent[]).length === 0 ? (
                    <div className="text-center py-6">
                      <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No events scheduled</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {(communityEvents as CommunityEvent[]).slice(0, sidebarEventsToShow).map((event) => (
                        <div
                          key={event.id}
                          onClick={() => router.push(`/dashboard/user/event/${event.id}`)}
                          className="p-3 bg-gray-50 hover:bg-[#0158B7]/5 border border-gray-200 hover:border-[#0158B7]/30 rounded-xl cursor-pointer transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            {event.cover_image_url ? (
                              <img
                                src={event.cover_image_url}
                                alt={event.title}
                                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-[#0158B7]/10 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-6 h-6 text-[#0158B7]" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-[#0158B7] transition-colors">
                                {event.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{formatEventDate(event.start_datetime)}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${event.status === 'Upcoming' ? 'bg-[#0158B7]/10 text-[#0158B7]' :
                                  event.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                  {event.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {(communityEvents as CommunityEvent[]).length > sidebarEventsToShow && (
                        <button
                          onClick={handleViewMoreSidebarEvents}
                          className="w-full py-2 px-4 bg-[#0158B7]/10 hover:bg-[#0158B7]/20 text-[#0158B7] rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                        >
                          View More ({(communityEvents as CommunityEvent[]).length - sidebarEventsToShow} more)
                        </button>
                      )}
                      {sidebarEventsToShow > 3 && (
                        <button
                          onClick={() => setActiveTab("events")}
                          className="w-full py-2 px-4 bg-[#0158B7] text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 hover:bg-[#0158B7]/90"
                        >
                          View All Events
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Community Stats */}
                <div className="bg-gradient-to-br from-[#0158B7]/5 to-[#5E96D2]/5 border border-[#0158B7]/20 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#0158B7]" />
                    Stats Overview
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-white rounded-xl">
                      <p className="text-2xl font-bold text-[#0158B7]">{community.member_count}</p>
                      <p className="text-xs text-gray-600">Members</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-xl">
                      <p className="text-2xl font-bold text-[#0158B7]">{community.post_count}</p>
                      <p className="text-xs text-gray-600">Posts</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-xl">
                      <p className="text-2xl font-bold text-[#0158B7]">{communityProjects.length}</p>
                      <p className="text-xs text-gray-600">Projects</p>
                    </div>
                    <div className="text-center p-3 bg-white rounded-xl">
                      <p className="text-2xl font-bold text-[#0158B7]">{communityBlogs.length}</p>
                      <p className="text-xs text-gray-600">Blogs</p>
                    </div>
                  </div>
                </div>

                {/* Popular Tags */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Popular Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {mockTags.map(tag => (
                      <button
                        key={tag}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-[#0158B7]/10 border border-gray-200 hover:border-[#0158B7]/30 rounded-full text-xs font-medium text-gray-700 hover:text-[#0158B7] transition-all"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900">Create Community Post</h3>
              <button
                onClick={() => {
                  setShowNewPost(false)
                  setNewPostTitle("")
                  setNewPostContent("")
                  setNewPostImage(null)
                  setImagePreview(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Post Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POST_TYPES.filter(t => t.value !== "all").map(type => {
                    const Icon = type.icon
                    return (
                      <button
                        key={type.value}
                        onClick={() => setNewPostType(type.value)}
                        className={`flex flex-col items-center gap-2 p-3 border-2 rounded-xl transition-all ${newPostType === type.value
                          ? "border-[#0158B7] bg-[#0158B7]/10 shadow-sm"
                          : "border-gray-200 hover:border-[#0158B7] hover:shadow-sm"
                          }`}
                      >
                        <Icon className={`w-6 h-6 ${newPostType === type.value ? "text-[#0158B7]" : "text-gray-600"}`} />
                        <span className={`text-xs font-medium ${newPostType === type.value ? "text-[#0158B7]" : "text-gray-700"}`}>
                          {type.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Give your post a title..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Content <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={6}
                  placeholder="Share your thoughts, questions, or resources..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Image <span className="text-gray-500 font-normal">(Optional)</span>
                </label>

                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setNewPostImage(null)
                        setImagePreview(null)
                      }}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0158B7] transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload an image</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                  </label>
                )}
              </div>
            </div>

            <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-2xl">
              <button
                onClick={() => {
                  setShowNewPost(false)
                  setNewPostTitle("")
                  setNewPostContent("")
                  setNewPostImage(null)
                  setImagePreview(null)
                }}
                className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:border-gray-400 transition-all"
                disabled={isCreatingPost}
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePost}
                disabled={isCreatingPost || !newPostContent.trim()}
                className="flex items-center gap-2 px-6 py-2 bg-[#0158B7] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingPost ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        *::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        
        *::-webkit-scrollbar-thumb {
          background: #d1d5db;
          border-radius: 3px;
        }
        
        *::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }

        * {
          scroll-behavior: smooth;
        }
      `}</style>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={showAskQuestionModal}
        onClose={() => setShowAskQuestionModal(false)}
        communityId={communityId}
        currentCommunity={currentCommunity}
        onSuccess={(threadId) => {
          refreshQAThreads()
        }}
      />

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateEventModal}
        onClose={() => setShowCreateEventModal(false)}
        communityId={communityId}
        communityName={community.name}
      />

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={showCreateProjectModal}
        onClose={() => setShowCreateProjectModal(false)}
        communityId={communityId}
        communityName={community.name}
        onSuccess={(projectId) => {
          refreshProjects()
        }}
      />

      {/* Create Blog Modal */}
      <CreateBlogModal
        isOpen={showCreateBlogModal}
        onClose={() => setShowCreateBlogModal(false)}
        communityId={communityId}
        communityName={community.name}
        onSuccess={(blogId) => {
          refreshBlogs()
        }}
      />

      {isChatOpen && (
        <CommunityChatModal
          communityId={communityId}
          communityName={community.name}
          communityAvatar={community.cover_image_url}
          onClose={() => setIsChatOpen(false)}
        />
      )}

      {/* Monthly Stars Details Modal */}
      {showMonthlyStarsModal && monthlyStarsData && (
        <MonthlyStarsDetailsModal
          isOpen={showMonthlyStarsModal}
          onClose={() => setShowMonthlyStarsModal(false)}
          topPerformers={monthlyStarsData.topPerformers || []}
          month={monthlyStarsData.month}
          year={monthlyStarsData.year}
          communityName={monthlyStarsData.community?.name || community.name}
        />
      )}
    </div>
  )
}