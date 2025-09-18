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
        <nav className="bg-gradient-to-r from-violet-500 to-white to-[40%] shadow-lg dark:bg-gradient-to-r dark:from-white dark:to-zinc-900 dark:to-[30%] fixed w-full z-20 top-0 start-0 dark:border-gray-600">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
              <Image width={32} height={32} src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">SHARESPHERE</span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
              <button className="hs-dark-mode-active:hidden block hs-dark-mode p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
    </svg>
              </button>
              <button className="hs-dark-mode-active:block hidden hs-dark-mode p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                <svg className="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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