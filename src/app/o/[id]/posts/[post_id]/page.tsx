import { sql } from "@/lib/db";
import PostView from "@/components/view-post";
import Sidebar from "@/components/sidebar";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export default async function PostPage(props: { params: Promise<{ id: string, post_id: string }> }) {
  const { id, post_id } = await props.params;
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
      LIMIT 1
    `) as {
      id: string;
      username: string;
      profile: string
    }[];
  } else {
    userdata = null;
  }
  

  const posts = (await sql`
    SELECT 
      p.id::TEXT, 
      p.title, 
      p.content, 
      p.created_at, 
      u.username, 
      p.likes, 
      p.dislikes, 
      p.images
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.id = ${post_id}
  `) as {
    id: string;
    title: string;
    content: string;
    created_at: string;
    username: string;
    likes: number;
    dislikes: number;
    images: string[]; // just an array of URLs
  }[];

  const post = posts[0];

  if (!post) {
    return <div className="text-center py-10">Post not found.</div>;
  }

  // Sidebar data
  
  type Rel = {
    dir: string;
    title: string;
    theme: string;
  }
  
  const rel: Rel[] = [];

  const details = (await sql`
    SELECT * FROM fetchOrgDetails(${id});
  `) as {
    description: string;
    theme: string;
    banner: string;
    created_at: string;
  }[];

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

  const comments = (await sql`
    SELECT
      c.id::TEXT,
      c.anonymous,
      ud.profile,
      u.username,
      c.created_at::TEXT,
      c.content,
      c.has_comments,
      c.likes,
      c.dislikes,
      c.user_deleted,
      c.mod_deleted
    FROM comments c
    LEFT JOIN userdata ud ON ud.id = c.author_id
    LEFT JOIN users u ON u.id = ud.id
    WHERE
      post_id = ${post_id} AND
      parent_comment_id IS NULL
    ORDER BY c.created_at DESC
    LIMIT 20
  `) as {
      id: string,
      anonymous: boolean,
      profile: string,
      username:string,
      created_at: string,
      content: string,
      has_comments:boolean,
      likes: number,
      dislikes: number,
      user_deleted: boolean,
      mod_deleted: boolean
  }[];

  return (
    <>
      <PostView post={post} comments={comments} details={details} userdata={userdata} />
      <Sidebar id={id} details={details} rel={rel} tags={tags} rules={rules}/>
    </>
  );
}