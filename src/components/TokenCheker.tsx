"use client";

import { useEffect, useState } from "react";

export default function SessionChecker() {
  const [expired, setExpired] = useState(false);
  const [count, setCount] = useState(5);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/session/check");
        const data = await res.json();

        if (!data.valid) {
          setExpired(true);
        }
      } catch {
        setExpired(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!expired) return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          // Redirect when finished
          window.location.href = "/";
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [expired]);

  return (
    <>
      {expired && (
        <div className="fixed inset-0 z-50 bg-black/70 flex flex-col items-center justify-center gap-4 text-white">
          <div className="h-12 w-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>

          <p className="text-lg font-medium">
            Token expired. Redirecting to home page…
          </p>

          <p className="text-sm opacity-70">({count} seconds)</p>
        </div>
      )}
    </>
  );
}