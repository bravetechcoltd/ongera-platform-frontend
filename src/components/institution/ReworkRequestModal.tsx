"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function ReworkRequestModal({
  open,
  onClose,
  onSubmit,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string, commentType: string, priority: string) => Promise<void> | void;
  title: string;
}) {
  const [feedback, setFeedback] = useState("");
  const [commentType, setCommentType] = useState("GENERAL");
  const [priority, setPriority] = useState("MEDIUM");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!feedback.trim()) return;
    setBusy(true);
    try {
      await onSubmit(feedback, commentType, priority);
      setFeedback("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Detailed comment explaining what needs to be changed
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              className="w-full border border-gray-300 rounded p-2 text-sm"
              placeholder="Describe precisely what needs revision..."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Comment Type
              </label>
              <select
                value={commentType}
                onChange={(e) => setCommentType(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="GENERAL">General</option>
                <option value="METHODOLOGY">Methodology</option>
                <option value="LITERATURE">Literature</option>
                <option value="RESULTS">Results</option>
                <option value="FORMATTING">Formatting</option>
                <option value="CITATION">Citation</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block">
                Urgency
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs border border-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!feedback.trim() || busy}
            className="px-3 py-1.5 text-xs bg-orange-600 text-white rounded disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Request Rework"}
          </button>
        </div>
      </div>
    </div>
  );
}
