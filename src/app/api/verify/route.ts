import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  try {
    // Decode token data
    const decoded = Buffer.from(token, "base64url").toString();
    const { username, email, password } = JSON.parse(decoded);

    // Check again if email already verified (maybe they clicked twice)
    const existing = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (existing.length > 0) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/already-verified`);
    }

    // Insert verified user
    await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${password})
    `;

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/verified-success`);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  }
}
