"use client";

import { useEffect, useState } from "react";
import LoadingScreen from "@/components/loadingscreen";
import { sql } from "@/lib/db";
import TextCarousel from "@/components/home";
import Posts from "@/components/posts";

export default function CourseCarouselWrapper() {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // You can call your own API routes instead of SQL directly
        // because client components cannot access SQL directly.
        const [coursesRes, postsRes] = await Promise.all([
          fetch("/api/courses"),
          fetch("/api/posts?offset=0"),
        ]);

        const [coursesData, postsData] = await Promise.all([
          coursesRes.json(),
          postsRes.json(),
        ]);

        setCourses(coursesData);
        setPosts(postsData);
      } catch (error) {
        console.error("Error loading homepage:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <TextCarousel />
      <Posts courses={courses} posts={posts} />
    </>
  );
}
