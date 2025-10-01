"use client";

import { GraduationCap, BookOpen, ScrollText, Banknote } from "lucide-react";
import type { InstitutionProjectType } from "@/lib/features/auth/institutionResearchSlice";

const OPTIONS: Array<{
  value: InstitutionProjectType;
  title: string;
  description: string;
  Icon: any;
  color: string;
}> = [
  {
    value: "BACHELORS",
    title: "Bachelor's Research Project",
    description: "Undergraduate research project",
    Icon: GraduationCap,
    color: "border-sky-300 bg-sky-50 text-sky-700",
  },
  {
    value: "MASTERS_THESIS",
    title: "Master's Thesis",
    description: "Graduate-level master's thesis",
    Icon: BookOpen,
    color: "border-indigo-300 bg-indigo-50 text-indigo-700",
  },
  {
    value: "DISSERTATION",
    title: "PhD Dissertation",
    description: "Doctoral-level dissertation",
    Icon: ScrollText,
    color: "border-purple-300 bg-purple-50 text-purple-700",
  },
  {
    value: "FUNDS",
    title: "Funds Research",
    description: "Funded institutional research project",
    Icon: Banknote,
    color: "border-emerald-300 bg-emerald-50 text-emerald-700",
  },
];

export default function ProjectTypeSelector({
  value,
  onChange,
}: {
  value?: InstitutionProjectType;
  onChange: (v: InstitutionProjectType) => void;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {OPTIONS.map((o) => {
        const Icon = o.Icon;
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`text-left p-4 border-2 rounded-lg transition-all ${
              selected
                ? `${o.color} border-current shadow-sm`
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  selected ? "bg-white" : "bg-gray-100"
                }`}
              >
                <Icon className={`w-5 h-5 ${selected ? "text-current" : "text-gray-600"}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{o.title}</div>
                <div className="text-xs text-gray-600 mt-0.5">{o.description}</div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
