"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  toggleChatModal,
  setSelectedCommunity,
  fetchCommunityMessages,
  fetchDirectChatUsers,
  switchChatMode,
} from "../../lib/features/communityChat/communityChatSlice"
import { joinCommunityRooms, socket } from "../../lib/services/communityChatSocket"
import ChatHeader from "./ChatHeader"
import ChatSidebar from "./ChatSidebar"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import OnlineMembersList from "./OnlineMembersList"
import MediaGallery from "./MediaGallery"
import SearchMessages from "./SearchMessages"
import { showErrorToast } from "@/utilis/ToastProps"
import { ArrowLeft } from "lucide-react"

interface CommunityChatModalProps {
  communityId: string
  communityName: string
  communityAvatar?: string
  onClose: () => void
}

const CommunityChatModal: React.FC<CommunityChatModalProps> = ({
  communityId,
  communityName,
  communityAvatar,
  onClose,
}) => {
  const dispatch = useAppDispatch()
  const { 
    isOpen, 
    showMediaGallery, 
    searchQuery, 
    onlineMembers,
    activeChatType,
    activeDirectChatUserId,
  } = useAppSelector((state) => state.communityChat)
  
  const [showSidebar, setShowSidebar] = useState(true)
  const [showOnlineList, setShowOnlineList] = useState(true)

  useEffect(() => {
    if (!isOpen) return

    const initChat = async () => {
      if (!socket.connected) {
        showErrorToast("Chat connection not ready. Please refresh and try again.")
        return
      }

      try {
        dispatch(setSelectedCommunity(communityId))
        joinCommunityRooms([communityId])
          .catch((err) => console.error("Failed to join rooms:", err))

        dispatch(fetchCommunityMessages({ 
          communityId,
          chat_type: 'community'
        }))

        dispatch(fetchDirectChatUsers(communityId))
      } catch (error) {
        console.error("Initialization error:", error)
      }
    }

    initChat()
  }, [isOpen, communityId, dispatch])

  useEffect(() => {
    if (!isOpen) return

    if (activeChatType === 'community') {
      dispatch(fetchCommunityMessages({ 
        communityId,
        chat_type: 'community'
      }))
    } else if (activeChatType === 'direct' && activeDirectChatUserId) {
      dispatch(fetchCommunityMessages({ 
        communityId,
        chat_type: 'direct',
        with_user_id: activeDirectChatUserId
      }))
    }
  }, [activeChatType, activeDirectChatUserId, isOpen, communityId, dispatch])

  const handleClose = () => {
    dispatch(toggleChatModal(false))
    dispatch(switchChatMode('community'))
    onClose()
  }

  const handleBackToCommunity = () => {
    dispatch(switchChatMode('community'))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="w-full h-full max-w-7xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Compact Header - Fixed Height */}
        <div className="flex-shrink-0">
          <ChatHeader
            communityName={communityName}
            communityAvatar={communityAvatar}
            onlineCount={onlineMembers.length}
            onClose={handleClose}
            onToggleSidebar={() => setShowSidebar(!showSidebar)}
            onToggleOnlineList={() => setShowOnlineList(!showOnlineList)}
          />
        </div>

        {/* Main Content Area - Flex Container */}
        <div className="flex-1 flex overflow-hidden min-h-0">
          
          {/* Left Sidebar - Fixed Width, Scrollable */}
          {showSidebar && (
            <div className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
              <ChatSidebar communityId={communityId} />
            </div>
          )}

          {/* Center - Messages Area - Flexible Width */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            
            {/* Back Button for Direct Chat (Mobile Only) */}
            {activeChatType === 'direct' && (
              <div className="lg:hidden flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2">
                <button
                  onClick={handleBackToCommunity}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Chats</span>
                </button>
              </div>
            )}

            {/* Content Switcher */}
            {searchQuery ? (
              <SearchMessages communityId={communityId} />
            ) : showMediaGallery ? (
              <MediaGallery communityId={communityId} />
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                <div className="flex-1 overflow-hidden">
                  <ChatMessages communityId={communityId} />
                </div>
                <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
                  <ChatInput communityId={communityId} />
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Online Members (Conditional) */}
          {showOnlineList && !showMediaGallery && !searchQuery && activeChatType === 'community' && (
            <div className="w-60 flex-shrink-0 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto hidden lg:block">
              <OnlineMembersList communityId={communityId} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CommunityChatModal