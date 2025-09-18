import { sql } from "@/lib/db";

type Props = {
  params: { id: string };
};

type Post = {
  title: string;
  content: string;
};

export default async function OrgPage({ params }: Props) {
  const posts = (await sql`
    SELECT title, content 
    FROM posts
    WHERE categories_id = (
      SELECT id FROM categories WHERE category_name = ${params.id}
    )
  `) as Post[];

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-30">
      <h1>{params.id}</h1>

      <div className="space-y-4 mt-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.title} className="p-4 border-t-2 border-stone-800">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="text-gray-600 line-clamp-3">{post.content}</p>
            </div>
          ))
        ) : (
          <p>No posts yet for this category.</p>
        )}
      </div>
    </div>
  );
}