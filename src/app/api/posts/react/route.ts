import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();
  const { postId, action } = body; // "like" or "dislike"

  if (!postId || !["like", "dislike"].includes(action)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  // --- Get user ID from cookie ---
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    userId = decoded.id;
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  // --- Fetch current post reaction JSON ---
  const result = await sql`
    SELECT lnd FROM posts WHERE id = ${postId}
  `;

  if (!result.length) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  let lnd = result[0].lnd || { likes: {}, dislikes: {} };

  // --- Ensure structure exists ---
  if (!lnd.likes) lnd.likes = {};
  if (!lnd.dislikes) lnd.dislikes = {};

  // =============== BUSINESS LOGIC ===============
  if (action === "like") {
    if (lnd.likes[userId]) {
      delete lnd.likes[userId]; // toggle off
    } else {
      delete lnd.dislikes[userId]; // remove dislike if exists
      lnd.likes[userId] = { timestamp: new Date().toISOString() };
    }
  }

  if (action === "dislike") {
    if (lnd.dislikes[userId]) {
      delete lnd.dislikes[userId]; // toggle off
    } else {
      delete lnd.likes[userId]; // remove like if exists
      lnd.dislikes[userId] = { timestamp: new Date().toISOString() };
    }
  }

  // --- Update DB ---
  await sql`
    UPDATE posts
    SET lnd = ${JSON.stringify(lnd)}::jsonb
    WHERE id = ${postId}
  `;

  return NextResponse.json({
    likes: Object.keys(lnd.likes).length,
    dislikes: Object.keys(lnd.dislikes).length,
    userReacted: {
      liked: !!lnd.likes[userId],
      disliked: !!lnd.dislikes[userId]
    }
  });
}