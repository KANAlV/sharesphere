import { sql } from "@/lib/db";
import PostView from "@/components/view-post";
import Sidebar from "@/components/sidebar";

export default async function PostPage(props: { params: Promise<{ id: string, post_id: string }> }) {
  const { id, post_id } = await props.params;

  const posts = (await sql`
    SELECT p.id::TEXT, p.title, p.content, p.created_at, u.username, p.likes, p.dislikes
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
  }[];

  const post = posts[0];

  if (!post) {
    return <div className="text-center py-10">Post not found.</div>;
  }

  // Sidebar data
  const rel = (await sql`
    SELECT * FROM fetchRelatedOrgs(${id});
  `) as {
    dir: string;
    title: string;
    theme: string;
  }[];

  const details = (await sql`
    SELECT * FROM fetchCategoryDetails(${id});
  `) as {
    description: string;
    theme: string;
    banner: string;
    created_at: string;
  }[];

  const tags = (await sql`
    SELECT t.id AS dir, t.name AS tag, t.color 
    FROM page_tags pt 
    JOIN tags t ON t.id = pt.tag_id 
    WHERE pt.page_id = ${post_id};
  `) as {
    dir: string;
    tag: string;
    color: string;
  }[];

  const rules = (await sql`
    SELECT * FROM fetchPageRules(${id}, false);
  `) as {
    rule: string;
    description: string;
    num: string;
  }[];

  return (
    <>
      <PostView post={post} />
      <Sidebar id={id} details={details} rel={rel} tags={tags} rules={rules}/>
    </>
  );
}