"use client";
import { useState, useCallback, useEffect } from "react";

type Sel = { name: string; id: string };
type tags = { dir: string; name: string; description: string };
type ImagePreview = { id: string; localUrl: string; uploadedUrl?: string; uploading?: boolean };

export default function CreatePostPage({ courses, orgs }: { courses: Sel[]; orgs: Sel[] }) {
  const [isOpen, setOpen] = useState(false);
  const [pagetype, setPagetype] = useState("courses");
  const [course_org, setCourseOrg] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsOpen, setTagsOpen] = useState(false);
  const [searchTag, setSearchTag] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [disclamer, showDisclamer] = useState(false);
  const [postTags, setPostTags] = useState<tags[]>([]);
  const [newTags, setNewTags] = useState<tags[]>([]);
  const [images, setImages] = useState<ImagePreview[]>([]);

  const uploadImages = async (files: FileList) => {
    const remain = 5 - images.length;
    if (remain <= 0) return;
    const selected = Array.from(files).slice(0, remain);

    selected.forEach((file) => {
      const id = crypto.randomUUID();
      const localUrl = URL.createObjectURL(file);

      // Add preview with uploading state
      setImages((prev) => [...prev, { id, localUrl, uploading: true }]);

      const formData = new FormData();
      formData.append("image", file);

      fetch("/api/create_post/upload_image", { method: "POST", body: formData })
        .then((res) => res.json())
        .then((data) => {
          setImages((prev) =>
            prev.map((img) =>
              img.id === id ? { ...img, uploadedUrl: data.url, uploading: false } : img
            )
          );
        })
        .catch(() => {
          setImages((prev) => {
            const failed = prev.find((img) => img.id === id);
            if (failed) URL.revokeObjectURL(failed.localUrl);
            return prev.filter((img) => img.id !== id);
          });
        });
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const toRemove = prev.find((img) => img.id === id);
      if (toRemove) URL.revokeObjectURL(toRemove.localUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  useEffect(() => () => images.forEach((img) => URL.revokeObjectURL(img.localUrl)), []);

  const titleField = (text: string) => setTitle(text);
  const contentField = (text: string) => setContent(text);

  const Display = (title: string) =>
    title.split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

  const addTag = (dir: string) => {
    const selected = newTags.find((t) => t.dir === dir);
    setSearchTag("");
    if (!selected) return;
    setPostTags((prev) => [...prev, selected]);
  };

  const getTags = useCallback(async (tag: string) => {
    setSearchTag(tag);
    if (!tag.trim()) {
      setNewTags([]); setTagsOpen(false); return;
    }
    try {
      const res = await fetch(`/api/fetchTagsLike?tag=${tag}`);
      const data = await res.json();
      if (Array.isArray(data)) { setNewTags(data); setTagsOpen(data.length > 0); } 
      else { setNewTags([]); setTagsOpen(false); }
    } catch { setNewTags([]); setTagsOpen(false); }
  }, []);

  const removeTag = (dir: string) => setPostTags((prev) => prev.filter((t) => t.dir !== dir));

  const submitPost = async () => {
    // Validation
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!content.trim()) {
      alert("Please enter content for your post.");
      return;
    }

    if ((pagetype === "courses" || pagetype === "orgs") && !course_org) {
      alert(`Please select a course/organization.`);
      return;
    }

    // get img urls
    const imageUrls = images
      .map((img) => img.uploadedUrl)
      .filter((url): url is string => Boolean(url));

    // Build the request body safely and cleanly
    const body: {
      title: string;
      content: string;
      tags: string[];
      images: string[];
      course_id: string | null;
      org_id: string | null;
      anonymous: boolean;
    } = {
      title,
      content,
      tags: postTags.map((t) => t.dir),
      images: imageUrls,
      course_id: null,
      org_id: null,
      anonymous: anonymous,
    };

    if (pagetype === "courses") {
      body.course_id = course_org || null;
    } else if (pagetype === "orgs") {
      body.org_id = course_org || null;
    }

    try {
      const res = await fetch("/api/create_post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        alert("Failed to create post.");
        return;
      }

      const data: { success: boolean; message?: string } = await res.json();

      if (data.success) {
        alert("Post created!");
        setTitle("");
        setContent("");
        setCourseOrg("");
        setDisplayName("");
        setImages([]);
        setPostTags([]);

        // If eslint complains about window.location, wrap it:
        window.location.assign("/");
      } else {
        alert(data.message || "Failed to create post");
      }
    } catch (error) {
      console.error(error);
      alert("Error creating post");
    }
  };

  return (
    <div className="lg:w-full min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-[#1a1a1a] dark:to-[#0e0e0e] flex justify-center py-10">
      <div className="mt-15 w-full max-w-4xl bg-white dark:bg-[#222] rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Create a Post</h1>

        {/* Category/Org selector */}
        <div
          className="flex h-10 w-fit p-4 bg-gray-500/50 rounded-full items-center hover:bg-gray-500/80 hover:cursor-pointer"
          onClick={() => setOpen(!isOpen)}
        >
          {course_org === "" ? "Select an category/org" : Display(displayName)}
          <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24" className="ml-auto transition-transform duration-300">
            <path d="M7 10l5 5 5-5" />
          </svg>
        </div>

        {isOpen && (
          <div className="absolute p-4 z-40 h-2/4 w-5/6 lg:w-4/9 bg-background border-2 border-gray-500 rounded-2xl">
            <p className="font-semibold">Page Type:</p>
            <div className="flex">
              <label className="px-4">
                <input type="radio" name="type" value="courses" checked={pagetype === "courses"} onChange={() => setPagetype("courses")} /> Courses
              </label>
              <label className="px-4">
                <input type="radio" name="type" value="orgs" checked={pagetype === "orgs"} onChange={() => setPagetype("orgs")} /> Org/Club
              </label>
            </div>
            <div className="flex p-1 h-4/5 bg-gray-500/20 rounded-2xl overflow-y-scroll scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
              {(pagetype === "courses" ? courses : orgs).map((post, idx) => (
                <div
                  key={`${post.id}-${idx}`}
                  onClick={() => { setCourseOrg(post.id); setDisplayName(post.name); setOpen(false); }}
                  className="flex h-fit m-1 px-4 py-2 rounded-full border-t border-stone-800 bg-gray-500/50 hover:bg-gray-100/15 cursor-pointer"
                >
                  {Display(post.name)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Title & Content */}
        <input type="text" value={title} onChange={(e) => titleField(e.target.value)} placeholder="Enter a title..." className="w-full mt-4 border border-gray-500 bg-transparent text-lg rounded-xl p-3 mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        <textarea placeholder="Write your thoughts..." value={content} onChange={(e) => contentField(e.target.value)} className="w-full min-h-[300px] border border-gray-500 bg-transparent rounded-xl p-4 shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />

        <div className="flex mt-4 mx-4 w-full mb-2 justify-between">
          <div className="flex">
            Post anonymously
            <div
              onClick={() => setAnonymous(!anonymous)}
              onMouseEnter={()=>showDisclamer(true)}
              onMouseLeave={()=>showDisclamer(false)}
              className={`w-12 h-6 flex items-center rounded-full ml-2 p-1 cursor-pointer transition-colors
                ${anonymous ? "bg-[#1F1E3D]" : "bg-gray-400"}`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
                  ${anonymous ? "translate-x-6" : "translate-x-0"}`}
              />
            </div>

            <div
              id="label"
              className={`${disclamer ? "block":"hidden"}
                          z-50 divide-y dark:bg-gray-700 bg-gray-300
                          rounded-lg shadow-sm w-86 text-justify  absolute mt-6 p-4`}
            >
              Disclaimer: Posting anyting inappropriate will allow moderators
              to see your details even if using this feature. It is to allow
              diciplinary action for students on this site.
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="mt-4 mb-4 flex flex-wrap gap-4 items-end">
          <div className="w-full text-gray-500 mb-2">{images.length} / 5 images</div>
          {images.length < 5 && (
            <label className="w-28 h-28 border border-dashed border-gray-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-700/20 text-gray-400">
              +
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && uploadImages(e.target.files)} />
            </label>
          )}
          {images.map((img) => (
            <div key={img.id} className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-200">
              <button onClick={() => removeImage(img.id)} className="absolute z-10 right-1 top-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition">×</button>
              {img.uploading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img src={img.uploadedUrl ?? img.localUrl} alt="preview" className="object-cover w-full h-full rounded-xl" />
            </div>
          ))}
        </div>

        {/* Autocomplete Dropdown */}
        <div className={`${tagsOpen ? "flex" : "hidden"} flex-col relative z-30 border-2 border-gray-500 rounded-r-2xl rounded-b-2xl`}>
          {newTags.filter((t) => !postTags.some((p) => p.dir === t.dir)).map((post, idx) => (
            <div key={idx} onClick={() => { addTag(post.dir); setTagsOpen(false); }} className="flex m-1 px-4 py-2 rounded-full bg-gray-500/50 cursor-pointer">{Display(post.name)}</div>
          ))}
        </div>

        {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6">
          <button className="px-6 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition">Discard</button>
          <button 
            onClick={submitPost}
            className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >Post</button>
        </div>
      </div>
    </div>
  );
}
