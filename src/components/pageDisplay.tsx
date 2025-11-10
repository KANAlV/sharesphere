"use client";
import { useState,useEffect,useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

type Info = {   // singular type
    id: string;
    name: string;
    description: string;
    banner: string;
}

export default function Info({ info: initialPosts }: {info: Info[];}) {
    const pathname = usePathname();
    const location = pathname.startsWith("/organizations") ? "o" : "c";
    const [gridView, setGridView] = useState(true);

    const displayTitle = (title: string) => {
        let displayTitleStr = "";
        for (let i = 0; i < title.length; i++) {
            if (i === 0) {
                displayTitleStr = title.charAt(0).toUpperCase();
            } else {
                if (title.charAt(i) === "_") displayTitleStr += " ";
                else if (title.charAt(i - 1) === "_") displayTitleStr += title.charAt(i).toUpperCase();
                else displayTitleStr += title.charAt(i);
            }
        }
        return displayTitleStr;
    }

    // --- State ---
    const [info, setPosts] = useState<Info[]>(initialPosts || []);
    const [offset, setOffset] = useState<number>(20);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [showAnnouncements, setShowAnnouncements] = useState<boolean>(true);

    // --- Load More Posts ---
    const loadMorePosts = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
        const res = await fetch(`/api/category?offset=${offset}`);
        const newPosts: Info[] = await res.json();

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
    }, [loading, hasMore, offset]);

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
    return (
        <div className="mt-20 m-auto p-1 w-full lg:w-3/5 justify-between h-max flex flex-wrap gap-4">
            {/* <!-- top-right small box --> */}
            <div className="flex items-center justify-between w-full">
                <span className="text-2xl pl-2">
                    {pathname.startsWith("/organizations") ? "Organizations" : "Courses"}
                </span>
                <div className="cursor-pointer grid grid-cols-2 h-10 w-25 rounded-full border-2 border-gray-500">
                    <div className="border-r-1 border-gray-500">
                        <svg
                            onClick={() => setGridView(true)}
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill={gridView ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                            className="m-auto my-2 cursor-pointer"
                        >
                            <rect x="3" y="3" width="7" height="7" />
                            <rect x="14" y="3" width="7" height="7" />
                            <rect x="14" y="14" width="7" height="7" />
                            <rect x="3" y="14" width="7" height="7" />
                        </svg>
                    </div>
                    <div className="border-l-1 border-gray-500">
                        <svg
                            onClick={() => setGridView(false)}
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill={!gridView ? "currentColor" : "none"}
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinejoin="round"
                            className="m-auto my-2 cursor-pointer"
                        >
                            <rect x="3" y="3" width="18" height="4" />
                            <rect x="3" y="10" width="18" height="4" />
                            <rect x="3" y="17" width="18" height="4" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* <!-- info container --> */}
            <div className={`w-full h-max ${gridView ? "grid grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-2" : "grid grid-cols-2 gap-4"}`}>
                {info.length > 0 ?
                    info.map((Info) => (
                        <Link href={`/${location}/` + Info.name} key={Info.id}>
                            <div
                                key={Info.id}
                                className={`overflow-clip ${gridView
                                ? "relative w-30 h-30 xl:w-40 xl:h-40 bg-white dark:bg-gray-800 shadow-md rounded-lg flex flex-col items-center justify-center cursor-pointer flex-shrink-0"
                                : "w-full h-20 bg-white dark:bg-gray-800 shadow-md rounded-lg flex items-center pl-4 cursor-pointer flex-shrink-0"
                                }`}
                            >
                                <div
                                className={`${gridView ? "w-full h-full" : "w-12 h-12 rounded-lg"}`}
                                style={{
                                    backgroundImage: `url(${Info.banner})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat",
                                }}
                                />

                                <div className="flex px-2 items-center justify-center w-full h-full">
                                <p className="text-center text-xs lg:text-md font-semibold line-clamp-3">
                                    {displayTitle(Info.name)}
                                </p>
                                </div>
                            </div>
                        </Link>
                    )
                ):(
                    <p>This Page does not have Any Entry.</p>
                )}
            </div>
            {loading && <p className="text-center opacity-80">Loading more info...</p>}
            {!hasMore && (
                <p className="text-center opacity-60 mt-2">No more info to show.</p>
            )}
        </div>
    );
}