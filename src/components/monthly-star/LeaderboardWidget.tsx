import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp } from "lucide-react";

interface TopPerformer {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    profile_picture_url?: string;
    account_type: string;
  };
  statistics: {
    projects_count: number;
    blogs_count: number;
    events_attended: number;
    followers_count: number;
    total_score: number;
  };
}

interface LeaderboardWidgetProps {
  topPerformers: TopPerformer[];
  month: string;
  year: number;
  communityName?: string;
  isLoading?: boolean;
}

export default function LeaderboardWidget({
  topPerformers,
  month,
  year,
  communityName,
  isLoading
}: LeaderboardWidgetProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-4 h-4 text-[#0158B7]" />;
      case 2:
        return <Medal className="w-4 h-4 text-gray-500" />;
      case 3:
        return <Award className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-[#0158B7] to-[#5E96D2]";
      case 2:
        return "from-gray-400 to-gray-500";
      case 3:
        return "from-orange-400 to-orange-500";
      default:
        return "from-blue-400 to-blue-500";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-[#0158B7]" />
            Top Performers
          </h3>
          <p className="text-xs text-gray-500">
            {month} {year} {communityName && `• ${communityName}`}
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-2">
        {topPerformers.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-xs">
            No top performers yet this month
          </div>
        ) : (
          topPerformers.map((performer, index) => (
            <motion.div
              key={performer.user.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative bg-gradient-to-r ${getRankColor(index + 1)} rounded-lg p-3 overflow-hidden`}
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
              </div>

              <div className="relative flex items-center gap-2">
                {/* Rank */}
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {performer.user.profile_picture_url ? (
                      <img
                        src={performer.user.profile_picture_url}
                        alt={performer.user.first_name}
                        className="w-6 h-6 rounded-full border-2 border-white object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-gray-700 border-2 border-white flex-shrink-0">
                        {performer.user.first_name[0]}{performer.user.last_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {performer.user.first_name} {performer.user.last_name}
                      </p>
                      <p className="text-xs text-white/90 capitalize truncate">
                        {performer.user.account_type.toLowerCase()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-lg font-bold text-white">
                    {performer.statistics.total_score}
                  </div>
                  <div className="text-xs text-white/90">points</div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="mt-2 flex gap-2 text-xs text-white/90">
                <span>{performer.statistics.projects_count} proj</span>
                <span>•</span>
                <span>{performer.statistics.blogs_count} blogs</span>
                <span>•</span>
                <span>{performer.statistics.events_attended} events</span>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Footer Note */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Rankings updated based on contributions this month
        </p>
      </div>
    </div>
  );
}