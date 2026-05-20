'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { FaUser, FaSignOutAlt, FaMoon, FaSun, FaPen } from 'react-icons/fa'
import { useTheme } from 'next-themes'
import NotificationBell from './NotificationBell'

export default function Navbar() {
    const { data: session } = useSession()
    const [mounted, setMounted] = useState(false)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { theme, setTheme } = useTheme()

    const pathname = usePathname()

    // Handle hydration mismatch
    useEffect(() => {
        setMounted(true)
    }, [])

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark')
    }

    if (!mounted) return null

    const isLandingPage = pathname === '/'

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-primary-200 dark:border-primary-800 bg-white/80 dark:bg-primary-950/80 backdrop-blur-md transition-all">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href={isLandingPage ? "/" : "/blogs"} className="flex items-center space-x-2 group">
                        <div className="relative w-10 h-10">
                            <img
                                src="/logo.png"
                                alt="Estin Blog Logo"
                                className="object-contain w-full h-full dark:brightness-0 dark:invert"
                            />
                        </div>
                        <span className="text-xl font-bold text-primary-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                            Estin Blog
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {!isLandingPage && (
                            <>
                                <Link
                                    href="/blogs"
                                    className="text-primary-600 dark:text-primary-300 hover:text-accent-600 dark:hover:text-accent-400 font-medium transition-colors"
                                >
                                    Explore
                                </Link>

                                {session?.user?.role === 'admin' && (
                                    <Link
                                        href="/admin"
                                        className="text-primary-600 dark:text-primary-300 hover:text-accent-600 dark:hover:text-accent-400 font-medium transition-colors"
                                    >
                                        Admin
                                    </Link>
                                )}

                                <Link
                                    href="/blogs/new"
                                    className="flex items-center space-x-2 bg-accent-600 text-white px-4 py-2 rounded-lg hover:bg-accent-700 transition-all font-medium shadow-lg shadow-accent-600/20 hover:shadow-accent-600/30 transform hover:-translate-y-0.5"
                                >
                                    <FaPen className="text-sm" />
                                    <span>Write</span>
                                </Link>
                            </>
                        )}

                        <div className="flex items-center space-x-4 border-l border-primary-200 dark:border-primary-800 pl-8">
                            {/* Notifications */}
                            {session?.user && <NotificationBell />}

                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-full text-primary-500 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                                aria-label="Toggle Dark Mode"
                            >
                                {theme === 'dark' ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-accent-600" />}
                            </button>

                            {/* User Menu */}
                            {session?.user ? (
                                <div className="flex items-center space-x-4">
                                    <Link href="/profile" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                                        {session.user.image ? (
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name || 'User'}
                                                className="w-8 h-8 rounded-full border-2 border-primary-200 dark:border-primary-700"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center">
                                                <FaUser className="text-primary-400 text-sm" />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-primary-700 dark:text-primary-200">
                                            {session.user.name}
                                        </span>
                                    </Link>
                                    <button
                                        onClick={() => signOut({ callbackUrl: '/' })}
                                        className="text-primary-500 dark:text-primary-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                        title="Sign Out"
                                    >
                                        <FaSignOutAlt />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'signin' }))}
                                        className="text-sm font-medium text-accent-600 dark:text-accent-400 hover:underline"
                                    >
                                        Sign In
                                    </button>
                                    {isLandingPage && (
                                        <button
                                            onClick={() => {
                                                // Dispatch custom event to open auth modal in signup mode
                                                window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'signup' }))
                                            }}
                                            className="text-sm font-medium bg-primary-900 text-white px-4 py-2 rounded-lg hover:bg-primary-800 transition-colors"
                                        >
                                            Join
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center space-x-4 md:hidden">
                        {session?.user && <NotificationBell />}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-primary-500 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800 transition-colors"
                        >
                            {theme === 'dark' ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-accent-600" />}
                        </button>
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 text-primary-600 dark:text-primary-300"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-primary-200 dark:border-primary-800 animate-in slide-in-from-top-5">
                        <div className="flex flex-col space-y-4">
                            {!isLandingPage && (
                                <>
                                    <Link
                                        href="/blogs"
                                        className="text-primary-600 dark:text-primary-300 hover:text-accent-600 dark:hover:text-accent-400 font-medium transition-colors px-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        Explore
                                    </Link>

                                    {session?.user?.role === 'admin' && (
                                        <Link
                                            href="/admin"
                                            className="text-primary-600 dark:text-primary-300 hover:text-accent-600 dark:hover:text-accent-400 font-medium transition-colors px-2"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            Admin
                                        </Link>
                                    )}

                                    <Link
                                        href="/blogs/new"
                                        className="flex items-center space-x-2 text-accent-600 dark:text-accent-400 font-medium px-2"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <FaPen className="text-sm" />
                                        <span>Write a Blog</span>
                                    </Link>
                                </>
                            )}

                            {session?.user ? (
                                <div className="pt-4 border-t border-primary-200 dark:border-primary-800">
                                    <div className="flex items-center justify-between px-2 mb-4">
                                        <Link
                                            href="/profile"
                                            className="flex items-center space-x-3"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {session.user.image ? (
                                                <img
                                                    src={session.user.image}
                                                    alt={session.user.name || 'User'}
                                                    className="w-8 h-8 rounded-full border-2 border-primary-200 dark:border-primary-700"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-700 flex items-center justify-center">
                                                    <FaUser className="text-primary-400 text-sm" />
                                                </div>
                                            )}
                                            <span className="text-sm font-medium text-primary-700 dark:text-primary-200">
                                                {session.user.name}
                                            </span>
                                        </Link>
                                        <button
                                            onClick={() => {
                                                signOut({ callbackUrl: '/' })
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="text-red-500 hover:text-red-600 text-sm font-medium"
                                        >
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col space-y-3 pt-4 border-t border-primary-200 dark:border-primary-800 px-2">
                                    <button
                                        onClick={() => {
                                            window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'signin' }))
                                            setIsMobileMenuOpen(false)
                                        }}
                                        className="text-left font-medium text-primary-600 dark:text-primary-300"
                                    >
                                        Sign In
                                    </button>
                                    {isLandingPage && (
                                        <button
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('openAuthModal', { detail: 'signup' }))
                                                setIsMobileMenuOpen(false)
                                            }}
                                            className="text-left font-medium text-accent-600 dark:text-accent-400"
                                        >
                                            Join Now
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
