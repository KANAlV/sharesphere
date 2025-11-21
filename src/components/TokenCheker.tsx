"use client";
import { useEffect } from "react";

export default function SessionChecker() {
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/session/check");
        const data = await res.json();

        if (!data.valid) {
          // Session expired → redirect
          window.location.href = "/";
        }
      } catch {
        window.location.href = "/";
      }
    }, 5000); // check every 5 seconds (adjust if needed)

    return () => clearInterval(interval);
  }, []);

  return null; // doesn't render anything
}