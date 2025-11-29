// app/api/posts/post_comment/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    // Insert comment
    const result = await sql`
      INSERT INTO comments (post_id, author_id, parent_comment_id, content, anonymous)
      VALUES (${postId}, ${userId}, ${parentCommentId ?? null}, ${comment}, ${anonymous})
      RETURNING id;
    `;

    const update = await sql`
      UPDATE comments
      SET has_comments = true
      WHERE id = ${parentCommentId};
    `;

    const commentId = result[0]?.id;
    if (!commentId) throw new Error("Failed to create comment");
    if (!parentCommentId == null) {
      if(!update) throw new Error("Failed to update parent comment");
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
