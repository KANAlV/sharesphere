"use client";

import { useState, useEffect } from "react";

export default function TextCarousel() {
  const [announcements, setAnnouncements] = useState<
    { announceid: number; author_id: string; title: string; content: string }[]
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetching announcements
  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const res = await fetch("/api/announcements");
        const data = await res.json();
        setAnnouncements(data.announcements || []);
      } catch (err) {
        console.error("Failed to load announcements:", err);
      }
    }

    fetchAnnouncements();
  }, []);

  // Should Auto scroll every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % (announcements.length || 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [announcements.length]);

  if (announcements.length === 0) {
  return (
    <div className="w-[80%] mx-auto mt-30 mb-15">
      <div className="relative w-full h-52 md:h-60 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-lg">
        <p className="text-xl text-gray-500 dark:text-gray-400">
          No announcements available.
        </p>
      </div>
    </div>
  );
}


  const current = announcements[currentIndex];

  return (
    <div className="w-[80%] mx-auto mt-30 mb-15">
      <div className="relative w-full h-52 md:h-60 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-700">
        <div className="text-center px-6">
          <p className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-gray-200">
            {current.title}
          </p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">{current.content}</p>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-3 flex gap-2 justify-center">
          {announcements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentIndex === index
                  ? "bg-blue-500 scale-125"
                  : "bg-gray-400 dark:bg-gray-600"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
