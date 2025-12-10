import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
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
        user = null;
      }
    }
  try {
    const { userId, pageId, pageType } = await req.json();

    if (!userId || !pageId || !pageType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Construct the JSON object to insert/update
    const newData = {
      [userId]: {
        role: "member",
        perms: {
          all: false,
          mute: false,
          announce: false,
          pagedetails: false,
          delete_posts: false,
          delete_comments: false,
          roles_management: false,
          adviser: false,
        },
      },
    };

    // Fetch the actual page UUID/id
    let page_id: string | null = null;

    if (pageType === "organization") {
      const org = await sql`SELECT id FROM organization WHERE name = ${pageId} LIMIT 1`;
      page_id = org[0]?.id ?? null;
    } else if (pageType === "categories") {
      const cat = await sql`SELECT id FROM categories WHERE category_name = ${pageId} LIMIT 1`;
      page_id = cat[0]?.id ?? null;
    }

    if (!page_id) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // check if row exists
    const check = await sql`
      SELECT 1 FROM roles
      WHERE page_id = ${page_id} AND
            page_type = ${pageType}
    `;

    // Upsert into roles table using page_id + page_type as unique identifier
    const res = await sql`
      INSERT INTO roles (page_id, page_type, data)
      VALUES (${page_id}, ${pageType}, ${JSON.stringify(newData)}::jsonb)
      ON CONFLICT (page_id, page_type)
      DO UPDATE
      SET data = roles.data || EXCLUDED.data
      RETURNING *;
    `;

    const log = await sql`
      INSERT INTO moderation_logs (page_id, action, reciever, action_by)
      VALUES (
        (SELECT id FROM posts p
          WHERE p.organization_id = ${page_id} OR p.categories_id = ${page_id}
          LIMIT 1),
        'add moderator',
        ${userId},
        ${user?.id}
      )
      RETURNING *;
    `;

    return NextResponse.json({ res });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add moderator" },
      { status: 500 }
    );
  }
}