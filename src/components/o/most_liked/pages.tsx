"use client";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

type LikesDislikesDetails = {
  likes: Record<string, { timestamp: string }>;
  dislikes: Record<string, { timestamp: string }>;
};

type UserData = {
  id: string;
  username: string;
  profile: string;
};

type Post = {
  dir: string;
  username: string;
  title: string;
  content: string;
  posted: string;
  user_deleted: boolean;
  mod_deleted: boolean;
  likes: number;
  dislikes: number;
  lnd: LikesDislikesDetails;
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
  userdata,
  details: initialDetails,
  announcements,
}: {
  posts: Post[];
  id: string;
  userdata: UserData[] | null;
  details: Details[];
  announcements: Announce[];
}) {
  const redirect = (dest: string) => {
    window.location.href = "/o/" + id + "/posts/" + dest;//
  };

  const userID = userdata? userdata[0].id : "";

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
      const res = await fetch(`/api/o/most_liked?organization=${id}&offset=${offset}`);
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
      className="flex w-full min-w-0
      lg:relative lg:top-24 lg:min-h-0 lg:max-h-15/20 xl:max-h-17/20 lg:min-w-0 justify-self-center
      overflow-y-scroll scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600"
      style={{ color: fontcolor }}
    >

      <div className="block w-full lg:shrink lg:max-w-300 lg:scroll-x-hidden mx-auto">
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
              {announcements.length > 0 ? (
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
          
          {/* Sort */}
          <div className="pt-5">
            <div className="relative inline-block">
              <div onClick={() => setSortSelect(!sortSelect)} id="filter" className="select-none cursor-pointer bg-gray-500/50 h-10 w-35 px-3 rounded-lg content-center hover:inset-shadow-2xs appearance-none">
                <div>Most Liked</div>
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
            <div className={`${sortSelect ? "block":"hidden"} absolute z-20 bg-white dark:bg-[#7B7B7B] w-35 hover:inset-shadow-2xs appearance-none`}>
              <Link href={`../${id}`}><div className="hover:bg-gray-500/30 px-3">Recent</div></Link>
              <div className="hover:bg-gray-500/30 px-3">Most Liked</div>
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
                <div className="items-center">
                  <h2 className="text-xl font-bold">{post.title}</h2>
                  <p className="inline-block opacity-80">
                    {post.user_deleted || post.mod_deleted? "Anon":post.username} — {displayPostedDate(post.posted)}
                  </p>
                </div>
                <p className="line-clamp-3">{post.mod_deleted? "[deleted] by mod":(post.user_deleted? "[deleted] by user":(post.content))}</p>
                <br />
                {/* Likes and Dislikes */}
                <div className="flex">
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
                  <p style={{color: fontcolor}} className="pl-2 text-lg">{post.lnd.likes ? Object.keys(post.lnd.likes).length : 0}</p>
                  <span className="w-4" />
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
                  <p style={{color: fontcolor}} className="pl-2 text-lg">{post.lnd.likes ? Object.keys(post.lnd.dislikes).length : 0}</p>
                  </div>
              </div>
            ))
          ) : (
            <p>This Page does not have Any Entry.</p>
          )}

          {loading && <p className="text-center opacity-80">Loading more posts...</p>}
          {hasMore && !loading && (
            <div className="text-center mt-4">
              <button
                className="px-4 py-2 rounded-full hover:bg-gray-500/50 border-2 border-gray-500 transition"
                onClick={loadMorePosts}
              >
                Load More
              </button>
            </div>
          )}
          {!hasMore && (
            <p className="text-center opacity-60 mt-2">No more posts to show.</p>
          )}
        </div>
      </div>
    </div>
  );
}