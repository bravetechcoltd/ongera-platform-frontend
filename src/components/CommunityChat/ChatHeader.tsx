"use client"

import type React from "react"
import { X, Search, ImageIcon, Info, Menu, Users } from "lucide-react"
import { setSearchQuery, toggleMediaGallery } from "../../lib/features/communityChat/communityChatSlice"
import { useAppDispatch } from "@/lib/hooks"

interface ChatHeaderProps {
  communityName: string
  communityAvatar?: string
  onlineCount: number
  onClose: () => void
  onToggleSidebar: () => void
  onToggleOnlineList: () => void
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  communityName,
  communityAvatar,
  onlineCount,
  onClose,
  onToggleSidebar,
  onToggleOnlineList,
}) => {
  const dispatch = useAppDispatch()

  return (
    <div className="bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 dark:from-gray-800/95 dark:via-gray-750/95 dark:to-gray-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        
        {/* Left Section - Community Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors lg:hidden flex-shrink-0"
            title="Toggle sidebar"
          >
            <Menu size={18} />
          </button>

          {communityAvatar ? (
            <img
              src={communityAvatar}
              alt={communityName}
              className="w-9 h-9 rounded-full object-cover border-2 border-[#0158B7] flex-shrink-0"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {communityName.charAt(0)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-gray-900 dark:text-white truncate">{communityName}</h2>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse flex-shrink-0"></div>
              <span className="truncate">{onlineCount} online</span>
            </div>
          </div>
        </div>

        {/* Right Section - Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => dispatch(setSearchQuery(""))}
            className="p-1.5 rounded-lg hover:bg-[#0158B7]/10 text-[#0158B7] dark:text-[#5E96D2] transition-colors"
            title="Search messages"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => dispatch(toggleMediaGallery(true))}
            className="p-1.5 rounded-lg hover:bg-[#0158B7]/10 text-[#0158B7] dark:text-[#5E96D2] transition-colors"
            title="Media gallery"
          >
            <ImageIcon size={18} />
          </button>

          <button
            onClick={onToggleOnlineList}
            className="p-1.5 rounded-lg hover:bg-[#0158B7]/10 text-[#0158B7] dark:text-[#5E96D2] transition-colors hidden lg:block"
            title="Online members"
          >
            <Users size={18} />
          </button>

          <button
            className="p-1.5 rounded-lg hover:bg-[#0158B7]/10 text-[#0158B7] dark:text-[#5E96D2] transition-colors"
            title="Community info"
          >
            <Info size={18} />
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
            title="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatHeader
