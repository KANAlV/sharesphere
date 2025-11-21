import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navigation from "@/components/settings-navigation";
import { sql } from "@/lib/db";
import Profile from "@/components/settings/profile";

export default async function Account(){
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
      redirect("/");
    }
  } else {
    redirect("/");
  }

  // --- check if user has data ---
  await sql`
    SELECT ensure_user_exists(${user?.id});
  `;

  const profile = (await sql`
    SELECT * FROM FetchProfile(${user?.id})
  `) as {
      id: string;
      username: string;
      surname: string;
      firstname: string;
      middlename: string;
      suffix: string;
      description: string;
      image: string;
      banner: string;
  }[];

  return(
      <div className="m-auto mt-20 lg:px-20 w-19/20 lg:w-3/4 min-h-full">
          <Navigation />
          <Profile profile={profile}/>
      </div>
  )
}