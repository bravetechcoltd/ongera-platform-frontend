import { motion } from "framer-motion";
import { Star, Award, TrendingUp, Users, BookOpen, Calendar } from "lucide-react";

interface MonthlyStarBannerProps {
  badge_image_url: string;
  month: string;
  year: number;
  description: string;
  rewards?: string;
  statistics: {
    projects_count: number;
    blogs_count: number;
    events_attended: number;
    followers_count: number;
    total_score: number;
  };
}

export default function MonthlyStarBanner({
  badge_image_url,
  month,
  year,
  description,
  rewards,
  statistics
}: MonthlyStarBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-[#0158B7] to-[#5E96D2] rounded-xl p-3 border border-[#0158B7] mb-3"
    >
      <div className="flex items-start gap-3">
        {/* Badge Image */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="flex-shrink-0"
        >
          <img
            src={badge_image_url}
            alt="Monthly Star Badge"
            className="w-20 h-20 rounded-lg object-cover border-2 border-white"
          />
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-2">
            <Star className="w-4 h-4 text-white fill-white" />
            <h3 className="text-sm font-bold text-white">
              🌟 Monthly Star - {month} {year}
            </h3>
          </div>

          <p className="text-white/95 text-xs mb-3 leading-relaxed">
            {description}
          </p>

          {/* Statistics Grid - Compact */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 border border-white/30">
              <div className="flex items-center gap-1 mb-0.5">
                <BookOpen className="w-3 h-3 text-white" />
                <span className="text-xs text-white/90 font-medium">Proj</span>
              </div>
              <div className="text-base font-bold text-white">
                {statistics.projects_count}
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 border border-white/30">
              <div className="flex items-center gap-1 mb-0.5">
                <TrendingUp className="w-3 h-3 text-white" />
                <span className="text-xs text-white/90 font-medium">Blog</span>
              </div>
              <div className="text-base font-bold text-white">
                {statistics.blogs_count}
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 border border-white/30">
              <div className="flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3 text-white" />
                <span className="text-xs text-white/90 font-medium">Event</span>
              </div>
              <div className="text-base font-bold text-white">
                {statistics.events_attended}
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-1.5 border border-white/30">
              <div className="flex items-center gap-1 mb-0.5">
                <Users className="w-3 h-3 text-white" />
                <span className="text-xs text-white/90 font-medium">Follow</span>
              </div>
              <div className="text-base font-bold text-white">
                {statistics.followers_count}
              </div>
            </div>
          </div>

          {/* Total Score */}
          <div className="flex items-center justify-between bg-white/30 backdrop-blur-sm rounded-lg p-2 border border-white/40 mb-2">
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-white" />
              <span className="text-xs font-semibold text-white">Total Score</span>
            </div>
            <span className="text-xl font-bold text-white">
              {statistics.total_score} pts
            </span>
          </div>

          {/* Rewards */}
          {rewards && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/20 backdrop-blur-sm rounded-lg p-2 border border-white/30"
            >
              <div className="flex items-center gap-1 mb-1">
                <Award className="w-3 h-3 text-white" />
                <span className="text-xs font-semibold text-white">Rewards</span>
              </div>
              <p className="text-xs text-white/95">{rewards}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}