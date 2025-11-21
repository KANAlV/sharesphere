import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { dir } = body;

    if (!dir) return NextResponse.json({ error: "Missing dir" }, { status: 400 });

    const check = await sql`SELECT 1 FROM posts WHERE id=${dir};`;
    if (!check.length) return NextResponse.json({ error: "Post does not exist" }, { status: 404 });

    const check_org = await sql`SELECT organization_id FROM posts WHERE id=${dir};`;

    let id: string | undefined;

    if (!check_org[0]?.organization_id) {
      // --- category ---
      const cat = await sql`
        SELECT c.category_name 
        FROM posts p 
        JOIN categories c ON c.id = p.categories_id 
        WHERE p.id=${dir} 
        LIMIT 1;
      `;
      id = cat[0]?.category_name;
    } else {
      // --- org/club ---
      const org = await sql`
        SELECT o.name 
        FROM posts p 
        JOIN organization o ON o.id = p.organization_id 
        WHERE p.id=${dir} 
        LIMIT 1;
      `;
      id = org[0]?.name;
    }

    if (!id) return NextResponse.json({ error: "Cannot find category or organization" }, { status: 404 });

    // Replace spaces with underscores for URL
    const slug = encodeURIComponent(id.replace(/\s+/g, "_"));

    const targetUrl = check_org[0]?.organization_id
      ? `/o/${slug}/posts/${dir}`
      : `/c/${slug}/posts/${dir}`;

    return NextResponse.json({ url: targetUrl });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}