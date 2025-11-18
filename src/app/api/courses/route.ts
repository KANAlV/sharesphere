import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const courses = await sql`
      SELECT * FROM fetchCourses();
    `;

    return NextResponse.json(courses);
  } catch (error: unknown) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
