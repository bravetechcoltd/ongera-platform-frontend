// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  FileText,
  Search,
  Loader2,
  Building2,
  Globe,
  Users,
  Filter,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/api";

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_SUPERVISOR_REVIEW", label: "Supervisor Review" },
  { value: "UNDER_INSTRUCTOR_REVIEW", label: "Instructor Review" },
  { value: "REWORK_REQUESTED", label: "Rework Requested" },
  { value: "APPROVED", label: "Approved" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
];

const TYPES = [
  { value: "", label: "All types" },
  { value: "BACHELORS", label: "Bachelor's" },
  { value: "MASTERS_THESIS", label: "Master's" },
  { value: "DISSERTATION", label: "PhD" },
  { value: "FUNDS", label: "Funds" },
];

const STATUS_COLOR: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  SUBMITTED: "bg-blue-100 text-blue-700",
  UNDER_SUPERVISOR_REVIEW: "bg-amber-100 text-amber-700",
  UNDER_INSTRUCTOR_REVIEW: "bg-violet-100 text-violet-700",
  REWORK_REQUESTED: "bg-orange-100 text-orange-700",
  APPROVED: "bg-teal-100 text-teal-700",
  PUBLISHED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminInstitutionProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (status) params.status = status;
      if (type) params.project_type = type;
      if (q) params.search = q;
      const res = await api.get("/admin/institution-research/projects", {
        params,
      });
      const data = res.data?.data || {};
      setProjects(data.projects || []);
      setPagination(data.pagination || null);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page, status, type, q]);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-[#0158B7]" /> Institution
          Research Projects
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Platform-wide view of every institution-managed research project
          across all stages.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Search by title, institution..."
              className="w-full border border-gray-300 rounded pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs"
          >
            {TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No projects match the filter.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Project
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Institution
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Type
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Status
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Visibility
                </th>
                <th className="p-3 text-left text-xs font-semibold text-gray-600">
                  Rework
                </th>
                <th className="p-3 text-right text-xs font-semibold text-gray-600">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="p-3">
                    <Link
                      href={`/dashboard/admin/institution-projects/${p.id}`}
                      className="block"
                    >
                      <div className="text-xs font-semibold text-[#0158B7] line-clamp-1">
                        {p.title}
                      </div>
                      <div className="text-[10px] text-gray-500 line-clamp-1">
                        {(p.students || [])
                          .map(
                            (s: any) => `${s.first_name} ${s.last_name}`
                          )
                          .join(", ")}
                      </div>
                    </Link>
                  </td>
                  <td className="p-3 text-xs text-gray-700">
                    <div className="inline-flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-gray-500" />
                      {p.institution?.first_name ||
                        p.institution?.profile?.institution_name ||
                        "—"}
                    </div>
                  </td>
                  <td className="p-3 text-xs text-gray-700">
                    {p.project_type?.replace(/_/g, " ")}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        STATUS_COLOR[p.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="p-3 text-[10px] text-gray-700">
                    {p.visibility_after_publish ? (
                      <span className="inline-flex items-center gap-1">
                        {p.visibility_after_publish === "PUBLIC" ? (
                          <>
                            <Globe className="w-3 h-3" /> Public
                          </>
                        ) : (
                          <>
                            <Building2 className="w-3 h-3" /> Institution
                          </>
                        )}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="p-3 text-xs text-gray-700">
                    {p.rework_count > 0 ? `×${p.rework_count}` : "—"}
                  </td>
                  <td className="p-3 text-right text-[10px] text-gray-500">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={page >= pagination.totalPages}
            className="px-3 py-1 border border-gray-300 rounded text-xs disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
