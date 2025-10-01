// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchInstitutionProjects } from "@/lib/features/auth/institutionResearchSlice";
import InstitutionProjectCard from "@/components/institution/InstitutionProjectCard";
import { Plus, Search, Filter, Loader2, FileText } from "lucide-react";

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_SUPERVISOR_REVIEW", label: "Under Supervisor Review" },
  { value: "UNDER_INSTRUCTOR_REVIEW", label: "Under Instructor Review" },
  { value: "REWORK_REQUESTED", label: "Rework Requested" },
  { value: "APPROVED", label: "Approved" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
];

const TYPES = [
  { value: "", label: "All types" },
  { value: "BACHELORS", label: "Bachelor's Research" },
  { value: "MASTERS_THESIS", label: "Master's Thesis" },
  { value: "DISSERTATION", label: "PhD Dissertation" },
  { value: "FUNDS", label: "Funds Research" },
];

export default function InstitutionProjectsListPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const { projects, loading, pagination } = useAppSelector(
    (s: any) => s.institutionResearch
  );

  const [status, setStatus] = useState(searchParams.get("status") || "");
  const [projectType, setProjectType] = useState(searchParams.get("type") || "");
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params: any = { page, limit: 20 };
    if (status) params.status = status;
    if (projectType) params.project_type = projectType;
    if (q) params.search = q;
    dispatch(fetchInstitutionProjects(params));
  }, [dispatch, status, projectType, q, page]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Research Projects</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage all research projects in your institution pipeline.
          </p>
        </div>
        <Link
          href="/dashboard/user/institution-portal/projects/create"
          className="inline-flex items-center gap-1 px-4 py-2 bg-[#0158B7] text-white text-sm font-medium rounded hover:bg-[#014a97]"
        >
          <Plus className="w-4 h-4" /> New Project
        </Link>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by title or keyword..."
              className="w-full border border-gray-300 rounded pl-8 pr-3 py-1.5 text-xs"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1.5 text-xs"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
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
          <p className="text-sm text-gray-600">No projects match your filters.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p: any) => (
            <InstitutionProjectCard key={p.id} project={p} />
          ))}
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
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
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
