import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Validation helper
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 6) return { valid: false, error: "Password must be at least 6 characters" };
  return { valid: true };
}

function validateUsername(username: string): { valid: boolean; error?: string } {
  if (username.length < 3) return { valid: false, error: "Username must be at least 3 characters" };
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return { valid: false, error: "Username can only contain letters, numbers, and underscores" };
  return { valid: true };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_name, user_email, user_password } = body;

    // Validation
    if (!user_name?.trim() || !user_email?.trim() || !user_password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const userValidation = validateUsername(user_name.trim());
    if (!userValidation.valid) {
      return NextResponse.json({ error: userValidation.error }, { status: 400 });
    }

    if (!validateEmail(user_email.trim())) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const passwordValidation = validatePassword(user_password);
    if (!passwordValidation.valid) {
      return NextResponse.json({ error: passwordValidation.error }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        user_name: user_name.trim(),
        user_email: user_email.trim().toLowerCase(),
        user_password: hashedPassword,
      },
      select: {
        user_id: true,
        user_name: true,
        user_email: true
      }
    });

    return NextResponse.json({ message: "Registration successful!", user: newUser }, { status: 201 });
  } catch (error: unknown) {
    console.error(error);
    
    const err = error as { code?: string; meta?: { target?: string[] } };
    if (err?.code === 'P2002') {
      const field = err?.meta?.target?.includes('user_email') ? 'email' : 'username';
      return NextResponse.json({ error: `This ${field} is already registered` }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}