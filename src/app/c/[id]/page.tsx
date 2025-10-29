import { sql } from "@/lib/db";
import CoursePage from "@/components/c/pages";
import Sidebar from "@/components/sidebar";

export default async function page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const result = await sql`
    SELECT * FROM fetchCategoryCount(${id});
  `;

  const exists = result[0].count > 0;

  const posts = (await sql`
    SELECT * FROM fetchPosts(${id});
  `) as {
    dir:string
    title:string
    content:string
    posted:string
  }[];

  const details = (await sql`
    SELECT * FROM fetchCategoryDetails(${id});
  `) as {
    description: string;
    theme: string;
    banner: string;
    created_at: string;
  }[];

  return <>
    <CoursePage posts={posts} id={id} details={details}/>
    <Sidebar id={id} details={details}/>
  </>
}