// components/RedirectToHome.tsx
"use client";
import { useEffect } from "react";

export default function RedirectToHome() {
  useEffect(() => {
    window.location.href = "/";
  }, []);

  return null; // nothing is rendered
}