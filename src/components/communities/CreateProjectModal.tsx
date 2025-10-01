import { useState, useRef } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createCommunityProject } from "@/lib/features/auth/projectSlice"
import {
  FileText, Upload, Image as ImageIcon, X, Plus, Loader2,
  Paperclip, BookOpen, Tag, Calendar, Globe, Users, Check,
  AlertCircle, ArrowLeft, ArrowRight, GraduationCap // ADDED: GraduationCap icon
} from "lucide-react"

const RESEARCH_TYPES = ["Thesis", "Paper", "Project", "Dataset", "Case Study"]
const VISIBILITY_OPTIONS = ["Public", "Community-Only", "Private"]
const COLLABORATION_OPTIONS = ["Solo", "Seeking Collaborators"]
const FIELD_OF_STUDY = [
  "Health Sciences", "Technology & Engineering", "Agriculture",
  "Social Sciences", "Natural Sciences", "Business & Economics",
  "Environmental Studies", "Education", "Arts & Humanities", "Other"
]
// NEW: Academic Levels constant
const ACADEMIC_LEVELS = [
  { value: "", label: "Select Academic Level" },
  { value: "Undergraduate", label: "Undergraduate" },
  { value: "Masters", label: "Masters" },
  { value: "PhD", label: "PhD" },
  { value: "Researcher", label: "Researcher" },
  { value: "Diaspora", label: "Diaspora" },
  { value: "Institution", label: "Institution" }
]

interface CreateProjectModalProps {
  isOpen: boolean
  onClose: () => void
  communityId: string
  communityName: string
  onSuccess?: (projectId: string) => void
}

export default function CreateProjectModal({
  isOpen,
  onClose,
  communityId,
  communityName,
  onSuccess
}: CreateProjectModalProps) {
  const dispatch = useAppDispatch()
  const { isSubmitting, error } = useAppSelector(state => state.projects)

  const projectFileRef = useRef<HTMLInputElement>(null)
  const coverImageRef = useRef<HTMLInputElement>(null)
  const additionalFilesRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    full_description: '',
    research_type: 'Paper',
    field_of_study: '',
    academic_level: '', // NEW: Academic level field
    publication_date: '',
    doi: '',
    visibility: 'Public',
    collaboration_status: 'Solo',
    tags: [] as string[]
  })

  const [files, setFiles] = useState({
    project_file: null as File | null,
    cover_image: null as File | null,
    additional_files: [] as File[]
  })

  const [previews, setPreviews] = useState({
    project_file: '',
    cover_image: '',
    additional_files: [] as string[]
  })

  const [newTag, setNewTag] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [submitError, setSubmitError] = useState('')

  if (!isOpen) return null

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (name === 'abstract') {
      setWordCount(value.trim().split(/\s+/).filter(Boolean).length)
    }
  }

  const validateFile = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
    const maxSize = maxSizeMB * 1024 * 1024
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds ${maxSizeMB}MB limit`
      }
    }
    
    return { valid: true }
  }

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFile(file, 10)
      if (!validation.valid) {
        alert(validation.error)
        return
      }
      setFiles(prev => ({ ...prev, project_file: file }))
      setPreviews(prev => ({ ...prev, project_file: file.name }))
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFile(file, 5)
      if (!validation.valid) {
        alert(validation.error)
        return
      }
      setFiles(prev => ({ ...prev, cover_image: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, cover_image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAdditionalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || [])
    
    for (const file of newFiles) {
      const validation = validateFile(file, 10)
      if (!validation.valid) {
        alert(validation.error)
        return
      }
    }
    
    if (files.additional_files.length + newFiles.length <= 5) {
      setFiles(prev => ({
        ...prev,
        additional_files: [...prev.additional_files, ...newFiles]
      }))
      setPreviews(prev => ({
        ...prev,
        additional_files: [...prev.additional_files, ...newFiles.map(f => f.name)]
      }))
    } else {
      alert("Maximum 5 additional files allowed")
    }
  }

  const removeAdditionalFile = (index: number) => {
    setFiles(prev => ({
      ...prev,
      additional_files: prev.additional_files.filter((_, i) => i !== index)
    }))
    setPreviews(prev => ({
      ...prev,
      additional_files: prev.additional_files.filter((_, i) => i !== index)
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = async () => {
    setSubmitError('');
    
    const submitData = new FormData();
    
    submitData.append('title', formData.title);
    submitData.append('abstract', formData.abstract);
    submitData.append('full_description', formData.full_description);
    submitData.append('research_type', formData.research_type);
    submitData.append('visibility', formData.visibility);
    submitData.append('collaboration_status', formData.collaboration_status);
    submitData.append('tags', JSON.stringify(formData.tags));
    
    if (formData.field_of_study) submitData.append('field_of_study', formData.field_of_study);
    if (formData.publication_date) submitData.append('publication_date', formData.publication_date);
    if (formData.doi) submitData.append('doi', formData.doi);
    if (formData.academic_level) submitData.append('academic_level', formData.academic_level); // NEW: Add academic level

    if (files.project_file) submitData.append('project_file', files.project_file);
    if (files.cover_image) submitData.append('cover_image', files.cover_image);
    files.additional_files.forEach(file => {
      submitData.append('additional_files', file);
    });

    try {
      const result = await dispatch(createCommunityProject({
        communityId,
        formData: submitData
      })).unwrap();
      
      console.log("✅ Project created successfully:", result);
      
      if (onSuccess) {
        onSuccess(result.id);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to create project:', err);
      setSubmitError(err || 'Failed to create project');
    }
  };

  const steps = [
    { number: 1, title: 'Basic Info', icon: BookOpen },
    { number: 2, title: 'Files', icon: Upload },
    { number: 3, title: 'Details', icon: Tag },
    { number: 4, title: 'Settings', icon: Globe }
  ]

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto pt-20">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col my-8">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Create Project Research</h2>
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
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={inputClass}
                  placeholder="Enter your research project title"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3" />
                    Research Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="research_type"
                    value={formData.research_type}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    {RESEARCH_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    <BookOpen className="w-3 h-3" />
                    Field of Study <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="field_of_study"
                    value={formData.field_of_study}
                    onChange={handleInputChange}
                    className={inputClass}
                    required
                  >
                    <option value="">Select field</option>
                    {FIELD_OF_STUDY.map(field => (
                      <option key={field} value={field}>{field}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* NEW: Academic Level Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>
                    <GraduationCap className="w-3 h-3" />
                    Academic Level
                  </label>
                  <select
                    name="academic_level"
                    value={formData.academic_level}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    {ACADEMIC_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div></div> {/* Empty div for grid alignment */}
              </div>

              <div>
                <label className={labelClass}>
                  <FileText className="w-3 h-3" />
                  Abstract <span className="text-red-500">*</span>
                  <span className={`ml-auto text-xs ${
                    wordCount < 200 ? 'text-red-500' : wordCount > 500 ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {wordCount}/200-500 words
                  </span>
                </label>
                <textarea
                  name="abstract"
                  value={formData.abstract}
                  onChange={handleInputChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Provide a concise abstract (200-500 words)"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>
                  <FileText className="w-3 h-3" />
                  Full Description (Optional)
                </label>
                <textarea
                  name="full_description"
                  value={formData.full_description}
                  onChange={handleInputChange}
                  rows={4}
                  className={inputClass}
                  placeholder="Detailed information about methodology, findings, and conclusions"
                />
              </div>
            </div>
          )}

          {/* Step 2: Files - REMAINS EXACTLY THE SAME */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {/* Project File */}
              <div>
                <label className={labelClass}>
                  <Paperclip className="w-3 h-3" />
                  Project File <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => projectFileRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all"
                >
                  {previews.project_file ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-medium text-gray-700 truncate">{previews.project_file}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setFiles(prev => ({ ...prev, project_file: null }))
                          setPreviews(prev => ({ ...prev, project_file: '' }))
                        }}
                        className="p-0.5 hover:bg-red-100 rounded"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs font-medium text-gray-700 mb-0.5">
                        Click to upload project file
                      </p>
                      <p className="text-[10px] text-gray-500">PDF or DOCX (Max 10MB)</p>
                    </>
                  )}
                </div>
                <input
                  ref={projectFileRef}
                  type="file"
                  accept=".pdf,.docx,.doc"
                  onChange={handleProjectFileChange}
                  className="hidden"
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className={labelClass}>
                  <ImageIcon className="w-3 h-3" />
                  Cover Image (Optional)
                </label>
                <div
                  onClick={() => coverImageRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50/30 transition-all"
                >
                  {previews.cover_image ? (
                    <div className="relative">
                      <img
                        src={previews.cover_image}
                        alt="Cover"
                        className="w-full h-32 object-cover rounded"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setFiles(prev => ({ ...prev, cover_image: null }))
                          setPreviews(prev => ({ ...prev, cover_image: '' }))
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-2" />
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
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </div>

              {/* Additional Files */}
              <div>
                <label className={labelClass}>
                  <Paperclip className="w-3 h-3" />
                  Additional Files (Optional)
                  <span className="ml-auto text-xs text-gray-500">{files.additional_files.length}/5</span>
                </label>
                <div
                  onClick={() => files.additional_files.length < 5 && additionalFilesRef.current?.click()}
                  className={`border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/30 transition-all ${
                    files.additional_files.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Plus className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs font-medium text-gray-700">
                    Add supporting documents
                  </p>
                </div>
                <input
                  ref={additionalFilesRef}
                  type="file"
                  multiple
                  onChange={handleAdditionalFilesChange}
                  className="hidden"
                />
                
                {files.additional_files.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {previews.additional_files.map((name, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <div className="flex items-center gap-2">
                          <Paperclip className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-700 truncate">{name}</span>
                        </div>
                        <button
                          onClick={() => removeAdditionalFile(idx)}
                          className="p-0.5 hover:bg-red-100 rounded"
                        >
                          <X className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Details - REMAINS EXACTLY THE SAME */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {/* Tags */}
              <div>
                <label className={labelClass}>
                  <Tag className="w-3 h-3" />
                  Research Tags <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className={inputClass + " flex-1"}
                    placeholder="Enter tags (e.g., Machine Learning)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow transition-all flex items-center gap-1 text-xs font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {formData.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 rounded text-xs font-medium flex items-center gap-1 border border-blue-100"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Publication Date */}
                <div>
                  <label className={labelClass}>
                    <Calendar className="w-3 h-3" />
                    Publication Date
                  </label>
                  <input
                    type="date"
                    name="publication_date"
                    value={formData.publication_date}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                {/* DOI */}
                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3" />
                    DOI
                  </label>
                  <input
                    type="text"
                    name="doi"
                    value={formData.doi}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="10.1234/example.doi"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Settings - REMAINS EXACTLY THE SAME */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {/* Visibility */}
              <div>
                <label className={labelClass}>
                  <Globe className="w-3 h-3" />
                  Visibility <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {VISIBILITY_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.visibility === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="visibility"
                        value={option}
                        checked={formData.visibility === option}
                        onChange={handleInputChange}
                        className="absolute opacity-0"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formData.visibility === option
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.visibility === option && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Collaboration Status */}
              <div>
                <label className={labelClass}>
                  <Users className="w-3 h-3" />
                  Collaboration Status <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {COLLABORATION_OPTIONS.map((option) => (
                    <label
                      key={option}
                      className={`relative p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.collaboration_status === option
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="collaboration_status"
                        value={option}
                        checked={formData.collaboration_status === option}
                        onChange={handleInputChange}
                        className="absolute opacity-0"
                      />
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          formData.collaboration_status === option
                            ? 'border-emerald-500 bg-emerald-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.collaboration_status === option && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-blue-900 mb-1">
                      Community Project
                    </h4>
                    <ul className="text-[10px] text-blue-700 space-y-0.5">
                      <li>• Will be shared in {communityName}</li>
                      <li>• Visible to all community members</li>
                      <li>• Can be discovered through search</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {(error || submitError) && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-red-700">{submitError || error}</p>
            </div>
          )}
        </div>

        {/* Footer - REMAINS EXACTLY THE SAME */}
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
            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>

          {currentStep === 4 ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.title || !formData.abstract || !files.project_file}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Project
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
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