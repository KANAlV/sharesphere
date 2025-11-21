import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

type Post = {
  dir: string;
  title: string;
  content: string;
  posted: string;
  likes: number;
  dislikes: number;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user");
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    console.log("Incoming request:", { user, offset });

    if (!user) {
      console.error("Missing user");
      return NextResponse.json({ error: "Missing user" }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM fetchUserPosts(${user}, 10, ${offset});
    `;

    const posts = result as Post[];

    console.log("Query result:", posts.length);

    return NextResponse.json(posts, { status: 200 });
  } catch (error: unknown) {
    console.error("API crashed:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
