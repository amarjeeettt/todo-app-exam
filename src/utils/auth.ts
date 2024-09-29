import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { AuthenticationError, InvalidTokenError } from "./errors";

const JWT_SECRET_KEY: string = process.env.JWT_SECRET_KEY as string;

export async function getUserIDFromToken() {
  const token = cookies().get("token")?.value;
  if (!token) {
    throw new AuthenticationError();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET_KEY) as { userId: number };
    return decoded.userId;
  } catch (err) {
    console.log(err);
    throw new InvalidTokenError();
  }
}
