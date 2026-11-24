import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const followerId = session.user.id
        const { id: followingId } = await params

        if (followerId === followingId) {
            return NextResponse.json(
                { error: 'You cannot follow yourself' },
                { status: 400 }
            )
        }

        // Check if follow exists
        const existingFollow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        })

        if (existingFollow) {
            // Unfollow
            await prisma.follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            })
            return NextResponse.json({ isFollowing: false })
        } else {
            // Follow
            await prisma.$transaction([
                prisma.follow.create({
                    data: {
                        followerId,
                        followingId,
                    },
                }),
                prisma.notification.create({
                    data: {
                        userId: followingId,
                        type: 'follow',
                        message: `${session.user.name || 'Someone'} started following you`,
                        link: `/profile/${followerId}`,
                    },
                }),
            ])
            return NextResponse.json({ isFollowing: true })
        }
    } catch (error) {
        console.error('Error toggling follow:', error)
        return NextResponse.json(
            { error: 'Failed to update follow status' },
            { status: 500 }
        )
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user) {
            return NextResponse.json({ isFollowing: false })
        }

        const followerId = session.user.id
        const { id: followingId } = await params

        const follow = await prisma.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        })

        return NextResponse.json({ isFollowing: !!follow })
    } catch (error) {
        console.error('Error checking follow status:', error)
        return NextResponse.json(
            { error: 'Failed to check follow status' },
            { status: 500 }
        )
    }
}
