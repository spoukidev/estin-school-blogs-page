'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { format } from 'date-fns'
import { FaHeart, FaComment, FaUser, FaFire, FaFilter } from 'react-icons/fa'
import Sidebar from '@/components/Sidebar'

interface Category {
    id: string
    name: string
}

interface Blog {
    id: string
    title: string
    content: string
    image: string | null
    author: {
        id: string
        name: string | null
        image: string | null
        role: string
    }
    categories: Category[]
    createdAt: string
    _count: {
        likes: number
        comments: number
    }
    likes: Array<{ userId: string }>
}

export default function BlogsPage() {
    const { data: session } = useSession()
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [sortBy, setSortBy] = useState<'latest' | 'trending'>('latest')
    const [followingFilter, setFollowingFilter] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchBlogs()
    }, [selectedCategory, sortBy, followingFilter])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchBlogs = async () => {
        setLoading(true)
        try {
            let url = `/api/blogs?sort=${sortBy}`
            if (selectedCategory) {
                url += `&categoryId=${selectedCategory}`
            }
            if (followingFilter) {
                url += `&following=true`
            }
            const res = await fetch(url)
            const data = await res.json()
            if (Array.isArray(data)) {
                setBlogs(data)
            } else {
                console.error('API returned non-array data:', data)
                setBlogs([])
            }
        } catch (error) {
            console.error('Error fetching blogs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async (blogId: string) => {
        try {
            const res = await fetch('/api/blogs/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogId }),
            })
            if (res.ok) {
                fetchBlogs()
            }
        } catch (error) {
            console.error('Error liking blog:', error)
        }
    }

    const isLiked = (blog: Blog) => {
        return blog.likes.some(like => like.userId === session?.user?.id)
    }

    const truncateContent = (content: string, maxLength: number = 150) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + '...'
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors duration-300">
                <Navbar />
                <div className="container mx-auto px-4 py-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Mobile Filter Button */}
                        <div className="lg:hidden mb-4">
                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="w-full flex items-center justify-center gap-2 bg-white dark:bg-primary-900 p-3 rounded-lg shadow-sm border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-200 font-medium hover:bg-primary-50 dark:hover:bg-primary-800 transition-colors"
                            >
                                <FaFilter />
                                <span>Filters & Menu</span>
                            </button>
                        </div>

                        {/* Sidebar */}
                        <Sidebar
                            categories={categories}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            sortBy={sortBy}
                            setSortBy={setSortBy}
                            followingFilter={followingFilter}
                            setFollowingFilter={setFollowingFilter}
                            isOpen={isSidebarOpen}
                            onClose={() => setIsSidebarOpen(false)}
                        />

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">
                                        {followingFilter
                                            ? 'Following'
                                            : selectedCategory
                                                ? `${categories.find(c => c.id === selectedCategory)?.name}`
                                                : 'Discover'}
                                    </h1>
                                    <p className="text-primary-500 dark:text-primary-400">
                                        {followingFilter
                                            ? 'Latest posts from people you follow'
                                            : selectedCategory
                                                ? `Explore the latest in ${categories.find(c => c.id === selectedCategory)?.name}`
                                                : 'Explore the latest thoughts and ideas'}
                                    </p>
                                </div>

                                <div className="flex bg-white dark:bg-primary-900 p-1 rounded-lg shadow-sm border border-primary-200 dark:border-primary-800">
                                    <button
                                        onClick={() => setSortBy('latest')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${sortBy === 'latest'
                                            ? 'bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-white shadow-sm'
                                            : 'text-primary-500 dark:text-primary-400 hover:text-primary-900 dark:hover:text-white'
                                            }`}
                                    >
                                        Latest
                                    </button>
                                    <button
                                        onClick={() => setSortBy('trending')}
                                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${sortBy === 'trending'
                                            ? 'bg-primary-100 dark:bg-primary-800 text-primary-900 dark:text-white shadow-sm'
                                            : 'text-primary-500 dark:text-primary-400 hover:text-primary-900 dark:hover:text-white'
                                            }`}
                                    >
                                        <FaFire className={sortBy === 'trending' ? 'text-orange-500' : ''} />
                                        Trending
                                    </button>
                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
                                </div>
                            ) : blogs.length === 0 ? (
                                <div className="text-center py-20 bg-white dark:bg-primary-900 rounded-xl shadow-sm border border-dashed border-primary-200 dark:border-primary-800">
                                    <p className="text-primary-600 dark:text-primary-400 text-lg mb-4">No blogs found.</p>
                                    <Link
                                        href="/blogs/new"
                                        className="bg-accent-600 text-white px-6 py-3 rounded-lg hover:bg-accent-700 transition-colors font-medium inline-block shadow-lg shadow-accent-600/30"
                                    >
                                        Create First Blog
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-8">
                                    {blogs.map((blog) => (
                                        <div
                                            key={blog.id}
                                            className="bg-white dark:bg-primary-900 rounded-xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 group border border-primary-200 dark:border-primary-800"
                                        >
                                            <div className="md:flex">
                                                {blog.image && (
                                                    <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
                                                        <img
                                                            src={blog.image}
                                                            alt={blog.title}
                                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                                    </div>
                                                )}
                                                <div className="p-6 flex-1 flex flex-col">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {blog.categories.map(cat => (
                                                            <span key={cat.id} className="text-xs font-bold uppercase tracking-wider text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-900/30 px-2 py-1 rounded-full">
                                                                {cat.name}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    <Link href={`/blogs/${blog.id}`} className="block mb-2">
                                                        <h2 className="text-2xl font-bold text-primary-900 dark:text-white group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                                                            {blog.title}
                                                        </h2>
                                                    </Link>

                                                    <p className="text-primary-600 dark:text-primary-300 mb-4 line-clamp-2 flex-1">
                                                        {truncateContent(blog.content)}
                                                    </p>

                                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-primary-100 dark:border-primary-800">
                                                        <div className="flex items-center space-x-3">
                                                            {blog.author.image ? (
                                                                <img
                                                                    src={blog.author.image}
                                                                    alt={blog.author.name || 'Author'}
                                                                    className="w-8 h-8 rounded-full border border-primary-200 dark:border-primary-700"
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                                                                    <FaUser className="text-primary-400 text-xs" />
                                                                </div>
                                                            )}
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-medium text-primary-900 dark:text-white">
                                                                    {blog.author.name || 'Anonymous'}
                                                                </span>
                                                                <span className="text-xs text-primary-500 dark:text-primary-400">
                                                                    {format(new Date(blog.createdAt), 'MMM d')}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center space-x-4">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    handleLike(blog.id)
                                                                }}
                                                                className={`flex items-center space-x-1.5 text-sm transition-colors ${isLiked(blog)
                                                                    ? 'text-red-500'
                                                                    : 'text-primary-500 dark:text-primary-400 hover:text-red-500'
                                                                    }`}
                                                            >
                                                                <FaHeart className={isLiked(blog) ? 'fill-current' : ''} />
                                                                <span>{blog._count.likes}</span>
                                                            </button>

                                                            <Link
                                                                href={`/blogs/${blog.id}`}
                                                                className="flex items-center space-x-1.5 text-sm text-primary-500 dark:text-primary-400 hover:text-accent-600 transition-colors"
                                                            >
                                                                <FaComment />
                                                                <span>{blog._count.comments}</span>
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
