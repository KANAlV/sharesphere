import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken"

export async function POST(req: Request) {
  try {
    const {  postId, commentId, reason, pageType  } = await req.json();

    if (!postId || !reason || !pageType ) {
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

    const comment_id = commentId == ""? null:commentId;

    const check = await sql`
    SELECT 1 FROM reports
    WHERE 
        post_id = ${postId}
        AND comment_id IS NOT DISTINCT FROM ${comment_id}
        AND reported_by = ${user?.id}
    LIMIT 1;
    `;

    if (check.length > 0) {
    return NextResponse.json(
        { error: "You already reported once" },
        { status: 409 }
    );
    }

    const res = await sql`
      INSERT INTO reports (post_id, comment_id, reported_by, reason, page_type)
      VALUES (${postId}, ${comment_id}, ${user?.id}, ${reason}, ${pageType})
      RETURNING *;
    `;

    return NextResponse.json({ res });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to report" },
      { status: 500 }
    );
  }
}