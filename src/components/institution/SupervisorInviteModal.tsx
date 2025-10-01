"use client";

import { useState } from "react";
import { X, Mail, Building2, User, Briefcase, Send } from "lucide-react";

export default function SupervisorInviteModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    email: string;
    first_name: string;
    last_name: string;
    organization?: string;
    position?: string;
    message?: string;
  }) => Promise<void> | void;
}) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const canSubmit = email.trim() && firstName.trim() && lastName.trim();

  const submit = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      await onSubmit({
        email: email.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        organization: organization.trim() || undefined,
        position: position.trim() || undefined,
        message: message.trim() || undefined,
      });
      setEmail("");
      setFirstName("");
      setLastName("");
      setOrganization("");
      setPosition("");
      setMessage("");
      onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5 text-[#0158B7]" />
            <h3 className="text-base font-semibold text-gray-900">
              Invite Industrial Supervisor
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <p className="text-xs text-gray-600 bg-blue-50 border border-blue-200 rounded p-2">
            The supervisor will receive a secure invitation link by email. Once they accept,
            they can be assigned to guide students working on institutional research projects.
          </p>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block inline-flex items-center gap-1">
              <Mail className="w-3 h-3" /> Email address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="supervisor@company.com"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block inline-flex items-center gap-1">
                <User className="w-3 h-3" /> First name *
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block inline-flex items-center gap-1">
                <User className="w-3 h-3" /> Last name *
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block inline-flex items-center gap-1">
                <Building2 className="w-3 h-3" /> Organization
              </label>
              <input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                placeholder="Company name"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 mb-1 block inline-flex items-center gap-1">
                <Briefcase className="w-3 h-3" /> Position
              </label>
              <input
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Senior Engineer"
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Personal message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="We'd like to invite you to supervise research students at our institution..."
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
            disabled={!canSubmit || busy}
            className="px-4 py-1.5 text-xs bg-[#0158B7] hover:bg-[#014a97] text-white rounded disabled:opacity-50 inline-flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            {busy ? "Sending invitation..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}
