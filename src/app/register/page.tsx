"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import {
  registerUser,
  clearError,
  clearVerificationState,
  clearApplicationState,
} from '@/lib/features/auth/auth-slice'
import { SystemType } from '@/lib/features/auth/system-types'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  User, Mail, Lock, Phone, UserCircle,
  Eye, EyeOff, CheckCircle, AlertCircle, Loader2,
  ArrowLeft, Sparkles, BookOpen, Award, Users,
  Globe, MapPin, LogIn, Shield, FileText, GraduationCap,
  TrendingUp, Linkedin, Calendar, Clock, Send
} from 'lucide-react'
import Link from 'next/link'

// ==================== FLOATING PARTICLES ====================
function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 12 + 18,
    delay: Math.random() * 5,
    blur: Math.random() * 2 + 0.5
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            filter: `blur(${particle.blur}px)`
          }}
          animate={{
            y: [-20, -80],
            opacity: [0, 0.6, 0.6, 0],
            scale: [1, 1.3, 1]
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

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const {
    isLoading,
    error,
    registrationSuccess,
    verificationEmail,
    applicationSubmitted,
    applicationEmail,
  } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    phone_number: '',
    account_type: 'Student',
    country: '',
    date_of_birth: '',
    gender: '',
    education_level: '',
    motivation: '',
    linkedin_url: '',
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [validationErrors, setValidationErrors] = useState<any>({})
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: BookOpen,
      title: "Access Research Library",
      description: "Explore thousands of research papers and academic resources",
      color: "#0158B7"
    },
    {
      icon: Users,
      title: "Connect with Researchers",
      description: "Network with 1,200+ researchers worldwide",
      color: "#0362C3"
    },
    {
      icon: Award,
      title: "Showcase Your Work",
      description: "Publish research and get recognized",
      color: "#5E96D2"
    }
  ]

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearVerificationState())
      dispatch(clearApplicationState())
    }
  }, [dispatch])

  // Only redirect for original Ongera flow (OTP verification)
  useEffect(() => {
    if (registrationSuccess && verificationEmail && !applicationSubmitted) {
      const t = setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(verificationEmail)}`)
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [registrationSuccess, verificationEmail, applicationSubmitted, router])

  useEffect(() => {
    calculatePasswordStrength(formData.password)
  }, [formData.password])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  const calculatePasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++
    if (password.match(/[0-9]/)) strength++
    if (password.match(/[^a-zA-Z0-9]/)) strength++
    setPasswordStrength(strength)
  }

  const validateForm = () => {
    const errors: any = {}

    if (!formData.first_name.trim()) errors.first_name = 'First name is required'
    if (!formData.last_name.trim()) errors.last_name = 'Last name is required'
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = 'Valid email is required'
    }
    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match'
    }
    if (!formData.motivation.trim()) {
      errors.motivation = 'Please tell us why you want to join Bwenge'
    } else if (formData.motivation.trim().length < 20) {
      errors.motivation = 'Please provide at least 20 characters of motivation'
    }
    if (formData.linkedin_url && !/^https?:\/\/(www\.)?linkedin\.com\/.+/i.test(formData.linkedin_url)) {
      errors.linkedin_url = 'Please provide a valid LinkedIn URL'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    await dispatch(
      registerUser({
        ...formData,
        IsForWhichSystem: SystemType.BWENGEPLUS,
      })
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' })
    }
  }

  const passwordStrengthColors = ['#EF4444', '#F59E0B', '#EAB308', '#10B981']
  const passwordStrengthLabels = ['Weak', 'Fair', 'Good', 'Strong']
  const feature = features[currentFeature]
  const FeatureIcon = feature.icon

  // ==================== APPLICATION SUBMITTED VIEW ====================
  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center p-4 relative overflow-hidden">
        <FloatingParticles />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-xl relative z-10"
        >
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 p-8 md:p-10 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Application Submitted!
            </h1>
            <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed">
              Thank you for applying to join <strong>Bwenge</strong>. Our admin team will review your application and notify you by email at{' '}
              <strong className="text-[#0158B7]">{applicationEmail}</strong>.
            </p>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#0158B7] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">What happens next?</p>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>Our admin team will review your application</li>
                    <li>You'll receive an email with the decision</li>
                    <li>Once approved, you can sign in and access Bwenge</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/"
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all"
              >
                Back to Home
              </Link>
              <Link
                href="/login"
                className="px-6 py-2.5 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                Go to Sign In
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute right-[-10%] top-[10%] w-[60%] h-[70%] opacity-30"
          style={{
            clipPath: 'ellipse(40% 50% at 100% 50%)',
            background: '#0362C3',
            transform: 'rotate(-15deg)'
          }}
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-[-5%] bottom-[-5%] w-[40%] h-[60%] opacity-25"
          style={{
            clipPath: 'circle(50% at 0% 100%)',
            background: '#5E96D2',
            transform: 'rotate(25deg)'
          }}
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>

      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">

            {/* Left Side - Form */}
            <div className="p-6 md:p-7 lg:p-8 max-h-[92vh] overflow-y-auto">
              <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#0158B7] mb-4 transition-colors text-sm group">
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Home
              </Link>

              <div className="mb-5">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full mb-2">
                  <Sparkles className="w-3 h-3 text-[#0158B7]" />
                  <span className="text-xs font-semibold text-[#0158B7]">Apply to Join</span>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Apply to Join Bwenge
                </h1>
                <p className="text-sm text-gray-600">
                  Tell us about yourself. Your application will be reviewed by our admin team.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Before Applying
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      By applying, you agree to our{' '}
                      <Link href="/policy" className="underline hover:text-blue-900 font-semibold">Terms</Link>,{' '}
                      <Link href="/policy#privacy-policy" className="underline hover:text-blue-900 font-semibold">Privacy Policy</Link>, and{' '}
                      <Link href="/policy#community-standards" className="underline hover:text-blue-900 font-semibold">Community Standards</Link>.
                    </p>
                  </div>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">

                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                        placeholder="John"
                      />
                    </div>
                    {validationErrors.first_name && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.first_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                        placeholder="Doe"
                      />
                    </div>
                    {validationErrors.last_name && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Email + Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                      placeholder="you@example.com"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="tel"
                        name="phone_number"
                        value={formData.phone_number}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                        placeholder="+250 XXX XXX XXX"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                        placeholder="Rwanda"
                      />
                    </div>
                  </div>
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        name="date_of_birth"
                        value={formData.date_of_birth}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Education level + Account type */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Education Level</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select
                        name="education_level"
                        value={formData.education_level}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
                      >
                        <option value="">Select level</option>
                        <option value="high_school">High School</option>
                        <option value="diploma">Diploma</option>
                        <option value="bachelor">Bachelor's Degree</option>
                        <option value="master">Master's Degree</option>
                        <option value="phd">PhD / Doctorate</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">I identify as</label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select
                        name="account_type"
                        value={formData.account_type}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
                      >
                        <option value="Student">Student</option>
                        <option value="Researcher">Researcher</option>
                        <option value="Diaspora">Diaspora</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* LinkedIn */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    LinkedIn URL <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      name="linkedin_url"
                      value={formData.linkedin_url}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  </div>
                  {validationErrors.linkedin_url && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.linkedin_url}</p>
                  )}
                </div>

                {/* Motivation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Why do you want to join Bwenge? <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="motivation"
                    value={formData.motivation}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white resize-none"
                    placeholder="Tell us about your goals and how Bwenge can help you..."
                  />
                  <div className="flex items-center justify-between mt-1">
                    {validationErrors.motivation ? (
                      <p className="text-xs text-red-500">{validationErrors.motivation}</p>
                    ) : (
                      <p className="text-xs text-gray-500">At least 20 characters</p>
                    )}
                    <span className="text-xs text-gray-400">{formData.motivation.length} chars</span>
                  </div>
                </div>

                {/* Password fields */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {formData.password && (
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
                  {validationErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {validationErrors.confirm_password && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.confirm_password}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02 }}
                  whileTap={{ scale: isLoading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting Application...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Application
                    </>
                  )}
                </motion.button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="w-full border-2 border-[#0158B7] text-[#0158B7] py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0158B7] hover:text-white transition-all transform hover:scale-[1.02] flex items-center justify-center"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </form>

              <div className="mt-5 pt-4 border-t border-gray-200 md:hidden">
                <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-600">
                  <Link href="/policy#privacy-policy" className="hover:text-[#0158B7] flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Privacy
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link href="/policy#terms-service" className="hover:text-[#0158B7] flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Terms
                  </Link>
                  <span className="text-gray-300">•</span>
                  <Link href="/policy#community-standards" className="hover:text-[#0158B7]">
                    Standards
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Side - Animated Features */}
            <div className="bg-gradient-to-br from-[#0158B7] to-[#0362C3] p-6 md:p-7 lg:p-8 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>

              <div className="relative z-10">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4"
                >
                  <Sparkles className="w-6 h-6 text-white" />
                </motion.div>

                <h2 className="text-2xl md:text-3xl font-bold mb-2">Join Bwenge</h2>
                <p className="text-sm md:text-base mb-6 opacity-90">
                  Applications are reviewed by our admin team. You'll hear from us soon after submitting.
                </p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
                      style={{ backgroundColor: feature.color }}
                    >
                      <FeatureIcon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold">{feature.title}</h3>
                    <p className="text-sm md:text-base opacity-90 leading-relaxed">{feature.description}</p>
                  </motion.div>
                </AnimatePresence>

                <div className="flex space-x-2 mt-6">
                  {features.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentFeature(index)}
                      className={`h-1.5 rounded-full transition-all ${index === currentFeature ? 'w-6 bg-white' : 'w-1.5 bg-white bg-opacity-40'
                        }`}
                    />
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    🇷🇼 Rwanda's Research Ecosystem
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-all">
                      <div className="text-xl font-bold">500+</div>
                      <div className="text-xs opacity-80">Active Projects</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm hover:bg-white/20 transition-all">
                      <div className="text-xl font-bold">30+</div>
                      <div className="text-xs opacity-80">Institutions</div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block mt-6 pt-4 border-t border-white/20">
                  <p className="text-xs text-white/70 mb-2">Our Policies</p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/policy#privacy-policy" className="text-xs text-white/80 hover:text-white transition-colors flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Privacy
                    </Link>
                    <Link href="/policy#terms-service" className="text-xs text-white/80 hover:text-white transition-colors flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Terms
                    </Link>
                    <Link href="/policy#community-standards" className="text-xs text-white/80 hover:text-white transition-colors">
                      Standards
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
