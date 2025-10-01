// @ts-nocheck

"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  Send,
  UploadCloud,
  Image as ImageIcon,
  FileText,
  AlertTriangle,
  Loader2,
  X,
  CheckCircle,
  Eye,
  File,
  Trash2,
  Plus,
  Info,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchInstitutionProject,
  updateInstitutionProject,
  submitInstitutionProject,
  clearMessages,
} from "@/lib/features/auth/institutionResearchSlice";
import RichTextEditor from "@/components/ui/richTextEditor";
import { SmartDocumentPreview, useDocumentPreview } from "@/components/ui/SmartDocumentPreview";
import { useRef } from "react";
// ==================== RICH TEXT CONTENT RENDERER ====================
function RichContent({ html, className = "" }: { html: string; className?: string }) {
  if (!html) return null;

  const isHtml = /<[a-z][\s\S]*>/i.test(html);

  if (isHtml) {
    return (
      <div
        className={`
          rich-text-content
          prose prose-sm max-w-none
          prose-p:my-2 prose-p:leading-relaxed prose-p:text-gray-600 prose-p:break-words
          prose-headings:font-bold prose-headings:text-gray-900 prose-headings:mt-4 prose-headings:mb-2
          prose-h1:text-xl prose-h1:font-bold prose-h1:mb-3
          prose-h2:text-lg prose-h2:font-bold prose-h2:mb-2.5
          prose-h3:text-base prose-h3:font-semibold prose-h3:mb-2
          prose-ul:my-2 prose-ul:pl-5 prose-ul:list-disc
          prose-ol:my-2 prose-ol:pl-5 prose-ol:list-decimal
          prose-li:my-1 prose-li:leading-relaxed
          prose-strong:font-semibold prose-strong:text-gray-900
          prose-em:italic prose-em:text-gray-600
          prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:py-1 prose-blockquote:my-2 prose-blockquote:italic
          prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
          prose-pre:bg-gray-50 prose-pre:text-gray-700 prose-pre:p-3 prose-pre:rounded-lg prose-pre:my-3 prose-pre:overflow-x-auto
          prose-a:text-[#0158B7] prose-a:underline prose-a:decoration-[#0158B7]/30 prose-a:hover:decoration-[#0158B7]
          prose-img:rounded-lg prose-img:my-2 prose-img:max-w-full
          ${className}
        `}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <p className={`text-sm text-gray-600 leading-relaxed whitespace-pre-wrap ${className}`}>
      {html}
    </p>
  );
}

// ==================== FILE UPLOAD CARD COMPONENT ====================
interface FileUploadCardProps {
  label: string;
  description?: string;
  icon: React.ElementType;
  accept: string;
  maxSize?: number;
  existingFile?: { url: string; name: string };
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
  required?: boolean;
  showPreview?: boolean;
  onPreview?: (url: string, name: string, type: string) => void;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({
  label,
  description,
  icon: Icon,
  accept,
  maxSize = 10 * 1024 * 1024,
  existingFile,
  onFileSelect,
  selectedFile,
  required = false,
  showPreview = true,
  onPreview,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit`);
      return false;
    }
    
    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.some(type => type === fileExt || file.type.includes(type.replace('.', '')))) {
      setError(`Invalid file type. Accepted: ${accept}`);
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      onFileSelect(null);
      return;
    }
    if (validateFile(file)) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleRemove = () => {
    onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const currentFile = selectedFile || (existingFile ? { name: existingFile.name, size: 0, url: existingFile.url } : null);

  return (
    <div
      className={`relative rounded-xl border-2 transition-all duration-200 ${
        dragOver
          ? 'border-blue-400 bg-blue-50'
          : error
          ? 'border-red-300 bg-red-50'
          : currentFile
          ? 'border-green-300 bg-green-50'
          : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/30'
      }`}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${
              currentFile ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <Icon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-gray-800">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {currentFile && (
                  <span className="text-[10px] px-1.5 py-0.5 bg-green-200 text-green-800 rounded-full flex items-center gap-0.5">
                    <CheckCircle className="w-2.5 h-2.5" /> Uploaded
                  </span>
                )}
              </div>
              {description && (
                <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>
              )}
            </div>
          </div>
          {currentFile && showPreview && onPreview && existingFile?.url && (
            <button
              onClick={() => onPreview(existingFile.url, existingFile.name, '')}
              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
              title="Preview current file"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!currentFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center py-4 px-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors">
              <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-xs text-gray-500 text-center">
                Click to upload or drag & drop
              </p>
              <p className="text-[9px] text-gray-400 mt-1">
                {accept.replace(/,/g, ', ')} • Max {maxSize / 1024 / 1024}MB
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between bg-white rounded-lg p-2 border border-gray-200">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-800 truncate">
                  {currentFile.name}
                </p>
                {currentFile.size > 0 && (
                  <p className="text-[10px] text-gray-500">{getFileSize(currentFile.size)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {existingFile?.url && onPreview && (
                <button
                  onClick={() => onPreview(existingFile.url, existingFile.name, '')}
                  className="p-1 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                  title="Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleRemove}
                className="p-1 rounded-lg text-red-500 hover:bg-red-100 transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
          className="hidden"
        />

        {error && (
          <div className="mt-2 flex items-center gap-1 text-red-500">
            <AlertTriangle className="w-3 h-3" />
            <p className="text-[10px]">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== MULTI FILE UPLOAD COMPONENT ====================
interface MultiFileUploadProps {
  label: string;
  description?: string;
  accept: string;
  maxSize?: number;
  maxFiles?: number;
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  existingFiles?: { url: string; name: string; id?: string }[];
  onPreview?: (url: string, name: string, type: string) => void;
}

const MultiFileUpload: React.FC<MultiFileUploadProps> = ({
  label,
  description,
  accept,
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
  onFilesSelect,
  selectedFiles,
  existingFiles = [],
  onPreview,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (selectedFiles.length + existingFiles.length >= maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return false;
    }
    if (file.size > maxSize) {
      setError(`File "${file.name}" exceeds ${maxSize / 1024 / 1024}MB limit`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFilesChange = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(f => validateFile(f));
    if (validFiles.length !== newFiles.length) return;
    onFilesSelect([...selectedFiles, ...validFiles]);
  };

  const removeFile = (index: number) => {
    onFilesSelect(selectedFiles.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index: number, fileId?: string) => {
    // This would need API integration to delete existing files
    toast.info("Remove existing files via edit functionality");
  };

  const getFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  const totalFiles = existingFiles.length + selectedFiles.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-800">{label}</label>
            <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {totalFiles}/{maxFiles}
            </span>
          </div>
          {description && <p className="text-[10px] text-gray-500 mt-0.5">{description}</p>}
        </div>
        {totalFiles > 0 && (
          <button
            onClick={() => onFilesSelect([])}
            className="text-[10px] text-red-600 hover:text-red-700 flex items-center gap-0.5"
          >
            <Trash2 className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      <div
        className={`relative rounded-xl border-2 transition-all duration-200 ${
          dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFilesChange(e.dataTransfer.files);
        }}
      >
        <div className="p-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center py-3 px-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors"
          >
            <UploadCloud className="w-6 h-6 text-gray-400 mb-2" />
            <p className="text-xs text-gray-500 text-center">
              Click to upload or drag & drop
            </p>
            <p className="text-[9px] text-gray-400 mt-1">
              {accept.replace(/,/g, ', ')} • Max {maxSize / 1024 / 1024}MB each
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={accept}
            onChange={(e) => handleFilesChange(e.target.files)}
            className="hidden"
          />

          {error && (
            <div className="mt-2 flex items-center gap-1 text-red-500">
              <AlertTriangle className="w-3 h-3" />
              <p className="text-[10px]">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Existing Files List */}
      {existingFiles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">Current Files</p>
          {existingFiles.map((file, idx) => (
            <div key={file.id || idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-2 border border-gray-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-xs text-gray-700 truncate flex-1">{file.name}</span>
              </div>
              <div className="flex items-center gap-1">
                {onPreview && (
                  <button
                    onClick={() => onPreview(file.url, file.name, '')}
                    className="p-1 rounded text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => removeExistingFile(idx, file.id)}
                  className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors"
                  title="Remove"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium text-green-600 uppercase tracking-wide">New Files to Upload</p>
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between bg-green-50 rounded-lg p-2 border border-green-200">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-800 truncate">{file.name}</p>
                  <p className="text-[9px] text-gray-500">{getFileSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={() => removeFile(idx)}
                className="p-1 rounded text-red-500 hover:bg-red-100 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
export default function InstitutionProjectEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = usePromise(params);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { openPreview, PreviewComponent } = useDocumentPreview();
  const {
    selectedProject: project,
    loading,
    updating,
    submitting,
    success,
    error,
  } = useAppSelector((s: any) => s.institutionResearch);

  const [title, setTitle] = useState("");
  const [abstractText, setAbstractText] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState<string>("");
  const [fieldOfStudy, setFieldOfStudy] = useState("");
  const [keywords, setKeywords] = useState("");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [projectFile, setProjectFile] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [reworkNotes, setReworkNotes] = useState("");

  useEffect(() => {
    if (id) dispatch(fetchInstitutionProject(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setAbstractText(project.abstract || "");
      setFullDescription(project.full_description || "");
      setAcademicYear(project.academic_year || "");
      setSemester(project.semester || "");
      setFieldOfStudy(project.field_of_study || "");
      setKeywords((project.keywords || []).join(", "));
    }
  }, [project]);

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
  if (!project) return <div className="p-6 text-sm">Project not found.</div>;

  const isRework = project.status === "REWORK_REQUESTED";
  const canEdit = ["DRAFT", "REWORK_REQUESTED"].includes(project.status);

  if (!canEdit) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-sm text-yellow-800">
          This project cannot be edited at its current status ({project.status}).
        </div>
        <Link
          href={`/dashboard/user/institution-portal/projects/${id}`}
          className="text-xs text-[#0158B7] hover:underline mt-3 inline-block"
        >
          Back to project
        </Link>
      </div>
    );
  }

  const buildFormData = () => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("abstract", abstractText);
    fd.append("full_description", fullDescription);
    fd.append("academic_year", academicYear);
    if (semester) fd.append("semester", semester);
    fd.append("field_of_study", fieldOfStudy);
    if (keywords) {
      const kw = keywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      fd.append("keywords", JSON.stringify(kw));
    }
    if (coverImage) fd.append("cover_image", coverImage);
    if (projectFile) fd.append("project_file", projectFile);
    if (additionalFiles.length > 0)
      additionalFiles.forEach((f) => fd.append("additional_files", f));
    if (isRework && reworkNotes) fd.append("rework_response_notes", reworkNotes);
    return fd;
  };

  const handleSave = async () => {
    const res: any = await dispatch(
      updateInstitutionProject({ id, formData: buildFormData() })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      router.push(`/dashboard/user/institution-portal/projects/${id}`);
    }
  };

  const handleSaveAndSubmit = async () => {
    const res: any = await dispatch(
      updateInstitutionProject({ id, formData: buildFormData() })
    );
    if (res?.meta?.requestStatus === "fulfilled") {
      const sub: any = await dispatch(submitInstitutionProject(id));
      if (sub?.meta?.requestStatus === "fulfilled") {
        router.push(`/dashboard/user/institution-portal/projects/${id}`);
      }
    }
  };

  const handlePreview = (url: string, name: string, type: string) => {
    openPreview(url, name, type);
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <PreviewComponent />

      <Link
        href={`/dashboard/user/institution-portal/projects/${id}`}
        className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-[#0158B7] mb-4 transition-colors"
      >
        <ArrowLeft className="w-3 h-3" /> Back to project
      </Link>

      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isRework ? "📝 Address Rework Request" : "✏️ Edit Project"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {isRework
            ? "Review the feedback below, make necessary changes, and resubmit your project."
            : "Update your project details before submitting for review."}
        </p>
      </div>

      {/* Rework Feedback Alert */}
      {isRework && project.rework_reason && (
        <div className="mb-6 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-800 mb-1">Reviewer Feedback</h3>
              <p className="text-sm text-amber-700 whitespace-pre-wrap">{project.rework_reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-semibold text-gray-800">Project Information</h2>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          {/* Basic Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your project title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Field of Study <span className="text-red-500">*</span>
              </label>
              <input
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                placeholder="e.g., Computer Science, Engineering"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          {/* Academic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Academic Year
              </label>
              <input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2024-2025"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Semester
              </label>
              <select
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm bg-white"
              >
                <option value="">Select Semester</option>
                <option value="FIRST">First Semester</option>
                <option value="SECOND">Second Semester</option>
                <option value="THIRD">Third Semester</option>
              </select>
            </div>
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Keywords (comma separated)
            </label>
            <input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="machine learning, artificial intelligence, data science"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm"
            />
          </div>

          {/* Rich Text Editors */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Abstract <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              value={abstractText}
              onChange={setAbstractText}
              placeholder="Provide a brief summary of your research (150-300 words)..."
              className="min-h-[150px]"
            />
            <p className="text-[10px] text-gray-400 mt-1.5">
              Use the toolbar to format your abstract with headings, lists, and more
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Full Description
            </label>
            <RichTextEditor
              value={fullDescription}
              onChange={setFullDescription}
              placeholder="Provide comprehensive details about your research objectives, methodology, and expected outcomes..."
              className="min-h-[250px]"
            />
            <p className="text-[10px] text-gray-400 mt-1.5">
              Include research background, methodology, findings, and conclusions
            </p>
          </div>

          {/* Files Section */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <UploadCloud className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800">
                {isRework ? "Upload Revised Files" : "Project Files"}
              </h3>
              {isRework && (
                <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full">
                  New versions required
                </span>
              )}
            </div>

            <div className="space-y-4">
              {/* Main Project File */}
              <FileUploadCard
                label="Main Project Document"
                description="Upload your research paper, thesis, or project report"
                icon={FileText}
                accept=".pdf,.doc,.docx"
                maxSize={20 * 1024 * 1024}
                existingFile={project.project_file_url ? { url: project.project_file_url, name: "Current main document" } : undefined}
                onFileSelect={setProjectFile}
                selectedFile={projectFile}
                required={true}
                onPreview={handlePreview}
              />

              {/* Cover Image */}
              <FileUploadCard
                label="Cover Image"
                description="Optional thumbnail image for your project"
                icon={ImageIcon}
                accept=".jpg,.jpeg,.png,.gif,.webp"
                maxSize={5 * 1024 * 1024}
                existingFile={project.cover_image_url ? { url: project.cover_image_url, name: "Current cover image" } : undefined}
                onFileSelect={setCoverImage}
                selectedFile={coverImage}
                onPreview={handlePreview}
              />

              {/* Additional Files */}
              <MultiFileUpload
                label="Additional Files"
                description="Supporting documents, datasets, code, appendices, etc."
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.csv,.json"
                maxSize={20 * 1024 * 1024}
                maxFiles={10}
                onFilesSelect={setAdditionalFiles}
                selectedFiles={additionalFiles}
                existingFiles={(project.files || []).map((f: any) => ({ url: f.file_url, name: f.file_name, id: f.id }))}
                onPreview={handlePreview}
              />
            </div>
          </div>

          {/* Rework Notes */}
          {isRework && (
            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Response to Reviewer (Optional)
              </label>
              <textarea
                value={reworkNotes}
                onChange={(e) => setReworkNotes(e.target.value)}
                rows={3}
                placeholder="Briefly describe how you've addressed the reviewer's feedback..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-1.5">
                This helps reviewers understand the changes you've made
              </p>
            </div>
          )}
        </div>

        {/* Form Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-[11px] text-gray-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            All changes are saved as draft until you submit
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={updating}
              className="px-4 py-2 text-xs font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              {updating ? "Saving..." : "Save Draft"}
            </button>
            <button
              onClick={handleSaveAndSubmit}
              disabled={updating || submitting || !title.trim() || !abstractText.trim()}
              className="px-5 py-2 text-xs font-medium bg-[#0158B7] hover:bg-[#014a97] text-white rounded-lg disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              {isRework
                ? submitting
                  ? "Resubmitting..."
                  : "Save & Resubmit"
                : submitting
                ? "Submitting..."
                : "Save & Submit"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}