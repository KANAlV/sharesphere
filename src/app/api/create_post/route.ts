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
    const { title, content, course_id, org_id, tags, images } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Insert post
    const result = await sql`
    INSERT INTO posts (title, content, categories_id, organization_id, author_id, images)
    VALUES (
        ${title},
        ${content},
        ${course_id ?? null},
        ${org_id ?? null},
        ${userId},
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