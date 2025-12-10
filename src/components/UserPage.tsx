"use client"
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

type User = {
    id: string;
    username: string;
    surname: string;
    firstname: string;
    middlename: string;
    suffix: string;
    gender: string;
    description: string;
    profile: string;
    banner: string;
    course: string;
    dateofbirth: string;
};

type LikesDislikesDetails = {
  likes: Record<string, { timestamp: string }>;
  dislikes: Record<string, { timestamp: string }>;
};

type Post = {
  dir: string;
  title: string;
  content: string;
  posted: string;
  likes: number;
  dislikes: number;
  lnd: LikesDislikesDetails;
};

export default function UserPage({ user, posts: initialPosts, }: { user: User[], posts: Post[]; }){
    const username = user[0].username;
    const surname = user[0].surname;
    const firstname = user[0].firstname;
    const middlename = user[0].middlename;
    const suffix = user[0].suffix;
    const gender = user[0].gender;
    const description = user[0].description;
    const profile = user[0].profile;
    const banner = user[0].banner;
    const dateofbirth = user[0].dateofbirth;
    const router = useRouter();

    // --- State ---
      const [posts, setPosts] = useState<Post[]>(initialPosts || []);
      const [offset, setOffset] = useState<number>(10);
      const [loading, setLoading] = useState<boolean>(false);
      const [hasMore, setHasMore] = useState<boolean>(true);
      const [showAnnouncements, setShowAnnouncements] = useState<boolean>(true);
    
      // --- Load More Posts ---
      const loadMorePosts = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);
    
        try {
          const res = await fetch(`/api/u?user=${username}&offset=${offset}`);
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
      }, [loading, hasMore, offset, username]);
    
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

    // --- Format date ---
    const displayPostedDate = (postedDate: string) => postedDate.split(" ")[0];

    // --- redirect --- //
    const redirect = async (dir: string) => {
        try {
            const response = await fetch("/api/u/posts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ dir }),
            });

            if (!response.ok) throw new Error("Failed to post data");

            const data = await response.json();
            console.log("Response:", data);

            if (data.url) {
            router.push(data.url); // actually redirect
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="flex mt-12 w-full">
            <div className="relative w-full lg:max-w-2xl xl:max-w-4xl 2xl:max-w-5xl 3xl:max-w-6xl mx-auto sm:mt-20">
                {/* Banner */}
                <div className="relative h-40 rounded-2xl overflow-clip"> {/* Adjust h-72 for desired height */}
                    <Image
                      src={banner}
                      alt="Banner"
                      fill
                      style={{ objectFit: "cover", objectPosition: "center" }}
                      priority={true} // loads eagerly
                    />
                    </div>

                    {/* Profile - overlapping banner */}
                    <div className="relative flex items-center pl-4 -mt-16"> {/* Half overlap using negative margin */}
                    <div className="relative w-32 h-32 border-4 bg-black dark:bg-white border-black dark:border-white rounded-full overflow-hidden">
                      <div className="w-full h-full rounded-full relative">
                        <Image
                          src={profile}
                          alt="user profile"
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-full"
                          priority={true}
                        />
                      </div>
                    </div>
                    <div className="flex h-32 justify-end items-end p-4">
                        <h1 className="text-3xl font-bold ml-4">{username}</h1>
                    </div>
                </div>

                <div className="mt-12 mb-12 w-full">
                    <div className="px-4 my-4 w-full text-lg font-bold border-b-2 border-gray-500">About</div>
                    <div className="flex my-2 px-4">
                        <div className="mr-22">Full Name: {surname? surname+",":""} {firstname} {middlename} {suffix}</div>
                        <div>Gender: {gender}</div>
                    </div>
                    <div className="px-4 my-4">Birth Date: {dateofbirth}</div>
                    <div className="w-full p-4 bg-black/20">{description}</div>
                </div>
                <div>
                    <div className="px-4 my-4 w-full text-lg font-bold border-b-2 border-gray-500">Posts</div>
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
                            {post.lnd.likes ? Object.keys(post.lnd.likes).length : 0}
                            <span className="w-4" />
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="false" role="img">
                                <title>Dislike</title>
                                <path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                                    d="M10 15v4a2 2 0 0 0 2 2l3-7V6H6.5A2.5 2.5 0 0 0 4 8.5V14a2 2 0 0 0 2 2h2zM17 2v13h3a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-3z"/>
                            </svg>
                            {post.lnd.dislikes ? Object.keys(post.lnd.likes).length : 0}
                            </div>
                        </div>
                        ))
                    ) : (
                        <p>This user does not have posts.</p>
                    )}

                    {loading && <p className="text-center opacity-80">Loading more posts...</p>}
                    {!hasMore && (
                        <p className="text-center opacity-60 mt-2">No more posts to show.</p>
                    )}
                </div>
            </div>
        </div>
    )
}