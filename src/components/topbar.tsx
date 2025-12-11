"use client";
import Link from "next/link";
import Image from "next/image";
import UserDropdown from "./UserDropdownWrapper";
import { usePathname } from "next/navigation";
import { useState } from "react";

type User = {
  id: string;
  username: string;
  email: string;
  udata: string;
};

export default function Topbar({ user }: { user: User | null }) {
    const pathname = usePathname();
    const isHidden = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/forgot-password");
    const [cWait, setCWait] = useState(false);
    const [search, setSearch] = useState("");

    const waitRedir = (loc: string) => {
      setCWait(true);
      document.body.style.cursor = "wait";
      window.location.href = loc;
    };

    return (
        <>
        {/* Loading overlay */}
        {cWait && (
          <div className="fixed top-0 flex z-50 w-screen h-screen justify-center items-center" />
        )}
        
        <nav className={`bg-[#1F1E3D] fixed w-full z-20 top-0 start-0 border-b-2 border-gray-500`}>
          <div className="w-screen pt-4 pb-4 pl-4 lg:px-20 flex flex-wrap items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <Image width={32} height={32} src="/sharesphere_logo.png" className="h-8" alt="Flowbite Logo" />
              <span className="hidden lg:block self-center text-2xl font-semibold whitespace-nowrap text-white">SHARESPHERE</span>
          </Link>

          {/* Search bar */}
          <div className={`${isHidden ? "hidden":"flex"} h-10 border-2 rounded-full overflow-clip`}>
            <input
            type="text"
            value={search}
            onKeyDown={(e) => e.key === "Enter" ? (window.location.href = "/search/"+search):null}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="px-4 outline-0"
            />
            <button
            type="button"
            onClick={() => search == ""? null:(window.location.href = "/search/"+search)}
            className="flex items-center justify-center w-10 h-full bg-gray-500/50 cursor-pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.6725 16.6412L21 21M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          <div className={`${isHidden ? "hidden":"flex"} lg:justify-end lg:w-55 md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse`}>
              {user ? (
                <UserDropdown user={user} />
              ) : (<>
                <UserDropdown user={null} />
                <div className="inline-flex items-center">
                  <div className="hidden ml-4 md:block">
                    <div onClick={() => waitRedir("/login")}>
                      <button
                        type="button"
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 
                          focus:outline-none focus:ring-blue-300 font-medium rounded-lg 
                          text-sm px-4 py-2 text-center dark:bg-blue-600 dark:hover:bg-blue-700 
                          dark:focus:ring-blue-800"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </div>
              </>)}
          </div>
          </div>
        </nav>
      </>
    );
}
