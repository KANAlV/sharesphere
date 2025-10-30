"use client";
import { useState, useEffect, useCallback } from "react";

type Post = {
  dir: string;
  title: string;
  content: string;
  posted: string;
};

type Details = {
  description: string;
  theme: string;
  banner: string;
  created_at: string;
};

export default function CoursePage({
  posts: initialPosts,
  id,
  details: initialDetails,
}: {
  posts: Post[];
  id: string;
  details: Details[];
}) {
  const redirect = (dest: string) => {
    window.location.href = "../posts/" + dest;
  };

  // --- State ---
  const [posts, setPosts] = useState<Post[]>(initialPosts || []);
  const [details] = useState<Details[]>(initialDetails || []);
  const [offset, setOffset] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [showAnnouncements, setShowAnnouncements] = useState<boolean>(true);

  // --- Load More Posts ---
  const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(`/api/c?category=${id}&offset=${offset}`);
      const newPosts: Post[] = await res.json();

      if (newPosts.length === 0) {
        setHasMore(false);
      } else {
        setPosts((prev) => [...prev, ...newPosts]);
        setOffset((prev) => prev + 10);
      }
    } catch (err) {
      console.error("Error fetching more posts:", err);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, offset, id]);

  // --- Infinite Scroll with debounce ---
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;

    const handleScroll = () => {
      if (debounceTimer) return;

      debounceTimer = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
          !loading &&
          hasMore
        ) {
          loadMorePosts();
        }
        debounceTimer = null;
      }, 150);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (debounceTimer) clearTimeout(debounceTimer);
    };
  }, [loadMorePosts, loading, hasMore]);

  // --- Format course name ---
  const categoryName = id
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const pageDetails = details[0];

  // --- Font color logic ---
  let fontcolor = "black";
  const hexColor = pageDetails.theme.startsWith("#")
    ? pageDetails.theme.slice(1)
    : pageDetails.theme;
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (brightness < 128) fontcolor = "lightgray";

  // --- Format date ---
  const displayPostedDate = (postedDate: string) => postedDate.split(" ")[0];

  return (
    <div
      className="flex z-10 absolute w-full h-auto"
      style={{ backgroundColor: pageDetails.theme, color: fontcolor }}
    >
      <div className="relative w-full lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl mx-auto sm:mt-20">
        <div className="space-y-4 mt-6">
          {/* Page Name / Banner */}
          <div
            id="banner"
            className="h-30 bg-black sm:rounded-xl"
            style={{
              backgroundImage: `url(${pageDetails.banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
          <div className="pl-4">
            <h1 className="text-xl font-bold">{categoryName}</h1>
          </div>

          {/* Announcements */}
          <div className="flex relative h-10 sm:rounded-xl border border-gray-200 dark:border-stone-800">
            <div className="my-auto mx-5 content-start">
              Org / Club Announcements
            </div>
            <div className="grow" />
            <div className="w-8 content-end justify-center">
              <button
                className="rounded-full hover:border hover:border-white place-self-center"
                onClick={() => setShowAnnouncements(!showAnnouncements)}
              >
                <svg
                  width="24px"
                  height="24px"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-300 ${
                    showAnnouncements ? "rotate-180" : ""
                  }`}
                >
                  <path d="M7 10l5 5 5-5" />
                </svg>
              </button>
            </div>
          </div>

          <div
            className={`relative transition-all duration-300 overflow-hidden ${
              showAnnouncements ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="min-w-100% h-50 flex overflow-x-auto scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
              {[...Array(10)].map((_, i) => (
                <a
                  key={i}
                  href="#"
                  className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100/15 dark:border-stone-800 dark:hover:bg-stone-950/15"
                >
                  <h5 className="mb-2 text-2xl font-bold tracking-tight">
                    Noteworthy technology acquisitions {2020 + i}
                  </h5>
                  <p className="font-normal line-clamp-3">
                    Here are the biggest enterprise technology acquisitions so far,
                    in reverse chronological order.
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Posts */}
          {posts.length > 0 ? (
            posts.map((post, idx) => (
              <div
                key={`${post.dir}-${idx}`} // unique even if dir duplicates
                onClick={() => redirect(post.dir)}
                className="p-4 border-t border-stone-800 hover:bg-gray-100/15 dark:hover:bg-stone-950/15 cursor-pointer"
              >
                <div className="flex items-center">
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <span className="w-4" />
                  <p className="inline-block opacity-80">
                    {displayPostedDate(post.posted)}
                  </p>
                </div>
                <p className="line-clamp-3">{post.content}</p>
              </div>
            ))
          ) : (
            <p>This Page does not have Any Entry.</p>
          )}

          {loading && <p className="text-center opacity-80">Loading more posts...</p>}
          {!hasMore && (
            <p className="text-center opacity-60 mt-2">No more posts to show.</p>
          )}
        </div>
      </div>
    </div>
  );
}