// @ts-nocheck
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  createInstitutionProject,
  clearMessages,
} from "@/lib/features/auth/institutionResearchSlice";
import InstitutionProjectCreateStepper, {
  ProjectCreatePayload,
} from "@/components/institution/InstitutionProjectCreateStepper";
import { ArrowLeft } from "lucide-react";

export default function InstitutionProjectCreatePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { creating, error, success } = useAppSelector(
    (s: any) => s.institutionResearch
  );

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearMessages());
    }
  }, [error, dispatch]);

  const handleSubmit = async (data: ProjectCreatePayload) => {
    if (!data.project_type || !data.project_file) {
      toast.error("Project type and main file are required");
      return;
    }

    const fd = new FormData();
    fd.append("title", data.title);
    fd.append("abstract", data.abstract);
    if (data.full_description) fd.append("full_description", data.full_description);
    fd.append("project_type", data.project_type);
    if (data.academic_year) fd.append("academic_year", data.academic_year);
    if (data.semester) fd.append("semester", data.semester);
    if (data.field_of_study) fd.append("field_of_study", data.field_of_study);
    if (data.keywords) {
      const kw = data.keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      fd.append("keywords", JSON.stringify(kw));
    }
    fd.append("is_multi_student", String(data.is_multi_student));
    fd.append("max_students", String(data.max_students));
    if (data.cover_image) fd.append("cover_image", data.cover_image);
    if (data.project_file) fd.append("project_file", data.project_file);
    if (data.additional_files && data.additional_files.length > 0) {
      data.additional_files.forEach((f) => fd.append("additional_files", f));
    }

    const res: any = await dispatch(createInstitutionProject(fd));
    if (res?.meta?.requestStatus === "fulfilled" && res.payload?.id) {
      toast.success("Project created as draft");
      router.push(
        `/dashboard/user/institution-portal/projects/${res.payload.id}`
      );
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <Link
        href="/dashboard/user/institution-portal/projects"
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#0158B7] mb-3"
      >
        <ArrowLeft className="w-3 h-3" /> Back to projects
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">
        Create Research Project
      </h1>
      <p className="text-sm text-gray-600 mb-5">
        Follow the steps to create a new draft. You'll be able to submit it to
        your supervisor once ready.
      </p>

      <InstitutionProjectCreateStepper
        onSubmit={handleSubmit}
        submitting={creating}
      />
    </div>
  );
}
