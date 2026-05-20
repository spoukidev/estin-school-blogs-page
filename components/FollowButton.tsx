'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface FollowButtonProps {
    userId: string
    initialIsFollowing?: boolean
    onFollowChange?: (isFollowing: boolean) => void
}

export default function FollowButton({ userId, initialIsFollowing = false, onFollowChange }: FollowButtonProps) {
    const { data: session } = useSession()
    const router = useRouter()
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const checkFollowStatus = async () => {
            if (session?.user && session.user.id !== userId) {
                try {
                    const res = await fetch(`/api/users/${userId}/follow`)
                    if (res.ok) {
                        const data = await res.json()
                        setIsFollowing(data.isFollowing)
                    }
                } catch (error) {
                    console.error('Error checking follow status:', error)
                }
            }
        }

        if (initialIsFollowing === undefined) {
            checkFollowStatus()
        }
    }, [userId, session, initialIsFollowing])

    const handleFollow = async () => {
        if (!session) {
            router.push('/login')
            return
        }

        setLoading(true)
        // Optimistic update
        const previousState = isFollowing
        setIsFollowing(!isFollowing)
        if (onFollowChange) onFollowChange(!isFollowing)

        try {
            const res = await fetch(`/api/users/${userId}/follow`, {
                method: 'POST',
            })

            if (!res.ok) {
                // Revert on error
                setIsFollowing(previousState)
                if (onFollowChange) onFollowChange(previousState)
                console.error('Failed to update follow status')
            }
        } catch (error) {
            // Revert on error
            setIsFollowing(previousState)
            if (onFollowChange) onFollowChange(previousState)
            console.error('Error updating follow status:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!session || session.user.id === userId) {
        return null
    }

    return (
        <button
            onClick={handleFollow}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${isFollowing
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                    : 'bg-accent-600 text-white hover:bg-accent-700 shadow-md shadow-accent-600/20'
                }`}
        >
            {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
        </button>
    )
}
