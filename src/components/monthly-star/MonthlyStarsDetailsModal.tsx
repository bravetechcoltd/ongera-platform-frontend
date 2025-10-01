import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Trophy, Medal, Award, BookOpen, TrendingUp, Calendar, Users, Eye, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface TopPerformer {
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    profile_picture_url?: string;
    account_type: string;
    profile?: {
      institution_name?: string;
      department?: string;
      academic_level?: string;
      research_interests?: string[];
      linkedin_url?: string;
      google_scholar_url?: string;
      website_url?: string;
    };
  };
  statistics: {
    projects_count: number;
    blogs_count: number;
    events_attended: number;
    followers_count: number;
    total_score: number;
  };
  details: {
    projects: Array<{
      id: string;
      title: string;
      created_at: string;
    }>;
    blogs: Array<{
      id: string;
      title: string;
      created_at: string;
    }>;
    events: Array<{
      id: string;
      registered_at: string;
    }>;
  };
}

interface MonthlyStarsDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  topPerformers: TopPerformer[];
  month: string;
  year: number;
  communityName: string;
}

export default function MonthlyStarsDetailsModal({
  isOpen,
  onClose,
  topPerformers,
  month,
  year,
  communityName
}: MonthlyStarsDetailsModalProps) {
  const router = useRouter();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-[#0158B7]" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-500" />;
      case 3:
        return <Award className="w-5 h-5 text-orange-500" />;
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-hidden pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] p-4 rounded-t-xl ">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <Star className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">
                    🌟 Monthly Stars - {month} {year}
                  </h2>
                  <p className="text-sm text-white/90">{communityName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <motion.div
                  key={performer.user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 rounded-xl p-4 hover:border-[#5E96D2] hover:shadow-md transition-all"
                >
                  {/* Rank Header */}
                  <div className={`bg-gradient-to-r ${getRankBgColor(index + 1)} rounded-lg p-3 mb-4`}>
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        {performer.user.profile_picture_url ? (
                          <img
                            src={performer.user.profile_picture_url}
                            alt={performer.user.first_name}
                            className="w-12 h-12 rounded-full border-2 border-white object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-sm font-bold text-gray-700 border-2 border-white">
                            {performer.user.first_name[0]}{performer.user.last_name[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-bold text-white">
                            {performer.user.first_name} {performer.user.last_name}
                          </p>
                          <p className="text-sm text-white/90 capitalize">
                            {performer.user.account_type}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {performer.statistics.total_score}
                          </div>
                          <div className="text-xs text-white/90">points</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* User Profile Info */}
                  {performer.user.profile && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                        {performer.user.profile.institution_name && (
                          <div>
                            <span className="font-semibold text-gray-700">Institution:</span>
                            <span className="ml-1 text-gray-600">{performer.user.profile.institution_name}</span>
                          </div>
                        )}
                        {performer.user.profile.department && (
                          <div>
                            <span className="font-semibold text-gray-700">Department:</span>
                            <span className="ml-1 text-gray-600">{performer.user.profile.department}</span>
                          </div>
                        )}
                        {performer.user.profile.academic_level && (
                          <div>
                            <span className="font-semibold text-gray-700">Level:</span>
                            <span className="ml-1 text-gray-600">{performer.user.profile.academic_level}</span>
                          </div>
                        )}
                      </div>

                      {/* Research Interests */}
                      {performer.user.profile.research_interests && performer.user.profile.research_interests.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-gray-700 mb-1">Research Interests:</p>
                          <div className="flex flex-wrap gap-1">
                            {performer.user.profile.research_interests.slice(0, 5).map((interest, idx) => (
                              <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs">
                                {interest}
                              </span>
                            ))}
                            {performer.user.profile.research_interests.length > 5 && (
                              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                                +{performer.user.profile.research_interests.length - 5}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Social Links */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {performer.user.profile.linkedin_url && (
                          <a
                            href={performer.user.profile.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                        {performer.user.profile.google_scholar_url && (
                          <a
                            href={performer.user.profile.google_scholar_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Scholar
                          </a>
                        )}
                        {performer.user.profile.website_url && (
                          <a
                            href={performer.user.profile.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200 transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Statistics */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                      <div className="flex items-center gap-1 mb-1">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">Projects</span>
                      </div>
                      <div className="text-xl font-bold text-blue-900">
                        {performer.statistics.projects_count}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                      <div className="flex items-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">Blogs</span>
                      </div>
                      <div className="text-xl font-bold text-purple-900">
                        {performer.statistics.blogs_count}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                      <div className="flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Events</span>
                      </div>
                      <div className="text-xl font-bold text-green-900">
                        {performer.statistics.events_attended}
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-2 border border-orange-100">
                      <div className="flex items-center gap-1 mb-1">
                        <Users className="w-3 h-3 text-orange-600" />
                        <span className="text-xs text-orange-600 font-medium">Followers</span>
                      </div>
                      <div className="text-xl font-bold text-orange-900">
                        {performer.statistics.followers_count}
                      </div>
                    </div>
                  </div>

                  {/* Contributions Details */}
                  <div className="space-y-3">
                    {/* Projects */}
                    {performer.details.projects.length > 0 && (
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                        <h4 className="text-xs font-bold text-blue-900 mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Recent Projects ({performer.details.projects.length})
                        </h4>
                        <div className="space-y-1">
                          {performer.details.projects.slice(0, 2).map((project) => (
                            <div key={project.id} className="text-xs text-blue-800">
                              <span className="font-medium">• {project.title}</span>
                              <span className="text-blue-600 ml-1">- {formatDate(project.created_at)}</span>
                            </div>
                          ))}
                          {performer.details.projects.length > 2 && (
                            <p className="text-xs text-blue-600 italic">
                              +{performer.details.projects.length - 2} more projects
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Blogs */}
                    {performer.details.blogs.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
                        <h4 className="text-xs font-bold text-purple-900 mb-2 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Recent Blogs ({performer.details.blogs.length})
                        </h4>
                        <div className="space-y-1">
                          {performer.details.blogs.slice(0, 2).map((blog) => (
                            <div key={blog.id} className="text-xs text-purple-800">
                              <span className="font-medium">• {blog.title}</span>
                              <span className="text-purple-600 ml-1">- {formatDate(blog.created_at)}</span>
                            </div>
                          ))}
                          {performer.details.blogs.length > 2 && (
                            <p className="text-xs text-purple-600 italic">
                              +{performer.details.blogs.length - 2} more blogs
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {performer.details.events.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                        <h4 className="text-xs font-bold text-green-900 mb-2 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Events Attended ({performer.details.events.length})
                        </h4>
                        <div className="grid grid-cols-2 gap-1">
                          {performer.details.events.slice(0, 4).map((event, idx) => (
                            <div key={event.id} className="text-xs text-green-800">
                              <span className="font-medium">Event {idx + 1}:</span>
                              <span className="text-green-600 ml-1">{formatDate(event.registered_at)}</span>
                            </div>
                          ))}
                        </div>
                        {performer.details.events.length > 4 && (
                          <p className="text-xs text-green-600 italic mt-1">
                            +{performer.details.events.length - 4} more events
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
            <button
              onClick={onClose}
              className="w-full py-2 px-4 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white rounded-lg font-semibold hover:shadow-md transition-all"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}