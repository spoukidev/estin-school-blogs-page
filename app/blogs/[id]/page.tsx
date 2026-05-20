'use client'

import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import Link from 'next/link'
import { format } from 'date-fns'
import { FaHeart, FaUser, FaTrash, FaPen } from 'react-icons/fa'
import FollowButton from '@/components/FollowButton'

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
    likes: Array<{
        user: {
            id: string
            name: string | null
            image: string | null
        }
    }>
}

interface Comment {
    id: string
    content: string
    author: {
        id: string
        name: string | null
        image: string | null
        role: string
    }
    createdAt: string
}

export default function BlogDetailPage() {
    const { data: session } = useSession()
    const params = useParams()
    const router = useRouter()
    const [blog, setBlog] = useState<Blog | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [commentContent, setCommentContent] = useState('')
    const [loading, setLoading] = useState(true)

    const [isLikesModalOpen, setIsLikesModalOpen] = useState(false)

    useEffect(() => {
        if (params.id) {
            fetchBlog()
            fetchComments()
        }
    }, [params.id])

    const fetchBlog = async () => {
        try {
            const res = await fetch(`/api/blogs/${params.id}`)
            const data = await res.json()
            setBlog(data)
        } catch (error) {
            console.error('Error fetching blog:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/blogs/${params.id}/comments`)
            const data = await res.json()
            if (Array.isArray(data)) {
                setComments(data)
            } else {
                setComments([])
            }
        } catch (error) {
            console.error('Error fetching comments:', error)
            setComments([])
        }
    }

    const handleLike = async () => {
        try {
            const res = await fetch('/api/blogs/like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ blogId: params.id }),
            })
            if (res.ok) {
                fetchBlog()
            }
        } catch (error) {
            console.error('Error liking blog:', error)
        }
    }

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!commentContent.trim()) return

        try {
            const res = await fetch(`/api/blogs/${params.id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: commentContent }),
            })
            if (res.ok) {
                setCommentContent('')
                fetchComments()
            }
        } catch (error) {
            console.error('Error posting comment:', error)
        }
    }

    const handleDeleteBlog = async () => {
        if (!confirm('Are you sure you want to delete this blog?')) return

        try {
            const res = await fetch(`/api/blogs/${params.id}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                router.push('/blogs')
            }
        } catch (error) {
            console.error('Error deleting blog:', error)
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return

        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
            })
            if (res.ok) {
                fetchComments()
            }
        } catch (error) {
            console.error('Error deleting comment:', error)
        }
    }

    const isLiked = blog?.likes.some(like => like.user.id === session?.user?.id)
    const canDelete = blog && (session?.user?.id === blog.author.id || session?.user?.role === 'admin')

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </ProtectedRoute>
        )
    }

    if (!blog) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <p className="text-gray-600 dark:text-gray-400">Blog not found</p>
                </div>
            </ProtectedRoute>
        )
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />

                {/* Cover Image */}
                {blog.image && (
                    <div className="w-full h-96 relative">
                        <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    </div>
                )}

                <div className={`container mx-auto px-4 py-8 max-w-4xl ${blog.image ? '-mt-32 relative z-10' : ''}`}>
                    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 mb-6">
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2 mb-4">
                                {blog.categories?.map(cat => (
                                    <span key={cat.id} className="text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">
                                        {cat.name}
                                    </span>
                                ))}
                            </div>

                            <div className="flex justify-between items-start">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                                    {blog.title}
                                </h1>
                                {canDelete && (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => router.push(`/blogs/${params.id}/edit`)}
                                            className="text-blue-600 hover:text-blue-700 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full transition-colors"
                                            title="Edit blog"
                                        >
                                            <FaPen />
                                        </button>
                                        <button
                                            onClick={handleDeleteBlog}
                                            className="text-red-600 hover:text-red-700 p-2 bg-red-50 dark:bg-red-900/20 rounded-full transition-colors"
                                            title="Delete blog"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700 pb-6">
                                <div className="flex items-center space-x-4">
                                    <Link href={`/users/${blog.author.id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                                        {blog.author.image ? (
                                            <img
                                                src={blog.author.image}
                                                alt={blog.author.name || 'Author'}
                                                className="w-10 h-10 rounded-full border-2 border-white dark:border-gray-700"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                <FaUser className="text-gray-400" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">{blog.author.name || 'Anonymous'}</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400">{blog.author.role}</p>
                                        </div>
                                    </Link>
                                    <FollowButton userId={blog.author.id} />
                                </div>
                                <span className="text-gray-300 dark:text-gray-600">|</span>
                                <span>{format(new Date(blog.createdAt), 'MMMM d, yyyy')}</span>
                            </div>
                        </div>

                        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                            <p className="whitespace-pre-wrap leading-relaxed text-gray-700 dark:text-gray-300">
                                {blog.content}
                            </p>
                        </div>

                        <div className="flex items-center space-x-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={handleLike}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all transform hover:scale-105 ${isLiked
                                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                >
                                    <FaHeart className={isLiked ? 'fill-current' : ''} />
                                    <span className="font-medium">Like</span>
                                </button>
                                <button
                                    onClick={() => setIsLikesModalOpen(true)}
                                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                                >
                                    {blog._count.likes} Likes
                                </button>
                            </div>
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{blog._count.comments} Comments</span>
                        </div>
                    </article>

                    {/* Comments Section */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Discussion</h2>

                        <form onSubmit={handleComment} className="mb-10">
                            <div className="relative">
                                <textarea
                                    value={commentContent}
                                    onChange={(e) => setCommentContent(e.target.value)}
                                    placeholder="What are your thoughts?"
                                    className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white resize-none transition-shadow focus:shadow-lg"
                                    rows={4}
                                />
                                <button
                                    type="submit"
                                    className="absolute bottom-4 right-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
                                >
                                    Post Comment
                                </button>
                            </div>
                        </form>

                        <div className="space-y-6">
                            {comments.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                                    <p className="text-gray-500 dark:text-gray-400">No comments yet. Start the conversation!</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment.id} className="group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center space-x-3">
                                                <Link href={`/users/${comment.author.id}`}>
                                                    {comment.author.image ? (
                                                        <img
                                                            src={comment.author.image}
                                                            alt={comment.author.name || 'User'}
                                                            className="w-8 h-8 rounded-full hover:opacity-80 transition-opacity"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center hover:opacity-80 transition-opacity">
                                                            <FaUser className="text-gray-400" />
                                                        </div>
                                                    )}
                                                </Link>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Link href={`/users/${comment.author.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                                                            {comment.author.name || 'Anonymous'}
                                                        </Link>
                                                        <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-0.5 rounded-full">
                                                            {comment.author.role}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                                                    </span>
                                                </div>
                                            </div>
                                            {(session?.user?.id === comment.author.id || session?.user?.role === 'admin') && (
                                                <button
                                                    onClick={() => handleDeleteComment(comment.id)}
                                                    className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all p-2"
                                                    title="Delete comment"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                        <div className="pl-11">
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg rounded-tl-none">
                                                {comment.content}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Likes Modal */}
                {isLikesModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setIsLikesModalOpen(false)}>
                        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Liked by</h2>
                                <button onClick={() => setIsLikesModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                    ✕
                                </button>
                            </div>
                            <div className="max-h-96 overflow-y-auto space-y-4">
                                {blog.likes.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">No likes yet.</p>
                                ) : (
                                    blog.likes.map((like: any) => (
                                        <Link
                                            key={like.user.id}
                                            href={`/users/${like.user.id}`}
                                            className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors"
                                            onClick={() => setIsLikesModalOpen(false)}
                                        >
                                            {like.user.image ? (
                                                <img
                                                    src={like.user.image}
                                                    alt={like.user.name || 'User'}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                                    <FaUser className="text-gray-400" />
                                                </div>
                                            )}
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {like.user.name || 'Anonymous'}
                                            </span>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    )
}
