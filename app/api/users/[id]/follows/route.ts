import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') // 'followers' or 'following'
    const { id } = await params

    if (!type || (type !== 'followers' && type !== 'following')) {
        return NextResponse.json(
            { error: 'Invalid type parameter' },
            { status: 400 }
        )
    }

    try {
        let users
        if (type === 'followers') {
            const follows = await prisma.follow.findMany({
                where: { followingId: id },
                include: {
                    follower: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            bio: true,
                            role: true,
                        },
                    },
                },
            })
            users = follows.map((f) => f.follower)
        } else {
            const follows = await prisma.follow.findMany({
                where: { followerId: id },
                include: {
                    following: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            bio: true,
                            role: true,
                        },
                    },
                },
            })
            users = follows.map((f) => f.following)
        }

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching follows:', error)
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        )
    }
}
