"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, Plus, Eye, Heart, MessageCircle, MoreVertical } from "lucide-react"
import { BlogStats } from "@/lib/features/auth/dashboardSlices"

interface Blog {
  id: number
  title: string
  excerpt: string
  category: string
  published_date: string
  views_count: number
  likes_count: number
  comments_count: number
  read_time: number
  status: string
  featured_image_url?: string
}

interface BlogSectionProps {
  blogs: BlogStats
}

export default function BlogSection({ blogs }: BlogSectionProps) {
  const router = useRouter()
  const [blogPosts, setBlogPosts] = useState<Blog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch actual blog posts from API
    const fetchBlogs = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch('/api/blogs?limit=2&status=published')
        const data = await response.json()
        
        if (data.success && data.data) {
          setBlogPosts(data.data.blogs || [])
        }
      } catch (error) {
        console.error('Failed to fetch blogs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (blogs.total > 0) {
      fetchBlogs()
    } else {
      setIsLoading(false)
    }
  }, [blogs.total])

  if (blogs.total === 0) {
    return null
  }

  const handleCreateBlog = () => {
    router.push('/dashboard/user/blogs/create')
  }

  const handleViewBlog = (blogId: number) => {
    router.push(`/dashboard/user/blogs/${blogId}`)
  }

  const categoryColors: { [key: string]: string } = {
    'Research': 'bg-rose-100 text-rose-700',
    'Academic': 'bg-blue-100 text-blue-700',
    'Technology': 'bg-purple-100 text-purple-700',
    'Science': 'bg-emerald-100 text-emerald-700',
    'default': 'bg-gray-100 text-gray-700'
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || categoryColors.default
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-rose-500" />
          My Blog Posts
        </h2>
        <button
          onClick={handleCreateBlog}
          className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium transition-all flex items-center gap-1 shadow-sm hover:shadow-md"
        >
          <Plus className="w-3 h-3" />
          New Post
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-3">
              <div className="h-3 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : blogPosts.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-6 h-6 text-rose-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">No blog posts yet</p>
          <p className="text-xs text-gray-400 mb-3">Share your thoughts with the community</p>
          <button
            onClick={handleCreateBlog}
            className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-all"
          >
            Write First Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blogPosts.map((blog) => (
            <div
              key={blog.id}
              onClick={() => handleViewBlog(blog.id)}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer group"
            >
              {/* Category and Read Time */}
              <div className="flex items-start justify-between mb-2">
                <span className={`px-2 py-0.5 ${getCategoryColor(blog.category)} text-[10px] font-medium rounded`}>
                  {blog.category}
                </span>
                <span className="text-[10px] text-gray-500">{blog.read_time} min read</span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 group-hover:text-rose-600 transition-colors">
                {blog.title}
              </h3>

              {/* Excerpt */}
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {blog.excerpt}
              </p>

              {/* Stats Row */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">
                  {new Date(blog.published_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {blog.views_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3" />
                    {blog.likes_count}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    {blog.comments_count}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="mt-2 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  blog.status === 'published' ? 'bg-green-500' : 
                  blog.status === 'draft' ? 'bg-yellow-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-xs text-gray-500 capitalize">{blog.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View All Link */}
      {blogPosts.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => router.push('/dashboard/user/blogs')}
            className="text-sm font-medium text-rose-600 hover:text-rose-700 flex items-center justify-center gap-2 transition-colors w-full"
          >
            View All {blogs.total} Blog Posts
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}