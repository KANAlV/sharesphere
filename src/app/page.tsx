import { sql } from "@/lib/db";
import TextCarousel from "@/components/home";
import Posts from "@/components/posts";

export default async function CourseCarouselWrapper() {
  
  // --- courses ---
  const courses = (await sql`
    SELECT * FROM fetchCourses()
  `) as {
    id: string;
    name: string;
    description: string;
  }[];

  // --- posts ---
  const postsRaw = await sql`
    SELECT * FROM fetchAllPosts(10, 0);
  `;

  const posts = JSON.parse(JSON.stringify(postsRaw));

  console.log("Fetched courses:", courses);

  return (
    <>
      <TextCarousel/>
      <Posts courses={courses} posts={posts}/>
    </>
  );
}