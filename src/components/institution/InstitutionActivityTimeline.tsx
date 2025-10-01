"use client";

import {
  FileText,
  UploadCloud,
  Send,
  ShieldCheck,
  UserCog,
  Building2,
  CheckCircle,
  XCircle,
  RefreshCw,
  MessageSquare,
  Globe,
  Activity as ActivityIcon,
  PenLine,
} from "lucide-react";

const ACTION_META: Record<
  string,
  { label: string; Icon: any; color: string; bg: string }
> = {
  PROJECT_CREATED: {
    label: "Project created",
    Icon: FileText,
    color: "text-sky-700",
    bg: "bg-sky-100",
  },
  PROJECT_UPDATED: {
    label: "Project updated",
    Icon: PenLine,
    color: "text-slate-700",
    bg: "bg-slate-100",
  },
  FILE_UPLOADED: {
    label: "File uploaded",
    Icon: UploadCloud,
    color: "text-indigo-700",
    bg: "bg-indigo-100",
  },
  FILE_VERSION_UPDATED: {
    label: "File version updated",
    Icon: UploadCloud,
    color: "text-indigo-700",
    bg: "bg-indigo-100",
  },
  PROJECT_SUBMITTED: {
    label: "Submitted for review",
    Icon: Send,
    color: "text-blue-700",
    bg: "bg-blue-100",
  },
  SUPERVISOR_REVIEW: {
    label: "Supervisor review",
    Icon: ShieldCheck,
    color: "text-amber-700",
    bg: "bg-amber-100",
  },
  SUPERVISOR_APPROVED: {
    label: "Supervisor approved",
    Icon: CheckCircle,
    color: "text-green-700",
    bg: "bg-green-100",
  },
  SUPERVISOR_REWORK_REQUESTED: {
    label: "Supervisor requested rework",
    Icon: RefreshCw,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  SUPERVISOR_REJECTED: {
    label: "Supervisor rejected",
    Icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  INSTRUCTOR_REVIEW: {
    label: "Instructor review",
    Icon: UserCog,
    color: "text-violet-700",
    bg: "bg-violet-100",
  },
  INSTRUCTOR_APPROVED: {
    label: "Instructor approved",
    Icon: CheckCircle,
    color: "text-green-700",
    bg: "bg-green-100",
  },
  INSTRUCTOR_REWORK_REQUESTED: {
    label: "Instructor requested rework",
    Icon: RefreshCw,
    color: "text-orange-700",
    bg: "bg-orange-100",
  },
  INSTRUCTOR_REJECTED: {
    label: "Instructor rejected",
    Icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  INSTITUTION_REVIEW: {
    label: "Institution review",
    Icon: Building2,
    color: "text-teal-700",
    bg: "bg-teal-100",
  },
  PUBLISHED_PRIVATE: {
    label: "Published (Institution Only)",
    Icon: Building2,
    color: "text-indigo-700",
    bg: "bg-indigo-100",
  },
  PUBLISHED_PUBLIC: {
    label: "Published (Public)",
    Icon: Globe,
    color: "text-emerald-700",
    bg: "bg-emerald-100",
  },
  INSTITUTION_REJECTED: {
    label: "Institution rejected",
    Icon: XCircle,
    color: "text-red-700",
    bg: "bg-red-100",
  },
  COMMENT_ADDED: {
    label: "Comment added",
    Icon: MessageSquare,
    color: "text-gray-700",
    bg: "bg-gray-100",
  },
  COMMENT_RESOLVED: {
    label: "Comment resolved",
    Icon: CheckCircle,
    color: "text-green-700",
    bg: "bg-green-100",
  },
};

export default function InstitutionActivityTimeline({
  activities,
}: {
  activities: any[];
}) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic text-center py-6">
        No activity yet.
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200" />
      <div className="space-y-4">
        {activities.map((a: any) => {
          const meta =
            ACTION_META[a.action_type] || {
              label: a.action_type,
              Icon: ActivityIcon,
              color: "text-gray-700",
              bg: "bg-gray-100",
            };
          const Icon = meta.Icon;
          return (
            <div key={a.id} className="relative pl-10">
              <div
                className={`absolute left-0 w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${meta.bg}`}
              >
                <Icon className={`w-4 h-4 ${meta.color}`} />
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-sm font-medium text-gray-900">
                    {meta.label}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {new Date(a.created_at).toLocaleString()}
                  </div>
                </div>
                {a.actor && (
                  <div className="text-xs text-gray-600 mt-0.5">
                    by{" "}
                    <span className="font-medium">
                      {a.actor.first_name} {a.actor.last_name}
                    </span>
                    {a.actor_role ? ` · ${a.actor_role}` : ""}
                  </div>
                )}
                {a.description && (
                  <p className="text-xs text-gray-700 mt-1 whitespace-pre-wrap">
                    {a.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
