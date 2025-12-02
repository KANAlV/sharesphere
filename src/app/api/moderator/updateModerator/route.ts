import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
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

    return NextResponse.json({ res });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update moderator" },
      { status: 500 }
    );
  }
}
