"use client"

import { useState, useRef, useEffect } from "react"
import {
  MoreVertical, Eye, Edit, Send, FileText, Copy, Archive,
  Trash2, Download, Share2, Link as LinkIcon
} from "lucide-react"
import { ResearchProject } from "@/lib/features/auth/projectSlice"

interface ProjectQuickActionsMenuProps {
  project: ResearchProject
  onView: () => void
  onEdit: () => void
  onPublish: () => void
  onDraft: () => void
  onDuplicate: () => void
  onArchive: () => void
  onDelete: () => void
  onShare?: () => void
  isSubmitting?: boolean
}

export default function ProjectQuickActionsMenu({
  project,
  onView,
  onEdit,
  onPublish,
  onDraft,
  onDuplicate,
  onArchive,
  onDelete,
  onShare,
  isSubmitting = false
}: ProjectQuickActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const actions = [
    {
      label: 'View Project',
      icon: Eye,
      onClick: onView,
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      label: 'Edit',
      icon: Edit,
      onClick: onEdit,
      color: 'text-purple-600 hover:bg-purple-50'
    },
    ...(project.status === 'Draft' ? [{
      label: 'Publish',
      icon: Send,
      onClick: onPublish,
      color: 'text-green-600 hover:bg-green-50',
      disabled: isSubmitting
    }] : []),
    ...(project.status === 'Published' ? [{
      label: 'Unpublish',
      icon: FileText,
      onClick: onDraft,
      color: 'text-gray-600 hover:bg-gray-50',
      disabled: isSubmitting
    }] : []),
    {
      label: 'Duplicate',
      icon: Copy,
      onClick: onDuplicate,
      color: 'text-indigo-600 hover:bg-indigo-50',
      disabled: isSubmitting
    },
    ...(onShare ? [{
      label: 'Share',
      icon: Share2,
      onClick: onShare,
      color: 'text-teal-600 hover:bg-teal-50'
    }] : []),
    {
      label: 'Archive',
      icon: Archive,
      onClick: onArchive,
      color: 'text-orange-600 hover:bg-orange-50',
      disabled: isSubmitting
    },
    {
      label: 'Delete',
      icon: Trash2,
      onClick: onDelete,
      color: 'text-red-600 hover:bg-red-50',
      disabled: isSubmitting,
      divider: true
    }
  ]

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="More actions"
      >
        <MoreVertical className="w-4 h-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-10">
          {actions.map((action, idx) => {
            const Icon = action.icon
            return (
              <div key={idx}>
                {action.divider && <div className="my-1 border-t border-gray-200" />}
                <button
                  onClick={() => {
                    action.onClick()
                    setIsOpen(false)
                  }}
                  disabled={action.disabled}
                  className={`w-full px-4 py-2 text-left text-sm font-medium flex items-center gap-3 transition-colors ${action.color} disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Icon className="w-4 h-4" />
                  {action.label}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}