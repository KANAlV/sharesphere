"use client";

import { useState, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "flowbite-react";

type Course = {
  id: number;
  category_name: string;
  description: string;
};

export default function CourseCarousel({ courses }: { courses: Course[] }) {
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 250;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseEnter = (id: number) => {
    hoverTimer.current = setTimeout(() => {
      setShowDropdown(id);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    setShowDropdown(null);
  };

  if (!courses || courses.length === 0) {
    return <p className="text-center mt-10">No courses found.</p>;
  }

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-30">
      {/* Scroll left */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-full z-10"
      >
        <ChevronLeftIcon />
      </button>

      {/* Scrollable list */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto space-x-15 no-scrollbar scroll-smooth px-10"
      >
        {courses.map((course) => (
          <div
            key={course.id}
            onMouseEnter={() => handleMouseEnter(course.id)}
            onMouseLeave={handleMouseLeave}
            className="relative w-48 h-48 bg-white dark:bg-gray-800 shadow-md rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer"
          >
            <p className="text-center font-semibold">{course.category_name}</p>

            {showDropdown === course.id && (
              <div className="absolute top-full mt-2 w-56 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-3 z-20">
                <h3 className="font-bold">{course.category_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {course.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Scroll right */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-full z-10"
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}