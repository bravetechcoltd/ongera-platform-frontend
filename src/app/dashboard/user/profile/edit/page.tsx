"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { updateProfile } from "@/lib/features/auth/auth-slice"
import { fetchUserProfile } from "@/lib/features/auth/profileSlice"
import {
  Save, ArrowLeft, User, GraduationCap, Target, Globe, Plus,
  Building2, MapPin, Award, Linkedin, BookOpen, CheckCircle,
  Camera, FileText, Mail, Phone, Briefcase, Heart, X, Loader2,
  School, Info
} from "lucide-react"

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
      // Standard fields
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
      willing_to_mentor: false,
      // ✅ NEW: Institution fields
      institution_address: '',
      institution_phone: '',
      institution_type: '',
      institution_website: '',
      institution_description: '',
      institution_departments: [] as string[],
      institution_founded_year: undefined as number | undefined,
      institution_accreditation: ''
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
      const currentUser = profileData as any
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
          willing_to_mentor: currentProfile.willing_to_mentor || false,
          // Institution fields
          institution_address: currentProfile.institution_address || '',
          institution_phone: currentProfile.institution_phone || '',
          institution_type: currentProfile.institution_type || '',
          institution_website: currentProfile.institution_website || '',
          institution_description: currentProfile.institution_description || '',
          institution_departments: currentProfile.institution_departments || [],
          institution_founded_year: currentProfile.institution_founded_year,
          institution_accreditation: currentProfile.institution_accreditation || ''
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
      dispatch(fetchUserProfile())

      router.push('/dashboard/user/profile?updated=true')
      setIsSubmitting(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      setIsSubmitting(false)
    }
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

  const currentUser = user as any
  const isInstitution = currentUser.account_type === 'Institution'

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
      <div className="max-w-7xl mx-auto">

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
              {isInstitution ? 'Institution Logo' : 'Profile Picture'}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white text-xl font-bold">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : isInstitution ? (
                    <Building2 className="w-10 h-10" />
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
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {isInstitution ? 'Upload Institution Logo' : 'Upload Profile Picture'}
                </p>
                <p className="text-xs text-gray-500">JPG, PNG or GIF. Max size 5MB</p>
              </div>
            </div>
          </div>

          {/* ✅ CONDITIONAL FORM SECTIONS BASED ON ACCOUNT TYPE */}
          
          {isInstitution ? (
            // ==================== INSTITUTION PROFILE FORM ====================
            <>
              {/* Basic Institution Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-[#0158B7]" />
                  Institution Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <Building2 className="w-3 h-3 mr-1" />
                      Institution Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Official institution name"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <MapPin className="w-3 h-3 mr-1" />
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="profile.institution_address"
                      value={formData.profile.institution_address}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Full institutional address"
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>
                      <School className="w-3 h-3 mr-1" />
                      Institution Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="profile.institution_type"
                      value={formData.profile.institution_type}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Select type</option>
                      <option value="University">University</option>
                      <option value="Research Center">Research Center</option>
                      <option value="College">College</option>
                      <option value="Institute">Institute</option>
                      <option value="Laboratory">Laboratory</option>
                    </select>
                  </div>

                  <div>
                    <label className={labelClass}>
                      <Award className="w-3 h-3 mr-1" />
                      Founded Year
                    </label>
                    <input
                      type="number"
                      name="profile.institution_founded_year"
                      value={formData.profile.institution_founded_year || ''}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g., 1963"
                      min="1800"
                      max={new Date().getFullYear()}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-[#5E96D2]" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>
                      <Mail className="w-3 h-3 mr-1" />
                      Email <span className="text-red-500">*</span>
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
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="+250 XXX XXX XXX"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelClass}>
                      <Globe className="w-3 h-3 mr-1" />
                      Website
                    </label>
                    <input
                      type="url"
                      name="profile.institution_website"
                      value={formData.profile.institution_website}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="https://institution.edu"
                    />
                  </div>
                </div>
              </div>

              {/* Institution Description */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2 text-[#0158B7]" />
                  About Institution
                </h2>
                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3 mr-1" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="profile.institution_description"
                    value={formData.profile.institution_description}
                    onChange={handleChange}
                    rows={8}
                    className={inputClass}
                    placeholder="Provide a comprehensive description of your institution, its mission, values, and key achievements..."
                    required
                  />
                </div>
              </div>

              {/* Accreditation */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-[#5E96D2]" />
                  Accreditation & Recognition
                </h2>
                <div>
                  <label className={labelClass}>
                    <Award className="w-3 h-3 mr-1" />
                    Accreditation Details
                  </label>
                  <textarea
                    name="profile.institution_accreditation"
                    value={formData.profile.institution_accreditation}
                    onChange={handleChange}
                    rows={6}
                    className={inputClass}
                    placeholder="List accreditations, certifications, and recognitions..."
                  />
                </div>
              </div>
            </>
          ) : (
            // ==================== STANDARD USER PROFILE FORM ====================
            <>
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
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-[#0158B7]" />
                  Location
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
            </>
          )}

          {/* Submit Button */}
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
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}