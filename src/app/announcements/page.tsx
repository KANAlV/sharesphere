import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import DeleteAnnouncements from "@/components/delete_announcements";
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

  return (
    <div className="block w-full h-screen overflow-y-scroll scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
      <DeleteAnnouncements/>
    </div>
  );
}