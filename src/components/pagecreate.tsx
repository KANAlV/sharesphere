"use client";

import { useState } from "react";

export default function PageCreate() {
  const [rules, setRules] = useState<{ name: string; description: string }[]>([]);
  const [ruleName, setRuleName] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    page_name: "",
    theme: "#ffffff",
    pagetype: "categories",
    description: "",
    banner: "",
  });

  // handle rule
  const handleAddRule = () => {
    if (!ruleName.trim()) return;
    setRules([...rules, { name: ruleName, description: ruleDesc }]);
    setRuleName("");
    setRuleDesc("");
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const moveRule = (index: number, direction: number) => {
    const newRules = [...rules];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newRules.length) return;
    [newRules[index], newRules[targetIndex]] = [newRules[targetIndex], newRules[index]];
    setRules(newRules);
  };

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
      console.log("Upload response:", data);
      if (data?.data?.url) {
        const url = data.data.url;
        setUploadedUrl(url);
        // ✅ also store it in the form data
        setForm((prev) => ({ ...prev, banner: url }));
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
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


  // handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.banner) return alert("Please upload a banner image first.");

    setMessage("Submitting...");

    try {
      const res = await fetch("/api/create_page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page_name: form.page_name,
        theme: form.theme,
        pagetype: form.pagetype,
        description: form.description,
        bannerUrl: form.banner, // ⚠️ <- backend expects bannerUrl
        rules: rules
          .filter(r => r.name.trim() && r.description.trim())
          .map(r => ({ ruleName: r.name, ruleDesc: r.description })),
      }),
    });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Page created successfully!");
        // Optionally reset form
        setForm({
          page_name: "",
          theme: "#ffffff",
          pagetype: "categories",
          description: "",
          banner: "",
        });
        setRules([]);
        setRuleName("");
        setRuleDesc("");
        setImage(null);
        setPreview(null);
        setUploadedUrl(null);
      } else {
        setMessage(data.error || "❌ Failed to create page");
      }
    } catch {
      setMessage("⚠️ Network error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-screen h-full lg:pt-20 p-6">
      <div className="border border-amber-50 m-auto lg:w-4/5">
        <div className="flex flex-col lg:flex-row border border-amber-50 m-auto w-full lg:h-4/5 gap-6">
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
            {/* Description */}
            <div>
              <label className="block mb-1 font-medium">Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="border border-gray-400 p-2 rounded w-full h-32 resize-y"
                placeholder="Enter a short description..."
              />
            </div>
          </div>

          {/* Rules Section */}
          <div className="lg:w-1/3 lg:h-150 overflow-y-auto border border-gray-300 p-4 rounded">
            <h2 className="font-semibold mb-3 text-lg">Rules</h2>

            {/* Input fields for adding a new rule */}
            <div className="flex flex-col gap-2 mb-4">
              <input
                type="text"
                placeholder="Rule name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                className="border border-gray-400 p-2 rounded w-full"
              />
              <textarea
                placeholder="Rule description"
                value={ruleDesc}
                onChange={(e) => setRuleDesc(e.target.value)}
                className="border border-gray-400 p-2 rounded w-full resize-y h-20"
              />
              <button
                type="button"
                onClick={handleAddRule}
                className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={!ruleName.trim()}
              >
                Add Rule
              </button>
            </div>

            {/* Display added rules */}
            {rules.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {rules.map((rule, index) => (
                  <li
                    key={index}
                    className="border border-gray-400 p-2 rounded bg-gray-50 flex justify-between items-start gap-2"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{rule.name}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{rule.description}</p>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveRule(index, -1)}
                        disabled={index === 0}
                        className="text-blue-500 hover:text-blue-700 disabled:opacity-40"
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRule(index, 1)}
                        disabled={index === rules.length - 1}
                        className="text-blue-500 hover:text-blue-700 disabled:opacity-40"
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => removeRule(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No rules added yet.</p>
            )}
          </div>
        </div>

        {/* post */}
          
        <div className="block">
          <div className="block mt-4">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Create Page
              </button>
          </div>

          {message && <p className="mt-2 text-center text-sm">{message}</p>}
        </div>
      </div>
      <div className="h-30 lg:hidden" />
    </form>
  );
}