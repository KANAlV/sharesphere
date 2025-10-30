import { sql } from "@/lib/db";
import CoursePageClient from "@/components/c/pages";
import Sidebar from "@/components/sidebar";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const result = await sql`SELECT * FROM fetchCategoryCount(${id});`;

  const posts = (await sql`
    SELECT * FROM fetchPosts(${id}, 10, 0);
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

  return (
    <>
      <CoursePageClient id={id} posts={posts} details={details} />
      <Sidebar id={id} details={details} />
    </>
  );
}