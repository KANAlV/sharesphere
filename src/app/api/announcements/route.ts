import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  console.log("📡 API route hit for announcements");

  try {
    const announcements = await sql`
      SELECT announceid, author_id, title, content
      FROM annnouncemetns
      ORDER BY created_at DESC
      LIMIT 20;
    `;

    console.log("✅ Announcements fetched:", announcements);
    return NextResponse.json({ announcements });
  } catch (error) {
    console.error("❌ Error fetching announcements:", error);
    return NextResponse.json({ error: "Failed to fetch announcements" }, { status: 500 });
  }
}