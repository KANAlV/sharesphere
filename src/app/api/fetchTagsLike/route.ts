import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

type tags = {
  dir: string;
  name: string;
  description: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");

    console.log("Incoming request:", { tag });

    if (!tag) {
      console.error("Missing category");
      return NextResponse.json({ error: "Missing category" }, { status: 400 });
    }

    const result = await sql`
      SELECT * FROM fetchTagsLike(${tag});
    `;

    const tags = result as tags[];

    console.log("Query result:", tags.length);

    return NextResponse.json(tags, { status: 200 });
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
