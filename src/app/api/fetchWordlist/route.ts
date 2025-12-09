import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        w.wordlist_id::TEXT,
        w.word,
        u.username AS added_by,
        w.status,
        w.date_added::TEXT
      FROM wordlist w
      JOIN users u ON u.id = w.added_by
      ORDER BY word ASC;
    `;

    return NextResponse.json(result);
  } catch (error) {
    console.error("Fetch wordlist error:", error);
    return NextResponse.json(
      { error: "Failed to fetch wordlist" },
      { status: 500 }
    );
  }
}
