import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { usernameEmail, password } = await req.json();

    if (!usernameEmail || !password) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }

  
    const users = await sql`
      SELECT * FROM loginAdmin(${usernameEmail})
    `;

    if (users.length === 0) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }

    const user = users[0];
   
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const isAdmin = await sql`
      SELECT EXISTS(
        SELECT 1 FROM admins WHERE admin_id = ${user.admin_id}
      ) AS "exists";
    `;

    let adminCheck = false;

    if (!isAdmin[0].exists) {
      return true;
    }

    if(adminCheck){
      NextResponse.json({ error: "Admin does not exist" }, { status: 400 });
    }
    
    const token = jwt.sign(
      { id: user.admin_id, email: user.admin_email, username: user.admin_name},
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    
    const res = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.admin_id,
        username: user.admin_name,
        email: user.admin_email,
      },
    }, { status: 200 });

    res.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return res;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}