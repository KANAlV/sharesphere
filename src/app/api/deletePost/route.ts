import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { postId, Mod } = await req.json();

    if ( !postId ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    let user: null | { id: string; username: string; email: string; udata: string; } = null;

    if (token) {
    try {
        user = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        email: string;
        udata: string;
        };
    } catch {
        return;
    }
    }

    // CHECK IF THE USER IS THE AUTHOR OF *THIS* COMMENT
    const check = await sql`
      SELECT 1 
      FROM posts
      WHERE id = ${postId} AND author_id = ${user?.id}
      LIMIT 1;
    `;

    const isAuthor = check.length > 0;

    let res;
    let log = null;

    if (isAuthor) {
      // user self-delete
      res = await sql`
        UPDATE posts
        SET user_deleted = true
        WHERE id = ${postId}
        RETURNING *;
      `;
    } else {
      // mod delete
      log = await sql`
        INSERT INTO moderation_logs (page_id, action, reciever, action_by)
        VALUES (${postId}, 'delete post', ${postId}, ${Mod})
        RETURNING *;
      `;

      res = await sql`
        UPDATE posts
        SET mod_deleted = true
        WHERE id = ${postId}
        RETURNING *;
      `;
    }

    return NextResponse.json({ res, log });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 }
    );
  }
}