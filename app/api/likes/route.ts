import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { user_id, post_id } = await request.json();

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        user_id_post_id: { user_id, post_id }
      }
    });

    if (existingLike) {
      // Remove like
      await prisma.like.delete({
        where: {
          user_id_post_id: { user_id, post_id }
        }
      });
      return NextResponse.json({ message: "Unlike successful", liked: false }, { status: 200 });
    } else {
      // Add like
      await prisma.like.create({
        data: { user_id, post_id }
      });
      return NextResponse.json({ message: "Like successful", liked: true }, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to toggle like" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const post_id = searchParams.get('post_id');
    const user_id = searchParams.get('user_id');

    if (!post_id) {
      return NextResponse.json({ error: "post_id is required" }, { status: 400 });
    }

    // Get like count
    const likeCount = await prisma.like.count({
      where: { post_id }
    });

    let isLiked = false;
    if (user_id) {
      const userLike = await prisma.like.findUnique({
        where: {
          user_id_post_id: { user_id, post_id }
        }
      });
      isLiked = !!userLike;
    }

    return NextResponse.json({ likeCount, isLiked }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to fetch likes" }, { status: 500 });
  }
}
