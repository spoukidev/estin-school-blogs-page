import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        const filename = Date.now() + '_' + file.name.replace(/\s/g, '_')
        const uploadDir = path.join(process.cwd(), 'public/uploads')

        // Ensure upload directory exists (in a real app, you'd check/create this on startup)
        // For now, we assume public/uploads exists or we'd use fs.mkdir
        // But since we can't easily run mkdir here without more code, let's try to write.
        // If it fails, we might need to create the dir.

        try {
            await mkdir(uploadDir, { recursive: true })
            await writeFile(path.join(uploadDir, filename), buffer)
        } catch (err) {
            console.error('Error saving file:', err)
            return NextResponse.json({ error: 'Failed to save file' }, { status: 500 })
        }

        return NextResponse.json({ url: `/uploads/${filename}` })
    } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
