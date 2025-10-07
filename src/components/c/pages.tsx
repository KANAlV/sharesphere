"use client";
import { useRef } from "react";

type Post = {
  dir: string;
  title: string;
  content: string;
};

export default function CoursePage({
  posts,
  id,
}: {
  posts: Post[];
  id: string;
}) {

const redirect = (dest:string) => {
    window.location.href = "../posts/" + dest;
}

// scroll buttons
const carouselRef = useRef<HTMLDivElement>(null);
const scrollLeft = () => {
  if (carouselRef.current) {
    carouselRef.current.scrollLeft -= 900;
  }
}

const scrollRight = () => {
  if (carouselRef.current) {
    carouselRef.current.scrollLeft += 900;
  }
};

  
let categoryName;
for(let i = 0; i < id.length;i++){
    if (i == 0)
    {
        categoryName = null;
        categoryName = id.charAt(0).toUpperCase();
    }
    else
    {
        switch (id.charAt(i)) {
            case "_": categoryName = categoryName + " ";
                    break;
            default: if (id.charAt(i - 1) == "_") {categoryName = categoryName + id.charAt(i).toUpperCase();}
                    else {categoryName = categoryName + id.charAt(i);}
                    break; 
        }
    }
}  
//set bg color
let bgClass = "bg-red-900!";

  return (
    <div className="relative w-full max-w-5xl mx-auto sm:mt-20">
      <div className="space-y-4 mt-6">
        {/* Page Name */}
        {true ?
          <>
            <div className="relative h-30 bg-red-900 sm:rounded-xl"><div className="sm:hidden bottom-0 m-0 p-0 absolute w-full h- bg-background-dark/100 rounded-t-2xl h-3"/></div>
            <div className="pl-4">
              <h1 className="text-xl font-bold">{categoryName}</h1>
            </div>
          </>
        : null}
        {/* Club Announcements */}
        <div className="flex relative h-10 bor sm:rounded-xl border border-gray-200 dark:border-stone-800">
          <div className="m-auto">Announcements</div>
          <button className="
            
          ">

          </button>
        </div>
        <div className="relative">
          <div ref={carouselRef} className="min-w-100% h-50 flex overflow-x-auto">
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2021</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2022</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2023</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2024</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2025</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2026</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2027</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2028</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2029</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            <a href="#" className="block mx-2 min-w-80 max-w-sm p-6 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-100 dark:border-stone-800 dark:hover:bg-stone-950">
              <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Noteworthy technology acquisitions 2030</h5>
              <p className="font-normal line-clamp-3 text-gray-700 dark:text-gray-400">Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.</p>
            </a>
            </div>
        </div>
        
        {/* Posts */}
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.title} onClick={() => redirect(post.dir)} className="p-4 border-t border-stone-800 hover:bg-gray-100 dark:hover:bg-stone-950">
              <h2 className="text-xl font-bold">{post.title}</h2>
              <p className="line-clamp-3">{post.content}</p>
            </div>
          ))
        ) : (
          <p>This Page does not have Any Entry.</p>
        )}
      </div>
    </div>
  );
}