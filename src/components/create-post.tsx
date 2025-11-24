"use client";
import { useState } from "react";

type Sel = {
  name: string;
  id: string;
}

export default function CreatePostPage({courses, orgs}:{courses: Sel[], orgs: Sel[]}) {
  const [isOpen, setOpen] = useState(false)
  const [pagetype, setPagetype] = useState("courses")
  const [course_org, setCourseOrg] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const titleField = (text: string) => {
    setTitle(text);
  }

  const contentField = (text: string) => {
    setContent(text);
  }

  const toggleList = () =>
    setPagetype(prev => (prev === "courses" ? "orgs" : "courses"));

  const Display = (title: string) => 
    title.split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  

  return (<>
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-[#1a1a1a] dark:to-[#0e0e0e] flex justify-center py-10">
      <div className="mt-15 w-full max-w-4xl bg-white dark:bg-[#222] rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Create a Post
        </h1>

        <div className="flex h-10 w-fit p-4 bg-gray-500/50 rounded-full items-center
                         hover:bg-gray-500/80  hover:cursor-pointer
                      "
          onClick={() => {setOpen(true)}}
        >
          {course_org == ""? "Select an category/org":Display(displayName)}
          <svg
            width="24px"
            height="24px"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className={`ml-auto transition-transform duration-300`}
          >
            <path d="M7 10l5 5 5-5" />
          </svg>
          
        </div>
        {isOpen && (
          <div className="absolute p-4 z-40 h-2/4 w-4/9 bg-background border-2 border-gray-500 rounded-2xl">
            <p className="font-semibold">Page Type:</p>

            <div className="flex">
              <label className="px-4">
                <input
                  type="radio"
                  name="type"
                  value="courses"
                  checked={pagetype === "courses"}
                  onChange={() => setPagetype("courses")}
                />{" "}
                Courses
              </label>

              <label className="px-4">
                <input
                  type="radio"
                  name="type"
                  value="orgs"
                  checked={pagetype === "orgs"}
                  onChange={() => setPagetype("orgs")}
                />{" "}
                Org/Club
              </label>
            </div>

            <div className="flex p-1 h-4/5 bg-gray-500/20 rounded-2xl overflow-y-scroll
                            scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600
            ">
              {pagetype === "courses"
                ? courses.map((post, idx) => (
                    <div
                      key={`${post.id}-${idx}`}
                      onClick={() => {setCourseOrg(post.id), setDisplayName(post.name), setOpen(false)}}
                      className="flex h-fit m-1 px-4 py-2 rounded-full border-t border-stone-800 bg-gray-500/50 hover:bg-gray-100/15 cursor-pointer"
                    >
                      {Display(post.name)}
                    </div>
                  ))
                : orgs.map((post, idx) => (
                    <div
                      key={`${post.id}-${idx}`}
                      onClick={() => {setCourseOrg(post.id), setDisplayName(post.name), setOpen(false)}}
                      className="flex h-fit  m-1 px-4 py-2 rounded-full border-t border-stone-800 bg-gray-500/50 hover:bg-gray-100/15 cursor-pointer"
                    >
                      {Display(post.name)}
                    </div>
                  ))}
            </div>
          </div>
        )}

        {/* Title Input */}
        <input
          type="text"
          value={title}
          onChange={(e) => titleField(e.target.value)}
          placeholder="Enter a title..."
          className="w-full mt-4 border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 text-lg rounded-xl p-3 mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Content Area */}
        <textarea
          placeholder="Write your thoughts, share ideas, or discuss something here..."
          value={content}
          onChange={(e) => contentField(e.target.value)}
          className="w-full min-h-[300px] border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 rounded-xl p-4 mb-4 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button className="px-4 py-2 text-sm font-semibold bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
            + Add Tag
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition">
            Discard
          </button>
          <button className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
            Post
          </button>
        </div>
      </div>
    </div>
  </>);
}
