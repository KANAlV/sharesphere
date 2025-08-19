// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getUserFromCookie() {
  const cookieStore = await cookies(); // ✅ await cookies()
  const token = cookieStore.get("session")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: string;
      email: string;
      username: string;
    };
    return decoded;
  } catch {
    return null;
  }
}