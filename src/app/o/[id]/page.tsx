import { sql } from "@/lib/db";
import CoursePageClient from "@/components/o/pages";
import Sidebar from "@/components/sidebar";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

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
    SELECT * FROM fetchOrgPosts(${id}, 10, 0);
  `) as {
    dir: string;
    username: string;
    title: string;
    content: string;
    posted: string;
    likes: number;
    dislikes: number;
    lnd:LikesDislikesDetails
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
    SELECT * FROM fetchOrgRelatedTags(${id});
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

  return (
    <>
      <CoursePageClient id={id} userdata={userdata} posts={posts} details={details} announcements={announcements} />
      <Sidebar id={id} details={details} rel={rel} tags={tags} rules={rules}/>
    </>
  );
}