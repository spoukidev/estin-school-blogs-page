'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import { format } from 'date-fns'
import { FaUser, FaTrash, FaEdit, FaShieldAlt, FaBlog, FaComments, FaTag, FaSearch, FaTimes } from 'react-icons/fa'

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  createdAt: string
  _count: {
    blogs: number
    comments: number
  }
}

interface BlogPost {
  id: string
  title: string
  content: string
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

interface Comment {
  id: string
  content: string
  author: {
    name: string | null
    image: string | null
  }
  blog: {
    title: string
  }
  createdAt: string
}

interface Category {
  id: string
  name: string
  _count?: {
    blogs: number
  }
}

export default function AdminPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'users' | 'posts' | 'comments' | 'categories'>('users')

  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [loading, setLoading] = useState(true)
  const [editingUser, setEditingUser] = useState<string | null>(null)
  const [newRole, setNewRole] = useState('')
  const [newCategory, setNewCategory] = useState('')
  const [categoryError, setCategoryError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (session?.user?.role === 'admin') {
      fetchData()
    } else if (session?.user && session.user.role !== 'admin') {
      router.push('/blogs')
    }
  }, [session, router, activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'users') {
        const res = await fetch('/api/users')
        if (res.ok) setUsers(await res.json())
      } else if (activeTab === 'posts') {
        const res = await fetch('/api/blogs')
        if (res.ok) setPosts(await res.json())
      } else if (activeTab === 'comments') {
        const res = await fetch('/api/comments')
        if (res.ok) setComments(await res.json())
      } else if (activeTab === 'categories') {
        const res = await fetch('/api/categories')
        if (res.ok) setCategories(await res.json())
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab}:`, error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      if (res.ok) {
        fetchData()
        setEditingUser(null)
      }
    } catch (error) {
      console.error('Error updating user role:', error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will also delete all their blogs and comments.')) return
    try {
      const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return
    try {
      const res = await fetch(`/api/blogs/${postId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error deleting comment:', error)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCategoryError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory }),
      })
      if (res.ok) {
        setNewCategory('')
        fetchData()
      } else {
        const data = await res.json()
        setCategoryError(data.error || 'Failed to create category')
      }
    } catch (error) {
      setCategoryError('An error occurred')
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' })
      if (res.ok) fetchData()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (session?.user?.role !== 'admin') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-primary-50 dark:bg-primary-950">
          <div className="text-center">
            <FaShieldAlt className="mx-auto text-4xl text-primary-400 mb-4" />
            <p className="text-primary-600 dark:text-primary-400 text-lg">Access denied. Admin privileges required.</p>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primary-50 dark:bg-primary-950 transition-colors duration-300">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-primary-900 dark:text-white mb-2">Admin Dashboard</h1>
              <p className="text-primary-500 dark:text-primary-400">Manage users, roles, and content.</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-white dark:bg-primary-900 p-1 rounded-xl border border-primary-200 dark:border-primary-800 w-fit">
            {[
              { id: 'users', label: 'Users', icon: FaUser },
              { id: 'posts', label: 'Posts', icon: FaBlog },
              { id: 'comments', label: 'Comments', icon: FaComments },
              { id: 'categories', label: 'Categories', icon: FaTag },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                  ? 'bg-accent-50 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 shadow-sm'
                  : 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-800'
                  }`}
              >
                <tab.icon />
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-600"></div>
            </div>
          ) : (
            <>
              {/* Add Category Form */}
              {activeTab === 'categories' && (
                <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-6 mb-6">
                  <h2 className="text-xl font-semibold text-primary-900 dark:text-white mb-4">Add New Category</h2>
                  <form onSubmit={handleAddCategory} className="flex gap-4">
                    <input
                      type="text"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Category Name"
                      className="flex-1 px-4 py-2.5 bg-white dark:bg-primary-800 border border-primary-300 dark:border-primary-600 rounded-lg text-primary-900 dark:text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-accent-600 text-white px-6 py-2.5 rounded-lg hover:bg-accent-700 transition-colors shadow-lg shadow-accent-600/30 font-medium"
                    >
                      Add Category
                    </button>
                  </form>
                  {categoryError && <p className="text-red-500 dark:text-red-400 mt-3 text-sm">{categoryError}</p>}
                </div>
              )}

              {/* User Search Bar */}
              {activeTab === 'users' && (
                <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-4 mb-6">
                  <div className="relative">
                    <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search users by email..."
                      className="w-full pl-12 pr-12 py-2.5 bg-white dark:bg-primary-800 border border-primary-300 dark:border-primary-600 rounded-lg text-primary-900 dark:text-white placeholder-primary-400 focus:outline-none focus:ring-2 focus:ring-accent-500 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 transition-colors"
                        title="Clear search"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-primary-50 dark:bg-primary-800/50 border-b border-primary-200 dark:border-primary-800">
                      <tr>
                        {activeTab === 'users' && (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">User</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Stats</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Joined</th>
                          </>
                        )}
                        {activeTab === 'posts' && (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Title</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Engagement</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Date</th>
                          </>
                        )}
                        {activeTab === 'comments' && (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Content</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Author</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Post</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Date</th>
                          </>
                        )}
                        {activeTab === 'categories' && (
                          <>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">ID</th>
                          </>
                        )}
                        <th className="px-6 py-4 text-right text-xs font-semibold text-primary-500 dark:text-primary-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-100 dark:divide-primary-800">
                      {activeTab === 'users' && filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {user.image ? (
                                <img src={user.image} alt={user.name || 'User'} className="w-10 h-10 rounded-full mr-3 border border-primary-200 dark:border-primary-700" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center mr-3">
                                  <FaUser className="text-primary-400 text-sm" />
                                </div>
                              )}
                              <Link href={`/users/${user.id}`} className="hover:opacity-80 transition-opacity">
                                <div className="text-sm font-medium text-primary-900 dark:text-white hover:text-accent-600 dark:hover:text-accent-400 transition-colors">{user.name || 'Anonymous'}</div>
                                <div className="text-sm text-primary-500 dark:text-primary-400">{user.email}</div>
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser === user.id ? (
                              <select
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value)}
                                className="bg-white dark:bg-primary-800 border border-primary-300 dark:border-primary-600 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 dark:text-white"
                                onBlur={() => {
                                  if (newRole && newRole !== user.role) handleRoleChange(user.id, newRole)
                                  else setEditingUser(null)
                                }}
                                autoFocus
                              >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Admin</option>
                              </select>
                            ) : (
                              <span className={`inline-flex px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                user.role === 'teacher' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-primary-100 text-primary-700 dark:bg-primary-800 dark:text-primary-300'
                                }`}>
                                {user.role}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs text-primary-500 dark:text-primary-400"><span className="font-medium text-primary-900 dark:text-white">{user._count.blogs}</span> Blogs</span>
                              <span className="text-xs text-primary-500 dark:text-primary-400"><span className="font-medium text-primary-900 dark:text-white">{user._count.comments}</span> Comments</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500 dark:text-primary-400">
                            {format(new Date(user.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <button onClick={() => { setEditingUser(user.id); setNewRole(user.role) }} className="text-primary-400 hover:text-accent-600 dark:hover:text-accent-400 transition-colors" title="Edit role">
                                <FaEdit />
                              </button>
                              {user.id !== session?.user?.id && (
                                <button onClick={() => handleDeleteUser(user.id)} className="text-primary-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete user">
                                  <FaTrash />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'posts' && posts.map((post) => (
                        <tr key={post.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/blogs/${post.id}`} target="_blank" className="text-sm font-medium text-primary-900 dark:text-white hover:text-accent-600 dark:hover:text-accent-400 line-clamp-1 transition-colors">
                              {post.title}
                            </Link>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-primary-500 dark:text-primary-400 line-clamp-2 max-w-xs">{post.content}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {post.author.image ? (
                                <img src={post.author.image} alt={post.author.name || 'User'} className="w-6 h-6 rounded-full mr-2" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center mr-2">
                                  <FaUser className="text-primary-400 text-xs" />
                                </div>
                              )}
                              <span className="text-sm text-primary-600 dark:text-primary-300">{post.author.name || 'Anonymous'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-3 text-xs text-primary-500 dark:text-primary-400">
                              <span>{post._count.likes} Likes</span>
                              <span>{post._count.comments} Comments</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500 dark:text-primary-400">
                            {format(new Date(post.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeletePost(post.id)} className="text-primary-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete post">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'comments' && comments.map((comment) => (
                        <tr key={comment.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm text-primary-600 dark:text-primary-300 line-clamp-2 max-w-md">{comment.content}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {comment.author.image ? (
                                <img src={comment.author.image} alt={comment.author.name || 'User'} className="w-6 h-6 rounded-full mr-2" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center mr-2">
                                  <FaUser className="text-primary-400 text-xs" />
                                </div>
                              )}
                              <span className="text-sm text-primary-600 dark:text-primary-300">{comment.author.name || 'Anonymous'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary-500 dark:text-primary-400 line-clamp-1 max-w-[150px]">{comment.blog.title}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-primary-500 dark:text-primary-400">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeleteComment(comment.id)} className="text-primary-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete comment">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {activeTab === 'categories' && categories.map((category) => (
                        <tr key={category.id} className="hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-primary-900 dark:text-white">{category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-primary-500 dark:text-primary-400 font-mono">{category.id}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button onClick={() => handleDeleteCategory(category.id)} className="text-primary-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete category">
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Empty States */}
                  {activeTab === 'users' && filteredUsers.length === 0 && (
                    <div className="p-8 text-center text-primary-500 dark:text-primary-400">
                      {searchQuery ? `No users found matching "${searchQuery}"` : 'No users found.'}
                    </div>
                  )}
                  {activeTab === 'posts' && posts.length === 0 && (
                    <div className="p-8 text-center text-primary-500 dark:text-primary-400">No posts found.</div>
                  )}
                  {activeTab === 'comments' && comments.length === 0 && (
                    <div className="p-8 text-center text-primary-500 dark:text-primary-400">No comments found.</div>
                  )}
                  {activeTab === 'categories' && categories.length === 0 && (
                    <div className="p-8 text-center text-primary-500 dark:text-primary-400">No categories found.</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
