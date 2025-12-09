import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { wordlist_id } = await req.json();
    if (!wordlist_id) {
      return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    // Toggle status and return row with username
    const result = await sql`
      UPDATE wordlist w
      SET status = NOT status
      FROM users u
      WHERE w.wordlist_id = ${wordlist_id} AND w.added_by = u.id
      RETURNING
        w.wordlist_id::TEXT,
        w.word,
        u.username AS added_by,
        w.status,
        w.date_added::TEXT;
    `;

    if (!result[0]) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json(result[0]);
  } catch (err) {
    console.error("Toggle word error:", err);
    return NextResponse.json({ error: "Failed to toggle word" }, { status: 500 });
  }
}
