import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

type Post = {
  dir: string;
  title: string;
  content: string;
  posted: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    console.log("Incoming request:", { category, offset });

    if (!category) {
      console.error("Missing category");
      return NextResponse.json({ error: "Missing category" }, { status: 400 });
    }

    // ✅ Just run the query — no <Post[]>
    const result = await sql`
      SELECT * FROM fetchPosts(${category}, 10, ${offset});
    `;

    // ✅ Explicitly cast after
    const posts = result as unknown as Post[];

    console.log("Query result:", posts.length);

    return NextResponse.json(posts, { status: 200 });
  } catch (error: any) {
    console.error("API crashed:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}