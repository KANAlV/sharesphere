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
        <div className="fixed top-0 flex z-50 w-screen h-screen justify-center items-center" />
      )}

      <div
        className={`z-40 fixed lg:z-0 lg:static w-screen h-16 lg:h-full bottom-0 lg:top-18 ${
          isOpen ? "lg:w-1/5" : "lg:w-0"
        }`}
      >
        {/* Navigation panel */}
        <div
          className={`lg:pt-18 bg-slate-300 dark:bg-slate-800 h-screen lg:border-r border-gray-500`}
        >
          <div
            className={`flex lg:block w-full lg:pt-2 ${
              isOpen ? "lg:px-8" : "lg:hidden"
            } items-center overflow-x-scroll lg:overflow-x-clip scrollbar-track-black/0 whitespace-nowrap gap-4 px-4`}
          >
            {/* User PC view */}
            {user && (
              <div
                onClick={() => {
                  waitRedir("/u/"+user.username);
                  setIsOpen(false);
                }}
                className={`hidden lg:flex flex-col pt-2 items-center justify-center min-w-[22%] h-full pb-3 hover:bg-gray-500/50 select-none lg:flex-row lg:justify-start lg:my-4`}
              >
                <div className="lg:pl-2 mt-1">
                  <div className="text-gray-500">Logged in As:</div>
                  <div className="text-lg">{user.username}</div>
                </div>                
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
              <NavItem label={user.username} icon={UserIcon} onClick={() => waitRedir("/u/"+user.username)} isOpen={isOpen} mobile />
            ) : (
              <NavItem label="Login" icon={LoginIcon} onClick={() => waitRedir("/login")} isOpen={isOpen} mobile />
            )}

            {/* Page creation */}
            {user?.udata === "1" && (
              <NavItem label="Page Creation" icon={PageIcon} onClick={() => waitRedir("/page_creation")} isOpen={isOpen} />
            )}
             {/* Admin Account creation */}
            {user?.udata === "1" && (
             <NavItem label="Administrators" icon={AdminIcon} onClick={() => waitRedir("/administrator")} isOpen={isOpen} />
            )}

            {/* Settings */}
            {user ? (
             <NavItem label="Settings" icon={SettingsIcon} onClick={() => waitRedir("/settings/account")} isOpen={isOpen} />
            ) : ""}

            {/* Logout */}
            {user && (
              <NavItem label="Logout" icon={LogoutIcon} onClick={() => waitRedir("/api/logout")} isOpen={isOpen} color="red"/>
            )}
          </div>
        </div>
      </div>
      {/* Toggle button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`hidden lg:flex align-middle
        h-screen bg-slate-300 dark:bg-slate-800 border-gray-500 border-2 cursor-pointer`}
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
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 21C5 17.134 8.13401 14 12 14C15.866 14 19 17.134 19 21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 15L15 12M15 12L12 9M15 12H4M9 7.24859V7.2002C9 6.08009 9 5.51962 9.21799 5.0918C9.40973 4.71547 9.71547 4.40973 10.0918 4.21799C10.5196 4 11.0801 4 12.2002 4H16.8002C17.9203 4 18.4796 4 18.9074 4.21799C19.2837 4.40973 19.5905 4.71547 19.7822 5.0918C20 5.5192 20 6.07899 20 7.19691V16.8036C20 17.9215 20 18.4805 19.7822 18.9079C19.5905 19.2842 19.2837 19.5905 18.9074 19.7822C18.48 20 17.921 20 16.8031 20H12.1969C11.079 20 10.5192 20 10.0918 19.7822C9.71547 19.5905 9.40973 19.2839 9.21799 18.9076C9 18.4798 9 17.9201 9 16.8V16.75"
    stroke="#E02424" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const AdminIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l7 4v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-4z" />
    <path d="M12 11v3" />
    <circle cx="12" cy="9" r="1.5" fill="currentColor" />
  </svg>
);

const SettingsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.03-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.65l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.03 7.03 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65a7.03 7.03 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.65L4.57 11c-.04.32-.07.65-.07.98s.03.66.07.98L2.46 14.6a.5.5 0 0 0-.12.65l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.52.39 1.09.72 1.69.98l.38 2.65A.5.5 0 0 0 10 22h4a.5.5 0 0 0 .49-.42l.38-2.65a7.03 7.03 0 0 0 1.69-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.65l-2.1-1.65ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z" />
  </svg>
)

const PageIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M3 10V18C3 19.1046 3.89543 20 5 20H11M3 10V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V10M3 10H21M21 10V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <path d="M17 14V17M17 20V17M17 17H14M17 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  <circle cx="6" cy="7" r="1" fill="currentColor"/>
  <circle cx="9" cy="7" r="1" fill="currentColor"/>
  </svg>
)
const LoginIcon = UserIcon;
