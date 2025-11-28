"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

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

type LikesDislikesDetails = {
  likes: Record<string, { timestamp: string }>;
  dislikes: Record<string, { timestamp: string }>;
};

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
  lnd: LikesDislikesDetails;
  user_deleted: boolean,
  mod_deleted: boolean
}

let theme:string;
let userid:string;

export default function PostView({ post, comments, details, userdata }: { post: Post, comments:Comments[], details:Details[], userdata: UserData[] | null}) { 
  theme = details[0].theme;
  userid = userdata ? userdata[0].id : "";
  const [openReplies, setOpenReplies] = useState<{ [key: string]: boolean }>({});
  const [liked, setLiked] = useState<{ [key: string]: boolean }>({});
  const [disliked, setDisliked] = useState<{ [key: string]: boolean }>({});

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

  const [replyTo, setReplyTo] = useState<string | null>(null); // comment id being replied to
  const [replyComment, setReplyComment] = useState("");
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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

  const gotoUser = (dir:string, anon:boolean) => {
    if (anon) return;
    window.location.href = "/u/"+dir;
  }

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
    <div id="title" className="p-4 b-6 rounded-lg w-full h-screen lg:max-w-7/9 lg:ml-12 mt-16 lg:p-16 lg:mt-6">
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
            fill={fontcolor}
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
            fill={fontcolor}
            aria-hidden="true"
             style={{ color: fontcolor}}
          >
            <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1" />
          </svg>
          <p className="text-lg">{dislikes}</p>
        </div>
      </div>

      {/* Comment input */}
      <div style={{ color: fontcolor}} className="flex mt-5 mb-8 items-center w-full">
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

      {/* Comments section */}
      {comments.length > 0 ? (
        comments.map((comment, idx) => (
          <div key={idx}>
            <div className="flex ml-8 mx-4 w-full justify-between relative">
              {/* Avatar */}
              <div className="absolute bg-black w-12 h-12 self-start overflow-clip rounded-full select-none">
                <img
                  src={comment.anonymous ? "/anon.png" : comment.profile}
                  alt={comment.username}
                  className="object-cover rounded-lg"
                  sizes="96px"
                />
              </div>

              {/* Comment content */}
              <div style={{ border: `0px solid ${fontcolor}` }}
                className={`${
                  comment.has_comments ? "border-l-2!" : "border-l-none"
                } flex-grow ml-5.75 p-4 pb-8 pl-8`}
              >
                <p
                  onClick={() => gotoUser(comment.username, comment.anonymous)}
                  style={{ color: fontcolor }} 
                  className={`${comment.anonymous? "":"cursor-pointer"} text-sm`}>
                  {comment.anonymous ? "anonymous" : comment.username} •{" "}
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                <div className="pt-2 pl-4">
                  <p style={{ color: fontcolor }} className="text-sm">
                    {comment.content}
                  </p>
                </div>
              </div>

              {/* Likes / Dislikes / Reply */}
              <div className="absolute self-end ml-14">
                <div
                  style={{ color: fontcolor }}
                  className="flex gap-6 ml-4 pt-1 items-center"
                >
                  {/* likes */}
                  <div className="flex items-center gap-2"
                    // onClick={() => handleLike(comment.id)}
                  >
                    {userid && comment.lnd?.likes?.[userid] ? (
                      <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                          <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                              <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -760.000000)" fill={fontcolor}>
                                  <g id="icons" transform="translate(56.000000, 160.000000)">
                                      <path d="M203,620 L207.200006,620 L207.200006,608 L203,608 L203,620 Z M223.924431,611.355 L222.100579,617.89 C221.799228,619.131 220.638976,620 219.302324,620 L209.300009,620 L209.300009,608.021 L211.104962,601.825 C211.274012,600.775 212.223214,600 213.339366,600 C214.587817,600 215.600019,600.964 215.600019,602.153 L215.600019,608 L221.126177,608 C222.97313,608 224.340232,609.641 223.924431,611.355 L223.924431,611.355 Z" id="like-[#1385]">
                                      </path>
                                  </g>
                              </g>
                          </g>
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                          <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                              <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -760.000000)" fill="none" stroke={fontcolor} strokeWidth="1.5">
                                  <g id="icons" transform="translate(56.000000, 160.000000)">
                                      <path d="M203,620 L207.200006,620 L207.200006,608 L203,608 L203,620 Z M223.924431,611.355 L222.100579,617.89 C221.799228,619.131 220.638976,620 219.302324,620 L209.300009,620 L209.300009,608.021 L211.104962,601.825 C211.274012,600.775 212.223214,600 213.339366,600 C214.587817,600 215.600019,600.964 215.600019,602.153 L215.600019,608 L221.126177,608 C222.97313,608 224.340232,609.641 223.924431,611.355 L223.924431,611.355 Z" id="like-[#1385]">
                                      </path>
                                  </g>
                              </g>
                          </g>
                      </svg>
                    )}
                    <p className="text-lg">{likes}</p>
                  </div>

                  {/* dislikes */}
                  <div className="flex items-center gap-2"
                    // onClick={() => handleDislike(comment.id)}
                  >
                    {userid && comment.lnd?.dislikes?.[userid] ? (
                      <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g id="Dribbble-Light-Preview" transform="translate(-179.000000, -760.000000)" fill={fontcolor}>
                            <g id="icons" transform="translate(56.000000, 160.000000)">
                              <path d="M139.800374,612 L144.00037,612 L144.00037,600 L139.800374,600 L139.800374,612 Z M127.698085,600 L137.700376,600 L137.700376,611.979 L135.894378,618.174 C135.725328,619.224 134.776129,620 133.66103,620 C132.412581,620 131.400381,619.036 131.400381,617.847 L131.400381,612 L125.873186,612 C124.026238,612 122.659139,610.358 123.074939,608.644 L124.899837,602.109 C125.200137,600.868 126.360386,600 127.698085,600 L127.698085,600 Z" id="dislike-[#1387]">
                              </path>
                            </g>
                          </g>
                        </g>
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g id="Dribbble-Light-Preview" transform="translate(-179.000000, -760.000000)" fill="none" stroke={fontcolor} strokeWidth="1.5">
                            <g id="icons" transform="translate(56.000000, 160.000000)">
                              <path d="M139.800374,612 L144.00037,612 L144.00037,600 L139.800374,600 L139.800374,612 Z M127.698085,600 L137.700376,600 L137.700376,611.979 L135.894378,618.174 C135.725328,619.224 134.776129,620 133.66103,620 C132.412581,620 131.400381,619.036 131.400381,617.847 L131.400381,612 L125.873186,612 C124.026238,612 122.659139,610.358 123.074939,608.644 L124.899837,602.109 C125.200137,600.868 126.360386,600 127.698085,600 L127.698085,600 Z" id="dislike-[#1387]">
                              </path>
                            </g>
                          </g>
                        </g>
                      </svg>
                    )}
                    <p className="text-lg">{dislikes}</p>
                  </div>

                  {/* Reply Button */}
                  <div 
                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                    className="cursor-pointer"
                  >
                    Reply
                  </div>
                </div>
              </div>
              {/* expand comments */}
              <div
                onClick={() =>
                  setOpenReplies(prev => ({
                    ...prev,
                    [comment.id]: !prev[comment.id]
                  }))
                }

                style={{background: details[0].theme}} className={`${comment.has_comments? "":"hidden"} ml-3 absolute w-6 h-6 self-end border-2 overflow-clip rounded-full cursor-pointer`}>
                <div className="flex items-center h-full justify-self-center">
                  {openReplies[comment.id] ? "—" : "+"}
                </div>
              </div>
            </div>
            {/* Reply input */}
            {replyTo === comment.id && (
              <div style={{ color: fontcolor }} className="w-full">
                {userdata ? (
                  <>
                    <div style={{ color: fontcolor }} className="flex mt-2 items-center w-full">
                      <div className="w-12 h-12 self-start overflow-clip rounded-full">
                        <img
                          src={userdata[0].profile}
                          alt={userdata[0].username}
                          className="object-cover rounded-lg"
                          sizes="96px"
                        />
                      </div>
                      <textarea
                        ref={replyTextareaRef}
                        placeholder="Add a reply..."
                        value={replyComment}
                        onChange={(e) => {
                          setReplyComment(e.target.value);

                          const el = replyTextareaRef.current;
                          if (el) {
                            el.style.height = "auto";  // reset
                            el.style.height = el.scrollHeight + "px"; // grow
                          }
                        }}
                        rows={1}
                        className="flex-grow mx-4 mb-2 resize-none overflow-hidden border-b-2 border-current bg-transparent focus:outline-none"
                      />
                    </div>
                    <div className="flex w-full justify-between items-center">
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
                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyComment("");
                            setReplyTo(null);
                          }}
                          className="mr-4 px-4 py-2 text-white bg-gray-500 rounded-full cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            postComment(post.id, replyComment, comment.id, prvt); // pass parent_comment_id
                            setReplyComment("");
                            setReplyTo(null);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ color: fontcolor, opacity: "50%" }}>
                    Sign-in to post a reply
                  </div>
                )}
              </div>
            )}
            <div className={`${openReplies[comment.id] ? "block" : "hidden"} relative ml-13.75 w-full`}>
              <NestedReplies
                parentId={comment.id}
                fontcolor={fontcolor}
                userdata={userdata}
                postId={post.id}
                setReplyTo={setReplyTo}
                replyComment={replyComment}
                setReplyComment={setReplyComment}
                prvt={prvt}
                setPrivate={setPrivate}
                showDisclamer={showDisclamer}
                disclamer={disclamer}
                postComment={postComment}
              />
            </div>
            <div className="h-6"/>
          </div>
        ))
      ) : (
        <p>There are no comments yet</p>
      )}
    </div>
  );
}

type NestedRepliesProps = {
  parentId: string;
  fontcolor: string;
  userdata: UserData[] | null;
  postId: string;
  setReplyTo: (id: string | null) => void;
  replyComment: string;
  setReplyComment: (val: string) => void;
  prvt: boolean;
  setPrivate: (val: boolean) => void;
  showDisclamer: (val: boolean) => void;
  disclamer: boolean;
  postComment: (
    postId: string,
    commentText: string,
    parentCommentId: unknown,
    anonymous: boolean
  ) => Promise<void>;
};

function NestedReplies(props: NestedRepliesProps) {
  const {
    parentId,
    fontcolor,
    userdata,
    postId,
    setReplyTo,
    replyComment,
    setReplyComment,
    prvt,
    setPrivate,
    showDisclamer,
    disclamer,
    postComment,
  } = props;
  
  const [openReplies1, setOpenReplies1] = useState<{ [key: string]: boolean }>({});
  
  const gotoUser = (dir:string, anon:boolean) => {
    if (anon) return;
    window.location.href = "/u/"+dir;
  }

  const [nestedComments, setNestedComments] = useState<Comments[]>([]);
  const [likesState, setLikesState] = useState<Record<string, number>>({});
  const [dislikesState, setDislikesState] = useState<Record<string, number>>({});
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  async function fetchNested() {
    try {
      const res = await fetch(
        `/api/posts/comments?parentId=${parentId}&postId=${postId}&offset=${offset}`
      );
      const json = await res.json();

      const newComments: Comments[] = json.comments;
      const hasMore: boolean = json.hasMore;

      // Append instead of overwrite
      setNestedComments(prev => [...prev, ...newComments]);

      // Update like/dislike state only for newly loaded comments
      setLikesState(prev => {
        const copy = { ...prev };
        newComments.forEach(c => (copy[c.id] = c.likes));
        return copy;
      });

      setDislikesState(prev => {
        const copy = { ...prev };
        newComments.forEach(c => (copy[c.id] = c.dislikes));
        return copy;
      });

      // Move offset forward
      setOffset(prev => prev + newComments.length);

      // Set hasMore (so UI can hide "show more")
      setHasMore(hasMore);

    } catch (error) {
      console.error("Failed to fetch nested comments:", error);
    }
  }

  useEffect(() => {
    fetchNested();
  }, [parentId, postId]);

  
  const loadMore = () => {
    fetchNested();
  }

  if (!nestedComments.length) return null;

  const handleLike = (commentId: string) => {
    setLikesState(prev => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
  };

  const handleDislike = (commentId: string) => {
    setDislikesState(prev => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
  };

  return (
    <div>
      <div className="absolute border-l-2 w-full h-6 rounded-b-2xl"/>
      <div className="h-1"/>
      {nestedComments.map((comment, idx) => (
        <div key={`lvl2-${parentId}-${comment.id}-${idx}`}className="ml-4 w-full justify-between relative select-none">
          {/* Avatar */}
          <div className="absolute bg-black w-10 h-10 self-start overflow-clip rounded-full">
            <img
              src={comment.anonymous ? "/anon.png" : comment.profile}
              alt={comment.username}
              className="object-cover rounded-lg"
              sizes="80px"
            />
          </div>

          {/* Comment content */}
          <div className="flex-grow ml-4.75 pt-4 pl-8 border-l-2">
            <p 
              onClick={() => gotoUser(comment.username, comment.anonymous)}
              style={{ color: fontcolor }}
              className={`text-sm w-fit ${comment.anonymous? "":"cursor-pointer"}`}>
              {comment.anonymous ? "anonymous" : comment.username} •{" "}
              {new Date(comment.created_at).toLocaleString()}
            </p>
            <div className="pt-2 pl-4">
              <p style={{ color: fontcolor }} className="text-sm">
                {comment.content}
              </p>
            </div>

            {/* Likes / Dislikes / Reply */}
            <div style={{ color: fontcolor }} className="flex gap-4 mt-2 items-center">
              <div className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleLike(comment.id)}>
                {userid && comment.lnd?.likes?.[userid] ? (
                  <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -760.000000)" fill={fontcolor}>
                              <g id="icons" transform="translate(56.000000, 160.000000)">
                                  <path d="M203,620 L207.200006,620 L207.200006,608 L203,608 L203,620 Z M223.924431,611.355 L222.100579,617.89 C221.799228,619.131 220.638976,620 219.302324,620 L209.300009,620 L209.300009,608.021 L211.104962,601.825 C211.274012,600.775 212.223214,600 213.339366,600 C214.587817,600 215.600019,600.964 215.600019,602.153 L215.600019,608 L221.126177,608 C222.97313,608 224.340232,609.641 223.924431,611.355 L223.924431,611.355 Z" id="like-[#1385]">
                                  </path>
                              </g>
                          </g>
                      </g>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                          <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -760.000000)" fill="none" stroke={fontcolor} strokeWidth="1.5">
                              <g id="icons" transform="translate(56.000000, 160.000000)">
                                  <path d="M203,620 L207.200006,620 L207.200006,608 L203,608 L203,620 Z M223.924431,611.355 L222.100579,617.89 C221.799228,619.131 220.638976,620 219.302324,620 L209.300009,620 L209.300009,608.021 L211.104962,601.825 C211.274012,600.775 212.223214,600 213.339366,600 C214.587817,600 215.600019,600.964 215.600019,602.153 L215.600019,608 L221.126177,608 C222.97313,608 224.340232,609.641 223.924431,611.355 L223.924431,611.355 Z" id="like-[#1385]">
                                  </path>
                              </g>
                          </g>
                      </g>
                  </svg>
                )}
                {likesState[comment.id] || 0}
              </div>
              <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleDislike(comment.id)}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 16 16"
                  fill={fontcolor}
                  aria-hidden="true"
                  style={{ color: fontcolor}}
                >
                  <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1" />
                </svg>
                {dislikesState[comment.id] || 0}
              </div>
              <div className="cursor-pointer" onClick={() => setActiveReply(activeReply === comment.id ? null : comment.id)}>
                Reply
              </div>
            </div>

            {/* Reply input */}
            {activeReply === comment.id && (
              <div style={{ color: fontcolor }} className="w-full mt-2">
                {userdata ? (
                  <>
                    <div className="flex mt-2 items-center w-full">
                      <div className="w-10 h-10 self-start overflow-clip rounded-full">
                        <img
                          src={userdata[0].profile}
                          alt={userdata[0].username}
                          className="object-cover rounded-lg"
                          sizes="80px"
                        />
                      </div>
                      <textarea
                        ref={replyTextareaRef}
                        placeholder="Add a reply..."
                        value={replyComment}
                        onChange={(e) => {
                          setReplyComment(e.target.value);
                          const el = replyTextareaRef.current;
                          if (el) {
                            el.style.height = "auto";
                            el.style.height = el.scrollHeight + "px";
                          }
                        }}
                        rows={1}
                        className="flex-grow mx-4 mb-2 resize-none overflow-hidden border-b-2 border-current bg-transparent focus:outline-none"
                      />
                    </div>
                    <div className="flex w-full justify-between items-center">
                      <div className="flex">
                        Post anonymously
                        <div
                          onClick={() => setPrivate(!prvt)}
                          onMouseEnter={() => showDisclamer(true)}
                          onMouseLeave={() => showDisclamer(false)}
                          className={`w-12 h-6 flex items-center rounded-full ml-2 p-1 cursor-pointer transition-colors
                          ${prvt ? "bg-[#1F1E3D]" : "bg-gray-400"}`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
                            ${prvt ? "translate-x-6" : "translate-x-0"}`}
                          />
                        </div>
                      </div>
                      <div className="flex">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyComment("");
                            setActiveReply(null);
                            setReplyTo(null);
                          }}
                          className="mr-4 px-4 py-2 text-white bg-gray-500 rounded-full cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            postComment(postId, replyComment, comment.id, prvt);
                            setReplyComment("");
                            setActiveReply(null);
                            setReplyTo(null);
                          }}
                          className="px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ color: fontcolor, opacity: "50%" }}>
                    Sign-in to post a reply
                  </div>
                )}
              </div>
            )}
          </div>
          {/* expand comments */}
          <div 
            onClick={() =>
              setOpenReplies1(prev => ({
                ...prev,
                [comment.id]: !prev[comment.id]
              }))
            }
            style={{background: theme}} className={`${comment.has_comments? "":"hidden"} ml-2 absolute w-6 h-6 self-end border-2 overflow-clip rounded-full cursor-pointer`}>
            <div className="flex items-center h-full justify-self-center">
              {openReplies1[comment.id] ? "—" : "+"}
            </div>
          </div>
          <div className="ml-4.75">
            <div className={`${openReplies1[comment.id] ? "block" : "hidden"} pt-2`}>
              <NestedReplies2
                parentId={comment.id}
                fontcolor={fontcolor}
                userdata={userdata}
                postId={postId}
                setReplyTo={setReplyTo}
                replyComment={replyComment}
                setReplyComment={setReplyComment}
                prvt={prvt}
                setPrivate={setPrivate}
                showDisclamer={showDisclamer}
                disclamer={disclamer}
                postComment={postComment}
              />
            </div>
            <div className=" border-l-2 h-4" />
          </div>
        </div>
      ))}
      <div>
        {hasMore? (
          <div
            onClick={() => loadMore()}
            className="absolute ml-12 mt-1.5 justify-self-start border-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-500/50 select-none"
          >
            load more comments
          </div>
        ):(
          <div
            className="absolute ml-12 mt-1.5 justify-self-start border-2 border-gray-500 px-3 py-1 rounded-full select-none"
          >
            no more comments
          </div>
        )}
        <div className="ml-8.75 border-l-2 h-6 rounded-b-2xl" />
      </div>
    </div>
  );
}

function NestedReplies2(props: NestedRepliesProps) {
  const {
    parentId,
    fontcolor,
    userdata,
    postId,
    setReplyTo,
    replyComment,
    setReplyComment,
    prvt,
    setPrivate,
    showDisclamer,
    disclamer,
    postComment,
  } = props;
  
  const gotoUser = (dir:string, anon:boolean) => {
    if (anon) return;
    window.location.href = "/u/"+dir;
  }
  const pathname = usePathname();
  const [nestedComments, setNestedComments] = useState<Comments[]>([]);
  const [likesState, setLikesState] = useState<Record<string, number>>({});
  const [dislikesState, setDislikesState] = useState<Record<string, number>>({});
  const [activeReply, setActiveReply] = useState<string | null>(null);
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  async function fetchNested() {
    try {
      const res = await fetch(
        `/api/posts/comments?parentId=${parentId}&postId=${postId}&offset=${offset}`
      );
      const json = await res.json();

      const newComments: Comments[] = json.comments;
      const hasMore: boolean = json.hasMore;

      // Append instead of overwrite
      setNestedComments(prev => [...prev, ...newComments]);

      // Update like/dislike state only for newly loaded comments
      setLikesState(prev => {
        const copy = { ...prev };
        newComments.forEach(c => (copy[c.id] = c.likes));
        return copy;
      });

      setDislikesState(prev => {
        const copy = { ...prev };
        newComments.forEach(c => (copy[c.id] = c.dislikes));
        return copy;
      });

      // Move offset forward
      setOffset(prev => prev + newComments.length);

      // Set hasMore (so UI can hide "show more")
      setHasMore(hasMore);

    } catch (error) {
      console.error("Failed to fetch nested comments:", error);
    }
  }

  useEffect(() => {
    fetchNested();
  }, [parentId, postId]);

  
  const loadMore = () => {
    fetchNested();
  }

  if (!nestedComments.length) return null;

  const handleLike = (commentId: string) => {
    setLikesState(prev => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
  };

  const handleDislike = (commentId: string) => {
    setDislikesState(prev => ({ ...prev, [commentId]: (prev[commentId] || 0) + 1 }));
  };

  return (
    <div>
      <div className="absolute border-l-2 w-full h-6 rounded-b-2xl"/>
      <div className="h-1"/>
      <div className="border-l-2">
          {nestedComments.map((comment, idx) => (
            <div key={`lvl2-${parentId}-${comment.id}-${idx}`}className="ml-4 w-full justify-between relative select-none">
              {/* Avatar */}
              <div className="absolute bg-black w-10 h-10 self-start overflow-clip rounded-full">
                <img
                  src={comment.anonymous ? "/anon.png" : comment.profile}
                  alt={comment.username}
                  className="object-cover rounded-lg"
                  sizes="80px"
                />
              </div>

              {/* Comment content */}
              <div className="flex-grow ml-4.75 pt-4 pl-8 border-l-2">
                <p 
                  onClick={() => gotoUser(comment.username, comment.anonymous)}
                  style={{ color: fontcolor }}
                  className={`text-sm w-fit ${comment.anonymous? "":"cursor-pointer"}`}>
                  {comment.anonymous ? "anonymous" : comment.username} •{" "}
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                <div className="pt-2 pl-4">
                  <p style={{ color: fontcolor }} className="text-sm">
                    {comment.content}
                  </p>
                </div>

                {/* Likes / Dislikes / Reply */}
                <div style={{ color: fontcolor }} className="flex gap-4 mt-2 items-center">
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleLike(comment.id)}>
                    {userid && comment.lnd?.likes?.[userid] ? (
                      <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                          <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                              <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -760.000000)" fill={fontcolor} stroke={fontcolor} strokeWidth="1.5">
                                  <g id="icons" transform="translate(56.000000, 160.000000)">
                                      <path d="M203,620 L207.200006,620 L207.200006,608 L203,608 L203,620 Z M223.924431,611.355 L222.100579,617.89 C221.799228,619.131 220.638976,620 219.302324,620 L209.300009,620 L209.300009,608.021 L211.104962,601.825 C211.274012,600.775 212.223214,600 213.339366,600 C214.587817,600 215.600019,600.964 215.600019,602.153 L215.600019,608 L221.126177,608 C222.97313,608 224.340232,609.641 223.924431,611.355 L223.924431,611.355 Z" id="like-[#1385]">
                                      </path>
                                  </g>
                              </g>
                          </g>
                      </svg>
                    ) : (
                      <svg width="22" height="22" viewBox="0 -0.5 21 21" version="1.1" xmlns="http://www.w3.org/2000/svg">
                          <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                              <g id="Dribbble-Light-Preview" transform="translate(-259.000000, -760.000000)" fill="none" stroke={fontcolor} strokeWidth="1.5">
                                  <g id="icons" transform="translate(56.000000, 160.000000)">
                                      <path d="M203,620 L207.200006,620 L207.200006,608 L203,608 L203,620 Z M223.924431,611.355 L222.100579,617.89 C221.799228,619.131 220.638976,620 219.302324,620 L209.300009,620 L209.300009,608.021 L211.104962,601.825 C211.274012,600.775 212.223214,600 213.339366,600 C214.587817,600 215.600019,600.964 215.600019,602.153 L215.600019,608 L221.126177,608 C222.97313,608 224.340232,609.641 223.924431,611.355 L223.924431,611.355 Z" id="like-[#1385]">
                                      </path>
                                  </g>
                              </g>
                          </g>
                      </svg>
                    )}
                    {likesState[comment.id] || 0}
                  </div>
                  <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleDislike(comment.id)}>
                    {userid && comment.lnd?.dislikes?.[userid] ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 16 16"
                        fill={fontcolor}
                        aria-hidden="true"
                        style={{ color: fontcolor}}
                      >
                        <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1" />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 16 16"
                        fill={fontcolor}
                        aria-hidden="true"
                        style={{ color: fontcolor}}
                      >
                        <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856s-.036.586-.113.856c-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a10 10 0 0 1-.443-.05 9.36 9.36 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a9 9 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581s-.027-.414-.075-.581c-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.2 2.2 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.9.9 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1" />
                      </svg>
                    )}
                    {dislikesState[comment.id] || 0}
                  </div>
                  <div className="cursor-pointer" onClick={() => setActiveReply(activeReply === comment.id ? null : comment.id)}>
                    Reply
                  </div>
                </div>

                {/* Reply input */}
                {activeReply === comment.id && (
                  <div style={{ color: fontcolor }} className="w-full mt-2">
                    {userdata ? (
                      <>
                        <div className="flex mt-2 items-center w-full">
                          <div className="w-10 h-10 self-start overflow-clip rounded-full">
                            <img
                              src={userdata[0].profile}
                              alt={userdata[0].username}
                              className="object-cover rounded-lg"
                              sizes="80px"
                            />
                          </div>
                          <textarea
                            ref={replyTextareaRef}
                            placeholder="Add a reply..."
                            value={replyComment}
                            onChange={(e) => {
                              setReplyComment(e.target.value);
                              const el = replyTextareaRef.current;
                              if (el) {
                                el.style.height = "auto";
                                el.style.height = el.scrollHeight + "px";
                              }
                            }}
                            rows={1}
                            className="flex-grow mx-4 mb-2 resize-none overflow-hidden border-b-2 border-current bg-transparent focus:outline-none"
                          />
                        </div>
                        <div className="flex w-full justify-between items-center">
                          <div className="flex">
                            Post anonymously
                            <div
                              onClick={() => setPrivate(!prvt)}
                              onMouseEnter={() => showDisclamer(true)}
                              onMouseLeave={() => showDisclamer(false)}
                              className={`w-12 h-6 flex items-center rounded-full ml-2 p-1 cursor-pointer transition-colors
                              ${prvt ? "bg-[#1F1E3D]" : "bg-gray-400"}`}
                            >
                              <div
                                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform
                                ${prvt ? "translate-x-6" : "translate-x-0"}`}
                              />
                            </div>
                          </div>
                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => {
                                setReplyComment("");
                                setActiveReply(null);
                                setReplyTo(null);
                              }}
                              className="mr-4 px-4 py-2 text-white bg-gray-500 rounded-full cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                postComment(postId, replyComment, comment.id, prvt);
                                setReplyComment("");
                                setActiveReply(null);
                                setReplyTo(null);
                              }}
                              className="px-4 py-2 bg-blue-500 text-white rounded-full cursor-pointer"
                            >
                              Post
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: fontcolor, opacity: "50%" }}>
                        Sign-in to post a reply
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* expand comments */}
              <div 
                onClick={() =>
                  window.location.href = `${pathname}/comment/${comment.id}`
                }
                style={{background: theme}} className={`${comment.has_comments? "":"hidden"} ml-2 absolute w-6 h-6 self-end border-2 overflow-clip rounded-full cursor-pointer`}>
                <div className="flex items-center h-full justify-self-center">
                  +
                </div>
              </div>
              <div className="ml-4.75">
                <div className=" border-l-2 h-4" />
              </div>
            </div>
          ))}
        <div>
          {hasMore? (
            <div
              onClick={() => loadMore()}
              className="absolute ml-12 mt-1.5 justify-self-start border-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-500/50 select-none"
            >
              load more comments
            </div>
          ):(
            <div
              className="absolute ml-12 mt-1.5 justify-self-start border-2 border-gray-500 px-3 py-1 rounded-full select-none"
            >
              no more comments
            </div>
          )}
          <div className="ml-8.75 border-l-2 h-6 rounded-b-2xl" />
        </div>
      </div>
    </div>
  );
}