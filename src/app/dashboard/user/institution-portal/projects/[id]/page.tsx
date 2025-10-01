// @ts-nocheck

"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  RefreshCw,
  PenLine,
  Globe,
  Building2,
  Download,
  FileText,
  Tag,
  Calendar,
  Loader2,
  Users,
  GraduationCap,
  ShieldCheck,
  UserCog,
  Eye,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchInstitutionProject,
  fetchProjectActivity,
  fetchProjectComments,
  submitInstitutionProject,
  supervisorReviewProject,
  instructorReviewProject,
  publishInstitutionProject,
  clearMessages,
} from "@/lib/features/auth/institutionResearchSlice";
import InstitutionPortalRoleBadge from "@/components/institution/InstitutionPortalRoleBadge";
import ReviewPipelineIndicator from "@/components/institution/ReviewPipelineIndicator";
import InstitutionCommentThread from "@/components/institution/InstitutionCommentThread";
import InstitutionActivityTimeline from "@/components/institution/InstitutionActivityTimeline";
import ReworkRequestModal from "@/components/institution/ReworkRequestModal";
import PublishDecisionModal from "@/components/institution/PublishDecisionModal";
import { SmartDocumentPreview, useDocumentPreview, DocumentLink } from "@/components/ui/SmartDocumentPreview";
import RichContent from "@/components/institution/RichContent";

export default function InstitutionProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user } = useAppSelector((s: any) => s.auth);
  const {
    selectedProject: project,
    activity,
    comments,
    loading,
    submitting,
    reviewing,
    publishing,
    success,
    error,
  } = useAppSelector((s: any) => s.institutionResearch);

  const [reworkOpen, setReworkOpen] = useState(false);
  const [reworkStage, setReworkStage] = useState<"SUPERVISOR" | "INSTRUCTOR">(
    "SUPERVISOR"
  );
  const [publishOpen, setPublishOpen] = useState(false);
  const [tab, setTab] = useState<"details" | "comments" | "activity">("details");

  // Document preview hook
  const { openPreview, PreviewComponent } = useDocumentPreview();

  useEffect(() => {
    if (id) {
      dispatch(fetchInstitutionProject(id));
      dispatch(fetchProjectActivity(id));
      dispatch(fetchProjectComments(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [success, error, dispatch]);

  if (loading && !project) {
    return (
      <div className="p-10 flex justify-center">
        <Loader2 className="w-6 h-6 text-[#0158B7] animate-spin" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="p-6 text-center text-sm text-gray-600">
        Project not found.
        <div className="mt-3">
          <Link
            href="/dashboard/user/institution-portal/projects"
            className="text-[#0158B7] hover:underline"
          >
            Back to projects
          </Link>
        </div>
      </div>
    );
  }

  const userId = user?.id;
  const role = user?.institution_portal_role;
  const isAdmin = role === "INSTITUTION_ADMIN" || user?.account_type === "Institution";
  const isStudent =
    role === "STUDENT" ||
    (project.students || []).some((s: any) => s.id === userId);
  const isInstructor =
    role === "INSTRUCTOR" ||
    (project.instructors || []).some((i: any) => i.id === userId);
  const isSupervisor =
    role === "INDUSTRIAL_SUPERVISOR" ||
    user?.is_industrial_supervisor ||
    (project.industrial_supervisors || []).some((s: any) => s.id === userId);

  // Industrial supervisor stage is optional. When the project has no
  // supervisors assigned, Stage 2 is skipped entirely and the project goes
  // straight to instructor review on submit / resubmit.
  const hasSupervisors = (project.industrial_supervisors || []).length > 0;
  const inSupervisorStage =
    hasSupervisors &&
    (project.status === "SUBMITTED" || project.status === "UNDER_SUPERVISOR_REVIEW");
  const inInstructorStage =
    project.status === "UNDER_INSTRUCTOR_REVIEW" ||
    (!hasSupervisors && project.status === "SUBMITTED");

  const submit = async () => {
    const res: any = await dispatch(submitInstitutionProject(id));
    if (res?.meta?.requestStatus === "fulfilled") {
      dispatch(fetchProjectActivity(id));
    }
  };

  const doSupervisorReview = async (action: "APPROVED" | "REJECTED") => {
    const res: any = await dispatch(
      supervisorReviewProject({ id, action })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      dispatch(fetchProjectActivity(id));
    }
  };

  const doInstructorReview = async (action: "APPROVED" | "REJECTED") => {
    const res: any = await dispatch(
      instructorReviewProject({ id, action })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      dispatch(fetchProjectActivity(id));
    }
  };

  const submitRework = async (feedback: string) => {
    const action = "REWORK_REQUESTED" as const;
    const res: any =
      reworkStage === "SUPERVISOR"
        ? await dispatch(supervisorReviewProject({ id, action, feedback }))
        : await dispatch(instructorReviewProject({ id, action, feedback }));
    if (res?.meta?.requestStatus === "fulfilled") {
      setReworkOpen(false);
      dispatch(fetchProjectActivity(id));
      dispatch(fetchProjectComments(id));
    }
  };

  const submitPublishDecision = async (payload: {
    action: "PUBLISH" | "REJECT";
    visibility?: "INSTITUTION_ONLY" | "PUBLIC";
    notes: string;
  }) => {
    const res: any = await dispatch(
      publishInstitutionProject({
        id,
        action: payload.action,
        visibility: payload.visibility || "INSTITUTION_ONLY",
        notes: payload.notes,
      })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      setPublishOpen(false);
      dispatch(fetchProjectActivity(id));
    }
  };

  const ActionPanel = () => {
    const actions: any[] = [];

    if (isStudent && project.status === "DRAFT") {
      actions.push(
        <Link
          key="edit"
          href={`/dashboard/user/institution-portal/projects/${id}/edit`}
          className="w-full px-3 py-2 border border-gray-300 rounded text-xs text-gray-700 inline-flex items-center gap-1 justify-center hover:bg-gray-50"
        >
          <PenLine className="w-3 h-3" /> Edit Project
        </Link>
      );
      actions.push(
        <button
          key="submit"
          onClick={submit}
          disabled={submitting}
          className="w-full px-3 py-2 bg-[#0158B7] hover:bg-[#014a97] text-white rounded text-xs inline-flex items-center gap-1 justify-center disabled:opacity-50"
        >
          <Send className="w-3 h-3" />
          {submitting ? "Submitting..." : "Submit for Review"}
        </button>
      );
    }

    if (isStudent && project.status === "REWORK_REQUESTED") {
      actions.push(
        <Link
          key="edit-rework"
          href={`/dashboard/user/institution-portal/projects/${id}/edit`}
          className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded text-xs inline-flex items-center gap-1 justify-center"
        >
          <RefreshCw className="w-3 h-3" /> Address Rework & Resubmit
        </Link>
      );
    }

    if (isSupervisor && inSupervisorStage) {
      actions.push(
        <button
          key="sup-approve"
          onClick={() => doSupervisorReview("APPROVED")}
          disabled={reviewing}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs inline-flex items-center gap-1 justify-center disabled:opacity-50"
        >
          <CheckCircle className="w-3 h-3" /> Approve & Forward to Instructor
        </button>
      );
      actions.push(
        <button
          key="sup-rework"
          onClick={() => {
            setReworkStage("SUPERVISOR");
            setReworkOpen(true);
          }}
          className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs inline-flex items-center gap-1 justify-center"
        >
          <RefreshCw className="w-3 h-3" /> Request Rework
        </button>
      );
      actions.push(
        <button
          key="sup-reject"
          onClick={() => doSupervisorReview("REJECTED")}
          disabled={reviewing}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs inline-flex items-center gap-1 justify-center disabled:opacity-50"
        >
          <XCircle className="w-3 h-3" /> Reject
        </button>
      );
    }

    if (isInstructor && inInstructorStage) {
      actions.push(
        <button
          key="ins-approve"
          onClick={() => doInstructorReview("APPROVED")}
          disabled={reviewing}
          className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs inline-flex items-center gap-1 justify-center disabled:opacity-50"
        >
          <CheckCircle className="w-3 h-3" /> Approve & Forward to Institution
        </button>
      );
      actions.push(
        <button
          key="ins-rework"
          onClick={() => {
            setReworkStage("INSTRUCTOR");
            setReworkOpen(true);
          }}
          className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded text-xs inline-flex items-center gap-1 justify-center"
        >
          <RefreshCw className="w-3 h-3" /> Request Rework
        </button>
      );
      actions.push(
        <button
          key="ins-reject"
          onClick={() => doInstructorReview("REJECTED")}
          disabled={reviewing}
          className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs inline-flex items-center gap-1 justify-center disabled:opacity-50"
        >
          <XCircle className="w-3 h-3" /> Reject
        </button>
      );
    }

    if (isAdmin && project.status === "APPROVED") {
      actions.push(
        <button
          key="pub-decide"
          onClick={() => setPublishOpen(true)}
          disabled={publishing}
          className="w-full px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs inline-flex items-center gap-1 justify-center disabled:opacity-50"
        >
          <Globe className="w-3 h-3" /> Make Publication Decision
        </button>
      );
      actions.push(
        <p
          key="pub-hint"
          className="text-[11px] text-gray-500 text-center"
        >
          Choose Publish as Private · Publish as Public · Reject
        </p>
      );
    }

    if (project.status === "PUBLISHED") {
      actions.push(
        <div
          key="pub-info"
          className="w-full px-3 py-2 bg-green-50 border border-green-200 text-green-800 rounded text-xs inline-flex items-center gap-1 justify-center"
        >
          {project.visibility_after_publish === "PUBLIC" ? (
            <>
              <Globe className="w-3 h-3" /> Published publicly
            </>
          ) : (
            <>
              <Building2 className="w-3 h-3" /> Published (Institution only)
            </>
          )}
        </div>
      );
    }

    return actions.length > 0 ? (
      <div className="space-y-2">{actions}</div>
    ) : (
      <div className="text-xs text-gray-500 italic text-center py-2">
        No actions available for your role at this stage.
      </div>
    );
  };

  const canResolveComments = isSupervisor || isInstructor || isAdmin;
  const typeLabel =
    {
      BACHELORS: "Bachelor's Research",
      MASTERS_THESIS: "Master's Thesis",
      DISSERTATION: "PhD Dissertation",
      FUNDS: "Funds Research",
    }[project.project_type] || project.project_type;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Document Preview Modal */}
      <PreviewComponent />

      <Link
        href="/dashboard/user/institution-portal/projects"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#0158B7] mb-3"
      >
        <ArrowLeft className="w-3 h-3" /> Back to projects
      </Link>

      <div className="mb-4">
        <ReviewPipelineIndicator status={project.status} hasSupervisors={hasSupervisors} />
      </div>

      {project.status === "REWORK_REQUESTED" && project.rework_reason && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
          <div className="text-xs font-semibold text-orange-800 mb-1">
            Rework Requested
          </div>
          <RichContent html={project.rework_reason} className="text-xs text-orange-800" />
        </div>
      )}
      {project.status === "REJECTED" && project.rejection_reason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="text-xs font-semibold text-red-800 mb-1">
            Rejection Reason
          </div>
          <RichContent html={project.rejection_reason} className="text-xs text-red-800" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-3 space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-1">
              Type
            </div>
            <div className="text-sm font-semibold text-gray-900">{typeLabel}</div>
            <div className="mt-2 text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
              Academic Year
            </div>
            <div className="text-xs text-gray-800">
              {project.academic_year || "—"} {project.semester ? `· ${project.semester}` : ""}
            </div>
            <div className="mt-2 text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
              Field
            </div>
            <div className="text-xs text-gray-800">
              {project.field_of_study || "—"}
            </div>
            {project.keywords && project.keywords.length > 0 && (
              <>
                <div className="mt-2 text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                  Keywords
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.keywords.map((k: string) => (
                    <span
                      key={k}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px]"
                    >
                      <Tag className="w-2.5 h-2.5" /> {k}
                    </span>
                  ))}
                </div>
              </>
            )}
            {project.rework_count > 0 && (
              <div className="mt-3 text-[11px] text-orange-700 inline-flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Rework count:{" "}
                {project.rework_count}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
              People
            </div>
            <PeopleBlock
              icon={GraduationCap}
              label="Students"
              people={project.students || []}
            />
            <PeopleBlock
              icon={UserCog}
              label="Instructors"
              people={project.instructors || []}
            />
            <PeopleBlock
              icon={ShieldCheck}
              label="Industrial Supervisors"
              people={project.industrial_supervisors || []}
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
              Your Role
            </div>
            <InstitutionPortalRoleBadge role={role} />
            <div className="mt-3">
              <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
                Available Actions
              </div>
              <ActionPanel />
            </div>
          </div>
        </aside>

        <main className="lg:col-span-6">
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-5 border-b">
              <h1 className="text-xl font-bold text-gray-900 mb-2">
                {project.title}
              </h1>
              {/* Abstract with RichContent */}
              <div className="mb-2">
                <RichContent html={project.abstract} />
              </div>
            </div>
            <div className="border-b flex">
              {(["details", "comments", "activity"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-2 text-xs font-medium capitalize border-b-2 ${
                    tab === t
                      ? "border-[#0158B7] text-[#0158B7]"
                      : "border-transparent text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {t === "comments"
                    ? `Comments (${comments?.length || 0})`
                    : t === "activity"
                    ? "Activity"
                    : "Details"}
                </button>
              ))}
            </div>
            <div className="p-5">
              {tab === "details" && (
                <div className="space-y-4">
                  {project.full_description && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                        Full Description
                      </h3>
                      {/* Full Description with RichContent */}
                      <RichContent html={project.full_description} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                      Files
                    </h3>
                    {(project.files || []).length === 0 && !project.project_file_url ? (
                      <p className="text-xs text-gray-500 italic">
                        No files uploaded.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {project.project_file_url && (
                          <div className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-[#0158B7] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">
                                  Main project document
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  Current version
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openPreview(project.project_file_url, "Main project document", "application/pdf")}
                                className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                       
                            </div>
                          </div>
                        )}
                        {(project.files || []).map((f: any) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between p-2 border border-gray-200 rounded hover:bg-gray-50"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">
                                  {f.file_name || "File"}
                                </div>
                                <div className="text-[10px] text-gray-500">
                                  v{f.file_version || 1}
                                  {f.is_latest_version ? " · latest" : ""}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => openPreview(f.file_url, f.file_name, f.file_type)}
                                className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                                title="Preview"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                   
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {tab === "comments" && (
                <InstitutionCommentThread
                  projectId={id}
                  comments={comments || []}
                  canResolve={canResolveComments}
                />
              )}
              {tab === "activity" && (
                <InstitutionActivityTimeline activities={activity || []} />
              )}
            </div>
          </div>
        </main>

        <aside className="lg:col-span-3 space-y-3">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
              Status
            </div>
            <div className="text-xs font-semibold text-gray-900">
              {project.status.replace(/_/g, " ")}
            </div>
            {project.submission_date && (
              <div className="mt-2">
                <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                  Submitted
                </div>
                <div className="text-xs text-gray-700">
                  {new Date(project.submission_date).toLocaleDateString()}
                </div>
              </div>
            )}
            {project.final_approval_date && (
              <div className="mt-2">
                <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                  Approved
                </div>
                <div className="text-xs text-gray-700">
                  {new Date(project.final_approval_date).toLocaleDateString()}
                </div>
              </div>
            )}
            {project.publication_date && (
              <div className="mt-2">
                <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">
                  Published
                </div>
                <div className="text-xs text-gray-700">
                  {new Date(project.publication_date).toLocaleDateString()}
                </div>
                {project.visibility_after_publish && (
                  <div className="text-[10px] text-gray-500 mt-0.5 inline-flex items-center gap-1">
                    {project.visibility_after_publish === "PUBLIC" ? (
                      <>
                        <Globe className="w-2.5 h-2.5" /> Public
                      </>
                    ) : (
                      <>
                        <Building2 className="w-2.5 h-2.5" /> Institution only
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold mb-2">
              Engagement
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded p-2">
                <div className="text-[10px] text-gray-500">Views</div>
                <div className="text-sm font-bold text-gray-900">
                  {project.view_count || 0}
                </div>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <div className="text-[10px] text-gray-500">Downloads</div>
                <div className="text-sm font-bold text-gray-900">
                  {project.download_count || 0}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <ReworkRequestModal
        open={reworkOpen}
        onClose={() => setReworkOpen(false)}
        onSubmit={async (feedback) => submitRework(feedback)}
        title={`Request Rework (${
          reworkStage === "SUPERVISOR" ? "Supervisor" : "Instructor"
        } Stage)`}
      />
      <PublishDecisionModal
        open={publishOpen}
        onClose={() => setPublishOpen(false)}
        onSubmit={submitPublishDecision}
        projectTitle={project.title}
      />
    </div>
  );
}

function PeopleBlock({
  icon: Icon,
  label,
  people,
}: {
  icon: any;
  label: string;
  people: any[];
}) {
  if (!people || people.length === 0) return null;
  return (
    <div className="mb-3">
      <div className="text-[11px] text-gray-600 font-medium inline-flex items-center gap-1 mb-1">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="space-y-1">
        {people.map((p: any) => (
          <div
            key={p.id}
            className="flex items-center gap-2 text-xs text-gray-800"
          >
            <div className="w-6 h-6 rounded-full bg-[#0158B7] text-white flex items-center justify-center text-[10px] font-bold">
              {(p.first_name?.[0] || "") + (p.last_name?.[0] || "")}
            </div>
            <span className="truncate">
              {p.first_name} {p.last_name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}