"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { createProject, updateProject, fetchProjectById } from "@/lib/features/auth/projectSlice"
import RichTextEditor from "@/components/ui/richTextEditor"
import {
  FileText, Upload, Image as ImageIcon, X, Plus, Loader2,
  Save, Eye, Send, Tag, Calendar, Globe, Users, Check,
  AlertCircle, Paperclip, BookOpen, Sparkles, ArrowLeft,GraduationCap
} from "lucide-react"

const ACADEMIC_LEVELS = [
  { value: "", label: "Select Level" },
  { value: "Undergraduate", label: "Undergraduate" },
  { value: "Masters", label: "Masters" },
  { value: "PhD", label: "PhD" },
  { value: "Researcher", label: "Researcher" },
  { value: "Diaspora", label: "Diaspora" },
  { value: "Institution", label: "Institution" }
]

const RESEARCH_TYPES = ["Thesis", "Paper", "Project", "Dataset", "Case Study"]
const VISIBILITY_OPTIONS = ["Public", "Community-Only", "Private"]
const COLLABORATION_OPTIONS = ["Solo", "Seeking Collaborators"]
const FIELD_OF_STUDY = [
  "Health Sciences", "Technology & Engineering", "Agriculture",
  "Social Sciences", "Natural Sciences", "Business & Economics",
  "Environmental Studies", "Education", "Arts & Humanities", "Other"
]

export default function UploadResearchProject() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { isSubmitting, error } = useAppSelector(state => state.projects)

  const projectFileRef = useRef<HTMLInputElement>(null)
  const coverImageRef = useRef<HTMLInputElement>(null)
  const additionalFilesRef = useRef<HTMLInputElement>(null)

  // Get edit mode from URL
  const editProjectId = searchParams.get('edit')
  const isEditMode = !!editProjectId

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoadingProject, setIsLoadingProject] = useState(false)
const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    full_description: '',
    research_type: 'Paper',
    field_of_study: '',
    academic_level: '',
    publication_date: '',
    doi: '',
    visibility: 'Public',
    collaboration_status: 'Solo',
    tags: [] as string[],
    share_in_communities: [] as string[]
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

  const [existingFiles, setExistingFiles] = useState({
    project_file_url: '',
    cover_image_url: '',
    additional_files: [] as any[]
  })

  const [newTag, setNewTag] = useState('')
  const [wordCount, setWordCount] = useState(0)

  // Load project data if in edit mode
  useEffect(() => {
    if (isEditMode && editProjectId) {
      loadProjectForEdit(editProjectId)
    }
  }, [isEditMode, editProjectId])

  const loadProjectForEdit = async (projectId: string) => {
    setIsLoadingProject(true)
    try {
      const result = await dispatch(fetchProjectById(projectId)).unwrap()
      const project = result.project

      // Populate form with existing data
      setFormData({
        title: project.title || '',
        abstract: project.abstract || '',
        full_description: project.full_description || '',
        research_type: project.research_type || 'Paper',
        field_of_study: project.field_of_study || '',
        publication_date: project.publication_date || '',
        doi: project.doi || '',
        academic_level: project.academic_level || '', 
        visibility: project.visibility || 'Public',
        collaboration_status: project.collaboration_status || 'Solo',
        tags: project.tags?.map((t: any) => t.name) || [],
        share_in_communities: []
      })

      // Set existing files
      setExistingFiles({
        project_file_url: project.project_file_url || '',
        cover_image_url: project.cover_image_url || '',
        additional_files: project.files || []
      })

      // Set previews for existing files
      setPreviews({
        project_file: project.project_file_url ? 'Existing file' : '',
        cover_image: project.cover_image_url || '',
        additional_files: project.files?.map((f: any) => f.file_name) || []
      })

      // Calculate word count
      if (project.abstract) {
        const text = project.abstract.replace(/<[^>]*>/g, '').trim()
        setWordCount(text.split(/\s+/).filter(Boolean).length)
      }

    } catch (err) {
      console.error('Failed to load project:', err)
      alert('Failed to load project for editing')
      router.push('/dashboard/user/research/manage')
    } finally {
      setIsLoadingProject(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleRichTextChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))

    if (name === 'abstract') {
      const text = value.replace(/<[^>]*>/g, '').trim()
      setWordCount(text.split(/\s+/).filter(Boolean).length)
    }
  }

  const validateFile = (file: File, maxSizeMB: number = 10): { valid: boolean; error?: string } => {
    const maxSize = maxSizeMB * 1024 * 1024;

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File "${file.name}" exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`
      };
    }

    return { valid: true };
  };

  const handleProjectFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFile(file, 10);
      if (!validation.valid) {
        alert(validation.error);
        return;
      }
      setFiles(prev => ({ ...prev, project_file: file }))
      setPreviews(prev => ({ ...prev, project_file: file.name }))
    }
  }

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validation = validateFile(file, 5);
      if (!validation.valid) {
        alert(validation.error);
        return;
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
      const validation = validateFile(file, 10);
      if (!validation.valid) {
        alert(validation.error);
        return;
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
      alert("Maximum 5 additional files allowed");
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

  const handleSubmit = async (status: 'Draft' | 'Published') => {
    const submitData = new FormData()

    submitData.append('title', formData.title)
    submitData.append('abstract', formData.abstract)
    submitData.append('full_description', formData.full_description)
    submitData.append('research_type', formData.research_type)
    submitData.append('visibility', formData.visibility)
    submitData.append('collaboration_status', formData.collaboration_status)
    submitData.append('tags', JSON.stringify(formData.tags))

    if (formData.field_of_study) submitData.append('field_of_study', formData.field_of_study)
    if (formData.publication_date) submitData.append('publication_date', formData.publication_date)
    if (formData.doi) submitData.append('doi', formData.doi)
    if (formData.academic_level) submitData.append('academic_level', formData.academic_level)

    // Only append new files if they exist
    if (files.project_file) submitData.append('project_file', files.project_file)
    if (files.cover_image) submitData.append('cover_image', files.cover_image)
    files.additional_files.forEach(file => {
      submitData.append('additional_files', file)
    })

    try {
      if (isEditMode && editProjectId) {
        // Update existing project
        await dispatch(updateProject({ id: editProjectId, updates: submitData })).unwrap()
        router.push(`/dashboard/user/research/${editProjectId}`)
      } else {
        // Create new project
        const result = await dispatch(createProject(submitData)).unwrap()
        router.push(`/dashboard/user/research/post-upload/${result.id}`)
      }
    } catch (err) {
      console.error('Failed to save project:', err)
    }
  }

  const steps = [
    { number: 1, title: 'Basic Info', icon: BookOpen },
    { number: 2, title: 'Files', icon: Upload },
    { number: 3, title: 'Details', icon: Tag },
    { number: 4, title: 'Settings', icon: Globe }
  ]

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white hover:border-gray-300"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5"

  if (isLoadingProject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0158B7] mx-auto mb-3" />
          <p className="text-sm text-gray-600">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-[#0158B7]/5 to-[#5E96D2]/5 p-3">
      <div className="max-w-6xl mx-auto">

        {/* Compact Header */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-xs text-gray-600 hover:text-[#0158B7] transition-colors font-medium mb-3 group"
          >
            <ArrowLeft className="w-3 h-3 mr-1.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                {isEditMode ? 'Edit Research Project' : 'Upload Research Project'}
              </h1>
              <p className="text-xs text-gray-500">
                {isEditMode ? 'Update your research information' : 'Share your research with the community'}
              </p>
            </div>
          </div>
        </div>

        {/* Compact Progress Steps */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isActive = currentStep === step.number
              const isCompleted = currentStep > step.number

              return (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isCompleted
                        ? 'bg-[#0158B7] text-white'
                        : isActive
                          ? 'bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#0158B7]' : 'text-gray-500'}`}>
                      {step.title}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-3 ${isCompleted ? 'bg-[#0158B7]' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Compact Form */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-[#0158B7]" />
                  Basic Information
                </h2>
                <p className="text-xs text-gray-500">Tell us about your research project</p>
              </div>

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
                </div>
                </div>

                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3" />
                    Abstract <span className="text-red-500">*</span>
                    <span className={`ml-auto text-xs ${wordCount < 200 ? 'text-red-500' : wordCount > 500 ? 'text-red-500' : 'text-[#0158B7]'
                      }`}>
                      {wordCount}/200-500 words
                    </span>
                  </label>
                  <RichTextEditor
                    value={formData.abstract}
                    onChange={(value) => handleRichTextChange('abstract', value)}
                    placeholder="Provide a concise abstract of your research (200-500 words)"
                    className="min-h-[200px]"
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    <FileText className="w-3 h-3" />
                    Full Description (Optional)
                  </label>
                  <RichTextEditor
                    value={formData.full_description}
                    onChange={(value) => handleRichTextChange('full_description', value)}
                    placeholder="Detailed information about methodology, findings, and conclusions"
                    className="min-h-[200px]"
                  />
                </div>
              </div>
          
          )}

          {/* Step 2: Files */}
          {currentStep === 2 && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-[#0158B7]" />
                  Upload Files
                </h2>
                <p className="text-xs text-gray-500">Add your research documents and supporting files</p>
              </div>

              <div className="space-y-4">
                {/* Project File */}
                <div>
                  <label className={labelClass}>
                    <Paperclip className="w-3 h-3" />
                    Project File {!isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  
                  {/* Show existing file in edit mode */}
                  {isEditMode && existingFiles.project_file_url && !files.project_file && (
                    <div className="mb-2 p-2 bg-blue-50 rounded border border-blue-200 text-xs">
                      <span className="text-blue-700">Current file: Existing research document</span>
                    </div>
                  )}
                  
                  <div
                    onClick={() => projectFileRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-[#0158B7] hover:bg-[#0158B7]/5 transition-all"
                  >
                    {previews.project_file ? (
                      <div className="flex items-center justify-center gap-2">
                        <FileText className="w-4 h-4 text-[#0158B7]" />
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
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs font-medium text-gray-700 mb-0.5">
                          {isEditMode ? 'Click to upload new project file (optional)' : 'Click to upload project file'}
                        </p>
                        <p className="text-[10px] text-gray-500">PDF or DOCX (Max 50MB)</p>
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
                  
                  {/* Show existing image in edit mode */}
                  {isEditMode && existingFiles.cover_image_url && !files.cover_image && (
                    <div className="mb-2">
                      <img src={existingFiles.cover_image_url} alt="Current cover" className="w-full h-32 object-cover rounded" />
                      <p className="text-xs text-blue-700 mt-1">Current cover image</p>
                    </div>
                  )}
                  
                  <div
                    onClick={() => coverImageRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-[#5E96D2] hover:bg-[#5E96D2]/5 transition-all"
                  >
                    {previews.cover_image && files.cover_image ? (
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
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs font-medium text-gray-700 mb-0.5">
                          {isEditMode && existingFiles.cover_image_url ? 'Click to upload new cover image' : 'Click to upload cover image'}
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
                    className={`border-2 border-dashed border-gray-300 rounded-lg p-3 text-center cursor-pointer hover:border-[#0158B7] hover:bg-[#0158B7]/5 transition-all ${files.additional_files.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
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
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-[#0158B7]" />
                  Additional Details
                </h2>
                <p className="text-xs text-gray-500">Add tags and metadata to help discovery</p>
              </div>

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
                      placeholder="Enter tags (e.g., Machine Learning, Healthcare)"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-3 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow transition-all flex items-center gap-1 text-xs font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-gradient-to-r from-[#0158B7]/10 to-[#5E96D2]/10 text-[#0158B7] rounded text-xs font-medium flex items-center gap-1 border border-[#0158B7]/20"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-[#0158B7]/80"
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
            </div>
          )}

          {/* Step 4: Settings */}
          {currentStep === 4 && (
            <div className="p-4">
              <div className="mb-4">
                <h2 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#0158B7]" />
                  Sharing & Visibility
                </h2>
                <p className="text-xs text-gray-500">Choose who can see your research</p>
              </div>

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
                        className={`relative p-3 border rounded-lg cursor-pointer transition-all ${formData.visibility === option
                            ? 'border-[#0158B7] bg-[#0158B7]/10'
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
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.visibility === option
                              ? 'border-[#0158B7] bg-[#0158B7]'
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
                        className={`relative p-3 border rounded-lg cursor-pointer transition-all ${formData.collaboration_status === option
                            ? 'border-[#5E96D2] bg-[#5E96D2]/10'
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
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.collaboration_status === option
                              ? 'border-[#5E96D2] bg-[#5E96D2]'
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
              </div>
            </div>
          )}

          {/* Compact Navigation Footer */}
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
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
              >
                Previous
              </button>

              <div className="flex gap-2">
                {currentStep === 4 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSubmit('Published')}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow transition-all text-xs font-semibold flex items-center gap-1 disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          {isEditMode ? 'Updating...' : 'Publishing...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          {isEditMode ? 'Update' : 'Submit'}
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                    className="px-4 py-2 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow transition-all text-xs font-semibold"
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