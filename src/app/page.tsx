"use client";
import { useState, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "flowbite-react";

type Course = {
  id: number;
  title: string;
  description: string;
};

const courses: Course[] = [
  {id: 1, title: "Advanced Systems Integration and Architecture", description: "Sir, tapos na po."},
  {id: 2, title: "Advanced Database", description: "Sir, tapos na po."},
  {id: 3, title: "Enterprise Architecture", description: "Sir, tapos na po."},
  {id: 4, title: "Event-Driven Programming", description: "Sir, tapos na po."},
  {id: 5, title: "Data and Digital Communications", description: "Sir, tapos na po."},
];

export default function CourseCarousel() {
  const [hoveredCourse, setHoveredCourse] = useState<number | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 250; // pixels to move
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseEnter = (id: number) => {
    setHoveredCourse(id);
    hoverTimer.current = setTimeout(() => {
      setShowDropdown(id);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
    }
    setHoveredCourse(null);
    setShowDropdown(null);
  };
  return (
    <div className="relative w-full max-w-5xl mx-auto mt-30">
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-full z-10"
      >
        <ChevronLeftIcon/>
      </button>

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
            <p className="text-center font-semibold">{course.title}</p>

            {showDropdown === course.id && (
              <div className="absolute top-full mt-2 w-56 bg-white dark:bg-gray-900 shadow-lg rounded-lg p-3 z-20">
                <h3 className="font-bold">{course.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {course.description}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 p-2 rounded-full z-10"
      >
        <ChevronRightIcon/>
      </button>
    </div>
  );
}