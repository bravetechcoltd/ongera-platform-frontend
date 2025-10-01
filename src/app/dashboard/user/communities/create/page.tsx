// @ts-nocheck

"use client"
import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createCommunity } from "@/lib/features/auth/communitiesSlice"
import {
  Users, Image as ImageIcon, X, Loader2, Save, Send,
  ArrowLeft, CheckCircle, AlertCircle, Lock, Globe,
  Building2, Heart, Code, Microscope, Leaf, GraduationCap,
  Briefcase, BookOpen, Sparkles, Info, Camera, Shield,
  Check
} from "lucide-react"

const CATEGORIES = [
  { value: "Health Sciences", icon: Heart, color: "from-[#0158B7] to-[#5E96D2]" },
  { value: "Technology & Engineering", icon: Code, color: "from-[#0158B7] to-[#5E96D2]" },
  { value: "Agriculture", icon: Leaf, color: "from-[#0158B7] to-[#5E96D2]" },
  { value: "Natural Sciences", icon: Microscope, color: "from-[#0158B7] to-[#5E96D2]" },
  { value: "Social Sciences", icon: Users, color: "from-[#0158B7] to-[#5E96D2]" },
  { value: "Business & Economics", icon: Briefcase, color: "from-[#0158B7] to-[#5E96D2]" },
  { value: "Education", icon: GraduationCap, color: "from-[#0158B7] to-[#5E96D2]" },
  { value: "Arts & Humanities", icon: BookOpen, color: "from-[#0158B7] to-[#5E96D2]" }
]

const COMMUNITY_TYPES = [
  {
    value: "Public",
    icon: Globe,
    title: "Public Community",
    description: "Anyone can join and view content",
  },
  {
    value: "Private",
    icon: Lock,
    title: "Private Community",
    description: "Invite-only, hidden from search",
  },
  {
    value: "Institution-Specific",
    icon: Building2,
    title: "Institution-Specific",
    description: "For members of specific institutions",
  }
]

export default function CreateCommunityPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { isSubmitting, error } = useAppSelector(state => state.communities)

  const coverImageRef = useRef<HTMLInputElement>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    community_type: "Public",
    join_approval_required: false,
    rules: ""
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, join_approval_required: e.target.checked }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be less than 5MB")
        return
      }
      setCoverImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    const submitData = new FormData()
    submitData.append("name", formData.name)
    submitData.append("description", formData.description)
    submitData.append("category", formData.category)
    submitData.append("community_type", formData.community_type)
    submitData.append("join_approval_required", formData.join_approval_required.toString())
    if (formData.rules) submitData.append("rules", formData.rules)
    if (coverImage) submitData.append("cover_image", coverImage)

    try {
      const result = await dispatch(createCommunity(submitData)).unwrap()
      router.push(`/dashboard/user/communities/dashboard/${result.id}?created=true`)
    } catch (err) {
      console.error("Failed to create community:", err)
    }
  }

  const isStepValid = () => {
    if (currentStep === 1) {
      return formData.name.trim().length >= 3 && formData.description.trim().length >= 50
    }
    if (currentStep === 2) {
      return formData.category !== ""
    }
    return true
  }

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs text-gray-600 hover:text-[#0158B7] transition-colors font-medium mb-3 group"
          >
            <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg">
                  <Users className="w-4 h-4 text-white" />
                </div>
                Create Community
              </h1>
              <p className="text-xs text-gray-500">Build a space for researchers to connect</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Basic Info" },
              { num: 2, label: "Category" },
              { num: 3, label: "Settings" },
              { num: 4, label: "Review" }
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${currentStep > step.num
                      ? "bg-[#0158B7] text-white"
                      : currentStep === step.num
                        ? "bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>
                    {currentStep > step.num ? <Check className="w-3.5 h-3.5" /> : step.num}
                  </div>
                  <span className={`text-[10px] mt-1 font-medium ${currentStep === step.num ? "text-[#0158B7]" : "text-gray-500"
                    }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`h-0.5 flex-1 mx-3 ${currentStep > step.num ? "bg-[#0158B7]" : "bg-gray-200"
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#0158B7]" />
                  Basic Information
                </h2>
                <p className="text-xs text-gray-500">Give your community a name and description</p>
              </div>

              <div className="space-y-4">
                {/* Community Name */}
                <div>
                  <label className={labelClass}>
                    <Users className="w-3 h-3" />
                    Community Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="e.g., AI Researchers Rwanda"
                    maxLength={100}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.name.length}/100 characters (minimum 3)
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>
                    <BookOpen className="w-3 h-3" />
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={inputClass}
                    placeholder="Describe the purpose and goals of your community..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length} characters (minimum 50)
                  </p>
                </div>

                {/* Cover Image */}
                <div>
                  <label className={labelClass}>
                    <ImageIcon className="w-3 h-3" />
                    Cover Image (Optional)
                  </label>
                  <div
                    onClick={() => coverImageRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-[#0158B7] hover:bg-[#0158B7]/5 transition-all"
                  >
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Cover"
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setCoverImage(null)
                            setImagePreview("")
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-xs font-medium text-gray-700 mb-0.5">
                          Click to upload cover image
                        </p>
                        <p className="text-[10px] text-gray-500">JPG, PNG or GIF (Max 5MB)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={coverImageRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Category */}
          {currentStep === 2 && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#0158B7]" />
                  Choose a Category
                </h2>
                <p className="text-xs text-gray-500">Select the field that best represents your community</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon
                  const isSelected = formData.category === cat.value

                  return (
                    <button
                      key={cat.value}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`relative p-3 rounded-lg border transition-all text-left group ${isSelected
                          ? "border-[#0158B7] bg-[#0158B7]/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                    >
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} mb-2`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>

                      <h3 className="font-semibold text-gray-900 text-sm">
                        {cat.value}
                      </h3>

                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#0158B7] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Step 3: Settings */}
          {currentStep === 3 && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-[#0158B7]" />
                  Community Settings
                </h2>
                <p className="text-xs text-gray-500">Configure privacy and membership settings</p>
              </div>

              <div className="space-y-4">
                {/* Community Type */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Community Type <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-2">
                    {COMMUNITY_TYPES.map((type) => {
                      const Icon = type.icon
                      const isSelected = formData.community_type === type.value

                      return (
                        <label
                          key={type.value}
                          className={`relative p-3 border rounded-lg cursor-pointer transition-all flex items-start gap-3 ${isSelected
                              ? `border-[#0158B7] bg-[#0158B7]/10`
                              : "border-gray-200 hover:border-gray-300"
                            }`}
                        >
                          <input
                            type="radio"
                            name="community_type"
                            value={type.value}
                            checked={isSelected}
                            onChange={handleInputChange}
                            className="absolute opacity-0"
                          />
                          <div className={`p-2 rounded bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex-shrink-0`}>
                            <Icon className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-xs mb-0.5">{type.title}</h4>
                            <p className="text-xs text-gray-600">{type.description}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-4 h-4 text-[#0158B7] flex-shrink-0" />
                          )}
                        </label>
                      )
                    })}
                  </div>
                </div>

                {/* Join Approval */}
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.join_approval_required}
                      onChange={handleCheckboxChange}
                      className="w-4 h-4 text-[#0158B7] rounded focus:ring-[#0158B7] mt-0.5"
                    />
                    <div>
                      <span className="text-xs font-semibold text-gray-900 block mb-0.5">
                        Require approval to join
                      </span>
                      <span className="text-xs text-gray-600">
                        Members must be approved by moderators before joining
                      </span>
                    </div>
                  </label>
                </div>

                {/* Community Rules */}
                <div>
                  <label className={labelClass}>
                    <BookOpen className="w-3 h-3" />
                    Community Rules (Optional)
                  </label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    rows={4}
                    className={inputClass}
                    placeholder="List your community guidelines and rules..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-[#0158B7]" />
                  Review & Submit
                </h2>
                <p className="text-xs text-gray-500">Review your community details before submitting</p>
              </div>

              <div className="space-y-3">
                {/* Cover Image Preview */}
                {imagePreview && (
                  <div className="rounded-lg overflow-hidden border border-gray-200">
                    <img src={imagePreview} alt="Cover" className="w-full h-32 object-cover" />
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2">
                  <div className="p-3 bg-[#0158B7]/5 rounded-lg border border-[#0158B7]/20">
                    <p className="text-xs font-semibold text-[#0158B7] mb-0.5">Community Name</p>
                    <p className="text-sm font-bold text-[#0158B7]">{formData.name}</p>
                  </div>

                  <div className="p-3 bg-[#5E96D2]/5 rounded-lg border border-[#5E96D2]/20">
                    <p className="text-xs font-semibold text-[#5E96D2] mb-0.5">Description</p>
                    <p className="text-sm text-[#5E96D2]">{formData.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-[#0158B7]/5 rounded-lg border border-[#0158B7]/20">
                      <p className="text-xs font-semibold text-[#0158B7] mb-0.5">Category</p>
                      <p className="text-sm font-semibold text-[#0158B7]">{formData.category}</p>
                    </div>

                    <div className="p-3 bg-[#5E96D2]/5 rounded-lg border border-[#5E96D2]/20">
                      <p className="text-xs font-semibold text-[#5E96D2] mb-0.5">Type</p>
                      <p className="text-sm font-semibold text-[#5E96D2]">{formData.community_type}</p>
                    </div>
                  </div>

                  {formData.join_approval_required && (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <div>
                        <p className="text-xs font-semibold text-amber-700">Join Approval Required</p>
                        <p className="text-xs text-amber-600">New members need approval</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs">
                <AlertCircle className="w-3 h-3 text-red-600 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${currentStep === 1
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-white border border-gray-300 text-gray-700 hover:border-gray-400"
                  }`}
              >
                Previous
              </button>

              <div className="flex gap-2">
                {currentStep === 4 ? (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow transition-all text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3" />
                        Submit for Approval
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    disabled={!isStepValid()}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${isStepValid()
                        ? "bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white hover:shadow"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                      }`}
                  >
                    Continue
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}