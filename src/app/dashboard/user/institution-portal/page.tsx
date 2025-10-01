// @ts-nocheck
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchPortalDashboard,
  fetchInstitutionProjects,
} from "@/lib/features/auth/institutionResearchSlice";
import { getPortalDashboard } from "@/lib/features/auth/institution-portal-slice";
import InstitutionPortalRoleBadge from "@/components/institution/InstitutionPortalRoleBadge";
import InstitutionProjectCard from "@/components/institution/InstitutionProjectCard";
import {
  FileText,
  Users,
  ShieldCheck,
  Building2,
  GraduationCap,
  Plus,
  ChevronRight,
  ClipboardList,
  Clock,
  CheckCircle,
  Globe,
  UserPlus,
  BookOpen,
} from "lucide-react";

const StatCard = ({
  label,
  value,
  Icon,
  color,
  href,
}: {
  label: string;
  value: number | string;
  Icon: any;
  color: string;
  href?: string;
}) => {
  const body = (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all ${href ? "cursor-pointer" : ""}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 font-medium">{label}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
};

export default function InstitutionPortalHomePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s: any) => s.auth);
  const { dashboard, projects, loading } = useAppSelector(
    (s: any) => s.institutionResearch
  );
  const { portalDashboard } = useAppSelector(
    (s: any) => s.institutionPortal
  );

  const role = user?.institution_portal_role ||
    (user?.is_industrial_supervisor ? "INDUSTRIAL_SUPERVISOR" : null);
  const isAdmin = role === "INSTITUTION_ADMIN" || user?.account_type === "Institution";
  const isPortalInstructor = user?.institution_role === "INSTRUCTOR";
  const isPortalMember = user?.is_institution_member && user?.institution_role === "MEMBER";

  useEffect(() => {
    dispatch(fetchPortalDashboard());
    dispatch(fetchInstitutionProjects({ limit: 6 }));
    if (isAdmin || isPortalInstructor || isPortalMember) {
      dispatch(getPortalDashboard());
    }
  }, [dispatch, isAdmin, isPortalInstructor, isPortalMember]);

  const d = dashboard || {};
  const counts = d.counts || {};

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">Institution Research Portal</h1>
          <InstitutionPortalRoleBadge role={role} />
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Welcome back {user?.first_name ? `, ${user.first_name}` : ""}. Track
          supervised research, review submissions and guide publication.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Active Projects"
          value={counts.active_projects ?? projects.length ?? 0}
          Icon={FileText}
          color="bg-sky-100 text-sky-700"
          href="/dashboard/user/institution-portal/projects"
        />
        <StatCard
          label="Pending Supervisor"
          value={counts.pending_supervisor_reviews ?? 0}
          Icon={ShieldCheck}
          color="bg-amber-100 text-amber-700"
          href="/dashboard/user/institution-portal/projects?status=UNDER_SUPERVISOR_REVIEW"
        />
        <StatCard
          label="Pending Instructor"
          value={counts.pending_instructor_reviews ?? 0}
          Icon={ClipboardList}
          color="bg-violet-100 text-violet-700"
          href="/dashboard/user/institution-portal/projects?status=UNDER_INSTRUCTOR_REVIEW"
        />
        <StatCard
          label="Awaiting Publication"
          value={counts.awaiting_publication ?? 0}
          Icon={Globe}
          color="bg-teal-100 text-teal-700"
          href="/dashboard/user/institution-portal/projects?status=APPROVED"
        />
      </div>

      {isAdmin && portalDashboard?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard
            label="Portal Students"
            value={portalDashboard.stats.totalStudents ?? 0}
            Icon={GraduationCap}
            color="bg-emerald-100 text-emerald-700"
            href="/dashboard/user/institution-portal/students"
          />
          <StatCard
            label="Portal Instructors"
            value={portalDashboard.stats.totalInstructors ?? 0}
            Icon={BookOpen}
            color="bg-indigo-100 text-indigo-700"
            href="/dashboard/user/institution-portal/instructors"
          />
          <StatCard
            label="Portal Projects"
            value={portalDashboard.stats.totalProjects ?? 0}
            Icon={FileText}
            color="bg-sky-100 text-sky-700"
            href="/dashboard/user/institution-portal/projects"
          />
          <StatCard
            label="Pending Reviews"
            value={portalDashboard.stats.pendingReviews ?? 0}
            Icon={ClipboardList}
            color="bg-amber-100 text-amber-700"
          />
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Link
          href="/dashboard/user/institution-portal/projects/create"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0158B7] text-white text-xs font-medium rounded hover:bg-[#014a97]"
        >
          <Plus className="w-3 h-3" /> New Project
        </Link>
        <Link
          href="/dashboard/user/institution-portal/projects"
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
        >
          <FileText className="w-3 h-3" /> All Projects
        </Link>
        {isAdmin && (
          <>
            <Link
              href="/dashboard/user/institution-portal/members/add"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
            >
              <UserPlus className="w-3 h-3" /> Add Member
            </Link>
            <Link
              href="/dashboard/user/institution-portal/instructors"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
            >
              <BookOpen className="w-3 h-3" /> Our Instructors
            </Link>
            <Link
              href="/dashboard/user/institution-portal/supervisors"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
            >
              <ShieldCheck className="w-3 h-3" /> Industrial Supervisors
            </Link>
            <Link
              href="/dashboard/user/institution-portal/students"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-medium rounded hover:bg-gray-50"
            >
              <GraduationCap className="w-3 h-3" /> Our Students
            </Link>
          </>
        )}
      </div>

      {isPortalInstructor && portalDashboard && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[#0158B7]" /> My Students
          </h3>
          {(portalDashboard.my_students || []).length === 0 ? (
            <p className="text-xs text-gray-500 italic">
              You do not have any students assigned in this institution portal yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {(portalDashboard.my_students || []).map((s: any) => (
                <li key={s.link_id} className="text-xs text-gray-700 flex items-center justify-between">
                  <span>
                    <span className="font-medium">
                      {s.student?.first_name} {s.student?.last_name}
                    </span>
                    <span className="text-gray-500 ml-1">
                      {s.academic_year ? ` • ${s.academic_year}` : ""}
                      {s.semester ? ` • ${s.semester}` : ""}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-[11px] text-gray-600">
            Pending reviews: <span className="font-medium">{portalDashboard.pending_reviews?.length || 0}</span>
            {" • "}
            Approved: <span className="font-medium">{portalDashboard.approved_count || 0}</span>
          </div>
        </div>
      )}

      {isPortalMember && portalDashboard && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#0158B7]" /> My Institution Research
          </h3>
          {(portalDashboard.my_projects || []).length === 0 ? (
            <p className="text-xs text-gray-500 italic">
              You have not submitted any institution research projects yet.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {(portalDashboard.my_projects || []).slice(0, 5).map((p: any) => (
                <li key={p.id} className="text-xs text-gray-700">
                  <Link
                    href={`/dashboard/user/institution-portal/projects/${p.id}`}
                    className="hover:underline"
                  >
                    {p.title}
                  </Link>
                  <span className="text-gray-500 ml-1">— {p.status}</span>
                </li>
              ))}
            </ul>
          )}
          {(portalDashboard.pending_reworks || []).length > 0 && (
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              You have {portalDashboard.pending_reworks.length} project(s) awaiting rework.
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900">Recent Projects</h2>
            <Link
              href="/dashboard/user/institution-portal/projects"
              className="text-xs text-[#0158B7] inline-flex items-center hover:underline"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading && projects.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-sm text-gray-500">
              Loading...
            </div>
          ) : projects.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-3">No projects yet.</p>
              <Link
                href="/dashboard/user/institution-portal/projects/create"
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#0158B7] text-white text-xs rounded"
              >
                <Plus className="w-3 h-3" /> Create your first project
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.slice(0, 6).map((p: any) => (
                <InstitutionProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" /> Recent Activity
            </h3>
            {(d.recent_activity || []).length === 0 ? (
              <p className="text-xs text-gray-500 italic">No recent activity.</p>
            ) : (
              <ul className="space-y-2">
                {(d.recent_activity || []).slice(0, 8).map((a: any) => (
                  <li key={a.id} className="text-xs text-gray-700">
                    <span className="font-medium">{a.action_type?.replace(/_/g, " ")}</span>
                    {a.project?.title ? ` — ${a.project.title}` : ""}
                    <div className="text-[10px] text-gray-400">
                      {new Date(a.created_at).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 inline-flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-500" /> Quick Links
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/dashboard/user/institution-portal/projects?status=REWORK_REQUESTED"
                  className="text-[#0158B7] hover:underline"
                >
                  Projects needing rework
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/user/institution-portal/projects?status=PUBLISHED"
                  className="text-[#0158B7] hover:underline"
                >
                  Published projects
                </Link>
              </li>
              {isAdmin && (
                <li>
                  <Link
                    href="/dashboard/user/institution-portal/supervisors"
                    className="text-[#0158B7] hover:underline"
                  >
                    Manage supervisors
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
