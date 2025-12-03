"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

type LikesDislikesDetails = {
  likes: Record<string, { timestamp: string }>;
  dislikes: Record<string, { timestamp: string }>;
};

type Post = {
  id: string;
  title: string;
  content: string;
  created_at: string;
  username: string;
  likes: number;
  dislikes: number;
  lnd: LikesDislikesDetails;
  images: string[];
  user_deleted: boolean;
  mod_deleted: boolean;
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
};

type Mod = {
  userId: string;
  username: string;
  role: string;
  perms: {
    all: boolean;
    mute: boolean;
    announce: boolean;
    pagedetails: boolean;
    delete_posts: boolean;
    delete_comments: boolean;
    roles_management: boolean;
    adviser: boolean;
  };
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

let theme: string;
let userid: string;

export default function PostView({ post, myModData, details, userdata }: { post: Post, myModData: Mod|null, details: Details[], userdata: UserData[]|null }) {
  theme = details[0].theme;
  userid = userdata ? userdata[0].id : "";

  const images = post.images || [];
  const [current, setCurrent] = useState(0);
  const length = images.length;

  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);

  // --- Post reactions from lnd ---
  const [postLikes, setPostLikes] = useState(Object.keys(post.lnd?.likes || {}).length);
  const [postDislikes, setPostDislikes] = useState(Object.keys(post.lnd?.dislikes || {}).length);
  const [userReacted, setUserReacted] = useState<{ liked: boolean; disliked: boolean }>({
    liked: userid ? !!post.lnd.likes[userid] : false,
    disliked: userid ? !!post.lnd.dislikes[userid] : false,
  });

  const [comment, setComment] = useState("");
  const [prvt, setPrivate] = useState(false);
  const [disclamer, showDisclamer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [replyTo, setReplyTo] = useState<string | null>(null); // comment id being replied to
  const [replyComment, setReplyComment] = useState("");
  const replyTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  // --- DROPDOWN OPTIONS --- //
  const [optionsDropdown, setOptionsDropdown] = useState<string | null>(null);

  // --- reporting consts --- //
  const [reportWindow ,openReportWindow] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportCommentId, setReportCommentId] = useState("");
  const [reportUsername, setReportUsername] = useState("");
  const pageType = usePathname().startsWith("/o")? "organization":"categories"

  // --- deleting post --- ///
  const [deleteWindow, openDeleteWindow] = useState(false);

  const [userReactState, setUserReactState] = useState<{
    [commentId: string]: { liked: boolean; disliked: boolean }
  }>({});

  

  // --- Set background color ---
  useEffect(() => {
    const prev = document.body.style.backgroundColor;
    document.body.style.backgroundColor = details[0].theme;
    return () => { document.body.style.backgroundColor = prev; };
  }, [details[0].theme]);

  // --- Font color logic ---
  let fontcolor = "black";
  const hexColor = details[0].theme.startsWith("#") ? details[0].theme.slice(1) : details[0].theme;
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (brightness < 128) fontcolor = "lightgray";

  const autoResize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  };
  useEffect(() => autoResize(), []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment(e.target.value);
    autoResize();
  };

  const reactPost = async (action: "like" | "dislike") => {
    if (!userid) return;

    // Optimistic UI update
    if (action === "like") {
      setPostLikes(userReacted.liked ? postLikes - 1 : postLikes + 1);
      if (userReacted.disliked) setPostDislikes(postDislikes - 1);
      setUserReacted({ liked: !userReacted.liked, disliked: false });
    } else {
      setPostDislikes(userReacted.disliked ? postDislikes - 1 : postDislikes + 1);
      if (userReacted.liked) setPostLikes(postLikes - 1);
      setUserReacted({ liked: false, disliked: !userReacted.disliked });
    }

    try {
      const res = await fetch("/api/posts/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, action }),
      });

      if (!res.ok) {
        console.error("Failed to react:", res.status);
        return;
      }

      const data = await res.json();

      // Reconcile with server response
      setPostLikes(data.likes);
      setPostDislikes(data.dislikes);
      setUserReacted(data.userReacted);

    } catch (error) {
      console.error("Error reacting to post:", error);
      // Optionally revert optimistic update on error
    }
  };

  const postComment = async (postId: string, commentText: string, parentCommentId: unknown, anonymous: boolean) => {
    if (!commentText.trim()) return alert("Comment cannot be empty");
    try {
      const res = await fetch("/api/posts/post_comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, comment: commentText, parentCommentId, anonymous }),
      });
      const data = await res.json();
      if (data.success) {
        setComment("");
        window.location.reload();
      } else alert(data.message || "Failed to post comment");
    } catch (err) {
      console.error(err);
      alert("Error posting comment");
    }
  };

  // --- reporting
  async function sendReport() {
    if(reportReason == "") {
      alert("Please enter the reason for the report");
      return;
    } 

    const commentId = "";
    try {
      const res = await fetch(`/api/reporting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, commentId: commentId, reason: reportReason, pageType: pageType}),
      });

      if (res.ok) {
        // Successfully report
        alert("Successfully Reported"); 
        openReportWindow(false);
        setReportReason("");
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to report: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to report:", err);
      alert("An error occurred while reporting.");
    }
  }

  // --- deleting
  async function DeletePost() {    
    try {
      const res = await fetch(`/api/deletePost`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId:post.id, Mod: myModData?.userId ?? null }),
      });

      if (res.ok) {
        // Successfully Delete
        alert("Successfully Deleted Post"); 
        openDeleteWindow(false);
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to delete post: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("An error occurred while deleting post.");
    }
  }

  return (<>
    {/* Report Modal */}
    <div onClick={() => {openReportWindow(false), setReportCommentId("")}} className={`${reportWindow? "":"hidden"} fixed flex justify-center items-center z-40 top-0 left-0 w-full h-full bg-black/50`}>
      <div 
      onClick={(e) => e.stopPropagation()}
      className="relative p-4 w-xs h-fit bg-slate-300 dark:bg-slate-800 rounded-2xl"
      >
        <h1 className="text-2xl select-none">Report {reportUsername}</h1>
        <p className="text-gray-500">Please tell us the reason why you are reporting.</p>
        <textarea
        onChange={(e) => setReportReason(e.target.value)}
        value={reportReason}
        className="mt-4 w-full p-1 min-h-24 border-2 border-gray-500"
        />
        <div className={`flex pt-5 w-full justify-end`}>
          <button 
            type="button" 
            onClick={() => {
              openReportWindow(false)
              setReportCommentId("")
            }}
            className="px-4 py-2 select-none bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
          >Cancel</button>
          <button 
            type="button"
            onClick={() => sendReport()}
            className="ml-4 px-4 py-2 select-none bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-500">Report</button>
        </div>
      </div>
    </div>

    {/* Delete Modal */}
    <div onClick={() => {openDeleteWindow(false)}} className={`${deleteWindow? "":"hidden"} fixed flex justify-center items-center z-40 top-0 left-0 w-full h-full bg-black/50`}>
      <div 
      onClick={(e) => e.stopPropagation()}
      className="relative p-4 w-xs h-fit bg-slate-300 dark:bg-slate-800 rounded-2xl"
      >
        <h1 className="text-2xl select-none">Delete Comment</h1>
        <p className="text-gray-500">Are sure you to delete {userdata? (userdata[0].username == post.username? "this":post.username+"'s"):""} post?</p>
        <div className={`flex pt-5 w-full justify-end`}>
          <button 
            type="button" 
            onClick={() => {
              openDeleteWindow(false)
            }}
            className="px-4 py-2 select-none bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
          >Cancel</button>
          <button 
            type="button"
            onClick={() => DeletePost()}
            className="ml-4 px-4 py-2 select-none bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-500">Yes</button>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div id="title" className="p-4 b-6 rounded-lg w-full h-screen lg:max-w-7/9 lg:ml-12 mt-16 lg:p-16 lg:mt-6">
      {/* Title */}
      <div className="flex border-b-2 border-[#6C6C6C] justify-between w-full p-5 mb-3">
        <div>
          <p style={{ color: fontcolor }} className="text-3xl font-bold">{post.user_deleted || post.mod_deleted? "-- Removed --":post.title}</p>
          <p style={{ color: fontcolor }} className="text-sm">
            {post.user_deleted || post.mod_deleted? "Anonymous":post.username} — {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
        <div className={`${userdata || !post.user_deleted || !post.mod_deleted? "":"hidden"} right-0 h-10 justify-end items-end rounded-full`}>
          <div onClick={() => setOptionsDropdown(optionsDropdown === post.id ? null : post.id)} className={`justify-self-end w-10 h-10 overflow-clip rounded-full`}>
            <div className={`${userdata? "":"hidden"} flex hover:bg-gray-500/50 w-10 h-10 justify-center items-center rounded-full`}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
          <div className={`${optionsDropdown === post.id? "":"hidden"} w-fit z-50 justify-items-end relative bg-slate-300 dark:bg-slate-800 text-black dark:text-white`}>
            <div
            onClick={() => {openReportWindow(true)}}
            className="flex py-1 px-3 items-center cursor-pointer hover:bg-gray-500/50"
            >
              <svg width="32" height="32" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path style={{ stroke: "transparent", fill: fontcolor }} d="M7 12.5538H6.25C6.25 12.5713 6.25061 12.5888 6.25183 12.6062L7 12.5538ZM7.782 13.2398V12.4898C7.76683 12.4898 7.75167 12.4903 7.73653 12.4912L7.782 13.2398ZM17.217 13.2398L17.3055 12.4951C17.2761 12.4916 17.2466 12.4898 17.217 12.4898V13.2398ZM17.8805 12.9231L18.5153 13.3225V13.3225L17.8805 12.9231ZM17.879 12.1878L18.5121 11.7858C18.5046 11.7739 18.4967 11.7622 18.4885 11.7508L17.879 12.1878ZM15.943 9.48782L16.5526 9.05075L16.5467 9.04282L15.943 9.48782ZM15.943 8.75682L16.5468 9.20187L16.5525 9.19386L15.943 8.75682ZM17.879 6.05682L18.4885 6.49386C18.4967 6.48242 18.5046 6.47075 18.5121 6.45887L17.879 6.05682ZM17.8805 5.32159L18.5153 4.92214L18.5153 4.92214L17.8805 5.32159ZM17.217 5.00482V5.75482C17.2466 5.75482 17.2761 5.75307 17.3055 5.74958L17.217 5.00482ZM7.782 5.00482L7.73653 5.75344C7.75167 5.75436 7.76683 5.75482 7.782 5.75482V5.00482ZM7 5.69082L6.25183 5.63841C6.25061 5.65586 6.25 5.67334 6.25 5.69082H7ZM7.75 12.5538C7.75 12.1396 7.41421 11.8038 7 11.8038C6.58579 11.8038 6.25 12.1396 6.25 12.5538H7.75ZM6.25 19.0048C6.25 19.419 6.58579 19.7548 7 19.7548C7.41421 19.7548 7.75 19.419 7.75 19.0048H6.25ZM6.25183 12.6062C6.30892 13.4212 7.01201 14.038 7.82747 13.9884L7.73653 12.4912C7.73632 12.4912 7.73688 12.4912 7.73797 12.4913C7.73901 12.4915 7.74008 12.4917 7.74107 12.4921C7.74295 12.4927 7.74396 12.4935 7.74445 12.4939C7.74494 12.4943 7.74581 12.4952 7.7467 12.497C7.74718 12.498 7.74758 12.499 7.74786 12.5C7.74815 12.5011 7.74818 12.5016 7.74817 12.5014L6.25183 12.6062ZM7.782 13.9898H17.217V12.4898H7.782V13.9898ZM17.1285 13.9846C17.6798 14.0501 18.2196 13.7924 18.5153 13.3225L17.2457 12.5236C17.2585 12.5034 17.2818 12.4922 17.3055 12.4951L17.1285 13.9846ZM18.5153 13.3225C18.811 12.8526 18.8098 12.2545 18.5121 11.7858L17.2459 12.5899C17.233 12.5697 17.233 12.5439 17.2457 12.5236L18.5153 13.3225ZM18.4885 11.7508L16.5525 9.05079L15.3335 9.92486L17.2695 12.6249L18.4885 11.7508ZM16.5467 9.04282C16.5816 9.09009 16.5816 9.15455 16.5467 9.20183L15.3393 8.31182C14.984 8.79376 14.984 9.45088 15.3393 9.93283L16.5467 9.04282ZM16.5525 9.19386L18.4885 6.49386L17.2695 5.61979L15.3335 8.31979L16.5525 9.19386ZM18.5121 6.45887C18.8098 5.99018 18.811 5.39204 18.5153 4.92214L17.2457 5.72104C17.233 5.70078 17.233 5.67499 17.2459 5.65478L18.5121 6.45887ZM18.5153 4.92214C18.2196 4.45224 17.6798 4.19454 17.1285 4.26007L17.3055 5.74958C17.2818 5.75241 17.2585 5.7413 17.2457 5.72104L18.5153 4.92214ZM17.217 4.25482H7.782V5.75482H17.217V4.25482ZM7.82747 4.2562C7.01201 4.20667 6.30892 4.82344 6.25183 5.63841L7.74817 5.74323C7.74818 5.74303 7.74815 5.74359 7.74786 5.74465C7.74758 5.74566 7.74718 5.74669 7.7467 5.74762C7.74581 5.7494 7.74494 5.7503 7.74445 5.75073C7.74396 5.75116 7.74295 5.75191 7.74107 5.75257C7.74008 5.75291 7.73901 5.75317 7.73797 5.75332C7.73688 5.75347 7.73632 5.75343 7.73653 5.75344L7.82747 4.2562ZM6.25 5.69082V12.5538H7.75V5.69082H6.25ZM6.25 12.5538V16.2987H7.75V12.5538H6.25ZM6.25 16.2987V19.0048H7.75V16.2987H6.25Z" fill="#000000"/>
              </svg>
              <p>Report</p>
            </div>
            <div
            onClick={() => {openDeleteWindow(true)}}
            className={`
              ${userdata
                ? (
                    userdata[0]?.username === post.username
                      ? ""
                      : (
                          myModData?.perms?.delete_posts
                            ? ""
                            : "hidden"
                        )
                  )
                : "hidden"
              }
              flex py-1 px-3 items-center cursor-pointer hover:bg-gray-500/50`}
            >
              <svg width="22" height="22" viewBox="-3 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                <g id="Page-1" stroke="none" strokeWidth="1.5" fill="none" fillRule="evenodd">
                  <g id="Icon-Set-Filled" transform="translate(-261.000000, -205.000000)" className="stroke-current">
                    <path d="M268,220 C268,219.448 268.448,219 269,219 C269.552,219 270,219.448 270,220 L270,232 C270,232.553 269.552,233 269,233 C268.448,233 268,232.553 268,232 L268,220 L268,220 Z M273,220 C273,219.448 273.448,219 274,219 C274.552,219 275,219.448 275,220 L275,232 C275,232.553 274.552,233 274,233 C273.448,233 273,232.553 273,232 L273,220 L273,220 Z M278,220 C278,219.448 278.448,219 279,219 C279.552,219 280,219.448 280,220 L280,232 C280,232.553 279.552,233 279,233 C278.448,233 278,232.553 278,232 L278,220 L278,220 Z M263,233 C263,235.209 264.791,237 267,237 L281,237 C283.209,237 285,235.209 285,233 L285,217 L263,217 L263,233 L263,233 Z M277,209 L271,209 L271,208 C271,207.447 271.448,207 272,207 L276,207 C276.552,207 277,207.447 277,208 L277,209 L277,209 Z M285,209 L279,209 L279,207 C279,205.896 278.104,205 277,205 L271,205 C269.896,205 269,205.896 269,207 L269,209 L263,209 C261.896,209 261,209.896 261,211 L261,213 C261,214.104 261.895,214.999 262.999,215 L285.002,215 C286.105,214.999 287,214.104 287,213 L287,211 C287,209.896 286.104,209 285,209 L285,209 Z" id="trash">
                    </path>
                  </g>
                </g>
              </svg>
              <p className="pl-2.5">Delete</p>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      {length > 0 || !post.user_deleted || !post.mod_deleted && (
        <div className="relative w-full overflow-hidden rounded-xl">
          <div className="flex bg-gray-500/30 transition-transform duration-500" style={{ transform: `translateX(-${current * 100}%)` }}>
            {images.map((img, idx) => (
              <img key={idx} src={img} alt={`Slide ${idx}`} className="w-full h-64 object-contain flex-shrink-0" />
            ))}
          </div>
          {length > 1 && (
            <>
              <button onClick={prevSlide} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">‹</button>
              <button onClick={nextSlide} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition">›</button>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="border-b-2 border-[#6C6C6C] flex-2 px-5 pt-2 pb-4">
        <p style={{ color: fontcolor }} className="text-lg">{post.mod_deleted? "Comment was deleted by a moderator.":(post.user_deleted? "User has deleted this comment":(post.content))}</p>
      </div>

      {/* Likes / Dislikes */}
      <div className={`${post.user_deleted || post.mod_deleted? "hidden":""} flex gap-6 ml-4 pt-5 items-center`}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => reactPost("like")}>
          {userReacted.liked ? (
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
          <p style={{color: fontcolor}} className="text-lg">{postLikes}</p>
        </div>

        <div className="flex items-center gap-2 cursor-pointer" onClick={() => reactPost("dislike")}>
          {userReacted.disliked ? (
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
          <p style={{color: fontcolor}} className="text-lg">{postDislikes}</p>
        </div>
      </div>

      {/* Comment input */}
      <div style={{ color: fontcolor}} className={`${post.user_deleted || post.mod_deleted? "hidden":""} flex mt-5 mb-8 items-center w-full`}>
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

      {/* Comments Section */}
      <MainComments
        myModData={myModData}
        parentId={post.id}
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
  </>);
}

type NestedRepliesProps = {
  myModData: Mod|null;
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

function MainComments(props: NestedRepliesProps) {
  const {
    myModData,
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

  // --- DROPDOWN OPTIONS --- //
  const [optionsDropdown, setOptionsDropdown] = useState<string | null>(null);

  // --- reporting consts --- //
  const [reportWindow ,openReportWindow] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportCommentId, setReportCommentId] = useState("");
  const [reportUsername, setReportUsername] = useState("");
  const pageType = usePathname().startsWith("/o")? "organization":"categories"

  // --- deliting comment --- ///
  const [deleteWindow, openDeleteWindow] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState("");
  const [deleteUsername, setDeleteUsername] = useState("");

  const [userReactState, setUserReactState] = useState<{
    [commentId: string]: { liked: boolean; disliked: boolean }
  }>({});

  async function fetchNested() {
    try {
      const res = await fetch(
        `/api/posts/main_comments?parentId=${parentId}&postId=${postId}&offset=${offset}`
      );
      const json = await res.json();

      const newComments: Comments[] = json.comments;
      const hasMore: boolean = json.hasMore;

      // Append instead of overwrite
      setNestedComments(prev => [...prev, ...newComments]);

      // Update user reactions
      setUserReactState(prev => {
        const copy = { ...prev };
        newComments.forEach(c => {
          copy[c.id] = {
            liked: c.lnd?.likes && Object.keys(c.lnd.likes).length
              ? Object.keys(c.lnd.likes).includes(userdata?.[0]?.id ?? "")
              : false,
            disliked: c.lnd?.dislikes && Object.keys(c.lnd.dislikes).length
              ? Object.keys(c.lnd.dislikes).includes(userdata?.[0]?.id ?? "")
              : false,
          };
        });
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

  useEffect(() => {
    if (!nestedComments.length) return;

    const newLikesState: Record<string, number> = {};
    const newDislikesState: Record<string, number> = {};

    nestedComments.forEach(comment => {
      newLikesState[comment.id] = Object.keys(comment.lnd?.likes || {}).length;
      newDislikesState[comment.id] = Object.keys(comment.lnd?.dislikes || {}).length;
    });

    setLikesState(newLikesState);
    setDislikesState(newDislikesState);
  }, [nestedComments]);

  
  const loadMore = () => {
    fetchNested();
  }

  if (!nestedComments.length) return null;

  const handleLike = async (commentId: string) => {
    const res = await fetch("/api/comments/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "like" })
    });

    const json = await res.json();
    if (!res.ok) return;

    setLikesState(prev => ({ ...prev, [commentId]: json.likes }));
    setDislikesState(prev => ({ ...prev, [commentId]: json.dislikes }));

    setUserReactState(prev => ({
      ...prev,
      [commentId]: {
        liked: json.userReacted.liked,
        disliked: json.userReacted.disliked
      }
    }));
  };

  const handleDislike = async (commentId: string) => {
    const res = await fetch("/api/comments/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "dislike" })
    });

    const json = await res.json();
    if (!res.ok) return;

    setLikesState(prev => ({ ...prev, [commentId]: json.likes }));
    setDislikesState(prev => ({ ...prev, [commentId]: json.dislikes }));

    setUserReactState(prev => ({
      ...prev,
      [commentId]: {
        liked: json.userReacted.liked,
        disliked: json.userReacted.disliked
      }
    }));
  };

  // --- reporting
  async function sendReport() {
    if(reportReason == "") {
      alert("Please enter the reason for the report");
      return;
    }
    
    try {
      const res = await fetch(`/api/reporting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postId, commentId: reportCommentId, reason: reportReason, pageType: pageType}),
      });

      if (res.ok) {
        // Successfully report
        alert("Successfully Reported"); 
        openReportWindow(false);
        setReportCommentId("");
        setReportUsername("");
        setReportReason("");
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to report: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to report:", err);
      alert("An error occurred while reporting.");
    }
  }

  // --- deleting
  async function DeleteComment() {    
    try {
      const res = await fetch(`/api/deleteComment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: deleteCommentId, postId:postId, Mod: myModData?.userId ?? null }),
      });

      if (res.ok) {
        // Successfully Delete
        alert("Successfully Deleted Comment"); 
        openReportWindow(false);
        setReportCommentId("");
        setReportUsername("");
        setReportReason("");
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to delete comment: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("An error occurred while deleting comment.");
    }
  }

  return (<>
    {/* Report Modal */}
    <div onClick={() => {openReportWindow(false), setReportCommentId("")}} className={`${reportWindow? "":"hidden"} fixed flex justify-center items-center z-40 top-0 left-0 w-full h-full bg-black/50`}>
      <div 
      onClick={(e) => e.stopPropagation()}
      className="relative p-4 w-xs h-fit bg-slate-300 dark:bg-slate-800 rounded-2xl"
      >
        <h1 className="text-2xl select-none">Report {reportUsername}</h1>
        <p className="text-gray-500">Please tell us the reason why you are reporting.</p>
        <textarea
        onChange={(e) => setReportReason(e.target.value)}
        value={reportReason}
        className="mt-4 w-full p-1 min-h-24 border-2 border-gray-500"
        />
        <div className={`flex pt-5 w-full justify-end`}>
          <button 
            type="button" 
            onClick={() => {
              openReportWindow(false)
              setReportCommentId("")
            }}
            className="px-4 py-2 select-none bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
          >Cancel</button>
          <button 
            type="button"
            onClick={() => sendReport()}
            className="ml-4 px-4 py-2 select-none bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-500">Report</button>
        </div>
      </div>
    </div>

    {/* Delete Modal */}
    <div onClick={() => {openDeleteWindow(false), setDeleteCommentId("")}} className={`${deleteWindow? "":"hidden"} fixed flex justify-center items-center z-40 top-0 left-0 w-full h-full bg-black/50`}>
      <div 
      onClick={(e) => e.stopPropagation()}
      className="relative p-4 w-xs h-fit bg-slate-300 dark:bg-slate-800 rounded-2xl"
      >
        <h1 className="text-2xl select-none">Delete Comment</h1>
        <p className="text-gray-500">Are sure you to delete {userdata? (userdata[0].username == deleteUsername? "this":deleteUsername+"'s"):""} comment?</p>
        <div className={`flex pt-5 w-full justify-end`}>
          <button 
            type="button" 
            onClick={() => {
              openDeleteWindow(false)
              setDeleteCommentId("")
            }}
            className="px-4 py-2 select-none bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
          >Cancel</button>
          <button 
            type="button"
            onClick={() => DeleteComment()}
            className="ml-4 px-4 py-2 select-none bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-500">Yes</button>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div>
      <div className="h-1"/>
      {nestedComments.map((comment, idx) => (
        <div key={`lvl2-${parentId}-${comment.id}-${idx}`} className="ml-4 w-full justify-between relative select-none">
          {/* Avatar */}
          <div className="absolute bg-black w-10 h-10 self-start overflow-clip rounded-full">
            <img
              src={comment.anonymous || comment.user_deleted || comment.mod_deleted? "/anon.png" : comment.profile}
              alt={comment.anonymous || comment.user_deleted || comment.mod_deleted? "anon":comment.username}
              className="object-cover rounded-lg"
              sizes="80px"
            />
          </div>

          {/* Reporting */}
          <div className={`${comment.user_deleted || comment.mod_deleted? "hidden":""} flex-1 justify-items-end absolute top-4 right-0 self-end`}>
            <div onClick={() => setOptionsDropdown(optionsDropdown === comment.id ? null : comment.id)} className={`w-10 h-10 overflow-clip rounded-full`}>
              <div className={`${userdata? "":"hidden"} flex hover:bg-gray-500/50 w-10 h-10 justify-center items-center rounded-full`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className={`${optionsDropdown === comment.id? "":"hidden"} relative bg-slate-300 dark:bg-slate-800 text-black dark:text-white`}>
              <div
              onClick={() => {openReportWindow(true), setReportCommentId(comment.id), setReportUsername(comment.username)}}
              className="flex py-1 px-3 items-center cursor-pointer hover:bg-gray-500/50"
              >
                <svg width="32" height="32" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path style={{ stroke: "transparent", fill: fontcolor }} d="M7 12.5538H6.25C6.25 12.5713 6.25061 12.5888 6.25183 12.6062L7 12.5538ZM7.782 13.2398V12.4898C7.76683 12.4898 7.75167 12.4903 7.73653 12.4912L7.782 13.2398ZM17.217 13.2398L17.3055 12.4951C17.2761 12.4916 17.2466 12.4898 17.217 12.4898V13.2398ZM17.8805 12.9231L18.5153 13.3225V13.3225L17.8805 12.9231ZM17.879 12.1878L18.5121 11.7858C18.5046 11.7739 18.4967 11.7622 18.4885 11.7508L17.879 12.1878ZM15.943 9.48782L16.5526 9.05075L16.5467 9.04282L15.943 9.48782ZM15.943 8.75682L16.5468 9.20187L16.5525 9.19386L15.943 8.75682ZM17.879 6.05682L18.4885 6.49386C18.4967 6.48242 18.5046 6.47075 18.5121 6.45887L17.879 6.05682ZM17.8805 5.32159L18.5153 4.92214L18.5153 4.92214L17.8805 5.32159ZM17.217 5.00482V5.75482C17.2466 5.75482 17.2761 5.75307 17.3055 5.74958L17.217 5.00482ZM7.782 5.00482L7.73653 5.75344C7.75167 5.75436 7.76683 5.75482 7.782 5.75482V5.00482ZM7 5.69082L6.25183 5.63841C6.25061 5.65586 6.25 5.67334 6.25 5.69082H7ZM7.75 12.5538C7.75 12.1396 7.41421 11.8038 7 11.8038C6.58579 11.8038 6.25 12.1396 6.25 12.5538H7.75ZM6.25 19.0048C6.25 19.419 6.58579 19.7548 7 19.7548C7.41421 19.7548 7.75 19.419 7.75 19.0048H6.25ZM6.25183 12.6062C6.30892 13.4212 7.01201 14.038 7.82747 13.9884L7.73653 12.4912C7.73632 12.4912 7.73688 12.4912 7.73797 12.4913C7.73901 12.4915 7.74008 12.4917 7.74107 12.4921C7.74295 12.4927 7.74396 12.4935 7.74445 12.4939C7.74494 12.4943 7.74581 12.4952 7.7467 12.497C7.74718 12.498 7.74758 12.499 7.74786 12.5C7.74815 12.5011 7.74818 12.5016 7.74817 12.5014L6.25183 12.6062ZM7.782 13.9898H17.217V12.4898H7.782V13.9898ZM17.1285 13.9846C17.6798 14.0501 18.2196 13.7924 18.5153 13.3225L17.2457 12.5236C17.2585 12.5034 17.2818 12.4922 17.3055 12.4951L17.1285 13.9846ZM18.5153 13.3225C18.811 12.8526 18.8098 12.2545 18.5121 11.7858L17.2459 12.5899C17.233 12.5697 17.233 12.5439 17.2457 12.5236L18.5153 13.3225ZM18.4885 11.7508L16.5525 9.05079L15.3335 9.92486L17.2695 12.6249L18.4885 11.7508ZM16.5467 9.04282C16.5816 9.09009 16.5816 9.15455 16.5467 9.20183L15.3393 8.31182C14.984 8.79376 14.984 9.45088 15.3393 9.93283L16.5467 9.04282ZM16.5525 9.19386L18.4885 6.49386L17.2695 5.61979L15.3335 8.31979L16.5525 9.19386ZM18.5121 6.45887C18.8098 5.99018 18.811 5.39204 18.5153 4.92214L17.2457 5.72104C17.233 5.70078 17.233 5.67499 17.2459 5.65478L18.5121 6.45887ZM18.5153 4.92214C18.2196 4.45224 17.6798 4.19454 17.1285 4.26007L17.3055 5.74958C17.2818 5.75241 17.2585 5.7413 17.2457 5.72104L18.5153 4.92214ZM17.217 4.25482H7.782V5.75482H17.217V4.25482ZM7.82747 4.2562C7.01201 4.20667 6.30892 4.82344 6.25183 5.63841L7.74817 5.74323C7.74818 5.74303 7.74815 5.74359 7.74786 5.74465C7.74758 5.74566 7.74718 5.74669 7.7467 5.74762C7.74581 5.7494 7.74494 5.7503 7.74445 5.75073C7.74396 5.75116 7.74295 5.75191 7.74107 5.75257C7.74008 5.75291 7.73901 5.75317 7.73797 5.75332C7.73688 5.75347 7.73632 5.75343 7.73653 5.75344L7.82747 4.2562ZM6.25 5.69082V12.5538H7.75V5.69082H6.25ZM6.25 12.5538V16.2987H7.75V12.5538H6.25ZM6.25 16.2987V19.0048H7.75V16.2987H6.25Z" fill="#000000"/>
                </svg>
                <p>Report</p>
              </div>
              <div
              onClick={() => {openDeleteWindow(true), setDeleteCommentId(comment.id), setDeleteUsername(comment.username)}}
              className={`
                ${userdata
                  ? (
                      userdata[0]?.username === comment.username
                        ? ""
                        : (
                            myModData?.perms?.delete_comments
                              ? ""
                              : "hidden"
                          )
                    )
                  : "hidden"
                }
                flex py-1 px-3 items-center cursor-pointer hover:bg-gray-500/50`}
              >
                <svg width="22" height="22" viewBox="-3 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <g id="Page-1" stroke="none" strokeWidth="1.5" fill="none" fillRule="evenodd">
                    <g id="Icon-Set-Filled" transform="translate(-261.000000, -205.000000)" className="stroke-current">
                      <path d="M268,220 C268,219.448 268.448,219 269,219 C269.552,219 270,219.448 270,220 L270,232 C270,232.553 269.552,233 269,233 C268.448,233 268,232.553 268,232 L268,220 L268,220 Z M273,220 C273,219.448 273.448,219 274,219 C274.552,219 275,219.448 275,220 L275,232 C275,232.553 274.552,233 274,233 C273.448,233 273,232.553 273,232 L273,220 L273,220 Z M278,220 C278,219.448 278.448,219 279,219 C279.552,219 280,219.448 280,220 L280,232 C280,232.553 279.552,233 279,233 C278.448,233 278,232.553 278,232 L278,220 L278,220 Z M263,233 C263,235.209 264.791,237 267,237 L281,237 C283.209,237 285,235.209 285,233 L285,217 L263,217 L263,233 L263,233 Z M277,209 L271,209 L271,208 C271,207.447 271.448,207 272,207 L276,207 C276.552,207 277,207.447 277,208 L277,209 L277,209 Z M285,209 L279,209 L279,207 C279,205.896 278.104,205 277,205 L271,205 C269.896,205 269,205.896 269,207 L269,209 L263,209 C261.896,209 261,209.896 261,211 L261,213 C261,214.104 261.895,214.999 262.999,215 L285.002,215 C286.105,214.999 287,214.104 287,213 L287,211 C287,209.896 286.104,209 285,209 L285,209 Z" id="trash">
                      </path>
                    </g>
                  </g>
                </svg>
                <p className="pl-2.5">Delete</p>
              </div>
            </div>
          </div>

          {/* Comment content */}
          <div style={{ borderLeft: `${comment.has_comments? `2px solid ${fontcolor}`:"0 none black"}` }} className="flex-grow ml-4.75 pt-4 pl-8">
            <p 
              onClick={() => (comment.user_deleted || comment.mod_deleted? "":(gotoUser(comment.username, comment.anonymous)))}
              style={{ color: fontcolor }}
              className={`text-sm w-fit ${comment.anonymous || comment.user_deleted || comment.mod_deleted? "":"cursor-pointer"}`}>
              {comment.anonymous || comment.user_deleted || comment.mod_deleted ? "anonymous" : comment.username} •{" "}
              {new Date(comment.created_at).toLocaleString()}
            </p>
            <div className="pt-2 pl-4">
              <p style={{ color: fontcolor }} className="text-sm">
                {comment.mod_deleted? "Comment was deleted by a moderator.":(comment.user_deleted? "User has deleted this comment":(comment.content))}
              </p>
            </div>

            {/* Likes / Dislikes / Reply */}
            <div style={{ color: fontcolor }} className={`${comment.user_deleted || comment.mod_deleted? "hidden":""} flex gap-4 mt-2 items-center`}>
              <div className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleLike(comment.id)}>
                {userReactState[comment.id]?.liked ? (
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
                {userReactState[comment.id]?.disliked ? (
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
            style={{color: fontcolor, background: theme,  border: `2px solid ${fontcolor}`}} className={`${comment.has_comments? "":"hidden"} ml-2 absolute w-6 h-6 self-end border-2 overflow-clip rounded-full cursor-pointer`}>
            <div className="flex items-center h-full justify-self-center">
              {openReplies1[comment.id] ? "—" : "+"}
            </div>
          </div>
          <div className="ml-4.75">
            <div className={`${openReplies1[comment.id] ? "block" : "hidden"} pt-2`}>
              <NestedReplies
                myModData={myModData}
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
            <div className="h-4" />
          </div>
        </div>
      ))}
      <div>
        {hasMore? (
          <div
            onClick={() => loadMore()}
            style={{color: fontcolor, border: `2px solid ${fontcolor}`}}
            className="absolute ml-12 mt-1.5 justify-self-start border-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-500/50 select-none"
          >
            load more comments
          </div>
        ):(
          <div
            className="absolute ml-12 mt-1.5 justify-self-start border-2 text-gray-500 border-gray-500 px-3 py-1 rounded-full select-none"
          >
            no more comments
          </div>
        )}
      </div>
    </div>
  </>);
}

function NestedReplies(props: NestedRepliesProps) {
  const {
    myModData,
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

  const [userReactState, setUserReactState] = useState<{
    [commentId: string]: { liked: boolean; disliked: boolean }
  }>({});

  // --- DROPDOWN OPTIONS --- //
  const [optionsDropdown, setOptionsDropdown] = useState<string | null>(null);

  // --- reporting consts --- //
  const [reportWindow ,openReportWindow] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportCommentId, setReportCommentId] = useState("");
  const [reportUsername, setReportUsername] = useState("");
  const pageType = usePathname().startsWith("/o")? "organization":"categories"

  // --- deliting comment --- ///
  const [deleteWindow, openDeleteWindow] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState("");
  const [deleteUsername, setDeleteUsername] = useState("");

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

      // Update user reactions
      setUserReactState(prev => {
        const copy = { ...prev };
        newComments.forEach(c => {
          copy[c.id] = {
            liked: c.lnd?.likes && Object.keys(c.lnd.likes).length
              ? Object.keys(c.lnd.likes).includes(userdata?.[0]?.id ?? "")
              : false,
            disliked: c.lnd?.dislikes && Object.keys(c.lnd.dislikes).length
              ? Object.keys(c.lnd.dislikes).includes(userdata?.[0]?.id ?? "")
              : false,
          };
        });
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

  useEffect(() => {
    if (!nestedComments.length) return;

    const newLikesState: Record<string, number> = {};
    const newDislikesState: Record<string, number> = {};

    nestedComments.forEach(comment => {
      newLikesState[comment.id] = Object.keys(comment.lnd?.likes || {}).length;
      newDislikesState[comment.id] = Object.keys(comment.lnd?.dislikes || {}).length;
    });

    setLikesState(newLikesState);
    setDislikesState(newDislikesState);
  }, [nestedComments]);

  
  const loadMore = () => {
    fetchNested();
  }

  if (!nestedComments.length) return null;

  const handleLike = async (commentId: string) => {
    const res = await fetch("/api/comments/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "like" })
    });

    const json = await res.json();
    if (!res.ok) return;

    setLikesState(prev => ({ ...prev, [commentId]: json.likes }));
    setDislikesState(prev => ({ ...prev, [commentId]: json.dislikes }));

    setUserReactState(prev => ({
      ...prev,
      [commentId]: {
        liked: json.userReacted.liked,
        disliked: json.userReacted.disliked
      }
    }));
  };

  const handleDislike = async (commentId: string) => {
    const res = await fetch("/api/comments/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "dislike" })
    });

    const json = await res.json();
    if (!res.ok) return;

    setLikesState(prev => ({ ...prev, [commentId]: json.likes }));
    setDislikesState(prev => ({ ...prev, [commentId]: json.dislikes }));

    setUserReactState(prev => ({
      ...prev,
      [commentId]: {
        liked: json.userReacted.liked,
        disliked: json.userReacted.disliked
      }
    }));
  };

  // --- reporting
  async function sendReport() {
    if(reportReason == "") {
      alert("Please enter the reason for the report");
      return;
    }
    
    try {
      const res = await fetch(`/api/reporting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postId, commentId: reportCommentId, reason: reportReason, pageType: pageType}),
      });

      if (res.ok) {
        // Successfully report
        alert("Successfully Reported"); 
        openReportWindow(false);
        setReportCommentId("");
        setReportUsername("");
        setReportReason("");
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to report: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to report:", err);
      alert("An error occurred while reporting.");
    }
  }

  // --- deleting
  async function DeleteComment() {    
    try {
      const res = await fetch(`/api/deleteComment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: deleteCommentId, postId:postId, Mod: myModData?.userId ?? null }),
      });

      if (res.ok) {
        // Successfully Delete
        alert("Successfully Deleted Comment"); 
        openReportWindow(false);
        setReportCommentId("");
        setReportUsername("");
        setReportReason("");
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to delete comment: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("An error occurred while deleting comment.");
    }
  }

  return (<>
    {/* Report Modal */}
    <div onClick={() => {openReportWindow(false), setReportCommentId("")}} className={`${reportWindow? "":"hidden"} fixed flex justify-center items-center z-40 top-0 left-0 w-full h-full bg-black/50`}>
      <div 
      onClick={(e) => e.stopPropagation()}
      className="relative p-4 w-xs h-fit bg-slate-300 dark:bg-slate-800 rounded-2xl"
      >
        <h1 className="text-2xl select-none">Report {reportUsername}</h1>
        <p className="text-gray-500">Please tell us the reason why you are reporting.</p>
        <textarea
        onChange={(e) => setReportReason(e.target.value)}
        value={reportReason}
        className="mt-4 w-full p-1 min-h-24 border-2 border-gray-500"
        />
        <div className={`flex pt-5 w-full justify-end`}>
          <button 
            type="button" 
            onClick={() => {
              openReportWindow(false)
              setReportCommentId("")
            }}
            className="px-4 py-2 select-none bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
          >Cancel</button>
          <button 
            type="button"
            onClick={() => sendReport()}
            className="ml-4 px-4 py-2 select-none bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-500">Report</button>
        </div>
      </div>
    </div>

    {/* Delete Modal */}
    <div onClick={() => {openDeleteWindow(false), setDeleteCommentId("")}} className={`${deleteWindow? "":"hidden"} fixed flex justify-center items-center z-40 top-0 left-0 w-full h-full bg-black/50`}>
      <div 
      onClick={(e) => e.stopPropagation()}
      className="relative p-4 w-xs h-fit bg-slate-300 dark:bg-slate-800 rounded-2xl"
      >
        <h1 className="text-2xl select-none">Delete Comment</h1>
        <p className="text-gray-500">Are sure you to delete {userdata? (userdata[0].username == deleteUsername? "this":deleteUsername+"'s"):""} comment?</p>
        <div className={`flex pt-5 w-full justify-end`}>
          <button 
            type="button" 
            onClick={() => {
              openDeleteWindow(false)
              setDeleteCommentId("")
            }}
            className="px-4 py-2 select-none bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
          >Cancel</button>
          <button 
            type="button"
            onClick={() => DeleteComment()}
            className="ml-4 px-4 py-2 select-none bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-500">Yes</button>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div>
      <div className="absolute border-l-2 w-full h-6 rounded-b-2xl"/>
      {nestedComments.map((comment, idx) => (
        <div key={`lvl2-${parentId}-${comment.id}-${idx}`} className="ml-4 w-full justify-between relative select-none">
          {/* Avatar */}
          <div className="absolute bg-black w-10 h-10 self-start overflow-clip rounded-full">
            <img
              src={comment.anonymous || comment.user_deleted || comment.mod_deleted? "/anon.png" : comment.profile}
              alt={comment.anonymous || comment.user_deleted || comment.mod_deleted? "anon":comment.username}
              className="object-cover rounded-lg"
              sizes="80px"
            />
          </div>

          {/* Reporting */}
          <div className={`${comment.user_deleted || comment.mod_deleted? "hidden":""} flex-1 justify-items-end absolute top-4 right-0 self-end`}>
            <div onClick={() => setOptionsDropdown(optionsDropdown === comment.id ? null : comment.id)} className={`w-10 h-10 overflow-clip rounded-full`}>
              <div className={`${userdata? "":"hidden"} flex hover:bg-gray-500/50 w-10 h-10 justify-center items-center rounded-full`}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className={`${optionsDropdown === comment.id? "":"hidden"} relative bg-slate-300 dark:bg-slate-800 text-black dark:text-white`}>
              <div
              onClick={() => {openReportWindow(true), setReportCommentId(comment.id), setReportUsername(comment.username)}}
              className="flex py-1 px-3 items-center cursor-pointer hover:bg-gray-500/50"
              >
                <svg width="32" height="32" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path style={{ stroke: "transparent", fill: fontcolor }} d="M7 12.5538H6.25C6.25 12.5713 6.25061 12.5888 6.25183 12.6062L7 12.5538ZM7.782 13.2398V12.4898C7.76683 12.4898 7.75167 12.4903 7.73653 12.4912L7.782 13.2398ZM17.217 13.2398L17.3055 12.4951C17.2761 12.4916 17.2466 12.4898 17.217 12.4898V13.2398ZM17.8805 12.9231L18.5153 13.3225V13.3225L17.8805 12.9231ZM17.879 12.1878L18.5121 11.7858C18.5046 11.7739 18.4967 11.7622 18.4885 11.7508L17.879 12.1878ZM15.943 9.48782L16.5526 9.05075L16.5467 9.04282L15.943 9.48782ZM15.943 8.75682L16.5468 9.20187L16.5525 9.19386L15.943 8.75682ZM17.879 6.05682L18.4885 6.49386C18.4967 6.48242 18.5046 6.47075 18.5121 6.45887L17.879 6.05682ZM17.8805 5.32159L18.5153 4.92214L18.5153 4.92214L17.8805 5.32159ZM17.217 5.00482V5.75482C17.2466 5.75482 17.2761 5.75307 17.3055 5.74958L17.217 5.00482ZM7.782 5.00482L7.73653 5.75344C7.75167 5.75436 7.76683 5.75482 7.782 5.75482V5.00482ZM7 5.69082L6.25183 5.63841C6.25061 5.65586 6.25 5.67334 6.25 5.69082H7ZM7.75 12.5538C7.75 12.1396 7.41421 11.8038 7 11.8038C6.58579 11.8038 6.25 12.1396 6.25 12.5538H7.75ZM6.25 19.0048C6.25 19.419 6.58579 19.7548 7 19.7548C7.41421 19.7548 7.75 19.419 7.75 19.0048H6.25ZM6.25183 12.6062C6.30892 13.4212 7.01201 14.038 7.82747 13.9884L7.73653 12.4912C7.73632 12.4912 7.73688 12.4912 7.73797 12.4913C7.73901 12.4915 7.74008 12.4917 7.74107 12.4921C7.74295 12.4927 7.74396 12.4935 7.74445 12.4939C7.74494 12.4943 7.74581 12.4952 7.7467 12.497C7.74718 12.498 7.74758 12.499 7.74786 12.5C7.74815 12.5011 7.74818 12.5016 7.74817 12.5014L6.25183 12.6062ZM7.782 13.9898H17.217V12.4898H7.782V13.9898ZM17.1285 13.9846C17.6798 14.0501 18.2196 13.7924 18.5153 13.3225L17.2457 12.5236C17.2585 12.5034 17.2818 12.4922 17.3055 12.4951L17.1285 13.9846ZM18.5153 13.3225C18.811 12.8526 18.8098 12.2545 18.5121 11.7858L17.2459 12.5899C17.233 12.5697 17.233 12.5439 17.2457 12.5236L18.5153 13.3225ZM18.4885 11.7508L16.5525 9.05079L15.3335 9.92486L17.2695 12.6249L18.4885 11.7508ZM16.5467 9.04282C16.5816 9.09009 16.5816 9.15455 16.5467 9.20183L15.3393 8.31182C14.984 8.79376 14.984 9.45088 15.3393 9.93283L16.5467 9.04282ZM16.5525 9.19386L18.4885 6.49386L17.2695 5.61979L15.3335 8.31979L16.5525 9.19386ZM18.5121 6.45887C18.8098 5.99018 18.811 5.39204 18.5153 4.92214L17.2457 5.72104C17.233 5.70078 17.233 5.67499 17.2459 5.65478L18.5121 6.45887ZM18.5153 4.92214C18.2196 4.45224 17.6798 4.19454 17.1285 4.26007L17.3055 5.74958C17.2818 5.75241 17.2585 5.7413 17.2457 5.72104L18.5153 4.92214ZM17.217 4.25482H7.782V5.75482H17.217V4.25482ZM7.82747 4.2562C7.01201 4.20667 6.30892 4.82344 6.25183 5.63841L7.74817 5.74323C7.74818 5.74303 7.74815 5.74359 7.74786 5.74465C7.74758 5.74566 7.74718 5.74669 7.7467 5.74762C7.74581 5.7494 7.74494 5.7503 7.74445 5.75073C7.74396 5.75116 7.74295 5.75191 7.74107 5.75257C7.74008 5.75291 7.73901 5.75317 7.73797 5.75332C7.73688 5.75347 7.73632 5.75343 7.73653 5.75344L7.82747 4.2562ZM6.25 5.69082V12.5538H7.75V5.69082H6.25ZM6.25 12.5538V16.2987H7.75V12.5538H6.25ZM6.25 16.2987V19.0048H7.75V16.2987H6.25Z" fill="#000000"/>
                </svg>
                <p>Report</p>
              </div>
              <div
              onClick={() => {openDeleteWindow(true), setDeleteCommentId(comment.id), setDeleteUsername(comment.username)}}
              className={`
                ${userdata
                  ? (
                      userdata[0]?.username === comment.username
                        ? ""
                        : (
                            myModData?.perms?.delete_comments
                              ? ""
                              : "hidden"
                          )
                    )
                  : "hidden"
                }
                flex py-1 px-3 items-center cursor-pointer hover:bg-gray-500/50`}
              >
                <svg width="22" height="22" viewBox="-3 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                  <g id="Page-1" stroke="none" strokeWidth="1.5" fill="none" fillRule="evenodd">
                    <g id="Icon-Set-Filled" transform="translate(-261.000000, -205.000000)" className="stroke-current">
                      <path d="M268,220 C268,219.448 268.448,219 269,219 C269.552,219 270,219.448 270,220 L270,232 C270,232.553 269.552,233 269,233 C268.448,233 268,232.553 268,232 L268,220 L268,220 Z M273,220 C273,219.448 273.448,219 274,219 C274.552,219 275,219.448 275,220 L275,232 C275,232.553 274.552,233 274,233 C273.448,233 273,232.553 273,232 L273,220 L273,220 Z M278,220 C278,219.448 278.448,219 279,219 C279.552,219 280,219.448 280,220 L280,232 C280,232.553 279.552,233 279,233 C278.448,233 278,232.553 278,232 L278,220 L278,220 Z M263,233 C263,235.209 264.791,237 267,237 L281,237 C283.209,237 285,235.209 285,233 L285,217 L263,217 L263,233 L263,233 Z M277,209 L271,209 L271,208 C271,207.447 271.448,207 272,207 L276,207 C276.552,207 277,207.447 277,208 L277,209 L277,209 Z M285,209 L279,209 L279,207 C279,205.896 278.104,205 277,205 L271,205 C269.896,205 269,205.896 269,207 L269,209 L263,209 C261.896,209 261,209.896 261,211 L261,213 C261,214.104 261.895,214.999 262.999,215 L285.002,215 C286.105,214.999 287,214.104 287,213 L287,211 C287,209.896 286.104,209 285,209 L285,209 Z" id="trash">
                      </path>
                    </g>
                  </g>
                </svg>
                <p className="pl-2.5">Delete</p>
              </div>
            </div>
          </div>

          {/* Comment content */}
          <div style={{borderLeft: `2px solid ${fontcolor}`}} className="flex-grow ml-4.75 pt-4 pl-8 border-l-2">
            <p 
              onClick={() => (comment.user_deleted || comment.mod_deleted? "":(gotoUser(comment.username, comment.anonymous)))}
              style={{ color: fontcolor }}
              className={`text-sm w-fit ${comment.anonymous || comment.user_deleted || comment.mod_deleted? "":"cursor-pointer"}`}>
              {comment.anonymous || comment.user_deleted || comment.mod_deleted ? "anonymous" : comment.username} •{" "}
              {new Date(comment.created_at).toLocaleString()}
            </p>
            <div className="pt-2 pl-4">
              <p style={{ color: fontcolor }} className="text-sm">
                {comment.mod_deleted? "Comment was deleted by a moderator.":(comment.user_deleted? "User has deleted this comment":(comment.content))}
              </p>
            </div>

            {/* Likes / Dislikes / Reply */}
            <div style={{ color: fontcolor }} className={`${comment.user_deleted || comment.mod_deleted? "hidden":""} flex gap-4 mt-2 items-center`}>
              <div className="flex items-center gap-1 cursor-pointer"
                onClick={() => handleLike(comment.id)}>
                {userReactState[comment.id]?.liked ? (
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
                {userReactState[comment.id]?.disliked ? (
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
            style={{color: fontcolor, background: theme,  border: `2px solid ${fontcolor}`}} className={`${comment.has_comments? "":"hidden"} ml-2 absolute w-6 h-6 self-end border-2 overflow-clip rounded-full cursor-pointer`}>
            <div className="flex items-center h-full justify-self-center">
              {openReplies1[comment.id] ? "—" : "+"}
            </div>
          </div>
          <div className="ml-4.75">
            <div className={`${openReplies1[comment.id] ? "block" : "hidden"} pt-2`}>
              <NestedReplies2
                myModData={myModData}
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
            <div style={{ borderLeft: `2px solid ${fontcolor}` }} className=" border-l-2 h-4" />
          </div>
        </div>
      ))}
      <div>
        {hasMore? (
          <div
            onClick={() => loadMore()}
            style={{color: fontcolor, border: `2px solid ${fontcolor}`}}
            className="absolute ml-12 mt-1.5 justify-self-start border-2 px-3 py-1 rounded-full cursor-pointer hover:bg-gray-500/50 select-none"
          >
            load more comments
          </div>
        ):(
          <div
            className="absolute ml-12 mt-1.5 justify-self-start border-2 text-gray-500 border-gray-500 px-3 py-1 rounded-full select-none"
          >
            no more comments
          </div>
        )}
        <div className=" h-6">
          <div style={{borderLeft: `2px solid ${fontcolor}`}} className="ml-8.75 border-l-2 h-6 rounded-b-xl" />
        </div>
      </div>
    </div>
  </>);
}

function NestedReplies2(props: NestedRepliesProps) {
  const {
    myModData,
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

  const [userReactState, setUserReactState] = useState<{
    [commentId: string]: { liked: boolean; disliked: boolean }
  }>({});

  // --- DROPDOWN OPTIONS --- //
  const [optionsDropdown, setOptionsDropdown] = useState<string | null>(null);

  // --- reporting consts --- //
  const [reportWindow ,openReportWindow] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportCommentId, setReportCommentId] = useState("");
  const [reportUsername, setReportUsername] = useState("");
  const pageType = usePathname().startsWith("/o")? "organization":"categories"

  // --- deliting comment --- ///
  const [deleteWindow, openDeleteWindow] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState("");
  const [deleteUsername, setDeleteUsername] = useState("");

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

      // Update user reactions
      setUserReactState(prev => {
        const copy = { ...prev };
        newComments.forEach(c => {
          copy[c.id] = {
            liked: c.lnd?.likes && Object.keys(c.lnd.likes).length
              ? Object.keys(c.lnd.likes).includes(userdata?.[0]?.id ?? "")
              : false,
            disliked: c.lnd?.dislikes && Object.keys(c.lnd.dislikes).length
              ? Object.keys(c.lnd.dislikes).includes(userdata?.[0]?.id ?? "")
              : false,
          };
        });
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

  useEffect(() => {
    if (!nestedComments.length) return;

    const newLikesState: Record<string, number> = {};
    const newDislikesState: Record<string, number> = {};

    nestedComments.forEach(comment => {
      newLikesState[comment.id] = Object.keys(comment.lnd?.likes || {}).length;
      newDislikesState[comment.id] = Object.keys(comment.lnd?.dislikes || {}).length;
    });

    setLikesState(newLikesState);
    setDislikesState(newDislikesState);
  }, [nestedComments]);
  
  const loadMore = () => {
    fetchNested();
  }

  if (!nestedComments.length) return null;

  const handleLike = async (commentId: string) => {
    const res = await fetch("/api/comments/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "like" })
    });

    const json = await res.json();
    if (!res.ok) return;

    setLikesState(prev => ({ ...prev, [commentId]: json.likes }));
    setDislikesState(prev => ({ ...prev, [commentId]: json.dislikes }));

    setUserReactState(prev => ({
      ...prev,
      [commentId]: {
        liked: json.userReacted.liked,
        disliked: json.userReacted.disliked
      }
    }));
  };

  const handleDislike = async (commentId: string) => {
    const res = await fetch("/api/comments/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId, action: "dislike" })
    });

    const json = await res.json();
    if (!res.ok) return;

    setLikesState(prev => ({ ...prev, [commentId]: json.likes }));
    setDislikesState(prev => ({ ...prev, [commentId]: json.dislikes }));

    setUserReactState(prev => ({
      ...prev,
      [commentId]: {
        liked: json.userReacted.liked,
        disliked: json.userReacted.disliked
      }
    }));
  };

  // --- reporting
  async function sendReport() {
    if(reportReason == "") {
      alert("Please enter the reason for the report");
      return;
    }
    
    try {
      const res = await fetch(`/api/reporting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: postId, commentId: reportCommentId, reason: reportReason, pageType: pageType}),
      });

      if (res.ok) {
        // Successfully report
        alert("Successfully Reported"); 
        openReportWindow(false);
        setReportCommentId("");
        setReportUsername("");
        setReportReason("");
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to report: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to report:", err);
      alert("An error occurred while reporting.");
    }
  }

  // --- deleting
  async function DeleteComment() {    
    try {
      const res = await fetch(`/api/deleteComment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId: deleteCommentId, postId:postId, Mod: myModData?.userId ?? null }),
      });

      if (res.ok) {
        // Successfully Delete
        alert("Successfully Deleted Comment"); 
        openReportWindow(false);
        setReportCommentId("");
        setReportUsername("");
        setReportReason("");
        window.location.reload();
      } else {
        // Handle error response
        const errorData = await res.json();
        alert(`Failed to delete comment: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Failed to delete:", err);
      alert("An error occurred while deleting comment.");
    }
  }

  return (<>
    {/* Report Modal */}
    <div onClick={() => {openReportWindow(false), setReportCommentId("")}} className={`${reportWindow? "":"hidden"} fixed flex justify-center items-center z-40 top-0 left-0 w-full h-full bg-black/50`}>
      <div 
      onClick={(e) => e.stopPropagation()}
      className="relative p-4 w-xs h-fit bg-slate-300 dark:bg-slate-800 rounded-2xl"
      >
        <h1 className="text-2xl select-none">Report {reportUsername}</h1>
        <p className="text-gray-500">Please tell us the reason why you are reporting.</p>
        <textarea
        onChange={(e) => setReportReason(e.target.value)}
        value={reportReason}
        className="mt-4 w-full p-1 min-h-24 border-2 border-gray-500"
        />
        <div className={`flex pt-5 w-full justify-end`}>
          <button 
            type="button" 
            onClick={() => {
              openReportWindow(false)
              setReportCommentId("")
            }}
            className="px-4 py-2 select-none bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
          >Cancel</button>
          <button 
            type="button"
            onClick={() => sendReport()}
            className="ml-4 px-4 py-2 select-none bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-500">Report</button>
        </div>
      </div>
    </div>

    {/* Delete Modal */}
    <div onClick={() => {openDeleteWindow(false), setDeleteCommentId("")}} className={`${deleteWindow? "":"hidden"} fixed flex justify-center items-center z-40 top-0 left-0 w-full h-full bg-black/50`}>
      <div 
      onClick={(e) => e.stopPropagation()}
      className="relative p-4 w-xs h-fit bg-slate-300 dark:bg-slate-800 rounded-2xl"
      >
        <h1 className="text-2xl select-none">Delete Comment</h1>
        <p className="text-gray-500">Are sure you to delete {userdata? (userdata[0].username == deleteUsername? "this":deleteUsername+"'s"):""} comment?</p>
        <div className={`flex pt-5 w-full justify-end`}>
          <button 
            type="button" 
            onClick={() => {
              openDeleteWindow(false)
              setDeleteCommentId("")
            }}
            className="px-4 py-2 select-none bg-gray-500 rounded-lg cursor-pointer hover:bg-gray-400"
          >Cancel</button>
          <button 
            type="button"
            onClick={() => DeleteComment()}
            className="ml-4 px-4 py-2 select-none bg-red-700 text-white rounded-lg cursor-pointer hover:bg-red-500">Yes</button>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div>
      <div style={{borderLeft: `2px solid ${fontcolor}`}} className="absolute border-l-2 w-full h-6 rounded-b-2xl"/>
      <div className="h-1"/>
      <div style={{borderLeft: `2px solid ${fontcolor}`}} className="border-l-2">
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

              {/* Reporting */}
              <div className={`${comment.user_deleted || comment.mod_deleted? "hidden":""} flex-1 justify-items-end absolute top-4 right-0 self-end`}>
                <div onClick={() => setOptionsDropdown(optionsDropdown === comment.id ? null : comment.id)} className={`w-10 h-10 overflow-clip rounded-full`}>
                  <div className={`${userdata? "":"hidden"} flex hover:bg-gray-500/50 w-10 h-10 justify-center items-center rounded-full`}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44772 11 5C11 5.55228 11.4477 6 12 6C12.5523 6 13 5.55228 13 5Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13C12.5523 13 13 12.5523 13 12Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13 19C13 18.4477 12.5523 18 12 18C11.4477 18 11 18.4477 11 19C11 19.5523 11.4477 20 12 20C12.5523 20 13 19.5523 13 19Z" className="stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <div className={`${optionsDropdown === comment.id? "":"hidden"} relative bg-slate-300 dark:bg-slate-800 text-black dark:text-white`}>
                  <div
                  onClick={() => {openReportWindow(true), setReportCommentId(comment.id), setReportUsername(comment.username)}}
                  className="flex py-1 px-3 items-center cursor-pointer hover:bg-gray-500/50"
                  >
                    <svg width="32" height="32" viewBox="0 -0.5 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path style={{ stroke: "transparent", fill: fontcolor }} d="M7 12.5538H6.25C6.25 12.5713 6.25061 12.5888 6.25183 12.6062L7 12.5538ZM7.782 13.2398V12.4898C7.76683 12.4898 7.75167 12.4903 7.73653 12.4912L7.782 13.2398ZM17.217 13.2398L17.3055 12.4951C17.2761 12.4916 17.2466 12.4898 17.217 12.4898V13.2398ZM17.8805 12.9231L18.5153 13.3225V13.3225L17.8805 12.9231ZM17.879 12.1878L18.5121 11.7858C18.5046 11.7739 18.4967 11.7622 18.4885 11.7508L17.879 12.1878ZM15.943 9.48782L16.5526 9.05075L16.5467 9.04282L15.943 9.48782ZM15.943 8.75682L16.5468 9.20187L16.5525 9.19386L15.943 8.75682ZM17.879 6.05682L18.4885 6.49386C18.4967 6.48242 18.5046 6.47075 18.5121 6.45887L17.879 6.05682ZM17.8805 5.32159L18.5153 4.92214L18.5153 4.92214L17.8805 5.32159ZM17.217 5.00482V5.75482C17.2466 5.75482 17.2761 5.75307 17.3055 5.74958L17.217 5.00482ZM7.782 5.00482L7.73653 5.75344C7.75167 5.75436 7.76683 5.75482 7.782 5.75482V5.00482ZM7 5.69082L6.25183 5.63841C6.25061 5.65586 6.25 5.67334 6.25 5.69082H7ZM7.75 12.5538C7.75 12.1396 7.41421 11.8038 7 11.8038C6.58579 11.8038 6.25 12.1396 6.25 12.5538H7.75ZM6.25 19.0048C6.25 19.419 6.58579 19.7548 7 19.7548C7.41421 19.7548 7.75 19.419 7.75 19.0048H6.25ZM6.25183 12.6062C6.30892 13.4212 7.01201 14.038 7.82747 13.9884L7.73653 12.4912C7.73632 12.4912 7.73688 12.4912 7.73797 12.4913C7.73901 12.4915 7.74008 12.4917 7.74107 12.4921C7.74295 12.4927 7.74396 12.4935 7.74445 12.4939C7.74494 12.4943 7.74581 12.4952 7.7467 12.497C7.74718 12.498 7.74758 12.499 7.74786 12.5C7.74815 12.5011 7.74818 12.5016 7.74817 12.5014L6.25183 12.6062ZM7.782 13.9898H17.217V12.4898H7.782V13.9898ZM17.1285 13.9846C17.6798 14.0501 18.2196 13.7924 18.5153 13.3225L17.2457 12.5236C17.2585 12.5034 17.2818 12.4922 17.3055 12.4951L17.1285 13.9846ZM18.5153 13.3225C18.811 12.8526 18.8098 12.2545 18.5121 11.7858L17.2459 12.5899C17.233 12.5697 17.233 12.5439 17.2457 12.5236L18.5153 13.3225ZM18.4885 11.7508L16.5525 9.05079L15.3335 9.92486L17.2695 12.6249L18.4885 11.7508ZM16.5467 9.04282C16.5816 9.09009 16.5816 9.15455 16.5467 9.20183L15.3393 8.31182C14.984 8.79376 14.984 9.45088 15.3393 9.93283L16.5467 9.04282ZM16.5525 9.19386L18.4885 6.49386L17.2695 5.61979L15.3335 8.31979L16.5525 9.19386ZM18.5121 6.45887C18.8098 5.99018 18.811 5.39204 18.5153 4.92214L17.2457 5.72104C17.233 5.70078 17.233 5.67499 17.2459 5.65478L18.5121 6.45887ZM18.5153 4.92214C18.2196 4.45224 17.6798 4.19454 17.1285 4.26007L17.3055 5.74958C17.2818 5.75241 17.2585 5.7413 17.2457 5.72104L18.5153 4.92214ZM17.217 4.25482H7.782V5.75482H17.217V4.25482ZM7.82747 4.2562C7.01201 4.20667 6.30892 4.82344 6.25183 5.63841L7.74817 5.74323C7.74818 5.74303 7.74815 5.74359 7.74786 5.74465C7.74758 5.74566 7.74718 5.74669 7.7467 5.74762C7.74581 5.7494 7.74494 5.7503 7.74445 5.75073C7.74396 5.75116 7.74295 5.75191 7.74107 5.75257C7.74008 5.75291 7.73901 5.75317 7.73797 5.75332C7.73688 5.75347 7.73632 5.75343 7.73653 5.75344L7.82747 4.2562ZM6.25 5.69082V12.5538H7.75V5.69082H6.25ZM6.25 12.5538V16.2987H7.75V12.5538H6.25ZM6.25 16.2987V19.0048H7.75V16.2987H6.25Z" fill="#000000"/>
                    </svg>
                    <p>Report</p>
                  </div>
                  <div
                  onClick={() => {openDeleteWindow(true), setDeleteCommentId(comment.id), setDeleteUsername(comment.username)}}
                  className={`
                    ${userdata
                      ? (
                          userdata[0]?.username === comment.username
                            ? ""
                            : (
                                myModData?.perms?.delete_comments
                                  ? ""
                                  : "hidden"
                              )
                        )
                      : "hidden"
                    }
                    flex py-1 px-3 items-center cursor-pointer hover:bg-gray-500/50`}
                  >
                    <svg width="22" height="22" viewBox="-3 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <g id="Page-1" stroke="none" strokeWidth="1.5" fill="none" fillRule="evenodd">
                        <g id="Icon-Set-Filled" transform="translate(-261.000000, -205.000000)" className="stroke-current">
                          <path d="M268,220 C268,219.448 268.448,219 269,219 C269.552,219 270,219.448 270,220 L270,232 C270,232.553 269.552,233 269,233 C268.448,233 268,232.553 268,232 L268,220 L268,220 Z M273,220 C273,219.448 273.448,219 274,219 C274.552,219 275,219.448 275,220 L275,232 C275,232.553 274.552,233 274,233 C273.448,233 273,232.553 273,232 L273,220 L273,220 Z M278,220 C278,219.448 278.448,219 279,219 C279.552,219 280,219.448 280,220 L280,232 C280,232.553 279.552,233 279,233 C278.448,233 278,232.553 278,232 L278,220 L278,220 Z M263,233 C263,235.209 264.791,237 267,237 L281,237 C283.209,237 285,235.209 285,233 L285,217 L263,217 L263,233 L263,233 Z M277,209 L271,209 L271,208 C271,207.447 271.448,207 272,207 L276,207 C276.552,207 277,207.447 277,208 L277,209 L277,209 Z M285,209 L279,209 L279,207 C279,205.896 278.104,205 277,205 L271,205 C269.896,205 269,205.896 269,207 L269,209 L263,209 C261.896,209 261,209.896 261,211 L261,213 C261,214.104 261.895,214.999 262.999,215 L285.002,215 C286.105,214.999 287,214.104 287,213 L287,211 C287,209.896 286.104,209 285,209 L285,209 Z" id="trash">
                          </path>
                        </g>
                      </g>
                    </svg>
                    <p className="pl-2.5">Delete</p>
                  </div>
                </div>
              </div>

              {/* Comment content */}
              <div style={{borderLeft: `2px solid ${fontcolor}`}} className="flex-grow ml-4.75 pt-4 pl-8 border-l-2">
                <p 
                  onClick={() => (comment.user_deleted || comment.mod_deleted? "":gotoUser(comment.username, comment.anonymous))}
                  style={{ color: fontcolor }}
                  className={`text-sm w-fit ${comment.anonymous || comment.user_deleted || comment.mod_deleted? "":"cursor-pointer"}`}>
                  {comment.anonymous || comment.user_deleted || comment.mod_deleted ? "anonymous" : comment.username} •{" "}
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                <div className="pt-2 pl-4">
                  <p style={{ color: fontcolor }} className="text-sm">
                    {comment.mod_deleted? "Comment was deleted by a moderator.":(comment.user_deleted? "User has deleted this comment":(comment.content))}
                  </p>
                </div>

                {/* Likes / Dislikes / Reply */}
                <div style={{ color: fontcolor }} className={`${comment.user_deleted || comment.mod_deleted? "hidden":""} flex gap-4 mt-2 items-center`}>
                  <div className="flex items-center gap-1 cursor-pointer"
                    onClick={() => handleLike(comment.id)}>
                    {userReactState[comment.id]?.liked ? (
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
                    {userReactState[comment.id]?.disliked ? (
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
                style={{color: fontcolor, background: theme,  border: `2px solid ${fontcolor}`}} className={`${comment.has_comments? "":"hidden"} ml-2 absolute w-6 h-6 self-end border-2 overflow-clip rounded-full cursor-pointer`}>
                <div className="flex items-center h-full justify-self-center">
                  +
                </div>
              </div>
              <div className="ml-4.75">
                <div style={{borderLeft: `2px solid ${fontcolor}`}} className=" border-l-2 h-4" />
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
              className="absolute ml-12 mt-1.5 justify-self-start border-2 text-gray-500 border-gray-500 px-3 py-1 rounded-full select-none"
            >
              no more comments
            </div>
          )}
          <div style={{borderLeft: `2px solid ${fontcolor}`}} className="ml-8.75 border-l-2 h-6 rounded-b-2xl" />
        </div>
      </div>
    </div>
  </>);
}