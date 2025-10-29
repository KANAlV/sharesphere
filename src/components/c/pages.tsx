"use client";
import { useState, useEffect } from "react";

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

  // --- Infinite Scroll Setup ---
  const [posts, setPosts] = useState(initialPosts || []);
  const [details] = useState(initialDetails || []); // ✅ keep details in state
  const [offset, setOffset] = useState(10);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMorePosts = async () => {
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
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        hasMore
      ) {
        loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, offset]);

  // Format course name
  let categoryName = "";
  for (let i = 0; i < id.length; i++) {
    if (i === 0) categoryName = id.charAt(0).toUpperCase();
    else if (id.charAt(i) === "_") categoryName += " ";
    else if (id.charAt(i - 1) === "_") categoryName += id.charAt(i).toUpperCase();
    else categoryName += id.charAt(i);
  }

  const pageDetails = details[0];

  // Font color logic
  let fontcolor = "black";
  const hexColor = pageDetails.theme.startsWith("#")
    ? pageDetails.theme.slice(1)
    : pageDetails.theme;
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (brightness < 128) fontcolor = "lightgray";

  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const toggleAnnouncements = () => setShowAnnouncements(!showAnnouncements);

  const displayPostedDate = (postedDate: string) => {
    let displayPostedDate = "";
    for (let i = 0; i < postedDate.length; i++) {
      if (postedDate.charAt(i) !== " ") {
        displayPostedDate += postedDate.charAt(i);
      } else break;
    }
    return displayPostedDate;
  };

  return (
    <div
      className="flex z-10 absolute w-full h-auto"
      style={{ backgroundColor: pageDetails.theme, color: fontcolor }}
    >
      <div className="relative w-full lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl mx-auto sm:mt-20">
        <div className="space-y-4 mt-6">
          {/* Page Name */}
          <div
            id="banner"
            className="h-30 bg-black sm:rounded-xl"
            style={{
              backgroundImage: `url(${pageDetails.banner})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          ></div>
          <div className="pl-4">
            <h1 className="text-xl font-bold">{categoryName}</h1>
          </div>

          {/* Posts */}
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.dir}
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
