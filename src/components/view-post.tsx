"use client";

import { useState } from "react";

export default function PostView({ post }: { post: unknown }) {  // Cast 'post' to a known structure (since it's unknown)
  const typedPost = post as {
    id: string;
    title: string;
    content: string;
    created_at: string;
    username: string;
    likes?: number;
    dislikes?: number;
  };

  const [likes] = useState(typedPost.likes || 0);
  const [dislikes] = useState(typedPost.dislikes || 0);
  const [comment, setComment] = useState("");

  return (
    <div className="bg-gray-500 dark:bg-neutral-700 flex-3 flex flex-col p-8 rounded-lg w-full ml-15">
      {/* Title */}
      <div className="border-b-2 border-[#6C6C6C] border-solid flex-2 p-5">
        <p className="text-black dark:text-white text-5xl font-bold">{typedPost.title}</p>
        <p className="text-sm text-black dark:text-white">
          {typedPost.username} — {new Date(typedPost.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="border-b-2 border-[#6C6C6C] border-solid flex-2 px-5 pt-10 pb-4">
        <p className="text-xl text-black dark:text-white mb-4">{typedPost.content}</p>
      </div>

      {/* Likes / Dislikes */}
      <div className="flex gap-6 pt-5 text-black dark:text-white items-center">
        <div className="flex items-center gap-2">
          <p className="text-3xl">{likes}</p>
          {/* Thumbs up */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            className="text-black dark:text-white"
          >
            <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59..." />
          </svg>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-3xl">{dislikes}</p>
          {/* Thumbs down */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            className="text-black dark:text-white"
          >
            <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42..." />
          </svg>
        </div>
      </div>

      {/* Comment input */}
      <input
        className="rounded-4xl mt-5 h-15 bg-white dark:bg-[#444] px-10 py-2 text-black dark:text-white w-full"
        placeholder="Comment..."
        type="text"
        name="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Example Comment */}
      <div className="">
        <p className="text-sm text-black dark:text-white">Username - 01/01/9999</p>
        <div className="px-10">
          <p className="text-sm text-black dark:text-white">
            Crazy? I was crazy once...
          </p>
          <div className="flex gap-3 pt-5 text-black dark:text-white"></div>
        </div>
      </div>
    </div>
  );
}
