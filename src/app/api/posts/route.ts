import { sql } from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const p_limit = Number(searchParams.get("limit") ?? 10);
    const p_offset = Number(searchParams.get("offset") ?? 0);

    const posts = await sql`
      SELECT
        p.id::TEXT,
        u.username,
        p.title,
        p.content,
        p.created_at::TEXT as posted,
        p.user_deleted,
        p.mod_deleted,

        COALESCE( (SELECT COUNT(*) FROM jsonb_object_keys(p.lnd->'likes')), 0 ) AS likes,
        COALESCE( (SELECT COUNT(*) FROM jsonb_object_keys(p.lnd->'dislikes')), 0 ) AS dislikes,

        p.lnd,
        c.category_name AS category,
        o.name AS organization
      FROM posts p
      LEFT JOIN users u ON u.id = p.author_id
      LEFT JOIN categories c ON c.id = p.categories_id
      LEFT JOIN organization o ON o.id = p.organization_id
      ORDER BY p.created_at DESC
      LIMIT ${p_limit} OFFSET ${p_offset};
    `;

    // IMPORTANT: sql returns the rows array already!
    return Response.json(posts);

  } catch (err) {
    console.error(err);
    return Response.json({ error: "Failed to load posts" }, { status: 500 });
  }
}