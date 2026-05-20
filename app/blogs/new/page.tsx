'use client'

import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import BlogForm from '@/components/BlogForm'

export default function NewBlogPage() {
    const router = useRouter()

    const handleSubmit = async (data: any) => {
        const res = await fetch('/api/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (res.ok) {
            const responseData = await res.json()
            router.push(`/blogs/${responseData.id}`)
        } else {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Failed to create blog')
        }
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <BlogForm onSubmit={handleSubmit} />
                </div>
            </div>
        </ProtectedRoute>
    )
}
