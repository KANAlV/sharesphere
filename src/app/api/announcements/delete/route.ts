import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { announceid } = await req.json();

    if (!announceid) {
      return NextResponse.json(
        { error: "announceid is required" },
        { status: 400 }
      );
    }

    // Delete announcement
    const result = await sql`
      DELETE FROM annnouncemetns
      WHERE announceid = ${announceid}
      RETURNING announceid;
    `;

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deleted: result[0] });
  } catch (error) {
    console.error("❌ Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}