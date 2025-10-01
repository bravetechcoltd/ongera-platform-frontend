"use client"

import { useEffect, useRef, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchAllCommunitiesForAdmin,
  approveCommunity,
  rejectCommunity,
  deleteCommunity,
  activateDeactivateCommunity,
  editCommunity,
  clearCommunitiesError
} from "@/lib/features/auth/communitiesSlice"
import {
  CheckCircle, XCircle, Trash2, Search, Filter,
  Users, MessageSquare, Calendar, Globe, Lock,
  Building2, Loader2, AlertCircle, ChevronLeft,
  ChevronRight, Eye, MoreVertical, Power, PowerOff,
  X, AlertTriangle, Mail, Phone, MapPin, RefreshCw,
  Shield, Clock, CheckCircle2, User, FileText, Settings,
  SlidersHorizontal, Hash, BookOpen, Users as UsersIcon,
  Edit, Save, Upload, Image as ImageIcon, Info
} from "lucide-react"
import { toast } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"

type StatusFilter = 'all' | 'pending' | 'approved'

// ==================== EDIT COMMUNITY MODAL COMPONENT ====================
interface EditCommunityModalProps {
  isOpen: boolean
  onClose: () => void
  community: any
  onSuccess: () => void
}

function EditCommunityModal({ isOpen, onClose, community, onSuccess }: EditCommunityModalProps) {
  const dispatch = useAppDispatch()
  const { isSubmitting, error } = useAppSelector(state => state.communities)
  
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

  // Populate form when community data is loaded
  useEffect(() => {
    if (community) {
      setFormData({
        name: community.name || "",
        description: community.description || "",
        category: community.category || "",
        community_type: community.community_type || "Public",
        join_approval_required: community.join_approval_required || false,
        rules: community.rules || ""
      })
      
      if (community.cover_image_url) {
        setCoverImagePreview(community.cover_image_url)
      }
    }
  }, [community])

useEffect(() => {
  if (error) {
    toast.error(error)
    dispatch(clearCommunitiesError())
  }
}, [error, dispatch])
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
      id: community.id, 
      formData: formDataToSend 
    })).unwrap()
    
    // ✅ Toast is now handled here in the component
    toast.success('Community updated successfully!')
    onSuccess?.()
    onClose()
  } catch (error: any) {
    // ✅ Error toast is now handled here
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
        className="bg-white rounded-xl shadow-2xl max-w-5xl w-full my-auto overflow-hidden"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0158B7] to-[#5E96D2] px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Edit Community
                </h3>
                <p className="text-white/90 text-sm">
                  Update community information
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

// ==================== MAIN PAGE COMPONENT ====================
export default function AdminCommunityManagePage() {
  const dispatch = useAppDispatch()
  const { adminCommunities, isLoading, isSubmitting, error, pagination } = useAppSelector(state => state.communities)
  
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [deleteReason, setDeleteReason] = useState('')
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusAction, setStatusAction] = useState<'activate' | 'deactivate' | null>(null)
  const [statusReason, setStatusReason] = useState('')
  const [selectedCommunityData, setSelectedCommunityData] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedCommunityDetails, setSelectedCommunityDetails] = useState<any>(null)
  
  // NEW: State for Edit Modal
  const [showEditModal, setShowEditModal] = useState(false)
  const [communityToEdit, setCommunityToEdit] = useState<any>(null)

  useEffect(() => {
    loadCommunities()
  }, [statusFilter, pagination.page])



  const loadCommunities = () => {
    dispatch(fetchAllCommunitiesForAdmin({
      page: pagination.page,
      limit: 20,
      status: statusFilter,
      search: searchQuery || undefined,
      category: categoryFilter || undefined
    }))
  }

  const handleRefresh = () => {
    loadCommunities()
    toast.success("Communities refreshed successfully!")
  }

  const handleSearch = () => {
    loadCommunities()
  }

  const handleApprove = async (id: string) => {
    try {
      await dispatch(approveCommunity(id)).unwrap()
      toast.success("Community approved successfully!")
      loadCommunities()
    } catch (err: any) {
      toast.error(err || "Failed to approve community")
    }
  }

  const handleReject = async () => {
    if (!selectedCommunity) return
    
    try {
      await dispatch(rejectCommunity({ 
        id: selectedCommunity, 
        reason: rejectReason 
      })).unwrap()
      toast.success("Community rejected successfully!")
      setShowRejectModal(false)
      setSelectedCommunity(null)
      setRejectReason('')
      loadCommunities()
    } catch (err: any) {
      toast.error(err || "Failed to reject community")
    }
  }

  const openDeleteModal = (community: any) => {
    setSelectedCommunityData(community)
    setDeleteReason('')
    setDeleteConfirmationText('')
    setShowDeleteModal(true)
  }

  const handlePermanentDelete = async () => {
    if (!selectedCommunityData) return
    
    if (deleteConfirmationText !== 'PERMANENTLY DELETE') {
      toast.error("Please type 'PERMANENTLY DELETE' to confirm")
      return
    }
    
    if (!deleteReason.trim() || deleteReason.length < 20) {
      toast.error("Please provide a detailed reason (at least 20 characters)")
      return
    }
    
    try {
      await dispatch(deleteCommunity({ 
        id: selectedCommunityData.id, 
        reason: deleteReason 
      })).unwrap()
      
      toast.success("Community permanently deleted successfully! Creator notified.")
      setShowDeleteModal(false)
      setSelectedCommunityData(null)
      setDeleteReason('')
      setDeleteConfirmationText('')
      loadCommunities()
    } catch (err: any) {
      toast.error(err || "Failed to permanently delete community")
    }
  }

  const openStatusModal = (community: any, action: 'activate' | 'deactivate') => {
    setSelectedCommunityData(community)
    setStatusAction(action)
    setStatusReason('')
    setShowStatusModal(true)
  }

  const handleStatusChange = async () => {
    if (!selectedCommunityData || !statusAction) return
    
    if (statusAction === 'deactivate' && !statusReason.trim()) {
      toast.error("Please provide a reason for deactivation")
      return
    }
    
    if (statusAction === 'deactivate' && statusReason.length < 20) {
      toast.error("Please provide a more detailed reason (at least 20 characters)")
      return
    }
    
    try {
      const is_active = statusAction === 'activate'
      
      await dispatch(activateDeactivateCommunity({
        id: selectedCommunityData.id,
        is_active,
        reason: statusAction === 'deactivate' ? statusReason : undefined
      })).unwrap()
      
      toast.success(`Community ${statusAction === 'activate' ? 'activated' : 'deactivated'} successfully!`)
      setShowStatusModal(false)
      setSelectedCommunityData(null)
      setStatusAction(null)
      setStatusReason('')
      loadCommunities()
    } catch (err: any) {
      toast.error(err || `Failed to ${statusAction} community`)
    }
  }

  const openDetailsModal = (community: any) => {
    setSelectedCommunityDetails(community)
    setShowDetailsModal(true)
  }

  // NEW: Handle Edit
  const openEditModal = (community: any) => {
    setCommunityToEdit(community)
    setShowEditModal(true)
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Public': return <Globe className="w-4 h-4 text-green-600" />
      case 'Private': return <Lock className="w-4 h-4 text-orange-600" />
      case 'Institution-Specific': return <Building2 className="w-4 h-4 text-purple-600" />
      default: return <Globe className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle2 className="w-3 h-3" />
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
        <XCircle className="w-3 h-3" />
        Inactive
      </span>
    )
  }

  const getTypeBadgeColor = (type: string) => {
    switch(type) {
      case 'Public': return "bg-green-100 text-green-700"
      case 'Private': return "bg-orange-100 text-orange-700"
      case 'Institution-Specific': return "bg-purple-100 text-purple-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  // Get unique categories for dropdown
  const categories = Array.from(new Set(
    adminCommunities.map(community => community.category).filter(Boolean)
  ))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md border border-gray-100 p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#0158B7] rounded-lg flex items-center justify-center">
                <UsersIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Community Management
                </h1>
                <p className="text-xs text-gray-500">{pagination.total} total communities • {adminCommunities.length} filtered</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-3 py-2 rounded-lg transition-all text-sm ${
                  showFilters
                    ? "bg-[#0158B7] text-white border border-blue-300"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 mr-1" />
                Filters
              </button>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center px-3 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search communities by name, category, or creator..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7]"
            />
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3"
              >
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                </select>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-center"
          >
            <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
            <span className="text-sm text-red-800">{error}</span>
            <button
              onClick={() => dispatch(clearCommunitiesError())}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {/* Communities Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          </div>
        ) : adminCommunities.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Communities {searchQuery ? "Found" : ""}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search or filters"
                : "No communities found in the system"}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#0158B7] text-white">
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">#</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Community</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Creator</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Type</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Stats</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Created</th>
                    <th className="px-3 py-3 text-left text-xs font-bold uppercase">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-bold uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {adminCommunities.map((community, index) => (
                    <motion.tr
                      key={community.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="hover:bg-blue-50 transition-colors group"
                    >
                      {/* Number */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="w-7 h-7 bg-[#0158B7] rounded-lg flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-white">
                            {((pagination.page - 1) * pagination.limit) + index + 1}
                          </span>
                        </div>
                      </td>

                      {/* Community Info */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500">
                            {community.cover_image_url ? (
                              <img
                                src={community.cover_image_url}
                                alt={community.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                                {community.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {community.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {community.category}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Creator */}
                      <td className="px-3 py-3">
                        <div className="flex items-center space-x-2">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {community.creator?.first_name} {community.creator?.last_name}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(community.community_type)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(community.community_type)}`}>
                            {community.community_type}
                          </span>
                        </div>
                      </td>

                      {/* Stats */}
                      <td className="px-3 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-medium">{community.member_count}</span>
                            <span>members</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="font-medium">{community.post_count}</span>
                            <span>posts</span>
                          </div>
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center space-x-2 text-xs text-gray-600">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>{new Date(community.created_at).toLocaleDateString()}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        {getStatusBadge(community.is_active)}
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          {/* View Details Button */}
                          <button
                            onClick={() => openDetailsModal(community)}
                            className="p-1.5 bg-blue-100 text-[#0158B7] rounded hover:bg-blue-200 transition-colors group-hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* NEW: Edit Button - Always visible for admin */}
                          <button
                            onClick={() => openEditModal(community)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                            title="Edit Community"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {!community.is_active ? (
                            <>
                              <button
                                onClick={() => handleApprove(community.id)}
                                disabled={isSubmitting}
                                className="p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                                title="Approve"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedCommunity(community.id)
                                  setShowRejectModal(true)
                                }}
                                disabled={isSubmitting}
                                className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                                title="Reject"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <>
                              {/* Deactivate Button */}
                              <button
                                onClick={() => openStatusModal(community, 'deactivate')}
                                disabled={isSubmitting}
                                className="p-1.5 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                                title="Deactivate Community"
                              >
                                <PowerOff className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          
                          {/* Activate Button for Inactive Communities */}
                          {!community.is_active && (
                            <button
                              onClick={() => openStatusModal(community, 'activate')}
                              disabled={isSubmitting}
                              className="p-1.5 bg-blue-100 text-[#0158B7] rounded hover:bg-blue-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                              title="Activate Community"
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Permanent Delete Button */}
                          <button
                            onClick={() => openDeleteModal(community)}
                            disabled={isSubmitting}
                            className="p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors group-hover:scale-110 disabled:opacity-50"
                            title="Permanently Delete Community"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                    <span className="font-semibold">
                      {Math.min(pagination.page * pagination.limit, pagination.total)}
                    </span>{' '}
                    of <span className="font-semibold">{pagination.total}</span> communities
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => dispatch(fetchAllCommunitiesForAdmin({ 
                        page: pagination.page - 1,
                        status: statusFilter
                      }))}
                      disabled={pagination.page === 1}
                      className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 3) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = pagination.page - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => dispatch(fetchAllCommunitiesForAdmin({ 
                              page: pageNum,
                              status: statusFilter
                            }))}
                            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                              pagination.page === pageNum
                                ? "bg-[#0158B7] text-white shadow-sm"
                                : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => dispatch(fetchAllCommunitiesForAdmin({ 
                        page: pagination.page + 1,
                        status: statusFilter
                      }))}
                      disabled={pagination.page === pagination.totalPages}
                      className="p-1.5 border border-gray-300 rounded hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Edit Community Modal */}
      {showEditModal && communityToEdit && (
        <EditCommunityModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setCommunityToEdit(null)
          }}
          community={communityToEdit}
          onSuccess={() => {
            loadCommunities()
          }}
        />
      )}

      {/* Enhanced Permanent Delete Modal */}
      {showDeleteModal && selectedCommunityData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-red-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Permanently Delete Community</h3>
                    <p className="text-red-100 text-sm">This action CANNOT be undone</p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    onClick={() => {
                      setShowDeleteModal(false)
                      setSelectedCommunityData(null)
                      setDeleteReason('')
                      setDeleteConfirmationText('')
                    }}
                    className="p-1 hover:bg-white/20 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Community Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500">
                    {selectedCommunityData.cover_image_url ? (
                      <img
                        src={selectedCommunityData.cover_image_url}
                        alt={selectedCommunityData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {selectedCommunityData.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {selectedCommunityData.name}
                    </h4>
                    <p className="text-xs text-gray-600">{selectedCommunityData.category}</p>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <h4 className="text-xs font-bold text-red-900 mb-2 flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  ⚠️ Permanent Deletion Warning
                </h4>
                <ul className="space-y-1 text-xs text-red-800">
                  <li className="flex items-start">
                    <span className="mr-1.5">•</span>
                    <span>Community will be COMPLETELY REMOVED from the database</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5">•</span>
                    <span>All posts, comments, and member data will be permanently deleted</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-1.5">•</span>
                    <span>This action CANNOT be reversed or restored</span>
                  </li>
                </ul>
              </div>

              {/* Reason Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-900">
                    Deletion Reason <span className="text-red-500">*</span>
                  </label>
                  <span className="text-xs text-gray-500">{deleteReason.length}/500</span>
                </div>
                <textarea
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value.slice(0, 500))}
                  placeholder="Provide a detailed reason for deleting this community (min 20 characters)..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={3}
                />
                {deleteReason.length > 0 && deleteReason.length < 20 && (
                  <p className="text-xs text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Minimum 20 characters required
                  </p>
                )}
              </div>

              {/* Confirmation Input */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-900">
                  Type <span className="text-red-600 font-bold">PERMANENTLY DELETE</span> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  placeholder="Type PERMANENTLY DELETE here"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setSelectedCommunityData(null)
                  setDeleteReason('')
                  setDeleteConfirmationText('')
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePermanentDelete}
                disabled={
                  isSubmitting || 
                  !deleteReason.trim() || 
                  deleteReason.length < 20 || 
                  deleteConfirmationText !== 'PERMANENTLY DELETE'
                }
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all text-sm font-bold disabled:opacity-50 flex items-center space-x-2 shadow-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-red-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <XCircle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      Reject Community
                    </h3>
                    <p className="text-red-100 text-sm">
                      This reason will be sent to the creator
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setSelectedCommunity(null)
                    setRejectReason('')
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-900">
                  Rejection Reason <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 font-normal ml-2">
                    {rejectReason.length}/500
                  </span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value.slice(0, 500))}
                  placeholder="Please provide a detailed reason for rejecting this community..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={4}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setSelectedCommunity(null)
                  setRejectReason('')
                }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isSubmitting || !rejectReason.trim()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm font-medium disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Reject Community</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Activate/Deactivate Status Modal */}
      {showStatusModal && selectedCommunityData && statusAction && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className={`px-6 py-4 ${
              statusAction === 'activate' ? 'bg-[#0158B7]' : 'bg-orange-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {statusAction === 'activate' ? (
                      <Power className="w-5 h-5 text-white" />
                    ) : (
                      <PowerOff className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {statusAction === 'activate' ? 'Activate Community' : 'Deactivate Community'}
                    </h3>
                    <p className="text-white/90 text-sm">
                      {statusAction === 'activate' 
                        ? 'Make this community accessible to all members'
                        : 'Temporarily disable this community'
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowStatusModal(false)
                    setSelectedCommunityData(null)
                    setStatusAction(null)
                    setStatusReason('')
                  }}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Community Info */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500">
                    {selectedCommunityData.cover_image_url ? (
                      <img
                        src={selectedCommunityData.cover_image_url}
                        alt={selectedCommunityData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                        {selectedCommunityData.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {selectedCommunityData.name}
                    </h4>
                    <p className="text-xs text-gray-600">{selectedCommunityData.category}</p>
                  </div>
                </div>
              </div>

              {/* Reason Input */}
              {statusAction === 'deactivate' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Deactivation Reason <span className="text-red-500">*</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      {statusReason.length}/500
                    </span>
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value.slice(0, 500))}
                    placeholder="Please provide a detailed reason for deactivation (minimum 20 characters)..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={3}
                  />
                  {statusReason.length < 20 && statusReason.length > 0 && (
                    <p className="text-xs text-orange-600 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>Minimum 20 characters required</span>
                    </p>
                  )}
                </div>
              )}

              {statusAction === 'activate' && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Welcome Message <span className="text-gray-400">(Optional)</span>
                    <span className="text-xs text-gray-500 font-normal ml-2">
                      {statusReason.length}/300
                    </span>
                  </label>
                  <textarea
                    value={statusReason}
                    onChange={(e) => setStatusReason(e.target.value.slice(0, 300))}
                    placeholder="Add a welcome message for members..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-[#0158B7] resize-none"
                    rows={2}
                  />
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowStatusModal(false)
                  setSelectedCommunityData(null)
                  setStatusAction(null)
                  setStatusReason('')
                }}
                disabled={isSubmitting}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusChange}
                disabled={
                  isSubmitting || 
                  (statusAction === 'deactivate' && (!statusReason.trim() || statusReason.length < 20))
                }
                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center space-x-2 ${
                  statusAction === 'activate'
                    ? 'bg-[#0158B7] hover:bg-blue-700 text-white'
                    : 'bg-orange-500 hover:bg-orange-600 text-white'
                } disabled:opacity-50`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {statusAction === 'activate' ? (
                      <>
                        <Power className="w-4 h-4" />
                        <span>Activate</span>
                      </>
                    ) : (
                      <>
                        <PowerOff className="w-4 h-4" />
                        <span>Deactivate</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NEW: Enhanced View Details Modal */}
      {showDetailsModal && selectedCommunityDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 px-4 py-8 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-auto overflow-hidden transform transition-all animate-in zoom-in-95 duration-200 max-h-[calc(100vh-80px)]">
            {/* Modal Header */}
            <div className="bg-[#0158B7] px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Community Details
                    </h3>
                    <p className="text-white/90 text-sm">
                      Complete information about {selectedCommunityDetails.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedCommunityDetails(null)
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-200px)]">
              {/* Community Header */}
              <div className="flex items-start space-x-4">
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-emerald-500 to-teal-500">
                  {selectedCommunityDetails.cover_image_url ? (
                    <img
                      src={selectedCommunityDetails.cover_image_url}
                      alt={selectedCommunityDetails.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                      {selectedCommunityDetails.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedCommunityDetails.name}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeBadgeColor(selectedCommunityDetails.community_type)}`}>
                      {getTypeIcon(selectedCommunityDetails.community_type)}
                      <span className="ml-1">{selectedCommunityDetails.community_type}</span>
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                      <Hash className="w-4 h-4 mr-1" />
                      {selectedCommunityDetails.category}
                    </span>
                    {getStatusBadge(selectedCommunityDetails.is_active)}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                  <Users className="w-8 h-8 text-[#0158B7] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedCommunityDetails.member_count}</p>
                  <p className="text-sm text-gray-600">Members</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{selectedCommunityDetails.post_count}</p>
                  <p className="text-sm text-gray-600">Posts</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
                  <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900">
                    {new Date(selectedCommunityDetails.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">Created</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
                  <Settings className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-bold text-gray-900 capitalize">
                    {selectedCommunityDetails.join_approval_required ? 'Approval Required' : 'Open Join'}
                  </p>
                  <p className="text-sm text-gray-600">Join Policy</p>
                </div>
              </div>

              {/* Description & Rules */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <FileText className="w-5 h-5 mr-2 text-[#0158B7]" />
                      Description
                    </h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {selectedCommunityDetails.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 text-[#0158B7]" />
                      Community Rules
                    </h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedCommunityDetails.rules || 'No rules specified.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Creator Information */}
                <div className="space-y-4">
                  <div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <User className="w-5 h-5 mr-2 text-[#0158B7]" />
                      Creator Information
                    </h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {selectedCommunityDetails.creator?.first_name?.[0]}{selectedCommunityDetails.creator?.last_name?.[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {selectedCommunityDetails.creator?.first_name} {selectedCommunityDetails.creator?.last_name}
                          </p>
                          <p className="text-xs text-gray-600 capitalize">{selectedCommunityDetails.creator?.account_type}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {selectedCommunityDetails.creator?.email}
                        </div>
                        {selectedCommunityDetails.creator?.phone_number && (
                          <div className="flex items-center text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {selectedCommunityDetails.creator?.phone_number}
                          </div>
                        )}
                        {selectedCommunityDetails.creator?.country && (
                          <div className="flex items-center text-gray-600">
                            <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                            {selectedCommunityDetails.creator?.city && `${selectedCommunityDetails.creator?.city}, `}
                            {selectedCommunityDetails.creator?.country}
                          </div>
                        )}
                        <div className="flex items-center text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          Joined {new Date(selectedCommunityDetails.creator?.date_joined).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div>
                    <h5 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-[#0158B7]" />
                      Additional Information
                    </h5>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Community ID:</span>
                        <span className="font-mono text-gray-900">{selectedCommunityDetails.id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Slug:</span>
                        <span className="font-mono text-gray-900">{selectedCommunityDetails.slug}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Join Approval:</span>
                        <span className={`font-medium ${selectedCommunityDetails.join_approval_required ? 'text-orange-600' : 'text-green-600'}`}>
                          {selectedCommunityDetails.join_approval_required ? 'Required' : 'Not Required'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedCommunityDetails(null)
                }}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}