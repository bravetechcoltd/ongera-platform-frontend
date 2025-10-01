"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { 
  selectDirectChatUser, 
  setDirectChatUsers,
  fetchDirectChatUsers,
  loadDirectConversation // NEW
} from "@/lib/features/communityChat/communityChatSlice"
import { 
  loadDirectConversation as loadConversationAPI // NEW
} from "@/lib/services/communityChatSocket"
import { MessageCircle, Search, Loader } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { showErrorToast } from "@/utilis/ToastProps" // NEW

interface Props {
  communityId: string
}

const DirectChatUserList: React.FC<Props> = ({ communityId }) => {
  const dispatch = useAppDispatch()
  const { 
    directMessageUsers, 
    unreadDirectCounts, 
    activeDirectChatUserId,
    isLoadingDirectUsers,
    directMessages // NEW
  } = useAppSelector(state => state.communityChat)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingUserId, setLoadingUserId] = useState<string | null>(null) // NEW

  useEffect(() => {
    // Fetch chat users when component mounts
    dispatch(fetchDirectChatUsers(communityId))
  }, [communityId, dispatch])

  // UPDATED: New handleSelectUser with conversation loading
  const handleSelectUser = async (userId: string) => {
    console.log("\n👤 [DirectChatUserList] User selected:", userId)
    
    setLoadingUserId(userId) // Show loading indicator
    
    try {
      // First, switch to the chat immediately (optimistic update)
      dispatch(selectDirectChatUser(userId))
      
      // Check if we already have messages for this user
      const existingMessages = directMessages[userId]
      
      console.log("📊 [DirectChatUserList] Existing messages:", {
        hasMessages: !!existingMessages,
        groupCount: existingMessages?.length || 0
      })

      // If no existing messages, fetch from API
      if (!existingMessages || existingMessages.length === 0) {
        console.log("🔍 [DirectChatUserList] Fetching conversation from API...")
        
        const conversationData = await loadConversationAPI(
          communityId,
          userId
        )

        console.log("✅ [DirectChatUserList] Conversation fetched:", {
          messageGroups: conversationData.messages?.length || 0,
          otherUser: conversationData.otherUser?.userName
        })

        // Load the conversation into Redux
        dispatch(loadDirectConversation({
          userId,
          messages: conversationData.messages || [],
          otherUser: conversationData.otherUser
        }))
      } else {
        console.log("✅ [DirectChatUserList] Using cached messages")
      }
    } catch (error: any) {
      console.error("❌ [DirectChatUserList] Failed to load conversation:", error)
      showErrorToast(error.message || "Failed to load conversation")
    } finally {
      setLoadingUserId(null) // Hide loading indicator
    }
    
    console.log("✅ [DirectChatUserList] User selection complete\n")
  }

  const filteredUsers = directMessageUsers.filter(user =>
    user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Sort users: unread first, then by last message time
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const aUnread = unreadDirectCounts[a.userId] || 0
    const bUnread = unreadDirectCounts[b.userId] || 0
    
    if (aUnread !== bUnread) {
      return bUnread - aUnread
    }
    
    if (a.lastMessageTime && b.lastMessageTime) {
      return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
    }
    
    if (a.lastMessageTime) return -1
    if (b.lastMessageTime) return 1
    
    return a.userName.localeCompare(b.userName)
  })

  if (isLoadingDirectUsers) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-[#0158B7]" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0158B7] focus:border-transparent"
          />
        </div>
      </div>

      {/* User List */}
      <div className="flex-1 overflow-y-auto">
        {sortedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <MessageCircle size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? "No users found" : "No members to chat with"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedUsers.map((user) => {
              const unreadCount = unreadDirectCounts[user.userId] || 0
              const isActive = activeDirectChatUserId === user.userId
              const isLoading = loadingUserId === user.userId // NEW

              return (
                <div
                  key={user.userId}
                  onClick={() => handleSelectUser(user.userId)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#0158B7]/10 to-[#5E96D2]/10 border-l-4 border-[#0158B7]"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  {/* Avatar with Online Indicator */}
                  <div className="relative flex-shrink-0">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.userName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-semibold text-lg">
                        {user.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-semibold truncate ${
                        unreadCount > 0 ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300"
                      }`}>
                        {user.userName}
                      </p>
                      {user.lastMessageTime && (
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                          {formatDistanceToNow(new Date(user.lastMessageTime), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.accountType}
                      </p>
                      
                      {/* Loading or Unread Badge */}
                      {isLoading ? (
                        <Loader className="w-4 h-4 animate-spin text-[#0158B7]" />
                      ) : unreadCount > 0 ? (
                        <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-[#0158B7] text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default DirectChatUserList