import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode user ID
    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, course_id, org_id } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const categories_id = course_id ?? null;
    const organization_id = org_id ?? null;

    console.log("📌 Inserting with:", {
      title,
      content,
      categories_id,
      organization_id,
      userId,
    });

    // --- Word filter check (whole word, case-insensitive) ---
    const bannedWords = await sql`
      SELECT word
      FROM wordlist
      WHERE status = true
    `;

    const lowerTitle = title.toLowerCase();
    const lowerContent = content.toLowerCase();

    for (const w of bannedWords) {
      const word = w.word.toLowerCase();

      // Regex to match whole word only (\y for word boundary in Postgres regex)
      const regex = new RegExp(`\\b${word}\\b`, "i");
      if (regex.test(title) || regex.test(content)) {
        return NextResponse.json({
          error: "Your announcement contains banned words",
          bannedWord: w.word,
        }, { status: 400 });
      }
    }

    // *** IMPORTANT: USE THE EXACT TABLE NAME annnouncemetns ***
    const inserted = await sql`
      INSERT INTO annnouncemetns (
        title,
        content,
        categories_id,
        organization_id,
        author_id
      )
      VALUES (
        ${title},
        ${content},
        ${categories_id},
        ${organization_id},
        ${userId}
      )
      RETURNING announceid;
    `;

    return NextResponse.json(
      { success: true, id: inserted[0].announceid },
      { status: 200 }
    );

  } catch (err) {
    console.error("❌ CREATE ANNOUNCEMENT ERROR:", err);
    return NextResponse.json(
      {
        error: "Failed to create announcement",
        details: String(err)
      },
      { status: 500 }
    );
  }
}
