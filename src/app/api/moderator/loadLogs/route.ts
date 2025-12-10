// app/api/moderator/loadReports/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const filterId = url.searchParams.get("id");
    const type = url.searchParams.get("type");

    const logs = await sql`
      SELECT 
        ml.id::TEXT,
        ml.page_id::TEXT,
        ml.action::TEXT,

        CASE
          WHEN ml.action IN ('edit moderator', 'add moderator', 'remove moderator', 'mute user')
          THEN rec.username
          ELSE ml.reciever::TEXT
        END AS reciever,

        ab.username AS action_by,
        ml.created_at::TEXT

      FROM moderation_logs ml

      -- Join reciever (only when needed)
      LEFT JOIN users rec 
        ON ml.action = 'edit moderator'
        OR ml.action = 'add moderator'
        OR ml.action = 'remove moderator'
        OR ml.action = 'mute user'
      AND rec.id = ml.reciever

      -- Moderator who performed action
      LEFT JOIN users ab 
        ON ab.id = ml.action_by

      -- Page data join
      LEFT JOIN posts p 
        ON ml.page_id = p.id

      ${
        type === "o"
          ? sql`LEFT JOIN organization o ON p.organization_id = o.id WHERE o.name = ${filterId}`
          : sql`LEFT JOIN categories c ON p.categories_id = c.id WHERE c.category_name = ${filterId}`
      }

      ORDER BY ml.created_at DESC
      LIMIT 20;
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
