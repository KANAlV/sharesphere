"use client";
import Image from "next/image";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100/70 dark:bg-gray-900/70">
      <div className="animate-fade">
        <Image
          src="/sharesphere_logo.png"
          alt="ShareSphere Logo"
          width={130}
          height={130}
          className="opacity-80"
        />
      </div>

      <style jsx>{`
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .animate-fade {
          animation: fadeInOut 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
