"use client";
import { useState, useEffect } from "react";

type Details = {
  description: string;
  theme: string;
  banner: string;
  created_at: string;
};

export default function Sidebar({
  id,
  details,
}: {
  id: string;
  details: Details[];
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
      setIsSticky(bannerBottom <= 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isClient]);

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
          fixed top-18 min-h-screen w-screen bg-[#111]
          lg:block lg:min-h-[400px] lg:max-w-1/6
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

        {/* SIDEBAR CONTENT */}
        <div className="p-4 border-b border-stone-800">
          <h1 className="font-bold">{categoryName}</h1>
          <p style={{ opacity: 0.8 }}>{pageDetails.description}</p>
          <div style={{ opacity: 0.3 }}>Created {dateCreated}</div>
        </div>

        <div className="p-4 border-b border-stone-800 hover:bg-gray-100/15 dark:hover:bg-stone-950/15">
          <p style={{ opacity: 0.3 }}>Related Tags</p>
        </div>
      </div>
    </div>
  );
}