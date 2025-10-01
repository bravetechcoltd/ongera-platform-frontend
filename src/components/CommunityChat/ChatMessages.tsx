"use client"

import type React from "react"
import { useEffect, useRef, useMemo } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/hooks"
import { Reply, Users, ArrowLeft, Loader2, MessageSquare } from "lucide-react"
import { switchChatMode, markDirectMessagesRead } from "@/lib/features/communityChat/communityChatSlice"
import MessageItem from "./MessageItem"

interface ChatMessagesProps {
  communityId: string
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ communityId }) => {
  const dispatch = useAppDispatch()
  const { 
    messages, // FIXED: Use messages array which is synced with active chat
    communityMessages,
    directMessages,
    typingUsers, 
    isLoading,
    activeChatType,
    activeDirectChatUserId,
    directMessageUsers,
    onlineMembers
  } = useAppSelector((state) => state.communityChat)
  
  const currentUser = useAppSelector((state) => state.auth.user)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // FIXED: Determine which messages to display
  const displayMessages = useMemo(() => {
    console.log("\n📋 [ChatMessages] Determining display messages:", {
      activeChatType,
      activeDirectChatUserId,
      messagesArrayLength: messages.length,
      communityMessagesLength: communityMessages.length,
      directMessageKeys: Object.keys(directMessages),
      currentUserId: currentUser?.id
    })

    // CRITICAL: Always use the messages array which is kept in sync by Redux
    const result = messages || []
    
    console.log("📊 [ChatMessages] Display result:", {
      groupCount: result.length,
      totalMessages: result.reduce((sum, group) => sum + group.messages.length, 0),
      groups: result.map(g => ({ date: g.date, count: g.messages.length }))
    })
    
    return result
  }, [messages, activeChatType, activeDirectChatUserId, communityMessages, directMessages, currentUser?.id])

  // Get active direct chat user info
  const activeDirectUser = useMemo(() => {
    if (activeChatType === 'direct' && activeDirectChatUserId) {
      const user = directMessageUsers.find(u => u.userId === activeDirectChatUserId)
      console.log("👤 [ChatMessages] Active direct user:", user?.userName)
      return user
    }
    return null
  }, [activeChatType, activeDirectChatUserId, directMessageUsers])

  // Check if active user is online
  const isActiveUserOnline = useMemo(() => {
    if (activeDirectUser) {
      return onlineMembers.some(om => om.userId === activeDirectUser.userId)
    }
    return false
  }, [activeDirectUser, onlineMembers])

  // FIXED: Determine loading state
  const isLoadingMessages = useMemo(() => {
    // Show loading only when:
    // 1. isLoading is true
    // 2. AND we have no messages to display
    // 3. AND we just switched to a different chat
    return isLoading && displayMessages.length === 0
  }, [isLoading, displayMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [displayMessages])

  // Mark direct messages as read when viewing
  useEffect(() => {
    if (activeChatType === 'direct' && activeDirectChatUserId) {
      console.log("✅ [ChatMessages] Marking messages as read for:", activeDirectChatUserId)
      dispatch(markDirectMessagesRead(activeDirectChatUserId))
    }
  }, [activeChatType, activeDirectChatUserId, dispatch])

  const handleBackToCommunity = () => {
    console.log("⬅️ [ChatMessages] Back to community")
    dispatch(switchChatMode('community'))
  }

  // Show loading indicator
  if (isLoadingMessages) {
    return (
      <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
        {/* Chat Context Header */}
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          {activeChatType === 'community' ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center">
                <Users className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Community Chat</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {onlineMembers.length} members online
                </p>
              </div>
            </div>
          ) : activeDirectUser ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleBackToCommunity}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
              >
                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="relative">
                {activeDirectUser.profilePicture ? (
                  <img
                    src={activeDirectUser.profilePicture}
                    alt={activeDirectUser.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-semibold">
                    {activeDirectUser.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                {isActiveUserOnline && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {activeDirectUser.userName}
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {isActiveUserOnline ? (
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Online
                    </span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Loading State */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-12 h-12 text-[#0158B7] animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeChatType === 'community' 
                ? 'Loading community messages...'
                : `Loading conversation with ${activeDirectUser?.userName}...`
              }
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-900 dark:via-blue-900/10 dark:to-indigo-900/10">
      {/* Chat Context Header */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        {activeChatType === 'community' ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center">
              <Users className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Community Chat</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {onlineMembers.length} members online
              </p>
            </div>
          </div>
        ) : activeDirectUser ? (
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackToCommunity}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors lg:hidden"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="relative">
              {activeDirectUser.profilePicture ? (
                <img
                  src={activeDirectUser.profilePicture}
                  alt={activeDirectUser.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-semibold">
                  {activeDirectUser.userName.charAt(0).toUpperCase()}
                </div>
              )}
              {isActiveUserOnline && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {activeDirectUser.userName}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {isActiveUserOnline ? (
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    Online
                  </span>
                ) : (
                  'Offline'
                )}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {displayMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-24 h-24 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center mb-4">
              <MessageSquare size={48} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              {activeChatType === 'community' ? 'No messages yet' : `Start chatting with ${activeDirectUser?.userName}`}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {activeChatType === 'community' 
                ? 'Be the first to start the conversation!' 
                : 'Send a message to begin your conversation'}
            </p>
          </div>
        ) : (
          <>
            {displayMessages.map((group, groupIndex) => (
              <div key={`${group.date}-${groupIndex}`} className="mb-6">
                {/* Date Separator */}
                <div className="flex justify-center mb-4 sticky top-0 z-5">
                  <div className="px-4 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-gray-700">
                    {group.date}
                  </div>
                </div>

                {/* Messages in this date group */}
                {group.messages.map((message, messageIndex) => {
                  const isOwnMessage = message.sender.id === currentUser?.id
                  const previousMessage = messageIndex > 0 ? group.messages[messageIndex - 1] : null
                  const showAvatar = !previousMessage || previousMessage.sender.id !== message.sender.id
                  const showSenderName = !isOwnMessage && showAvatar

                  return (
                    <MessageItem
                      key={message.id}
                      message={message}
                      isOwnMessage={isOwnMessage}
                      showAvatar={showAvatar}
                      showSenderName={showSenderName}
                      communityId={communityId}
                    />
                  )
                })}
              </div>
            ))}

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="flex items-center space-x-2 px-4 mb-4">
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {typingUsers.map((u) => u.userName).join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing
                    </span>
                    <div className="flex space-x-1">
                      <span className="w-2 h-2 bg-[#0158B7] rounded-full animate-bounce"></span>
                      <span
                        className="w-2 h-2 bg-[#5E96D2] rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></span>
                      <span
                        className="w-2 h-2 bg-[#0158B7] rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      ></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default ChatMessages