import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import axios from "axios"
import { showErrorToast } from "../../../utilis/ToastProps"
import Cookies from "js-cookie"

// ==================== TYPES ====================
export interface CommunityMessage {
  id: string
  communityId: string
  content: string
  messageType: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  sender: {
    id: string
    name: string
    profilePicture?: string
  }
  replyTo?: {
    id: string
    content: string
    sender: {
      id: string
      name: string
    }
  }
  reactions: Record<string, string>
  edited: boolean
  createdAt: string
  chatType?: 'community' | 'direct'
  recipientUserId?: string
  recipientUser?: {
    id: string
    name: string
    profilePicture?: string
  }
}

export interface GroupedCommunityMessages {
  date: string
  messages: CommunityMessage[]
}

export interface OnlineMember {
  userId: string
  userName: string
  communityId: string
}

export interface TypingUser {
  userId: string
  userName: string
  communityId: string
}

export interface DirectChatUser {
  userId: string
  userName: string
  email: string
  profilePicture?: string
  accountType: string
  lastMessageTime?: string | null
  unreadCount: number
  profile?: any
  isOnline?: boolean
}

interface CommunityChatState {
  messages: GroupedCommunityMessages[]
  onlineMembers: OnlineMember[]
  typingUsers: TypingUser[]
  selectedCommunity: string | null
  isOpen: boolean
  isLoading: boolean
  isSending: boolean
  error: string | null
  replyingTo: CommunityMessage | null
  editingMessage: CommunityMessage | null
  searchQuery: string
  showMediaGallery: boolean
  uploadProgress: number
  
  activeChatType: 'community' | 'direct'
  activeDirectChatUserId: string | null
  directMessageUsers: DirectChatUser[]
  unreadDirectCounts: Record<string, number>
  communityMessages: GroupedCommunityMessages[]
  directMessages: Record<string, GroupedCommunityMessages[]>
  isLoadingDirectUsers: boolean
}

const initialState: CommunityChatState = {
  messages: [],
  onlineMembers: [],
  typingUsers: [],
  selectedCommunity: null,
  isOpen: false,
  isLoading: false,
  isSending: false,
  error: null,
  replyingTo: null,
  editingMessage: null,
  searchQuery: "",
  showMediaGallery: false,
  uploadProgress: 0,
  
  activeChatType: 'community',
  activeDirectChatUserId: null,
  directMessageUsers: [],
  unreadDirectCounts: {},
  communityMessages: [],
  directMessages: {},
  isLoadingDirectUsers: false,
}

// ==================== ASYNC THUNKS ====================

export const fetchCommunityMessages = createAsyncThunk(
  "communityChat/fetchMessages",
  async (
    { 
      communityId, 
      page = 1, 
      beforeTimestamp,
      chat_type,
      with_user_id
    }: { 
      communityId: string
      page?: number
      beforeTimestamp?: string
      chat_type?: 'community' | 'direct'
      with_user_id?: string
    },
    { rejectWithValue },
  ) => {
    try {
      console.log("🔍 [fetchCommunityMessages] Fetching:", { communityId, chat_type, with_user_id })
      
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      })

      if (beforeTimestamp) {
        params.append("before_timestamp", beforeTimestamp)
      }
      
      if (chat_type) {
        params.append("chat_type", chat_type)
      }
      
      if (with_user_id) {
        params.append("with_user_id", with_user_id)
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/community-chat/${communityId}/messages?${params}`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        },
      )

      console.log("✅ [fetchCommunityMessages] Response:", {
        messageGroups: response.data.data.messages?.length || 0,
        chat_type,
        with_user_id
      })

      return {
        data: response.data.data,
        chat_type,
        with_user_id
      }
    } catch (error: any) {
      console.error("❌ [fetchCommunityMessages] Error:", error)
      const errorMessage = error.response?.data?.message || "Failed to fetch messages"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const uploadChatFile = createAsyncThunk(
  "communityChat/uploadFile",
  async ({ communityId, file }: { communityId: string; file: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/community-chat/${communityId}/messages/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      return response.data.data
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to upload file"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

export const fetchDirectChatUsers = createAsyncThunk(
  "communityChat/fetchDirectChatUsers",
  async (communityId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/community-chat/${communityId}/chat-members`,
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        },
      )

      return response.data.data.members
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Failed to fetch chat members"
      showErrorToast(errorMessage)
      return rejectWithValue(errorMessage)
    }
  },
)

// ==================== SLICE ====================
const communityChatSlice = createSlice({
  name: "communityChat",
  initialState,
  reducers: {
    toggleChatModal: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload
    },
    loadDirectConversation: (
  state,
  action: PayloadAction<{
    userId: string
    messages: GroupedCommunityMessages[]
    otherUser: any
  }>
) => {
  const { userId, messages, otherUser } = action.payload
  
  console.log(`📥 [REDUX] Loading conversation for user ${userId}:`, {
    messageGroups: messages.length,
    totalMessages: messages.reduce((sum, g) => sum + g.messages.length, 0)
  })

  // Store in directMessages
  state.directMessages[userId] = messages

  // Update active chat
  state.activeChatType = 'direct'
  state.activeDirectChatUserId = userId
  state.messages = messages

  // Mark as read
  state.unreadDirectCounts[userId] = 0

  console.log(`✅ [REDUX] Conversation loaded successfully`)
},
    
    setSelectedCommunity: (state, action: PayloadAction<string>) => {
      state.selectedCommunity = action.payload
      state.messages = []
      state.communityMessages = []
      state.directMessages = {}
      state.typingUsers = []
      state.activeChatType = 'community'
      state.activeDirectChatUserId = null
    },
    
    // FIXED: Proper message routing with detailed logging
    receiveNewCommunityMessage: (state, action: PayloadAction<CommunityMessage>) => {
      const message = action.payload
      const currentUserId = Cookies.get("currentUserId") || localStorage.getItem("currentUserId")

      console.log("\n🎯 [REDUX] receiveNewCommunityMessage:", {
        messageId: message.id,
        chatType: message.chatType,
        senderId: message.sender.id,
        senderName: message.sender.name,
        recipientId: message.recipientUserId,
        currentUserId,
        selectedCommunity: state.selectedCommunity,
        messageCommunity: message.communityId,
        activeDirectUserId: state.activeDirectChatUserId
      })

      // CRITICAL: Check if message belongs to selected community
      if (state.selectedCommunity !== message.communityId) {
        console.log("⚠️ [REDUX] Message ignored - wrong community")
        return
      }

      // Calculate date key
      const messageDate = new Date(message.createdAt).toLocaleDateString()
      const today = new Date().toLocaleDateString()
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString()

      let dateKey: string
      if (messageDate === today) {
        dateKey = "Today"
      } else if (messageDate === yesterday) {
        dateKey = "Yesterday"
      } else {
        dateKey = new Date(message.createdAt).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      }

      // Helper function to add message to groups
      const addMessageToGroup = (groups: GroupedCommunityMessages[], msg: CommunityMessage) => {
        const dayIndex = groups.findIndex((group) => group.date === dateKey)
        if (dayIndex !== -1) {
          // Check if message already exists
          const messageExists = groups[dayIndex].messages.some(m => m.id === msg.id)
          if (!messageExists) {
            groups[dayIndex].messages.push(msg)
            console.log(`✅ Added message to existing group: ${dateKey}`)
          } else {
            console.log(`⚠️ Message already exists in group: ${dateKey}`)
          }
        } else {
          groups.push({
            date: dateKey,
            messages: [msg],
          })
          console.log(`✅ Created new group: ${dateKey}`)
        }
      }

      // Route message based on chat type
      if (message.chatType === 'community' || !message.chatType) {
        console.log("📢 [REDUX] Routing to community messages")
        addMessageToGroup(state.communityMessages, message)
        addMessageToGroup(state.messages, message)
      } else if (message.chatType === 'direct') {
        // FIXED: Determine the other user ID
        const otherUserId = message.sender.id === currentUserId 
          ? message.recipientUserId 
          : message.sender.id

        console.log("💬 [REDUX] Direct message routing:", {
          currentUserId,
          senderId: message.sender.id,
          recipientId: message.recipientUserId,
          calculatedOtherUserId: otherUserId
        })

        if (!otherUserId) {
          console.error("❌ [REDUX] Cannot determine other user ID!")
          return
        }

        // CRITICAL: Initialize array if doesn't exist
        if (!state.directMessages[otherUserId]) {
          console.log(`🆕 [REDUX] Creating new direct messages array for user: ${otherUserId}`)
          state.directMessages[otherUserId] = []
        }

        console.log(`📝 [REDUX] Adding message to directMessages[${otherUserId}]`)
        addMessageToGroup(state.directMessages[otherUserId], message)
        
        // Log current state
        console.log(`📊 [REDUX] Current direct message groups for ${otherUserId}:`, 
          state.directMessages[otherUserId].map(g => ({
            date: g.date,
            count: g.messages.length
          }))
        )

        // Update unread count if not actively viewing
        if (state.activeChatType !== 'direct' || state.activeDirectChatUserId !== otherUserId) {
          if (message.sender.id !== currentUserId) {
            const oldCount = state.unreadDirectCounts[otherUserId] || 0
            state.unreadDirectCounts[otherUserId] = oldCount + 1
            console.log(`🔔 [REDUX] Unread count updated: ${oldCount} -> ${state.unreadDirectCounts[otherUserId]}`)
          }
        } else {
          console.log(`👀 [REDUX] User is actively viewing this chat - no unread update`)
        }

        // CRITICAL: Also update messages array if this is the active chat
        if (state.activeDirectChatUserId === otherUserId) {
          console.log(`🎯 [REDUX] Active chat - also updating messages array`)
          addMessageToGroup(state.messages, message)
        }
      }

      console.log("✅ [REDUX] Message routing complete\n")
    },
    
    updateEditedMessage: (
      state,
      action: PayloadAction<{ messageId: string; newContent: string; edited: boolean; editedAt: Date }>,
    ) => {
      const { messageId, newContent } = action.payload

      const updateInGroups = (groups: GroupedCommunityMessages[]) => {
        for (const group of groups) {
          const message = group.messages.find((msg) => msg.id === messageId)
          if (message) {
            message.content = newContent
            message.edited = true
            return true
          }
        }
        return false
      }

      updateInGroups(state.messages)
      updateInGroups(state.communityMessages)
      Object.values(state.directMessages).forEach(groups => updateInGroups(groups))
    },
    
    removeDeletedMessage: (
      state,
      action: PayloadAction<{ messageId: string; deleteType: string; userId?: string }>,
    ) => {
      const { messageId, deleteType } = action.payload

      const removeFromGroups = (groups: GroupedCommunityMessages[]) => {
        for (const group of groups) {
          group.messages = group.messages.filter((msg) => msg.id !== messageId)
        }
        return groups.filter((group) => group.messages.length > 0)
      }

      if (deleteType === "for_everyone") {
        state.messages = removeFromGroups(state.messages)
        state.communityMessages = removeFromGroups(state.communityMessages)
        Object.keys(state.directMessages).forEach(userId => {
          state.directMessages[userId] = removeFromGroups(state.directMessages[userId])
        })
      } else {
        state.messages = removeFromGroups(state.messages)
        state.communityMessages = removeFromGroups(state.communityMessages)
        Object.keys(state.directMessages).forEach(userId => {
          state.directMessages[userId] = removeFromGroups(state.directMessages[userId])
        })
      }
    },
    
    updateMessageReactions: (
      state,
      action: PayloadAction<{ messageId: string; reactions: Record<string, string> }>,
    ) => {
      const { messageId, reactions } = action.payload

      const updateInGroups = (groups: GroupedCommunityMessages[]) => {
        for (const group of groups) {
          const message = group.messages.find((msg) => msg.id === messageId)
          if (message) {
            message.reactions = reactions
            return true
          }
        }
        return false
      }

      updateInGroups(state.messages)
      updateInGroups(state.communityMessages)
      Object.values(state.directMessages).forEach(groups => updateInGroups(groups))
    },
    
    setOnlineMembers: (state, action: PayloadAction<OnlineMember[]>) => {
      state.onlineMembers = action.payload
      
      state.directMessageUsers = state.directMessageUsers.map(user => ({
        ...user,
        isOnline: action.payload.some(om => om.userId === user.userId)
      }))
    },
    
    addOnlineMember: (state, action: PayloadAction<OnlineMember>) => {
      const exists = state.onlineMembers.some((member) => member.userId === action.payload.userId)
      if (!exists) {
        state.onlineMembers.push(action.payload)
      }
      
      const userIndex = state.directMessageUsers.findIndex(u => u.userId === action.payload.userId)
      if (userIndex !== -1) {
        state.directMessageUsers[userIndex].isOnline = true
      }
    },
    
    removeOnlineMember: (state, action: PayloadAction<{ userId: string; communityId: string }>) => {
      state.onlineMembers = state.onlineMembers.filter((member) => member.userId !== action.payload.userId)
      
      const userIndex = state.directMessageUsers.findIndex(u => u.userId === action.payload.userId)
      if (userIndex !== -1) {
        state.directMessageUsers[userIndex].isOnline = false
      }
    },
    
    addTypingUser: (state, action: PayloadAction<TypingUser>) => {
      const exists = state.typingUsers.some((user) => user.userId === action.payload.userId)
      if (!exists) {
        state.typingUsers.push(action.payload)
      }
    },
    
    removeTypingUser: (state, action: PayloadAction<{ userId: string }>) => {
      state.typingUsers = state.typingUsers.filter((user) => user.userId !== action.payload.userId)
    },
    
    setReplyingTo: (state, action: PayloadAction<CommunityMessage | null>) => {
      state.replyingTo = action.payload
    },
    
    clearReplyingTo: (state) => {
      state.replyingTo = null
    },
    
    setEditingMessage: (state, action: PayloadAction<CommunityMessage | null>) => {
      state.editingMessage = action.payload
    },
    
    clearEditingMessage: (state) => {
      state.editingMessage = null
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload
    },
    
    toggleMediaGallery: (state, action: PayloadAction<boolean>) => {
      state.showMediaGallery = action.payload
    },
    
    setUploadProgress: (state, action: PayloadAction<number>) => {
      state.uploadProgress = action.payload
    },
    
    switchChatMode: (state, action: PayloadAction<'community' | 'direct'>) => {
      console.log(`🔄 [REDUX] Switching chat mode to: ${action.payload}`)
      state.activeChatType = action.payload
      if (action.payload === 'community') {
        state.activeDirectChatUserId = null
      }
    },
    
    selectDirectChatUser: (state, action: PayloadAction<string>) => {
      console.log(`👤 [REDUX] Selecting direct chat user: ${action.payload}`)
      console.log(`📊 [REDUX] Current directMessages keys:`, Object.keys(state.directMessages))
      console.log(`📊 [REDUX] Messages for this user:`, state.directMessages[action.payload]?.length || 0)
      
      state.activeChatType = 'direct'
      state.activeDirectChatUserId = action.payload
      
      // CRITICAL: Update messages array with this user's direct messages
      if (state.directMessages[action.payload]) {
        state.messages = state.directMessages[action.payload]
        console.log(`✅ [REDUX] Loaded ${state.directMessages[action.payload].length} message groups into messages array`)
      } else {
        state.messages = []
        console.log(`⚠️ [REDUX] No existing messages for this user`)
      }
      
      // Mark messages as read
      if (state.unreadDirectCounts[action.payload]) {
        state.unreadDirectCounts[action.payload] = 0
      }
    },
    
    setDirectChatUsers: (state, action: PayloadAction<DirectChatUser[]>) => {
      state.directMessageUsers = action.payload
    },
    
    updateUnreadCount: (state, action: PayloadAction<{ userId: string; count: number }>) => {
      state.unreadDirectCounts[action.payload.userId] = action.payload.count
    },
    
    markDirectMessagesRead: (state, action: PayloadAction<string>) => {
      state.unreadDirectCounts[action.payload] = 0
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCommunityMessages.pending, (state) => {
        state.isLoading = true
      })
      .addCase(fetchCommunityMessages.fulfilled, (state, action) => {
        console.log("📥 [REDUX] fetchCommunityMessages.fulfilled:", {
          chat_type: action.payload.chat_type,
          with_user_id: action.payload.with_user_id,
          messageGroups: action.payload.data.messages?.length || 0
        })
        
        state.isLoading = false
        const { data, chat_type, with_user_id } = action.payload
        
        if (chat_type === 'community') {
          state.communityMessages = data.messages || []
          state.messages = data.messages || []
          console.log(`✅ [REDUX] Loaded ${data.messages?.length || 0} community message groups`)
        } else if (chat_type === 'direct' && with_user_id) {
          state.directMessages[with_user_id] = data.messages || []
          state.messages = data.messages || []
          console.log(`✅ [REDUX] Loaded ${data.messages?.length || 0} direct message groups for user ${with_user_id}`)
        } else {
          state.messages = data.messages || []
          console.log(`✅ [REDUX] Loaded ${data.messages?.length || 0} message groups`)
        }
        
        state.onlineMembers = data.onlineUsers || []
      })
      .addCase(fetchCommunityMessages.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(uploadChatFile.pending, (state) => {
        state.uploadProgress = 0
      })
      .addCase(uploadChatFile.fulfilled, (state) => {
        state.uploadProgress = 100
      })
      .addCase(uploadChatFile.rejected, (state, action) => {
        state.error = action.payload as string
        state.uploadProgress = 0
      })
      
      .addCase(fetchDirectChatUsers.pending, (state) => {
        state.isLoadingDirectUsers = true
      })
      .addCase(fetchDirectChatUsers.fulfilled, (state, action) => {
        state.isLoadingDirectUsers = false
        state.directMessageUsers = action.payload.map((user: DirectChatUser) => ({
          ...user,
          isOnline: state.onlineMembers.some(om => om.userId === user.userId)
        }))
      })
      .addCase(fetchDirectChatUsers.rejected, (state, action) => {
        state.isLoadingDirectUsers = false
        state.error = action.payload as string
      })
  },
})

export const {
  toggleChatModal,
  setSelectedCommunity,
  receiveNewCommunityMessage,
  updateEditedMessage,
  removeDeletedMessage,
  updateMessageReactions,
  setOnlineMembers,
  addOnlineMember,
  removeOnlineMember,
  addTypingUser,
  removeTypingUser,
  setReplyingTo,
  clearReplyingTo,
  setEditingMessage,
  clearEditingMessage,
  setSearchQuery,
  toggleMediaGallery,
  setUploadProgress,
  switchChatMode,
  selectDirectChatUser,
  setDirectChatUsers,
  updateUnreadCount,
  markDirectMessagesRead,
  loadDirectConversation,
} = communityChatSlice.actions

export default communityChatSlice.reducer