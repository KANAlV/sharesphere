import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { id, description } = await req.json();

    if (!id || !description) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

    const users = await sql`
      SELECT * FROM users WHERE id = ${id} LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    await sql`
      UPDATE userdata SET description = ${description}, updated_at = now() WHERE id = ${id}
    `;

    return NextResponse.json({ message: "about description updated successfully" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
