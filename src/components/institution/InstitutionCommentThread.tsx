"use client";

import { useState } from "react";
import {
  CheckCircle,
  MessageSquare,
  Reply,
  AlertTriangle,
  Flame,
  Circle,
  Book,
  FileText,
  Quote,
  BarChart,
  Type,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  addProjectComment,
  toggleCommentResolved,
} from "@/lib/features/auth/institutionResearchSlice";

const TYPE_META: Record<string, { label: string; Icon: any; color: string }> = {
  GENERAL: { label: "General", Icon: MessageSquare, color: "bg-gray-100 text-gray-700" },
  METHODOLOGY: { label: "Methodology", Icon: BarChart, color: "bg-blue-100 text-blue-700" },
  LITERATURE: { label: "Literature", Icon: Book, color: "bg-purple-100 text-purple-700" },
  RESULTS: { label: "Results", Icon: FileText, color: "bg-emerald-100 text-emerald-700" },
  FORMATTING: { label: "Formatting", Icon: Type, color: "bg-amber-100 text-amber-700" },
  CITATION: { label: "Citation", Icon: Quote, color: "bg-rose-100 text-rose-700" },
};

const PRIORITY_META: Record<string, { label: string; Icon: any; color: string }> = {
  LOW: { label: "Low", Icon: Circle, color: "text-gray-500" },
  MEDIUM: { label: "Medium", Icon: AlertTriangle, color: "text-amber-500" },
  HIGH: { label: "High", Icon: AlertTriangle, color: "text-orange-500" },
  CRITICAL: { label: "Critical", Icon: Flame, color: "text-red-500" },
};

export default function InstitutionCommentThread({
  projectId,
  comments,
  canResolve,
}: {
  projectId: string;
  comments: any[];
  canResolve: boolean;
}) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s: any) => s.auth);

  const [content, setContent] = useState("");
  const [commentType, setCommentType] = useState("GENERAL");
  const [priority, setPriority] = useState("MEDIUM");
  const [pageRef, setPageRef] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const submit = async () => {
    if (!content.trim()) return;
    await dispatch(
      addProjectComment({
        id: projectId,
        payload: {
          content,
          comment_type: commentType,
          priority,
          page_reference: pageRef || undefined,
        },
      })
    );
    setContent("");
    setPageRef("");
  };

  const sendReply = async (parentId: string) => {
    if (!replyText.trim()) return;
    await dispatch(
      addProjectComment({
        id: projectId,
        payload: { content: replyText, parent_comment_id: parentId },
      })
    );
    setReplyText("");
    setReplyingTo(null);
  };

  const renderComment = (c: any, depth = 0) => {
    const tm = TYPE_META[c.comment_type] || TYPE_META.GENERAL;
    const pm = PRIORITY_META[c.priority] || PRIORITY_META.MEDIUM;
    const TypeIcon = tm.Icon;
    const PriorityIcon = pm.Icon;
    return (
      <div key={c.id} className={`${depth > 0 ? "ml-6 border-l-2 border-gray-100 pl-3" : ""}`}>
        <div
          className={`bg-white border rounded-lg p-3 mb-2 ${
            c.is_resolved ? "border-green-200 bg-green-50/30" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="w-7 h-7 rounded-full bg-[#0158B7] text-white flex items-center justify-center text-[10px] font-bold">
              {(c.author?.first_name?.[0] || "") + (c.author?.last_name?.[0] || "")}
            </div>
            <div className="text-xs font-medium text-gray-800">
              {c.author?.first_name} {c.author?.last_name}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${tm.color} inline-flex items-center gap-1`}>
              <TypeIcon className="w-3 h-3" /> {tm.label}
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium ${pm.color}`}>
              <PriorityIcon className="w-3 h-3" /> {pm.label}
            </span>
            {c.page_reference && (
              <span className="text-[10px] text-gray-500">
                Ref: {c.page_reference}
              </span>
            )}
            <span className="text-[10px] text-gray-400 ml-auto">
              {new Date(c.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap">{c.content}</div>

          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)}
              className="text-xs text-[#0158B7] hover:underline inline-flex items-center gap-1"
            >
              <Reply className="w-3 h-3" /> Reply
            </button>
            {canResolve && (
              <button
                onClick={() => dispatch(toggleCommentResolved({ id: projectId, commentId: c.id }))}
                className={`text-xs inline-flex items-center gap-1 ${
                  c.is_resolved ? "text-green-700" : "text-gray-600 hover:text-green-700"
                }`}
              >
                <CheckCircle className="w-3 h-3" />
                {c.is_resolved ? "Resolved — click to reopen" : "Mark as Addressed"}
              </button>
            )}
          </div>

          {replyingTo === c.id && (
            <div className="mt-2 flex gap-2">
              <input
                className="flex-1 border border-gray-300 rounded px-2 py-1 text-xs"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write reply..."
              />
              <button
                onClick={() => sendReply(c.id)}
                className="px-3 py-1 bg-[#0158B7] text-white rounded text-xs"
              >
                Send
              </button>
            </div>
          )}
        </div>

        {(c.replies || []).map((r: any) => renderComment(r, depth + 1))}
      </div>
    );
  };

  return (
    <div>
      <div className="bg-white border border-gray-200 rounded-lg p-3 mb-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Add a comment</div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          placeholder="Leave structured feedback on this project..."
          className="w-full border border-gray-300 rounded p-2 text-sm"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
          <select
            value={commentType}
            onChange={(e) => setCommentType(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs"
          >
            {Object.entries(TYPE_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-xs"
          >
            {Object.entries(PRIORITY_META).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
          <input
            value={pageRef}
            onChange={(e) => setPageRef(e.target.value)}
            placeholder="Page / section (optional)"
            className="border border-gray-300 rounded px-2 py-1 text-xs"
          />
        </div>
        <div className="mt-2 flex justify-end">
          <button
            onClick={submit}
            disabled={!content.trim()}
            className="px-3 py-1.5 bg-[#0158B7] text-white text-xs rounded disabled:opacity-50"
          >
            Post Comment
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {(comments || []).length === 0 && (
          <div className="text-sm text-gray-500 italic">No comments yet.</div>
        )}
        {(comments || []).map((c: any) => renderComment(c))}
      </div>
    </div>
  );
}
