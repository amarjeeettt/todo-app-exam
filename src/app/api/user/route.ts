import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Retrieve the JWT secret key from environment variables
const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY as string;

// Handles GET requests to retrieve user information based on JWT token
export async function GET() {
  // Retrieve the token from cookies
  const token = cookies().get("token")?.value;

  // Return an error response if the token is missing
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // Verify the token and extract user ID
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as { userId: number };

    // Fetch the user from the database using the decoded user ID
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true }, // Select only required fields
    });

    if (!user) {
      return NextResponse.json({ error: "User not Found" }, { status: 404 });
    }

    // Return the user information as a JSON response
    return NextResponse.json(user);
  } catch (error) {
    // Log the error for debugging
    console.log(error);
    // Return an error response for invalid tokens
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
