import { sql } from "@/lib/db";
import TextCarousel from "@/components/home";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Posts from "@/components/posts";

export default async function CourseCarouselWrapper() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  let user: null | { id: string; username: string; email: string; udata: string; } = null;

  if (token) {
    try {
      user = jwt.verify(token, process.env.JWT_SECRET!) as {
        id: string;
        username: string;
        email: string;
        udata: string;
      };
    } catch {
      user = null;
    }
  }

  let userdata;
  if (user) {
    userdata = (await sql`
      SELECT
        u.id::TEXT,
        u.username,
        ud.profile
      FROM users u
      LEFT JOIN userdata ud ON ud.id = u.id
      WHERE
        u.id = ${user.id}
    `) as {
      id: string;
      username: string;
      profile: string
    }[];
  } else {
    userdata = null;
  }

  // --- courses ---
  const courses = (await sql`
    SELECT * FROM fetchCourses()
  `) as {
    id: string;
    name: string;
    description: string;
  }[];
  
  type LikesDislikesDetails = {
    likes: Record<string, { timestamp: string }>;
    dislikes: Record<string, { timestamp: string }>;
  };

  // --- posts ---
  const postsRaw = await (sql`
    SELECT * FROM fetchAllPosts(10, 0);
  `) as {
  id: string;
  title: string;
  content: string;
  created_at: string;
  likes: number;
  dislikes: number;
  lnd: LikesDislikesDetails;
  category: string,
  organization: string,
  username?: string;
  anonymous: boolean;
}[];

  const posts = JSON.parse(JSON.stringify(postsRaw));

  console.log("Fetched courses:", courses);

  return (
    <div className="block w-full h-screen overflow-y-scroll scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
      <TextCarousel/>
      <Posts userdata={userdata} courses={courses} posts={posts}/>
    </div>
  );
}