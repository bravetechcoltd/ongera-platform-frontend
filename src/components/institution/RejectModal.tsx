"use client";

import { useState } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function RejectModal({
  open,
  onClose,
  onSubmit,
  title = "Reject Project",
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (feedback: string) => Promise<void>;
  title?: string;
}) {
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!feedback.trim() || feedback.trim().length < 10) {
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(feedback.trim());
      setFeedback("");
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const isValid = feedback.trim().length >= 10;

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-xs text-red-800">
              Please provide detailed feedback explaining why this project is being rejected.
              This will help the student understand the decision and improve their work.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              placeholder="Provide detailed feedback explaining why the project is being rejected (minimum 10 characters)..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-[10px] text-gray-500">
                Minimum 10 characters required
              </p>
              <p className={`text-[10px] ${feedback.trim().length >= 10 ? 'text-green-600' : 'text-red-500'}`}>
                {feedback.trim().length}/10 characters
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              isValid && !submitting
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {submitting ? "Submitting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}