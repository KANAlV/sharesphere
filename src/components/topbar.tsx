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
    const isHidden = pathname.startsWith("/login") || pathname.startsWith("/signup") || pathname.startsWith("/forgot-password");
    return (
        <nav className={`bg-[#1F1E3D] fixed w-full z-20 top-0 start-0 border-b-2 border-gray-500`}>
          <div className="w-screen px-4 lg:px-20 flex flex-wrap items-center justify-between p-4">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <Image width={32} height={32} src="/sharesphere_logo.png" className="h-8" alt="Flowbite Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">SHARESPHERE</span>
          </Link>
          
          <div className={`${isHidden ? "hidden":"flex"} md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse`}>
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
                </div>
              )}
          </div>
          </div>
        </nav>
    );
}
