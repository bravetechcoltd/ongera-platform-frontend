import { io, type Socket } from "socket.io-client"
import { store } from "../store"
import Cookies from "js-cookie"
import {
  receiveNewCommunityMessage,
  updateEditedMessage,
  removeDeletedMessage,
  updateMessageReactions,
  addOnlineMember,
  removeOnlineMember,
  addTypingUser,
  removeTypingUser,
  setUploadProgress,
} from "../features/communityChat/communityChatSlice"
import { showErrorToast } from "../../utilis/ToastProps"
import axios from "axios"

  export const loadDirectConversation = async (
  communityId: string,
  otherUserId: string,
  page: number = 1,
  beforeTimestamp?: string
): Promise<any> => {
  try {
    console.log("\n🔍 [API] Loading direct conversation:", {
      communityId,
      otherUserId,
      page
    })

    const params: any = { page, limit: 50 }
    if (beforeTimestamp) {
      params.before_timestamp = beforeTimestamp
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/community-chat/${communityId}/direct-conversation/${otherUserId}`,
      {
        params,
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      }
    )

    console.log("✅ [API] Conversation loaded:", {
      messageGroups: response.data.data.messages?.length || 0,
      otherUser: response.data.data.otherUser?.userName,
      total: response.data.data.pagination?.total
    })

    return response.data.data
  } catch (error: any) {
    console.error("❌ [API] Failed to load conversation:", error)
    throw error
  }
}
// Create socket instance
export const socket: Socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  window.location.origin,
  {
    autoConnect: false,
    transports: ["websocket", "polling"],
    path: "/socket.io/",
  }
)

let connectionPromise: Promise<void> | null = null

export const initializeSocket = (token: string): Promise<void> => {
  console.log("🔌 [initializeSocket] Called with token:", token ? "✓ Present" : "✗ Missing")
  console.log("🔌 [initializeSocket] Socket.connected:", socket.connected)
  console.log("🔌 [initializeSocket] Socket.id:", socket.id)
  
  if (connectionPromise) {
    console.log("🔄 Socket connection already in progress")
    return connectionPromise
  }

  if (socket.connected) {
    console.log("✅ Socket already connected, socket.id:", socket.id)
    
    const user = store.getState().auth.user
    if (user?.id) {
      localStorage.setItem("currentUserId", user.id)
      Cookies.set("currentUserId", user.id, { expires: 7 })
    }
    
    return Promise.resolve()
  }

  console.log("🔌 Starting new socket connection...")

  connectionPromise = new Promise((resolve, reject) => {
    try {
      const user = store.getState().auth.user
      if (user?.id) {
        localStorage.setItem("currentUserId", user.id)
        Cookies.set("currentUserId", user.id, { expires: 7 })
        console.log("✅ User ID stored:", user.id)
      }

      socket.auth = { token }

      if (!socket.hasListeners("connect")) {
        console.log("📡 Setting up socket listeners...")
        setupSocketListeners()
      }

      const handleConnect = () => {
        console.log("✅ Socket connected successfully, socket.id:", socket.id)
        socket.off("connect", handleConnect)
        socket.off("connect_error", handleConnectError)
        connectionPromise = null
        resolve()
      }

      const handleConnectError = (error: Error) => {
        console.error("❌ Socket connection error:", error)
        socket.off("connect", handleConnect)
        socket.off("connect_error", handleConnectError)
        connectionPromise = null
        reject(error)
      }

      socket.once("connect", handleConnect)
      socket.once("connect_error", handleConnectError)

      console.log("🔌 Calling socket.connect()...")
      socket.connect()

      setTimeout(() => {
        if (!socket.connected) {
          console.error("⏱️ Socket connection timeout!")
          socket.off("connect", handleConnect)
          socket.off("connect_error", handleConnectError)
          connectionPromise = null
          reject(new Error("Socket connection timeout"))
        }
      }, 30000)

    } catch (error) {
      console.error("❌ Socket initialization error:", error)
      connectionPromise = null
      reject(error)
    }
  })

  return connectionPromise
}

export const disconnectSocket = () => {
  if (socket.connected) {
    try {
      socket.removeAllListeners()
      socket.disconnect()
      connectionPromise = null
      localStorage.removeItem("currentUserId")
      Cookies.remove("currentUserId")
      console.log("👋 Socket disconnected and cleaned up")
    } catch (error) {
      console.error("❌ Disconnect error:", error)
    }
  }
}

const setupSocketListeners = () => {
  socket.removeAllListeners()

  socket.on("connect", () => {
    console.log("✅ Socket connected successfully, socket.id:", socket.id)
  })

  socket.on("connect_error", (error) => {
    console.error("❌ Socket connection error:", error)
    showErrorToast("Failed to connect to chat")
  })

  socket.io.on("reconnect", (attemptNumber) => {
    console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`)
  })

  socket.io.on("reconnect_failed", () => {
    console.error("❌ Socket reconnection failed")
    showErrorToast("Failed to connect to chat. Please refresh the page.")
  })

  socket.on("disconnect", (reason) => {
    console.log("👋 Socket disconnected:", reason)
  })

  socket.on("connection_success", (data) => {
    console.log("✅ Connection confirmed:", data)
  })


  // NEW COMMUNITY MESSAGE - ENHANCED LOGGING
  socket.on("new_community_message", (message) => {
    const currentUserId = Cookies.get("currentUserId") || store.getState().auth.user?.id
    
    console.log("\n📨 [SOCKET] New message received:", {
      messageId: message.id,
      chatType: message.chat_type || 'community',
      senderId: message.sender?.id,
      senderName: message.sender?.name,
      recipientId: message.recipient_user_id,
      content: message.content?.substring(0, 50) + "...",
      currentUserId,
      timestamp: new Date().toISOString()
    })

    // Validate message structure
    if (!message.id || !message.sender?.id) {
      console.error("❌ [SOCKET] Invalid message structure:", message)
      return
    }

    // Check if this message is for direct chat
    if (message.chat_type === 'direct' || message.recipient_user_id) {
      console.log("💬 [SOCKET] Direct message detected:", {
        isForMe: message.recipient_user_id === currentUserId || message.sender.id === currentUserId,
        recipientId: message.recipient_user_id,
        senderId: message.sender.id
      })
    }

    const transformedMessage = transformBackendMessage(message)
    console.log("✅ [SOCKET] Dispatching to Redux:", {
      messageId: transformedMessage.id,
      chatType: transformedMessage.chatType
    })
    
    store.dispatch(receiveNewCommunityMessage(transformedMessage))
    console.log("✅ [SOCKET] Message dispatched successfully\n")
  })

  socket.on("message_edited", (data) => {
    console.log("✏️ Message edited:", data.messageId)
    store.dispatch(updateEditedMessage(data))
  })

  socket.on("message_deleted", (data) => {
    console.log("🗑️ Message deleted:", data.messageId, data.deleteType)
    store.dispatch(removeDeletedMessage(data))
  })

  socket.on("message_reaction_updated", (data) => {
    console.log("👍 Reaction updated:", data.messageId)
    store.dispatch(updateMessageReactions(data))
  })

  socket.on("user_online", (data) => {
    console.log("🟢 User online:", data.userName)
    store.dispatch(addOnlineMember(data))
  })

  socket.on("user_offline", (data) => {
    console.log("🔴 User offline:", data.userId)
    store.dispatch(removeOnlineMember(data))
  })

  socket.on("user_typing", (data) => {
    console.log("⌨️ User typing:", data.userName)
    store.dispatch(addTypingUser(data))
  })

  socket.on("user_stopped_typing", (data) => {
    console.log("⏸️ User stopped typing")
    store.dispatch(removeTypingUser(data))
  })

  socket.on("upload_progress", (data) => {
    store.dispatch(setUploadProgress(data.progress))
  })
}

const transformBackendMessage = (backendMessage: any) => {
  const transformed = {
    id: backendMessage.id,
    communityId: backendMessage.community_id || backendMessage.communityId,
    content: backendMessage.content,
    messageType: backendMessage.message_type || backendMessage.messageType,
    fileUrl: backendMessage.file_url || backendMessage.fileUrl,
    fileName: backendMessage.file_name || backendMessage.fileName,
    fileType: backendMessage.file_type || backendMessage.fileType,
    sender: {
      id: backendMessage.sender?.id,
      name: backendMessage.sender?.name,
      profilePicture: backendMessage.sender?.profile_picture_url || 
                     backendMessage.sender?.profilePicture,
    },
    replyTo: backendMessage.reply_to
      ? {
          id: backendMessage.reply_to.id,
          content: backendMessage.reply_to.content,
          messageType: backendMessage.reply_to.message_type || backendMessage.reply_to.messageType,
          sender: backendMessage.reply_to.sender,
        }
      : backendMessage.replyTo,
    reactions: backendMessage.reactions || {},
    edited: backendMessage.edited || false,
    createdAt: backendMessage.created_at || backendMessage.createdAt, // FIXED: Handle both
    deletedForEveryone: backendMessage.deleted_for_everyone || false,
    chatType: backendMessage.chat_type || 'community',
    recipientUserId: backendMessage.recipient_user_id || backendMessage.recipientUserId,
    recipientUser: backendMessage.recipient_user || backendMessage.recipientUser ? {
      id: (backendMessage.recipient_user || backendMessage.recipientUser).id,
      name: (backendMessage.recipient_user || backendMessage.recipientUser).name,
      profilePicture: (backendMessage.recipient_user || backendMessage.recipientUser).profilePicture || 
                     (backendMessage.recipient_user || backendMessage.recipientUser).profile_picture_url,
    } : null,
    readBy: backendMessage.read_by || backendMessage.readBy || [], // FIXED: Add readBy
  }
  
  console.log("🔄 [TRANSFORM] Message transformed:", {
    original: {
      chatType: backendMessage.chat_type,
      recipientId: backendMessage.recipient_user_id,
      createdAt: backendMessage.created_at
    },
    transformed: {
      chatType: transformed.chatType,
      recipientUserId: transformed.recipientUserId,
      createdAt: transformed.createdAt
    }
  })
  
  return transformed
}


export const joinCommunityRooms = (communityIds: string[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      console.error("❌ Cannot join rooms: Socket not connected")
      reject(new Error("Socket not connected"))
      return
    }

    console.log("🚪 Attempting to join rooms:", communityIds)

    const timeout = setTimeout(() => {
      console.error("❌ Join rooms timeout")
      reject(new Error("Join rooms timeout"))
    }, 10000)

    socket.emit("join_community_rooms", { communityIds }, (response: any) => {
      clearTimeout(timeout)

      if (response?.success) {
        console.log("✅ Successfully joined rooms:", response.joinedRooms)
        resolve(response)
      } else {
        console.error("❌ Failed to join rooms:", response?.error)
        reject(new Error(response?.error || "Failed to join rooms"))
      }
    })
  })
}

// ENHANCED: Send community message with detailed logging
export const sendCommunityMessage = (data: {
  communityId: string
  content: string
  messageType?: string
  fileUrl?: string
  fileName?: string
  fileType?: string
  replyToMessageId?: string
  chat_type?: 'community' | 'direct'
  recipient_user_id?: string
}) => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      console.error("❌ Cannot send message: Socket not connected")
      reject("Socket not connected")
      return
    }

    const currentUserId = Cookies.get("currentUserId") || store.getState().auth.user?.id

    console.log("\n📤 [SEND] Sending message:", {
      chatType: data.chat_type || 'community',
      senderId: currentUserId,
      recipientId: data.recipient_user_id || 'community',
      content: data.content?.substring(0, 50) + "...",
      timestamp: new Date().toISOString()
    })

    socket.emit("send_community_message", data, (response: any) => {
      if (response?.success) {
        console.log("✅ [SEND] Message sent successfully:", {
          messageId: response.data.id,
          chatType: response.data.chat_type
        })
        resolve(response.data)
      } else {
        console.error("❌ [SEND] Failed to send message:", response?.error)
        showErrorToast(response?.error || "Failed to send message")
        reject(response?.error)
      }
      console.log("✅ [SEND] Send operation complete\n")
    })
  })
}

export const editCommunityMessage = (messageId: string, newContent: string, communityId: string) => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      reject("Socket not connected")
      return
    }

    socket.emit("edit_message", { messageId, newContent, communityId }, (response: any) => {
      if (response?.success) {
        resolve(response)
      } else {
        showErrorToast(response?.error || "Failed to edit message")
        reject(response?.error)
      }
    })
  })
}

export const deleteCommunityMessage = (
  messageId: string,
  deleteType: "for_everyone" | "for_me",
  communityId: string
) => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      reject("Socket not connected")
      return
    }

    socket.emit("delete_message", { messageId, deleteType, communityId }, (response: any) => {
      if (response?.success) {
        resolve(response)
      } else {
        showErrorToast(response?.error || "Failed to delete message")
        reject(response?.error)
      }
    })
  })
}

export const reactToMessage = (messageId: string, emoji: string, communityId: string) => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      reject("Socket not connected")
      return
    }

    socket.emit("react_to_message", { messageId, emoji, communityId }, (response: any) => {
      if (response?.success) {
        resolve(response.reactions)
      } else {
        showErrorToast(response?.error || "Failed to react to message")
        reject(response?.error)
      }
    })
  })
}

export const sendTypingIndicator = (communityId: string, recipientUserId?: string) => {
  if (socket.connected) {
    const data: any = { communityId }
    if (recipientUserId) {
      data.recipient_user_id = recipientUserId
    }
    socket.emit("typing_indicator", data)
  }
}

export const stopTypingIndicator = (communityId: string, recipientUserId?: string) => {
  if (socket.connected) {
    const data: any = { communityId }
    if (recipientUserId) {
      data.recipient_user_id = recipientUserId
    }
    socket.emit("stop_typing", data)
  }
}