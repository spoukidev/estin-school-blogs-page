'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FaTimes, FaUser } from 'react-icons/fa'
import FollowButton from './FollowButton'

interface User {
    id: string
    name: string | null
    image: string | null
    bio: string | null
    role: string
}

interface UserListModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    userId: string
    type: 'followers' | 'following'
}

export default function UserListModal({ isOpen, onClose, title, userId, type }: UserListModalProps) {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
        }
    }, [isOpen, userId, type])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/users/${userId}/follows?type=${type}`)
            if (res.ok) {
                const data = await res.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* List */}
                <div className="overflow-y-auto p-4 flex-1">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            No users found.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {users.map((user) => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <Link
                                        href={`/users/${user.id}`}
                                        className="flex items-center gap-3 group flex-1 min-w-0"
                                        onClick={onClose}
                                    >
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name || 'User'}
                                                className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-700 object-cover flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                                <FaUser className="text-gray-400" />
                                            </div>
                                        )}
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                                                {user.name || 'Anonymous'}
                                            </span>
                                            {user.bio && (
                                                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {user.bio}
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="ml-3 flex-shrink-0">
                                        <FollowButton userId={user.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
