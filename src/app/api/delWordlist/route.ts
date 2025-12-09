import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wordlist_id } = body;

    if (!wordlist_id || typeof wordlist_id !== "string") {
      return NextResponse.json({ error: "Word ID is required" }, { status: 400 });
    }

    // Delete the word
    const result = await sql`
      DELETE FROM wordlist
      WHERE wordlist_id = ${wordlist_id}
      RETURNING wordlist_id::TEXT;
    `;

    if (!result[0]) {
      return NextResponse.json({ error: "Word not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, wordlist_id: result[0].wordlist_id });
  } catch (err) {
    console.error("Error deleting word:", err);
    return NextResponse.json({ error: "Failed to delete word" }, { status: 500 });
  }
}
