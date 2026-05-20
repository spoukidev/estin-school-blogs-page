import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        // If not logged in, return random users
        // If logged in, return users not followed by current user

        let whereClause: any = {}

        if (session?.user?.id) {
            whereClause = {
                AND: [
                    { id: { not: session.user.id } }, // Not self
                    {
                        followedBy: {
                            none: {
                                followerId: session.user.id
                            }
                        }
                    }
                ]
            }
        }

        const suggestions = await prisma.user.findMany({
            where: whereClause,
            take: 5,
            orderBy: {
                followedBy: {
                    _count: 'desc'
                }
            },
            select: {
                id: true,
                name: true,
                image: true,
                role: true,
                _count: {
                    select: {
                        followedBy: true
                    }
                }
            }
        })

        return NextResponse.json(suggestions)
    } catch (error) {
        console.error('Error fetching suggestions:', error)
        return NextResponse.json(
            { error: 'Failed to fetch suggestions' },
            { status: 500 }
        )
    }
}
