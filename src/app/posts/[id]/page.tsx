import { sql } from "@/lib/db";
import PostView from "@/components/view-post";

export default async function PostPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // Fetch selected post
  const posts = (await sql`
    SELECT p.id::TEXT, p.title, p.content, p.created_at, u.username, p.likes, p.dislikes
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.id = ${id}
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

  return (
    <div className="bg-white dark:bg-[#222] px-10 py-25 flex gap-5">
      <PostView post={post} />
    </div>
  );
}
