'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import Navbar from '@/components/Navbar'
import BlogForm from '@/components/BlogForm'

export default function EditBlogPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string
    const [blog, setBlog] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (id) {
            fetchBlog()
        }
    }, [id])

    const fetchBlog = async () => {
        try {
            const res = await fetch(`/api/blogs/${id}`)
            if (res.ok) {
                const data = await res.json()
                setBlog(data)
            } else {
                router.push('/blogs')
            }
        } catch (error) {
            console.error('Error fetching blog:', error)
            router.push('/blogs')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (data: any) => {
        const res = await fetch(`/api/blogs/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        })

        if (res.ok) {
            router.push(`/blogs/${id}`)
        } else {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Failed to update blog')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!blog) return null

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <BlogForm
                        initialData={{
                            title: blog.title,
                            content: blog.content,
                            image: blog.image || '',
                            categories: blog.categories?.map((c: any) => c.id) || []
                        }}
                        onSubmit={handleSubmit}
                        isEditing={true}
                    />
                </div>
            </div>
        </ProtectedRoute>
    )
}
