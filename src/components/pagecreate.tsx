"use client";

import { useState } from "react";

export default function PageCreate() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    page_name: "",
    theme: "#ffffff",
    pagetype: "categories",
  });

  // handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // handle upload to /api/upload
  const handleUpload = async () => {
    if (!image) return alert("Please select an image first.");

    setLoading(true);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data?.data?.url) {
        setUploadedUrl(data.data.url); // only save the uploaded URL
        alert("Upload successful!");
      } else {
        alert("Upload failed.");
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading image");
    } finally {
      setLoading(false);
    }
  };

  // handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedUrl) return alert("Please upload a banner image first.");

    setMessage("Submitting...");

    try {
      const res = await fetch("/api/create_page", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bannerUrl: uploadedUrl, // send only the uploaded URL
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Page created successfully!");
        // optionally redirect:
        // window.location.href = "/admin/pages";
      } else {
        setMessage(data.error || "❌ Failed to create page");
      }
    } catch {
      setMessage("⚠️ Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-screen h-screen lg:pt-30 p-6">
      <div className="flex flex-col lg:flex-row border border-amber-50 m-auto lg:w-4/5 lg:h-4/5 gap-6">
        {/* Banner upload */}
        <div className="block w-full">
          <div className="border border-amber-50 p-2">
            <label className="font-semibold mb-2 pr-2">Banner Upload:</label>
            <input type="file" accept="image/*" onChange={handleFileChange} className="text-blue-500" />
            <div className="items-center w-full mt-2">
                <button
                    type="button"
                    onClick={handleUpload}
                    disabled={loading}
                    className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                    
                {loading ? "Uploading..." : "Upload Image"}
              </button>
              {preview && (
                <img src={preview} alt="Preview" className="w-4/5 h-40 m-auto my-5 object-cover rounded-lg self-end" />
              )}
              {uploadedUrl && (
                <p className="text-sm text-green-500">
                  ✅ Uploaded!{" "}
                  <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
                    View Image
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Page details */}
          <div className="flex justify-between mt-6 gap-4">
            <div className="inline-block w-1/2">
              <p className="font-semibold">Page Name:</p>
              <input
                type="text"
                name="page_name"
                value={form.page_name}
                onChange={handleChange}
                className="border border-gray-400 p-1 rounded w-full"
              />

              {/* Theme selector */}
              <div className="inline-block mt-4">
                <p className="font-semibold">Set page theme:</p>
                <input
                  type="color"
                  name="theme"
                  value={form.theme}
                  onChange={handleChange}
                  className="w-20 h-10 p-0 border-0"
                />
              </div>
            </div>

            {/* Page type */}
            <div className="inline-block">
              <p className="font-semibold">Page Type:</p>
              <label className="px-4">
                <input
                  type="radio"
                  name="pagetype"
                  value="categories"
                  checked={form.pagetype === "categories"}
                  onChange={handleChange}
                />{" "}
                Courses
              </label>
              <br />
              <label className="px-4">
                <input
                  type="radio"
                  name="pagetype"
                  value="organization"
                  checked={form.pagetype === "organization"}
                  onChange={handleChange}
                />{" "}
                Org/Club
              </label>
            </div>
          </div>
        </div>

        {/* Rules/other content */}
        <div className="lg:w-1/3">Rules</div>
        <div className="block mt-4">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Create Page
            </button>
        </div>

        {message && <p className="mt-2 text-center text-sm">{message}</p>}
        </div>
    </form>
  );
}