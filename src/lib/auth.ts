// lib/auth.ts
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export function getUserFromCookie() {
  const token = cookies().get("session")?.value;
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