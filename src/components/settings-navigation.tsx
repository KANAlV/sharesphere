"use client"
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  function isActive(text: string) {
    return pathname.startsWith("/settings/" + text)
      ? "border-b-5 border-blue-500"
      : "";
  }

  return (
    <div className="w-full pt-6 h-1/12 border-b-2 border-gray-500">
      <div className="text-4xl font-bold">Settings</div>
      <div className="flex">
        <Link href={"/settings/account"}>
          <div className={`${isActive("account")} p-4 pb-2`}> Account</div>
        </Link>
        <Link href={"/settings/profile"}>
          <div className={`${isActive("profile")} p-4 pb-2`}> Profile</div>
        </Link>
      </div>
    </div>
  );
}
