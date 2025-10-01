
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  X, 
  Upload, 
  Users, 
  Calendar, 
  Search,
  ArrowRight,
  CheckCircle2
} from "lucide-react"

interface OnboardingModalProps {
  onClose: () => void
  accountType: string
}

type OnboardingStep = {
  id: string
  title: string
  description: string
  icon: any
  action: string
  href: string
  recommended: boolean
}

export default function OnboardingModal({ onClose, accountType }: OnboardingModalProps) {
  const router = useRouter()
  const [selectedStep, setSelectedStep] = useState<string | null>(null)

  const getOnboardingSteps = (): OnboardingStep[] => {
    const baseSteps: OnboardingStep[] = [
      {
        id: 'upload-project',
        title: 'Upload Your First Research Project',
        description: 'Share your research with the community and get feedback from peers',
        icon: Upload,
        action: 'Upload Project',
        href: '/dashboard/user/research/upload',
        recommended: true
      },
      {
        id: 'join-communities',
        title: 'Join Research Communities',
        description: 'Connect with researchers in your field and participate in discussions',
        icon: Users,
        action: 'Browse Communities',
        href: '/dashboard/user/communities',
        recommended: true
      },
      {
        id: 'browse-events',
        title: 'Browse Upcoming Events',
        description: 'Discover conferences, workshops, and seminars in your research area',
        icon: Calendar,
        action: 'View Events',
        href: '/dashboard/user/events',
        recommended: false
      },
      {
        id: 'explore-researchers',
        title: 'Explore Other Researchers',
        description: 'Find and connect with researchers who share your interests',
        icon: Search,
        action: 'Find Researchers',
        href: '/dashboard/user/network',
        recommended: false
      }
    ]

    // Customize steps based on account type
    if (accountType === 'Institution') {
      return baseSteps.map(step => 
        step.id === 'upload-project' 
          ? {
              ...step,
              title: 'Create Your First Event',
              description: 'Organize conferences, workshops or seminars for the research community',
              icon: Calendar,
              action: 'Create Event',
              href: '/dashboard/user/events/create'
            }
          : step
      )
    }

    return baseSteps
  }

  const steps = getOnboardingSteps()

  const handleActionClick = (step: OnboardingStep) => {
    setSelectedStep(step.id)
    setTimeout(() => {
      router.push(step.href)
      onClose()
    }, 500)
  }

  const handleSkipTour = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-200" />
            <h2 className="text-2xl font-bold mb-2">
              Welcome to Your Research Hub!
            </h2>
            <p className="text-emerald-100">
              What would you like to do first? Choose an action to get started.
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {steps.map((step) => {
              const Icon = step.icon
              const isSelected = selectedStep === step.id
              
              return (
                <div
                  key={step.id}
                  className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50'
                      : step.recommended
                      ? 'border-emerald-200 bg-white hover:border-emerald-300 hover:bg-emerald-25'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleActionClick(step)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg ${
                      step.recommended ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {step.recommended && (
                      <span className="px-2 py-1 bg-emerald-500 text-white text-xs rounded-full font-medium">
                        Recommended
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      step.recommended ? 'text-emerald-600' : 'text-gray-600'
                    }`}>
                      {step.action}
                    </span>
                    <ArrowRight className={`w-4 h-4 ${
                      step.recommended ? 'text-emerald-600' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              You can always access these options from the sidebar
            </p>
            <button
              onClick={handleSkipTour}
              className="px-4 py-2 text-gray-600 hover:text-gray-700 font-medium transition-colors"
            >
              Skip Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}