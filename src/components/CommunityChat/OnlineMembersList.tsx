"use client"

import type React from "react"
import { Users } from "lucide-react"
import { useAppSelector } from "@/lib/hooks"

interface OnlineMembersListProps {
  communityId: string
}

const OnlineMembersList: React.FC<OnlineMembersListProps> = ({ communityId }) => {
  const { onlineMembers } = useAppSelector((state) => state.communityChat)

  const filteredMembers = onlineMembers.filter((member) => member.communityId === communityId)

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Users size={20} className="text-[#0158B7]" />
          <span>Online ({filteredMembers.length})</span>
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <Users size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No members online</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <div
                key={member.userId}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center text-white font-semibold">
                    {member.userName.charAt(0)}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{member.userName}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default OnlineMembersList
