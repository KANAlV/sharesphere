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
    const { modData, pageId, pageType } = await req.json();

    if (!modData || !pageId || !pageType) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Extract userId and data from modData object
    const userId = Object.keys(modData)[0];
    const userValues = modData[userId];

    if (!userId || !userValues) {
      return NextResponse.json(
        { error: "Invalid moderator data" },
        { status: 400 }
      );
    }

    // Find actual page UUID
    let page_id: string | null = null;

    if (pageType === "organization") {
      const org = await sql`
        SELECT id FROM organization WHERE name = ${pageId} LIMIT 1
      `;
      page_id = org[0]?.id ?? null;
    } else if (pageType === "categories") {
      const cat = await sql`
        SELECT id FROM categories WHERE category_name = ${pageId} LIMIT 1
      `;
      page_id = cat[0]?.id ?? null;
    }

    if (!page_id) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    // Create JSONB update
    const newData = {
      [userId]: userValues,
    };

    // Update JSONB entry using ||
    const res = await sql`
      UPDATE roles
      SET data = data || ${JSON.stringify(newData)}::jsonb
      WHERE page_id = ${page_id} AND page_type = ${pageType}
      RETURNING *;
    `;

    const log = await sql`
      INSERT INTO moderation_logs (page_id, action, reciever, action_by)
      VALUES (
        (SELECT id FROM posts p
          WHERE p.organization_id = ${page_id} OR p.categories_id = ${page_id}
          LIMIT 1),
        'edit moderator',
        ${userId},
        ${user?.id}
      )
      RETURNING *;
    `;

    return NextResponse.json({ res, log });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update moderator" },
      { status: 500 }
    );
  }
}
