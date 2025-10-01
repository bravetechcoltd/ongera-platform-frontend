"use client";

import { useState } from "react";
import { X, Globe, Building2, CheckCircle, XCircle } from "lucide-react";

export type PublishAction = "PUBLISH" | "REJECT";
export type PublishVisibility = "INSTITUTION_ONLY" | "PUBLIC";

export default function PublishDecisionModal({
  open,
  onClose,
  onSubmit,
  projectTitle,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    action: PublishAction;
    visibility?: PublishVisibility;
    notes: string;
  }) => Promise<void> | void;
  projectTitle: string;
}) {
  const [action, setAction] = useState<PublishAction>("PUBLISH");
  const [visibility, setVisibility] = useState<PublishVisibility>("INSTITUTION_ONLY");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await onSubmit({
        action,
        visibility: action === "PUBLISH" ? visibility : undefined,
        notes,
      });
      setNotes("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              Final Publication Decision
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{projectTitle}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 mb-2 block uppercase tracking-wide">
              Decision
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAction("PUBLISH")}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  action === "PUBLISH"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle
                    className={`w-4 h-4 ${
                      action === "PUBLISH" ? "text-green-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-900">Publish</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Approve and publish this research project
                </p>
              </button>
              <button
                type="button"
                onClick={() => setAction("REJECT")}
                className={`p-3 border-2 rounded-lg text-left transition-all ${
                  action === "REJECT"
                    ? "border-red-500 bg-red-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <XCircle
                    className={`w-4 h-4 ${
                      action === "REJECT" ? "text-red-600" : "text-gray-400"
                    }`}
                  />
                  <span className="text-sm font-semibold text-gray-900">Reject</span>
                </div>
                <p className="text-[11px] text-gray-600">
                  Reject the project — pipeline halts
                </p>
              </button>
            </div>
          </div>

          {action === "PUBLISH" && (
            <div>
              <label className="text-xs font-semibold text-gray-700 mb-2 block uppercase tracking-wide">
                Publication Visibility
              </label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility("INSTITUTION_ONLY")}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    visibility === "INSTITUTION_ONLY"
                      ? "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        visibility === "INSTITUTION_ONLY"
                          ? "bg-indigo-100"
                          : "bg-gray-100"
                      }`}
                    >
                      <Building2
                        className={`w-4 h-4 ${
                          visibility === "INSTITUTION_ONLY"
                            ? "text-indigo-700"
                            : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        Publish as Private (Institution Only)
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Visible only to members of this institution. Not discoverable on the
                        public research catalog.
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setVisibility("PUBLIC")}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    visibility === "PUBLIC"
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        visibility === "PUBLIC" ? "bg-teal-100" : "bg-gray-100"
                      }`}
                    >
                      <Globe
                        className={`w-4 h-4 ${
                          visibility === "PUBLIC" ? "text-teal-700" : "text-gray-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">
                        Publish as Public
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Discoverable through the public research catalog. A linked public
                        research entry will be created automatically.
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 mb-1 block uppercase tracking-wide">
              {action === "PUBLISH" ? "Publication notes (optional)" : "Reason for rejection"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder={
                action === "PUBLISH"
                  ? "Add any notes for the students, instructors or supervisor..."
                  : "Explain clearly why this project is being rejected..."
              }
              className="w-full border border-gray-300 rounded p-2 text-sm"
            />
          </div>
        </div>

        <div className="p-4 border-t flex justify-end gap-2 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy || (action === "REJECT" && !notes.trim())}
            className={`px-4 py-1.5 text-xs text-white rounded disabled:opacity-50 ${
              action === "PUBLISH"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {busy
              ? "Processing..."
              : action === "PUBLISH"
              ? visibility === "PUBLIC"
                ? "Publish as Public"
                : "Publish as Private"
              : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}
