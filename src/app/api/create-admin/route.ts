import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";

export async function POST(req: Request) {
  const sql = neon(process.env.DATABASE_URL!);

  try {
    const body = await req.json();

    const { username, email, password, makeAdmin, perms, query, id } = body;

    const usernameRegex = /^[A-Za-z0-9]+$/;
    const passwordRegex = /^[A-Za-z0-9]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /* -------------------------------------------------
     * 1️⃣ SEARCH USER (must run BEFORE validation)
     * ------------------------------------------------- */
    if (query) {
      const found = await sql`
        SELECT id, username, email
        FROM users
        WHERE username = ${query} OR email = ${query}
        LIMIT 1
      `;

      if (found.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({ user: found[0] }, { status: 200 });
    }

    /* -------------------------------------------------
     * 2️⃣ PROMOTE USER (must run BEFORE validation)
     * ------------------------------------------------- */
    if (id) {
      const exists = await sql`
        SELECT id FROM users WHERE id = ${id}
      `;

      if (exists.length === 0) {
        return NextResponse.json({ error: "User does not exist" }, { status: 404 });
      }

      await sql`
        INSERT INTO admins (admin_id, perms)
        VALUES (${id}, ${perms || "full"})
        ON CONFLICT (admin_id) DO NOTHING
      `;

      return NextResponse.json(
        { message: "User promoted to admin" },
        { status: 200 }
      );
    }

    /* -------------------------------------------------
     * 3️⃣ CREATE ACCOUNT (validation only here)
     * ------------------------------------------------- */
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: "Username cannot contain spaces or symbols" },
        { status: 400 }
      );
    }

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        { error: "Password cannot contain spaces or symbols" },
        { status: 400 }
      );
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const createdUser = await sql`
      INSERT INTO users (username, email, password_hash)
      VALUES (${username}, ${email}, ${passwordHash})
      RETURNING id, username, email
    `;

    const userId = createdUser[0].id;

    if (makeAdmin === true) {
      await sql`
        INSERT INTO admins (admin_id, perms)
        VALUES (${userId}, ${perms || "full"})
      `;
    }

    return NextResponse.json(
      {
        message: makeAdmin
          ? "User created and promoted to admin"
          : "User account created",
        user: createdUser[0],
        admin: makeAdmin ? { admin_id: userId, perms: perms || "full" } : null,
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    console.error("❌ Backend Error:", err);

    const message = err instanceof Error ? err.message : "Server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
