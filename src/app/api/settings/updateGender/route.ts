import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

type Account = {
    id: string;
    email: string;
    auth: boolean;
    gender: string;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const newGender = decodeURIComponent(searchParams.get("gender") ?? "");

    console.log("Incoming request:", { id, newGender });

    const toggle = await sql`
        UPDATE userdata SET
            gender=${newGender},
            updated_at = NOW()
        WHERE id=${id};
    `;

    const result = await sql`
        SELECT * FROM FetchAccount(${id});
    `;

    const posts = result as Account[];

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
