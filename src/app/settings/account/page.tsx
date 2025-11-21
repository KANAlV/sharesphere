import jwt from "jsonwebtoken";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navigation from "@/components/settings-navigation";
import Accounts from "@/components/settings/account";

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
        gender: string;
      };
    } catch {
      user = null;
      window.location.href = "/";
    }
  } else {
    user = null;
    window.location.href = "/";
  }

  // --- check if user has data ---
  await sql`
    SELECT ensure_user_exists(${user?.id});
  `;

  const account = (await sql`
    SELECT * FROM FetchAccount(${user?.id}); 
  `) as {
    id: string;
    email: string;
    auth: boolean;
    gender: string;
  }[]
  return(
      <div className="m-auto mt-20 lg:px-20 w-19/20 lg:w-3/4 min-h-full">
          <Navigation />
          <Accounts account={account}/>
      </div>
  )
}