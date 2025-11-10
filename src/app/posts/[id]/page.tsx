import { sql } from "@/lib/db";
import PostView from "@/components/view-post";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  username: string;
  likes: number;
  dislikes: number;
};

export default async function PostPage({ params }: { params: { id: string } }) {
  const postId = params.id;

  // Fetch clicked post
  const result = await sql`
    SELECT p.id, p.title, p.content, p.created_at, u.username, p.likes, p.dislikes
    FROM posts p
    JOIN users u ON p.author_id = u.id
    WHERE p.id = ${postId}
  `;

  const post = result[0] as Post | undefined;

  if (!post) {
    return <div className="text-center py-10">Post not found.</div>;
  }

  return (
    <div className="bg-white dark:bg-[#222] px-10 py-25 flex gap-5">
      <PostView post={post} />
    </div>
  );
}