'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useSession, signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { FaArrowRight, FaPen, FaUser, FaSearch, FaRocket, FaShieldAlt, FaUsers, FaHeart, FaComment } from 'react-icons/fa'
import Navbar from '@/components/Navbar'
import { motion } from 'framer-motion'
import { format } from 'date-fns'

interface Blog {
    id: string
    title: string
    content: string
    image: string | null
    author: {
        name: string | null
        image: string | null
    }
    createdAt: string
    _count: {
        likes: number
        comments: number
    }
}

export default function Home() {
    const { data: session } = useSession()
    const router = useRouter()
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
    const [role, setRole] = useState<'student' | 'teacher'>('student')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [text, setText] = useState('')
    const fullText = "the world"
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([])

    // Typing effect
    useEffect(() => {
        let timeout: NodeJS.Timeout
        let currentIndex = 0
        let isDeleting = false
        let isPaused = false

        const type = () => {
            if (isPaused) {
                timeout = setTimeout(() => {
                    isPaused = false
                    isDeleting = true
                    type()
                }, 2000) // Pause before deleting
                return
            }

            const currentText = fullText.slice(0, currentIndex)
            setText(currentText)

            if (!isDeleting && currentIndex < fullText.length) {
                currentIndex++
                timeout = setTimeout(type, 100)
            } else if (isDeleting && currentIndex > 0) {
                currentIndex--
                timeout = setTimeout(type, 50)
            } else if (!isDeleting && currentIndex === fullText.length) {
                isPaused = true
                type()
            } else if (isDeleting && currentIndex === 0) {
                isDeleting = false
                timeout = setTimeout(type, 500) // Pause before typing again
            }
        }

        type()

        return () => clearTimeout(timeout)
    }, [])

    // Cursor spotlight effect restricted to Hero
    const heroRef = useRef<HTMLDivElement>(null)
    const [isHoveringHero, setIsHoveringHero] = useState(false)

    const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (heroRef.current) {
            const rect = heroRef.current.getBoundingClientRect()
            setMousePosition({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            })
        }
    }

    // Fetch featured blogs and setup event listener
    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await fetch('/api/blogs?sort=trending')
                if (res.ok) {
                    const data = await res.json()
                    if (Array.isArray(data)) {
                        setFeaturedBlogs(data.slice(0, 3)) // Show top 3 trending
                    }
                }
            } catch (err) {
                console.error("Failed to fetch featured blogs", err)
            }
        }
        fetchFeatured()

        // Listen for custom auth modal event
        const handleOpenAuth = (e: any) => {
            openAuth(e.detail || 'signin')
        }
        window.addEventListener('openAuthModal', handleOpenAuth)
        return () => window.removeEventListener('openAuthModal', handleOpenAuth)
    }, [])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (authMode === 'signup') {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password, role }),
                })

                if (!res.ok) {
                    const data = await res.json()
                    throw new Error(data.error || 'Registration failed')
                }

                // Auto sign in after registration
                const result = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                })

                if (result?.error) throw new Error(result.error)
                router.push('/blogs')
            } else {
                const result = await signIn('credentials', {
                    redirect: false,
                    email,
                    password,
                })

                if (result?.error) throw new Error('Invalid credentials')
                router.push('/blogs')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const openAuth = (mode: 'signin' | 'signup') => {
        setAuthMode(mode)
        setIsAuthModalOpen(true)
        setError('')
    }

    const truncateContent = (content: string, maxLength: number = 100) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + '...'
    }

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white overflow-x-hidden font-sans relative">
            <Navbar />

            {/* Hero Section */}
            <div
                ref={heroRef}
                onMouseMove={handleHeroMouseMove}
                onMouseEnter={() => setIsHoveringHero(true)}
                onMouseLeave={() => setIsHoveringHero(false)}
                className="relative isolate pt-14 dark:bg-gray-900 overflow-hidden"
            >
                {/* Cursor Spotlight */}
                <div
                    className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(300px at ${mousePosition.x}px ${mousePosition.y}px, rgba(29, 78, 216, 0.15), transparent 80%)`,
                        opacity: isHoveringHero ? 1 : 0
                    }}
                />

                <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
                    <motion.div
                        animate={{
                            rotate: [0, 360],
                            scale: [1, 1.1, 1],
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
                    />
                    <motion.div
                        animate={{
                            rotate: [360, 0],
                            scale: [1, 1.2, 1],
                        }}
                        transition={{
                            duration: 25,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        className="absolute top-0 left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+10rem)] sm:w-[72.1875rem]"
                        style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
                    />
                </div>

                <div className="py-24 sm:py-32 lg:pb-40">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="mx-auto max-w-3xl text-center">
                            <div className="min-h-[120px] sm:min-h-[160px] flex flex-col items-center justify-center">
                                <motion.h1
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-7xl mb-2 flex flex-wrap justify-center gap-x-4 gap-y-2"
                                >
                                    <span>Share your stories with</span>
                                    <span className="text-blue-600 whitespace-nowrap">
                                        {text}
                                        <span className="animate-pulse ml-1">|</span>
                                    </span>
                                </motion.h1>

                                {/* Pen Animation */}
                                <div className="relative w-64 h-12 mt-2">
                                    <svg width="100%" height="100%" viewBox="0 0 200 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <motion.path
                                            d="M10 20 C 50 10, 150 30, 190 20"
                                            stroke="url(#gradient)"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                                        />
                                        <defs>
                                            <linearGradient id="gradient" x1="0" y1="0" x2="200" y2="0">
                                                <stop offset="0%" stopColor="#2563eb" />
                                                <stop offset="100%" stopColor="#9333ea" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                    <motion.div
                                        className="absolute top-0 left-0"
                                        initial={{ x: 0, y: 10, opacity: 0 }}
                                        animate={{
                                            x: [0, 50, 150, 180],
                                            y: [10, 0, 20, 10],
                                            opacity: [0, 1, 1, 0]
                                        }}
                                        transition={{ duration: 1.5, ease: "easeInOut", delay: 1 }}
                                    >
                                        <FaPen className="text-blue-600 text-xl transform -rotate-45" />
                                    </motion.div>
                                </div>
                            </div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 2.5, ease: "easeOut" }}
                                className="mt-6 text-xl leading-8 text-gray-600 dark:text-gray-300"
                            >
                                A modern platform for students and teachers to connect, share knowledge, and inspire each other through the power of writing.
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 2.7, ease: "easeOut" }}
                                className="mt-10 flex items-center justify-center gap-x-6"
                            >
                                <button
                                    onClick={() => openAuth('signup')}
                                    className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:shadow-blue-600/50 transition-all transform hover:-translate-y-1"
                                >
                                    Get started
                                </button>
                                <button
                                    onClick={() => {
                                        const element = document.getElementById('featured-posts');
                                        element?.scrollIntoView({ behavior: 'smooth' });
                                    }}
                                    className="text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-1"
                                >
                                    Start reading <span aria-hidden="true">→</span>
                                </button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Featured Posts Section */}
            <div id="featured-posts" className="py-24 bg-gray-50 dark:bg-gray-800/50">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Trending Stories</h2>
                        <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Discover the most popular posts from our community.
                        </p>
                    </div>

                    <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {featuredBlogs.length > 0 ? (
                            featuredBlogs.map((blog) => (
                                <motion.article
                                    key={blog.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-start justify-between bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 group"
                                >
                                    <div className="relative w-full">
                                        {blog.image && (
                                            <img
                                                src={blog.image}
                                                alt={blog.title}
                                                className="aspect-[16/9] w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2] mb-5 group-hover:scale-[1.02] transition-transform duration-300"
                                            />
                                        )}
                                    </div>
                                    <div className="max-w-xl">
                                        <div className="flex items-center gap-x-4 text-xs">
                                            <time dateTime={blog.createdAt} className="text-gray-500 dark:text-gray-400">
                                                {format(new Date(blog.createdAt), 'MMM d, yyyy')}
                                            </time>
                                        </div>
                                        <div className="group relative">
                                            <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                <Link href={`/blogs/${blog.id}`}>
                                                    <span className="absolute inset-0" />
                                                    {blog.title}
                                                </Link>
                                            </h3>
                                            <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                                {truncateContent(blog.content)}
                                            </p>
                                        </div>
                                        <div className="relative mt-8 flex items-center gap-x-4">
                                            {blog.author.image ? (
                                                <img src={blog.author.image} alt="" className="h-10 w-10 rounded-full bg-gray-100" />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <FaUser className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className="text-sm leading-6">
                                                <p className="font-semibold text-gray-900 dark:text-white">
                                                    <span className="absolute inset-0" />
                                                    {blog.author.name || 'Anonymous'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.article>
                            ))
                        ) : (
                            <div className="col-span-3 text-center text-gray-500 py-10">
                                Loading trending posts...
                            </div>
                        )}
                    </div>

                    <div className="mt-16 text-center">
                        <Link
                            href="/blogs"
                            className="text-sm font-semibold leading-6 text-blue-600 dark:text-blue-400 hover:text-blue-500 flex items-center justify-center gap-2"
                        >
                            View all posts <FaArrowRight />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-24 sm:py-32">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Everything you need</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Write, Connect, Inspire
                        </p>
                        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Our platform provides all the tools you need to create engaging content and connect with your audience.
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                            {[
                                {
                                    name: 'Create Content',
                                    description: 'Rich text editor with markdown support to bring your ideas to life.',
                                    icon: FaPen,
                                },
                                {
                                    name: 'Connect',
                                    description: 'Engage with other users through comments, likes, and discussions.',
                                    icon: FaUsers,
                                },
                                {
                                    name: 'Secure',
                                    description: 'Your data is safe with us. We prioritize privacy and security.',
                                    icon: FaShieldAlt,
                                },
                            ].map((feature) => (
                                <motion.div
                                    key={feature.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="flex flex-col items-start p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <div className="rounded-lg bg-blue-600/10 p-2 ring-1 ring-blue-600/20 mb-4">
                                        <feature.icon className="h-6 w-6 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                    </div>
                                    <dt className="text-base font-semibold leading-7 text-gray-900 dark:text-white">
                                        {feature.name}
                                    </dt>
                                    <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-gray-600 dark:text-gray-300">
                                        <p className="flex-auto">{feature.description}</p>
                                    </dd>
                                </motion.div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative isolate py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                            Ready to start your journey?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Join our community today and start sharing your knowledge with the world.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <button
                                onClick={() => openAuth('signup')}
                                className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all transform hover:scale-105"
                            >
                                Join Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Section */}
            <div className="py-24 sm:py-32 bg-white dark:bg-gray-900">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Contact Us</h2>
                        <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
                            Have questions or suggestions? We'd love to hear from you.
                        </p>
                    </div>
                    <form className="mx-auto mt-16 max-w-xl sm:mt-20">
                        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="first-name" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    First name
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        name="first-name"
                                        id="first-name"
                                        autoComplete="given-name"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="last-name" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Last name
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="text"
                                        name="last-name"
                                        id="last-name"
                                        autoComplete="family-name"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Email
                                </label>
                                <div className="mt-2.5">
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        autoComplete="email"
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="sm:col-span-2">
                                <label htmlFor="message" className="block text-sm font-semibold leading-6 text-gray-900 dark:text-white">
                                    Message
                                </label>
                                <div className="mt-2.5">
                                    <textarea
                                        name="message"
                                        id="message"
                                        rows={4}
                                        className="block w-full rounded-md border-0 px-3.5 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 dark:bg-gray-800 dark:ring-gray-700 dark:text-white"
                                        defaultValue={''}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="mt-10">
                            <button
                                type="submit"
                                className="block w-full rounded-md bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                            >
                                Send message
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Auth Modal */}
            {isAuthModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-200 dark:border-gray-700"
                    >
                        <button
                            onClick={() => setIsAuthModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
                            {authMode === 'signin' ? 'Welcome Back' : 'Create Account'}
                        </h2>

                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4 text-sm text-center border border-red-200 dark:border-red-800">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            {authMode === 'signup' && (
                                <>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setRole('student')}
                                                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === 'student'
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                Student
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setRole('teacher')}
                                                className={`py-2 px-4 rounded-lg border text-sm font-medium transition-all ${role === 'teacher'
                                                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                                                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                    }`}
                                            >
                                                Teacher
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="you@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg shadow-blue-600/20"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    authMode === 'signin' ? 'Sign In' : 'Create Account'
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            {authMode === 'signin' ? (
                                <>
                                    Don't have an account?{' '}
                                    <button onClick={() => openAuth('signup')} className="text-blue-600 hover:underline font-medium">
                                        Sign up
                                    </button>
                                </>
                            ) : (
                                <>
                                    Already have an account?{' '}
                                    <button onClick={() => openAuth('signin')} className="text-blue-600 hover:underline font-medium">
                                        Sign in
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
