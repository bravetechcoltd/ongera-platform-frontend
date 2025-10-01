"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateProfile } from "@/lib/features/auth/auth-slice"
import { fetchUserProfile } from "@/lib/features/auth/profileSlice"
import {
  Users, Calendar, Search,
  X, Loader2, Save, ArrowLeft, User, GraduationCap,
  Target, Globe, Plus, Building2, MapPin, Award,
  Linkedin, BookOpen, CheckCircle, Camera,
  FileText, Mail, Phone, Briefcase, Heart, ArrowRight, Check, Sparkles
} from "lucide-react"

interface UserProfile {
  institution_name?: string
  department?: string
  academic_level?: string
  research_interests?: string[]
  orcid_id?: string
  google_scholar_url?: string
  linkedin_url?: string
  website_url?: string
  cv_file_url?: string
  current_position?: string
  home_institution?: string
  willing_to_mentor?: boolean
  bio?: string
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

// Compact Onboarding Modal Component
function OnboardingModal({ isOpen, onClose, onComplete }: {
  isOpen: boolean
  onClose: () => void
  onComplete: (options: string[]) => void
}) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])

  const options = [
    {
      id: 'project',
      icon: FileText,
      title: 'Upload Research Project',
      description: 'Share your work',
      color: 'from-[#0158B7] to-[#5E96D2]'
    },
    {
      id: 'communities',
      icon: Users,
      title: 'Join Communities',
      description: 'Connect with researchers',
      color: 'from-[#0158B7] to-[#5E96D2]'
    },
    {
      id: 'events',
      icon: Calendar,
      title: 'Browse Events',
      description: 'Discover conferences',
      color: 'from-[#0158B7] to-[#5E96D2]'
    },
    {
      id: 'explore',
      icon: Search,
      title: 'Explore Researchers',
      description: 'Find collaborators',
      color: 'from-[#0158B7] to-[#5E96D2]'
    }
  ]

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    )
  }

  const handleContinue = () => {
    if (selectedOptions.length > 0) {
      onComplete(selectedOptions)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">

        {/* Compact Header */}
        <div className="relative bg-gradient-to-r from-[#0158B7] to-[#5E96D2] px-4 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Welcome!</h2>
                <p className="text-[#5E96D2] text-xs">What's next?</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Compact Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Choose your next steps
            </h3>
            <p className="text-xs text-gray-500">
              Select options to personalize your experience
            </p>
          </div>

          {/* Compact Options Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {options.map((option) => {
              const Icon = option.icon
              const isSelected = selectedOptions.includes(option.id)

              return (
                <button
                  key={option.id}
                  onClick={() => toggleOption(option.id)}
                  className={`relative p-3 rounded-lg border transition-all duration-200 text-left group min-h-[80px] ${
                    isSelected
                      ? 'border-[#0158B7] bg-[#0158B7]/10 shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {/* Selection indicator */}
                  <div className={`absolute top-2 right-2 w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-[#0158B7] bg-[#0158B7]'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>

                  {/* Compact Icon */}
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br ${option.color} mb-2`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>

                  {/* Compact Text */}
                  <h4 className="font-medium text-gray-900 text-xs leading-tight mb-1 pr-5">
                    {option.title}
                  </h4>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    {option.description}
                  </p>
                </button>
              )
            })}
          </div>

          {/* Selected count indicator */}
          {selectedOptions.length > 0 && (
            <div className="mb-4 text-center">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                {selectedOptions.length} selected
              </span>
            </div>
          )}
        </div>

        {/* Compact Actions */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Skip
            </button>

            <button
              onClick={handleContinue}
              disabled={selectedOptions.length === 0}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                selectedOptions.length > 0
                  ? 'bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white hover:shadow-md'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EnhancedProfileEdit() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state: any) => state.auth)
  const { profile: profileData, isLoading: profileLoading } = useAppSelector((state: any) => state.profile)

  const [newInterest, setNewInterest] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isInitialized, setIsInitialized] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [localLoading, setLocalLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    email: '',
    bio: '',
    city: '',
    country: '',
    profile: {
      institution_name: '',
      department: '',
      academic_level: 'Undergraduate',
      research_interests: [] as string[],
      orcid_id: '',
      google_scholar_url: '',
      linkedin_url: '',
      website_url: '',
      cv_file_url: '',
      current_position: '',
      home_institution: '',
      willing_to_mentor: false
    }
  })

  useEffect(() => {
    if (user) {
      setLocalLoading(true)
      dispatch(fetchUserProfile())
        .unwrap()
        .finally(() => setLocalLoading(false))
    }
  }, [dispatch, user])

  useEffect(() => {
    if (profileData && !profileLoading && !isInitialized) {
      const currentUser = profileData as User
      const currentProfile = currentUser.profile || {}
      
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        phone_number: currentUser.phone_number || '',
        email: currentUser.email || '',
        bio: currentUser.bio || currentProfile.bio || '',
        city: currentUser.city || '',
        country: currentUser.country || '',
        profile: {
          institution_name: currentProfile.institution_name || '',
          department: currentProfile.department || '',
          academic_level: currentProfile.academic_level || 'Undergraduate',
          research_interests: currentProfile.research_interests || [],
          orcid_id: currentProfile.orcid_id || '',
          google_scholar_url: currentProfile.google_scholar_url || '',
          linkedin_url: currentProfile.linkedin_url || '',
          website_url: currentProfile.website_url || '',
          cv_file_url: currentProfile.cv_file_url || '',
          current_position: currentProfile.current_position || '',
          home_institution: currentProfile.home_institution || '',
          willing_to_mentor: currentProfile.willing_to_mentor || false
        }
      })

      setImagePreview(currentUser.profile_picture_url || '')
      setIsInitialized(true)
    }
  }, [profileData, profileLoading, isInitialized])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setProfileImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      if (name.includes('profile.')) {
        const profileField = name.split('.')[1]
        setFormData({
          ...formData,
          profile: { ...formData.profile, [profileField]: checked }
        })
      }
    } else if (name.includes('profile.')) {
      const profileField = name.split('.')[1]
      setFormData({
        ...formData,
        profile: { ...formData.profile, [profileField]: value }
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const addInterest = () => {
    if (newInterest.trim() && !formData.profile.research_interests.includes(newInterest.trim())) {
      setFormData({
        ...formData,
        profile: {
          ...formData.profile,
          research_interests: [...formData.profile.research_interests, newInterest.trim()]
        }
      })
      setNewInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setFormData({
      ...formData,
      profile: {
        ...formData.profile,
        research_interests: formData.profile.research_interests.filter(i => i !== interest)
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const submitData = new FormData()

      if (profileImage) {
        submitData.append('profile_picture', profileImage)
      }

      Object.keys(formData).forEach(key => {
        if (key === 'profile') {
          submitData.append('profile', JSON.stringify(formData.profile))
        } else {
          submitData.append(key, formData[key as keyof typeof formData] as string)
        }
      })

      await dispatch(updateProfile(submitData)).unwrap()

      // Silent refetch to update form data without showing loading
      dispatch(fetchUserProfile())

      setShowOnboarding(true)
      setIsSubmitting(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setIsSubmitting(false)
    }
  }

  const handleOnboardingComplete = (selectedOptions: string[]) => {
    // Map options to routes
    const optionRoutes: Record<string, string> = {
      project: '/dashboard/user/research/upload',
      communities: '/dashboard/user/communities',
      events: '/dashboard/user/events',
      explore: '/dashboard/user/researchers'
    }

    // Navigate to first selected option
    const firstRoute = optionRoutes[selectedOptions[0]]
    router.push(firstRoute || '/dashboard/user')
  }

  const handleOnboardingSkip = () => {
    setShowOnboarding(false)
    router.push('/dashboard/user')
  }

  if (!user || profileLoading || !isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0158B7] mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  const currentUser = user as User

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center"

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-sm text-gray-600 hover:text-[#0158B7] transition-colors font-semibold group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </button>
            <span className="text-xs font-medium text-[#0158B7] bg-[#0158B7]/10 px-3 py-1 rounded-full">
              {currentUser.account_type}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Profile Picture Section */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Camera className="w-4 h-4 mr-2 text-[#0158B7]" />
                Profile Picture
              </h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white text-xl font-bold">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span>{formData.first_name?.[0]}{formData.last_name?.[0]}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-[#0158B7] text-white rounded-full hover:bg-[#0158B7]/80 transition-colors shadow"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Upload Profile Picture</p>
                  <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB</p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <User className="w-4 h-4 mr-2 text-[#0158B7]" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <User className="w-3 h-3 mr-1" />
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <User className="w-3 h-3 mr-1" />
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Mail className="w-3 h-3 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    className={inputClass + " bg-gray-50"}
                    disabled
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Phone className="w-3 h-3 mr-1" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="+250 XXX XXX XXX"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>
                    <BookOpen className="w-3 h-3 mr-1" />
                    Bio <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass}
                    placeholder="Share your research journey, interests, and professional background..."
                    required
                  />
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <GraduationCap className="w-4 h-4 mr-2 text-[#5E96D2]" />
                Academic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <Building2 className="w-3 h-3 mr-1" />
                    Institution <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="profile.institution_name"
                    value={formData.profile.institution_name}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Building2 className="w-3 h-3 mr-1" />
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="profile.department"
                    value={formData.profile.department}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                {currentUser.account_type === 'Student' && (
                  <div>
                    <label className={labelClass}>
                      <GraduationCap className="w-3 h-3 mr-1" />
                      Academic Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="profile.academic_level"
                      value={formData.profile.academic_level}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="Undergraduate">Undergraduate</option>
                      <option value="Masters">Masters</option>
                      <option value="PhD">PhD</option>
                    </select>
                  </div>
                )}
                {(currentUser.account_type === 'Researcher' || currentUser.account_type === 'Diaspora') && (
                  <div>
                    <label className={labelClass}>
                      <Briefcase className="w-3 h-3 mr-1" />
                      Current Position
                    </label>
                    <input
                      type="text"
                      name="profile.current_position"
                      value={formData.profile.current_position}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g., Senior Researcher, Professor"
                    />
                  </div>
                )}
                {currentUser.account_type === 'Diaspora' && (
                  <div>
                    <label className={labelClass}>
                      <Building2 className="w-3 h-3 mr-1" />
                      Home Institution (in Rwanda)
                    </label>
                    <input
                      type="text"
                      name="profile.home_institution"
                      value={formData.profile.home_institution}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Your affiliated institution in Rwanda"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Research Interests */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Target className="w-4 h-4 mr-2 text-[#0158B7]" />
                Research Interests <span className="text-red-500">*</span>
              </h2>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInterest()
                      }
                    }}
                    className={inputClass + " flex-1"}
                    placeholder="Enter research interest and press Enter..."
                  />
                  <button
                    type="button"
                    onClick={addInterest}
                    className="px-3 py-2 bg-[#0158B7] text-white text-sm rounded-lg hover:bg-[#0158B7]/80 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.profile.research_interests.map((interest, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-[#0158B7]/10 text-[#0158B7] rounded-lg text-xs font-semibold flex items-center space-x-1.5 border border-[#0158B7]/20"
                    >
                      <span>{interest}</span>
                      <button
                        type="button"
                        onClick={() => removeInterest(interest)}
                        className="hover:text-[#0158B7]/80"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Professional Links */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <Globe className="w-4 h-4 mr-2 text-[#5E96D2]" />
                Professional Links
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <Award className="w-3 h-3 mr-1" />
                    ORCID iD
                  </label>
                  <input
                    type="text"
                    name="profile.orcid_id"
                    value={formData.profile.orcid_id}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="0000-0000-0000-0000"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <BookOpen className="w-3 h-3 mr-1" />
                    Google Scholar
                  </label>
                  <input
                    type="url"
                    name="profile.google_scholar_url"
                    value={formData.profile.google_scholar_url}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://scholar.google.com/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Linkedin className="w-3 h-3 mr-1" />
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="profile.linkedin_url"
                    value={formData.profile.linkedin_url}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <Globe className="w-3 h-3 mr-1" />
                    Website
                  </label>
                  <input
                    type="url"
                    name="profile.website_url"
                    value={formData.profile.website_url}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="https://yourwebsite.com"
                  />
                </div>
                {(currentUser.account_type === 'Researcher' || currentUser.account_type === 'Diaspora') && (
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <FileText className="w-3 h-3 mr-1" />
                      CV/Resume URL
                    </label>
                    <input
                      type="url"
                      name="profile.cv_file_url"
                      value={formData.profile.cv_file_url}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-[#0158B7]" />
                Location {currentUser.account_type === 'Diaspora' && <span className="text-red-500 ml-1">*</span>}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <MapPin className="w-3 h-3 mr-1" />
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter your city"
                    required={currentUser.account_type === 'Diaspora'}
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    <MapPin className="w-3 h-3 mr-1" />
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter your country"
                    required={currentUser.account_type === 'Diaspora'}
                  />
                </div>
              </div>
            </div>

            {/* Mentorship (Diaspora only) */}
            {currentUser.account_type === 'Diaspora' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-[#0158B7]" />
                  Mentorship
                </h2>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="profile.willing_to_mentor"
                    checked={formData.profile.willing_to_mentor}
                    onChange={handleChange}
                    className="w-5 h-5 text-[#0158B7] rounded focus:ring-[#0158B7]"
                  />
                  <span className="text-sm text-gray-700">
                    I'm willing to mentor researchers and students
                  </span>
                </label>
              </div>
            )}

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <CheckCircle className="w-4 h-4 text-[#0158B7]" />
                  <span>All changes will be saved</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 text-sm bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-1.5 font-medium min-w-[140px] justify-center"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save & Continue</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Compact Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={handleOnboardingSkip}
        onComplete={handleOnboardingComplete}
      />
    </>
  )
}