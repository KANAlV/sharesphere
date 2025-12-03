import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { reportId } = await req.json();

    if (!reportId ) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Update JSONB entry using ||
    const res = await sql`
    DELETE FROM reports
    WHERE id = ${reportId}
    RETURNING *;
    `;

    return NextResponse.json({ res });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to remove report" },
      { status: 500 }
    );
  }
}