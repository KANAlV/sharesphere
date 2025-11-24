"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { initFlowbite } from "flowbite";

type User = {
  id: string;
  username: string;
  email: string;
};

async function handleLogout() {
  await fetch("/api/logout");
  window.location.href = "/"; // redirect manually
}

export default function UserDropdown({ user }: { user: User | null }) {
  useEffect(() => {
    // Initialize Flowbite dropdowns, tooltips, etc.
    initFlowbite();
  }, []);
  const [isDroppedDown, setIsDroppedDown] = useState(false);

  const loggedIn = user !== null;

  useEffect(() => {
    const dropdown = document.getElementById("dropdown");

    // Function to check dropdown visibility
    const checkDropdown = () => {
      if (dropdown) {
        const visible = !dropdown.classList.contains("hidden");
        setIsDroppedDown(visible);
      }
    };

    // Watch for attribute changes (Flowbite toggles "hidden")
    const observer = new MutationObserver(checkDropdown);
    if (dropdown) {
      observer.observe(dropdown, { attributes: true });
    }

    // Initial check
    checkDropdown();

    // Cleanup observer
    return () => observer.disconnect();
  }, []);

  const [label, toggleLabel] = useState(false);

  return (
    <div className="flex relative">
      <Link href={"/create-post"}>
        <button onMouseEnter={()=>toggleLabel(true)} onMouseLeave={()=>toggleLabel(false)} className="block hs-dark-mode p-2 pr-5 rounded-full">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="4"></rect>
            <path d="M12 8v8M8 12h8"></path>
          </svg>
        </button>
        
        <div className={`${label ? "block":"hidden"} absolute top-full left-2/9 -translate-x-1/2 
                      w-0 h-0 border-x-8 border-x-transparent 
                      border-b-8 border-b-gray-100 dark:border-b-gray-700`}></div>
        <div
          id="label"
          className={`${label ? "block":"hidden"} z-50 bg-white divide-y divide-gray-100 
            rounded-lg shadow-sm w-33 dark:bg-gray-700 absolute right-0 mt-2 p-2 text-center`}
        >
          Create Post
        </div>
      </Link>
    </div>
  );
}
