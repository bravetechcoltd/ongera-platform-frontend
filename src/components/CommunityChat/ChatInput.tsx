"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Paperclip, X, Smile, Loader } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import {
  clearReplyingTo,
  clearEditingMessage,
  uploadChatFile,
} from "../../lib/features/communityChat/communityChatSlice"
import {
  sendCommunityMessage,
  editCommunityMessage,
  sendTypingIndicator,
  stopTypingIndicator,
} from "../../lib/services/communityChatSocket"
import { showErrorToast, showSuccessToast } from "../../utilis/ToastProps"
import EmojiPicker from "emoji-picker-react"

interface ChatInputProps {
  communityId: string
}

const ChatInput: React.FC<ChatInputProps> = ({ communityId }) => {
  const dispatch = useAppDispatch()
  const { 
    replyingTo, 
    editingMessage, 
    isSending, 
    uploadProgress,
    activeChatType,
    activeDirectChatUserId,
    directMessageUsers
  } = useAppSelector((state) => state.communityChat)
  
  const [message, setMessage] = useState("")
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const activeDirectUserName = directMessageUsers.find(
    u => u.userId === activeDirectChatUserId
  )?.userName

  useEffect(() => {
    if (editingMessage) {
      setMessage(editingMessage.content)
      textareaRef.current?.focus()
    }
  }, [editingMessage])

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        stopTypingIndicator(
          communityId, 
          activeChatType === 'direct' ? activeDirectChatUserId || undefined : undefined
        )
      }
    }
  }, [communityId, activeChatType, activeDirectChatUserId])

  const handleTyping = () => {
    sendTypingIndicator(
      communityId,
      activeChatType === 'direct' ? activeDirectChatUserId || undefined : undefined
    )

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTypingIndicator(
        communityId,
        activeChatType === 'direct' ? activeDirectChatUserId || undefined : undefined
      )
      typingTimeoutRef.current = null
    }, 3000)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      showErrorToast("File size exceeds 50MB limit")
      return
    }

    setSelectedFile(file)

    if (file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleSend = async () => {
    if (!message.trim() && !selectedFile) return

    if (activeChatType === 'direct' && !activeDirectChatUserId) {
      showErrorToast("Please select a user to message")
      return
    }

    try {
      let fileUrl = null
      let fileName = null
      let fileType = null

      if (selectedFile) {
        const result = await dispatch(uploadChatFile({ communityId, file: selectedFile })).unwrap()
        fileUrl = result.fileUrl
        fileName = result.fileName
        fileType = result.fileType
      }

      if (editingMessage) {
        await editCommunityMessage(editingMessage.id, message, communityId)
        dispatch(clearEditingMessage())
        showSuccessToast("Message updated")
      } else {
        await sendCommunityMessage({
          communityId,
          content: message,
          messageType: fileType || "text",
          fileUrl: fileUrl || undefined,
          fileName: fileName || undefined,
          fileType: fileType || undefined,
          replyToMessageId: replyingTo?.id,
          chat_type: activeChatType,
          recipient_user_id: activeChatType === 'direct' ? activeDirectChatUserId || undefined : undefined
        })
      }

      setMessage("")
      setSelectedFile(null)
      setFilePreview(null)
      dispatch(clearReplyingTo())

      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
        stopTypingIndicator(
          communityId,
          activeChatType === 'direct' ? activeDirectChatUserId || undefined : undefined
        )
      }
    } catch (error) {
      showErrorToast("Failed to send message")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const placeholderText = activeChatType === 'community' 
    ? "Message the community..." 
    : activeDirectUserName 
      ? `Message ${activeDirectUserName}...`
      : "Select a user to message..."

  return (
    <div className="bg-white dark:bg-gray-800 p-3">
      
      {/* Reply/Edit Indicator - Compact */}
      {(replyingTo || editingMessage) && (
        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-blue-600 dark:text-blue-400 font-medium flex-shrink-0">
              {editingMessage ? "Editing" : `Reply to ${replyingTo?.sender.name}`}
            </span>
            {replyingTo && (
              <span className="text-gray-600 dark:text-gray-400 truncate text-xs">{replyingTo.content}</span>
            )}
          </div>
          <button
            onClick={() => {
              dispatch(clearReplyingTo())
              dispatch(clearEditingMessage())
              setMessage("")
            }}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* File Preview - Compact */}
      {selectedFile && (
        <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {filePreview ? (
              <img src={filePreview} alt="Preview" className="w-10 h-10 rounded object-cover flex-shrink-0" />
            ) : (
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center flex-shrink-0">
                <Paperclip size={16} />
              </div>
            )}
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{selectedFile.name}</span>
          </div>
          <button
            onClick={() => {
              setSelectedFile(null)
              setFilePreview(null)
              if (fileInputRef.current) fileInputRef.current.value = ""
            }}
            className="text-red-600 hover:text-red-800 transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Upload Progress - Compact */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-[#0158B7] to-[#5E96D2] h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
            {uploadProgress}%
          </p>
        </div>
      )}

      {/* Input Area - Compact */}
      <div className="flex items-end gap-2">
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            disabled={isSending}
            title="Attach file"
          >
            <Paperclip size={18} />
            <input 
              ref={fileInputRef} 
              type="file" 
              className="hidden" 
              onChange={handleFileSelect} 
              disabled={isSending} 
            />
          </button>

          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors"
            disabled={isSending}
            title="Add emoji"
          >
            <Smile size={18} />
          </button>
        </div>

        <div className="relative flex-1 min-w-0">
          {showEmojiPicker && (
            <div className="absolute bottom-full mb-2 z-10">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setMessage((prev) => prev + emojiData.emoji)
                  setShowEmojiPicker(false)
                  textareaRef.current?.focus()
                }}
              />
            </div>
          )}

          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              handleTyping()
            }}
            onKeyDown={handleKeyPress}
            placeholder={placeholderText}
            className="w-full p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all"
            rows={1}
            style={{ minHeight: "40px", maxHeight: "100px" }}
            disabled={isSending || (activeChatType === 'direct' && !activeDirectChatUserId)}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={isSending || (!message.trim() && !selectedFile) || (activeChatType === 'direct' && !activeDirectChatUserId)}
          className="p-2.5 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
          title="Send message"
        >
          {isSending ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {/* Chat Type Indicator - Compact */}
      {activeChatType === 'direct' && activeDirectUserName && (
        <div className="mt-2 flex items-center justify-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            Direct: {activeDirectUserName}
          </span>
        </div>
      )}
    </div>
  )
}

export default ChatInput