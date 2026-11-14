'use client'

import { useSession } from 'next-auth/react'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { format } from 'date-fns'
import { FaUser, FaHeart, FaComment } from 'react-icons/fa'

import FollowButton from '@/components/FollowButton'

interface Blog {
    id: string
    title: string
    content: string
    image: string | null
    createdAt: string
    author: {
        name: string | null
    }
    _count: {
        likes: number
        comments: number
    }
}

interface UserProfile {
    id: string
    name: string | null
    image: string | null
    bio: string | null
    role: string
    createdAt: string
    _count: {
        followedBy: number
        following: number
        blogs: number
    }
}

export default function PublicProfilePage() {
    const params = useParams()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params.id) {
            fetchData()
        }
    }, [params.id])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [userRes, blogsRes] = await Promise.all([
                fetch(`/api/users/${params.id}`),
                fetch(`/api/blogs?authorId=${params.id}`)
            ])

            if (userRes.ok) {
                const userData = await userRes.json()
                setUser(userData)
            }

            if (blogsRes.ok) {
                const blogsData = await blogsRes.json()
                setBlogs(blogsData)
            }
        } catch (error) {
            console.error('Error fetching profile data:', error)
        } finally {
            setLoading(false)
        }
    }

    const truncateContent = (content: string, maxLength: number = 100) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + '...'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User not found</h1>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                                    <FaUser className="text-gray-400 text-4xl" />
                                </div>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {user.name || 'Anonymous'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            Joined {format(new Date(user.createdAt), 'MMMM yyyy')} • <span className="capitalize text-blue-600 dark:text-blue-400 font-medium">{user.role}</span>
                        </p>

                        {/* Stats */}
                        <div className="flex items-center space-x-8 mb-6">
                            <div className="text-center">
                                <span className="block text-xl font-bold text-gray-900 dark:text-white">
                                    {user._count?.blogs || 0}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Posts</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl font-bold text-gray-900 dark:text-white">
                                    {user._count?.followedBy || 0}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Followers</span>
                            </div>
                            <div className="text-center">
                                <span className="block text-xl font-bold text-gray-900 dark:text-white">
                                    {user._count?.following || 0}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400">Following</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <FollowButton userId={user.id} />
                        </div>

                        {user.bio && (
                            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-6">
                                {user.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Posts by {user.name}</h2>

                {blogs.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            This user hasn&apos;t published any posts yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {blogs.map((blog) => (
                            <div
                                key={blog.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group border border-gray-100 dark:border-gray-700 flex flex-col"
                            >
                                {blog.image && (
                                    <div className="h-48 relative overflow-hidden">
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                    </div>
                                )}

                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 text-xs text-gray-500 dark:text-gray-400">
                                        <span>{format(new Date(blog.createdAt), 'MMM d, yyyy')}</span>
                                    </div>

                                    <Link href={`/blogs/${blog.id}`} className="block mb-2">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {blog.title}
                                        </h3>
                                    </Link>

                                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 flex-1 text-sm">
                                        {truncateContent(blog.content)}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                                        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center space-x-1">
                                                <FaHeart />
                                                <span>{blog._count.likes}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <FaComment />
                                                <span>{blog._count.comments}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
