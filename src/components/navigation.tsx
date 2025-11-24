"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

type User = {
  id: string;
  username: string;
  email: string;
  udata: string;
};

export default function Navigation({ user }: { user: User | null }) {
  const pathname = usePathname()?.replace(/\/$/, "");
  const [cWait, setCWait] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ensures client-only rendering
  }, []);

  const isHidden =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/admin-login" ||
    pathname === "/forgot-password";

  const waitRedir = (loc: string) => {
    setCWait(true);
    document.body.style.cursor = "wait";
    window.location.href = loc;
  };

  if (isHidden || !mounted) return null; // hide on SSR

  return (
    <>
      {/* Loading overlay */}
      {cWait && (
        <div className="fixed top-0 flex z-50 w-screen h-screen bg-black/75 justify-center items-center">
          <div>
            <div>Redirecting. Please wait.</div>
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
            </div>
          </div>
        </div>
      )}

      <div
        className={`z-40 fixed w-screen h-16 lg:h-full bottom-0 lg:top-18 ${
          isOpen ? "lg:w-1/5" : "lg:w-1/50"
        }`}
      >
        {/* Toggle button */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={`hidden lg:flex absolute top-1/30 right-0 rounded-full align-middle ${
            isOpen ? "" : "w-2/3"
          } h-4/5 bg-white dark:bg-black border-gray-500 border-2 cursor-pointer`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`m-auto transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          >
            <path d="M8 4l8 8-8 8" />
          </svg>
        </div>

        {/* Navigation panel */}
        <div
          className={`bg-white/80 dark:bg-black/80 ${
            isOpen ? "lg:w-13/14" : "lg:w-8/12"
          } h-screen lg:border-r border-gray-500`}
        >
          <div
            className={`flex lg:block w-full lg:pt-2 ${
              isOpen ? "lg:px-8" : "lg:px-2"
            } items-center overflow-x-auto lg:overflow-x-clip scrollbar-track-black/0 whitespace-nowrap gap-4 px-4`}
          >
            {/* User PC view */}
            {user && (
              <div
                onClick={() => {
                  waitRedir("/settings/account");
                  setIsOpen(false);
                }}
                className={`hidden lg:flex flex-col pt-2 items-center justify-center min-w-[22%] h-full pb-3 hover:bg-gray-500/50 select-none lg:flex-row lg:justify-start lg:my-4`}
              >
                <div className="lg:pl-2 mt-1">
                  <div className="text-gray-500">Logged in As:</div>
                  <div className="text-lg">{user.username}</div>
                </div>
                <span className="w-2/4" />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.03 7.03 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65a7.03 7.03 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.65L4.57 11c-.04.32-.07.65-.07.98s.03.66.07.98L2.46 14.6a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.52.39 1.09.72 1.69.98l.38 2.65A.5.5 0 0 0 10 22h4a.5.5 0 0 0 .49-.42l.38-2.65a7.03 7.03 0 0 0 1.69-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.1-1.65ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z" />
                </svg>
              </div>
            )}

            {/* Home */}
            <NavItem label="Home" icon={HomeIcon} onClick={() => waitRedir("/")} isOpen={isOpen} />

            {/* Courses */}
            <NavItem label="Courses" icon={CoursesIcon} onClick={() => waitRedir("/courses")} isOpen={isOpen} />

            {/* Organizations */}
            <NavItem label="Organizations" icon={OrgsIcon} onClick={() => waitRedir("/organizations")} isOpen={isOpen} />

            {/* User mobile view */}
            {user ? (
              <NavItem label={user.username} icon={UserIcon} onClick={() => waitRedir("/settings/account")} isOpen={isOpen} mobile />
            ) : (
              <NavItem label="Login" icon={LoginIcon} onClick={() => waitRedir("/login")} isOpen={isOpen} mobile />
            )}

            {/* Page creation */}
            {user?.udata === "1" && (
              <NavItem label="Page Creation" icon={PageIcon} onClick={() => waitRedir("/page_creation")} isOpen={isOpen} />
            )}

            {/* Logout */}
            {user && (
              <NavItem label="Logout" icon={LogoutIcon} onClick={() => waitRedir("/api/logout")} isOpen={isOpen} color="red"/>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

type NavItemProps = {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>; // type for SVG component
  onClick: () => void;
  isOpen: boolean;
  mobile?: boolean;
  color?: string;
};

/* Helper component to reduce repetition */
function NavItem({ label, icon: Icon, onClick, isOpen, mobile, color }: NavItemProps) {
  return (
    <div
      onClick={onClick}
      className={`flex ${mobile ? "lg:hidden" : "lg:flex"} ${isOpen? null:"lg:hidden"} ${label == "Logout"? "border-t-2 border-gray-500":""} flex-col pt-2 items-center justify-center min-w-[22%] h-full pb-3 hover:bg-gray-500/50 select-none lg:flex-row lg:justify-start lg:my-4 ${
        color ? `text-${color}-700` : ""
      }`}
    >
      <Icon />
      <div className="text-xs lg:text-lg lg:pl-2 mt-1">{label}</div>
    </div>
  );
}

/* Example icons */
const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
    <path d="M12 3.293l8 7.2V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1V10.493l8-7.2z" />
    <rect x="10" y="13" width="4" height="4" rx="0.3" fill="currentColor" opacity="0.9" />
  </svg>
);

const CoursesIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
    <path d="M8 6l4-2 4 2v4l-4 2-4-2V6z" />
    <path d="M3 13l4-2 4 2v4l-4 2-4-2v-4z" />
    <path d="M13 13l4-2 4 2v4l-4 2-4-2v-4z" />
  </svg>
);

const OrgsIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="3" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
    <circle cx="5" cy="11" r="2" />
    <path d="M1 21v-2a3 3 0 0 1 3-3h1" />
    <circle cx="19" cy="11" r="2" />
    <path d="M23 21v-2a3 3 0 0 0-3-3h-1" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path fill="none" d="M0 0h24v24H0z"/>
    <path fill="currentColor" d="M12 14v2a6 6 0 0 0-6 6H4a8 8 0 0 1 8-8zm0-1c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6zm0-2c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm2.595 7.812a3.51 3.51 0 0 1 0-1.623l-.992-.573 1-1.732.992.573A3.496 3.496 0 0 1 17 14.645V13.5h2v1.145c.532.158 1.012.44 1.405.812l.992-.573 1 1.732-.992.573a3.51 3.51 0 0 1 0 1.622l.992.573-1 1.732-.992-.573a3.496 3.496 0 0 1-1.405.812V22.5h-2v-1.145a3.496 3.496 0 0 1-1.405-.812l-.992.573-1-1.732.992-.572zM18 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 15L15 12M15 12L12 9M15 12H4M9 7.24859V7.2002C9 6.08009 9 5.51962 9.21799 5.0918C9.40973 4.71547 9.71547 4.40973 10.0918 4.21799C10.5196 4 11.0801 4 12.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H12.1969C11.079 20 10.5192 20 10.0918 19.7822C9.71547 19.5905 9.40973 19.2839 9.21799 18.9076C9 18.4798 9 17.9201 9 16.8V16.75"
    stroke="#E02424" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LoginIcon = UserIcon;
const PageIcon = CoursesIcon;
