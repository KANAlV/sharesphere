"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  username: string;
  likes: number;
  dislikes: number;
  images: string[];
};

type Details = {
  description: string;
  theme: string;
  banner: string;
  created_at: string;
};

type UserData = {
  id: string;
  username: string;
  profile: string;
}

type Comments = {
  id: string,
  anonymous: boolean,
  profile: string,
  username:string,
  created_at: string,
  content: string,
  has_comments:boolean,
  likes: number,
  dislikes: number,
  user_deleted: boolean,
  mod_deleted: boolean
}

export default function PostView({ post, comments, details, userdata }: { post: Post, comments:Comments[], details:Details[], userdata: UserData[] | null}) { 

  const images = post.images || [];
  const [current, setCurrent] = useState(0);
  const length = images.length;

  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);

  const [likes] = useState(post.likes || 0);
  const [dislikes] = useState(post.dislikes || 0);
  const [comment, setComment] = useState("");
  const [prvt, setPrivate] = useState(false);
  const [disclamer, showDisclamer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = details[0].theme;

    return () => {
      document.body.style.backgroundColor = prev; // cleanup
    };
  }, [details[0].theme]);

  const postComment = async (postId: string, commentText: string, parentCommentId: unknown, anonymous: boolean) => {
    if (!commentText.trim()) {
      alert("Comment cannot be empty");
      return;
    }

    try {
      const res = await fetch("/api/posts/post_comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, comment: commentText, parentCommentId, anonymous }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to post comment");
        return;
      }

      const data = await res.json();
      if (data.success) {
        alert("Comment posted!");
        setComment(""); // Clear the input
        window.location.reload();
      } else {
        alert(data.message || "Failed to post comment");
      }
    } catch (error) {
      console.error(error);
      alert("Error posting comment");
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    autoResize();
  };

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // reset height
      textarea.style.height = textarea.scrollHeight + "px"; // set to content height
    }
  };

  // --- Font color logic ---
  let fontcolor = "black";
  const hexColor = details[0].theme.startsWith("#")
    ? details[0].theme.slice(1)
    : details[0].theme;
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (brightness < 128) fontcolor = "lightgray";

  // Resize on mount in case there's initial content
  useEffect(() => autoResize(), []);

  return (
    <div id="title" className="p-4 b-6 rounded-lg w-full h-screen lg:max-w-7/9 lg:ml-12 mt-16 lg:p-16 lg:mt-0">
      {/* Title */}
      <div className="border-b-2 border-[#6C6C6C] border-solid flex-2 p-5 mb-3">
        <p style={{ color: fontcolor}} className={`text-3xl font-bold`}>{post.title}</p>
        <p style={{ color: fontcolor}} className={`text-sm`}>
          {post.username} — {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Images Carousel */}
      {length > 0 && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <div
            className="flex bg-gray-500/30 transition-transform duration-500"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Slide ${idx + 1}`}
                width={800}
                height={600}
                className="w-full h-64 object-contain flex-shrink-0"
              />
            ))}
          </div>

          {length !== 1 && (
            <>
              {/* Prev/Next Buttons */}
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                ‹
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
              >
                ›
              </button>

              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full cursor-pointer ${
                      idx === current ? "bg-yellow-300" : "bg-gray-300"
                    }`}
                    onClick={() => setCurrent(idx)}
                  ></div>
                ))}
              </div>
            </>
          )}

        </div>
      )}

      {/* Content */}
      <div className="border-b-2 border-[#6C6C6C] border-solid flex-2 px-5 pt-2 pb-4">
        <p style={{ color: fontcolor}} className={`text-lg`}>{post.content}</p>
      </div>

      {/* Likes / Dislikes */}
      <div style={{ color: fontcolor}} className="flex gap-6 ml-4 pt-5 items-center">
        <div className="flex items-center gap-2">
          {/* Thumbs up */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
            style={{ color: fontcolor}}
          >
            <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
          </svg>
          <p className="text-lg">{likes}</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Thumbs down */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
             style={{ color: fontcolor}}
          >
            <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1" />
          </svg>
          <p className="text-lg">{dislikes}</p>
        </div>
      </div>

      {/* Comment input */}
      <div style={{ color: fontcolor}} className="flex mt-5 items-center w-full">
        {userdata? (<>
          <div className="w-12 h-12 self-start overflow-clip rounded-full">
            <img
              src={userdata[0].profile}
              alt={userdata[0].username}
              className="object-cover rounded-lg"
              sizes="96px"
            />
          </div>

          <textarea
            ref={textareaRef}
            placeholder="Add a comment..."
            value={comment}
            onChange={handleChange}
            rows={1} // start as a single line
            className="flex-grow mx-4 mb-2 resize-none overflow-hidden border-b-2 border-current bg-transparent focus:outline-none"
          />
        </>):(<div style={{ color: fontcolor, opacity: "50%"}}>
          Sign-in to post a comment
        </div>)}
      </div>

      {comment == "" ? "":(
        <div className="flex mt-4 mx-4 w-full mb-2 justify-between">
          <div style={{ color: fontcolor}} className="flex">
             Post anonymously
            <div
              onClick={() => setPrivate(!prvt)}
              onMouseEnter={()=>showDisclamer(true)}
              onMouseLeave={()=>showDisclamer(false)}
              className={`w-12 h-6 flex items-center rounded-full ml-2 p-1 cursor-pointer transition-colors
                ${prvt ? "bg-[#1F1E3D]" : "bg-gray-400"}`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
                  ${prvt ? "translate-x-6" : "translate-x-0"}`}
              />
            </div>

            <div
              id="label"
              style={{ color: fontcolor}}
              className={`${disclamer ? "block":"hidden"}
                          ${fontcolor == "lightgray" ? "bg-gray-700":"bg-gray-300"}
                          z-50 divide-y
                          rounded-lg shadow-sm w-86 text-justify  absolute mt-6 p-4`}
            >
              Disclaimer: Posting anyting inappropriate will allow moderators
              to see your details even if using this feature. It is to allow
              diciplinary action for students on this site.
            </div>
          </div>
          <div>
            <button
              onClick={() => setComment("")}
              type="button"
              className="px-4 py-2 mr-4 bg-gray-500/50 rounded-full cursor-pointer"
            >Cancel</button>
            <button
              onClick={() => postComment(post.id, comment, null, prvt)}
              type="button"
              className="px-4 py-2 mr-4 bg-blue-500 rounded-full cursor-pointer"
            >Post</button>
          </div>
          
        </div>
      )}

      <div className="mt-6"> 
        {comments.length > 0 ? (
          comments.map((comments, idx) => (
            <div key={idx} className="flex mt-4 mx-4 w-full mb-2 justify-between">
              <div className="absolute w-12 h-12 self-start overflow-clip rounded-full">
                <img
                  src={(comments.anonymous? "/anon.png":comments.profile)}
                  alt={comments.username}
                  className="object-cover rounded-lg"
                  sizes="96px"
                />
              </div>
              <div style={{background: details[0].theme}} className={`${comments.has_comments? "":"hidden"} absolute ml-2.25 w-6 h-6 self-end border-2 overflow-clip rounded-full cursor-pointer`}>
                <div className="flex items-center h-full justify-self-center">+</div>
              </div>
              <div className={`${comments.has_comments? "border-l-2":"border-l-none"} flex-grow ml-5 mb-3 p-4 pb-6 pl-8 rounded-2xl`}>
                <p style={{ color: fontcolor}} className="text-sm"> {(comments.anonymous? "anonymous":comments.username)}  •  {new Date(comments.created_at).toLocaleString()}</p> 
                <div className="px-10">
                  <p style={{ color: fontcolor}} className="text-sm">{comments.content}</p>
                </div>
              </div>
              <div className="absolute self-end ml-14">
                {/* Likes / Dislikes */}
                <div style={{ color: fontcolor}} className="flex gap-6 ml-4 pt-1 items-center">
                  <div className="flex items-center gap-2">
                    {/* Thumbs up */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                      style={{ color: fontcolor}}
                    >
                      <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
                    </svg>
                    <p className="text-lg">{likes}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Thumbs down */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      aria-hidden="true"
                      style={{ color: fontcolor}}
                    >
                      <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1" />
                    </svg>
                    <p className="text-lg">{dislikes}</p>
                  </div>
                  <div>
                    Reply?
                  </div>
                </div>
              </div>
            </div>)
          )):(<p>there are no comments yet</p>)
        }
      </div>
    </div>
  );
}
