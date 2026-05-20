'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { format } from 'date-fns'
import { FaUser, FaPen, FaHeart, FaComment, FaTrash } from 'react-icons/fa'
import UserListModal from '@/components/UserListModal'

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

export default function ProfilePage() {
    const { data: session, update } = useSession()
    const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts')
    const [blogs, setBlogs] = useState<Blog[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        image: ''
    })
    const [uploading, setUploading] = useState(false)
    const [stats, setStats] = useState({ followers: 0, following: 0 })
    const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; type: 'followers' | 'following'; title: string }>({
        isOpen: false,
        type: 'followers',
        title: ''
    })

    useEffect(() => {
        if (session?.user) {
            setEditForm({
                name: session.user.name || '',
                bio: (session.user as any).bio || '',
                image: session.user.image || ''
            })
            fetchBlogs()
            fetchStats()
        }
    }, [session, activeTab])

    const fetchStats = async () => {
        if (!session?.user?.id) return
        try {
            const res = await fetch(`/api/users/${session.user.id}`)
            if (res.ok) {
                const data = await res.json()
                setStats({
                    followers: data._count.followedBy,
                    following: data._count.following
                })
            }
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const fetchBlogs = async () => {
        setLoading(true)
        try {
            const queryParam = activeTab === 'posts'
                ? `authorId=${session?.user?.id}`
                : `likedBy=${session?.user?.id}`

            const res = await fetch(`/api/blogs?${queryParam}`)
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })
            const data = await res.json()
            if (data.url) {
                setEditForm(prev => ({ ...prev, image: data.url }))
            }
        } catch (error) {
            console.error('Error uploading image:', error)
        } finally {
            setUploading(false)
        }
    }

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            const res = await fetch(`/api/users/${session?.user?.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editForm),
            })

            if (res.ok) {
                const updatedUser = await res.json()
                await update({
                    ...session,
                    user: {
                        ...session?.user,
                        name: updatedUser.name,
                        image: updatedUser.image,
                        bio: updatedUser.bio
                    }
                })
                setIsEditModalOpen(false)
            }
        } catch (error) {
            console.error('Error updating profile:', error)
        }
    }

    const handleDelete = async (blogId: string) => {
        if (!confirm('Are you sure you want to delete this blog?')) return

        try {
            const res = await fetch(`/api/blogs/${blogId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                setBlogs(blogs.filter(blog => blog.id !== blogId))
            }
        } catch (error) {
            console.error('Error deleting blog:', error)
        }
    }

    const truncateContent = (content: string, maxLength: number = 100) => {
        if (content.length <= maxLength) return content
        return content.substring(0, maxLength) + '...'
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />

                {/* Profile Header */}
                <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                    <div className="container mx-auto px-4 py-12">
                        <div className="flex flex-col items-center text-center">
                            <div className="relative mb-4 group cursor-pointer" onClick={() => setIsEditModalOpen(true)}>
                                {session?.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-700 shadow-lg object-cover"
                                    />
                                ) : (
                                    <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center border-4 border-white dark:border-gray-700 shadow-lg">
                                        <FaUser className="text-gray-400 text-4xl" />
                                    </div>
                                )}
                                <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-md group-hover:scale-110 transition-transform">
                                    <FaPen className="text-sm" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {session?.user?.name}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                {session?.user?.email} • <span className="capitalize text-blue-600 dark:text-blue-400 font-medium">{session?.user?.role}</span>
                            </p>

                            {/* Follow Stats */}
                            <div className="flex items-center space-x-6 mb-6 text-sm">
                                <button
                                    onClick={() => setModalConfig({ isOpen: true, type: 'followers', title: 'Followers' })}
                                    className="flex flex-col items-center hover:opacity-80 transition-opacity"
                                >
                                    <span className="font-bold text-gray-900 dark:text-white text-lg">{stats.followers}</span>
                                    <span className="text-gray-500 dark:text-gray-400">Followers</span>
                                </button>
                                <button
                                    onClick={() => setModalConfig({ isOpen: true, type: 'following', title: 'Following' })}
                                    className="flex flex-col items-center hover:opacity-80 transition-opacity"
                                >
                                    <span className="font-bold text-gray-900 dark:text-white text-lg">{stats.following}</span>
                                    <span className="text-gray-500 dark:text-gray-400">Following</span>
                                </button>
                            </div>

                            {(session?.user as any)?.bio && (
                                <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto mb-6">
                                    {(session?.user as any).bio}
                                </p>
                            )}

                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="px-6 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors mb-8"
                            >
                                Edit Profile
                            </button>

                            <div className="flex space-x-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('posts')}
                                    className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === 'posts'
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    My Posts
                                </button>
                                <button
                                    onClick={() => setActiveTab('liked')}
                                    className={`px-6 py-2 rounded-md font-medium transition-all ${activeTab === 'liked'
                                        ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    Liked Posts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="container mx-auto px-4 py-12">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : blogs.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                                {activeTab === 'posts'
                                    ? "You haven't written any posts yet."
                                    : "You haven't liked any posts yet."}
                            </p>
                            {activeTab === 'posts' && (
                                <Link
                                    href="/blogs/new"
                                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30"
                                >
                                    Create Your First Post
                                </Link>
                            )}
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

                                            {activeTab === 'posts' && (
                                                <button
                                                    onClick={() => handleDelete(blog.id)}
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                    title="Delete post"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Edit Profile Modal */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Profile</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Profile Image
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                                            {editForm.image ? (
                                                <img src={editForm.image} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <FaUser className="w-8 h-8 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="block w-full text-sm text-gray-500 dark:text-gray-400
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-blue-50 file:text-blue-700
                                                hover:file:bg-blue-100
                                                dark:file:bg-blue-900/30 dark:file:text-blue-400"
                                        />
                                    </div>
                                    {uploading && <p className="text-sm text-blue-600 mt-1">Uploading...</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Bio
                                    </label>
                                    <textarea
                                        value={editForm.bio}
                                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                        placeholder="Tell us about yourself..."
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* User List Modal */}
                {session?.user?.id && (
                    <UserListModal
                        isOpen={modalConfig.isOpen}
                        onClose={() => setModalConfig(prev => ({ ...prev, isOpen: false }))}
                        title={modalConfig.title}
                        userId={session.user.id}
                        type={modalConfig.type}
                    />
                )}
            </div>
        </ProtectedRoute>
    )
}
