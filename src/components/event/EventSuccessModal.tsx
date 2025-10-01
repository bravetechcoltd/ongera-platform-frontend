import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Eye, Share2, Users, Calendar, X, ArrowRight } from 'lucide-react'

interface EventSuccessModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  status: 'Published' | 'Draft'
}

export default function EventSuccessModal({ isOpen, onClose, eventId, status }: EventSuccessModalProps) {
  const router = useRouter()
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  const nextActions = [
    {
      id: 'preview',
      icon: Eye,
      title: 'View Event Details',
      description: 'See how your event looks to attendees',
      color: 'from-blue-500 to-cyan-500',
      action: () => router.push(`/dashboard/user/event/${eventId}`)
    },
    {
      id: 'share',
      icon: Share2,
      title: 'Share in Communities',
      description: 'Let relevant communities know about your event',
      color: 'from-purple-500 to-pink-500',
      action: () => router.push(`/dashboard/user/communities?share_event=${eventId}`)
    },
    {
      id: 'manage',
      icon: Calendar,
      title: 'Manage Event',
      description: 'Add agenda items and manage attendees',
      color: 'from-emerald-500 to-teal-500',
      action: () => router.push(`/dashboard/user/event/manage/${eventId}`)
    },
    {
      id: 'discover',
      icon: Users,
      title: 'Invite Attendees',
      description: 'Find and invite researchers to your event',
      color: 'from-orange-500 to-red-500',
      action: () => router.push(`/dashboard/user/network?invite_event=${eventId}`)
    }
  ]

  if (!isOpen) return null

  const handleContinue = () => {
    const action = nextActions.find(a => a.id === selectedAction)
    if (action) {
      action.action()
    } else {
      onClose()
      router.push('/dashboard/user/event')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Success Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 px-8 py-12 text-white text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">
            {status === 'Published' ? 'Event Created Successfully!' : 'Event Saved as Draft!'}
          </h2>
          <p className="text-blue-50 text-sm">
            {status === 'Published' 
              ? 'Your event is now live and ready for registrations'
              : 'Your event has been saved. Publish when you\'re ready!'}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              What's Next?
            </h3>
            <p className="text-sm text-gray-600">
              Choose how you'd like to continue
            </p>
          </div>

          {/* Action Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {nextActions.map((action) => {
              const Icon = action.icon
              const isSelected = selectedAction === action.id
              
              return (
                <button
                  key={action.id}
                  onClick={() => setSelectedAction(action.id)}
                  className={`relative p-5 rounded-xl border-2 transition-all duration-200 text-left group ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 shadow-lg scale-105'
                      : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${action.color} mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  <h4 className="font-bold text-gray-900 mb-2 text-base">
                    {action.title}
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {action.description}
                  </p>

                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {/* Quick Stats */}
          {status === 'Published' && (
            <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Event is Now Live
                  </h4>
                  <p className="text-sm text-blue-700 mb-3">
                    Your event is visible to all users. Start promoting it in communities and to your network.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                      Registration Open
                    </span>
                    <span className="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                      0 Registered
                    </span>
                    <span className="px-3 py-1.5 bg-white text-blue-700 rounded-lg text-xs font-medium border border-blue-200">
                      Public Event
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose()
                router.push('/dashboard/user/event')
              }}
              className="px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Go to My Events
            </button>

            <button
              onClick={handleContinue}
              disabled={!selectedAction}
              className={`px-8 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
                selectedAction
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}