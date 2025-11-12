import { sql } from "@/lib/db";
import PostView from "@/components/view-post";

export default async function PostPage({
  params,
}: {
  params: { id: string; post_id: string };
}) {
  const { id, post_id } = await params;

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
    <div className="bg-white dark:bg-[#222] px-10 py-25 flex gap-5">
      <PostView post={post} />
    </div>
  );
}