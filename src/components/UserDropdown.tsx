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

  return (
    <div className="relative inline-block">
      <button
        id="dropdownDefaultButton"
        data-dropdown-toggle="dropdown"
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 
          focus:outline-none focus:ring-blue-300 font-medium rounded-lg 
          text-sm w-10 h-10 text-center inline-flex items-center 
          dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        <svg
          className={`w-2.5 h-2.5 m-auto transition-transform duration-200 ${
            isDroppedDown ? "rotate-180" : "rotate-0"
          }`}
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 10 6"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m1 1 4 4 4-4"
          />
        </svg>
      </button>

      <div
        id="dropdown"
        className="z-50 hidden bg-white divide-y divide-gray-100 
          rounded-lg shadow-sm w-44 dark:bg-gray-700 absolute right-0 mt-2"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          <li className="block md:hidden">
            <Link
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Dark Mode
            </Link>
          </li>
          <li className={`${loggedIn ? "hidden": "block"}`}>
            <Link
              href="/login"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Login
            </Link>
          </li>
          <li
            onClick={handleLogout}
            className={`${loggedIn ? "block": "hidden"} px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer`}
          >
            Sign out
          </li>
        </ul>
      </div>
    </div>
  );
}
