// @ts-nocheck
"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { verifyEmail, resendVerificationOTP, clearError } from '@/lib/features/auth/auth-slice'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  Mail, AlertCircle, Loader2, CheckCircle, RefreshCw, Shield, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Floating Particles Component (same as ChangePasswordForm)
function FloatingParticles() {
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={{
            y: [-10, -50],
            opacity: [0, 1, 1, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

// Separate component that uses useSearchParams
function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, isAuthenticated, verificationEmail, user } = useSelector((state: RootState) => state.auth)

  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [resending, setResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    } else if (verificationEmail) {
      setEmail(verificationEmail)
    } else {
      router.push('/login')
    }
  }, [searchParams, verificationEmail, router])

  useEffect(() => {
    if (isAuthenticated && user?.is_verified) {
      const dashboard = user.account_type === 'admin' ? '/dashboard/admin' : '/dashboard'
      setTimeout(() => router.push(dashboard), 1500)
    }
  }, [isAuthenticated, user, router])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (!/^\d+$/.test(pastedData)) return

    const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
    setOtp(newOtp)

    const nextEmptyIndex = newOtp.findIndex(digit => !digit)
    if (nextEmptyIndex !== -1) {
      otpRefs.current[nextEmptyIndex]?.focus()
    }
  }

  const handleResendOTP = async () => {
    setResending(true)
    try {
      await dispatch(resendVerificationOTP(email)).unwrap()
      setResendCooldown(60)
      setSuccessMessage('Verification code resent successfully!')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      console.error('Failed to resend OTP:', err)
    } finally {
      setResending(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.some(digit => !digit)) {
      return
    }

    const otpString = otp.join('')
    try {
      await dispatch(verifyEmail({ email, otp: otpString })).unwrap()
      setSuccessMessage('Email verified successfully! Redirecting...')
    } catch (err) {
      console.error('Verification failed:', err)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center p-3 lg:p-4 relative overflow-hidden">
      {/* Crescent Background Layers */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute right-[-15%] top-[15%] w-[50%] h-[60%] opacity-25"
          style={{
            clipPath: 'ellipse(40% 50% at 100% 50%)',
            background: '#0362C3',
            transform: 'rotate(-20deg)'
          }}
          animate={{
            y: [0, 15, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute left-[-10%] bottom-[10%] w-[45%] h-[55%] opacity-20"
          style={{
            clipPath: 'circle(50% at 0% 100%)',
            background: '#5E96D2',
            transform: 'rotate(30deg)'
          }}
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
      </div>

      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden p-5 md:p-6 lg:p-7 border border-white/20">
          
          <Link href="/login" className="inline-flex items-center text-gray-600 hover:text-[#0158B7] mb-3 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Link>

          {/* Header */}
          <div className="mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-12 h-12 bg-[#0158B7] rounded-xl flex items-center justify-center mb-3"
              whileHover={{ rotate: 360 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Verify Your Email</h1>
            <p className="text-sm text-gray-600">
              We've sent a 6-digit code to<br />
              <span className="font-semibold text-[#0158B7]">{email}</span>
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
            >
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-600">{error}</p>
            </motion.div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2"
            >
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-green-600">{successMessage}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            {/* OTP Input */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
                Enter Verification Code
              </label>
              <div className="flex justify-center gap-1.5" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-10 h-11 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                    whileFocus={{ scale: 1.05 }}
                  />
                ))}
              </div>
              <div className="text-center mt-2.5">
                {resendCooldown > 0 ? (
                  <p className="text-xs text-gray-500">
                    Resend code in {resendCooldown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResendOTP}
                    disabled={resending}
                    className="text-xs text-[#0158B7] hover:text-[#0362C3] font-semibold inline-flex items-center disabled:opacity-50 transition-colors"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1" />
                        Resend Code
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-blue-900 mb-1">Verification Tips:</p>
                  <ul className="text-xs text-blue-800 space-y-0.5">
                    <li>• Check your spam folder if you don't see the email</li>
                    <li>• The code expires in 10 minutes</li>
                    <li>• You can request a new code if needed</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading || otp.some(d => !d)}
              whileHover={{ scale: isLoading || otp.some(d => !d) ? 1 : 1.02 }}
              whileTap={{ scale: isLoading || otp.some(d => !d) ? 1 : 0.98 }}
              className="w-full bg-[#0158B7] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0362C3] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify Email
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center p-3 lg:p-4">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden p-5 md:p-6 lg:p-7 w-full max-w-md border border-white/20">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-8 h-8 text-[#0158B7] animate-spin" />
          <p className="text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <VerifyEmailContent />
    </Suspense>
  )
}