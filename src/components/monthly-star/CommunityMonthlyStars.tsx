import { motion } from "framer-motion";
import { Star, Trophy, Medal, Award, BookOpen, TrendingUp, Calendar, Users, Eye, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopPerformer {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url?: string;
    account_type: string;
    profile?: any;
  };
  statistics: {
    projects_count: number;
    blogs_count: number;
    events_attended: number;
    followers_count: number;
    total_score: number;
  };
  details: {
    projects: any[];
    blogs: any[];
    events: any[];
  };
}

interface CommunityMonthlyStarsProps {
  topPerformers: TopPerformer[];
  month: string;
  year: number;
  communityName: string;
  isLoading: boolean;
  onViewDetails: () => void;
}

export default function CommunityMonthlyStars({
  topPerformers,
  month,
  year,
  communityName,
  isLoading,
  onViewDetails
}: CommunityMonthlyStarsProps) {
  const router = useRouter();

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

  const getRankBgColor = (rank: number) => {
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
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!topPerformers || topPerformers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg flex items-center justify-center">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">Monthly Stars</h3>
            <p className="text-xs text-gray-500">{month} {year}</p>
          </div>
        </div>
        <div className="text-center py-4">
          <Star className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No stars yet this month</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg flex items-center justify-center">
          <Star className="w-4 h-4 text-white fill-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-gray-900">🌟 Monthly Stars</h3>
          <p className="text-xs text-gray-500 truncate">{month} {year}</p>
        </div>
      </div>

      {/* Top Performers */}
      <div className="space-y-2 mb-3">
        {topPerformers.slice(0, 3).map((performer, index) => (
          <motion.div
            key={performer.user.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative bg-gradient-to-r ${getRankBgColor(index + 1)} rounded-lg p-2.5 overflow-hidden cursor-pointer hover:shadow-md transition-all`}
            onClick={onViewDetails}
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-12 h-12 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            </div>

            <div className="relative">
              {/* User Info */}
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-shrink-0">
                  {getRankIcon(index + 1)}
                </div>
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
                  <p className="text-xs font-bold text-white truncate">
                    {performer.user.first_name} {performer.user.last_name}
                  </p>
                  <p className="text-xs text-white/90 capitalize truncate">
                    {performer.user.account_type.toLowerCase()}
                  </p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-base font-bold text-white">
                    {performer.statistics.total_score}
                  </div>
                  <div className="text-xs text-white/90">pts</div>
                </div>
              </div>

              {/* Compact Stats */}
              <div className="grid grid-cols-4 gap-1">
                <div className="bg-white/20 backdrop-blur-sm rounded p-1 border border-white/30">
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    <BookOpen className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="text-xs font-bold text-white text-center">
                    {performer.statistics.projects_count}
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded p-1 border border-white/30">
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    <TrendingUp className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="text-xs font-bold text-white text-center">
                    {performer.statistics.blogs_count}
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded p-1 border border-white/30">
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    <Calendar className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="text-xs font-bold text-white text-center">
                    {performer.statistics.events_attended}
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded p-1 border border-white/30">
                  <div className="flex items-center justify-center gap-0.5 mb-0.5">
                    <Users className="w-2.5 h-2.5 text-white" />
                  </div>
                  <div className="text-xs font-bold text-white text-center">
                    {performer.statistics.followers_count}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View Details Button */}
      <button
        onClick={onViewDetails}
        className="w-full py-2 px-3 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all flex items-center justify-center gap-1"
      >
        <Eye className="w-3 h-3" />
        View Full Details
      </button>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Top contributors this month
        </p>
      </div>
    </div>
  );
}