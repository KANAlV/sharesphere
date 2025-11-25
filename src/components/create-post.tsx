"use client";
import { useState, useCallback } from "react";

type Sel = {
  name: string;
  id: string;
}

type tags = {
  dir: string;
  name: string;
  description: string;
}

export default function CreatePostPage({courses, orgs}:{courses: Sel[], orgs: Sel[]}) {
  const [isOpen, setOpen] = useState(false)
  const [pagetype, setPagetype] = useState("courses")
  const [course_org, setCourseOrg] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsOpen, setTagsOpen] = useState(false);
  const [searchTag, setSearchTag] = useState("");
  const [postTags, setPostTags] = useState<tags[]>([]);
  const [newTags, setNewTags] = useState<tags[]>([]);

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
  
  const addTag = (dir: string) => {
    const selected = newTags.find(t => t.dir === dir);
    setSearchTag("");
    if (!selected) return;

    setPostTags(prev => [...prev, selected]);
  };

  const getTags = useCallback(async (tag: string) => {
    setSearchTag(tag);
    // If empty input, clear dropdown and skip fetch
    if (!tag || tag.trim() === "") {
      setNewTags([]);
      setTagsOpen(false);
      return;
    }

    try {
      const res = await fetch(`/api/fetchTagsLike?tag=${tag}`);
      const data = await res.json();

      // Ensure data is an array (avoid API errors crashing the UI)
      if (!Array.isArray(data)) {
        setNewTags([]);
        setTagsOpen(false);
        return;
      }

      setNewTags(data);
      setTagsOpen(data.length > 0);

    } catch (err) {
      console.error("Error fetching more tags:", err);
      setNewTags([]);
      setTagsOpen(false);
    }
  }, []);

  const removeTag = (dir: string) => {
    setPostTags(prev => prev.filter(t => t.dir !== dir));
  };

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
          onClick={() => {setOpen(!isOpen)}}
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
          className="w-full mt-4 border border-gray-500 bg-transparent text-lg rounded-xl p-3 mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Content Area */}
        <textarea
          placeholder="Write your thoughts, share ideas, or discuss something here..."
          value={content}
          onChange={(e) => contentField(e.target.value)}
          className="w-full min-h-[300px] border border-gray-500 bg-transparent rounded-xl p-4 mb-4 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Tags input */}
        <div className="flex flex-wrap items-center gap-3 border border-gray-500 rounded-full p-2">
          <input
            type="text"
            placeholder="Add a tag"
            value={searchTag}
            onChange={(e) => getTags(e.target.value)}
            className="flex-grow mx-4 min-w-[30px] max-w-[200px] focus:outline-none focus:ring-0"
          />

          {postTags.map((post, idx) => (
            <div
              key={idx}
              className="flex items-center m-1 px-4 py-2 rounded-full bg-gray-500/50"
            >
              {Display(post.name)}
              <button
                type="button"
                className="pl-2 cursor-pointer hover:text-red-700"
                onClick={() => removeTag(post.dir)}
              >
                x
              </button>
            </div>
          ))}
        </div>



        {/* Autocomplete dropdown */}
        <div className={`${tagsOpen ? "flex" : "hidden"} flex-col relative z-30 border-2 border-gray-500 rounded-r-2xl rounded-b-2xl`}>
          {newTags
            .filter(t => !postTags.some(p => p.dir === t.dir))
            .map((post, idx) => (
              <div
                key={idx}
                onClick={() => { addTag(post.dir); setTagsOpen(false); }}
                className="flex m-1 px-4 py-2 rounded-full bg-gray-500/50 cursor-pointer"
              >
                {Display(post.name)}
              </div>
            ))}
        </div>



        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
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
