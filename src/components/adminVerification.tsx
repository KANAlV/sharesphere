import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function AdminVerification() {
    // Await cookies() to access .get()
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    let user: null | { id: string; email: string; username: string } = null;

    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
            username: string;
            email: string;
            };

            //check if user exist in adminDB
            const result = await sql`
            SELECT EXISTS(
                SELECT 1 FROM admins WHERE admin_name = ${user.username} AND admin_id = ${user.id} AND admin_email = ${user.email}
            ) AS "exists";
            `;
            
            console.log("userdata:" + user.id, user.email, user.username);
            if (!result[0].exists) {
                console.log("try redirect");
                redirect("/");
            }
        } catch {
            user = null;
            console.log("catch redirect");
            redirect("/");
        }
    } else {
        console.log("else redirect");
        redirect("/");
    }
        
}