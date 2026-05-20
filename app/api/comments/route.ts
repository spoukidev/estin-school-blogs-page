import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        // Check if user is authenticated and is an admin
        if (!session?.user || (session.user as any).role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const comments = await prisma.comment.findMany({
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        role: true,
                    },
                },
                blog: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json(comments)
    } catch (error) {
        console.error('Error fetching comments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch comments' },
            { status: 500 }
        )
    }
}
