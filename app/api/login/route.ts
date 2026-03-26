import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { user_email, user_password } = await request.json();

    // Validation
    if (!user_email?.trim() || !user_password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { user_email: user_email.trim().toLowerCase() },
      select: {
        user_id: true,
        user_name: true,
        user_email: true,
        user_password: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(user_password, user.user_password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Success - do not send password back
    return NextResponse.json({
      message: "Login successful!",
      user: { 
        id: user.user_id, 
        name: user.user_name,
        email: user.user_email
      }
    }, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}