import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { id, username } = await req.json();
    
        if (!id || !username) {
            return NextResponse.json({ error: "All fields required" }, { status: 400 });
        }

        const isUsed = await sql`
            SELECT * FROM users WHERE username = ${username} LIMIT 1
        `;

        if (isUsed.length > 0) {
            return NextResponse.json(
                { error: "Username is already taken" }, { status: 400 }
            );
        }
    
        const users = await sql`
            SELECT * FROM users WHERE id = ${id} LIMIT 1
        `;
    
        if (users.length === 0) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
    
        const user = users[0];

        await sql`
            UPDATE users SET username = ${username}, updated_at = now() WHERE id = ${id}
        `;
    
        return NextResponse.json({ message: "Username updated successfully" }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}