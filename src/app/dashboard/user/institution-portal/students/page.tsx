// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  GraduationCap,
  ShieldCheck,
  Loader2,
  Search,
  Users,
  CheckCircle,
  Plus,
  UserPlus,
  Trash2,
  Repeat,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchSupervisors,
  assignSupervisorToStudent,
  clearIndustrialMessages,
} from "@/lib/features/auth/industrialSupervisorSlice";
import {
  getPortalStudents,
  getPortalInstructors,
  removeStudentFromPortal,
  reassignStudentInstructor,
} from "@/lib/features/auth/institution-portal-slice";

export default function InstitutionStudentsPage() {
  const dispatch = useAppDispatch();
  const { supervisors, assigning, success, error } = useAppSelector(
    (s: any) => s.industrialSupervisor
  );
  const {
    portalStudents,
    portalInstructors,
    portalStudentsPagination,
    isLoading,
  } = useAppSelector((s: any) => s.institutionPortal);

  const [search, setSearch] = useState("");
  const [filterInstructor, setFilterInstructor] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [assignFor, setAssignFor] = useState<string | null>(null);
  const [reassignFor, setReassignFor] = useState<string | null>(null);
  const [pickedSupervisor, setPickedSupervisor] = useState<string>("");
  const [pickedInstructor, setPickedInstructor] = useState<string>("");
  const [page, setPage] = useState(1);

  const reload = () => {
    dispatch(
      getPortalStudents({
        page,
        limit: 20,
        search: search || undefined,
        instructor_id: filterInstructor || undefined,
        academic_year: filterYear || undefined,
      })
    );
  };

  useEffect(() => {
    reload();
    dispatch(getPortalInstructors({ page: 1, limit: 100 }));
    dispatch(fetchSupervisors());
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => reload(), 400);
    return () => clearTimeout(t);
  }, [search, filterInstructor, filterYear]);

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

  const activeSupervisors = supervisors.filter(
    (s: any) => s.invitation_status === "ACCEPTED"
  );

  const assign = async (studentId: string) => {
    if (!pickedSupervisor) {
      toast.error("Select a supervisor first");
      return;
    }
    const res: any = await dispatch(
      assignSupervisorToStudent({
        supervisor_id: pickedSupervisor,
        student_id: studentId,
      })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      setAssignFor(null);
      setPickedSupervisor("");
    }
  };

  const handleRemove = async (studentId: string) => {
    if (!confirm("Remove this student from your institution portal?")) return;
    const res: any = await dispatch(removeStudentFromPortal(studentId));
    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Student removed from portal");
      reload();
    } else {
      toast.error(res?.payload || "Failed to remove student");
    }
  };

  const handleReassign = async (studentId: string) => {
    if (!pickedInstructor) {
      toast.error("Select a new instructor first");
      return;
    }
    const res: any = await dispatch(
      reassignStudentInstructor({
        studentId,
        new_instructor_id: pickedInstructor,
      })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Student reassigned");
      setReassignFor(null);
      setPickedInstructor("");
      reload();
    } else {
      toast.error(res?.payload || "Failed to reassign");
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
            <GraduationCap className="w-6 h-6 text-[#0158B7]" /> Our Students
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Students registered in your institution portal, assigned to their instructors.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/user/institution-portal/members/add"
            className="inline-flex items-center gap-1 px-3 py-2 bg-[#0158B7] text-white text-xs font-medium rounded hover:bg-[#014a97]"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Student
          </Link>
          <Link
            href="/dashboard/user/institution-portal/instructors"
            className="inline-flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
          >
            <Plus className="w-3.5 h-3.5" /> Instructors
          </Link>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4 grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="flex items-center gap-2 border border-gray-200 rounded px-2">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="flex-1 text-sm border-0 focus:outline-none py-1.5"
          />
        </div>
        <select
          value={filterInstructor}
          onChange={(e) => setFilterInstructor(e.target.value)}
          className="text-sm border border-gray-200 rounded px-2 py-1.5"
        >
          <option value="">All instructors</option>
          {(portalInstructors || []).map((ins: any) => (
            <option key={ins.id} value={ins.id}>
              {ins.name || `${ins.first_name || ""} ${ins.last_name || ""}`}
            </option>
          ))}
        </select>
        <input
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          placeholder="Academic year (e.g. 2024-2025)"
          className="text-sm border border-gray-200 rounded px-2 py-1.5"
        />
      </div>

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 flex justify-center">
          <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
        </div>
      ) : (portalStudents || []).length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-10 text-center">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-600">No students in your portal yet.</p>
          <Link
            href="/dashboard/user/institution-portal/members/add"
            className="inline-flex items-center gap-1 mt-3 px-3 py-1.5 bg-[#0158B7] text-white text-xs rounded"
          >
            <UserPlus className="w-3.5 h-3.5" /> Add your first student
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y">
          {(portalStudents || []).map((row: any) => {
            const st = row.student || {};
            const ins = row.instructor || {};
            const isAssigning = assignFor === st.id;
            const isReassigning = reassignFor === st.id;
            return (
              <div key={row.link_id || st.id} className="p-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#0158B7] text-white flex items-center justify-center text-sm font-bold">
                      {(st.first_name?.[0] || "") + (st.last_name?.[0] || "")}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {st.first_name} {st.last_name}
                      </div>
                      <div className="text-[11px] text-gray-500">{st.email}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Instructor: <span className="font-medium">{ins.first_name} {ins.last_name}</span>
                        {row.academic_year ? ` • ${row.academic_year}` : ""}
                        {row.semester ? ` • ${row.semester}` : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setReassignFor(isReassigning ? null : st.id);
                        setPickedInstructor("");
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <Repeat className="w-3 h-3" /> {isReassigning ? "Cancel" : "Reassign"}
                    </button>
                    <button
                      onClick={() => {
                        setAssignFor(isAssigning ? null : st.id);
                        setPickedSupervisor("");
                      }}
                      className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 inline-flex items-center gap-1"
                    >
                      <ShieldCheck className="w-3 h-3" /> {isAssigning ? "Cancel" : "Supervisor"}
                    </button>
                    <button
                      onClick={() => handleRemove(st.id)}
                      className="px-2 py-1 text-xs border border-red-200 text-red-600 rounded hover:bg-red-50 inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Remove
                    </button>
                  </div>
                </div>

                {isReassigning && (
                  <div className="mt-3 p-3 bg-gray-50 rounded flex items-center gap-2 flex-wrap">
                    <select
                      value={pickedInstructor}
                      onChange={(e) => setPickedInstructor(e.target.value)}
                      className="flex-1 min-w-[200px] border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">— Select new instructor —</option>
                      {(portalInstructors || []).map((i: any) => (
                        <option key={i.id} value={i.id}>
                          {i.name || `${i.first_name || ""} ${i.last_name || ""}`}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleReassign(st.id)}
                      disabled={!pickedInstructor}
                      className="px-3 py-1 bg-[#0158B7] text-white rounded text-xs disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" /> Confirm
                    </button>
                  </div>
                )}

                {isAssigning && (
                  <div className="mt-3 p-3 bg-gray-50 rounded flex items-center gap-2 flex-wrap">
                    <select
                      value={pickedSupervisor}
                      onChange={(e) => setPickedSupervisor(e.target.value)}
                      className="flex-1 min-w-[200px] border border-gray-300 rounded px-2 py-1 text-xs"
                    >
                      <option value="">— Select supervisor —</option>
                      {activeSupervisors.length === 0 && (
                        <option disabled>No active supervisors</option>
                      )}
                      {activeSupervisors.map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.user?.first_name} {s.user?.last_name}
                          {s.expertise_area ? ` — ${s.expertise_area}` : ""}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => assign(st.id)}
                      disabled={!pickedSupervisor || assigning}
                      className="px-3 py-1 bg-[#0158B7] text-white rounded text-xs disabled:opacity-50 inline-flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      {assigning ? "Assigning..." : "Confirm"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {portalStudentsPagination?.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <button
            disabled={page <= 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-3 py-1 text-xs border border-gray-300 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-600">
            Page {portalStudentsPagination.page} of {portalStudentsPagination.totalPages}
          </span>
          <button
            disabled={page >= portalStudentsPagination.totalPages}
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
