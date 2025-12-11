"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DeleteAnnouncements() {
  const [announcements, setAnnouncements] = useState<
    { announceid: string; author_id: string; title: string; content: string }[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const router = useRouter();

  async function fetchAnnouncements() {
    try {
      const res = await fetch("/api/announcements/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offset }),
      });

      if (res.ok) {
        const data = await res.json();
        setAnnouncements((prev) => [...prev, ...data.announcements]);
        setOffset((prev) => prev + 20);

        // If returned less than 20, there’s no more
        if (data.announcements.length < 20) {
          setHasMore(false);
        }
      } else {
        alert("Failed to fetch announcements.");
      }
    } catch (err) {
      console.error("Fetch announcements error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function checkAdmins() {
      try {
        const res = await fetch("/api/adminChecker");
        const data = await res.json();

        if (!data.isAdmin) router.push("/");
      } catch (err) {
        console.error("Failed to check admin:", err);
        router.push("/");
      }
    }

    checkAdmins();

    fetchAnnouncements();
  }, []);

  // DELETE ANNOUNCEMENT
  const removeAnnouncement = async (announceid: string) => {
    if (!confirm(`Delete this announcement?`)) return;

    const res = await fetch("/api/announcements/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ announceid }),
    });

    if (res.ok) {
      alert("Announcement removed.");
      setAnnouncements((prev) =>
        prev.filter((a) => a.announceid !== announceid)
      );
    } else {
      alert("Failed to remove announcement.");
    }
  };

  return (
    <>
      {/* Main Content */}
      <div
        className="
          lg:h-full
          w-full
          flex 
          justify-center 
          md:items-center
          px-4
          md:px-0
          py-24
          md:py-0
          bg-transparent
        "
      >
        <div className="w-full flex mt-24 lg:h-4/5 justify-center">
          <div className="w-full lg:w-4/5 max-w-5xl bg-[#111] border border-gray-700 rounded-xl p-6 shadow-xl">

            <h1 className="text-2xl font-semibold mb-4 text-center">
              Announcements
            </h1>

            {/* Desktop (div-based "table") */}
            <div className="hidden md:block h-16/20 border border-gray-700 rounded-lg overflow-y-auto scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
              {/* Header */}
              <div className="grid grid-cols-[2fr_5fr_2fr_1fr] bg-[#222] border-b border-gray-700 sticky top-0 z-10 p-3 text-gray-300 font-semibold">
                <div>Title</div>
                <div>Content</div>
                <div>Author</div>
                <div className="text-center">Action</div>
              </div>

              {/* Rows */}
              {announcements.map((a) => (
                <div
                  key={a.announceid}
                  className="grid grid-cols-[2fr_5fr_2fr_1fr] border-b border-gray-800 hover:bg-[#171717] text-gray-300 p-3"
                >
                  <div>{a.title}</div>
                  <div>{a.content}</div>
                  <div>{a.author_id}</div>
                  <div className="text-center">
                    <button
                      onClick={() => removeAnnouncement(a.announceid)}
                      className="p-2 hover:bg-red-600/20 rounded-lg transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-red-500 hover:text-red-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a1 1 0 011-1h4a1 1 0 011 1m-6 0h6"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-3 mt-4">
              {announcements.map((a, i) => (
                <div
                  key={i}
                  className="border border-gray-700 rounded-lg p-4 bg-[#1a1a1a] text-gray-300"
                >
                  <div className="mb-1">
                    <span className="font-semibold block">Title:</span>
                    <span className="break-all">{a.title}</span>
                  </div>

                  <div className="mb-1">
                    <span className="font-semibold block">Content:</span>
                    <span className="break-all">{a.content}</span>
                  </div>

                  <div className="mb-3">
                    <span className="font-semibold block">Author:</span>
                    <span className="break-all">{a.author_id}</span>
                  </div>

                  <button
                    onClick={() => removeAnnouncement(a.announceid)}
                    className="w-full py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg"
                  >
                    Remove Announcement
                  </button>
                </div>
              ))}

              {announcements.length === 0 && (
                <div className="text-center p-4 text-gray-400">
                  No announcements found.
                </div>
              )}
            </div>
            {/* LOAD MORE BUTTON */}
            <div className="flex justify-center my-4">
              <button
                onClick={() => {
                  setLoading(true);
                  fetchAnnouncements();
                }}
                disabled={loading || !hasMore}
                className="
                  px-4 py-2 
                  bg-blue-600 hover:bg-blue-700 
                  disabled:opacity-50
                  text-white rounded-lg
                "
              >
                {loading ? "Loading..." : hasMore ? "Load More" : "No More"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}