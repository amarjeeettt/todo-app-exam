import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Get JWT secret key from environment variables
const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY as string;

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const userExists = await prisma.user.findUnique({
      where: { username },
    });

    if (userExists) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user in database
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET_KEY, {
      expiresIn: "1h",
    });

    // Set JWT token in HTTP-only cookie
    cookies().set({
      name: "token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    // Return user data (excluding sensitive information)
    return NextResponse.json({
      id: user.id,
      username: user.username,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
