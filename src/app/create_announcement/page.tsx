import CreateAnnouncementPage from "@/components/create_announcement";
import TokenChecker from "@/components/TokenCheker";
import { AdminVerification } from "@/components/adminVerification";
import { sql } from "@/lib/db";

export default async function Page() {
  await AdminVerification();
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

  return (<div className="block w-full h-screen overflow-y-scroll scrollbar scrollbar-track-background/0 scrollbar-thumb-gray-600">
    <TokenChecker />
    <CreateAnnouncementPage courses={courses} orgs={orgs}/>;
  </div>)
}
