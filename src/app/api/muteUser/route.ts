import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  let userdata: null | { id: string; username: string; email: string; udata: string } = null;

  if (token) {
    try {
      userdata = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        email: string;
        udata: string;
      };
    } catch {
      userdata = null;
    }
  }

  try {
    const body = await req.json();
    const { username, page_input, page_id, muteUntil, muteReason, page_type } = body;

    if (!username) {
      return NextResponse.json({ message: "Username is required." }, { status: 400 });
    }

    if (!muteUntil) {
      return NextResponse.json({ message: "Mute duration is required." }, { status: 400 });
    }

    if (!muteReason) {
      return NextResponse.json({ message: "Mute reason is required." }, { status: 400 });
    }

    if (!page_type) {
      return NextResponse.json({ message: "Page type is required." }, { status: 400 });
    }

    // Fetch the user's ID based on username
    const user = await sql`
      SELECT id FROM users WHERE username = ${username} LIMIT 1
    `;

    if (!user[0]) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const user_id = user[0].id;

    // Get the page ID for moderation_logs
    let pageID = await sql`
      SELECT id FROM organization WHERE name = ${page_input} LIMIT 1
    `;

    if (!pageID[0]) {
      pageID = await sql`
        SELECT id FROM categories WHERE category_name = ${page_input} LIMIT 1
      `;
    }

    const finalPageID = pageID[0]?.id || null; // null if not found

    // Insert into muted table
    const muted = await sql`
      INSERT INTO muted (user_id, page_id, page_type, duration, reason)
      VALUES (
        ${user_id},
        ${finalPageID},
        ${page_type},
        ${new Date(muteUntil)},
        ${muteReason}
      )
      RETURNING *;
    `;

    // Insert into moderation logs
    await sql`
      INSERT INTO moderation_logs (page_id, action, reciever, action_by)
      VALUES (
        ${page_id},
        'mute user',
        ${user_id},
        ${userdata?.id || null}
      )
      RETURNING *;
    `;

    return NextResponse.json({ message: "User muted successfully.", muted: muted[0] });
  } catch (err) {
    console.error("Mute user error:", err);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}