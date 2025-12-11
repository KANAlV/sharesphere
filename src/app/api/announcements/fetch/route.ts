import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  console.log("📡 API route hit for announcements");

  try {
    const { offset } = await req.json();

    const announcements = await sql`
      SELECT a.announceid::TEXT, u.username AS author_id, a.title, a.content
      FROM annnouncemetns a
      LEFT JOIN users u ON u.id = a.author_id
      ORDER BY a.created_at DESC
      LIMIT 20 OFFSET ${offset};
    `;

    console.log("✅ Announcements fetched:", announcements);

    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("❌ Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
