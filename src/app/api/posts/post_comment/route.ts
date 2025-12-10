// app/api/posts/post_comment/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
      userId = decoded.id;
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const { postId, comment, parentCommentId, anonymous } = body;

    if (!postId || !comment?.trim()) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // --- Word filter check ---
    const bannedWords = await sql`
      SELECT word
      FROM wordlist
      WHERE status = true
    `;

    const lowerComment = comment.toLowerCase();
    for (const w of bannedWords) {
      const word = w.word.toLowerCase();
      const regex = new RegExp(`\\b${word}\\b`, "i"); // whole-word match
      if (regex.test(lowerComment)) {
        return NextResponse.json({
          error: "Your comment contains a banned word",
          bannedWord: w.word,
        }, { status: 400 });
      }
    }

    // --- Get pageID from organization or categories ---
    let pageIDResult = await sql`
      SELECT id FROM organization WHERE id = (
      SELECT organization_id FROM posts WHERE id = ${postId} LIMIT 1)
      LIMIT 1
    `;
    if (!pageIDResult[0]) {
      pageIDResult = await sql`
        SELECT id FROM categories WHERE id = (
        SELECT categories_id FROM posts WHERE id = ${postId} LIMIT 1)
        LIMIT 1
      `;
    }
    const pageID = pageIDResult[0]?.id || null;

    // --- Check if user is muted ---
    const muted = await sql`
      SELECT duration, reason
      FROM muted
      WHERE user_id = ${userId}
        AND (page_id IS NULL OR page_id = ${pageID})
        AND duration > NOW()
      ORDER BY duration DESC
    `;

    if (muted.length > 0) {
      const m = muted[0];
      return NextResponse.json({
        error: `You are muted until ${new Date(m.duration).toLocaleString()} for reason: ${m.reason}`
      }, { status: 403 });
    }

    // --- Insert comment ---
    const result = await sql`
      INSERT INTO comments (post_id, author_id, parent_comment_id, content, anonymous)
      VALUES (${postId}, ${userId}, ${parentCommentId ?? null}, ${comment}, ${anonymous})
      RETURNING id;
    `;
    const commentId = result[0]?.id;

    if (!commentId) throw new Error("Failed to create comment");

    // --- Update parent comment ---
    if (parentCommentId != null) {
      await sql`
        UPDATE comments
        SET has_comments = true
        WHERE id = ${parentCommentId};
      `;
    }

    return NextResponse.json({ success: true, id: commentId });

  } catch (error: unknown) {
    console.error("Failed to post comment:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}