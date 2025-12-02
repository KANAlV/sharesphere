import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { oldRule, newRule, newDesc, pageId, pageType, num  } = await req.json();

    if (!oldRule || !newRule || !newDesc || !pageId || typeof pageType !== "boolean" || typeof num !== "number") {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
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
    UPDATE rules
    SET rules = ${newRule},
        description = ${newDesc}, 
        num = ${num}
    WHERE page_id = ${page_id}
      AND page_type = ${pageType}
      AND rules = ${oldRule}
    RETURNING *;
  `;

    return NextResponse.json(res[0])
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update rule" },
      { status: 500 }
    );
  }
}