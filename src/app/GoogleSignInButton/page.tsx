"use client";
import Image from "next/image";
import { signIn } from "next-auth/react";

export default function GoogleSignInButton() {
  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded hover:bg-gray-100"
    >
      <Image src="/google.png" alt="Google" width={20} height={20} className="inline-block" />
      <span className="text-gray-700">Sign in with Google</span>
    </button>
  );
}
