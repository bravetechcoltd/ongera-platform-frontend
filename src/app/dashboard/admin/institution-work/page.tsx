
"use client"

import { useEffect, useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  fetchInstitutionWorkTogether,
  createInstitutionWork,
  updateInstitutionWork,
  deleteInstitutionWork,
  toggleInstitutionActive,
  type InstitutionWork,
  type WorkType,
  type PartnershipStatus,
} from "@/lib/features/auth/institutionWorktogetherSlices"
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  X,
  Save,
  Upload,
  Globe,
  Mail,
  Phone,
  MapPin,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Calendar,
  Users,
  Award,
  Tag,
  Filter,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

const WORK_TYPES = [
  "Research Collaboration",
  "Educational Partnership",
  "Joint Project",
  "Training Program",
  "Conference",
  "Workshop",
  "Other",
]

const STATUSES = ["active", "inactive", "pending", "completed"]

export default function ManageInstitutionWorkPage() {
  const dispatch = useAppDispatch()
  const { institutions, isLoading, isSubmitting, pagination } = useAppSelector((state) => state.institutionWorktogether)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingInstitution, setEditingInstitution] = useState<InstitutionWork | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
    work_type: "Other" as WorkType,
    status: "active" as PartnershipStatus,
    contact_email: "",
    contact_phone: "",
    address: "",
    social_links: {
      twitter: "",
      linkedin: "",
      facebook: "",
      instagram: "",
    },
    metadata: {
      founded_year: "",
      employees_count: "",
      specializations: [] as string[],
      achievements: [] as string[],
    },
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [specializationInput, setSpecializationInput] = useState("")
  const [achievementInput, setAchievementInput] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    dispatch(fetchInstitutionWorkTogether({
      page: currentPage,
      limit: 10,
      search: searchQuery || undefined,
      work_type: selectedType || undefined,
      status: selectedStatus || undefined,
    }))
  }, [dispatch, currentPage, searchQuery, selectedType, selectedStatus])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Logo file must be less than 5MB")
        return
      }
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      website_url: "",
      work_type: "Other" as WorkType,
      status: "active" as PartnershipStatus,
      contact_email: "",
      contact_phone: "",
      address: "",
      social_links: {
        twitter: "",
        linkedin: "",
        facebook: "",
        instagram: "",
      },
      metadata: {
        founded_year: "",
        employees_count: "",
        specializations: [],
        achievements: [],
      },
    })
    setLogoFile(null)
    setLogoPreview(null)
    setEditingInstitution(null)
    setSpecializationInput("")
    setAchievementInput("")
  }

  const handleEdit = (institution: InstitutionWork) => {
    setEditingInstitution(institution)
    setFormData({
      name: institution.name,
      description: institution.description || "",
      website_url: institution.website_url || "",
      work_type: institution.work_type,
      status: institution.status,
      contact_email: institution.contact_email || "",
      contact_phone: institution.contact_phone || "",
      address: institution.address || "",
      social_links: {
        twitter: institution.social_links?.twitter || "",
        linkedin: institution.social_links?.linkedin || "",
        facebook: institution.social_links?.facebook || "",
        instagram: institution.social_links?.instagram || "",
      },
      metadata: {
        founded_year: institution.metadata?.founded_year?.toString() || "",
        employees_count: institution.metadata?.employees_count?.toString() || "",
        specializations: institution.metadata?.specializations || [],
        achievements: institution.metadata?.achievements || [],
      },
    })
    setLogoPreview(institution.logo_url || null)
    setShowForm(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Institution name is required")
      return
    }

    const submitData = new FormData()
    submitData.append("name", formData.name)
    if (formData.description) submitData.append("description", formData.description)
    if (formData.website_url) submitData.append("website_url", formData.website_url)
    submitData.append("work_type", formData.work_type)
    submitData.append("status", formData.status)
    if (formData.contact_email) submitData.append("contact_email", formData.contact_email)
    if (formData.contact_phone) submitData.append("contact_phone", formData.contact_phone)
    if (formData.address) submitData.append("address", formData.address)
    submitData.append("social_links", JSON.stringify(formData.social_links))
    submitData.append("metadata", JSON.stringify({
      founded_year: formData.metadata.founded_year ? parseInt(formData.metadata.founded_year) : undefined,
      employees_count: formData.metadata.employees_count ? parseInt(formData.metadata.employees_count) : undefined,
      specializations: formData.metadata.specializations,
      achievements: formData.metadata.achievements,
    }))

    if (logoFile) {
      submitData.append("logo", logoFile)
    }

    try {
      if (editingInstitution) {
        await dispatch(updateInstitutionWork({ id: editingInstitution.id, formData: submitData })).unwrap()
        toast.success("Institution updated successfully")
      } else {
        await dispatch(createInstitutionWork(submitData)).unwrap()
        toast.success("Institution created successfully")
      }
      setShowForm(false)
      resetForm()
      dispatch(fetchInstitutionWorkTogether({ page: currentPage }))
    } catch (error: any) {
      toast.error(error || "Operation failed")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await dispatch(deleteInstitutionWork(id)).unwrap()
      toast.success("Institution deleted successfully")
      setShowDeleteConfirm(null)
    } catch (error: any) {
      toast.error(error || "Failed to delete")
    }
  }

  const handleToggleActive = async (id: string) => {
    try {
      await dispatch(toggleInstitutionActive(id)).unwrap()
      toast.success("Status toggled successfully")
    } catch (error: any) {
      toast.error(error || "Failed to toggle status")
    }
  }

  const addSpecialization = () => {
    if (specializationInput.trim()) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          specializations: [...formData.metadata.specializations, specializationInput.trim()],
        },
      })
      setSpecializationInput("")
    }
  }

  const removeSpecialization = (index: number) => {
    const newSpecs = [...formData.metadata.specializations]
    newSpecs.splice(index, 1)
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, specializations: newSpecs },
    })
  }

  const addAchievement = () => {
    if (achievementInput.trim()) {
      setFormData({
        ...formData,
        metadata: {
          ...formData.metadata,
          achievements: [...formData.metadata.achievements, achievementInput.trim()],
        },
      })
      setAchievementInput("")
    }
  }

  const removeAchievement = (index: number) => {
    const newAchievements = [...formData.metadata.achievements]
    newAchievements.splice(index, 1)
    setFormData({
      ...formData,
      metadata: { ...formData.metadata, achievements: newAchievements },
    })
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#0158B7]/10 rounded-lg">
              <Building2 className="w-5 h-5 text-[#0158B7]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Manage Institution Partnerships</h1>
              <p className="text-xs text-gray-600 mt-0.5">
                Add and manage institutions that work together
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-3 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#014a9d] transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Institution
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search institutions..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm"
            />
          </div>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm bg-white"
          >
            <option value="">All Types</option>
            {WORK_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0158B7] text-sm bg-white"
          >
            <option value="">All Status</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setSearchQuery("")
              setSelectedType("")
              setSelectedStatus("")
              setCurrentPage(1)
            }}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-white/20 rounded-lg">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-bold">
                    {editingInstitution ? "Edit Institution" : "Add New Institution"}
                  </h2>
                </div>
                <button
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0158B7]" />
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Institution Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="e.g., University of Rwanda"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Website
                      </label>
                      <input
                        type="url"
                        value={formData.website_url}
                        onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="https://..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm resize-none"
                      placeholder="Brief description of the institution..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Work Type
                      </label>
                      <select
                        value={formData.work_type}
                        onChange={(e) => setFormData({ ...formData, work_type: e.target.value as WorkType })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm bg-white"
                      >
                        {WORK_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as PartnershipStatus })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm bg-white"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Logo
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0158B7] transition-colors text-sm flex items-center justify-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {logoPreview ? "Change Logo" : "Upload Logo"}
                      </button>
                    </div>
                  </div>

                  {logoPreview && (
                    <div className="relative w-20 h-20">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                      />
                      <button
                        onClick={() => {
                          setLogoFile(null)
                          setLogoPreview(null)
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-[#0158B7]" />
                    Contact Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="contact@institution.org"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="+250 788 123 456"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                      placeholder="Street, City, Country"
                    />
                  </div>
                </div>

                {/* Social Links */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#0158B7]" />
                    Social Media Links
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Twitter
                      </label>
                      <input
                        type="url"
                        value={formData.social_links.twitter}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, twitter: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="https://twitter.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        LinkedIn
                      </label>
                      <input
                        type="url"
                        value={formData.social_links.linkedin}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, linkedin: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="https://linkedin.com/company/..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Facebook
                      </label>
                      <input
                        type="url"
                        value={formData.social_links.facebook}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, facebook: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="https://facebook.com/..."
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Instagram
                      </label>
                      <input
                        type="url"
                        value={formData.social_links.instagram}
                        onChange={(e) => setFormData({
                          ...formData,
                          social_links: { ...formData.social_links, instagram: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="https://instagram.com/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#0158B7]" />
                    Additional Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Founded Year
                      </label>
                      <input
                        type="number"
                        value={formData.metadata.founded_year}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, founded_year: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="e.g., 1963"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Employees Count
                      </label>
                      <input
                        type="number"
                        value={formData.metadata.employees_count}
                        onChange={(e) => setFormData({
                          ...formData,
                          metadata: { ...formData.metadata, employees_count: e.target.value }
                        })}
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="e.g., 5000"
                      />
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Specializations
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={specializationInput}
                        onChange={(e) => setSpecializationInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="e.g., Medical Research, Engineering"
                      />
                      <button
                        onClick={addSpecialization}
                        className="px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#014a9d] transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.metadata.specializations.map((spec, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs"
                        >
                          {spec}
                          <button
                            onClick={() => removeSpecialization(index)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Achievements */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Achievements
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={achievementInput}
                        onChange={(e) => setAchievementInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                        className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-[#0158B7] focus:outline-none text-sm"
                        placeholder="e.g., Top 10 University in Africa"
                      />
                      <button
                        onClick={addAchievement}
                        className="px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#014a9d] transition-colors text-sm"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.metadata.achievements.map((achievement, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs"
                        >
                          {achievement}
                          <button
                            onClick={() => removeAchievement(index)}
                            className="hover:text-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end gap-2">
                <button
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#014a9d] transition-colors text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {editingInstitution ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {editingInstitution ? "Update" : "Create"}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Institutions Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
        </div>
      ) : institutions.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-[#0158B7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-10 h-10 text-[#0158B7]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Institutions Found</h3>
          <p className="text-sm text-gray-600 mb-6">
            {searchQuery || selectedType || selectedStatus
              ? "Try adjusting your filters"
              : "Add your first institution to get started"}
          </p>
          {!searchQuery && !selectedType && !selectedStatus && (
            <button
              onClick={() => {
                resetForm()
                setShowForm(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0158B7] text-white rounded-lg hover:bg-[#014a9d] transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Institution
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {institutions.map((institution) => (
              <div
                key={institution.id}
                className={`bg-white rounded-xl border-2 overflow-hidden hover:shadow-lg transition-all ${
                  institution.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50/30'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {institution.logo_url ? (
                      <img
                        src={institution.logo_url}
                        alt={institution.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-[#0158B7]/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-[#0158B7]" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{institution.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                          institution.status === 'active' ? 'bg-green-100 text-green-700' :
                          institution.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                          institution.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {institution.status}
                        </span>
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          {institution.work_type}
                        </span>
                      </div>
                    </div>
                  </div>

                  {institution.description && (
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {institution.description}
                    </p>
                  )}

                  <div className="space-y-1.5 mb-3">
                    {institution.contact_email && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Mail className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{institution.contact_email}</span>
                      </div>
                    )}
                    {institution.contact_phone && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span>{institution.contact_phone}</span>
                      </div>
                    )}
                    {institution.address && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{institution.address}</span>
                      </div>
                    )}
                  </div>

                  {institution.metadata?.specializations && institution.metadata.specializations.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {institution.metadata.specializations.slice(0, 3).map((spec, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[9px]">
                            {spec}
                          </span>
                        ))}
                        {institution.metadata.specializations.length > 3 && (
                          <span className="text-[9px] text-gray-500">
                            +{institution.metadata.specializations.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(institution)}
                        className="p-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(institution.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          institution.is_active
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        title={institution.is_active ? "Deactivate" : "Activate"}
                      >
                        {institution.is_active ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(institution.id)}
                        className="p-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {institution.website_url && (
                      <a
                        href={institution.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#0158B7] hover:underline text-xs flex items-center gap-1"
                      >
                        <Globe className="w-3 h-3" />
                        Visit
                      </a>
                    )}
                  </div>
                </div>

                {/* Delete Confirmation */}
                {showDeleteConfirm === institution.id && (
                  <div className="border-t border-red-200 bg-red-50 p-3">
                    <p className="text-xs text-red-800 mb-2">Are you sure? This action cannot be undone.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDelete(institution.id)}
                        className="flex-1 px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-600">
                Showing {((currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 text-xs font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-[#0158B7] text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="p-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}