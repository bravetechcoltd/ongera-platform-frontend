"use client"

import { useState, useEffect } from "react"
import { X, Save, Loader2, Tag, Globe, Users, BookOpen } from "lucide-react"
import { ResearchProject } from "@/lib/features/auth/projectSlice"

interface QuickEditProjectModalProps {
  project: ResearchProject
  onClose: () => void
  onSave: (id: string, updates: Partial<ResearchProject>) => Promise<void>
  isSubmitting?: boolean
}

const VISIBILITY_OPTIONS = ["Public", "Community-Only", "Private"]
const COLLABORATION_OPTIONS = ["Solo", "Seeking Collaborators", "Collaborative"]
const RESEARCH_TYPES = ["Thesis", "Paper", "Project", "Dataset", "Case Study"]

export default function QuickEditProjectModal({
  project,
  onClose,
  onSave,
  isSubmitting = false
}: QuickEditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    abstract: project.abstract,
    research_type: project.research_type,
    visibility: project.visibility,
    collaboration_status: project.collaboration_status,
    field_of_study: project.field_of_study || ''
  })

  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const changed = 
      formData.title !== project.title ||
      formData.abstract !== project.abstract ||
      formData.research_type !== project.research_type ||
      formData.visibility !== project.visibility ||
      formData.collaboration_status !== project.collaboration_status ||
      formData.field_of_study !== (project.field_of_study || '')
    
    setHasChanges(changed)
  }, [formData, project])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return
    
    await onSave(project.id, formData)
  }

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5"

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Quick Edit Project</h3>
            <p className="text-sm text-gray-600 mt-0.5">Make quick changes to your project</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Title */}
          <div>
            <label className={labelClass}>
              Project Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={inputClass}
              required
            />
          </div>

          {/* Research Type & Field */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                <BookOpen className="w-3 h-3 inline mr-1" />
                Research Type
              </label>
              <select
                name="research_type"
                value={formData.research_type}
                onChange={handleChange}
                className={inputClass}
              >
                {RESEARCH_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>
                Field of Study
              </label>
              <input
                type="text"
                name="field_of_study"
                value={formData.field_of_study}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., Computer Science"
              />
            </div>
          </div>

          {/* Abstract */}
          <div>
            <label className={labelClass}>
              Abstract <span className="text-red-500">*</span>
            </label>
            <textarea
              name="abstract"
              value={formData.abstract}
              onChange={handleChange}
              rows={4}
              className={inputClass}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.abstract.length} characters
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label className={labelClass}>
              <Globe className="w-3 h-3 inline mr-1" />
              Visibility
            </label>
            <div className="grid grid-cols-3 gap-2">
              {VISIBILITY_OPTIONS.map(option => (
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
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <span className="text-sm font-medium text-gray-900 block text-center">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Collaboration Status */}
          <div>
            <label className={labelClass}>
              <Users className="w-3 h-3 inline mr-1" />
              Collaboration Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLLABORATION_OPTIONS.map(option => (
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
                    onChange={handleChange}
                    className="absolute opacity-0"
                  />
                  <span className="text-xs font-medium text-gray-900 block text-center">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Change indicator */}
          {hasChanges && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                You have unsaved changes
              </p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !hasChanges}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}