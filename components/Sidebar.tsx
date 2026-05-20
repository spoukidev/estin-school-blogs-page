
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
    FaFire,
    FaHashtag,
    FaCompass,
    FaUserFriends,
    FaCog,
    FaSignOutAlt,
    FaUserPlus,
    FaUser,
    FaTimes
} from 'react-icons/fa'
import FollowButton from './FollowButton'

interface Category {
    id: string
    name: string
}

interface SidebarProps {
    categories: Category[]
    selectedCategory: string | null
    setSelectedCategory: (id: string | null) => void
    sortBy: 'latest' | 'trending'
    setSortBy: (sort: 'latest' | 'trending') => void
    followingFilter: boolean
    setFollowingFilter: (filter: boolean) => void
    isOpen?: boolean
    onClose?: () => void
}

interface SuggestedUser {
    id: string
    name: string | null
    image: string | null
    role: string
    _count: {
        followedBy: number
    }
}

export default function Sidebar({
    categories,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    setSortBy,
    followingFilter,
    setFollowingFilter,
    isOpen = false,
    onClose
}: SidebarProps) {
    const { data: session } = useSession()
    const [suggestions, setSuggestions] = useState<SuggestedUser[]>([])
    const [showAllTopics, setShowAllTopics] = useState(false)
    const router = useRouter()

    useEffect(() => {
        fetchSuggestions()
    }, [session])

    const fetchSuggestions = async () => {
        try {
            const res = await fetch('/api/users/suggestions')
            if (res.ok) {
                const data = await res.json()
                setSuggestions(data)
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error)
        }
    }

    const handleLogout = async () => {
        await signOut({ redirect: false })
        router.push('/login')
    }

    const displayedCategories = showAllTopics ? categories : categories.slice(0, 4)

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Content */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-primary-950 lg:bg-transparent lg:dark:bg-transparent
                transform transition-transform duration-300 ease-in-out lg:transform-none flex-shrink-0 space-y-8 p-4 lg:p-0 overflow-y-auto
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Mobile Header */}
                <div className="flex items-center justify-between lg:hidden mb-6">
                    <span className="text-xl font-bold text-primary-900 dark:text-white">Menu</span>
                    <button
                        onClick={onClose}
                        className="p-2 text-primary-500 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition-colors"
                    >
                        <FaTimes />
                    </button>
                </div>

                {/* Main Menu */}
                <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-6">
                    <h2 className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider mb-4">
                        Menu
                    </h2>
                    <div className="space-y-1">
                        <button
                            onClick={() => {
                                setSelectedCategory(null)
                                setFollowingFilter(false)
                                setSortBy('latest')
                                onClose?.()
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium flex items-center gap-3 ${selectedCategory === null && !followingFilter && sortBy === 'latest'
                                ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400'
                                : 'text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800'
                                }`}
                        >
                            <FaCompass className={selectedCategory === null && !followingFilter && sortBy === 'latest' ? 'text-accent-600' : 'text-primary-400'} />
                            <span>Discover</span>
                        </button>

                        <button
                            onClick={() => {
                                setSelectedCategory(null)
                                setFollowingFilter(false)
                                setSortBy('trending')
                                onClose?.()
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium flex items-center gap-3 ${selectedCategory === null && !followingFilter && sortBy === 'trending'
                                ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400'
                                : 'text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800'
                                }`}
                        >
                            <FaFire className={selectedCategory === null && !followingFilter && sortBy === 'trending' ? 'text-accent-600' : 'text-primary-400'} />
                            <span>Trending</span>
                        </button>

                        <button
                            onClick={() => {
                                setFollowingFilter(true)
                                setSelectedCategory(null)
                                setSortBy('latest')
                                onClose?.()
                            }}
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium flex items-center gap-3 ${followingFilter
                                ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400'
                                : 'text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800'
                                }`}
                        >
                            <FaUserFriends className={followingFilter ? 'text-accent-600' : 'text-primary-400'} />
                            <span>Following</span>
                        </button>

                    </div>
                </div>

                {/* Topics */}
                <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-6">
                    <h2 className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider mb-4">
                        Topics
                    </h2>
                    <div className="space-y-1">
                        {displayedCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setSelectedCategory(category.id)
                                    setFollowingFilter(false)
                                    onClose?.()
                                }}
                                className={`w-full text-left px-4 py-2.5 rounded-lg transition-all duration-200 font-medium flex items-center justify-between group ${selectedCategory === category.id
                                    ? 'bg-accent-50 text-accent-600 dark:bg-accent-900/20 dark:text-accent-400'
                                    : 'text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <FaHashtag className={selectedCategory === category.id ? 'text-accent-600' : 'text-primary-400'} />
                                    <span>{category.name}</span>
                                </div>
                            </button>
                        ))}

                        {categories.length > 4 && (
                            <button
                                onClick={() => setShowAllTopics(!showAllTopics)}
                                className="w-full text-left px-4 py-2 text-sm font-medium text-accent-600 dark:text-accent-400 hover:text-accent-700 dark:hover:text-accent-300 transition-colors mt-2"
                            >
                                {showAllTopics ? 'Show Less' : 'Show More'}
                            </button>
                        )}
                    </div>
                </div>

                {/* Who to Follow */}
                {suggestions.length > 0 && (
                    <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-6">
                        <h2 className="text-xs font-bold text-primary-500 dark:text-primary-400 uppercase tracking-wider mb-4">
                            Who to follow
                        </h2>
                        <div className="space-y-4">
                            {suggestions.map((user) => (
                                <div key={user.id} className="flex items-center justify-between">
                                    <Link href={`/users/${user.id}`} className="flex items-center gap-3 group" onClick={onClose}>
                                        {user.image ? (
                                            <img
                                                src={user.image}
                                                alt={user.name || 'User'}
                                                className="w-10 h-10 rounded-full border border-primary-200 dark:border-primary-700 group-hover:opacity-80 transition-opacity"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center group-hover:opacity-80 transition-opacity">
                                                <FaUser className="text-primary-400" />
                                            </div>
                                        )}
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-primary-900 dark:text-white group-hover:text-accent-600 transition-colors line-clamp-1">
                                                {user.name || 'Anonymous'}
                                            </span>
                                            <span className="text-xs text-primary-500 dark:text-primary-400">
                                                {user._count.followedBy} followers
                                            </span>
                                        </div>
                                    </Link>
                                    <FollowButton userId={user.id} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Settings & Logout */}
                <div className="bg-white dark:bg-primary-900 rounded-xl shadow-sm border border-primary-200 dark:border-primary-800 p-2">
                    <Link
                        href="/profile"
                        className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium flex items-center gap-3 text-primary-700 dark:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-800"
                        onClick={onClose}
                    >
                        <FaCog className="text-primary-400" />
                        <span>Settings</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-3 rounded-lg transition-all duration-200 font-medium flex items-center gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <FaSignOutAlt />
                        <span>Log Out</span>
                    </button>
                </div>
            </div>
        </>
    )
}
