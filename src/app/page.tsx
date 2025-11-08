import { sql } from "@/lib/db";
import CourseCarousel from "@/components/home";
import Posts from "@/components/posts";

export default async function CourseCarouselWrapper() {
  const courses = (await sql`
    SELECT * FROM fetchCourses()
  `) as {
    id: string;
    name: string;
    description: string;
  }[];

  const postsRaw = await sql`SELECT * FROM fetchAllPosts(10, 0);`;
  const posts = JSON.parse(JSON.stringify(postsRaw));

  console.log("Fetched courses:", courses);

  return (
    <>
      <CourseCarousel courses={courses} />
      <Posts courses={courses} posts={posts}/>
    </>
  );
}