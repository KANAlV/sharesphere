"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

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

type Rule = {
  rule: string;
  description: string;
  num: string;
};

export default function Sidebar({
  id,
  details,
  rel,
  tags,
  rules
}: {
  id: string;
  details: Details[];
  rel: Rel[];
  tags: Tags[];
  rules: Rule[];
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
  const redirectTo = (redir: string) => encodeURIComponent(redir.replace(/ /g, '_'));

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

  // --- rules ---
  const [openRules, setOpenRules] = useState<number[]>([]);

  const toggleRule = (idx: number) => {
    setOpenRules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

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
          fixed top-18 h-screen lg:max-h-8/9 w-screen bg-[#111]
          lg:block lg:max-w-1/6
          overflow-y-auto scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600
          lg:bg-black/0 text-white`}
        style={{
          zIndex: 30,
          left: isClient && window.innerWidth >= 1024 ? sidebarLeft ?? "auto" : "auto",
          right: !isClient || window.innerWidth < 1024 ? 0 : "auto",
          color: textColor(pageDetails.theme),
        }}
      >
        {/* MOBILE CLOSE BUTTON */}
        <div className="lg:hidden h-5 w-screen">
          <div className="fixed right-7 w-5 h-5 text-3xl" onClick={() => setIsOpen(false)}>
            ≡
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="px-8 pt-8 pb-4 lg:bg-gray-500/50 lg:rounded-t-2xl">
          <h1 className="font-bold">{categoryName}</h1>
          <p style={{ opacity: 0.8 }}>{pageDetails.description}</p>
          <div style={{ opacity: 0.8 }} className="flex">
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
        <div className="mt-1 pl-8 py-4 lg:bg-gray-500/50">
          <p style={{ opacity: 0.9 }}>
            {pathname != `/c/${id}` ? "Currently showing posts for:" : "Most Popular Tags"}
          </p>
          <div className="block max-h-120 overflow-y-clip">
            {rel.length > 0 ? (
              tags.map((post, idx) => (
                <a href={`/c/${id}/tags/${redirectTo(post.tag)}`} key={idx} className="block w-min">
                  <div className={`px-5 py-2 w-min whitespace-nowrap rounded-full mt-2`}
                  style={{ backgroundColor: post.color, color: textColor(post.color) }}
                  >
                    {post.tag}
                  </div>
                </a>
              ))
              ) : (
                <p style={{ opacity: 0.9 }}>No Tags found.</p>
              )
            }
          </div>
        </div>

        {/* Rules */}
        <div className="mt-1 px-8 py-4 lg:bg-gray-500/50">
          <p style={{ opacity: 0.9 }}>Rules</p>
            {rules.length > 0 ? (
              rules.map((post, idx) => {
                const isOpen = openRules.includes(idx);
                return (
                  <div key={idx}>
                    <div
                      onClick={() => toggleRule(idx)}
                      className="flex mt-2 py-1 w-full hover:bg-gray-500/50 cursor-pointer"
                    >
                      <span className=" flex">
                        <div className="text-center w-12">{post.num}</div> <div>{post.rule}</div>
                      </span>
                      <svg
                        width="24px"
                        height="24px"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`ml-auto transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path d="M7 10l5 5 5-5" />
                      </svg>
                    </div>
                    {isOpen && (
                      <div className={`block pl-10 pr-5 py-2 text-sm opacity-70 transition-all duration-500 ease-in-out ${
                          isOpen ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0"
                        }`}>
                        {post.description}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p style={{ opacity: 0.5 }}>No Rules found.</p>
            )}
        </div>

        {/* Related Orgs/Clubs */}
        <div className="mt-1 px-8 py-4 lg:bg-gray-500/50">
          <p style={{ opacity: 0.9 }}>Related Orgs / Clubs</p>
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
        </div>

        <div className="p-2 mt-50 lg:m-0 w-inherit lg:bg-gray-500/50 rounded-b-2xl" />
      </div>
    </div>
  );
}