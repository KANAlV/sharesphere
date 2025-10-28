"use client";
import { useState, useEffect } from "react";

type Post = {
  dir: string;
  title: string;
  content: string;
};

type Details = {
  description:string
  theme:string
  banner:string
  created_at:string
};

export default function CoursePage({
  posts,
  id,
  details,
}: {
  posts: Post[];
  id: string;
  details: Details[];
}) {
  const redirect = (dest: string) => {
    window.location.href = "../posts/" + dest;
  };

  let categoryName = "";
  for (let i = 0; i < id.length; i++) {
    if (i == 0) {
      categoryName = id.charAt(0).toUpperCase();
    } else {
      switch (id.charAt(i)) {
        case "_":
          categoryName = categoryName + " ";
          break;
        default:
          if (id.charAt(i - 1) == "_") {
            categoryName = categoryName + id.charAt(i).toUpperCase();
          } else {
            categoryName = categoryName + id.charAt(i);
          }
          break;
      }
    }
  }

  const pageDetails = details[0];

  const dateCreated = new Date(pageDetails.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });

  const [showAnnouncements, setShowAnnouncements] = useState(true);
  const toggleAnnouncements = () => setShowAnnouncements(!showAnnouncements);

  //font color
  let fontcolor = "black";
  const hexColor = pageDetails.theme.startsWith('#') ? pageDetails.theme.slice(1) : pageDetails.theme;

  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b);

  if (brightness < 128){
    fontcolor = "lightgray";
  } else {
    fontcolor = "black";
  }

  //sidebar sticky behavior
  const [isSticky, setIsSticky] = useState(false);
  useEffect(() => {
    const banner = document.getElementById("banner");
    const handleScroll = () => {
      if (!banner) return;
      const bannerBottom = banner.getBoundingClientRect().bottom;
      setIsSticky(bannerBottom <= 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  //sidebar mobile toggle
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="flex z-10 absolute w-full h-auto"
      style={{ backgroundColor: pageDetails.theme, color: fontcolor }}
    >
      <div className="relative w-full lg:max-w-xl xl:max-w-3xl 2xl:max-w-4xl 3xl:max-w-5xl mx-auto sm:mt-20">
        <div className="space-y-4 mt-6">
          {/* Page Name */}
          {true ? (
            <>
              <div
                id="banner"
                className="h-30 bg-black sm:rounded-xl"
                style={{
                  backgroundImage: `url(${pageDetails.banner})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="sm:hidden bottom-0 m-0 p-0 absolute w-full bg-background-dark/100 rounded-t-2xl h-3" />
              </div>
              <div className="pl-4">
                <h1 className="text-xl font-bold">{categoryName}</h1>
              </div>
            </>
          ) : null}

          {/* Club Announcements */}
          <div className="flex relative h-10 sm:rounded-xl border border-gray-200 dark:border-stone-800">
            <div className="my-auto mx-5 content-start">
              Org / Club Announcements
            </div>
            <div className="grow"></div>
            <div className="w-8 content-end justify-center">
              <button
                className="rounded-full hover:border hover:border-white place-self-center"
                onClick={toggleAnnouncements}
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
              showAnnouncements
                ? "max-h-[500px] opacity-100"
                : "max-h-0 opacity-0"
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
                    Here are the biggest enterprise technology acquisitions of
                    2021 so far, in reverse chronological order.
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Posts */}
          {posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.title}
                onClick={() => redirect(post.dir)}
                className="p-4 border-t border-stone-800 hover:bg-gray-100/15 dark:hover:bg-stone-950/15"
              >
                <h2 className="text-xl font-bold">{post.title}</h2>
                <p className="line-clamp-3">{post.content}</p>
              </div>
            ))
          ) : (
            <p>This Page does not have Any Entry.</p>
          )}
        </div>
      </div>

      {/* {SIDEBAR Mobile Toggle} */}
      <div 
        className="z-30 lg:hidden fixed top-22 right-5 w-10 h-10 text-3xl text-center rounded-full bg-slate-500/50 "
        onClick={() => setIsOpen(true)}
      >
        ≡
      </div>
      {/* SIDEBAR — fixed/absolute independent of flow */}
      <div
        className={`
          ${isSticky ? "lg:fixed lg:top-20 lg:right-5 xl:right-7 2xl:right-10 " : "lg:absolute lg:top-70 lg:right-5 xl:right-7 2xl:right-10 "}
          transition-opacity duration-500 ease-in-out
          ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}
          fixed top-18 min-h-screen w-screen bg-[#111] lg:block lg:min-h-[400px] lg:w-60 2xl:w-70 3xl:w-100 lg:bg-black/50 lg:rounded-2xl text-white p-4`}
        style={{ zIndex: 50 }}
      >
        <div className="lg:hidden h-5 w-screen"><div className="fixed right-7 w-5 h-5 text-3xl" onClick={() => setIsOpen(false)}>≡</div></div>
        <div className="p-4 border-b border-stone-800 ">
          <h1 className="font-bold">{categoryName}</h1>
          <p style={{ opacity: .8 }}>{pageDetails.description}</p>
          <div style={{ opacity: .3 }}>Created {dateCreated}</div>
          
        </div>
        {/* Tags */}
        <div className="p-4 border-b border-stone-800 hover:bg-gray-100/15 dark:hover:bg-stone-950/15">
          <p style={{ opacity: .3 }}>Related Tags</p>

        </div>
      </div>

    </div>
  );
}
