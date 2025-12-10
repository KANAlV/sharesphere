import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { admin, level } = await req.json();

    if (!admin || !level) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const res = await sql`
      UPDATE admins
      SET level = ${Number(level)}
      WHERE admin_id = ${admin}
      RETURNING *;
    `;

    return NextResponse.json({ res });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update admin level" },
      { status: 500 }
    );
  }
}