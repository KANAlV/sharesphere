import { NextResponse } from "next/server";

export async function GET() {
  // Clear cookie
  const res = NextResponse.redirect(new URL("/", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
  res.cookies.set("session", "", { expires: new Date(0) });
  return res;
}