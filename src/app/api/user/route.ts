import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY as string;

export async function GET() {
  const token = cookies().get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as { userId: number };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not Found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
