import { sql } from "@/lib/db"
import { redirect } from "next/navigation";
import UserPage from "@/components/UserPage";

export default async function DispalyUser(props: { params: Promise<{ id: string }> }) {
    const { id } = await props.params;

    const exists = (await sql`
        SELECT 1 FROM users WHERE username=${id} LIMIT 1;
    `)

    if(!exists) redirect("/");

    const user = (await sql`
        SELECT * FROM FetchUser(${id}); 
    `) as {
        id: string;
        username: string;
        surname: string;
        firstname: string;
        middlename: string;
        suffix: string;
        gender: string;
        description: string;
        profile: string;
        banner: string;
        course: string;
        dateofbirth: string;
    }[];

    type LikesDislikesDetails = {
        likes: Record<string, { timestamp: string }>;
        dislikes: Record<string, { timestamp: string }>;
    };

    const posts = (await sql`
        SELECT * FROM fetchUserPosts(${id}); 
    `) as {
        dir: string;
        title: string;
        content: string;
        posted: string;
        likes: number;
        dislikes: number;
        lnd: LikesDislikesDetails;
    }[];

    return (
        <>
            <UserPage user={user} posts={posts}/>
        </>
    )
}