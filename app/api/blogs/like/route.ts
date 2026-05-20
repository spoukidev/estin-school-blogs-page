import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { blogId } = await req.json()

    if (!blogId) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_blogId: {
          userId: user.id,
          blogId,
        },
      },
    })

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: {
          userId_blogId: {
            userId: user.id,
            blogId,
          },
        },
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      const blog = await prisma.blog.findUnique({
        where: { id: blogId },
        select: { authorId: true, title: true }
      })

      if (blog && blog.authorId !== user.id) {
        await prisma.$transaction([
          prisma.like.create({
            data: {
              userId: user.id,
              blogId,
            },
          }),
          prisma.notification.create({
            data: {
              userId: blog.authorId,
              type: 'like',
              message: `${user.name || 'Someone'} liked your post "${blog.title}"`,
              link: `/blogs/${blogId}`,
            },
          }),
        ])
      } else {
        await prisma.like.create({
          data: {
            userId: user.id,
            blogId,
          },
        })
      }
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}
