import { NextResponse }from "next/server";
import { sql } from "@/lib/db";
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const user = searchParams.get("user")?.trim() ?? "";
    const pageId = searchParams.get("pageId")?.trim() ?? "";
    const pageType = searchParams.get("pageType")?.trim() ?? "";
    
    // Prevent empty or too-short queries from causing unnecessary DB hits
    if (user.length < 3) { return NextResponse.json({ users: [] }); }
    
    // Fetch moderator data
    type Mod = {
      userId: string;
      username: string;
      role: string;
      perms: {
        all: boolean;
        mute: boolean;
        announce: boolean;
        pagedetails: boolean;
        delete_posts: boolean;
        delete_comments: boolean;
        roles_management: boolean;
      };
    };
    
    // Fetch moderators as an array
    const moderators = (await sql `
      SELECT mod.user_id AS "userId",
        u.username,
        (mod.info->>'role')::TEXT AS role,
        (mod.info->'perms')::JSONB AS perms
      FROM roles roles_table CROSS JOIN LATERAL jsonb_each(roles_table.data) AS mod(user_id, info)
      JOIN users u ON u.id = mod.user_id::uuid
      WHERE roles_table.page_id = (
        SELECT id FROM organization WHERE name = ${pageId}
      ) AND roles_table.page_type = ${pageType};
    `) as Mod[];

    // Search for users whose usernames start with the provided string

    let users;
    
    users = await sql`
      SELECT username, id::TEXT
      FROM users
      WHERE username ILIKE ${user+"%"}
      LIMIT 10 
    `;
    
    //remove user if already a moderator
    const filteredUsers = users.filter( (u) => !moderators.some((mod) => mod.userId === u.id) );
    return NextResponse.json({ filteredUsers });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}