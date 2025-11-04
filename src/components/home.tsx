"use client";

import { useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "flowbite-react";

type Course = {
  id: string;
  name: string;
  description: string;
};

export default function CourseCarousel({ courses }: { courses: Course[] }) {
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

  const displaytitle = (title: string) => {
    let displayTitle;
    for(let i = 0; i < title.length;i++){
      if (i == 0)
      {
        displayTitle = null;
        displayTitle = title.charAt(0).toUpperCase();
      }
      else
      {
        switch (title.charAt(i)) {
          case "_": displayTitle = displayTitle + " ";
                  break;
          default: if (title.charAt(i - 1) == "_") {displayTitle = displayTitle + title.charAt(i).toUpperCase();}
                  else {displayTitle = displayTitle + title.charAt(i);}
                  break; 
        }
        
      }
    }
    return displayTitle;
  }

  const redirect = (dest: string) => {
    window.location.href = "c/" + dest;
  }

  if (!courses || courses.length === 0) {
    return <p className="text-center mt-10">No courses found.</p>;
  }

  return (
    <div className="w-full min-h-full mt-30">
      {/* carousel */}
      <div className="relative w-full max-w-15/16 mx-auto mb-10">
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
              onClick={() => redirect(course.name)}
              className="relative w-50 h-50 bg-white dark:bg-gray-800 shadow-md rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer"
            >
              <p className="text-center font-semibold">{displaytitle(course.name)}</p>
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
    </div>
  );
}