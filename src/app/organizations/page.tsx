import { sql } from "@/lib/db";
import PageDisplay from "@/components/pageDisplay";

export default async function Page(){
    const info = (await sql`
        SELECT * FROM fetchAllOrgs(20,0)
        `) as {
        id: string;
        name: string;
        description: string;
    }[];

    return (<PageDisplay info={info} />)
}