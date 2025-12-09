import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    let user: null | { id: string; username: string; email: string; udata: string } = null;

    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            username: string;
            email: string;
            udata: string;
            };
        } catch {
            user = null;
        }
    }

  try {
    const body = await req.json();
    const { word } = body;

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    // Insert the word
    const result = await sql`
      INSERT INTO wordlist (word, added_by)
      VALUES (${word}, ${user?.id})
      RETURNING wordlist_id::TEXT, word, added_by::TEXT, status, date_added::TEXT;
    `;

    return NextResponse.json(result[0]);
  } catch (err: any) {
    console.error("Error adding word:", err);

    // Handle unique constraint violation
    if (err?.message?.includes("duplicate key value")) {
      return NextResponse.json({ error: "Word already exists" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to add word" }, { status: 500 });
  }
}