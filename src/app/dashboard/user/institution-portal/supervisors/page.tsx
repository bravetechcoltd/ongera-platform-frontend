// @ts-nocheck
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Search,
  Plus,
  ShieldCheck,
  X,
  Loader2,
  Mail,
  Building2,
  Trash2,
  CheckCircle,
  Clock,
  UserX,
  RefreshCw,
  UserCheck,
  Calendar,
  Hash,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchSupervisors,
  inviteSupervisor,
  revokeSupervisor,
  clearIndustrialMessages,
} from "@/lib/features/auth/industrialSupervisorSlice";
import { getAllUsers } from "@/lib/features/auth/auth-slice";
import { motion, AnimatePresence } from "framer-motion";

export default function SupervisorManagementPage() {
  const dispatch = useAppDispatch();
  const { supervisors, loading, inviting, revoking, success, error, assigning } = useAppSelector(
    (s: any) => s.industrialSupervisor
  );

  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [expertise, setExpertise] = useState("");
  const [organization, setOrganization] = useState("");
  const [detailsOpen, setDetailsOpen] = useState<string | null>(null);
  const { users: allUsers, searchLoading } = useAppSelector((s: any) => s.auth);

  // ✅ Fetch supervisors on mount
  useEffect(() => {
    dispatch(fetchSupervisors());
  }, [dispatch]);

  // Fetch users when search input changes
  useEffect(() => {
    if (inviteOpen && search.trim().length >= 2) {
      const t = setTimeout(() => {
        dispatch(getAllUsers({ search, limit: 10 }));
      }, 300);
      return () => clearTimeout(t);
    }
  }, [search, inviteOpen, dispatch]);

  // Handle success/error toasts
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearIndustrialMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearIndustrialMessages());
    }
  }, [success, error, dispatch]);

  const sendInvite = async () => {
    if (!selectedUser) {
      toast.error("Select a user first");
      return;
    }
    const res: any = await dispatch(
      inviteSupervisor({
        user_id: selectedUser.id,
        expertise_area: expertise || undefined,
        organization: organization || undefined,
      })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      setInviteOpen(false);
      setSelectedUser(null);
      setExpertise("");
      setOrganization("");
      setSearch("");
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Revoke this supervisor's access? They will no longer be able to review projects."))
      return;
    await dispatch(revokeSupervisor(id));
  };

  const handleRefresh = () => {
    dispatch(fetchSupervisors());
    toast.success("Supervisor list refreshed");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "from-emerald-500 to-green-600";
      case "PENDING": return "from-amber-500 to-yellow-600";
      case "DECLINED": return "from-gray-400 to-gray-500";
      case "REVOKED": return "from-red-500 to-rose-600";
      default: return "from-gray-400 to-gray-500";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "ACCEPTED": return "bg-emerald-50 border-emerald-200";
      case "PENDING": return "bg-amber-50 border-amber-200";
      case "DECLINED": return "bg-gray-50 border-gray-200";
      case "REVOKED": return "bg-red-50 border-red-200";
      default: return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Breadcrumb & Header */}
      <div className="mb-6">
        <Link
          href="/dashboard/user/institution-portal"
          className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#0158B7] mb-3 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back to Institution Portal
        </Link>
        
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-[#0158B7]" /> 
              Industrial Supervisors
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Manage industry experts who review student research projects at Stage 2
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 px-3 py-2 text-xs border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
            <button
              onClick={() => setInviteOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all"
            >
              <Plus className="w-4 h-4" /> Invite Supervisor
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      {!loading && supervisors.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { 
              label: "Total", 
              value: supervisors.length, 
              icon: ShieldCheck, 
              color: "text-blue-600 bg-blue-50" 
            },
            { 
              label: "Active", 
              value: supervisors.filter((s: any) => s.invitation_status === "ACCEPTED").length, 
              icon: CheckCircle, 
              color: "text-emerald-600 bg-emerald-50" 
            },
            { 
              label: "Pending", 
              value: supervisors.filter((s: any) => s.invitation_status === "PENDING").length, 
              icon: Clock, 
              color: "text-amber-600 bg-amber-50" 
            },
            { 
              label: "Revoked", 
              value: supervisors.filter((s: any) => s.invitation_status === "REVOKED").length, 
              icon: UserX, 
              color: "text-red-600 bg-red-50" 
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.label}</div>
                  </div>
                  <div className={`w-8 h-8 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin mb-3" />
          <p className="text-sm text-gray-500">Loading supervisors...</p>
        </div>
      ) : supervisors.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-xl p-16 text-center"
        >
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-[#0158B7]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Industrial Supervisors Yet</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Invite industry experts to review your students' research projects at Stage 2 of the review pipeline.
          </p>
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0158B7] text-white text-sm font-medium rounded-lg hover:bg-[#014a97] transition-colors"
          >
            <Plus className="w-4 h-4" /> Invite Your First Supervisor
          </button>
        </motion.div>
      ) : (
        /* Supervisors Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence>
            {supervisors.map((s: any, index: number) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={`bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 ${getStatusBg(s.invitation_status)}`}
              >
                {/* Card Header */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${getStatusColor(s.invitation_status)} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg`}>
                        {(s.user?.first_name?.[0] || "") +
                          (s.user?.last_name?.[0] || "")}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-gray-900 truncate">
                          {s.user?.first_name} {s.user?.last_name}
                        </div>
                        <div className="text-[11px] text-gray-500 truncate inline-flex items-center gap-1">
                          <Mail className="w-3 h-3 flex-shrink-0" /> {s.user?.email}
                        </div>
                        {s.user?.profile?.title && (
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {s.user.profile.title}
                          </div>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={s.invitation_status} />
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-1.5">
                    {s.organization && (
                      <div className="inline-flex items-center gap-1.5 text-xs text-gray-700 bg-gray-100 rounded-full px-2.5 py-1">
                        <Building2 className="w-3 h-3 text-gray-500" />
                        {s.organization}
                      </div>
                    )}
                    {s.expertise_area && (
                      <div className="text-xs text-gray-700">
                        <span className="text-gray-500 font-medium">Expertise:</span>{" "}
                        <span className="text-gray-800">{s.expertise_area}</span>
                      </div>
                    )}
                    
                    {/* Timestamps */}
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-gray-100">
                      <div className="text-[10px] text-gray-400">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        Invited: {new Date(s.created_at).toLocaleDateString()}
                      </div>
                      {s.accepted_at && (
                        <div className="text-[10px] text-emerald-600">
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Accepted: {new Date(s.accepted_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {/* Invitation Expiry */}
                    {s.invitation_status === "PENDING" && s.invitation_expires_at && (
                      <div className={`text-[10px] mt-1 ${new Date(s.invitation_expires_at) < new Date() ? 'text-red-600 font-semibold' : 'text-amber-600'}`}>
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(s.invitation_expires_at) < new Date() 
                          ? 'Expired' 
                          : `Expires: ${new Date(s.invitation_expires_at).toLocaleDateString()}`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Hash className="w-3 h-3" />
                    {s.id.substring(0, 8)}...
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {s.invitation_status === "PENDING" && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium">
                        Awaiting Response
                      </span>
                    )}
                    <button
                      onClick={() => handleRevoke(s.id)}
                      disabled={revoking}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Revoke supervisor access"
                    >
                      {revoking ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Trash2 className="w-3 h-3" />
                      )}
                      Revoke
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Invite Modal */}
      <AnimatePresence>
        {inviteOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setInviteOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 inline-flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#0158B7]" /> 
                    Invite Industrial Supervisor
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Invite an industry expert for Stage 2 project review
                  </p>
                </div>
                <button
                  onClick={() => setInviteOpen(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-5 space-y-4">
                {/* Info Banner */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#0158B7] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900 mb-0.5">
                        Supervisor Requirements
                      </p>
                      <p className="text-xs text-blue-700">
                        The user must have a Researcher, Diaspora, or Institution account on the platform.
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Selection */}
                {selectedUser ? (
                  <div className="p-4 border-2 border-[#0158B7]/30 bg-gradient-to-r from-[#0158B7]/5 to-blue-50/50 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0158B7] to-[#0362C3] text-white flex items-center justify-center text-sm font-bold shadow-lg">
                          {(selectedUser.first_name?.[0] || "") +
                            (selectedUser.last_name?.[0] || "")}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {selectedUser.first_name} {selectedUser.last_name}
                          </div>
                          <div className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {selectedUser.email}
                          </div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            Account Type: {selectedUser.account_type}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedUser(null)}
                        className="text-xs text-red-600 hover:text-red-700 hover:underline font-medium"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                      Search User by Name or Email
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Type at least 2 characters..."
                        className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0158B7]/20 focus:border-[#0158B7] transition-all"
                        autoFocus
                      />
                    </div>
                    
                    {/* Search Results */}
                    {search.length >= 2 && (
                      <div className="mt-2 max-h-56 overflow-y-auto border border-gray-200 rounded-xl divide-y divide-gray-100">
                        {searchLoading ? (
                          <div className="p-6 flex justify-center">
                            <Loader2 className="w-5 h-5 text-[#0158B7] animate-spin" />
                          </div>
                        ) : allUsers && allUsers.length > 0 ? (
                          allUsers.map((u: any) => (
                            <button
                              key={u.id}
                              onClick={() => setSelectedUser(u)}
                              className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                            >
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gray-400 to-gray-500 text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                                {(u.first_name?.[0] || "") + (u.last_name?.[0] || "")}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  {u.first_name} {u.last_name}
                                </div>
                                <div className="text-[11px] text-gray-500 truncate">
                                  {u.email}
                                </div>
                                <div className="text-[10px] text-gray-400 mt-0.5 capitalize">
                                  {u.account_type?.toLowerCase()}
                                </div>
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-500">
                            No users found matching "{search}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Expertise Area */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Expertise Area
                  </label>
                  <input
                    value={expertise}
                    onChange={(e) => setExpertise(e.target.value)}
                    placeholder="e.g. Machine Learning, Biotechnology, Data Science"
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0158B7]/20 focus:border-[#0158B7] transition-all"
                  />
                </div>

                {/* Organization */}
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
                    Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="Company or institution name"
                      className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#0158B7]/20 focus:border-[#0158B7] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-5 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
                <button
                  onClick={() => setInviteOpen(false)}
                  className="px-4 py-2.5 text-sm border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={sendInvite}
                  disabled={!selectedUser || inviting}
                  className="px-5 py-2.5 text-sm bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 font-medium"
                >
                  {inviting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending Invitation...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Send Invitation
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; colors: string; Icon: any }> = {
    PENDING: {
      label: "Pending",
      colors: "bg-amber-100 text-amber-700 border-amber-300",
      Icon: Clock,
    },
    ACCEPTED: {
      label: "Active",
      colors: "bg-emerald-100 text-emerald-700 border-emerald-300",
      Icon: CheckCircle,
    },
    DECLINED: { 
      label: "Declined", 
      colors: "bg-gray-100 text-gray-700 border-gray-300", 
      Icon: X 
    },
    REVOKED: { 
      label: "Revoked", 
      colors: "bg-red-100 text-red-700 border-red-300", 
      Icon: UserX 
    },
  };
  
  const { label, colors, Icon } = config[status] || config.PENDING;
  
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${colors}`}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}