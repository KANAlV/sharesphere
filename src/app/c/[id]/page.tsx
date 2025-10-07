import { sql } from "@/lib/db";
import CoursePage from "@/components/c/pages";

export default async function page(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const result = await sql`
    SELECT COUNT(*)::int AS count 
    FROM categories 
    WHERE category_name = ${id};
  `;

  const exists = result[0].count > 0;

  const posts = (await sql`
    SELECT id AS dir,title, content 
    FROM posts
    WHERE categories_id = (
      SELECT id FROM categories WHERE category_name = ${id}
    )
    ORDER BY created_at DESC
  `) as {
    dir:string
    title:string
    content:string
  }[];

  return <CoursePage posts={posts} id={id}/>
}