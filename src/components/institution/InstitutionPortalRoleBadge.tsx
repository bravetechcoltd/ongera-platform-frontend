"use client";

import { Building2, GraduationCap, ShieldCheck, UserCog } from "lucide-react";

type Role = "STUDENT" | "INSTRUCTOR" | "INDUSTRIAL_SUPERVISOR" | "INSTITUTION_ADMIN" | string | null | undefined;

const cfg: Record<string, { label: string; color: string; Icon: any }> = {
  STUDENT: { label: "Student", color: "bg-blue-50 text-blue-700 border-blue-200", Icon: GraduationCap },
  INSTRUCTOR: { label: "Instructor", color: "bg-purple-50 text-purple-700 border-purple-200", Icon: UserCog },
  INDUSTRIAL_SUPERVISOR: { label: "Industrial Supervisor", color: "bg-amber-50 text-amber-700 border-amber-200", Icon: ShieldCheck },
  INSTITUTION_ADMIN: { label: "Institution Admin", color: "bg-emerald-50 text-emerald-700 border-emerald-200", Icon: Building2 },
};

export default function InstitutionPortalRoleBadge({ role }: { role: Role }) {
  if (!role) return null;
  const c = cfg[role] || { label: role, color: "bg-gray-50 text-gray-700 border-gray-200", Icon: Building2 };
  const Icon = c.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-full text-xs font-medium ${c.color}`}>
      <Icon className="w-3 h-3" /> {c.label}
    </span>
  );
}
