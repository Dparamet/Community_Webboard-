import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { title, content, author_id } = await request.json();

    if (!title || !content || !author_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPost = await prisma.post.create({
      data: {
        post_title: title.trim(),
        post_content: content.trim(),
        post_author_id: author_id,
      },
      include: {
        author: { select: { user_id: true, user_name: true } },
        _count: { select: { comments: true, likes: true } }
      }
    });

    return NextResponse.json({ message: "Post created successfully!", post: newPost }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(20, Math.max(1, parseInt(searchParams.get('limit') || '10')));
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await prisma.post.count();

    // Fetch posts with pagination
    const posts = await prisma.post.findMany({
      skip,
      take: limit,
      include: {
        author: { select: { user_id: true, user_name: true } },
        _count: { select: { comments: true, likes: true } }
      },
      orderBy: { post_id: 'desc' }
    });

    return NextResponse.json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}