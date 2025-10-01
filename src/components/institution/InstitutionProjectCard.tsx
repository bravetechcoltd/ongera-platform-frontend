"use client";

import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  ScrollText,
  Banknote,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { InstitutionResearchProject } from "@/lib/features/auth/institutionResearchSlice";
import { RichContentPreview, stripHtml } from "@/components/institution/RichContent";

const TYPE_META: Record<string, { label: string; Icon: any; color: string }> = {
  BACHELORS: {
    label: "Bachelor's Research",
    Icon: GraduationCap,
    color: "bg-sky-50 text-sky-700 border-sky-200",
  },
  MASTERS_THESIS: {
    label: "Master's Thesis",
    Icon: BookOpen,
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  DISSERTATION: {
    label: "PhD Dissertation",
    Icon: ScrollText,
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  FUNDS: {
    label: "Funds Research",
    Icon: Banknote,
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
};

const STATUS_META: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  SUBMITTED: { label: "Submitted", color: "bg-blue-100 text-blue-700" },
  UNDER_SUPERVISOR_REVIEW: {
    label: "Under Supervisor Review",
    color: "bg-amber-100 text-amber-800",
  },
  REWORK_REQUESTED: {
    label: "Rework Requested",
    color: "bg-orange-100 text-orange-800",
  },
  UNDER_INSTRUCTOR_REVIEW: {
    label: "Under Instructor Review",
    color: "bg-violet-100 text-violet-700",
  },
  APPROVED: { label: "Approved — Awaiting Publication", color: "bg-teal-100 text-teal-700" },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700" },
  PUBLISHED: { label: "Published", color: "bg-green-100 text-green-700" },
};

export default function InstitutionProjectCard({
  project,
}: {
  project: InstitutionResearchProject;
}) {
  const typeMeta = TYPE_META[project.project_type] || TYPE_META.BACHELORS;
  const TypeIcon = typeMeta.Icon;
  const statusMeta = STATUS_META[project.status] || { label: project.status, color: "bg-gray-100 text-gray-700" };

  const studentNames = (project.students || [])
    .map((s: any) => `${s.first_name || ""} ${s.last_name || ""}`.trim())
    .filter(Boolean)
    .join(", ");
  const instructorNames = (project.instructors || [])
    .map((i: any) => `${i.first_name || ""} ${i.last_name || ""}`.trim())
    .filter(Boolean)
    .join(", ");
  const supervisorNames = (project.industrial_supervisors || [])
    .map((s: any) => `${s.first_name || ""} ${s.last_name || ""}`.trim())
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/dashboard/user/institution-portal/projects/${project.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-[#0158B7]/30 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-full text-xs font-medium ${typeMeta.color}`}
            >
              <TypeIcon className="w-3 h-3" /> {typeMeta.label}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusMeta.color}`}>
              {statusMeta.label}
            </span>
            {project.rework_count > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-[11px]">
                <RefreshCw className="w-3 h-3" /> Rework x{project.rework_count}
              </span>
            )}
            {project.visibility_after_publish && (
              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px]">
                {project.visibility_after_publish === "PUBLIC" ? "Public" : "Institution Only"}
              </span>
            )}
          </div>

          <h3 className="text-md font-semibold text-gray-900 mb-1 line-clamp-2">
            {project.title}
          </h3>
          <RichContentPreview
            html={project.abstract}
            lines={2}
            className="text-xs text-gray-500 mb-2"
          />

          <div className="space-y-1 text-xs text-gray-600">
            {studentNames && (
              <div>
                <span className="font-medium">Students:</span> {studentNames}
              </div>
            )}
            {instructorNames && (
              <div>
                <span className="font-medium">Instructors:</span> {instructorNames}
              </div>
            )}
            {supervisorNames && (
              <div>
                <span className="font-medium">Supervisor:</span> {supervisorNames}
              </div>
            )}
            {project.academic_year && (
              <div>
                <span className="font-medium">Year:</span> {project.academic_year}
                {project.semester ? ` · ${project.semester}` : ""}
              </div>
            )}
          </div>
        </div>
      </div>

      {project.status === "REWORK_REQUESTED" && project.rework_reason && (
        <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-2">{stripHtml(project.rework_reason)}</span>
        </div>
      )}
    </Link>
  );
}
