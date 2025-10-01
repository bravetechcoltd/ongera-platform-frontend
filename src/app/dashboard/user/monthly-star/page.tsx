"use client"

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchBestPerformersAllCommunities } from "@/lib/features/auth/monthlyStarSlice";
import LeaderboardWidget from "@/components/monthly-star/LeaderboardWidget";
import { motion } from "framer-motion";
import { Star, Trophy, TrendingUp, Loader2 } from "lucide-react";

export default function MonthlyStarPage() {
  const dispatch = useAppDispatch();
  const { allCommunitiesData, isLoading } = useAppSelector(
    (state) => state.monthlyStar
  );

  useEffect(() => {
    dispatch(fetchBestPerformersAllCommunities());
  }, [dispatch]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0158B7]" />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3 max-w-[1400px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-[#0158B7] to-[#5E96D2] rounded-xl p-4 border border-[#0158B7]"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 flex-shrink-0">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-white mb-0.5">
              🌟 Monthly Star Program
            </h1>
            <p className="text-white/90 text-xs">
              Recognizing outstanding contributors across the platform
            </p>
          </div>
        </div>
      </motion.div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-gray-200 p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Trophy className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">How It Works</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Top performers are selected based on research projects, blog posts, event participation, and community engagement.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl border border-gray-200 p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Scoring System</h3>
          </div>
          <div className="text-xs text-gray-600 space-y-0.5">
            <p>• Projects: 5 points each</p>
            <p>• Blogs: 3 points each</p>
            <p>• Events: 2 points each</p>
            <p>• Followers: 1 point each</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-200 p-3"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Star className="w-4 h-4 text-purple-600" />
            </div>
            <h3 className="font-bold text-gray-900 text-sm">Rewards</h3>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            Monthly stars receive recognition badges, platform visibility, and special rewards from admins.
          </p>
        </motion.div>
      </div>

      {/* Current Month Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {allCommunitiesData && (
          <LeaderboardWidget
            topPerformers={allCommunitiesData.topPerformers}
            month={allCommunitiesData.month}
            year={allCommunitiesData.year}
            isLoading={isLoading}
          />
        )}
      </motion.div>

      {/* Motivation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl border border-gray-200 p-4 text-center"
      >
        <div className="w-12 h-12 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-full flex items-center justify-center mx-auto mb-3">
          <Star className="w-6 h-6 text-white fill-white" />
        </div>
        <h2 className="text-base font-bold text-gray-900 mb-2">
          Keep Contributing!
        </h2>
        <p className="text-gray-600 text-xs max-w-2xl mx-auto leading-relaxed">
          Your contributions make a difference in Rwanda's research community. Upload projects, write blogs, attend events, and engage with fellow researchers to increase your chances of becoming next month's star!
        </p>
      </motion.div>
    </div>
  );
}