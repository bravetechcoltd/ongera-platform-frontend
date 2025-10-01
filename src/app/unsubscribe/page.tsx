"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Mail, X, CheckCircle, Loader2, ArrowLeft, BellOff } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import SharedNavigation from '@/components/layout/Navigation'
import api from '@/lib/api'

export default function UnsubscribePage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const router = useRouter()

  // Pre-fill email from query parameter if available
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  if (!email) {
    setStatus('error')
    setMessage('Please enter your email address')
    return
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    setStatus('error')
    setMessage('Please enter a valid email address')
    return
  }

  setIsSubmitting(true)
  setStatus('idle')
  setMessage('')

  try {
    // ✅ Use your Axios API instance instead of fetch
    const credentials = { email }
    const response = await api.post('/subscribe/unsubscribe', credentials) 

    if (response.data && response.data.success) {
      setStatus('success')
      setMessage(
        'You have been successfully unsubscribed from all Bwenge notifications.'
      )
    } else {
      setStatus('error')
      setMessage(
        response.data?.message || 'Unsubscribe failed. Please try again.'
      )
    }
  } catch (error: any) {
    console.error('Unsubscribe error:', error)
    setStatus('error')
    setMessage(
      error.response?.data?.message ||
        'Network error. Please check your connection and try again.'
    )
  } finally {
    setIsSubmitting(false)
  }
}


  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FA] via-white to-[#F8F9FA]">
      <SharedNavigation />
      
      {/* Main Content */}
      <main className="pt-24 pb-16">
        <div className="max-w-md mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0158B7] to-[#0362C3] p-6 text-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <BellOff className="w-8 h-8 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Unsubscribe
              </h1>
              <p className="text-white/90 text-sm">
                We're sorry to see you go
              </p>
            </div>

            {/* Form Section */}
            <div className="p-6">
              {status === 'success' ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </motion.div>
                  
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Unsubscribed Successfully
                  </h2>
                  
                  <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                    {message}
                  </p>

                  <div className="space-y-3">
                    <p className="text-xs text-gray-500">
                      You will no longer receive:
                    </p>
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        New research project notifications
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Community updates
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        Event announcements
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <Link
                      href="/"
                      className="block w-full bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
                    >
                      Return to Homepage
                    </Link>
                    <button
                      onClick={() => {
                        setStatus('idle')
                        setEmail('')
                        setMessage('')
                      }}
                      className="block w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all text-sm"
                    >
                      Unsubscribe Another Email
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="text-center mb-6">
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Enter your email address to unsubscribe from all Bwenge platform notifications, including research projects, communities, and events.
                    </p>
                  </div>

                  {/* Error Message */}
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3"
                    >
                      <X className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-700 text-sm">{message}</p>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                          disabled={isSubmitting}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Unsubscribing...
                        </>
                      ) : (
                        <>
                          <BellOff className="w-4 h-4" />
                          Unsubscribe
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="text-center">
                      <p className="text-gray-500 text-xs mb-3">
                        What you'll stop receiving:
                      </p>
                      <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          New research project publications
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Community creation announcements
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                          Event and workshop notifications
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <Link
                      href="/"
                      className="inline-flex items-center gap-2 text-sm text-[#0158B7] hover:text-[#0362C3] transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Homepage
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Having trouble?{' '}
                <a 
                  href="mailto:support@bwenge.rw" 
                  className="text-[#0158B7] hover:text-[#0362C3] transition-colors"
                >
                  Contact support
                </a>
              </p>
            </div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center"
          >
            <p className="text-xs text-gray-500">
              Changed your mind? You can resubscribe anytime through our newsletter section.
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  )
}