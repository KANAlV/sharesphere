"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

type Post = {
  dir: string;
  title: string;
  content: string;
  posted: string;
  likes: number;
  dislikes: number;
};

type Details = {
  description: string;
  theme: string;
  banner: string;
  created_at: string;
};

type Announce = {
  dir: string;
  title: string;
  content: string;
  posted: string;
};

export default function CoursePage({
  posts: initialPosts,
  id,
  tag,
  details: initialDetails,
  announcements,
}: {
  posts: Post[];
  id: string;
  tag: string;
  details: Details[];
  announcements: Announce[];
}) {
  const redirect = (dest: string) => {
    window.location.href = "/posts/" + dest;
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
      const res = await fetch(`/api/c/tags?category=${id}&tags=${encodeURIComponent(tag)}&offset=${offset}`);
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
        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.documentElement.scrollHeight;

        // Only trigger when scrolled to the very bottom
        if (!loading && hasMore && scrollPosition >= pageHeight - 1) {
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

  const [sortSelect, setSortSelect] = useState(false)

  return (
    <div
      className="flex z-10 absolute w-full min-h-screen h-auto"
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
              {posts.length > 0 ? (
                announcements.map((announce, idx) => (
                  <a
                    key={`${announce.dir}-${idx}`}
                    href="#"
                    className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100/15 dark:border-stone-800 dark:hover:bg-stone-950/15"
                  >
                    <h5 className="mb-2 text-2xl font-bold tracking-tight">
                      {announce.title}
                    </h5>
                    <p className="font-normal line-clamp-3">
                      {announce.content}
                    </p>
                  </a>
                ))
              ) : (
                <p>There are no announcements yet.</p>
              )}
            </div>
          </div>
          
          {/* Posts */}
          <div className="pt-5">
            <div className="relative inline-block">
              <div onClick={() => setSortSelect(!sortSelect)} id="filter" className="select-none cursor-pointer bg-gray-500/50 h-10 w-35 px-3 rounded-lg content-center hover:inset-shadow-2xs appearance-none">
                <div className="hover:bg-gray-500/30 px-3">Recent</div>
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
                <svg
                  className="w-3 h-3 fill-current text-[#818181] dark:text-white"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                  >
                  <polygon points="0,3 20,3 10,15" />
                </svg>
              </div>
            </div>
            <div className={`${sortSelect ? "block":"hidden"} absolute z-20 bg-gray-500 w-35 hover:inset-shadow-2xs appearance-none`}>
              <div className="hover:bg-gray-500/30 px-3">Recent</div>
              <Link href={`/c/${id}/tags/${tag}/most_liked`}><div className="hover:bg-gray-500/30 px-3">Most Liked</div></Link>
            </div>
          </div>

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
                <br />
                {/* Likes and Dislikes */}
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