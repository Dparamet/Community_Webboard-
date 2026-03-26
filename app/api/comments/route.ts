import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { content, post_id, author_id } = await request.json();

    if (!content?.trim() || !post_id || !author_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newComment = await prisma.comment.create({
      data: {
        comment_content: content.trim(),
        comment_post_id: post_id,
        comment_author_id: author_id,
      },
      include: {
        author: { select: { user_id: true, user_name: true } }
      }
    });

    return NextResponse.json({ message: "Comment created successfully!", comment: newComment }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { comment_id, author_id } = await request.json();

    // Verify ownership
    const comment = await prisma.comment.findUnique({
      where: { comment_id }
    });

    if (!comment || comment.comment_author_id !== author_id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.comment.delete({
      where: { comment_id }
    });

    return NextResponse.json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
  }
}