"use client"

import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, ArrowRight, Sparkles, X } from "lucide-react"
import { useState } from "react"

interface ProfileCompletionBannerProps {
  percentage: number
  missing: string[]
}

export default function ProfileCompletionBanner({ percentage, missing }: ProfileCompletionBannerProps) {
  const router = useRouter()
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) {
    return null
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 80) return "bg-emerald-500"
    if (percent >= 60) return "bg-yellow-500"
    return "bg-yellow-500"
  }

  const handleComplete = () => {
    router.push('/dashboard/user/profile/edit')
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    // Optionally save dismissal state to localStorage
    localStorage.setItem('profileBannerDismissed', 'true')
  }

  return (
    <div className="relative group">
      {/* Main Banner */}
      <div className="relative bg-yellow-50 border border-yellow-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-300">
        
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-yellow-100 rounded-full transition-colors z-10"
          aria-label="Dismiss"
        >
          <X className="w-3 h-3 text-yellow-600" />
        </button>

        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className="relative flex-shrink-0">
            <div className="relative p-2 bg-yellow-500 rounded-full shadow-sm">
              {percentage === 100 ? (
                <Sparkles className="w-4 h-4 text-white" />
              ) : (
                <AlertCircle className="w-4 h-4 text-white" />
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Profile {percentage}% Complete
                </h3>
                <div className={`w-2 h-2 rounded-full ${
                  percentage === 100 ? 'bg-emerald-400' : 'bg-yellow-400'
                } animate-pulse`} />
              </div>
              
              {/* Complete Button */}
              <button
                onClick={handleComplete}
                className="relative flex items-center gap-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <span>Complete</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="relative w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                <div 
                  className={`h-1 rounded-full ${getProgressColor(percentage)} transition-all duration-1000 ease-out relative`}
                  style={{ width: `${percentage}%` }}
                >
                  {/* Progress indicator dot */}
                  {percentage < 100 && (
                    <div className="absolute right-0 top-1/2 w-1.5 h-1.5 bg-white border border-yellow-600 rounded-full -mt-0.75 shadow-sm" />
                  )}
                </div>
              </div>
            </div>

            {/* Missing Items */}
            {missing.length > 0 && percentage < 100 && (
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                  {missing.length} items remaining:
                </span>
                <div className="flex gap-1">
                  {missing.slice(0, 4).map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center gap-1 px-2 py-0.5 bg-yellow-100 rounded border border-yellow-200 hover:bg-yellow-200 transition-all duration-200"
                    >
                      <CheckCircle2 className="w-3 h-3 text-yellow-600 flex-shrink-0" />
                      <span className="text-xs text-yellow-800 whitespace-nowrap capitalize">
                        {item.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                  {missing.length > 4 && (
                    <div className="flex items-center px-2 py-0.5 bg-yellow-200 rounded border border-yellow-300">
                      <span className="text-xs text-yellow-800 font-medium">
                        +{missing.length - 4}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Success State */}
            {percentage === 100 && (
              <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-emerald-700 font-medium">
                  Profile Complete! 🎉
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}