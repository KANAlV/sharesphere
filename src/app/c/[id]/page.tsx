import { sql } from "@/lib/db";
import { title } from "process";

type Post = {
  title: string;
  content: string;
};

export default async function OrgPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  const posts = (await sql`
    SELECT title, content 
    FROM posts
    WHERE categories_id = (
      SELECT id FROM categories WHERE category_name = ${id}
    )
  `) as Post[];

  const result = await sql`
    SELECT COUNT(*)::int AS count 
    FROM categories 
    WHERE category_name = ${id};
  `;

  var titleHeader;
  for(let i = 0; i < id.length;i++){
    if (i == 0)
    {
      titleHeader = null;
      titleHeader = id.charAt(0).toUpperCase();
    }
    else
    {
      switch (id.charAt(i)) {
        case "_": titleHeader = titleHeader + " ";
                break;
        default: if (id.charAt(i - 1) == "_") {titleHeader = titleHeader + id.charAt(i).toUpperCase();}
                else {titleHeader = titleHeader + id.charAt(i);}
                break; 
      }
      
    }
  }

  const exists = result[0].count > 0;

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-30">
      <div className="space-y-4 mt-6">
        {exists ?
          <>
            <div className="h-22 bg-red-900 rounded-t-3xl"></div>
            <div className="pl-4">
              <h1 className="text-xl font-bold">{titleHeader}</h1>
            </div>
          </>
        : null}
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.title} className="p-4 border-t-2 border-stone-800">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="text-gray-600 line-clamp-3">{post.content}</p>
            </div>
          ))
        ) : (
          <p>This Page does not have Any Entry.</p>
        )}
      </div>
    </div>
  );
}
