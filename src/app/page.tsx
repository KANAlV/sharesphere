import { sql } from "@/lib/db";
import CourseCarousel from "@/components/home";
import Posts from "@/components/posts";

export default async function CourseCarouselWrapper() {
  const courses = (await sql`
    SELECT id, category_name, description 
    FROM categories
  `) as {
    id: number;
    category_name: string;
    description: string;
  }[];

  console.log("Fetched courses:", courses); // Debugging

  return (
    <>
      <CourseCarousel courses={courses} />
      <Posts courses={courses} />
    </>
  );
}