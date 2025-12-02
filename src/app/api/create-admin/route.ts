import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const { username, email, password, makeAdmin, perms } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 1️⃣ Create user
    const createdUser = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${passwordHash})
      RETURNING id, username, email
    `;

    const userId = createdUser[0].id;

    // 2️⃣ Check if admin promotion is selected
    if (makeAdmin) {
      await sql`
        INSERT INTO admins (admin_id, perms)
        VALUES (${userId}, ${perms || "full"})
      `;
    }

    return NextResponse.json({
      message: makeAdmin
        ? "User created and promoted to admin"
        : "User account created",
      user: createdUser[0],
      admin: makeAdmin ? { admin_id: userId, perms } : null,
    });

  } catch (err: unknown) {
  console.error("❌ Create+Promote Error:", err);

  const message =
    err instanceof Error ? err.message : "Server error";

  return NextResponse.json(
    { error: message },
    { status: 500 }
  );
  }
}
