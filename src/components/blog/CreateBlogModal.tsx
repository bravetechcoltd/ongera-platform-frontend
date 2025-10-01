import { useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createCommunityBlog } from "@/lib/features/auth/blogSlices"
import {
  FileText, Upload, Image as ImageIcon, X, Loader2,
  BookOpen, Tag, ArrowLeft, ArrowRight, Check, AlertCircle
} from "lucide-react"

const BLOG_CATEGORIES = [
  "Technology", "Research", "Health", "Education", "Agriculture",
  "Environment", "Business", "Social Impact", "Innovation", "Other"
]

interface CreateBlogModalProps {
  isOpen: boolean
  onClose: () => void
  communityId: string
  communityName: string
  onSuccess?: (blogId: string) => void
}

export default function CreateBlogModal({
  isOpen,
  onClose,
  communityId,
  communityName,
  onSuccess
}: CreateBlogModalProps) {
  const dispatch = useAppDispatch()
  const { isSubmitting } = useAppSelector(state => state.blog)

  const coverImageRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Technology'
  })

  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [wordCount, setWordCount] = useState({ excerpt: 0, content: 0 })

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'excerpt') {
      setWordCount(prev => ({
        ...prev,
        excerpt: value.trim().split(/\s+/).filter(Boolean).length
      }))
    } else if (name === 'content') {
      setWordCount(prev => ({
        ...prev,
        content: value.trim().split(/\s+/).filter(Boolean).length
      }))
    }
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

  const removeImage = () => {
    setCoverImage(null)
    setImagePreview(null)
    if (coverImageRef.current) {
      coverImageRef.current.value = ''
    }
  }

  const handleSubmit = async () => {
    setSubmitError('')
    
    // Validation
    if (!formData.title.trim()) {
      setSubmitError('Title is required')
      return
    }
    
    if (wordCount.excerpt < 20 || wordCount.excerpt > 100) {
      setSubmitError('Excerpt must be 20-100 words')
      return
    }
    
    if (wordCount.content < 200) {
      setSubmitError('Content must be at least 200 words')
      return
    }

    const submitData = new FormData()
    submitData.append('title', formData.title)
    submitData.append('excerpt', formData.excerpt)
    submitData.append('content', formData.content)
    submitData.append('category', formData.category)
    
    if (coverImage) {
      submitData.append('cover_image', coverImage)
    }

    try {
      const result = await dispatch(createCommunityBlog({
        communityId,
        formData: submitData
      })).unwrap()
      
      console.log("✅ Blog created successfully:", result)
      
      if (onSuccess) {
        onSuccess(result.id)
      }
      
      // Reset form
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        category: 'Technology'
      })
      setCoverImage(null)
      setImagePreview(null)
      setCurrentStep(1)
      
      onClose()
    } catch (err: any) {
      console.error('Failed to create blog:', err)
      setSubmitError(err || 'Failed to create blog')
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info', icon: BookOpen },
    { number: 2, title: 'Content', icon: FileText },
    { number: 3, title: 'Cover Image', icon: ImageIcon }
  ]

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto pt-20">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Blog Post</h2>
            <p className="text-sm text-gray-600">For {communityName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number
              
              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isActive
                        ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 ${
                      isCompleted ? 'bg-emerald-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  <FileText className="w-3 h-3" />
                  Blog Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={inputClass}
                  placeholder="Enter an engaging blog title"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  <Tag className="w-3 h-3" />
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={inputClass}
                >
                  {BLOG_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  <FileText className="w-3 h-3" />
                  Excerpt <span className="text-red-500">*</span>
                  <span className={`ml-auto text-xs ${
                    wordCount.excerpt < 20 ? 'text-red-500' : 
                    wordCount.excerpt > 100 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {wordCount.excerpt}/20-100 words
                  </span>
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  className={inputClass}
                  placeholder="Write a brief summary that captures the essence of your blog (20-100 words)"
                  required
                />
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-blue-900 mb-1">
                      Blog Guidelines
                    </h4>
                    <ul className="text-[10px] text-blue-700 space-y-0.5">
                      <li>• Excerpt should be 20-100 words</li>
                      <li>• Main content should be at least 200 words</li>
                      <li>• Choose a category that best fits your content</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  <FileText className="w-3 h-3" />
                  Blog Content <span className="text-red-500">*</span>
                  <span className={`ml-auto text-xs ${
                    wordCount.content < 200 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {wordCount.content} words (min 200)
                  </span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={16}
                  className={inputClass + " resize-none"}
                  placeholder="Write your blog content here... Share your insights, research findings, or stories with the community."
                  required
                />
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                <div className="flex gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-900 mb-1">
                      Content Tips
                    </h4>
                    <ul className="text-[10px] text-emerald-700 space-y-0.5">
                      <li>• Structure your content with clear paragraphs</li>
                      <li>• Use engaging language that resonates with readers</li>
                      <li>• Include relevant examples or case studies</li>
                      <li>• End with a clear conclusion or call-to-action</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Cover Image */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className={labelClass}>
                  <ImageIcon className="w-3 h-3" />
                  Cover Image <span className="text-gray-500 font-normal">(Optional)</span>
                </label>
                
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Cover preview"
                      className="w-full h-64 object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => coverImageRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 transition-all"
                  >
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      Click to upload a cover image
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG or GIF (Max 5MB)
                    </p>
                  </div>
                )}
                
                <input
                  ref={coverImageRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                <div className="flex gap-2">
                  <ImageIcon className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-purple-900 mb-1">
                      Image Best Practices
                    </h4>
                    <ul className="text-[10px] text-purple-700 space-y-0.5">
                      <li>• Use high-quality, relevant images</li>
                      <li>• Recommended size: 1200x630px</li>
                      <li>• Images enhance engagement and sharing</li>
                      <li>• You can skip this step if you don't have one</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Blog Summary</h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Title:</span>
                    <span className="text-gray-900 font-medium truncate ml-2 max-w-[200px]">
                      {formData.title || 'Not set'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-gray-900 font-medium">{formData.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Excerpt:</span>
                    <span className="text-gray-900 font-medium">{wordCount.excerpt} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Content:</span>
                    <span className="text-gray-900 font-medium">{wordCount.content} words</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cover Image:</span>
                    <span className="text-gray-900 font-medium">{coverImage ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {submitError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{submitError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (currentStep === 1) {
                onClose()
              } else {
                setCurrentStep(currentStep - 1)
              }
            }}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-all disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>

          {currentStep === 3 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || wordCount.excerpt < 20 || wordCount.content < 200}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Publish Blog
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={
                (currentStep === 1 && (!formData.title || wordCount.excerpt < 20 || wordCount.excerpt > 100)) ||
                (currentStep === 2 && wordCount.content < 200)
              }
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}