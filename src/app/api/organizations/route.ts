import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

type Info = {
    id: string;
    name: string;
    description: string;
    banner: string;
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const offset = parseInt(searchParams.get("offset") || "0", 20);

    console.log("Incoming request:", { offset });

    const result = await sql`
      SELECT * FROM fetchAllOrgs( 20, ${offset});
    `;

    const info = result as Info[];

    console.log("Query result:", info.length);

    return NextResponse.json(info, { status: 200 });
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
