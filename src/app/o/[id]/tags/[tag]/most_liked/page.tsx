import { sql } from "@/lib/db";
import CoursePageClient from "@/components/o/tag/most_liked/pages";
import Sidebar from "@/components/sidebar";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import AdminControls from "@/components/admin_controls";

export default async function Page(props: { params: Promise<{ id: string, tag: string }> }) {
  const { id, tag } = await props.params;
  const tag_id = decodeURIComponent(tag);

  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  let user: null | { id: string; username: string; email: string; udata: string; } = null;

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        email: string;
        udata: string;
      };
    } catch {
      user = null;
    }
  }

  let userdata;
  if (user) {
    userdata = (await sql`
      SELECT
        u.id::TEXT,
        u.username,
        ud.profile
      FROM users u
      LEFT JOIN userdata ud ON ud.id = u.id
      WHERE
        u.id = ${user.id}
    `) as {
      id: string;
      username: string;
      profile: string
    }[];
  } else {
    userdata = null;
  }

  const exists = (await sql`
    SELECT 1 FROM organization WHERE name=${id} LIMIT 1;
  `)

  if(exists.length === 0) {
    redirect("/");
  }

  type LikesDislikesDetails = {
    likes: Record<string, { timestamp: string }>;
    dislikes: Record<string, { timestamp: string }>;
  };
  
  const posts = (await sql`
    SELECT * FROM fetchMostLikedOrgTagPosts(${id}, ${tag_id}, 10, 0);
  `) as {
    dir: string;
    username: string;
    title: string;
    content: string;
    created_at: string;
    likes: number;
    dislikes: number;
    lnd: LikesDislikesDetails;
    user_deleted: boolean;
    mod_deleted: boolean;
  }[];

  const announcements = (await sql`
    SELECT * FROM fetchOrgAnnounce(${id});
  `) as {
    dir: string;
    title: string;
    content: string;
    posted: string;
  }[];

  const details = (await sql`
    SELECT * FROM fetchOrgDetails(${id});
  `) as {
    description: string;
    theme: string;
    banner: string;
    created_at: string;
  }[];

  // Sidebar data
  
  type Rel = {
    dir: string;
    title: string;
    theme: string;
  }
  
  const rel: Rel[] = [];

  const tags = (await sql`
    SELECT id AS dir, name AS tag, color FROM tags WHERE name = ${tag_id};
  `) as {
    dir: string;
    tag: string;
    color: string;
  }[];

  const rules = (await sql`
    SELECT * FROM fetchPageRules(${id}, true);
  `) as {
    rule: string;
    description: string;
    num: string;
  }[];

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
      adviser: boolean;
    };
  };

  // Fetch moderators as an array
  const moderators = (await sql`
    SELECT 
      mod.user_id AS "userId",
      u.username,
      (mod.info->>'role')::TEXT AS role,
      (mod.info->'perms')::JSONB AS perms
    FROM roles roles_table
    CROSS JOIN LATERAL jsonb_each(roles_table.data) AS mod(user_id, info)
    JOIN users u ON u.id = mod.user_id::uuid
    WHERE roles_table.page_id = (
      SELECT id FROM organization WHERE name = ${id}
    )
      AND roles_table.page_type = 'organization';
  `) as Mod[];

  // Check if current user is a moderator
  const isModerator = user && moderators.some(mod => mod.userId === user.id);

  const isAdmin = user? user.udata:"0";
  // ------------------------------------

  return (
    <>
      <CoursePageClient id={id} userdata={userdata} tag={tag} posts={posts} details={details} announcements={announcements} />
      {user?.udata == "1" ? (
        <AdminControls id={id} isAdmin={isAdmin} userdata={userdata} moderators={moderators} details={details} rel={rel} tags={tags} rules={rules}/>
      ):((
        isModerator? (
        <AdminControls id={id} isAdmin={isAdmin} userdata={userdata} moderators={moderators} details={details} rel={rel} tags={tags} rules={rules}/>
        ):(
        <Sidebar id={id} details={details} rel={rel} tags={tags} rules={rules}/>
        ))
      )}
    </>
  );
}