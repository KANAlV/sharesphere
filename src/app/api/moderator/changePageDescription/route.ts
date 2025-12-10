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
    const {  Desc, pageId, pageType  } = await req.json();

    if ( !Desc || !pageId || typeof pageType !== "boolean") {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Fetch the actual page UUID/id
    let page_id: string | null = null;

    if (pageType === true) {
      const org = await sql`SELECT id FROM organization WHERE name = ${pageId} LIMIT 1`;
      page_id = org[0]?.id ?? null;
    } else if (pageType === false) {
      const cat = await sql`SELECT id FROM categories WHERE category_name = ${pageId} LIMIT 1`;
      page_id = cat[0]?.id ?? null;
    }

    if (!page_id) {
      return NextResponse.json(
        { error: "Page not found" },
        { status: 404 }
      );
    }

    let res;

    if (pageType) {
      res = await sql`
        UPDATE organization
        SET description = ${Desc}
        WHERE id = ${page_id}
        RETURNING *;
      `;
    } else {
      res = await sql`
        UPDATE categories
        SET description = ${Desc}
        WHERE id = ${page_id}
        RETURNING *;
      `;
    }
    
    const log = await sql`
      INSERT INTO moderation_logs (page_id, action, reciever, action_by)
      VALUES (
        (SELECT id FROM posts p
          WHERE p.organization_id = ${page_id} OR p.categories_id = ${page_id}
          LIMIT 1),
        'change page desc',
        ${page_id},
        ${user?.id}
      )
      RETURNING *;
    `;

    return NextResponse.json({ res });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to change description" },
      { status: 500 }
    );
  }
}