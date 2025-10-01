"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Image as ImageIcon,
  FileText,
  Tag,
  CheckCircle,
} from "lucide-react";
import ProjectTypeSelector from "./ProjectTypeSelector";
import type { InstitutionProjectType } from "@/lib/features/auth/institutionResearchSlice";
import RichTextEditor from "@/components/ui/richTextEditor";
import RichContent from "@/components/institution/RichContent";

const STEPS = [
  { key: "TYPE", label: "Type" },
  { key: "BASICS", label: "Basics" },
  { key: "METADATA", label: "Metadata" },
  { key: "FILES", label: "Files" },
  { key: "REVIEW", label: "Review" },
];

export interface ProjectCreatePayload {
  project_type: InstitutionProjectType | undefined;
  title: string;
  abstract: string;
  full_description: string;
  academic_year: string;
  semester: "FIRST" | "SECOND" | "THIRD" | "";
  field_of_study: string;
  keywords: string;
  is_multi_student: boolean;
  max_students: number;
  cover_image?: File | null;
  project_file?: File | null;
  additional_files?: File[];
}

const emptyPayload: ProjectCreatePayload = {
  project_type: undefined,
  title: "",
  abstract: "",
  full_description: "",
  academic_year: "",
  semester: "",
  field_of_study: "",
  keywords: "",
  is_multi_student: false,
  max_students: 1,
  cover_image: null,
  project_file: null,
  additional_files: [],
};

export default function InstitutionProjectCreateStepper({
  onSubmit,
  submitting,
}: {
  onSubmit: (payload: ProjectCreatePayload) => Promise<void> | void;
  submitting: boolean;
}) {
  const [stepIdx, setStepIdx] = useState(0);
  const [data, setData] = useState<ProjectCreatePayload>(emptyPayload);

  const updateField = <K extends keyof ProjectCreatePayload>(
    key: K,
    value: ProjectCreatePayload[K]
  ) => {
    setData((d) => ({ ...d, [key]: value }));
  };

  const canAdvance = () => {
    switch (STEPS[stepIdx].key) {
      case "TYPE":
        return !!data.project_type;
      case "BASICS":
        // Check both title and abstract (abstract can be rich text, so check non-empty HTML)
        return !!(data.title.trim() && data.abstract && data.abstract.replace(/<[^>]*>/g, '').trim());
      case "METADATA":
        return true;
      case "FILES":
        return !!data.project_file;
      case "REVIEW":
        return true;
    }
    return false;
  };

  const next = () => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
  const back = () => setStepIdx((i) => Math.max(i - 1, 0));

  const handleSubmit = async () => {
    await onSubmit(data);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          {STEPS.map((s, idx) => {
            const active = idx === stepIdx;
            const done = idx < stepIdx;
            return (
              <div key={s.key} className="flex-1 flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      done
                        ? "bg-green-500 text-white"
                        : active
                        ? "bg-[#0158B7] text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {done ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div className="text-[10px] mt-1 font-medium text-gray-700">
                    {s.label}
                  </div>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 ${
                      done ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-5 min-h-[300px]">
        {STEPS[stepIdx].key === "TYPE" && (
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Select project type
            </h3>
            <ProjectTypeSelector
              value={data.project_type}
              onChange={(v) => updateField("project_type", v)}
            />
          </div>
        )}

        {STEPS[stepIdx].key === "BASICS" && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Project Title *
              </label>
              <input
                value={data.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter the full title of your research project"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Abstract *
              </label>
              <RichTextEditor
                value={data.abstract}
                onChange={(value) => updateField("abstract", value)}
                placeholder="Brief summary (150–300 words)"
                className="min-h-[150px]"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                You can format your abstract with rich text formatting
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Full Description
              </label>
              <RichTextEditor
                value={data.full_description}
                onChange={(value) => updateField("full_description", value)}
                placeholder="Extended context, objectives, contribution..."
                className="min-h-[200px]"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Use the toolbar to add headings, lists, colors, and more
              </p>
            </div>
          </div>
        )}

        {STEPS[stepIdx].key === "METADATA" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Academic Year
                </label>
                <input
                  value={data.academic_year}
                  onChange={(e) => updateField("academic_year", e.target.value)}
                  placeholder="2025-2026"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">
                  Semester
                </label>
                <select
                  value={data.semester}
                  onChange={(e) =>
                    updateField(
                      "semester",
                      e.target.value as ProjectCreatePayload["semester"]
                    )
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                >
                  <option value="">—</option>
                  <option value="FIRST">First</option>
                  <option value="SECOND">Second</option>
                  <option value="THIRD">Third</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Field of Study
              </label>
              <input
                value={data.field_of_study}
                onChange={(e) => updateField("field_of_study", e.target.value)}
                placeholder="e.g. Computer Science, Biomedical Engineering"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block inline-flex items-center gap-1">
                <Tag className="w-3 h-3" /> Keywords (comma separated)
              </label>
              <input
                value={data.keywords}
                onChange={(e) => updateField("keywords", e.target.value)}
                placeholder="machine learning, NLP, healthcare"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div className="p-3 border border-gray-200 rounded bg-gray-50">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={data.is_multi_student}
                  onChange={(e) =>
                    updateField("is_multi_student", e.target.checked)
                  }
                  className="rounded"
                />
                <span className="text-xs font-medium text-gray-800">
                  This is a group project (multiple students)
                </span>
              </label>
              {data.is_multi_student && (
                <div className="mt-2">
                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                    Max students
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={data.max_students}
                    onChange={(e) =>
                      updateField("max_students", parseInt(e.target.value) || 1)
                    }
                    className="w-32 border border-gray-300 rounded px-2 py-1 text-xs"
                  />
                </div>
              )}
            </div>
          </div>
        )}

{STEPS[stepIdx].key === "FILES" && (
  <div className="space-y-6">
    {/* Cover Image Upload */}
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ImageIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-800">
            Cover Image <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <p className="text-xs text-gray-500 mt-0.5">JPG, PNG, GIF up to 10MB</p>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="file"
          id="cover-image"
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Validate file size (10MB)
              if (file.size > 10 * 1024 * 1024) {
                alert("File size exceeds 10MB limit");
                e.target.value = "";
                return;
              }
              updateField("cover_image", file);
            }
          }}
          className="hidden"
        />
        <label
          htmlFor="cover-image"
          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 group"
        >
          <UploadCloud className="w-5 h-5 text-gray-400 mr-2 group-hover:text-blue-500 transition-colors" />
          <span className="text-sm text-gray-600 group-hover:text-blue-600">
            {data.cover_image ? "Change Cover Image" : "Choose Cover Image"}
          </span>
        </label>
      </div>
      
      {data.cover_image && (
        <div className="mt-3 flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <ImageIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {data.cover_image.name}
              </p>
              <p className="text-xs text-gray-500">
                {(data.cover_image.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          <button
            onClick={() => updateField("cover_image", null)}
            className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>

    {/* Main Project Document Upload */}
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-purple-100 rounded-lg">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-800">
            Main Project Document <span className="text-red-500">*</span>
          </label>
          <p className="text-xs text-gray-500 mt-0.5">PDF, DOC, DOCX up to 10MB</p>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="file"
          id="main-document"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Validate file size (10MB)
              if (file.size > 10 * 1024 * 1024) {
                alert("File size exceeds 10MB limit");
                e.target.value = "";
                return;
              }
              // Validate file type
              const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
              if (!validTypes.includes(file.type)) {
                alert("Please upload PDF, DOC, or DOCX files only");
                e.target.value = "";
                return;
              }
              updateField("project_file", file);
            }
          }}
          className="hidden"
        />
        <label
          htmlFor="main-document"
          className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 group ${
            !data.project_file
              ? "border-gray-300 hover:border-purple-400 hover:bg-purple-50"
              : "border-green-300 bg-green-50 hover:border-green-400"
          }`}
        >
          {!data.project_file ? (
            <>
              <UploadCloud className="w-5 h-5 text-gray-400 mr-2 group-hover:text-purple-500 transition-colors" />
              <span className="text-sm text-gray-600 group-hover:text-purple-600">
                Choose Project Document
              </span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              <span className="text-sm text-green-700 font-medium">
                Document Selected - Click to Change
              </span>
            </>
          )}
        </label>
      </div>
      
      {data.project_file && (
        <div className="mt-3 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <FileText className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {data.project_file.name}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{(data.project_file.size / 1024 / 1024).toFixed(2)} MB</span>
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Ready to upload
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => updateField("project_file", null)}
            className="p-1.5 hover:bg-red-100 rounded-lg text-red-500 transition-colors flex-shrink-0"
            title="Remove file"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>

    {/* Additional Files Upload */}
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-green-100 rounded-lg">
          <UploadCloud className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-800">
            Additional Files <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <p className="text-xs text-gray-500 mt-0.5">Multiple files allowed, max 10MB each</p>
        </div>
      </div>
      
      <div className="relative">
        <input
          type="file"
          id="additional-files"
          multiple
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.ppt,.pptx"
          onChange={(e) => {
            const files = e.target.files ? Array.from(e.target.files) : [];
            // Validate each file size
            const oversizedFiles = files.filter(file => file.size > 10 * 1024 * 1024);
            if (oversizedFiles.length > 0) {
              alert(`${oversizedFiles.length} file(s) exceed the 10MB limit`);
              e.target.value = "";
              return;
            }
            updateField("additional_files", files);
          }}
          className="hidden"
        />
        <label
          htmlFor="additional-files"
          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all duration-200 group"
        >
          <UploadCloud className="w-5 h-5 text-gray-400 mr-2 group-hover:text-green-500 transition-colors" />
          <span className="text-sm text-gray-600 group-hover:text-green-600">
            {data.additional_files && data.additional_files.length > 0 
              ? `Add More Files (${data.additional_files.length} selected)`
              : "Choose Additional Files"}
          </span>
        </label>
      </div>
      
      {data.additional_files && data.additional_files.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-gray-700">
              Selected Files ({data.additional_files.length})
            </p>
            <button
              onClick={() => updateField("additional_files", [])}
              className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {data.additional_files.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-2 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const newFiles = data.additional_files?.filter((_, i) => i !== idx);
                    updateField("additional_files", newFiles);
                  }}
                  className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors flex-shrink-0"
                  title="Remove file"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          
          {/* File summary stats */}
          <div className="mt-3 pt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="text-xs text-gray-500">
              Total: {(data.additional_files.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)} MB
            </span>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              {data.additional_files.length} file(s) ready
            </span>
          </div>
        </div>
      )}
      
      {/* Upload tips */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-start gap-2">
          <svg className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-[10px] text-gray-400">
            Supported formats: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX, PPT, PPTX • Max file size: 10MB per file
          </p>
        </div>
      </div>
    </div>
  </div>
)}

        {STEPS[stepIdx].key === "REVIEW" && (
          <div className="space-y-3 text-xs">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              Confirm project details
            </h3>
            <dl className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
              <RowItem label="Type" value={data.project_type || "—"} />
              <RowItem label="Title" value={data.title} />
              <div className="flex px-3 py-2">
                <div className="w-40 text-gray-500 font-medium">Abstract *</div>
                <div className="flex-1">
                  <RichContent html={data.abstract || "—"} className="text-xs" />
                </div>
              </div>
              <div className="flex px-3 py-2">
                <div className="w-40 text-gray-500 font-medium">Full Description</div>
                <div className="flex-1">
                  <RichContent html={data.full_description || "—"} className="text-xs" />
                </div>
              </div>
              <RowItem label="Academic Year" value={data.academic_year || "—"} />
              <RowItem label="Semester" value={data.semester || "—"} />
              <RowItem label="Field" value={data.field_of_study || "—"} />
              <RowItem label="Keywords" value={data.keywords || "—"} />
              <RowItem
                label="Group project"
                value={
                  data.is_multi_student
                    ? `Yes (max ${data.max_students})`
                    : "No"
                }
              />
              <RowItem
                label="Main file"
                value={data.project_file?.name || "— not uploaded"}
              />
              <RowItem
                label="Cover image"
                value={data.cover_image?.name || "—"}
              />
              <RowItem
                label="Additional files"
                value={
                  data.additional_files && data.additional_files.length > 0
                    ? `${data.additional_files.length} file(s)`
                    : "—"
                }
              />
            </dl>
            <p className="text-[11px] text-gray-500">
              You can save this as a draft now and submit for Stage 2 (supervisor)
              review later.
            </p>
          </div>
        )}
      </div>

      <div className="border-t p-4 flex items-center justify-between">
        <button
          onClick={back}
          disabled={stepIdx === 0}
          className="px-3 py-1.5 text-xs border border-gray-300 rounded disabled:opacity-50 inline-flex items-center gap-1"
        >
          <ChevronLeft className="w-3 h-3" /> Back
        </button>
        {stepIdx < STEPS.length - 1 ? (
          <button
            onClick={next}
            disabled={!canAdvance()}
            className="px-4 py-1.5 text-xs bg-[#0158B7] text-white rounded disabled:opacity-50 inline-flex items-center gap-1"
          >
            Continue <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting || !data.project_file}
            className="px-4 py-1.5 text-xs bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-50 inline-flex items-center gap-1"
          >
            <CheckCircle className="w-3 h-3" />
            {submitting ? "Creating..." : "Save as Draft"}
          </button>
        )}
      </div>
    </div>
  );
}

function RowItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex px-3 py-2">
      <div className="w-40 text-gray-500 font-medium">{label}</div>
      <div className="flex-1 text-gray-800 break-words">{value}</div>
    </div>
  );
}