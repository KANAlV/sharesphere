import { NextResponse } from "next/server";
import {sql} from "@/lib/db"; // adjust path to your sql client

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("postId");
    const parentId = searchParams.get("parentId");

    if (!postId || !parentId) {
      return NextResponse.json({ error: "Missing postId or parentId" }, { status: 400 });
    }

    const comments = (await sql`
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
        c.user_deleted,
        c.mod_deleted
      FROM comments c
      LEFT JOIN userdata ud ON ud.id = c.author_id
      LEFT JOIN users u ON u.id = ud.id
      WHERE
        post_id = ${postId} AND
        parent_comment_id = ${parentId}
      ORDER BY c.created_at ASC
      LIMIT 10
    `) as {
      id: string,
      anonymous: boolean,
      profile: string,
      username: string,
      created_at: string,
      content: string,
      has_comments: boolean,
      likes: number,
      dislikes: number,
      user_deleted: boolean,
      mod_deleted: boolean
    }[];

    return NextResponse.json({ comments });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch nested comments" }, { status: 500 });
  }
}