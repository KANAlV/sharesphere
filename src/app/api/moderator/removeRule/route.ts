import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { rule, pageId, pageType  } = await req.json();

    if (!rule || !pageId || typeof pageType !== "boolean") {
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
      DELETE FROM rules
      WHERE page_id = ${page_id}
      AND page_type = ${pageType}
      AND rules = ${rule}
      RETURNING *;
    `;

    return NextResponse.json(res[0] || null)
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to remove rule" },
      { status: 500 }
    );
  }
}