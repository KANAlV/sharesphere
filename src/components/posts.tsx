"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type Course = {
  id: string;
  name: string;
  description: string;
};

type UserData = {
  id: string;
  username: string;
  profile: string;
};

type LikesDislikesDetails = {
    likes: Record<string, { timestamp: string }>;
    dislikes: Record<string, { timestamp: string }>;
  };

type Post = {
  id: string;
  title: string;
  content: string;
  posted: string;
  user_deleted: boolean;
  mod_deleted: boolean;
  likes: number;
  dislikes: number;
  category: string;
  lnd: LikesDislikesDetails;
  organization: string;
  username?: string;
};

export default function Posts({
  userdata,
  courses,
  posts: initialPosts,
}: {
  userdata: UserData[] | null;
  courses: Course[];
  posts: Post[];
}) {
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [offset, setOffset] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const userID = userdata ? userdata[0].id : "";

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
          posts.map((post, idx) => (
            <Link
              key={idx}
              href={`/${post.organization ? "o/" + post.organization:"c/" + post.category}/posts/${post.id}`}
              className="bg-transparent p-5 hover:bg-gray-100/10 dark:hover:bg-gray-900/10 block border-t-2"
            >
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {post.title}
              </h2>
              {/* 👇 Username + date */}
              <p className="text-sm text-gray-400 mb-2">
                {post.user_deleted || post.mod_deleted? "Anon":post.username} —{" "}
                {new Date(post.posted).toLocaleString()}
              </p>

              <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                {post.mod_deleted? "[deleted] by mod":(post.user_deleted? "[deleted] by user":(post.content))}
              </p>

              {/* Likes/Dislikes */}
              <div className="flex mt-2 text-gray-600 dark:text-gray-300 gap-2">
                <div className="flex items-center gap-1">
                  {post.lnd?.likes?.[userID] ? (
                    <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -760.000000)" className="fill-current">
                                <g id="icons" transform="translate(56.000000, 160.000000)">
                                    <path d="M203,620 L207.200006,620 L207.200006,608 L203,608 L203,620 Z M223.924431,611.355 L222.100579,617.89 C221.799228,619.131 220.638976,620 219.302324,620 L209.300009,620 L209.300009,608.021 L211.104962,601.825 C211.274012,600.775 212.223214,600 213.339366,600 C214.587817,600 215.600019,600.964 215.600019,602.153 L215.600019,608 L221.126177,608 C222.97313,608 224.340232,609.641 223.924431,611.355 L223.924431,611.355 Z" id="like-[#1385]">
                                    </path>
                                </g>
                            </g>
                        </g>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -760.000000)" fill="none" className="stroke-current" strokeWidth="1.5">
                                <g id="icons" transform="translate(56.000000, 160.000000)">
                                    <path d="M203,620 L207.200006,620 L207.200006,608 L203,608 L203,620 Z M223.924431,611.355 L222.100579,617.89 C221.799228,619.131 220.638976,620 219.302324,620 L209.300009,620 L209.300009,608.021 L211.104962,601.825 C211.274012,600.775 212.223214,600 213.339366,600 C214.587817,600 215.600019,600.964 215.600019,602.153 L215.600019,608 L221.126177,608 C222.97313,608 224.340232,609.641 223.924431,611.355 L223.924431,611.355 Z" id="like-[#1385]">
                                    </path>
                                </g>
                            </g>
                        </g>
                    </svg>
                  )}
                  {post.lnd.likes ? Object.keys(post.lnd.likes).length : 0}
                </div>

                <div className="flex items-center gap-1 ml-4">
                  {post.lnd?.dislikes?.[userID] ? (
                    <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="Dribbble-Light-Preview" transform="translate(-179.000000, -760.000000)" className="fill-current">
                          <g id="icons" transform="translate(56.000000, 160.000000)">
                            <path d="M139.800374,612 L144.00037,612 L144.00037,600 L139.800374,600 L139.800374,612 Z M127.698085,600 L137.700376,600 L137.700376,611.979 L135.894378,618.174 C135.725328,619.224 134.776129,620 133.66103,620 C132.412581,620 131.400381,619.036 131.400381,617.847 L131.400381,612 L125.873186,612 C124.026238,612 122.659139,610.358 123.074939,608.644 L124.899837,602.109 C125.200137,600.868 126.360386,600 127.698085,600 L127.698085,600 Z" id="dislike-[#1387]">
                            </path>
                          </g>
                        </g>
                      </g>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g id="Dribbble-Light-Preview" transform="translate(-179.000000, -760.000000)" fill="none" className="stroke-current" strokeWidth="1.5">
                          <g id="icons" transform="translate(56.000000, 160.000000)">
                            <path d="M139.800374,612 L144.00037,612 L144.00037,600 L139.800374,600 L139.800374,612 Z M127.698085,600 L137.700376,600 L137.700376,611.979 L135.894378,618.174 C135.725328,619.224 134.776129,620 133.66103,620 C132.412581,620 131.400381,619.036 131.400381,617.847 L131.400381,612 L125.873186,612 C124.026238,612 122.659139,610.358 123.074939,608.644 L124.899837,602.109 C125.200137,600.868 126.360386,600 127.698085,600 L127.698085,600 Z" id="dislike-[#1387]">
                            </path>
                          </g>
                        </g>
                      </g>
                    </svg>
                  )}
                  {post.lnd.likes ? Object.keys(post.lnd.dislikes).length : 0}
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
