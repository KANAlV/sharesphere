"use client";

export default function CreatePostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 dark:from-[#1a1a1a] dark:to-[#0e0e0e] flex justify-center py-10">
      <div className="w-full max-w-4xl bg-white dark:bg-[#222] rounded-2xl shadow-lg p-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Create a Post
        </h1>

        {/* Title Input */}
        <input
          type="text"
          placeholder="Enter a title..."
          className="w-full border border-gray-300 dark:border-gray-700 bg-transparent text-gray-900 dark:text-gray-100 text-lg rounded-xl p-3 mb-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />

        {/* Content Area */}
        <textarea
          placeholder="Write your thoughts, share ideas, or discuss something here..."
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
  );
}
