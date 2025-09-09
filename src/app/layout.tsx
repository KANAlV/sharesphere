import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import "flowbite";
import UserDropdown from "@/components/UserDropdown";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// ✅ Make the layout async so we can await cookies()
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Await cookies() to access .get()
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  let user: null | { id: string; username: string; email: string } = null;

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        email: string;
      };
    } catch (err) {
      user = null;
    }
  }

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        <nav className="bg-gradient-to-r from-violet-300 to-white to-[30%] shadow-lg dark:bg-gradient-to-r dark:from-violet-500 dark:to-violet-950 fixed w-full z-20 top-0 start-0 dark:border-gray-600">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <Image width={32} height={32} src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">SHARESPHERE</span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
             <button className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-gray-700 dark:text-gray-300"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 
                    8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 
                    8.967 0 0 1-2.312 6.022c1.733.64 
                    3.56 1.085 5.455 1.31m5.714 0a24.255 
                    24.255 0 0 1-5.714 0m5.714 
                    0a3 3 0 1 1-5.714 0"
                  />
                </svg>
              </button>
              {user ? (
                <UserDropdown user={user} />
              ) : (
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
              )}
          </div>
          </div>
        </nav>
        {user ? (
          <Link href="create-post">
            <button 
              className="fixed bottom-6 right-6 bg-blue-600 text-white font-semibold px-5 py-3 rounded-full shadow-lg hover:bg-blue-700 hover:scale-105 transition">
              +
            </button>
          </Link>
        ):(null)}
        {children}
      </body>
    </html>
  );
}
