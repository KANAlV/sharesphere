import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const {  rule, Desc, pageId, pageType, num  } = await req.json();

    if (!rule || !Desc || !pageId || !pageType || !num) {
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

    // Upsert into roles table using page_id + page_type as unique identifier
    const res = await sql`
      INSERT INTO rules (page_id, page_type, rules, description, num)
      VALUES (${page_id}, ${pageType}, ${rule}, ${Desc}, ${num})
      RETURNING *;
    `;

    return NextResponse.json({ res });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to add rule" },
      { status: 500 }
    );
  }
}