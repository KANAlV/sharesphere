// /api/users/getName/route.ts
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      );
    }

    const rows = await sql`
      SELECT username 
      FROM users 
      WHERE id = ${userId} 
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json(
        { name: null },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { name: rows[0].username },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch user name" },
      { status: 500 }
    );
  }
}
