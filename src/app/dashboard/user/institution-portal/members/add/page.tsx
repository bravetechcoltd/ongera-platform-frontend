// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { ArrowLeft, UserPlus, GraduationCap, BookOpen, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addStudentToPortal,
  addInstructorToPortal,
  getPortalInstructors,
} from "@/lib/features/auth/institution-portal-slice";

export default function AddInstitutionMemberPage() {
  const dispatch = useAppDispatch();
  const { portalInstructors, isSubmitting, error } = useAppSelector(
    (s: any) => s.institutionPortal
  );

  const [activeTab, setActiveTab] = useState<"student" | "instructor">("student");

  const [studentEmail, setStudentEmail] = useState("");
  const [instructorId, setInstructorId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState("");

  const [instructorEmail, setInstructorEmail] = useState("");

  const [studentErrorDetail, setStudentErrorDetail] = useState<string | null>(null);
  const [instructorErrorDetail, setInstructorErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getPortalInstructors({ page: 1, limit: 200 }));
  }, [dispatch]);

  const handleAddStudent = async (e: any) => {
    e.preventDefault();
    setStudentErrorDetail(null);
    if (!studentEmail || !instructorId || !academicYear || !semester) {
      toast.error("All fields are required");
      return;
    }
    const res: any = await dispatch(
      addStudentToPortal({
        student_email: studentEmail,
        instructor_id: instructorId,
        academic_year: academicYear,
        semester,
      })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Student added to institution portal");
      setStudentEmail("");
      setAcademicYear("");
      setSemester("");
    } else {
      const msg = (res?.payload as string) || "Failed to add student";
      if (/no bwenge user/i.test(msg)) {
        setStudentErrorDetail(
          "This person is not yet registered on Bwenge. Ask them to sign up as a Student first, then you can add them here."
        );
      }
      toast.error(msg);
    }
  };

  const handleAddInstructor = async (e: any) => {
    e.preventDefault();
    setInstructorErrorDetail(null);
    if (!instructorEmail) {
      toast.error("Instructor email is required");
      return;
    }
    const res: any = await dispatch(
      addInstructorToPortal({ instructor_email: instructorEmail })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      toast.success("Instructor added to institution portal");
      setInstructorEmail("");
      dispatch(getPortalInstructors({ page: 1, limit: 200 }));
    } else {
      const msg = (res?.payload as string) || "Failed to add instructor";
      if (/no researcher/i.test(msg)) {
        setInstructorErrorDetail(
          "No Researcher account exists with that email. They must sign up on Bwenge as a Researcher first."
        );
      } else if (/only researcher/i.test(msg)) {
        setInstructorErrorDetail(
          "That Bwenge account is not a Researcher. Only Researcher accounts can be added as instructors."
        );
      }
      toast.error(msg);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <Link
        href="/dashboard/user/institution-portal"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#0158B7] mb-3"
      >
        <ArrowLeft className="w-3 h-3" /> Back to portal
      </Link>

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
          <UserPlus className="w-6 h-6 text-[#0158B7]" /> Add Portal Member
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Add an existing Bwenge user to your institution portal. They must already be registered on Bwenge.
        </p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("student")}
            className={`flex-1 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 ${
              activeTab === "student"
                ? "bg-[#0158B7] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Add Student
          </button>
          <button
            onClick={() => setActiveTab("instructor")}
            className={`flex-1 px-4 py-3 text-sm font-medium inline-flex items-center justify-center gap-2 ${
              activeTab === "instructor"
                ? "bg-[#0158B7] text-white"
                : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-4 h-4" /> Add Instructor
          </button>
        </div>

        <div className="p-5">
          {activeTab === "student" ? (
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Student Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0158B7] focus:outline-none"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Must be an existing Bwenge Student account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Assign to Instructor <span className="text-red-500">*</span>
                </label>
                <select
                  value={instructorId}
                  onChange={(e) => setInstructorId(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0158B7] focus:outline-none"
                  required
                >
                  <option value="">— Select an instructor —</option>
                  {(portalInstructors || []).map((ins: any) => (
                    <option key={ins.id} value={ins.id}>
                      {ins.name || `${ins.first_name || ""} ${ins.last_name || ""}`} ({ins.email})
                    </option>
                  ))}
                </select>
                {(portalInstructors || []).length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    No instructors yet. Add an instructor first.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="2024-2025"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0158B7] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Semester <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0158B7] focus:outline-none"
                    required
                  >
                    <option value="">Select</option>
                    <option value="FIRST">First</option>
                    <option value="SECOND">Second</option>
                    <option value="THIRD">Third</option>
                  </select>
                </div>
              </div>

              {studentErrorDetail && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  {studentErrorDetail}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-[#0158B7] text-white text-sm font-medium rounded hover:bg-[#014a97] disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Student to Portal
              </button>
            </form>
          ) : (
            <form onSubmit={handleAddInstructor} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Instructor Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={instructorEmail}
                  onChange={(e) => setInstructorEmail(e.target.value)}
                  placeholder="researcher@example.com"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:border-[#0158B7] focus:outline-none"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-1">
                  Must be an existing Bwenge Researcher account.
                </p>
              </div>

              {instructorErrorDetail && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  {instructorErrorDetail}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-[#0158B7] text-white text-sm font-medium rounded hover:bg-[#014a97] disabled:opacity-50 inline-flex items-center justify-center gap-2"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Add Instructor to Portal
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
