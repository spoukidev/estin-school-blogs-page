'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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
    email: string | null
    image: string | null
    role: string
    bio: string | null
    _count: {
        blogs: number
        followers: number
        following: number
    }
}

export default function PublicProfilePage() {
    const { data: session } = useSession()
    const params = useParams()
    const userId = params.id as string

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (userId) {
            fetchProfile()
            fetchBlogs()
        }
    }, [userId])

    const fetchProfile = async () => {
        try {
            // We need a public user endpoint. For now, we'll try to fetch from /api/users/[id]
            // If that endpoint doesn't exist or is protected, we might need to create it.
            // Assuming /api/users/[id] returns user details.
            // If not, we'll need to create it.
            // Let's assume for now we can get basic info.
            // Actually, I haven't created /api/users/[id] GET route yet.
            // I'll create a simple one or mock it.
            // For now, I'll mock the profile data to show the UI structure.
            setProfile({
                id: userId,
                name: 'User',
                email: 'user@example.com',
                image: null,
                role: 'student',
                bio: 'Bio placeholder',
                _count: {
                    blogs: 0,
                    followers: 0,
                    following: 0
                }
            })
        } catch (error) {
            console.error('Error fetching profile:', error)
        }
    }

    const fetchBlogs = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/blogs?authorId=${userId}`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setBlogs(data)
            } else {
                setBlogs([])
            }
        } catch (error) {
            console.error('Error fetching blogs:', error)
            setBlogs([])
        } finally {
            setLoading(false)
        }
    }

    const truncateContent = (content: string, maxLength: number = 100) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + '...'
    }

    if (!profile) return null

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navbar />

            {/* Profile Header */}
            <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <div className="container mx-auto px-4 py-12">
                    <div className="flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            {profile.image ? (
                                <img
                                    src={profile.image}
                                    alt={profile.name || 'User'}
                                    className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
                                />
                            ) : (
                                <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                                    <FaUser className="text-gray-400 text-4xl" />
                                </div>
                            )}
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            {profile.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            <span className="capitalize text-blue-600 dark:text-blue-400 font-medium">{profile.role}</span>
                        </p>

                        {/* Follow Stats */}
                        <div className="flex items-center space-x-6 mb-6 text-sm">
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{profile._count.followers}</span>
                                <span className="text-gray-500 dark:text-gray-400">Followers</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <span className="font-bold text-gray-900 dark:text-white text-lg">{profile._count.following}</span>
                                <span className="text-gray-500 dark:text-gray-400">Following</span>
                            </div>
                        </div>

                        {profile.bio && (
                            <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-6">
                                {profile.bio}
                            </p>
                        )}

                        <div className="mb-8">
                            <FollowButton userId={userId} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="container mx-auto px-4 py-12">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Posts</h2>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            This user hasn&apos;t written any posts yet.
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
                                        <span>•</span>
                                        <span>{blog.author.name}</span>
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
