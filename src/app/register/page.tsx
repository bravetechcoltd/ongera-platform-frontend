"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { registerUser, clearError, clearVerificationState } from '@/lib/features/auth/auth-slice'
import type { AppDispatch, RootState } from '@/lib/store'
import {
  User, Mail, Lock, Phone, UserCircle,
  Eye, EyeOff, CheckCircle, AlertCircle, Loader2,
  ArrowLeft, Sparkles, BookOpen, Award, Users, Building2, 
  Globe, MapPin, LogIn, Shield, FileText
} from 'lucide-react'
import Link from 'next/link'

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
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

export default function RegisterPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, registrationSuccess, verificationEmail } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    account_type: 'Student',
    username: '',
    institution_address: '',
    institution_type: '',
    institution_website: '',
    institution_description: ''
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
    }
  }, [dispatch])

  // Navigate to verify-email page on successful registration
  useEffect(() => {
    if (registrationSuccess && verificationEmail) {
      console.log("✅ Registration successful, navigating to verify-email page")
      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(verificationEmail)}`)
      }, 2000) // 2 second delay to show success message
    }
  }, [registrationSuccess, verificationEmail, router])

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

    if (formData.account_type === 'Institution') {
      if (!formData.first_name.trim()) errors.first_name = 'Institution name is required'
      if (!formData.institution_address.trim()) errors.institution_address = 'Address is required'
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = 'Valid email is required'
      }
    } else {
      if (!formData.first_name.trim()) errors.first_name = 'First name is required'
      if (!formData.last_name.trim()) errors.last_name = 'Last name is required'
      if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        errors.email = 'Valid email is required'
      }
    }

    if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const { confirmPassword, ...registerData } = formData
    await dispatch(registerUser(registerData))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: '' })
    }
  }

  const isInstitution = formData.account_type === 'Institution'

  const passwordStrengthColors = ['#EF4444', '#F59E0B', '#EAB308', '#10B981']
  const passwordStrengthLabels = ['Weak', 'Fair', 'Good', 'Strong']
  const feature = features[currentFeature]
  const FeatureIcon = feature.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center p-3 lg:p-4 relative overflow-hidden">
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
      </div>

      <FloatingParticles />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl relative z-10"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/20">
          <div className="grid md:grid-cols-2 gap-0">
            
            {/* Left Side - Form */}
            <div className="p-5 md:p-6 lg:p-7 max-h-[90vh] overflow-y-auto">
              <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#0158B7] mb-3 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>

              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Create Account</h1>
                <p className="text-sm text-gray-600">Join thousands of researchers</p>
              </div>

              {/* Policy Notice Banner */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-blue-900 mb-1">
                      Before Creating Your Account
                    </p>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      By registering, you agree to our{' '}
                      <Link href="/policy" className="underline hover:text-blue-900 font-semibold">
                        Terms of Service
                      </Link>
                      {', '}
                      <Link href="/policy#privacy-policy" className="underline hover:text-blue-900 font-semibold">
                        Privacy Policy
                      </Link>
                      {', and '}
                      <Link href="/policy#community-standards" className="underline hover:text-blue-900 font-semibold">
                        Community Standards
                      </Link>
                      . Please review these policies to understand how we protect your data and ensure a safe community.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Success Message */}
              {registrationSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-2.5 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2"
                >
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-green-600">Registration Successful!</p>
                    <p className="text-xs text-green-600 mt-0.5">Redirecting to email verification...</p>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && !registrationSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-600">{error}</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3">
                
                {/* Account Type Selector */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Account Type
                  </label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      name="account_type"
                      value={formData.account_type}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all appearance-none bg-white cursor-pointer"
                    >
                      <option value="Student">Student</option>
                      <option value="Researcher">Researcher</option>
                      <option value="Diaspora">Diaspora</option>
                      <option value="Institution">Institution</option>
                    </select>
                  </div>
                </div>

                {isInstitution ? (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Institution Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                          placeholder="Enter institution name"
                        />
                      </div>
                      {validationErrors.first_name && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.first_name}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Institution Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          name="institution_address"
                          value={formData.institution_address}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                          placeholder="Enter full address"
                        />
                      </div>
                      {validationErrors.institution_address && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.institution_address}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Institution Type
                      </label>
                      <select
                        name="institution_type"
                        value={formData.institution_type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                      >
                        <option value="">Select type</option>
                        <option value="University">University</option>
                        <option value="Research Center">Research Center</option>
                        <option value="College">College</option>
                        <option value="Institute">Institute</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Institution Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          name="institution_website"
                          value={formData.institution_website}
                          onChange={handleChange}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                          placeholder="https://institution.edu"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Brief Description
                      </label>
                      <textarea
                        name="institution_description"
                        value={formData.institution_description}
                        onChange={handleChange}
                        rows={2}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                        placeholder="Tell us about your institution..."
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                            placeholder="John"
                          />
                        </div>
                        {validationErrors.first_name && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors.first_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1.5">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                            placeholder="Doe"
                          />
                        </div>
                        {validationErrors.last_name && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors.last_name}</p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Shared fields */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                      placeholder={isInstitution ? "institution@example.com" : "john.doe@example.com"}
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleChange}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
                      placeholder="+250 XXX XXX"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
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
                            className="h-0.5 flex-1 rounded-full transition-all"
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
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all bg-white"
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
                  {validationErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.confirmPassword}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={isLoading || registrationSuccess}
                  whileHover={{ scale: (isLoading || registrationSuccess) ? 1 : 1.02 }}
                  whileTap={{ scale: (isLoading || registrationSuccess) ? 1 : 0.98 }}
                  className="w-full bg-[#0158B7] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0362C3] hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center relative overflow-hidden"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : registrationSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Success!
                    </>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white text-gray-500">Already have an account?</span>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="w-full border-2 border-[#0158B7] text-[#0158B7] py-2 rounded-lg text-sm font-semibold hover:bg-[#0158B7] hover:text-white transition-all transform hover:scale-[1.02] flex items-center justify-center"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </form>

              {/* Footer Policy Links - Mobile Only */}
              <div className="mt-4 pt-4 border-t border-gray-200 md:hidden">
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
                <Sparkles className="w-10 h-10 mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Join Bwenge Community</h2>
                <p className="text-sm md:text-base mb-7 opacity-90">
                  Connect with Rwanda's brightest minds
                </p>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentFeature}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-3.5"
                  >
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: feature.color }}
                    >
                      <FeatureIcon className="w-7 h-7" />
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
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentFeature ? 'w-6 bg-white' : 'w-1.5 bg-white bg-opacity-40'
                      }`}
                    />
                  ))}
                </div>

                {/* Policy Links in Sidebar - Desktop Only */}
                <div className="hidden md:block mt-8 pt-6 border-t border-white/20">
                  <p className="text-xs text-white/70 mb-3">Our Policies</p>
                  <div className="space-y-2">
                    <Link 
                      href="/policy#privacy-policy" 
                      className="flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors group"
                    >
                      <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Privacy Policy
                    </Link>
                    <Link 
                      href="/policy#terms-service" 
                      className="flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors group"
                    >
                      <FileText className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Terms of Service
                    </Link>
                    <Link 
                      href="/policy#community-standards" 
                      className="flex items-center gap-2 text-sm text-white/90 hover:text-white transition-colors group"
                    >
                      <Users className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Community Standards
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