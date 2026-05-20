'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa'

interface Category {
    id: string
    name: string
}

interface BlogFormProps {
    initialData?: {
        title: string
        content: string
        image: string
        categories: string[] // Array of category IDs
    }
    onSubmit: (data: any) => Promise<void>
    isEditing?: boolean
}

export default function BlogForm({ initialData, onSubmit, isEditing = false }: BlogFormProps) {
    const router = useRouter()
    const [title, setTitle] = useState(initialData?.title || '')
    const [content, setContent] = useState(initialData?.content || '')
    const [image, setImage] = useState(initialData?.image || '')
    const [uploading, setUploading] = useState(false)
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>(initialData?.categories || [])
    const [loading, setLoading] = useState(false)
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            const res = await fetch('/api/categories')
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleCategoryToggle = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        )
    }

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true)
        } else if (e.type === 'dragleave') {
            setDragActive(false)
        }
    }, [])

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            await handleUpload(e.dataTransfer.files[0])
        }
    }, [])

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await handleUpload(e.target.files[0])
        }
    }

    const handleUpload = async (file: File) => {
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            })

            if (res.ok) {
                const data = await res.json()
                setImage(data.url)
            } else {
                console.error('Upload failed')
                setError('Failed to upload image')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            setError('Error uploading file')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        if (!title.trim() || !content.trim()) return

        setLoading(true)
        try {
            await onSubmit({
                title,
                content,
                image: image || null,
                categoryIds: selectedCategories
            })
        } catch (error: any) {
            console.error('Error submitting form:', error)
            setError(error.message || 'An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
                {isEditing ? 'Edit Blog' : 'Create New Blog'}
            </h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter blog title..."
                        required
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Cover Image
                    </label>
                    <div
                        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-blue-500'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {image ? (
                            <div className="relative">
                                <img
                                    src={image}
                                    alt="Cover preview"
                                    className="max-h-64 mx-auto rounded-lg"
                                />
                                <button
                                    type="button"
                                    onClick={() => setImage('')}
                                    className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <FaCloudUploadAlt className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="text-gray-600 dark:text-gray-300">
                                    <p className="font-medium">Click to upload or drag and drop</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF</p>
                                </div>
                                <input
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                />
                            </div>
                        )}
                        {uploading && (
                            <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Categories
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(category => (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => handleCategoryToggle(category.id)}
                                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${selectedCategories.includes(category.id)
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Content
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 dark:bg-gray-700 dark:text-white"
                        placeholder="Write your blog content..."
                        rows={15}
                        required
                    />
                </div>

                <div className="flex space-x-4">
                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                    >
                        {loading ? (isEditing ? 'Updating...' : 'Publishing...') : (isEditing ? 'Update Blog' : 'Publish Blog')}
                    </button>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-6 py-3 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
