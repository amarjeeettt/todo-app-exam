import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;

export async function GET() {
  // Retrieve the token from cookies
  const token = cookies().get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Verify the token and extract user ID
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as { userId: number };

    // Fetch the user from the database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 }); // Handle token verification errors
  }
}
