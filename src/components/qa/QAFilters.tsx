"use client"

import { X } from "lucide-react"

const CATEGORIES = [
  "Health Sciences",
  "Technology & Engineering",
  "Agriculture",
  "Natural Sciences",
  "Social Sciences",
  "Business & Economics",
  "Education",
  "Arts & Humanities"
]

interface QAFiltersProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  onClear: () => void
}

export default function QAFilters({ 
  selectedCategory, 
  onCategoryChange, 
  onClear 
}: QAFiltersProps) {
  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900">Filter by Category</h3>
        {selectedCategory && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category === selectedCategory ? "" : category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? "bg-emerald-500 text-white shadow-md"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  )
}