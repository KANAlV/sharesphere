import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

// GET – fetch admin users
export async function GET() {
  try {
    const admins = await sql`
      SELECT 
        a.admin_id::TEXT AS id,
        u.username,
        u.email,
        CONCAT(ud.firstname, ' ', ud.middlename, ' ', ud.surname) AS fullname,
        a.level
      FROM admins a
      JOIN users u ON a.admin_id = u.id
      LEFT JOIN userdata ud ON ud.id = u.id
      ORDER BY u.username
    `;

    return NextResponse.json(admins, { status: 200 });
  } catch (error) {
    console.error("Admin fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE – remove admin role
export async function DELETE(req: Request) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    // Find user
    const user = await sql`
      SELECT id FROM users WHERE username = ${username}
    `;

    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = user[0].id;

    // Remove admin role
    await sql`
      DELETE FROM admins WHERE admin_id = ${userId}
    `;

    return NextResponse.json({ message: "Admin role removed" }, { status: 200 });
  } catch (error) {
    console.error("Admin removal error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
