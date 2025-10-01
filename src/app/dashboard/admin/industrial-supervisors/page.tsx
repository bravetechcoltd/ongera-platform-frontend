// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Search,
  Loader2,
  Building2,
  Mail,
  Trash2,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

const STATUS_PILL: Record<string, { label: string; cls: string; Icon: any }> = {
  PENDING: { label: "Pending", cls: "bg-amber-100 text-amber-700", Icon: Clock },
  ACCEPTED: {
    label: "Active",
    cls: "bg-green-100 text-green-700",
    Icon: CheckCircle,
  },
  DECLINED: { label: "Declined", cls: "bg-gray-100 text-gray-700", Icon: X },
  REVOKED: { label: "Revoked", cls: "bg-red-100 text-red-700", Icon: X },
};

export default function AdminIndustrialSupervisorsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/institution-research/supervisors");
      setList(res.data?.data || []);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to load supervisors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const revoke = async (id: string) => {
    if (!confirm("Revoke this supervisor's access?")) return;
    try {
      await api.delete(`/admin/institution-research/supervisors/${id}`);
      toast.success("Supervisor revoked");
      load();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Revoke failed");
    }
  };

  const filtered = list.filter((s: any) => {
    if (statusFilter && s.invitation_status !== statusFilter) return false;
    if (!search) return true;
    const t = search.toLowerCase();
    return (
      `${s.user?.first_name} ${s.user?.last_name}`
        .toLowerCase()
        .includes(t) ||
      (s.user?.email || "").toLowerCase().includes(t) ||
      (s.institution?.first_name || "").toLowerCase().includes(t) ||
      (s.organization || "").toLowerCase().includes(t)
    );
  });

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-[#0158B7]" /> Industrial Supervisors
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          All industry experts invited by institutions to review student
          research projects (Stage 2 reviewers).
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, organization or institution..."
              className="w-full border border-gray-300 rounded pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="DECLINED">Declined</option>
            <option value="REVOKED">Revoked</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No supervisors found.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Supervisor
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Institution
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Organization / Expertise
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-3 text-right text-xs font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((s: any) => {
                const pill =
                  STATUS_PILL[s.invitation_status] || STATUS_PILL.PENDING;
                const I = pill.Icon;
                return (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                          {(s.user?.first_name?.[0] || "") +
                            (s.user?.last_name?.[0] || "")}
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900">
                            {s.user?.first_name} {s.user?.last_name}
                          </div>
                          <div className="text-[10px] text-gray-500 inline-flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {s.user?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-700">
                      <div className="inline-flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-gray-500" />
                        {s.institution?.first_name ||
                          s.institution?.profile?.institution_name ||
                          "—"}
                      </div>
                    </td>
                    <td className="p-3 text-xs text-gray-700">
                      {s.organization && <div>{s.organization}</div>}
                      {s.expertise_area && (
                        <div className="text-[10px] text-gray-500">
                          {s.expertise_area}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${pill.cls}`}
                      >
                        <I className="w-3 h-3" /> {pill.label}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {s.invitation_status !== "REVOKED" && (
                        <button
                          onClick={() => revoke(s.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
