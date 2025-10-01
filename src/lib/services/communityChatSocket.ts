// @ts-nocheck
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

    return response.data.data
  } catch (error: any) {
    throw error
  }
}

// Create socket instance
export const socket: Socket = io(
  process.env.NEXT_PUBLIC_SOCKET_URL || 
  process.env.NEXT_PUBLIC_API_BASE_URL || 
  (typeof window !== 'undefined' ? window.location.origin : ''),
  {
    autoConnect: false,
    transports: ["websocket", "polling"],
    path: "/socket.io/",
  }
)

let connectionPromise: Promise<void> | null = null

export const initializeSocket = (token: string): Promise<void> => {
  if (connectionPromise) {
    return connectionPromise
  }

  if (socket.connected) {
    const user = store.getState().auth.user
    if (user?.id) {
      localStorage.setItem("currentUserId", user.id)
      Cookies.set("currentUserId", user.id, { expires: 7 })
    }
    return Promise.resolve()
  }

  connectionPromise = new Promise((resolve, reject) => {
    try {
      const user = store.getState().auth.user
      if (user?.id) {
        localStorage.setItem("currentUserId", user.id)
        Cookies.set("currentUserId", user.id, { expires: 7 })
      }

      socket.auth = { token }

      if (!socket.hasListeners("connect")) {
        setupSocketListeners()
      }

      const handleConnect = () => {
        socket.off("connect", handleConnect)
        socket.off("connect_error", handleConnectError)
        connectionPromise = null
        resolve()
      }

      const handleConnectError = (error: Error) => {
        socket.off("connect", handleConnect)
        socket.off("connect_error", handleConnectError)
        connectionPromise = null
        reject(error)
      }

      socket.once("connect", handleConnect)
      socket.once("connect_error", handleConnectError)

      socket.connect()

      setTimeout(() => {
        if (!socket.connected) {
          socket.off("connect", handleConnect)
          socket.off("connect_error", handleConnectError)
          connectionPromise = null
          reject(new Error("Socket connection timeout"))
        }
      }, 30000)

    } catch (error) {
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
    } catch {
      // Silently handle disconnect errors
    }
  }
}

const setupSocketListeners = () => {
  socket.removeAllListeners()

  socket.on("connect", () => {
    // Connection established
  })

  socket.on("connect_error", () => {
    showErrorToast("Failed to connect to chat")
  })

  socket.io.on("reconnect", () => {
    // Reconnection occurred
  })

  socket.io.on("reconnect_failed", () => {
    showErrorToast("Failed to connect to chat. Please refresh the page.")
  })

  socket.on("disconnect", () => {
    // Disconnected
  })

  socket.on("connection_success", () => {
    // Connection confirmed
  })

  // NEW COMMUNITY MESSAGE
  socket.on("new_community_message", (message) => {
    const currentUserId = Cookies.get("currentUserId") || store.getState().auth.user?.id

    // Validate message structure
    if (!message.id || !message.sender?.id) {
      return
    }

    const transformedMessage = transformBackendMessage(message)
    store.dispatch(receiveNewCommunityMessage(transformedMessage))
  })

  socket.on("message_edited", (data) => {
    store.dispatch(updateEditedMessage(data))
  })

  socket.on("message_deleted", (data) => {
    store.dispatch(removeDeletedMessage(data))
  })

  socket.on("message_reaction_updated", (data) => {
    store.dispatch(updateMessageReactions(data))
  })

  socket.on("user_online", (data) => {
    store.dispatch(addOnlineMember(data))
  })

  socket.on("user_offline", (data) => {
    store.dispatch(removeOnlineMember(data))
  })

  socket.on("user_typing", (data) => {
    store.dispatch(addTypingUser(data))
  })

  socket.on("user_stopped_typing", (data) => {
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
    createdAt: backendMessage.created_at || backendMessage.createdAt,
    deletedForEveryone: backendMessage.deleted_for_everyone || false,
    chatType: backendMessage.chat_type || 'community',
    recipientUserId: backendMessage.recipient_user_id || backendMessage.recipientUserId,
    recipientUser: backendMessage.recipient_user || backendMessage.recipientUser ? {
      id: (backendMessage.recipient_user || backendMessage.recipientUser).id,
      name: (backendMessage.recipient_user || backendMessage.recipientUser).name,
      profilePicture: (backendMessage.recipient_user || backendMessage.recipientUser).profilePicture || 
                     (backendMessage.recipient_user || backendMessage.recipientUser).profile_picture_url,
    } : null,
    readBy: backendMessage.read_by || backendMessage.readBy || [],
  }
  
  return transformed
}

export const joinCommunityRooms = (communityIds: string[]): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!socket.connected) {
      reject(new Error("Socket not connected"))
      return
    }

    const timeout = setTimeout(() => {
      reject(new Error("Join rooms timeout"))
    }, 10000)

    socket.emit("join_community_rooms", { communityIds }, (response: any) => {
      clearTimeout(timeout)

      if (response?.success) {
        resolve(response)
      } else {
        reject(new Error(response?.error || "Failed to join rooms"))
      }
    })
  })
}

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
      reject("Socket not connected")
      return
    }

    socket.emit("send_community_message", data, (response: any) => {
      if (response?.success) {
        resolve(response.data)
      } else {
        showErrorToast(response?.error || "Failed to send message")
        reject(response?.error)
      }
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