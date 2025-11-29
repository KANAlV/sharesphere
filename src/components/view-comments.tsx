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

export default function PostView({ comment_id, post, details, userdata }: { comment_id: string, post: Post, details: Details[], userdata: UserData[] | null }) {
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

  return (
    <div id="title" className="p-4 b-6 rounded-lg w-full h-screen lg:max-w-7/9 lg:ml-12 mt-16 lg:p-16 lg:mt-6">
      {/* Title */}
      <div className="border-b-2 border-[#6C6C6C] flex-2 p-5 mb-3">
        <p style={{ color: fontcolor }} className="text-3xl font-bold">{post.title}</p>
        <p style={{ color: fontcolor }} className="text-sm">
          {post.username} — {new Date(post.created_at).toLocaleDateString()}
        </p>
      </div>

      {/* Comments Section */}
      <MainComments
        parentId={comment_id}
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

function MainComments(props: NestedRepliesProps) {
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

  const [userReactState, setUserReactState] = useState<{
    [commentId: string]: { liked: boolean; disliked: boolean }
  }>({});

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

  return (
    <div>
      <div className="h-1"/>
      {nestedComments.map((comment, idx) => (
        <div key={`lvl2-${parentId}-${comment.id}-${idx}`} className="ml-4 w-full justify-between relative select-none">
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
          <div style={{ borderLeft: `2px solid ${fontcolor}` }} className="flex-grow ml-4.75 pt-4 pl-8 border-l-2">
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
        <div style={{borderLeft: `2px solid ${fontcolor}`}} className="ml-8.75 border-l-2 h-6 rounded-b-2xl" />
      </div>
    </div>
  );
}

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

  const [userReactState, setUserReactState] = useState<{
    [commentId: string]: { liked: boolean; disliked: boolean }
  }>({});

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

  return (
    <div>
      <div style={{ borderLeft: `2px solid ${fontcolor}` }} className="absolute border-l-2 w-full h-6 rounded-b-2xl"/>
      <div className="h-1"/>
      {nestedComments.map((comment, idx) => (
        <div key={`lvl2-${parentId}-${comment.id}-${idx}`} className="pl-4 w-full border-l-2 justify-between relative select-none">
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
          <div style={{ borderLeft: `2px solid ${fontcolor}` }} className="flex-grow ml-4.75 pt-4 pl-8 border-l-2">
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
        <div style={{borderLeft: `2px solid ${fontcolor}`}} className=" border-l-2 h-6">
          <div style={{borderLeft: `2px solid ${fontcolor}`}} className="ml-8.75 border-l-2 h-6 rounded-b-xl" />
        </div>
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

  const [userReactState, setUserReactState] = useState<{
    [commentId: string]: { liked: boolean; disliked: boolean }
  }>({});

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

  return (
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

              {/* Comment content */}
              <div style={{borderLeft: `2px solid ${fontcolor}`}} className="flex-grow ml-4.75 pt-4 pl-8 border-l-2">
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
  );
}