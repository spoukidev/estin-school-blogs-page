'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { FaBell } from 'react-icons/fa'
import { formatDistanceToNow } from 'date-fns'

interface Notification {
    id: string
    type: string
    message: string
    link: string | null
    read: boolean
    createdAt: string
}

export default function NotificationBell() {
    const { data: session } = useSession()
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchNotifications = async () => {
        if (!session?.user) return
        try {
            const res = await fetch('/api/notifications')
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
                setUnreadCount(data.filter((n: Notification) => !n.read).length)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll for notifications every minute
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [session])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleMarkAsRead = async () => {
        if (unreadCount > 0) {
            try {
                await fetch('/api/notifications', { method: 'PATCH' })
                setUnreadCount(0)
                setNotifications(notifications.map(n => ({ ...n, read: true })))
            } catch (error) {
                console.error('Error marking notifications as read:', error)
            }
        }
    }

    const toggleDropdown = () => {
        if (!isOpen) {
            handleMarkAsRead()
        }
        setIsOpen(!isOpen)
    }

    if (!session) return null

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleDropdown}
                className="relative p-2 text-primary-600 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 rounded-full transition-colors"
            >
                <FaBell className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-primary-900 rounded-xl shadow-lg border border-primary-200 dark:border-primary-800 overflow-hidden z-50">
                    <div className="p-3 border-b border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-800/50">
                        <h3 className="font-semibold text-primary-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-primary-500 dark:text-primary-400 text-sm">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={notification.link || '#'}
                                    onClick={() => setIsOpen(false)}
                                    className={`block p-4 border-b border-primary-100 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-800/50 transition-colors ${!notification.read ? 'bg-accent-50 dark:bg-accent-900/10' : ''
                                        }`}
                                >
                                    <p className="text-sm text-primary-800 dark:text-primary-200 mb-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-primary-500 dark:text-primary-400">
                                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                    </p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
