"use client";
import { useState, useEffect } from "react";
import { redirect, usePathname } from "next/navigation";

type Details = {
  description: string;
  theme: string;
  banner: string;
  created_at: string;
};

type Rel = {
  dir: string;
  title: string;
  theme: string;
};

type Tags = {
  dir: string;
  tag: string;
  color: string;
};

export default function Sidebar({
  id,
  details,
  rel,
  tags
}: {
  id: string;
  details: Details[];
  rel: Rel[];
  tags: Tags[];
}) {
  // Format course name
  let categoryName = "";
  for (let i = 0; i < id.length; i++) {
    if (i === 0) categoryName = id.charAt(0).toUpperCase();
    else if (id.charAt(i) === "_") categoryName += " ";
    else if (id.charAt(i - 1) === "_") categoryName += id.charAt(i).toUpperCase();
    else categoryName += id.charAt(i);
  }

  const pageDetails = details[0];
  const dateCreated = new Date(pageDetails.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  // Sticky + responsive sidebar state
  const [isSticky, setIsSticky] = useState(false);
  const [sidebarLeft, setSidebarLeft] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Mark when running on client (so window/document are safe)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dynamically calculate sidebar position (only on large screens)
  useEffect(() => {
    if (!isClient) return;

    const banner = document.getElementById("banner");

    const updatePosition = () => {
      if (window.innerWidth < 1024) {
        setSidebarLeft(null);
        return;
      }
      if (banner) {
        const rect = banner.getBoundingClientRect();
        setSidebarLeft(rect.right + 20);
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [isClient]);

  // Sticky behavior
  useEffect(() => {
    if (!isClient) return;

    const banner = document.getElementById("banner");
    const handleScroll = () => {
      if (!banner) return;
      const bannerBottom = banner.getBoundingClientRect().bottom;
      setIsSticky(bannerBottom <= 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

  const pathname = usePathname();
  const redirectTo = (redir: string) => redir.replace(/ /g, '_');

  // --- Font color logic ---
  const textColor = (theme: string) => {
    let fontcolor = "black";
    const hexColor = theme.startsWith("#")
      ? theme.slice(1)
      : theme;
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    if (brightness < 128) fontcolor = "lightgray";

    return fontcolor;
  }

  return (
    <div>
      {/* MOBILE TOGGLE */}
      <div
        className="z-30 lg:hidden fixed top-22 right-5 w-10 h-10 text-3xl text-center rounded-full bg-slate-500/50"
        onClick={() => setIsOpen(true)}
      >
        ≡
      </div>

      {/* SIDEBAR CONTAINER */}
      <div
        className={`transition-opacity duration-500 ease-in-out lg:opacity-100
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none lg:pointer-events-auto"}
          ${isSticky ? "lg:fixed lg:top-20" : "lg:absolute lg:top-70"}
          fixed top-18 h-screen w-screen bg-[#111]
          lg:block lg:max-w-1/6
          lg:bg-black/50 lg:rounded-2xl text-white p-4`}
        style={{
          zIndex: 50,
          left: isClient && window.innerWidth >= 1024 ? sidebarLeft ?? "auto" : "auto",
          right: !isClient || window.innerWidth < 1024 ? 0 : "auto",
        }}
      >
        {/* MOBILE CLOSE BUTTON */}
        <div className="lg:hidden h-5 w-screen">
          <div className="fixed right-7 w-5 h-5 text-3xl" onClick={() => setIsOpen(false)}>
            ≡
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="p-4 border-b border-stone-800">
          <h1 className="font-bold">{categoryName}</h1>
          <p style={{ opacity: 0.8 }}>{pageDetails.description}</p>
          <div style={{ opacity: 0.3 }} className="flex">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="false" role="img">
              <title>Calendar</title>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.6"/>
            </svg>
            <span className="w-2" />
            Created {dateCreated}
          </div>
        </div>

        {/* Tags */}
        <div className="p-4 border-b border-stone-800 hover:bg-gray-100/15 dark:hover:bg-stone-950/15">
          <p style={{ opacity: 0.8 }}>Tags</p>
          {rel.length > 0 ? (
            tags.map((post, idx) => (
              <a href={`/o/${redirectTo(post.tag)}`} key={idx}>
                <div className={`px-5 py-2 w-min whitespace-nowrap rounded-full mt-2`}
                style={{ backgroundColor: post.color, color: textColor(post.color) }}
                >
                  {post.tag}
                </div>
              </a>
            ))
            ) : (
              <p style={{ opacity: 0.8 }}>No related orgs/clubs found.</p>
            )
          }
        </div>

        {/* Related Orgs/Clubs */}
        {pathname === `/c/${id}` ? (
          <div className="p-4 border-b border-stone-800 hover:bg-gray-100/15 dark:hover:bg-stone-950/15">
            <p style={{ opacity: 0.3 }}>Related Orgs / Clubs</p>
            {rel.length > 0 ? (
              rel.map((post, idx) => (
                <div key={idx} className={`mt-2 px-5 py-1 w-min whitespace-nowrap`}>
                  <a
                    href={`/o/${redirectTo(post.title)}`}
                    className="hover:underline"
                  >
                    {post.title}
                  </a>
                </div>
              ))
              ) : (
                <p style={{ opacity: 0.5 }}>No related orgs/clubs found.</p>
              )
            }
          </div>) : null}

      </div>
    </div>
  );
}