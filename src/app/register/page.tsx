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
  TrendingUp, Linkedin, Calendar, Clock, Send, ChevronRight
} from 'lucide-react'
import Link from 'next/link'

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

  const [step, setStep] = useState(1)
  const [agreed, setAgreed] = useState(false)
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
      description: "Network with 1,200+ researchers across Rwanda",
      color: "#0362C3"
    },
    {
      icon: Award,
      title: "Showcase Your Work",
      description: "Publish research and get recognized",
      color: "#5E96D2"
    }
  ]

  const STEPS = [
    { id: 1, label: "Personal", icon: User },
    { id: 2, label: "Security", icon: Shield },
    { id: 3, label: "Background", icon: GraduationCap },
  ]

  const processSteps = [
    { num: "01", title: "Apply", desc: "Fill in your personal and academic details" },
    { num: "02", title: "Review", desc: "Admin team reviews within 24–48 hours" },
    { num: "03", title: "Approve", desc: "You receive an email once a decision is made" },
    { num: "04", title: "Access", desc: "Log in and start exploring immediately" },
  ]

  useEffect(() => {
    return () => {
      dispatch(clearError())
      dispatch(clearVerificationState())
      dispatch(clearApplicationState())
    }
  }, [dispatch])

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

  const step1Valid = !!(formData.first_name.trim() && formData.last_name.trim() && formData.email.trim())
  const step2Valid = formData.password.length >= 8 && formData.password === formData.confirm_password
  const step3Valid = formData.motivation.trim().length >= 20

  const canNext = () => step === 1 ? step1Valid : step === 2 ? step2Valid : true
  const handleNext = () => { if (step < 3) setStep((s) => s + 1) }
  const handleBack = () => { if (step > 1) setStep((s) => s - 1) }

  const GENDERS = ["Male", "Female", "Prefer not to say", "Other"]
  const EDUCATION_LEVELS = [
    "High School / Secondary", "Diploma / Certificate", "Bachelor's Degree",
    "Master's Degree", "PhD / Doctorate", "Other",
  ]

  // Application Submitted View
  if (applicationSubmitted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-[#0158B7] to-[#5E96D2] p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-white rounded-2xl shadow-2xl border border-white/20 p-8 max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg"
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Application Submitted</h2>
          <p className="text-sm text-gray-600 mb-6 text-center leading-relaxed">
            Thank you for applying to join <strong>Bwenge</strong>. Our admin team will review your application and notify you at{' '}
            <strong className="text-[#0158B7]">{applicationEmail}</strong>.
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
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

          <div className="space-y-3">
            <Link
              href="/login"
              className="w-full bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Go to Sign In
            </Link>
            <Link
              href="/"
              className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all flex items-center justify-center"
            >
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col lg:flex-row overflow-hidden bg-gradient-to-br from-[#0158B7] to-[#5E96D2]">
      
      {/* LEFT — Form Column */}
      <div className="w-full lg:w-[58%] h-full flex flex-col bg-white/95 backdrop-blur-md">
        
        {/* Top Nav */}
        <div className="flex items-center justify-between px-6 h-11 border-b border-gray-200 flex-shrink-0">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#0158B7] transition-colors text-sm group">
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {/* Step Indicators */}
          <div className="flex items-center gap-0">
            {STEPS.map((s, i) => {
              const SIcon = s.icon
              const done = step > s.id
              const active = step === s.id
              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-1">
                    <div className={`w-5 h-5 rounded flex items-center justify-center transition-all duration-200 ${
                      done ? "bg-emerald-500" : active ? "bg-[#0158B7]" : "bg-gray-200"
                    }`}>
                      {done ? (
                        <CheckCircle className="w-3 h-3 text-white" />
                      ) : (
                        <span className={`text-[9px] font-black ${active ? "text-white" : "text-gray-400"}`}>{s.id}</span>
                      )}
                    </div>
                    <span className={`text-[9px] font-bold uppercase tracking-widest transition-colors hidden sm:block ${
                      active ? "text-gray-900" : done ? "text-emerald-500" : "text-gray-400"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-5 h-px mx-1.5 transition-colors duration-300 ${step > s.id ? "bg-emerald-500" : "bg-gray-200"}`} />
                  )}
                </React.Fragment>
              )
            })}
          </div>

          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center px-8 py-3 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-[420px] space-y-3"
          >
            
            {/* Heading */}
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 border border-blue-100 rounded-full mb-2">
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-[#0158B7]">Apply to Join</span>
              </div>
              <h1 className="text-[20px] font-bold text-gray-900 leading-none tracking-tight">
                {step === 1 ? "Personal details" : step === 2 ? "Set your password" : "Your background"}
              </h1>
              <p className="text-[11px] text-gray-600">
                Step {step} of {STEPS.length} · Your application will be reviewed by our admin team
              </p>
            </div>

            {/* Policy Notice */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-l-[3px] border-blue-400 bg-blue-50 pl-3 pr-3 py-2 rounded-r"
              >
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 leading-snug">
                    By applying, you agree to our{' '}
                    <Link href="/policy" className="underline hover:text-blue-900 font-semibold">Terms</Link>,{' '}
                    <Link href="/policy#privacy-policy" className="underline hover:text-blue-900 font-semibold">Privacy Policy</Link>, and{' '}
                    <Link href="/policy#community-standards" className="underline hover:text-blue-900 font-semibold">Community Standards</Link>.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.16 }}
                  className="border-l-[3px] border-red-400 bg-red-50 pl-3 pr-3 py-2 rounded-r"
                >
                  <p className="text-[11px] text-red-600">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Progress bar */}
            <div className="w-full h-px bg-gray-200 overflow-hidden rounded-full">
              <motion.div
                className="h-full bg-[#0158B7]"
                animate={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                
                {/* STEP 1 — Personal */}
                {step === 1 && (
                  <motion.div key="s1"
                    initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" name="first_name" value={formData.first_name} onChange={handleChange}
                          placeholder="First name *" required disabled={isLoading}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                        />
                      </div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" name="last_name" value={formData.last_name} onChange={handleChange}
                          placeholder="Last name *" required disabled={isLoading}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email" name="email" value={formData.email} onChange={handleChange}
                        placeholder="Email address *" required disabled={isLoading}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="tel" name="phone_number" value={formData.phone_number} onChange={handleChange}
                          placeholder="Phone number" disabled={isLoading}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                        />
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text" name="country" value={formData.country} onChange={handleChange}
                          placeholder="Country" disabled={isLoading}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <button
                      type="button" onClick={handleNext} disabled={!canNext()}
                      className="w-full bg-[#0158B7] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0362C3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      Next: Security <ChevronRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2 — Security */}
                {step === 2 && (
                  <motion.div key="s2"
                    initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
                        placeholder="Password (min 8 characters) *" required disabled={isLoading}
                        className="w-full pl-9 pr-10 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                      />
                      <button
                        type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {formData.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                          className="space-y-1"
                        >
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((i) => (
                              <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
                                style={{ backgroundColor: i < passwordStrength ? passwordStrengthColors[passwordStrength - 1] : "#E5E7EB" }} />
                            ))}
                          </div>
                          <p className="text-[9px] font-black uppercase tracking-widest"
                            style={{ color: passwordStrength > 0 ? passwordStrengthColors[passwordStrength - 1] : "#6B7280" }}>
                            {passwordStrength > 0 ? passwordStrengthLabels[passwordStrength - 1] : "Too weak"}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'} name="confirm_password"
                        value={formData.confirm_password} onChange={handleChange}
                        placeholder="Confirm password *" required disabled={isLoading}
                        className={`w-full pl-9 pr-10 py-2.5 text-sm bg-white rounded-lg outline-none transition-colors disabled:opacity-50
                          ${formData.confirm_password && formData.password !== formData.confirm_password
                            ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20"
                            : "border border-gray-300 focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20"
                          } text-gray-900 placeholder:text-gray-400`}
                      />
                      <button
                        type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <AnimatePresence>
                      {formData.confirm_password && formData.password !== formData.confirm_password && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="text-[10px] text-red-500">Passwords do not match</motion.p>
                      )}
                    </AnimatePresence>

                    <div className="flex gap-2">
                      <button
                        type="button" onClick={handleBack}
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="button" onClick={handleNext} disabled={!canNext()}
                        className="flex-1 bg-[#0158B7] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0362C3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        Next: Background <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 — Background */}
                {step === 3 && (
                  <motion.div key="s3"
                    initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -14 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange}
                          disabled={isLoading}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                        />
                      </div>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          name="gender" value={formData.gender} onChange={handleChange} disabled={isLoading}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 disabled:opacity-50 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Select gender</option>
                          {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          name="education_level" value={formData.education_level} onChange={handleChange} disabled={isLoading}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 disabled:opacity-50 appearance-none cursor-pointer"
                        >
                          <option value="" disabled>Education level</option>
                          {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                      </div>
                      <div className="relative">
                        <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                          name="account_type" value={formData.account_type} onChange={handleChange} disabled={isLoading}
                          className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 disabled:opacity-50 appearance-none cursor-pointer"
                        >
                          <option value="Student">Student</option>
                          <option value="Researcher">Researcher</option>
                          <option value="Diaspora">Diaspora</option>
                        </select>
                      </div>
                    </div>

                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="url" name="linkedin_url" value={formData.linkedin_url} onChange={handleChange}
                        placeholder="LinkedIn URL (optional)" disabled={isLoading}
                        className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <textarea
                        name="motivation" value={formData.motivation} onChange={handleChange}
                        required rows={3} disabled={isLoading}
                        placeholder="Why do you want to join Bwenge? *"
                        className="w-full px-3 py-2.5 text-sm bg-white border border-gray-300 rounded-lg outline-none resize-none focus:border-[#0158B7] focus:ring-2 focus:ring-[#0158B7]/20 text-gray-900 placeholder:text-gray-400 disabled:opacity-50"
                      />
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Min. 20 characters</span>
                        <span className={`text-[9px] font-bold tabular-nums ${formData.motivation.length >= 20 ? "text-emerald-500" : "text-gray-400"}`}>
                          {formData.motivation.length}
                        </span>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 cursor-pointer group/terms select-none">
                      <button
                        type="button" role="checkbox" aria-checked={agreed}
                        onClick={() => !isLoading && setAgreed(!agreed)} disabled={isLoading}
                        className={`mt-0.5 w-3.5 h-3.5 rounded-sm border-[1.5px] flex items-center justify-center flex-shrink-0 transition-all ${
                          agreed ? 'bg-[#0158B7] border-[#0158B7]' : 'bg-white border-gray-300 group-hover/terms:border-gray-400'
                        }`}
                      >
                        {agreed && (
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 10 10">
                            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                      <span className="text-[11px] text-gray-600 leading-snug">
                        I agree to the{' '}
                        <Link href="/policy#terms-service" className="text-[#0158B7] font-semibold hover:underline underline-offset-2">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/policy#privacy-policy" className="text-[#0158B7] font-semibold hover:underline underline-offset-2">Privacy Policy</Link>
                      </span>
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button" onClick={handleBack}
                        className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                      >
                        Back
                      </button>
                      <button
                        type="submit" disabled={isLoading || !step3Valid || !agreed}
                        className="flex-1 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white py-2.5 rounded-lg text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Submit Application
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Sign In Link */}
            <p className="text-center text-[11px] text-gray-600 border-t border-gray-200 pt-2.5">
              Already have an account?{' '}
              <Link href="/login" className="text-[#0158B7] font-semibold hover:underline underline-offset-2">Sign in →</Link>
            </p>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 h-8 border-t border-gray-200 flex items-center flex-shrink-0">
          <p className="text-[9px] text-gray-400 tracking-widest uppercase font-medium">
            Admin approval required · Bwenge Research Platform
          </p>
        </div>
      </div>

      {/* RIGHT — Primary Color Editorial Panel */}
      <div className="hidden lg:flex w-full lg:w-[42%] h-full bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex-col">
        
        {/* Top Label Row */}
        <div className="flex items-center justify-between px-10 h-11 border-b border-white/10 flex-shrink-0">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white">How it works</span>
          <span className="text-[9px] font-medium uppercase tracking-[0.16em] text-white">Application process</span>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-10 py-5">
          
          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.42, ease: "easeOut" }}
            className="mb-6"
          >
            <p className="text-[9px] font-black uppercase tracking-[0.22em] text-white mb-2">Join Bwenge</p>
            <h2 className="text-[32px] font-bold text-white leading-[1.05] tracking-tight">By invitation.</h2>
            <p className="text-white/70 text-[13px] mt-1.5 leading-relaxed">
              Each application is reviewed to maintain the quality of our research community.
            </p>
          </motion.div>

          {/* Numbered Process Steps */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.22, duration: 0.42 }}
            className="space-y-0"
          >
            {processSteps.map((s) => (
              <div key={s.num} className="flex items-start gap-4 py-3 border-b border-white/10 group">
                <span className="text-[28px] font-black leading-none text-white/20 flex-shrink-0 w-9 text-right group-hover:text-white/40 transition-colors duration-200 font-mono tabular-nums">
                  {s.num}
                </span>
                <div className="pt-0.5 space-y-0.5">
                  <p className="text-[13px] font-bold text-white group-hover:text-white transition-colors duration-200">{s.title}</p>
                  <p className="text-[11px] text-white/60 leading-snug">{s.desc}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Feature Carousel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.45 }}
            className="mt-6 pt-6 border-t border-white/20"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-3"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: feature.color }}
                >
                  <FeatureIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-[15px] font-bold text-white">{feature.title}</h3>
                <p className="text-[12px] text-white/80 leading-relaxed">{feature.description}</p>
              </motion.div>
            </AnimatePresence>

            <div className="flex space-x-2 mt-2">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentFeature ? 'w-6 bg-white' : 'w-1.5 bg-white/30 hover:bg-white/50'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Strip */}
        <div className="px-10 py-4 border-t border-white/10 flex-shrink-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/60 mb-0.5">Review time</p>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-white/70" />
            <p className="text-[13px] font-semibold text-white">24–48 hours from submission</p>
          </div>
        </div>
      </div>
    </div>
  )
}