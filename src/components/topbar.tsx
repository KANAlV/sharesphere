"use client";
import Link from "next/link";
import Image from "next/image";
import UserDropdown from "./UserDropdownWrapper";
import { usePathname } from "next/navigation";

type User = {
  id: string;
  username: string;
  email: string;
};

export default function Topbar({ user }: { user: User | null }) {
  const pathname = usePathname();
  const isHidden = pathname.startsWith("/login") || pathname.startsWith("/signup");

  return (
    <nav className={`bg-[#1F1E3D] fixed w-full z-20 top-0 start-0 dark:border-gray-600`}>
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <Image
            width={32}
            height={32}
            src="/sharesphere_logo.png"
            className="h-8"
            alt="ShareSphere Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
            SHARESPHERE
          </span>
        </Link>

        {/* Right section */}
        <div
          className={`${
            isHidden ? "hidden" : "flex"
          } items-center gap-4 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse`}
        >
          {/* Create Post button - visible only if logged in */}
          {user && (
            <Link href="/create-post">
              <button
                type="button"
                className="text-white bg-green-600 hover:bg-green-700 focus:ring-4 
                  focus:outline-none focus:ring-green-300 font-medium rounded-lg 
                  text-sm px-4 py-2 text-center dark:bg-green-500 dark:hover:bg-green-600 
                  dark:focus:ring-green-700 transition"
              >
                + Create Post
              </button>
            </Link>
          )}

          {/* Dark mode toggles */}
          <button className="hidden md:inline-flex hs-dark-mode-active:hidden hs-dark-mode p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg
              className="shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
          </button>
          <button className="hs-dark-mode-active:block hidden hs-dark-mode p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <svg
              className="shrink-0 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2"></path>
              <path d="M12 20v2"></path>
              <path d="m4.93 4.93 1.41 1.41"></path>
              <path d="m17.66 17.66 1.41 1.41"></path>
              <path d="M2 12h2"></path>
              <path d="M20 12h2"></path>
              <path d="m6.34 17.66-1.41 1.41"></path>
              <path d="m19.07 4.93-1.41 1.41"></path>
            </svg>
          </button>

          {/* User or Login */}
          {user ? (
            <UserDropdown user={user} />
          ) : (
            <div className="inline-flex">
              <div className="hidden md:block">
                <Link href="/login">
                  <button
                    type="button"
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 
                      focus:outline-none focus:ring-blue-300 font-medium rounded-lg 
                      text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 
                      dark:focus:ring-blue-800"
                  >
                    Login
                  </button>
                </Link>
              </div>
              <div className="block md:hidden">
                <UserDropdown user={user} />
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
