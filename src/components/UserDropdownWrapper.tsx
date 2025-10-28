"use client";
import dynamic from "next/dynamic";

const UserDropdown = dynamic(() => import("./UserDropdown"), { ssr: false });
export default UserDropdown;