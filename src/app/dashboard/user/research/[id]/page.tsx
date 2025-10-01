"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { fetchProjectById, likeProject, commentOnProject } from '@/lib/features/auth/projectSlice';
import {
  Eye, Download, Calendar, User, Tag, FileText, Globe, Users,
  Share2, BookOpen, ArrowLeft, Building, MapPin, Link2,
  ExternalLink, Clock, BarChart3, Heart, MessageCircle,
  Bookmark, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import Link from 'next/link'

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const projectId = params.id as string;

  const { currentProject, isLoading, error, isSubmitting } = useAppSelector((state) => state.projects);
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'author'>('overview');
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [collapsedSections, setCollapsedSections] = useState({
    interests: true,
    tags: false
  });

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM dd, yyyy');
    } catch {
      return dateString;
    }
  };
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

  const handleDownload = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLike = async () => {
    if (!user) {
      alert('Please login to like this project');
      return;
    }
    await dispatch(likeProject(projectId));
  };

  const handleComment = async () => {
    if (!user) {
      alert('Please login to comment');
      return;
    }
    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }
    await dispatch(commentOnProject({ projectId, content: newComment }));
    setNewComment('');
  };

  const toggleSection = (section: 'interests' | 'tags') => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !currentProject || !currentProject.project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Project Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || "The project you're looking for doesn't exist or may have been removed."}
          </p>
          <button
            onClick={() => router.push('/dashboard/user/research')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const { project, hasLiked, comments } = currentProject;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <button
              onClick={() => router.push('/dashboard/user/research')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back To Research Projects</span>
            </button>

            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        {/* Compressed Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
          {project.cover_image_url && (
            <div className="h-48 md:h-56 overflow-hidden">
              <img
                src={project.cover_image_url}
                alt={project.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-4 md:p-6">
            {/* Horizontal Author Mini-Card */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <img
                src={project.author.profile_picture_url}
                alt={project.author.first_name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm truncate">
                  {project.author.first_name} {project.author.last_name}
                </h3>
                <p className="text-xs text-gray-500 truncate">{project.author.profile.institution_name}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <BarChart3 className="w-3 h-3" />
                <span>{project.author.profile.total_projects_count}</span>
              </div>
            </div>

            {/* Consolidated Badges on Single Line */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${project.status === 'Published'
                  ? 'bg-green-100 text-green-800'
                  : project.status === 'Draft'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                {project.status}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                {project.research_type}
              </span>
              <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                {project.field_of_study}
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold">
                {project.visibility}
              </span>
            </div>

            {/* Smaller Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 tracking-tight leading-tight">
              {project.title}
            </h1>

            {/* Compact Abstract */}

            <div
              className="rich-text-content text-gray-700 text-sm"
              dangerouslySetInnerHTML={{ __html: cleanHtml(project.abstract) }}
              style={{
                lineHeight: "1.5",
              }}
            />
            {/* Compressed Stats - Inline Format */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 mb-4">
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                <span>{project.view_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                <span>{project.download_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart className={`w-3 h-3 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{project.like_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                <span>{project.comment_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className="text-xs">{formatDate(project.publication_date)}</span>
              </div>
            </div>

            {/* Smaller Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleDownload(project.project_file_url, 'main-project-file.pdf')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </button>

              <button
                onClick={handleLike}
                disabled={isSubmitting}
                className={`p-2 border rounded-lg transition-colors ${hasLiked
                    ? 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={() => setShowComments(!showComments)}
                className="p-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid - Adjusted to 5 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6">
          {/* Sticky Compact Sidebar */}
          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-16 self-start">
            {/* Project Details Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Details
              </h3>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-medium text-gray-500 block mb-1">DOI:</span>
                  <a href={`https://doi.org/${project.doi}`} className="text-blue-600 hover:underline flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    <span className="truncate">{project.doi}</span>
                  </a>
                </div>

                <div>
                  <span className="font-medium text-gray-500 block mb-1">Status:</span>
                  <p className={`px-2 py-0.5 rounded-full text-xs font-medium inline-block ${project.collaboration_status === 'Seeking Collaborators'
                      ? 'bg-orange-100 text-orange-800'
                      : project.collaboration_status === 'Collaborative'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                    {project.collaboration_status}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-500 block mb-1">Created:</span>
                  <p className="flex items-center gap-1 text-gray-700">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.created_at)}
                  </p>
                </div>

                <div>
                  <span className="font-medium text-gray-500 block mb-1">Updated:</span>
                  <p className="flex items-center gap-1 text-gray-700">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.updated_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Collapsible Tags Card */}
            {project.tags && project.tags.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <button
                  onClick={() => toggleSection('tags')}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 mb-3"
                >
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-purple-600" />
                    Tags
                  </span>
                  {collapsedSections.tags ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
                {!collapsedSections.tags && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.slice(0, 5).map((tag, index) => (
                      <span
                        key={tag.id || index}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-medium hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        #{tag.name}
                      </span>
                    ))}
                    {project.tags.length > 5 && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                        +{project.tags.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}


          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-4">
            {/* Compact Tab Navigation */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  {[
                    { id: 'overview', label: 'Overview', icon: FileText },
                    { id: 'files', label: 'Files', icon: Download },
                    { id: 'author', label: 'Author', icon: User },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-xs ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="prose max-w-none">
                    <h3 className="text-base font-semibold text-gray-900 mb-3">Project Description</h3>

                    <div
                      className="rich-text-content text-gray-700 text-sm"
                      dangerouslySetInnerHTML={{ __html: cleanHtml(project.full_description) }}
                      style={{
                        lineHeight: "1.5",
                      }}
                    />
                  </div>
                )}

                {/* Files Tab */}
                {activeTab === 'files' && (
                  <div className="space-y-3">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">Project Files</h3>

                    {/* Main Project File */}
                    <div className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all hover:scale-[1.01]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div>
                            <h4 className="font-semibold text-gray-900 text-sm">Main Research Document</h4>
                            <p className="text-xs text-gray-500">PDF Document • {project.project_file_url ? 'Available' : 'Not available'}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownload(project.project_file_url, 'research-document.pdf')}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1"
                          disabled={!project.project_file_url}
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>

                    {/* Additional Files */}
                    {project.files && project.files.length > 0 && (
                      <>
                        <h4 className="font-semibold text-gray-900 mt-4 mb-2 text-sm">Additional Files</h4>
                        <div className="space-y-2">
                          {project.files.map((file) => (
                            <div
                              key={file.id}
                              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all hover:scale-[1.01]"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <h5 className="font-medium text-gray-900 text-sm">{file.file_name}</h5>
                                    <p className="text-xs text-gray-500">
                                      {file.file_type} • {Math.round(parseInt(file.file_size) / 1024)} KB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDownload(file.file_url, file.file_name)}
                                  className="px-2 py-1 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium flex items-center gap-1"
                                >
                                  <Download className="w-3 h-3" />
                                  Get
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Author Tab */}
                {activeTab === 'author' && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <img
                        src={project.author.profile_picture_url}
                        alt={project.author.first_name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {project.author.first_name} {project.author.last_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-3 leading-normal">{project.author.bio}</p>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <Building className="w-3 h-3 text-gray-400" />
                              <span>{project.author.profile.institution_name}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              <span>{project.author.city}, {project.author.country}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <User className="w-3 h-3 text-gray-400" />
                              <span>{project.author.account_type}</span>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <BarChart3 className="w-3 h-3 text-gray-400" />
                              <span>{project.author.profile.total_projects_count} projects</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span>Joined {formatDate(project.author.date_joined)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Social Links */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Connect with Researcher</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.author.profile.google_scholar_url && (
                          <a
                            href={project.author.profile.google_scholar_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Google Scholar
                          </a>
                        )}
                        {project.author.profile.linkedin_url && (
                          <a
                            href={project.author.profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                        {project.author.profile.website_url && (
                          <a
                            href={project.author.profile.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-xs"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Personal Website
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Comments as Compact Card with View Button */}
            {!showComments && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <button
                  onClick={() => setShowComments(true)}
                  className="w-full flex items-center justify-between text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    Comments ({project.comment_count})
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Expanded Comments */}
            {showComments && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-blue-600" />
                    Comments ({project.comment_count})
                  </h3>
                  <button
                    onClick={() => setShowComments(false)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>

                {/* Add Comment */}
                <div className="mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write your comment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={handleComment}
                      disabled={isSubmitting || !newComment.trim()}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1 disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-3">
                  {comments && comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <div className="flex items-start gap-2">
                          <img
                            src={comment.author.profile_picture_url}
                            alt={comment.author.first_name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-gray-500">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 leading-normal">{comment.comment_text}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4 text-sm">No comments yet. Be the first to comment!</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}