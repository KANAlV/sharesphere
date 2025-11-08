import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get("offset") || "0");

    const posts = await sql`SELECT * FROM fetchAllPosts(10, ${offset});`;
    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error("Error fetching all posts:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
