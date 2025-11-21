import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { id, surname, firstname, middlename, suffix } = await req.json();
    
        if (!id || !surname || !firstname) {
            return NextResponse.json({ error: "Fill all required fields" }, { status: 400 });
        }

        const isUsed = await sql`
            SELECT * FROM userdata WHERE
                surname = ${surname} AND
                firstname = ${firstname} AND
                middlename = ${middlename} AND
                suffix = ${suffix}
            LIMIT 1
        `;

        if (isUsed.length > 0) {
            return NextResponse.json(
                { error: "name is already used in another account" }, { status: 400 }
            );
        }
    
        const users = await sql`
            SELECT * FROM users WHERE id = ${id} LIMIT 1
        `;
    
        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        await sql`
            UPDATE userdata SET
                surname = ${surname},
                firstname = ${firstname},
                middlename = ${middlename},
                suffix = ${suffix},
                updated_at = now()
            WHERE id = ${id}
        `;
    
        return NextResponse.json({ message: "name updated successfully" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}