"use client";
import Link from "next/link";
import { useEffect } from "react";
import "flowbite";

type User = {
  id: string;
  username: string;
  email: string;
};

async function handleLogout() {
  await fetch("/api/logout");
  window.location.href = "/"; // redirect manually
}

export default function UserDropdown({ user }: { user: User }) {
  useEffect(() => {
    // Flowbite auto-initializes dropdowns
  }, []);

  return (
    <div>
      {/* Desktop dropdown button */}
      <button
        id="desktopDropdownButton"
        data-dropdown-toggle="desktopDropdown"
        className="hidden md:inline-flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 
          focus:outline-none focus:ring-blue-300 font-medium rounded-lg 
          text-sm px-5 py-2.5 text-center items-center 
          dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        type="button"
      >
        Welcome, {user.username}
        <svg
          className="w-2.5 h-2.5 ms-3"
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

      {/* Mobile dropdown button */}
      <button
        id="mobileDropdownButton"
        data-dropdown-toggle="mobileDropdown"
        className="inline-flex md:hidden items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg
        hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200
        dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        aria-controls="navbar-sticky"
        aria-expanded="false"
      >
        <svg
          className="w-5 h-5"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 17 14"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 1h15M1 7h15M1 13h15"
          />
        </svg>
      </button>

      {/* Desktop Dropdown */}
      <div
        id="desktopDropdown"
        className="z-10 hidden bg-white divide-y divide-gray-100 
          rounded-lg shadow-sm w-44 dark:bg-gray-700"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="desktopDropdownButton"
        >
          <li>
            <Link
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Settings
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Earnings
            </Link>
          </li>
          <li
            onClick={handleLogout}
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
          >
            Sign out
          </li>
        </ul>
      </div>

      {/* Mobile Dropdown */}
      <div
        id="mobileDropdown"
        className="z-10 hidden bg-white divide-y divide-gray-100 
          rounded-lg shadow-sm w-44 dark:bg-gray-700"
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="mobileDropdownButton"
        >
          <li>
            <Link
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Settings
            </Link>
          </li>
          <li>
            <Link
              href="#"
              className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
            >
              Earnings
            </Link>
          </li>
          <li
            onClick={handleLogout}
            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
          >
            Sign out
          </li>
        </ul>
      </div>
    </div>
  );
}