"use client";

import { useState, useEffect, useRef } from "react";
import { initFlowbite } from "flowbite";

type User = {
  id: string;
  username: string;
  email: string;
  udata: string;
};

export default function UserDropdown({ user }: { user: User | null }) {
  useEffect(() => initFlowbite(), []);

  const [openMenu, setOpenMenu] = useState(false);
  const [cWait, setCWait] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const waitRedir = (loc: string) => {
    setCWait(true);
    document.body.style.cursor = "wait";
    window.location.href = user ? loc : "/login";
  };

  // CLICK OUTSIDE TO CLOSE
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {cWait && (
        <div className="fixed top-0 left-0 w-screen h-screen z-50 bg-black/10" />
      )}

      <div className="relative" ref={menuRef}>

        {/* =========================
            MAIN BUTTON (Opens dropdown)
        ========================== */}
        <button
          onClick={() => setOpenMenu((prev) => !(prev))}
          className="p-2 md:p-3 rounded-full bg-blue-500/10 active:scale-95 transition-all"
        >
       <svg
              xmlns="http://www.w3.org/2000/svg"
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="4" width="16" height="16" rx="4"></rect>
              <path d="M12 8v8M8 12h8"></path>
            </svg>
        </button>

        {/*DROPDOWN MENU*/}
        <div
          className={`${
            openMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          } absolute right-0 mt-2 w-52 
            bg-white dark:bg-gray-800 rounded-xl shadow-lg 
            transition-all duration-150 origin-top-right p-2 z-50`}
        >
          {/* CREATE POST */}
          <button
            type="button"
            onClick={() => waitRedir("/create-post")}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <span>Create Post</span>
          </button>

          {/* CREATE ANNOUNCEMENT */}
         <button
            type="button"
            onClick={() => waitRedir("/create_announcement")}
            className={`${user?.udata == "1"? "":"hidden"} flex items-center gap-3 w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition whitespace-nowrap`}
          >
            <span>Create Announcement</span>
          </button>

        </div>
      </div>
    </>
  );
}
