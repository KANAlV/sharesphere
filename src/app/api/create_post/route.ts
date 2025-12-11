import { sql } from "@/lib/db";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    let userId: string | null = null;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        userId = decoded.id;
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    } else {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, content, course_id, org_id, tags, images, anonymous } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

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
          error: "Your post contains banned words",
          bannedWord: w.word,
        }, { status: 400 });
      }
    }

    // --- Check if user is muted ---
    const muted = await sql`
      SELECT duration, reason
      FROM muted
      WHERE user_id = ${userId}
        AND (page_id IS NULL OR (page_id = ${org_id} OR page_id = ${course_id}))
        AND duration > NOW()
      ORDER BY duration DESC
    `;

    if (muted.length > 0) {
      const m = muted[0];
      return NextResponse.json({
        error: `You are muted until ${new Date(m.duration).toLocaleString()} for reason: ${m.reason}`
      }, { status: 403 });
    }

    // Insert post
    const result = await sql`
    INSERT INTO posts (title, content, categories_id, organization_id, author_id, anonymous, images)
    VALUES (
        ${title},
        ${content},
        ${course_id ?? null},
        ${org_id ?? null},
        ${userId},
        ${anonymous},
        ${images ? JSON.stringify(images) : JSON.stringify([])}
    )
    RETURNING id;
    `;


    const postId = result[0]?.id;
    if (!postId) throw new Error("Failed to create post");

    // Insert tags safely
    if (Array.isArray(tags) && tags.length > 0) {
        for (const tagId of tags) {
            await sql`
            INSERT INTO page_tags (page_id, tag_id)
            VALUES (${result[0].id}, ${tagId});
            `;
        }
    }


    return NextResponse.json({ success: true, id: postId });
  } catch (error: unknown) {
    console.error("API crashed:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}