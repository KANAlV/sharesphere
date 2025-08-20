import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);

  const res = NextResponse.redirect(`${origin}/`);
  res.cookies.set("session", "", { expires: new Date(0), path: "/" });
  return res;
}