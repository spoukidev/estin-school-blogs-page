import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { randomUUID } from 'crypto'
import path from 'path'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024

// Only raster images are accepted (the UI only offers image/*). SVG is excluded
// because it can carry script and is served from the same origin.
const ALLOWED_TYPES: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
}

function hasExpectedSignature(buffer: Buffer, mime: string): boolean {
    switch (mime) {
        case 'image/jpeg':
            return buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff
        case 'image/png':
            return buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
        case 'image/gif':
            return buffer.subarray(0, 4).toString('ascii') === 'GIF8'
        case 'image/webp':
            return buffer.subarray(0, 4).toString('ascii') === 'RIFF' && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
        default:
            return false
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file')

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const extension = ALLOWED_TYPES[file.type]
        if (!extension) {
            return NextResponse.json({ error: 'Only JPEG, PNG, GIF or WebP images are allowed' }, { status: 415 })
        }

        if (file.size > MAX_UPLOAD_BYTES) {
            return NextResponse.json({ error: 'File is too large (max 5 MB)' }, { status: 413 })
        }

        const buffer = Buffer.from(await file.arrayBuffer())
        if (!hasExpectedSignature(buffer, file.type)) {
            return NextResponse.json({ error: 'File content does not match its image type' }, { status: 415 })
        }

        // Never use the client-supplied name on disk: it can contain path separators.
        const filename = `${Date.now()}_${randomUUID()}${extension}`
        const uploadDir = path.join(process.cwd(), 'public/uploads')

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
