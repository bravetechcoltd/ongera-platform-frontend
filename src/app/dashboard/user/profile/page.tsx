"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { fetchUserProfile } from "@/lib/features/auth/profileSlice"
import { 
  Edit, BookOpen, Users, UserPlus, Mail, Building2, 
  GraduationCap, Globe, Linkedin, Award, ExternalLink,
  CheckCircle, Sparkles, Target, TrendingUp, MapPin,
  Calendar, RefreshCw,
  X
} from "lucide-react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface UserProfile {
  institution_name?: string
  department?: string
  academic_level?: string
  research_interests?: string[]
  orcid_id?: string
  google_scholar_url?: string
  linkedin_url?: string
  website_url?: string
  bio?: string
  total_projects_count?: number
  total_followers_count?: number
  total_following_count?: number
}

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  account_type: string
  profile_picture_url?: string
  phone_number?: string
  bio?: string
  city?: string
  country?: string
  date_joined?: string
  profile?: UserProfile
}

export default function ProfilePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { profile, isLoading } = useAppSelector((state) => state.profile)
  const [showSuccess, setShowSuccess] = useState(false)

  // Check for success parameter in URL
  useEffect(() => {
    if (searchParams.get('updated') === 'true') {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Fetch user profile data
  useEffect(() => {
    dispatch(fetchUserProfile())
  }, [dispatch])

  const handleRefresh = () => {
    dispatch(fetchUserProfile())
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0158B7]" />
      </div>
    )
  }

  if (!user) return null

  const currentUser = user as User
  const currentProfile = profile as UserProfile

  const stats = [
    { 
      icon: BookOpen, 
      value: currentProfile?.total_projects_count || 0, 
      label: "Projects", 
      color: "bg-[#0158B7]/20 text-[#0158B7] border-[#0158B7]/30"
    },
    { 
      icon: Users, 
      value: currentProfile?.total_followers_count || 0, 
      label: "Followers", 
      color: "bg-[#5E96D2]/20 text-[#0158B7] border-[#5E96D2]/30"
    },
    { 
      icon: UserPlus, 
      value: currentProfile?.total_following_count || 0, 
      label: "Following", 
      color: "bg-[#0158B7]/15 text-[#0158B7] border-[#0158B7]/20"
    }
  ]

  const professionalLinks = [
    { icon: Award, url: currentUser.profile?.orcid_id || currentProfile?.orcid_id, label: "ORCID", color: "text-orange-600" },
    { icon: Globe, url: currentUser.profile?.google_scholar_url || currentProfile?.google_scholar_url, label: "Scholar", color: "text-[#0158B7]" },
    { icon: Linkedin, url: currentUser.profile?.linkedin_url || currentProfile?.linkedin_url, label: "LinkedIn", color: "text-[#0158B7]" },
    { icon: Globe, url: currentUser.profile?.website_url || currentProfile?.website_url, label: "Website", color: "text-[#5E96D2]" }
  ].filter(link => link.url)

  const getAccountTypeIcon = () => {
    switch(currentUser.account_type) {
      case 'Student': return <GraduationCap className="w-4 h-4" />
      case 'Institution': return <Building2 className="w-4 h-4" />
      case 'Researcher': return <Target className="w-4 h-4" />
      case 'Diaspora': return <Globe className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
      <div className="max-w-6xl mx-auto space-y-3">
        
        {/* Success Message */}
        {showSuccess && (
          <div className="bg-[#0158B7]/10 border border-[#0158B7]/20 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-[#0158B7]" />
              <span className="text-sm font-medium text-[#0158B7]">Profile updated successfully!</span>
            </div>
            <button 
              onClick={() => setShowSuccess(false)}
              className="text-[#0158B7] hover:text-[#0158B7]/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Compact Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">

          <div className="flex items-start justify-between">
            <div className="flex items-end space-x-3">
              <div className="relative">
                <div className="w-16 h-16 bg-white rounded-xl border-2 border-white shadow flex items-center justify-center">
                  {currentUser.profile_picture_url ? (
                    <img 
                      src={currentUser.profile_picture_url} 
                      alt="Profile" 
                      className="w-full h-full rounded-xl object-cover" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-xl flex items-center justify-center text-white text-lg font-bold">
                      {currentUser.first_name?.[0]}{currentUser.last_name?.[0]}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0158B7] rounded-full flex items-center justify-center border-2 border-white">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="pb-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h1 className="text-lg font-bold text-gray-900">
                    {currentUser.first_name} {currentUser.last_name}
                  </h1>
                  <Sparkles className="w-4 h-4 text-[#0158B7]" />
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2 py-0.5 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-semibold">
                    {getAccountTypeIcon()}
                    <span className="ml-1">{currentUser.account_type}</span>
                  </span>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    {currentUser.city && (
                      <span className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {currentUser.city}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Joined {currentUser.date_joined ? new Date(currentUser.date_joined).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 border border-gray-300 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-all"
                title="Refresh profile data"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <Link
                href="/dashboard/user/profile/edit"
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white text-sm rounded-lg hover:shadow-lg transition-all"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </Link>
            </div>
          </div>

          {/* Compact Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {stats.map((stat, idx) => (
              <div 
                key={idx} 
                className={`rounded-lg p-3 border ${stat.color} hover:shadow-sm transition-shadow`}
              >
                <stat.icon className={`w-4 h-4 mb-2`} />
                <p className="text-lg font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          
          {/* Left Column - Personal Info */}
          <div className="lg:col-span-2 space-y-3">
            
            {/* Bio Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-[#0158B7]" />
                About
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentUser.bio || currentUser.profile?.bio || currentProfile?.bio || 'No bio added yet. Share your research journey and interests!'}
              </p>
            </div>

            {/* Academic Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-[#5E96D2]" />
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-gray-500">Institution</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {currentUser.profile?.institution_name || currentProfile?.institution_name || 'Not set'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500">Department</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1">
                      {currentUser.profile?.department || currentProfile?.department || 'Not set'}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {currentUser.account_type === 'Student' && (
                    <div>
                      <label className="text-xs font-medium text-gray-500">Academic Level</label>
                      <p className="text-sm font-semibold text-gray-900 mt-1">
                        {currentUser.profile?.academic_level || currentProfile?.academic_level || 'Not set'}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-medium text-gray-500">Email</label>
                    <p className="text-sm font-semibold text-gray-900 mt-1 flex items-center">
                      <Mail className="w-3 h-3 mr-1 text-gray-400" />
                      {currentUser.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Additional Info */}
          <div className="space-y-3">
            
            {/* Research Interests Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-[#0158B7]" />
                Research Interests
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {((currentUser.profile?.research_interests || currentProfile?.research_interests) || []).length > 0 ? (
                  (currentUser.profile?.research_interests || currentProfile?.research_interests || []).map((interest, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-lg text-xs font-semibold border border-[#0158B7]/20 hover:shadow-sm transition-all"
                    >
                      {interest}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-500 italic">No interests added yet</p>
                )}
              </div>
            </div>

            {/* Professional Links */}
            {professionalLinks.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all">
                <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                  <Globe className="w-4 h-4 mr-2 text-[#5E96D2]" />
                  Professional Links
                </h3>
                <div className="space-y-2">
                  {professionalLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-2 bg-gray-50 hover:bg-[#0158B7]/5 rounded-lg transition-all group border border-transparent hover:border-[#0158B7]/20"
                    >
                      <div className="flex items-center space-x-2">
                        <link.icon className={`w-4 h-4 ${link.color}`} />
                        <span className="text-xs font-semibold text-gray-700 group-hover:text-[#0158B7] transition-colors">
                          {link.label}
                        </span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-[#0158B7] transition-colors" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}