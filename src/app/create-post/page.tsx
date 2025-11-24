import CreatePostPage from "@/components/create-post";
import TokenChecker from "@/components/TokenCheker";
import { sql } from "@/lib/db";

export default async function Page() {
  const courses = (await sql`
      SELECT * FROM fetchAllCourses(20,0)
      `) as {
      name: string;
      id: string;
  }[];

  const orgs = (await sql`
      SELECT * FROM fetchAllOrgs(20,0)
      `) as {
      name: string;
      id: string;
  }[];

  return (<>
    <TokenChecker />
    <CreatePostPage courses={courses} orgs={orgs}/>;
  </>)
}
