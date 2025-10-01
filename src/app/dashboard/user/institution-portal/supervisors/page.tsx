
"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchSupervisors,
  inviteSupervisor,
  revokeSupervisor,
  clearIndustrialMessages,
} from "@/lib/features/auth/industrialSupervisorSlice";
import { getAllUsers } from "@/lib/features/auth/auth-slice";

export default function SupervisorManagementPage() {
  const dispatch = useAppDispatch();
  const { supervisors, loading, inviting, success, error } = useAppSelector(
    (s: any) => s.industrialSupervisor
  );

  const [inviteOpen, setInviteOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [expertise, setExpertise] = useState("");
  const [organization, setOrganization] = useState("");
  const { users: allUsers } = useAppSelector((s: any) => s.auth);

  useEffect(() => {
    dispatch(fetchSupervisors());
  }, [dispatch]);

  useEffect(() => {
    if (inviteOpen && search.trim().length >= 2) {
      const t = setTimeout(() => {
        dispatch(getAllUsers({ search, limit: 10 }));
      }, 300);
      return () => clearTimeout(t);
    }
  }, [search, inviteOpen, dispatch]);

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

  const handleRevoke = (id: string) => {
    if (!confirm("Revoke this supervisor's access? They can no longer review."))
      return;
    dispatch(revokeSupervisor(id));
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Link
        href="/dashboard/user/institution-portal"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#0158B7] mb-3"
      >
        <ArrowLeft className="w-3 h-3" /> Back to portal
      </Link>

      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#0158B7]" /> Industrial Supervisors
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Invite and manage industry experts who perform Stage 2 review on
            student research projects.
          </p>
        </div>
        <button
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-1 px-4 py-2 bg-[#0158B7] text-white text-sm font-medium rounded hover:bg-[#014a97]"
        >
          <Plus className="w-4 h-4" /> Invite Supervisor
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
        </div>
      ) : supervisors.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600 mb-3">
            No industrial supervisors yet.
          </p>
          <button
            onClick={() => setInviteOpen(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0158B7] text-white text-xs rounded"
          >
            <Plus className="w-3 h-3" /> Invite your first supervisor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {supervisors.map((s: any) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {(s.user?.first_name?.[0] || "") +
                      (s.user?.last_name?.[0] || "")}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {s.user?.first_name} {s.user?.last_name}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate inline-flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {s.user?.email}
                    </div>
                  </div>
                </div>
                <StatusPill status={s.invitation_status} />
              </div>
              <div className="mt-3 space-y-1 text-xs text-gray-700">
                {s.organization && (
                  <div className="inline-flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-gray-500" /> {s.organization}
                  </div>
                )}
                {s.expertise_area && (
                  <div>
                    <span className="text-gray-500">Expertise:</span>{" "}
                    {s.expertise_area}
                  </div>
                )}
                {s.accepted_at && (
                  <div className="text-[10px] text-gray-400">
                    Accepted {new Date(s.accepted_at).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => handleRevoke(s.id)}
                  className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" /> Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {inviteOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
              <h3 className="text-base font-semibold inline-flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0158B7]" /> Invite Industrial
                Supervisor
              </h3>
              <button
                onClick={() => setInviteOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
                The supervisor must already have an account on the platform
                (Researcher, Diaspora or Institution). Search by name or email
                below.
              </p>

              {selectedUser ? (
                <div className="p-3 border border-[#0158B7]/30 bg-[#0158B7]/5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0158B7] text-white flex items-center justify-center text-xs font-bold">
                      {(selectedUser.first_name?.[0] || "") +
                        (selectedUser.last_name?.[0] || "")}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        {selectedUser.first_name} {selectedUser.last_name}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {selectedUser.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedUser(null)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-medium text-gray-700 mb-1 block inline-flex items-center gap-1">
                    <Search className="w-3 h-3" /> Search user (name or email)
                  </label>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Type at least 2 characters..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                  {allUsers && allUsers.length > 0 && search.length >= 2 && (
                    <div className="mt-2 max-h-56 overflow-y-auto border border-gray-200 rounded">
                      {allUsers.map((u: any) => (
                        <button
                          key={u.id}
                          onClick={() => setSelectedUser(u)}
                          className="w-full text-left p-2 hover:bg-gray-50 flex items-center gap-2 border-b last:border-b-0"
                        >
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">
                            {(u.first_name?.[0] || "") + (u.last_name?.[0] || "")}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-gray-900 truncate">
                              {u.first_name} {u.last_name}
                            </div>
                            <div className="text-[10px] text-gray-500 truncate">
                              {u.email} · {u.account_type}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Expertise area
                </label>
                <input
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  placeholder="e.g. Machine Learning, Biotechnology"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Organization
                </label>
                <input
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="Company name"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
              <button
                onClick={() => setInviteOpen(false)}
                className="px-3 py-1.5 text-xs border border-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={sendInvite}
                disabled={!selectedUser || inviting}
                className="px-4 py-1.5 text-xs bg-[#0158B7] text-white rounded disabled:opacity-50"
              >
                {inviting ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: any }> = {
    PENDING: {
      label: "Pending",
      cls: "bg-amber-100 text-amber-700",
      Icon: Clock,
    },
    ACCEPTED: {
      label: "Active",
      cls: "bg-green-100 text-green-700",
      Icon: CheckCircle,
    },
    DECLINED: { label: "Declined", cls: "bg-gray-100 text-gray-700", Icon: X },
    REVOKED: { label: "Revoked", cls: "bg-red-100 text-red-700", Icon: X },
  };
  const m = map[status] || map.PENDING;
  const I = m.Icon;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${m.cls}`}
    >
      <I className="w-3 h-3" /> {m.label}
    </span>
  );
}
