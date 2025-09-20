"use client";

type Post = {
  dir: string;
  title: string;
  content: string;
};

export default function CoursePage({
  posts,
  id,
}: {
  posts: Post[];
  id: string;
}) {

const redirect = (dest:string) => {
    window.location.href = "../posts/" + dest;
}
  
let categoryName;
for(let i = 0; i < id.length;i++){
    if (i == 0)
    {
        categoryName = null;
        categoryName = id.charAt(0).toUpperCase();
    }
    else
    {
        switch (id.charAt(i)) {
            case "_": categoryName = categoryName + " ";
                    break;
            default: if (id.charAt(i - 1) == "_") {categoryName = categoryName + id.charAt(i).toUpperCase();}
                    else {categoryName = categoryName + id.charAt(i);}
                    break; 
        }
    }
}  

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-30">
      <div className="space-y-4 mt-6">
        {true ?
          <>
            <div className="h-22 bg-red-900 rounded-t-3xl"></div>
            <div className="pl-4">
              <h1 className="text-xl font-bold">{categoryName}</h1>
            </div>
          </>
        : null}
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.title} onClick={() => redirect(post.dir)} className="p-4 border-t-2 border-stone-800">
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
