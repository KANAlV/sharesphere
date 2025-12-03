// app/api/moderator/loadReports/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filterId = url.searchParams.get("id");
    const type = url.searchParams.get("type");

    let logs = await sql`
    SELECT 
      ml.id::TEXT,
      ml.page_id::TEXT,
      ml.action::TEXT,
      ml.reciever,
      ab.username AS action_by,
      ml.created_at::TEXT
    FROM moderation_logs ml
    LEFT JOIN users ab ON ml.action_by = ab.id
    LEFT JOIN posts p ON ml.page_id = p.id
    ${ type === "o"
        ? sql`LEFT JOIN organization o ON p.organization_id = o.id WHERE o.name = ${filterId}`
        : sql`LEFT JOIN categories c ON p.categories_id = c.id WHERE c.category_name = ${filterId}`
    }
    ORDER BY ml.created_at DESC
  `;


    return NextResponse.json({ logs });

  } catch (err) {
    console.error("Error fetching logs:", err);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}