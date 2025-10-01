// @ts-nocheck
"use client";

import { useEffect, useState, use as usePromise } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Loader2,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  acceptSupervisorInvitation,
  clearIndustrialMessages,
} from "@/lib/features/auth/industrialSupervisorSlice";

export default function SupervisorInvitationAcceptPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = usePromise(params);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((s: any) => s.auth);
  const { accepting, success, error } = useAppSelector(
    (s: any) => s.industrialSupervisor
  );
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (success) {
      toast.success(success);
      setAccepted(true);
      dispatch(clearIndustrialMessages());
    }
    if (error) {
      toast.error(error);
      dispatch(clearIndustrialMessages());
    }
  }, [success, error, dispatch]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in first to accept this invitation.");
      router.push(
        `/auth/login?redirect=/dashboard/user/institution-portal/supervisor-invitation/${token}`
      );
      return;
    }
    await dispatch(acceptSupervisorInvitation(token));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full overflow-hidden">
        <div className="bg-gradient-to-r from-[#0158B7] to-blue-700 p-6 text-white text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold">Industrial Supervisor Invitation</h1>
          <p className="text-sm text-blue-100 mt-1">
            You've been invited to review research projects
          </p>
        </div>

        <div className="p-6">
          {accepted ? (
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Invitation Accepted
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                You're now an industrial supervisor. Head to the portal to view
                projects assigned to you.
              </p>
              <Link
                href="/dashboard/user/institution-portal"
                className="inline-flex items-center gap-1 px-4 py-2 bg-[#0158B7] hover:bg-[#014a97] text-white text-sm rounded"
              >
                Go to Institution Portal <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-700 mb-3">
                As an <strong>Industrial Supervisor</strong> you will:
              </p>
              <ul className="space-y-2 mb-5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Review student research projects at Stage 2</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Provide structured feedback, approve or request rework
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>
                    Guide students before their project moves to instructor
                    review
                  </span>
                </li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-800 mb-5 inline-flex items-start gap-2">
                <Building2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>
                  You'll see student projects and gain access to the Institution
                  Research Portal once you accept.
                </span>
              </div>

              <button
                onClick={handleAccept}
                disabled={accepting}
                className="w-full px-4 py-2.5 bg-[#0158B7] hover:bg-[#014a97] text-white text-sm font-medium rounded inline-flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {accepting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" /> Accept Invitation
                  </>
                )}
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full mt-2 px-4 py-2 text-xs text-gray-600 hover:text-gray-800"
              >
                Decline and return home
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
