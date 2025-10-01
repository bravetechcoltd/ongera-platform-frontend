// @ts-nocheck

"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { logout } from "@/lib/features/auth/auth-slice"
import Image from "next/image"
import { motion } from "framer-motion"

export default function SharedNavigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    dispatch(logout())
    router.push('/')
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Research', href: '/research-projects' },
    { label: 'Communities', href: isAuthenticated ? '/dashboard/user/communities' : '/communities' },
    { label: 'Events', href: isAuthenticated ? '/dashboard/user/events' : '/events' },
    { label: 'Policy', href: '/policy' }
  ]

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200'
          : 'bg-white shadow-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
            <motion.div
              className="w-[160px] h-16 rounded-xl flex items-center justify-center overflow-hidden border-2 border-white/30 bg-white/5 backdrop-blur-sm mb-3 mt-3"
              whileHover={{ scale: 1.05, borderColor: 'rgba(255, 255, 255, 0.6)' }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Image
                src="/ongeraLogo.png"
                alt="Ongera logo"
                width={160}
                height={62}
                priority
                className="object-contain"
              />
            </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-md font-medium text-gray-700 hover:text-[#0158B7] transition-colors relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#0158B7] transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-md font-medium text-gray-700 hover:text-[#0158B7] transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-md font-medium text-gray-700 hover:text-[#0158B7] transition-colors"
                >
                  Logout
                </button>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0158B7] to-[#0362C3] flex items-center justify-center text-white text-md font-bold hover:scale-105 transition-transform cursor-pointer">
                  {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-md font-medium text-gray-700 hover:text-[#0158B7] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white rounded-full text-md font-semibold hover:shadow-lg transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <nav className="py-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block px-3 py-2 text-md font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="px-3 pt-3 space-y-1 border-t border-gray-200">
                {isAuthenticated ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block w-full text-md font-medium py-2 text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="block w-full text-md font-medium py-2 text-left text-gray-700"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="block w-full text-md font-medium py-2 text-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="block w-full px-3 py-2 rounded-lg text-md font-semibold text-center bg-gradient-to-r from-[#0158B7] to-[#0362C3] text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}