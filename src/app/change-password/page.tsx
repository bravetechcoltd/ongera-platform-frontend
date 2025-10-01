// @ts-nocheck
"use client"

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { 
  requestPasswordChange, 
  changePasswordWithOTP, 
  clearError 
} from '@/lib/features/auth/auth-slice'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  CheckCircle, Key, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

// Floating Particles Component
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
function ChangePasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error } = useSelector((state: RootState) => state.auth)

  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [successMessage, setSuccessMessage] = useState('')

  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
      setStep('otp')
    }
  }, [searchParams])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  useEffect(() => {
    calculatePasswordStrength(newPassword)
  }, [newPassword])

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    setPasswordStrength(strength)
  }

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

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await dispatch(requestPasswordChange(email)).unwrap()
      setStep('otp')
    } catch (err) {
      console.error('Failed to request OTP:', err)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (otp.some(digit => !digit)) return
    if (newPassword !== confirmPassword) return
    if (newPassword.length < 8) return

    const otpString = otp.join('')
    try {
      await dispatch(changePasswordWithOTP({ 
        email, 
        otp: otpString, 
        new_password: newPassword 
      })).unwrap()
      
      setSuccessMessage('Password changed successfully!')
      setTimeout(() => router.push('/login'), 2000)
    } catch (err) {
      console.error('Failed to change password:', err)
    }
  }

  const passwordStrengthColors = ['#EF4444', '#F59E0B', '#EAB308', '#10B981']
  const passwordStrengthLabels = ['Weak', 'Fair', 'Good', 'Strong']

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

          <div className="mb-4">
            <motion.div 
              className="w-12 h-12 bg-[#0158B7] rounded-xl flex items-center justify-center mb-3"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Key className="w-6 h-6 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Change Password</h1>
            <p className="text-sm text-gray-600">
              {step === 'email' ? 'Enter your email to receive verification code' : 'Enter the code sent to your email'}
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

          {step === 'email' ? (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>

              <motion.button
                onClick={handleRequestOTP}
                disabled={isLoading || !email}
                whileHover={{ scale: isLoading || !email ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !email ? 1 : 0.98 }}
                className="w-full bg-[#0158B7] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0362C3] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  'Send Verification Code'
                )}
              </motion.button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2 text-center">
                  Enter Verification Code
                </label>
                <div className="flex justify-center gap-1.5">
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => (otpRefs.current[index] = el)}
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
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="mt-1.5">
                    <div className="flex space-x-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-1 flex-1 rounded-full transition-all"
                          style={{
                            backgroundColor: i < passwordStrength ? passwordStrengthColors[passwordStrength - 1] : '#E5E7EB'
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs mt-1" style={{ color: passwordStrengthColors[passwordStrength - 1] || '#6B7280' }}>
                      {passwordStrength > 0 ? passwordStrengthLabels[passwordStrength - 1] : 'Too weak'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <motion.button
                onClick={handleChangePassword}
                disabled={isLoading || otp.some(d => !d) || newPassword.length < 8 || newPassword !== confirmPassword}
                whileHover={{ scale: isLoading || otp.some(d => !d) || newPassword.length < 8 || newPassword !== confirmPassword ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || otp.some(d => !d) || newPassword.length < 8 || newPassword !== confirmPassword ? 1 : 0.98 }}
                className="w-full bg-[#0158B7] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0362C3] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Change Password
                  </>
                )}
              </motion.button>

              <button
                onClick={() => setStep('email')}
                className="w-full text-xs text-gray-600 hover:text-[#0158B7] transition-colors"
              >
                Use different email
              </button>
            </div>
          )}
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

// Main page component with Suspense boundary
export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ChangePasswordForm />
    </Suspense>
  )
}