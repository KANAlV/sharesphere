import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Navigation from "@/components/settings-navigation";

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
  }  
    return(
        <div className="m-auto mt-20 lg:px-20 w-19/20 lg:w-3/4 min-h-full">
            <Navigation />
            test
        </div>
    )
}