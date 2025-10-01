// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  BookOpen,
  Loader2,
  Search,
  Users,
  UserPlus,
  Trash2,
  Eye,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  getPortalInstructors,
  removeInstructorFromPortal,
} from "@/lib/features/auth/institution-portal-slice";

export default function InstitutionInstructorsPage() {
  const dispatch = useAppDispatch();
  const {
    portalInstructors,
    portalInstructorsPagination,
    isLoading,
  } = useAppSelector((s: any) => s.institutionPortal);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const reload = () => {
    dispatch(
      getPortalInstructors({
        page,
        limit: 20,
        search: search || undefined,
      })
    );
  };

  useEffect(() => {
    reload();
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => reload(), 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleRemove = async (instructorId: string) => {
    if (!confirm("Remove this instructor from your institution portal?")) return;
    const res: any = await dispatch(removeInstructorFromPortal(instructorId));
    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Instructor removed from portal");
      reload();
    } else {
      toast.error(res?.payload || "Failed to remove instructor");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <Link
        href="/dashboard/user/institution-portal"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#0158B7] mb-3"
      >
        <ArrowLeft className="w-3 h-3" /> Back to portal
      </Link>

      <div className="mb-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#0158B7]" /> Our Instructors
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Researchers registered as instructors in your institution portal.
          </p>
        </div>
        <div>
          <Link
            href="/dashboard/user/institution-portal/members/add"
            className="inline-flex items-center gap-1 px-3 py-2 bg-[#0158B7] text-white text-xs font-medium rounded hover:bg-[#014a97]"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Instructor
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 text-sm border-0 focus:outline-none"
        />
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
        </div>
      ) : (portalInstructors || []).length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No instructors in your portal yet.</p>
          <Link
            href="/dashboard/user/institution-portal/members/add"
            className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-[#0158B7] text-white text-xs rounded"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add your first instructor
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y">
          {(portalInstructors || []).map((ins: any) => (
            <div key={ins.id} className="p-3 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0158B7] text-white flex items-center justify-center text-sm font-bold">
                  {(ins.first_name?.[0] || "") + (ins.last_name?.[0] || "")}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {ins.name || `${ins.first_name || ""} ${ins.last_name || ""}`}
                  </div>
                  <div className="text-[11px] text-gray-500">{ins.email}</div>
                  <div className="text-[11px] text-gray-500">
                    {ins.department ? `${ins.department} • ` : ""}
                    <span className="font-medium">{ins.student_count || 0}</span> students
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/user/institution-portal/students?instructor_id=${ins.id}`}
                  className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center gap-1"
                >
                  <Eye className="w-3 h-3" /> View Students
                </Link>
                <button
                  onClick={() => handleRemove(ins.id)}
                  className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {portalInstructorsPagination?.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {portalInstructorsPagination.page} of {portalInstructorsPagination.totalPages}
          </span>
          <button
            disabled={page >= portalInstructorsPagination.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
