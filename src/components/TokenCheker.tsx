"use client";

import { useEffect, useState } from "react";

export default function SessionChecker() {
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/session/check");
        const data = await res.json();

        if (!data.valid) {
          setExpired(true);
          console.log("token expired")
          // Wait 5 seconds before redirect
          setTimeout(() => {
            window.location.href = "/";
          }, 5000);
        }
      } catch {
        setExpired(true);
        setTimeout(() => {
          window.location.href = "/";
        }, 5000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {expired && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center gap-4 text-white">
          <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>

          <p className="text-lg font-medium">
            Token expired. Redirecting to home page…
          </p>

          <p className="text-sm opacity-70">(5 seconds)</p>
        </div>
      )}
    </>
  );
}
