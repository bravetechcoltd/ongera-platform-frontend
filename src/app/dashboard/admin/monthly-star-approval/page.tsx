"use client"

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { 
  fetchBestPerformersAllCommunities, 
  fetchBestPerformersCommunity,
  approveBestPerformer 
} from "@/lib/features/auth/monthlyStarSlice";
import { motion } from "framer-motion";
import { 
  Star, Upload, Award, CheckCircle, X, Loader2,
  Users, BookOpen, Calendar, TrendingUp, ImageIcon
} from "lucide-react";

export default function MonthlyStarApproval() {
  const dispatch = useAppDispatch();
  const { allCommunitiesData, isLoading, isSubmitting } = useAppSelector(
    (state) => state.monthlyStar
  );

  const [selectedPerformer, setSelectedPerformer] = useState<any>(null);
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [badgeImage, setBadgeImage] = useState<File | null>(null);
  const [badgePreview, setBadgePreview] = useState<string>("");
  const [description, setDescription] = useState("");
  const [rewards, setRewards] = useState("");

  useEffect(() => {
    dispatch(fetchBestPerformersAllCommunities());
  }, [dispatch]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBadgeImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBadgePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPerformer || !badgeImage || !description) {
      alert("Please fill all required fields");
      return;
    }

    const result = await dispatch(approveBestPerformer({
      user_id: selectedPerformer.user.id,
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      badge_image: badgeImage,
      description,
      rewards
    }));

    if (approveBestPerformer.fulfilled.match(result)) {
      alert("Monthly star approved and notified successfully!");
      setShowApprovalForm(false);
      setSelectedPerformer(null);
      setBadgeImage(null);
      setBadgePreview("");
      setDescription("");
      setRewards("");
      dispatch(fetchBestPerformersAllCommunities());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#0158B7]" />
      </div>
    );
  }

  return (
    <div className="p-3 space-y-3">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#0158B7] to-[#5E96D2] rounded-lg flex items-center justify-center flex-shrink-0">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-900">Monthly Star Approval</h1>
            <p className="text-xs text-gray-500">
              {allCommunitiesData?.month} {allCommunitiesData?.year} • Platform Rankings
            </p>
          </div>
        </div>
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <h2 className="text-sm font-bold text-gray-900 mb-3">
          Top 3 Performers This Month
        </h2>

        <div className="space-y-2">
          {allCommunitiesData?.topPerformers.map((performer, index) => (
            <motion.div
              key={performer.user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-gray-200 rounded-lg p-3 hover:border-[#5E96D2] hover:shadow-sm transition-all"
            >
              <div className="flex items-start gap-2">
                {/* Rank Badge */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                  index === 0 ? 'bg-gradient-to-br from-[#0158B7] to-[#5E96D2]' :
                  index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                  'bg-gradient-to-br from-orange-400 to-orange-500'
                }`}>
                  #{index + 1}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {performer.user.profile_picture_url ? (
                      <img
                        src={performer.user.profile_picture_url}
                        alt={performer.user.first_name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {performer.user.first_name[0]}{performer.user.last_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {performer.user.first_name} {performer.user.last_name}
                      </p>
                      <p className="text-xs text-gray-500 capitalize truncate">
                        {performer.user.account_type.toLowerCase()}
                      </p>
                    </div>
                  </div>

                  {/* Statistics Grid */}
                  <div className="grid grid-cols-4 gap-1.5 mb-2">
                    <div className="bg-blue-50 rounded p-1.5 border border-blue-100">
                      <div className="flex items-center gap-1 mb-0.5">
                        <BookOpen className="w-3 h-3 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">Proj</span>
                      </div>
                      <div className="text-base font-bold text-blue-900">
                        {performer.statistics.projects_count}
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded p-1.5 border border-purple-100">
                      <div className="flex items-center gap-1 mb-0.5">
                        <TrendingUp className="w-3 h-3 text-purple-600" />
                        <span className="text-xs text-purple-600 font-medium">Blog</span>
                      </div>
                      <div className="text-base font-bold text-purple-900">
                        {performer.statistics.blogs_count}
                      </div>
                    </div>

                    <div className="bg-green-50 rounded p-1.5 border border-green-100">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Calendar className="w-3 h-3 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">Event</span>
                      </div>
                      <div className="text-base font-bold text-green-900">
                        {performer.statistics.events_attended}
                      </div>
                    </div>

                    <div className="bg-orange-50 rounded p-1.5 border border-orange-100">
                      <div className="flex items-center gap-1 mb-0.5">
                        <Users className="w-3 h-3 text-orange-600" />
                        <span className="text-xs text-orange-600 font-medium">Follow</span>
                      </div>
                      <div className="text-base font-bold text-orange-900">
                        {performer.statistics.followers_count}
                      </div>
                    </div>
                  </div>

                  {/* Total Score */}
                  <div className="bg-gradient-to-r from-[#0158B7]/10 to-[#5E96D2]/10 rounded-lg p-2 flex items-center justify-between border border-[#0158B7]/20">
                    <span className="text-xs font-semibold text-gray-700">Total Score</span>
                    <span className="text-lg font-bold text-[#0158B7]">
                      {performer.statistics.total_score} pts
                    </span>
                  </div>
                </div>

                {/* Approve Button */}
                <button
                  onClick={() => {
                    setSelectedPerformer(performer);
                    setShowApprovalForm(true);
                  }}
                  className="flex-shrink-0 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md transition-all"
                >
                  Approve
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Approval Form Modal */}
      {showApprovalForm && selectedPerformer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-base font-bold text-gray-900">
                Approve Monthly Star
              </h2>
              <button
                onClick={() => setShowApprovalForm(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {/* Selected User */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="flex items-center gap-2">
                  {selectedPerformer.user.profile_picture_url ? (
                    <img
                      src={selectedPerformer.user.profile_picture_url}
                      alt={selectedPerformer.user.first_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center text-sm font-bold">
                      {selectedPerformer.user.first_name[0]}{selectedPerformer.user.last_name[0]}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-gray-900 text-sm">
                      {selectedPerformer.user.first_name} {selectedPerformer.user.last_name}
                    </p>
                    <p className="text-xs text-gray-600">
                      {selectedPerformer.statistics.total_score} points
                    </p>
                  </div>
                </div>
              </div>

              {/* Badge Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Badge Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center hover:border-[#0158B7] transition-colors">
                  {badgePreview ? (
                    <div className="space-y-2">
                      <img
                        src={badgePreview}
                        alt="Badge preview"
                        className="w-24 h-24 mx-auto rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setBadgeImage(null);
                          setBadgePreview("");
                        }}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer">
                      <ImageIcon className="w-10 h-10 mx-auto text-gray-400 mb-1.5" />
                      <p className="text-xs text-gray-600 mb-0.5">Click to upload badge</p>
                      <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        required
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Achievement Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe their outstanding contributions..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0158B7] focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              {/* Rewards */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Rewards (Optional)
                </label>
                <textarea
                  value={rewards}
                  onChange={(e) => setRewards(e.target.value)}
                  placeholder="Special rewards or recognition..."
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0158B7] focus:border-transparent"
                  rows={3}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowApprovalForm(false)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleApprove(e as any);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-[#0158B7] to-[#5E96D2] text-white py-2 rounded-lg font-semibold text-sm hover:shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve & Notify
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}