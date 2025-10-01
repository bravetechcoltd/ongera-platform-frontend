"use client"

import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { voteAnswer, removeVote } from "@/lib/features/auth/qaSlice"
import { ChevronUp, ChevronDown } from "lucide-react"

interface VoteButtonsProps {
  answerId: string
  upvotesCount: number
  userVote?: string
  disabled?: boolean
}

export default function VoteButtons({ 
  answerId, 
  upvotesCount, 
  userVote,
  disabled = false 
}: VoteButtonsProps) {
  const dispatch = useAppDispatch()
  const { isSubmitting } = useAppSelector(state => state.qa)
  const { user } = useAppSelector(state => state.auth)

  const handleVote = async (voteType: "UPVOTE" | "DOWNVOTE") => {
    if (!user) {
      alert("Please login to vote")
      return
    }

    if (disabled) return

    if (userVote === voteType) {
      // Remove vote if clicking same button
      await dispatch(removeVote(answerId))
    } else {
      // Add or change vote
      await dispatch(voteAnswer({ answerId, voteType }))
    }
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        onClick={() => handleVote("UPVOTE")}
        disabled={isSubmitting || disabled}
        className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          userVote === "UPVOTE"
            ? "bg-emerald-500 text-white shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-emerald-50 hover:text-emerald-600"
        }`}
        title={disabled ? "You cannot vote on your own answer" : "Upvote"}
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      <span className={`text-lg font-bold ${
        userVote === "UPVOTE" 
          ? "text-emerald-600" 
          : userVote === "DOWNVOTE"
          ? "text-red-600"
          : "text-gray-900"
      }`}>
        {upvotesCount}
      </span>

      <button
        onClick={() => handleVote("DOWNVOTE")}
        disabled={isSubmitting || disabled}
        className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
          userVote === "DOWNVOTE"
            ? "bg-red-500 text-white shadow-md"
            : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
        }`}
        title={disabled ? "You cannot vote on your own answer" : "Downvote"}
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  )
}