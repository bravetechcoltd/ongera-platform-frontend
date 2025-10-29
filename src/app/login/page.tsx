// @ts-nocheck
"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useDispatch, useSelector } from 'react-redux'
import { loginUser, googleLogin, clearError } from '@/lib/features/auth/auth-slice'
import type { AppDispatch, RootState } from '@/lib/store'
import { initializeSocket } from '@/lib/services/communityChatSocket' // FIXED: Import socket init
import {
  Mail, Lock, Eye, EyeOff, AlertCircle, Loader2,
  ArrowLeft, LogIn, Sparkles, BookOpen, Award, Users, TrendingUp
} from 'lucide-react'
import Link from 'next/link'

const features = [
  {
    icon: BookOpen,
    title: "Access Research Library",
    description: "Explore thousands of research papers, theses, and academic resources",
    color: "#0158B7"
  },
  {
    icon: Users,
    title: "Connect with Researchers",
    description: "Network with 1,200+ researchers and academics worldwide",
    color: "#0362C3"
  },
  {
    icon: Award,
    title: "Showcase Your Work",
    description: "Publish your research and get recognized in the community",
    color: "#5E96D2"
  },
  {
    icon: TrendingUp,
    title: "Track Your Progress",
    description: "Monitor your academic journey with detailed analytics",
    color: "#8DB6E1"
  }
]

export default function EnhancedLoginPage() {
  const router = useRouter()
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading, error, isAuthenticated, user, requiresVerification, verificationEmail } = useSelector((state: RootState) => state.auth)

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [currentFeature, setCurrentFeature] = useState(0)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [socketInitializing, setSocketInitializing] = useState(false) // FIXED: Track socket init

  // Navigate based on verification status
  useEffect(() => {
    if (requiresVerification && verificationEmail) {
      router.push(`/verify-email?email=${encodeURIComponent(verificationEmail)}`)
    } else if (isAuthenticated && user) {
      const dashboard = user.account_type === 'admin' ? '/dashboard/admin' : '/dashboard'
      router.push(dashboard)
    }
  }, [isAuthenticated, user, requiresVerification, verificationEmail, router])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  // Feature carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [])

  // Initialize Google Sign-In
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      })
      window.google?.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { 
          theme: 'outline', 
          size: 'large',
          width: '100%',
          text: 'signin_with'
        }
      )
    }

    return () => {
      if (script.parentNode) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleGoogleResponse = async (response: any) => {
    setGoogleLoading(true)
    try {
      const result = await dispatch(googleLogin({ token: response.credential })).unwrap()
      
      // FIXED: Initialize socket IMMEDIATELY after successful login and WAIT for it
      if (result.token) {
        setSocketInitializing(true)
        try {
          await initializeSocket(result.token) // FIXED: Await the promise
          console.log('✅ Socket initialized and connected after Google login')
        } catch (socketError) {
          console.error('❌ Socket initialization failed:', socketError)
        } finally {
          setSocketInitializing(false)
        }
      }
    } catch (err: any) {
      console.error('Google login failed:', err)
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // FIXED: Wait for login to complete
      const result = await dispatch(loginUser(formData)).unwrap()
      
      // FIXED: Initialize socket IMMEDIATELY after successful login and WAIT for it
      if (result.token) {
        setSocketInitializing(true)
        try {
          await initializeSocket(result.token) // FIXED: Await the promise
          console.log('✅ Socket initialized and connected after email login')
        } catch (socketError) {
          console.error('❌ Socket initialization failed:', socketError)
        } finally {
          setSocketInitializing(false)
        }
      }
    } catch (err: any) {
      console.error('Login failed:', err)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const feature = features[currentFeature]
  const FeatureIcon = feature.icon

  // FIXED: Show socket initialization status
  const isProcessing = isLoading || googleLoading || socketInitializing

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0158B7] to-[#5E96D2] flex items-center justify-center p-3 lg:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-5xl"
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left Side - Form */}
            <div className="p-5 md:p-6 lg:p-7">
              <Link href="/" className="inline-flex items-center text-gray-600 hover:text-[#0158B7] mb-3 transition-colors text-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>

              <div className="mb-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">Welcome Back!</h1>
                <p className="text-sm text-gray-600">Sign in to continue your research journey</p>
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

              {/* FIXED: Show socket initialization status */}
              {socketInitializing && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-2.5 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-2"
                >
                  <Loader2 className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 animate-spin" />
                  <p className="text-xs text-blue-600">Initializing chat connection...</p>
                </motion.div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                        required
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full pl-9 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0158B7] focus:border-transparent transition-all"
                        placeholder="••••••••"
                        required
                        disabled={isProcessing}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        disabled={isProcessing}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 text-[#0158B7] border-gray-300 rounded focus:ring-[#0158B7]"
                        disabled={isProcessing}
                      />
                      <span className="ml-2 text-xs text-gray-600">Remember me</span>
                    </label>

                    <Link href="/change-password" className="text-xs font-medium text-[#0158B7] hover:text-[#0362C3] transition-colors">
                      Change Password
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-[#0158B7] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#0362C3] hover:shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Signing in...
                      </>
                    ) : socketInitializing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </button>

                  <div className="relative my-3.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <div id="googleSignInButton" className="flex justify-center"></div>

                  <div className="relative my-3.5">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                      <span className="px-3 bg-white text-gray-500">New to Ongera?</span>
                    </div>
                  </div>

                  <Link
                    href="/register"
                    className="w-full border-2 border-[#0158B7] text-[#0158B7] py-2 rounded-lg text-sm font-semibold hover:bg-[#0158B7] hover:text-white transition-all transform hover:scale-[1.02] flex items-center justify-center"
                  >
                    Create an Account
                  </Link>
                </div>
              </form>
            </div>

            {/* Right Side - Animated Features */}
            <div className="bg-[#0158B7] p-6 md:p-7 lg:p-8 text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-5 rounded-full -ml-16 -mb-16"></div>
              
              <div className="relative z-10">
                <Sparkles className="w-10 h-10 mb-4" />
                <h2 className="text-2xl md:text-3xl font-bold mb-2">Your Research Hub</h2>
                <p className="text-sm md:text-base mb-7 opacity-90">
                  Join the community advancing knowledge and innovation
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
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}