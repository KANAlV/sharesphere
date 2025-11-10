"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Course = {
  id: string;
  name: string;
  description: string;
};

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
};

export default function Posts({
  courses,
  posts: initialPosts,
}: {
  courses: Course[];
  posts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [offset, setOffset] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/posts?offset=${offset}`);
      const newPosts: Post[] = await res.json();

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => {
          const newUnique = newPosts.filter(
            (newPost) => !prev.some((p) => p.id === newPost.id)
          );
          return [...prev, ...newUnique];
        });
        setOffset((prev) => prev + 10);
      }

    } catch (err) {
      console.error("Error fetching more posts:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorePosts, loading, hasMore]);

  const displaytitle = (title: string) => {
    let displayTitle = "";
    for (let i = 0; i < title.length; i++) {
      if (i === 0) displayTitle = title.charAt(0).toUpperCase();
      else if (title.charAt(i) === "_") displayTitle += " ";
      else if (title.charAt(i - 1) === "_")
        displayTitle += title.charAt(i).toUpperCase();
      else displayTitle += title.charAt(i);
    }
    return displayTitle;
  };

  return (
    <div className="bg-transparent w-15/16 min-h-[90vh] mx-auto mb-5 rounded-3xl">

      <div className="px-8 pb-8">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-300 mt-10">
            No posts found.
          </p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="bg-transparent p-5 hover:bg-gray-100/10 dark:hover:bg-gray-900/10 block border-t-2"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {post.title}
              </h2>
              <p className="text-sm text-gray-400 mb-2">
                {new Date(post.created_at).toLocaleString()}
              </p>
              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                {post.content}
              </p>
              <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="false" role="img">
                    <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                          d="M14 9V5a2 2 0 0 0-2-2l-3 7v8h8.5A2.5 2.5 0 0 0 20 17.5V12a2 2 0 0 0-2-2h-2zM7 22V9H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3z"/>
                  </svg>
                  {post.likes}
                  <span className="w-4" />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="false" role="img">
                    <title>Dislike</title>
                    <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                          d="M10 15v4a2 2 0 0 0 2 2l3-7V6H6.5A2.5 2.5 0 0 0 4 8.5V14a2 2 0 0 0 2 2h2zM17 2v13h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3z"/>
                  </svg>
                  {post.dislikes}
                  </div>
            </Link>
          ))
        )}

        {loading && (
          <p className="text-center opacity-80">Loading more posts...</p>
        )}
        {!hasMore && (
          <p className="text-center opacity-60 mt-2">No more posts to show.</p>
        )}
      </div>
    </div>
  );
}
