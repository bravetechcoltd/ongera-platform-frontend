"use client"

import {
  Heart, Code, Leaf, Microscope, Users as UsersIcon,
  Briefcase, GraduationCap, BookOpen, X
} from "lucide-react"

const CATEGORIES = [
  { value: "Health Sciences", icon: Heart, color: "red" },
  { value: "Technology & Engineering", icon: Code, color: "blue" },
  { value: "Agriculture", icon: Leaf, color: "green" },
  { value: "Natural Sciences", icon: Microscope, color: "purple" },
  { value: "Social Sciences", icon: UsersIcon, color: "orange" },
  { value: "Business & Economics", icon: Briefcase, color: "teal" },
  { value: "Education", icon: GraduationCap, color: "indigo" },
  { value: "Arts & Humanities", icon: BookOpen, color: "pink" }
]

interface CommunityFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onClear: () => void
}

export default function CommunityFilters({
  selectedCategory,
  onCategoryChange,
  onClear
}: CommunityFiltersProps) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Filter by Category</h3>
        {selectedCategory && (
          <button
            onClick={onClear}
            className="text-xs font-medium text-gray-600 hover:text-red-600 flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CATEGORIES.map((category) => {
          const Icon = category.icon
          const isSelected = selectedCategory === category.value
          const colorClasses = {
            red: "from-red-500 to-pink-500 border-red-500 bg-red-50",
            blue: "from-blue-500 to-cyan-500 border-blue-500 bg-blue-50",
            green: "from-green-500 to-emerald-500 border-green-500 bg-green-50",
            purple: "from-purple-500 to-indigo-500 border-purple-500 bg-purple-50",
            orange: "from-orange-500 to-amber-500 border-orange-500 bg-orange-50",
            teal: "from-teal-500 to-cyan-500 border-teal-500 bg-teal-50",
            indigo: "from-indigo-500 to-purple-500 border-indigo-500 bg-indigo-50",
            pink: "from-pink-500 to-rose-500 border-pink-500 bg-pink-50"
          }

          return (
            <button
              key={category.value}
              onClick={() => onCategoryChange(isSelected ? "" : category.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? `${colorClasses[category.color as keyof typeof colorClasses]} shadow-lg scale-105`
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
              }`}
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br ${
                CATEGORIES.find(c => c.value === category.value)?.color === category.color
                  ? `from-${category.color}-500 to-${category.color}-600`
                  : "from-gray-400 to-gray-500"
              } mb-2 shadow-md`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                {category.value}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}