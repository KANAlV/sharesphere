// app/api/moderator/loadReports/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filterId = url.searchParams.get("id"); // get ?id=123

    const reports = await sql`
        SELECT 
            r.id::TEXT,
            r.post_id::TEXT,
            r.comment_id::TEXT,
            pb.username AS posted_by,
            rb.username AS reported_by,
            r.reason,
            r.page_type,
            r.created_at::TEXT,
            c.category_name,
            o.name AS org_name
        FROM reports r
        LEFT JOIN posts p 
            ON p.id = r.post_id
        LEFT JOIN users rb
            ON r.reported_by = rb.id
        LEFT JOIN users pb
            ON p.author_id = pb.id
        LEFT JOIN categories c 
            ON p.categories_id = c.id
        LEFT JOIN organization o 
            ON p.organization_id = o.id
        WHERE 
            (c.category_name = ${filterId}) OR
            (o.name = ${filterId})
        ORDER BY r.created_at DESC
    `;

    return NextResponse.json({ reports });
  } catch (err) {
    console.error("Error fetching reports:", err);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}