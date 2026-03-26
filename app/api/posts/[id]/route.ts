import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type RouteParams = { id?: string } | Promise<{ id?: string }>;

async function resolvePostId(request: Request, params: RouteParams): Promise<string | null> {
  const maybeParams = await params;
  const fromParams = maybeParams?.id?.trim();
  if (fromParams) {
    return fromParams;
  }

  const segments = new URL(request.url).pathname.split('/').filter(Boolean);
  const fromPath = segments[segments.length - 1]?.trim();
  return fromPath || null;
}

export async function GET(request: Request, { params }: { params: RouteParams }) {
  try {
    const postId = await resolvePostId(request, params);
    if (!postId) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: { post_id: postId },
      include: {
        author: { select: { user_id: true, user_name: true } },
        comments: {
          include: { author: { select: { user_id: true, user_name: true } } },
          orderBy: { comment_id: 'asc' }
        },
        _count: { select: { comments: true, likes: true } }
      }
    });
    
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: RouteParams }) {
  try {
    const postId = await resolvePostId(request, params);
    if (!postId) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const { title, content, author_id } = await request.json();

    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { post_id: postId }
    });

    if (!existingPost || existingPost.post_author_id !== author_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { post_id: postId },
      data: {
        post_title: title?.trim() || existingPost.post_title,
        post_content: content?.trim() || existingPost.post_content
      },
      include: {
        author: { select: { user_id: true, user_name: true } },
        _count: { select: { comments: true, likes: true } }
      }
    });

    return NextResponse.json({ message: "Post updated", post: updatedPost });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: RouteParams }) {
  try {
    const postId = await resolvePostId(request, params);
    if (!postId) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const { author_id } = await request.json();

    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { post_id: postId }
    });

    if (!existingPost || existingPost.post_author_id !== author_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.post.delete({
      where: { post_id: postId }
    });

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}