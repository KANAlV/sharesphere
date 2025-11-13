import { sql } from "@/lib/db";
import CoursePageClient from "@/components/c/pages";
import Sidebar from "@/components/sidebar";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const posts = (await sql`
    SELECT * FROM fetchPosts(${id}, 10, 0);
  `) as {
    dir: string;
    title: string;
    content: string;
    posted: string;
    likes: number;
    dislikes: number;
  }[];

  const announcements = (await sql`
    SELECT * FROM fetchAnnounceCarousel(${id});
  `) as {
    dir: string;
    title: string;
    content: string;
    posted: string;
  }[];

  const details = (await sql`
    SELECT * FROM fetchCategoryDetails(${id});
  `) as {
    description: string;
    theme: string;
    banner: string;
    created_at: string;
  }[];

  // Sidebar data
  
  const rel = (await sql`
    SELECT * FROM fetchRelatedOrgs(${id});
  `) as {
    dir: string;
    title: string;
    theme: string;
  }[];

  const tags = (await sql`
    SELECT * FROM fetchRelatedTags(${id});
  `) as {
    dir: string;
    tag: string;
    color: string;
  }[];

  const rules = (await sql`
    SELECT * FROM fetchPageRules(${id}, ${false});
  `) as {
    rule: string;
    description: string;
    num: string;
  }[];

  return (
    <>
      <CoursePageClient id={id} posts={posts} details={details} announcements={announcements} />
      <Sidebar id={id} details={details} rel={rel} tags={tags} rules={rules}/>
    </>
  );
}