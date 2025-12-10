import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import AdminList from "@/components/administrators";
import { AdminVerification } from "@/components/adminVerification";

export default async function CourseCarouselWrapper() {
  AdminVerification()
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
        ud.profile,
        a.level
      FROM users u
      LEFT JOIN userdata ud ON ud.id = u.id
      LEFT JOIN admins a ON a.admin_id = u.id
      WHERE
        u.id = ${user.id}
    `) as {
      id: string;
      username: string;
      profile: string;
      level: number;
    }[];
  } else {
    userdata = null;
  }

  return (
    <div className="block w-full h-screen overflow-y-scroll scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
      <AdminList userdata={userdata}/>
    </div>
  );
}