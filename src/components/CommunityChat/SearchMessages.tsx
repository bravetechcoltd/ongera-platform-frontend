"use client"

import type React from "react"
import { useState } from "react"
import { Search, X } from "lucide-react"
import { useAppDispatch } from "@/lib/hooks"
import { setSearchQuery } from "../../lib/features/communityChat/communityChatSlice"

interface SearchMessagesProps {
  communityId: string
}

const SearchMessages: React.FC<SearchMessagesProps> = ({ communityId }) => {
  const dispatch = useAppDispatch()
  const [query, setQuery] = useState("")

  const handleClose = () => {
    dispatch(setSearchQuery(""))
    setQuery("")
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#0158B7] focus:border-transparent"
              autoFocus
            />
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <Search size={64} className="text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Search for messages</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Type to search through conversation history</p>
        </div>
      </div>
    </div>
  )
}

export default SearchMessages
