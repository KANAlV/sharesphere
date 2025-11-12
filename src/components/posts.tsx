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
  category: string,
  organization: string,
  username?: string;
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

  // 👇 Function to fetch posts (now includes username)
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

  // Infinite scroll
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

  // Fetch usernames for each post once on mount
  useEffect(() => {
    const fetchUsernames = async () => {
      try {
        const updated = await Promise.all(
          posts.map(async (post) => {
            if (post.username) return post; // skip if already present
            const res = await fetch(`/api/users/by-post/${post.id}`);
            const data = await res.json();
            return { ...post, username: data.username || "Unknown" };
          })
        );
        setPosts(updated);
      } catch (err) {
        console.error("Error fetching usernames:", err);
      }
    };
    if (posts.length > 0) fetchUsernames();
  }, [posts.length]);

  return (
    <div className="bg-transparent w-15/16 min-h-[90vh] mx-auto mb-5 rounded-3xl">
      <h1 className="text-4xl font-bold text-left ml-10 mt-10 mb-8 text-gray-900 dark:text-white">
        Posts
      </h1>
      <div className="px-8 pb-8">
        {posts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-300 mt-10">
            No posts found.
          </p>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/${post.organization ? "o/" + post.organization:"c/" + post.category}/posts/${post.id}`}
              className="bg-transparent p-5 hover:bg-gray-100/10 dark:hover:bg-gray-900/10 block border-t-2"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {post.title}
              </h2>
              {/* 👇 Username + date */}
              <p className="text-sm text-gray-400 mb-2">
                {post.username ? post.username : "Loading..."} —{" "}
                {new Date(post.created_at).toLocaleString()}
              </p>

              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                {post.content}
              </p>

              {/* Likes/Dislikes */}
              <div className="flex mt-2 text-gray-600 dark:text-gray-300 gap-2">
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 9V5a2 2 0 0 0-2-2l-3 7v8h8.5A2.5 2.5 0 0 0 20 17.5V12a2 2 0 0 0-2-2h-2zM7 22V9H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3z" />
                  </svg>
                  {post.likes}
                </div>

                <div className="flex items-center gap-1 ml-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M10 15v4a2 2 0 0 0 2 2l3-7V6H6.5A2.5 2.5 0 0 0 4 8.5V14a2 2 0 0 0 2 2h2zM17 2v13h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3z" />
                  </svg>
                  {post.dislikes}
                </div>
              </div>
            </Link>
          ))
        )}

        {loading && (
          <p className="text-center opacity-80 mt-4">Loading more posts...</p>
        )}
        {!hasMore && (
          <p className="text-center opacity-60 mt-2">No more posts to show.</p>
        )}
      </div>
    </div>
  );
}
