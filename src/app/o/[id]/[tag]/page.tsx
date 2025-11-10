import { sql } from "@/lib/db";
import CoursePageClient from "@/components/c/tag/pages";
import Sidebar from "@/components/sidebar";

export default async function Page(props: { params: Promise<{ id: string, tag: string }> }) {
  const { id, tag } = await props.params;
  const tag_id = decodeURIComponent(tag);
  
  const posts = (await sql`
    SELECT * FROM fetchOrgTagPosts(${id}, ${tag_id}, 10, 0);
  `) as {
    dir: string;
    title: string;
    content: string;
    posted: string;
    likes: number;
    dislikes: number;
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

  return (
    <>
      <CoursePageClient id={id} tag={tag} posts={posts} details={details} announcements={announcements} />
      <Sidebar id={id} details={details} rel={rel} tags={tags} rules={rules}/>
    </>
  );
}