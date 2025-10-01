"use client"

import { useState, useRef, useEffect } from "react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { setReplyingTo, setEditingMessage } from "@/lib/features/communityChat/communityChatSlice"
import { deleteCommunityMessage, reactToMessage } from "@/lib/services/communityChatSocket"
import { formatDistanceToNow } from "date-fns"
import { Reply, Edit2, Trash2, Smile, Copy, MoreVertical, Check, CheckCheck } from "lucide-react"
import EmojiPicker from "emoji-picker-react"

interface MessageItemProps {
  message: any
  isOwnMessage: boolean
  showAvatar: boolean
  showSenderName: boolean
  communityId: string
}

export default function MessageItem({
  message,
  isOwnMessage,
  showAvatar,
  showSenderName,
  communityId,
}: MessageItemProps) {
  const dispatch = useAppDispatch()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [showActions, setShowActions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const messageRef = useRef<HTMLDivElement>(null)
  const emojiPickerRef = useRef<HTMLDivElement>(null)

  // FIXED: Safely get the timestamp with fallback
  const getMessageTimestamp = () => {
    const timestamp = message.createdAt || message.created_at
    if (!timestamp) return new Date()
    
    const date = new Date(timestamp)
    // Check if date is valid
    return isNaN(date.getTime()) ? new Date() : date
  }

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false)
      }
    }

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showEmojiPicker])

  const handleReply = () => {
    dispatch(setReplyingTo(message))
    setShowActions(false)
  }

  const handleEdit = () => {
    dispatch(setEditingMessage(message))
    setShowActions(false)
  }

  const handleDelete = (deleteType: "for_everyone" | "for_me") => {
    if (deleteType === "for_everyone" && !confirm("Are you sure you want to delete this message for everyone?")) {
      return
    }
    deleteCommunityMessage(message.id, deleteType, communityId)
    setShowActions(false)
    setShowMoreMenu(false)
  }

  const handleReact = (emojiData: any) => {
    reactToMessage(message.id, emojiData.emoji, communityId)
    setShowEmojiPicker(false)
    setShowActions(false)
  }

  const handleCopy = () => {
    // FIXED: Check both property names
    const messageType = message.messageType || message.message_type
    if (messageType === "text") {
      navigator.clipboard.writeText(message.content)
      setShowActions(false)
    }
  }

  const renderMessageContent = () => {
    // FIXED: Check both property names
    const deletedForEveryone = message.deletedForEveryone || message.deleted_for_everyone
    if (deletedForEveryone) {
      return (
        <div className="italic text-gray-400 text-sm">
          <Trash2 className="w-3 h-3 inline mr-1" />
          This message was deleted
        </div>
      )
    }

    // FIXED: Check both property names for message type
    const messageType = message.messageType || message.message_type
    const fileUrl = message.fileUrl || message.file_url
    const fileName = message.fileName || message.file_name
    const fileType = message.fileType || message.file_type

    switch (messageType) {
      case "text":
        return <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>

      case "image":
        return (
          <div className="max-w-sm">
            {!imageLoaded && <div className="w-full h-48 bg-gray-200 animate-pulse rounded-lg" />}
            <img
              src={fileUrl || "/placeholder.svg"}
              alt={fileName || "Image"}
              className={`rounded-lg cursor-pointer hover:opacity-90 transition-opacity ${
                imageLoaded ? "block" : "hidden"
              }`}
              onLoad={() => setImageLoaded(true)}
              onClick={() => window.open(fileUrl, "_blank")}
            />
            {message.content && <p className="mt-2 text-sm whitespace-pre-wrap break-words">{message.content}</p>}
          </div>
        )

      case "video":
        return (
          <div className="max-w-sm">
            <video src={fileUrl} controls className="rounded-lg w-full" />
            {message.content && <p className="mt-2 text-sm whitespace-pre-wrap break-words">{message.content}</p>}
          </div>
        )

      case "audio":
        return (
          <div className="w-full max-w-sm">
            <audio src={fileUrl} controls className="w-full" />
            {message.content && <p className="mt-2 text-sm whitespace-pre-wrap break-words">{message.content}</p>}
          </div>
        )

      case "document":
        return (
          <div>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-semibold text-xs">
                  {fileType?.split("/")[1]?.toUpperCase() || "FILE"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{fileName}</p>
                <p className="text-xs text-gray-500">Click to download</p>
              </div>
            </a>
            {message.content && <p className="mt-2 text-sm whitespace-pre-wrap break-words">{message.content}</p>}
          </div>
        )

      default:
        return <p className="text-sm">{message.content}</p>
    }
  }

  const renderReplyPreview = () => {
    // FIXED: Check both property names
    const replyTo = message.replyTo || message.reply_to
    if (!replyTo) return null

    const replyMessageType = replyTo.messageType || replyTo.message_type

    return (
      <div className="mb-2 pl-3 border-l-2 border-gray-300 dark:border-gray-600">
        <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {replyTo.sender?.name || "Unknown User"}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
          {replyMessageType === "text"
            ? replyTo.content
            : `${replyMessageType} message`}
        </p>
      </div>
    )
  }

  const renderReactions = () => {
    if (!message.reactions || Object.keys(message.reactions).length === 0) {
      return null
    }

    // Group reactions by emoji
    const reactionGroups: { [emoji: string]: string[] } = {}
    Object.entries(message.reactions).forEach(([userId, emoji]) => {
      if (!reactionGroups[emoji as string]) {
        reactionGroups[emoji as string] = []
      }
      reactionGroups[emoji as string].push(userId)
    })

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionGroups).map(([emoji, userIds]) => {
          const hasReacted = userIds.includes(currentUser?.id || "")
          return (
            <button
              key={emoji}
              onClick={() => reactToMessage(message.id, emoji, communityId)}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                hasReacted
                  ? "bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700"
                  : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <span>{emoji}</span>
              <span className="font-medium">{userIds.length}</span>
            </button>
          )
        })}
      </div>
    )
  }

  // FIXED: Get sender info safely
  const senderName = message.sender?.name || "Unknown User"
  const senderProfilePicture = message.sender?.profilePicture || message.sender?.profile_picture
  const messageType = message.messageType || message.message_type
  const readBy = message.readBy || message.read_by

  return (
    <div
      ref={messageRef}
      className={`flex gap-3 px-4 py-2 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group ${
        isOwnMessage ? "flex-row-reverse" : "flex-row"
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => {
        setShowActions(false)
        setShowMoreMenu(false)
      }}
    >
      {/* Avatar */}
      {showAvatar ? (
        <div className="flex-shrink-0">
          {senderProfilePicture ? (
            <img
              src={senderProfilePicture}
              alt={senderName}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-semibold">
              {senderName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      ) : (
        <div className="w-10 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div className={`flex-1 min-w-0 ${isOwnMessage ? "items-end" : "items-start"} flex flex-col`}>
        {/* Sender Name & Timestamp */}
        {showSenderName && (
          <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {senderName}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(getMessageTimestamp(), {
                addSuffix: true,
              })}
            </span>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={`relative max-w-[70%] rounded-2xl px-4 py-2 ${
            isOwnMessage
              ? "bg-gradient-to-br from-[#0158B7] to-[#5E96D2] text-white ml-auto"
              : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
          }`}
        >
          {renderReplyPreview()}
          {renderMessageContent()}

          {/* Edit Indicator */}
          {message.edited && (
            <span className={`text-xs mt-1 block ${isOwnMessage ? "text-blue-100" : "text-gray-500"}`}>(edited)</span>
          )}

          {/* Timestamp for own messages */}
          {isOwnMessage && !showSenderName && (
            <div className="flex items-center gap-1 justify-end mt-1">
              <span className="text-xs text-blue-100">
                {formatDistanceToNow(getMessageTimestamp(), {
                  addSuffix: true,
                })}
              </span>
              {readBy && readBy.length > 0 ? (
                <CheckCheck className="w-3 h-3 text-blue-100" />
              ) : (
                <Check className="w-3 h-3 text-blue-100" />
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {renderReactions()}

        {/* Action Buttons */}
        {showActions && !(message.deletedForEveryone || message.deleted_for_everyone) && (
          <div
            className={`absolute ${
              isOwnMessage ? "left-0" : "right-0"
            } top-0 flex items-center gap-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-1 border border-gray-200 dark:border-gray-700 z-10`}
          >
            <button
              onClick={handleReply}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="Reply"
            >
              <Reply className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {isOwnMessage && (
              <button
                onClick={handleEdit}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              title="React"
            >
              <Smile className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>

            {messageType === "text" && (
              <button
                onClick={handleCopy}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Copy"
              >
                <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}

            <div className="relative">
              <button
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="More"
              >
                <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>

              {showMoreMenu && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[150px] z-20">
                  {isOwnMessage && (
                    <button
                      onClick={() => handleDelete("for_everyone")}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete for everyone
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete("for_me")}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete for me
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute z-50 mt-2"
            style={{
              [isOwnMessage ? "right" : "left"]: "0",
            }}
          >
            <EmojiPicker onEmojiClick={handleReact} />
          </div>
        )}
      </div>
    </div>
  )
}