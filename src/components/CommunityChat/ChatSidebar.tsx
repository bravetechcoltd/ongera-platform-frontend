"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Search, Users, UserCheck, UserX, MessageCircle } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { switchChatMode } from "@/lib/features/communityChat/communityChatSlice"
import axios from "axios"
import Cookies from "js-cookie"
import DirectChatUserList from "./DirectChatUserList"

interface ChatSidebarProps {
  communityId: string
}

interface Member {
  id: string
  name: string
  profilePicture?: string
  role?: string
  isOnline: boolean
}

interface ApiMember {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  profile_picture_url?: string
}

interface ApiResponse {
  members: ApiMember[]
  creator: ApiMember
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ communityId }) => {
  const dispatch = useAppDispatch()
  const { onlineMembers, activeChatType, unreadDirectCounts } = useAppSelector((state) => state.communityChat)
  
  const [activeTab, setActiveTab] = useState<'community' | 'direct'>(activeChatType)
  const [members, setMembers] = useState<Member[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCommunityMembers()
  }, [communityId])

  useEffect(() => {
    setActiveTab(activeChatType)
  }, [activeChatType])

  const fetchCommunityMembers = async () => {
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/communities/${communityId}/members`, {
        headers: {
          Authorization: `Bearer ${Cookies.get("token")}`,
        },
      })
      
      const apiData: ApiResponse = response.data.data
      
      const transformedMembers: Member[] = apiData.members.map((member: ApiMember) => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        profilePicture: member.profile_picture_url,
        role: member.id === apiData.creator.id ? "Creator" : "Member",
        isOnline: onlineMembers.some((om) => om.userId === member.id)
      }))

      setMembers(transformedMembers)
    } catch (error) {
      console.error("Failed to fetch members:", error)
      setMembers([])
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (tab: 'community' | 'direct') => {
    setActiveTab(tab)
    if (tab === 'community') {
      dispatch(switchChatMode('community'))
    }
  }

  const handleCommunityHeaderClick = () => {
    dispatch(switchChatMode('community'))
  }

  const filteredMembers = members.filter((member) => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const onlineFilteredMembers = filteredMembers.filter((member) => 
    onlineMembers.some((om) => om.userId === member.id)
  )

  const offlineFilteredMembers = filteredMembers.filter((member) =>
    !onlineMembers.some((om) => om.userId === member.id)
  )

  // Calculate total unread direct messages
  const totalUnreadDirect = Object.values(unreadDirectCounts).reduce((sum, count) => sum + count, 0)

  const renderMember = (member: Member) => {
    const isOnline = onlineMembers.some((om) => om.userId === member.id)

    return (
      <div
        key={member.id}
        className="flex items-center space-x-3 px-4 py-3 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 cursor-pointer transition-all rounded-lg"
      >
        <div className="relative">
          {member.profilePicture ? (
            <img
              src={member.profilePicture}
              alt={member.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-semibold">
              {member.name.charAt(0)}
            </div>
          )}
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${
              isOnline ? "bg-green-500" : "bg-gray-400"
            }`}
          ></div>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
          {member.role && <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.role}</p>}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0158B7] border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex">
          <button
            onClick={() => handleTabChange('community')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all relative ${
              activeTab === 'community'
                ? "text-[#0158B7] dark:text-[#5E96D2] bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Users size={18} />
              <span>Community</span>
            </div>
            {activeTab === 'community' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0158B7] dark:bg-[#5E96D2]" />
            )}
          </button>

          <button
            onClick={() => handleTabChange('direct')}
            className={`flex-1 px-4 py-3 text-sm font-semibold transition-all relative ${
              activeTab === 'direct'
                ? "text-[#0158B7] dark:text-[#5E96D2] bg-blue-50 dark:bg-blue-900/20"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageCircle size={18} />
              <span>Direct</span>
              {totalUnreadDirect > 0 && (
                <span className="ml-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {totalUnreadDirect > 99 ? "99+" : totalUnreadDirect}
                </span>
              )}
            </div>
            {activeTab === 'direct' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0158B7] dark:bg-[#5E96D2]" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'community' ? (
        <div className="flex flex-col flex-1">
          {/* Community Chat Header - Clickable */}
          <div 
            onClick={handleCommunityHeaderClick}
            className="p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center">
                <Users className="text-white" size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Community Chat</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {onlineFilteredMembers.length} online • {members.length} members
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0158B7] focus:border-transparent"
              />
            </div>
          </div>

          {/* Members List */}
          <div className="flex-1 overflow-y-auto">
            {/* Online Members */}
            {onlineFilteredMembers.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                  <UserCheck size={16} className="text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Online ({onlineFilteredMembers.length})
                  </span>
                </div>
                <div className="py-2">{onlineFilteredMembers.map(renderMember)}</div>
              </div>
            )}

            {/* Offline Members */}
            {offlineFilteredMembers.length > 0 && (
              <div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                  <UserX size={16} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Offline ({offlineFilteredMembers.length})
                  </span>
                </div>
                <div className="py-2">{offlineFilteredMembers.map(renderMember)}</div>
              </div>
            )}

            {filteredMembers.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <Users size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No members found</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <DirectChatUserList communityId={communityId} />
      )}
    </div>
  )
}

export default ChatSidebar