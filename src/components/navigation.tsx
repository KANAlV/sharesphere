"use client";
import Link from "next/link";
import { useState } from "react"
export default function Navigation() {
    const [isOpen, setIsOpen] = useState(false);
    return(
        <div
            className={`z-40 fixed w-screen h-16 x lg:h-full bottom-0 lg:top-18 
                ${isOpen ? "lg:w-1/5" : "lg:w-22"} 
            `}
            >
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="hidden lg:block absolute top-10 right-0 rounded-full w-12 h-12 bg-white/90 dark:bg-black/90"
            >
                <svg
                viewBox="0 0 100 80"
                width="20"
                height="20"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="object-center m-auto mt-3.5"
                >
                <rect width="100" height="20"></rect>
                <rect y="30" width="100" height="20"></rect>
                <rect y="60" width="100" height="20"></rect>
                </svg>
            </div>

            <div className={`bg-white/80 dark:bg-black/80 ${isOpen ? "lg:w-13/14" : "lg:w-16"} h-screen`}>
                <div
                className={`flex lg:block w-full lg:pt-10 ${
                    isOpen ? "lg:px-8" : "lg:px-2"
                } justify-evenly items-center`}
                >
                <Link
                    href="/"
                    className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start flex-1 h-full hover:bg-gray-500/50 lg:my-4`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="img">
                    <path d="M12 3.293l8 7.2V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1V10.493l8-7.2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
                    <rect x="10" y="13" width="4" height="4" rx="0.3" fill="currentColor" opacity="0.9"/>
                    </svg>
                    <div className={`text-xs lg:text-lg lg:pl-2 ${isOpen ? "lg:inline-block":"lg:hidden"} mt-1 `}>Home</div>
                </Link>

                <Link
                    href="/courses"
                    className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start flex-1 h-full hover:bg-gray-500/50 lg:my-4`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
                    <path d="M8 6l4-2 4 2v4l-4 2-4-2V6z"/>
                    <path d="M3 13l4-2 4 2v4l-4 2-4-2v-4z"/>
                    <path d="M13 13l4-2 4 2v4l-4 2-4-2v-4z"/>
                    </svg>
                    <div className={`text-xs lg:text-lg lg:pl-2 ${isOpen ? "lg:inline-block":"lg:hidden"} mt-1 `}>Courses</div>
                </Link>

                <Link
                    href="/organizations"
                    className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start flex-1 h-full hover:bg-gray-500/50 lg:my-4`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="7" r="3"/>
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
                    <circle cx="5" cy="11" r="2"/>
                    <path d="M1 21v-2a3 3 0 0 1 3-3h1"/>
                    <circle cx="19" cy="11" r="2"/>
                    <path d="M23 21v-2a3 3 0 0 0-3-3h-1"/>
                    </svg>
                    <div className={`text-xs lg:text-lg lg:pl-2 ${isOpen ? "lg:inline-block":"lg:hidden"} mt-1 `}>Organizations</div>
                </Link>

                <Link
                    href="/u"
                    className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start flex-1 h-full hover:bg-gray-500/50 lg:my-4`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.03 7.03 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65a7.03 7.03 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.65L4.57 11c-.04.32-.07.65-.07.98s.03.66.07.98L2.46 14.6a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.52.39 1.09.72 1.69.98l.38 2.65A.5.5 0 0 0 10 22h4a.5.5 0 0 0 .49-.42l.38-2.65a7.03 7.03 0 0 0 1.69-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.1-1.65ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z"/>
                    </svg>
                    <div className={`text-xs lg:text-lg lg:pl-2 ${isOpen ? "lg:inline-block":"lg:hidden"} mt-1 `}>User</div>
                </Link>
                </div>
            </div>
            </div>
    );
}