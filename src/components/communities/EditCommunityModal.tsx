"use client"

import { useState, useEffect, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { editCommunity, fetchCommunityById } from "@/lib/features/auth/communitiesSlice"
import {
  X,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle,
  Globe,
  Lock,
  Building2,
  Image as ImageIcon,
  Info,
  Shield,
  Save
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"

interface EditCommunityModalProps {
  isOpen: boolean
  onClose: () => void
  communityId: string
  onSuccess?: () => void
}

export default function EditCommunityModal({ 
  isOpen, 
  onClose, 
  communityId,
  onSuccess 
}: EditCommunityModalProps) {
  const dispatch = useAppDispatch()
  const { currentCommunity, isSubmitting } = useAppSelector(state => state.communities)
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    community_type: "Public",
    join_approval_required: false,
    rules: ""
  })
  
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<"basic" | "settings" | "rules">("basic")
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load community data when modal opens
  useEffect(() => {
    if (isOpen && communityId) {
      dispatch(fetchCommunityById(communityId))
    }
  }, [isOpen, communityId, dispatch])

  // Populate form when community data is loaded
  useEffect(() => {
    if (currentCommunity && currentCommunity.id === communityId) {
      setFormData({
        name: currentCommunity.name || "",
        description: currentCommunity.description || "",
        category: currentCommunity.category || "",
        community_type: currentCommunity.community_type || "Public",
        join_approval_required: currentCommunity.join_approval_required || false,
        rules: currentCommunity.rules || ""
      })
      
      if (currentCommunity.cover_image_url) {
        setCoverImagePreview(currentCommunity.cover_image_url)
      }
    }
  }, [currentCommunity, communityId])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        description: "",
        category: "",
        community_type: "Public",
        join_approval_required: false,
        rules: ""
      })
      setCoverImage(null)
      setCoverImagePreview(null)
      setErrors({})
      setTouched({})
      setActiveTab("basic")
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = "Community name is required"
    } else if (formData.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters"
    } else if (formData.name.length > 100) {
      newErrors.name = "Name must be less than 100 characters"
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters"
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description must be less than 2000 characters"
    }
    
    if (!formData.category.trim()) {
      newErrors.category = "Category is required"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }
      
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      // Show first error as toast
      const firstError = Object.values(errors)[0]
      if (firstError) toast.error(firstError)
      return
    }
    
    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('description', formData.description)
    formDataToSend.append('category', formData.category)
    formDataToSend.append('community_type', formData.community_type)
    formDataToSend.append('join_approval_required', String(formData.join_approval_required))
    formDataToSend.append('rules', formData.rules)
    
    if (coverImage) {
      formDataToSend.append('cover_image', coverImage)
    }
    
    try {
      const result = await dispatch(editCommunity({ 
        id: communityId, 
        formData: formDataToSend 
      })).unwrap()
      
      if (result) {
        toast.success('Community updated successfully!')
        onSuccess?.()
        onClose()
      }
    } catch (error: any) {
      toast.error(error || 'Failed to update community')
    }
  }

  const categories = [
    "Technology", "Science", "Education", "Arts", "Health",
    "Business", "Social", "Research", "Innovation", "Other"
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-8 animate-in fade-in duration-200 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-auto overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0158B7] to-[#5E96D2] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Save className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Edit Community
                </h3>
                <p className="text-white/90 text-sm">
                  Update your community information
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab("basic")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "basic"
                  ? "border-[#0158B7] text-[#0158B7]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Basic Info
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "settings"
                  ? "border-[#0158B7] text-[#0158B7]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab("rules")}
              className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "rules"
                  ? "border-[#0158B7] text-[#0158B7]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Community Rules
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <AnimatePresence mode="wait">
            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <motion.div
                key="basic"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Cover Image
                  </label>
                  <div className="flex items-start space-x-4">
                    <div className="w-32 h-32 rounded-lg overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-500 flex-shrink-0 border-2 border-gray-200">
                      {coverImagePreview ? (
                        <img
                          src={coverImagePreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white/70" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Change Cover Image
                      </button>
                      <p className="text-xs text-gray-500 mt-2">
                        Recommended size: 1200x300px. Max size: 5MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Community Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Community Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g., AI Research Group Rwanda"
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] transition-colors text-sm ${
                      touched.name && errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {touched.name && errors.name && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    onBlur={() => handleBlur('category')}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] transition-colors text-sm ${
                      touched.category && errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {touched.category && errors.category && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    onBlur={() => handleBlur('description')}
                    placeholder="Describe your community's purpose, goals, and who should join..."
                    rows={4}
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] transition-colors text-sm resize-none ${
                      touched.description && errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {touched.description && errors.description && (
                    <p className="text-xs text-red-600 mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/2000 characters
                  </p>
                </div>
              </motion.div>
            )}

            {/* Settings Tab */}
            {activeTab === "settings" && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Community Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Community Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <label
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.community_type === 'Public'
                          ? 'border-[#0158B7] bg-blue-50 ring-2 ring-[#0158B7]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="community_type"
                        value="Public"
                        checked={formData.community_type === 'Public'}
                        onChange={(e) => setFormData(prev => ({ ...prev, community_type: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <Globe className={`w-5 h-5 ${formData.community_type === 'Public' ? 'text-[#0158B7]' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Public</p>
                          <p className="text-xs text-gray-500">Anyone can join</p>
                        </div>
                      </div>
                      {formData.community_type === 'Public' && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#0158B7]" />
                      )}
                    </label>

                    <label
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.community_type === 'Private'
                          ? 'border-[#0158B7] bg-blue-50 ring-2 ring-[#0158B7]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="community_type"
                        value="Private"
                        checked={formData.community_type === 'Private'}
                        onChange={(e) => setFormData(prev => ({ ...prev, community_type: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <Lock className={`w-5 h-5 ${formData.community_type === 'Private' ? 'text-[#0158B7]' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Private</p>
                          <p className="text-xs text-gray-500">Invitation only</p>
                        </div>
                      </div>
                      {formData.community_type === 'Private' && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#0158B7]" />
                      )}
                    </label>

                    <label
                      className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                        formData.community_type === 'Institution-Specific'
                          ? 'border-[#0158B7] bg-blue-50 ring-2 ring-[#0158B7]/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="community_type"
                        value="Institution-Specific"
                        checked={formData.community_type === 'Institution-Specific'}
                        onChange={(e) => setFormData(prev => ({ ...prev, community_type: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <Building2 className={`w-5 h-5 ${formData.community_type === 'Institution-Specific' ? 'text-[#0158B7]' : 'text-gray-400'}`} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Institution</p>
                          <p className="text-xs text-gray-500">Specific to institution</p>
                        </div>
                      </div>
                      {formData.community_type === 'Institution-Specific' && (
                        <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-[#0158B7]" />
                      )}
                    </label>
                  </div>
                </div>

                {/* Join Approval Required */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <Shield className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Require Approval to Join
                        </p>
                        <p className="text-xs text-gray-500">
                          When enabled, new members must be approved by you before joining
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.join_approval_required}
                        onChange={(e) => setFormData(prev => ({ ...prev, join_approval_required: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0158B7]/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0158B7]"></div>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Rules Tab */}
            {activeTab === "rules" && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3">
                  <Info className="w-5 h-5 text-[#0158B7] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[#0158B7]">Community Guidelines</p>
                    <p className="text-xs text-blue-700">
                      Set clear rules to maintain a healthy community. These will be visible to all members.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-1">
                    Community Rules
                  </label>
                  <textarea
                    value={formData.rules}
                    onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                    placeholder={`Example rules:
1. Be respectful and professional
2. No spam or self-promotion
3. Stay on topic
4. Protect privacy and confidentiality`}
                    rows={8}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] transition-colors text-sm font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.rules.length} characters
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Footer */}
          <div className="mt-8 pt-5 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg transition-all text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}