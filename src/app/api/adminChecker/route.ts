import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  let user: null | { id: string; username: string; email: string; udata: string } = null;

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        email: string;
        udata: string;
      };
    } catch {
      user = null;
    }
  }

  // Return JSON so the client can handle redirect
  return NextResponse.json({
    isAdmin: user?.udata === "1",
  });
}
