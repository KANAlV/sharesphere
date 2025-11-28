import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const parentId = searchParams.get("parentId");
    const offset = Number(searchParams.get("offset") || 0);

    if (!postId || !parentId) {
      return NextResponse.json(
        { error: "Missing postId or parentId" },
        { status: 400 }
      );
    }

    // ALWAYS SORT so React keeps correct order
    const rows = await sql`
      SELECT
        c.id::TEXT,
        c.anonymous,
        ud.profile,
        u.username,
        c.created_at::TEXT,
        c.content,
        c.has_comments,
        c.likes,
        c.dislikes,
        c.lnd,
        c.user_deleted,
        c.mod_deleted
      FROM comments c
      LEFT JOIN userdata ud ON ud.id = c.author_id
      LEFT JOIN users u ON u.id = ud.id
      WHERE
        c.post_id = ${postId}
        AND c.parent_comment_id = ${parentId}
      ORDER BY c.created_at ASC
      OFFSET ${offset}
      LIMIT 11
    `;

    const hasMore = rows.length > 10;
    const comments = hasMore ? rows.slice(0, 10) : rows;

    return NextResponse.json({ comments, hasMore });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch nested comments" },
      { status: 500 }
    );
  }
}