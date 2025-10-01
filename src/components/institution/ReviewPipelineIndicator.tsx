"use client";

import {
  FileText,
  ShieldCheck,
  UserCog,
  Building2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { InstitutionProjectStatus } from "@/lib/features/auth/institutionResearchSlice";

const FULL_STAGES = [
  { key: "STUDENT", label: "Student", icon: FileText },
  { key: "SUPERVISOR", label: "Supervisor (Stage 2)", icon: ShieldCheck },
  { key: "INSTRUCTOR", label: "Instructor (Stage 3)", icon: UserCog },
  { key: "INSTITUTION", label: "Institution (Stage 4)", icon: Building2 },
  { key: "PUBLISHED", label: "Published", icon: CheckCircle },
];

const NO_SUPERVISOR_STAGES = [
  { key: "STUDENT", label: "Student", icon: FileText },
  { key: "INSTRUCTOR", label: "Instructor (Stage 2)", icon: UserCog },
  { key: "INSTITUTION", label: "Institution (Stage 3)", icon: Building2 },
  { key: "PUBLISHED", label: "Published", icon: CheckCircle },
];

function statusToIndex(status: InstitutionProjectStatus, hasSupervisors: boolean): number {
  if (hasSupervisors) {
    switch (status) {
      case "DRAFT":
        return 0;
      case "SUBMITTED":
      case "UNDER_SUPERVISOR_REVIEW":
      case "REWORK_REQUESTED":
        return 1;
      case "UNDER_INSTRUCTOR_REVIEW":
        return 2;
      case "APPROVED":
        return 3;
      case "PUBLISHED":
        return 4;
      case "REJECTED":
        return -1;
      default:
        return 0;
    }
  }
  // Supervisor stage skipped
  switch (status) {
    case "DRAFT":
      return 0;
    case "SUBMITTED":
    case "UNDER_SUPERVISOR_REVIEW":
    case "UNDER_INSTRUCTOR_REVIEW":
    case "REWORK_REQUESTED":
      return 1;
    case "APPROVED":
      return 2;
    case "PUBLISHED":
      return 3;
    case "REJECTED":
      return -1;
    default:
      return 0;
  }
}

export default function ReviewPipelineIndicator({
  status,
  hasSupervisors = true,
}: {
  status: InstitutionProjectStatus;
  hasSupervisors?: boolean;
}) {
  const stages = hasSupervisors ? FULL_STAGES : NO_SUPERVISOR_STAGES;
  const activeIdx = statusToIndex(status, hasSupervisors);
  const rejected = status === "REJECTED";

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
        Review Pipeline
      </div>
      <div className="flex items-center">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isActive = idx === activeIdx;
          const isDone = idx < activeIdx;
          const color = rejected
            ? "bg-red-100 text-red-700 border-red-300"
            : isDone
            ? "bg-green-500 text-white border-green-600"
            : isActive
            ? "bg-[#0158B7] text-white border-[#0158B7]"
            : "bg-gray-100 text-gray-500 border-gray-200";
          return (
            <div key={stage.key} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${color}`}
                >
                  {rejected && idx === 0 ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div className="text-[10px] font-medium mt-1 text-gray-700 text-center max-w-[90px]">
                  {stage.label}
                </div>
              </div>
              {idx < stages.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 ${
                    rejected
                      ? "bg-red-200"
                      : isDone
                      ? "bg-green-500"
                      : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      {rejected && (
        <div className="mt-3 text-xs text-red-600 font-medium">
          Project rejected — pipeline halted.
        </div>
      )}
      {status === "REWORK_REQUESTED" && (
        <div className="mt-3 text-xs text-amber-600 font-medium">
          Rework requested — student must address feedback and resubmit.
        </div>
      )}
    </div>
  );
}
