"use client";
import { useState } from "react";

type Sel = { name: string; id: string };

export default function CreateAnnouncementPage({
  courses,
  orgs,
}: {
  courses: Sel[];
  orgs: Sel[];
}) {
  const [isOpen, setOpen] = useState(false);
  const [pagetype, setPagetype] = useState<"courses" | "orgs">("courses");
  const [course_org, setCourseOrg] = useState("");
  const [displayName, setDisplayName] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const Display = (title: string) =>
    title
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const submitPost = async () => {
    if (!title.trim()) return alert("Please enter a title.");
    if (!content.trim()) return alert("Please enter content.");
    if (!course_org)
      return alert("Please select a course or organization.");

    const body = {
      title,
      content,
      course_id: pagetype === "courses" ? course_org : null,
      org_id: pagetype === "orgs" ? course_org : null,
    };

    try {
      const res = await fetch("/api/create_announcement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error(await res.text());
        return alert("Failed to create announcement.");
      }

      const data = await res.json();

      if (data.success) {
        alert("Announcement Created!");
        window.location.assign("/");
      } else {
        alert(data.message || "Failed to create post");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating post");
    }
  };

 return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-[#1a1a1a] dark:to-[#0e0e0e] flex justify-center py-10">
      <div className="mt-15 w-full max-w-4xl bg-white dark:bg-[#222] rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Create an Announcement</h1>


        {/* Selector */}
        <div className="relative">
          <div
            onClick={() => setOpen(!isOpen)}
            className="flex justify-between items-center w-full sm:w-fit px-4 h-11 bg-gray-500/50 hover:bg-gray-500/70 text-white rounded-full cursor-pointer select-none"
          >
            <span className="truncate max-w-[200px] sm:max-w-none">
              {course_org === "" ? "Select a category/org" : Display(displayName)}
            </span>

            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className={`ml-2 transition-transform ${
                isOpen ? "rotate-180" : "rotate-0"
              }`}
              fill="currentColor"
            >
              <path d="M7 10l5 5 5-5"></path>
            </svg>
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute left-0 mt-2 w-full sm:w-80 max-h-72 overflow-hidden z-40 bg-gray-900 text-white border border-gray-700 rounded-2xl shadow-xl p-4">
              {/* Page type */}
              <p className="font-semibold mb-2">Page Type:</p>

              <div className="flex gap-6 mb-3 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={pagetype === "courses"}
                    onChange={() => {
                      setPagetype("courses");
                      setCourseOrg("");
                      setDisplayName("");
                    }}
                  />
                  Courses
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={pagetype === "orgs"}
                    onChange={() => {
                      setPagetype("orgs");
                      setCourseOrg("");
                      setDisplayName("");
                    }}
                  />
                  Org/Club
                </label>
              </div>

              {/* List */}
              <div className="flex flex-col gap-2 h-40 overflow-y-auto bg-gray-700/30 p-2 rounded-xl">
                {(pagetype === "courses" ? courses : orgs).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => {
                      setCourseOrg(post.id);
                      setDisplayName(post.name);
                      setOpen(false);
                    }}
                    className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 cursor-pointer text-sm"
                  >
                    {Display(post.name)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title..."
          className="w-full mt-6 border border-gray-500 bg-transparent text-lg rounded-xl p-3 focus:ring-blue-500 focus:ring-2 outline-none"
        />

        {/* Content */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your announcement..."
          className="w-full min-h-[220px] border border-gray-500 bg-transparent rounded-xl p-4 mt-4 resize-none focus:ring-blue-500 focus:ring-2 outline-none"
        />

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700">
            Discard
          </button>

          <button
            onClick={submitPost}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
