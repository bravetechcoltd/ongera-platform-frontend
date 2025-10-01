"use client"

import type React from "react"
import { useState } from "react"
import { X, ImageIcon, Video, FileText } from "lucide-react"
import { useAppDispatch } from "@/lib/hooks"
import { toggleMediaGallery } from "../../lib/features/communityChat/communityChatSlice"

interface MediaGalleryProps {
  communityId: string
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ communityId }) => {
  const dispatch = useAppDispatch()
  const [activeTab, setActiveTab] = useState<"all" | "images" | "videos" | "documents">("all")

  const tabs = [
    { id: "all", label: "All", icon: FileText },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "videos", label: "Videos", icon: Video },
    { id: "documents", label: "Documents", icon: FileText },
  ]

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Media Gallery</h3>
        <button
          onClick={() => dispatch(toggleMediaGallery(false))}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex space-x-2 p-4 border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? "bg-[#0158B7] text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              <Icon size={16} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ImageIcon size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No media files yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Shared images, videos, and documents will appear here
          </p>
        </div>
      </div>
    </div>
  )
}

export default MediaGallery
