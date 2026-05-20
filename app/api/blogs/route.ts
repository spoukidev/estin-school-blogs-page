import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get('categoryId')
    const authorId = searchParams.get('authorId')
    const likedBy = searchParams.get('likedBy')
    const sort = searchParams.get('sort') // 'trending' or 'latest'

    let where: any = {}

    const following = searchParams.get('following')

    if (following === 'true') {
      const session = await getServerSession(authOptions)
      if (session?.user) {
        const followedUsers = await prisma.follow.findMany({
          where: { followerId: session.user.id },
          select: { followingId: true }
        })
        const followingIds = followedUsers.map(f => f.followingId)
        where.authorId = { in: followingIds }
      }
    }

    if (categoryId) {
      where.categories = { some: { id: categoryId } }
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (likedBy) {
      where.likes = { some: { userId: likedBy } }
    }

    const orderBy = sort === 'trending'
      ? { likes: { _count: 'desc' } }
      : { createdAt: 'desc' }

    const blogs = await prisma.blog.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        categories: true,
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: orderBy as any,
    })

    return NextResponse.json(blogs)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { title, content, image, categoryIds } = await req.json()

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const blog = await prisma.blog.create({
      data: {
        title,
        content,
        image,
        authorId: user.id,
        categories: categoryIds && categoryIds.length > 0 ? {
          connect: categoryIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
          },
        },
        categories: true,
      },
    })

    return NextResponse.json(blog)
  } catch (error) {
    console.error('Error creating blog:', error)
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    )
  }
}
